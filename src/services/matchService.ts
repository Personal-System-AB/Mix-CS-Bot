import { prisma } from '../db/prisma.js';
import { IUser, IMatch } from '../types/index.js';
import { BalanceService } from './balanceService.js';

export class MatchService {
  static async createMatch(queueId: string, guildId: string, players: IUser[]): Promise<IMatch> {
    if (players.length !== 10) {
      throw new Error('Match requires exactly 10 players');
    }

    const balance = BalanceService.balance(players);

    // Get user IDs from Discord IDs
    const userMap = new Map<string, string>();
    const users = await prisma.user.findMany({
      where: {
        discordId: {
          in: players.map((p) => p.discordId),
        },
      },
    });

    users.forEach((user) => {
      userMap.set(user.discordId, user.id);
    });

    // Create match
    const match = await prisma.match.create({
      data: {
        queueId,
        guildId,
        status: 'lobby',
      },
    });

    // Add teams
    const teamAPromises = balance.teamA.map((player) => {
      const userId = userMap.get(player.discordId);
      if (!userId) throw new Error(`User not found for ${player.discordId}`);
      return prisma.matchTeam.create({
        data: { matchId: match.id, teamName: 'Team A', userId },
      });
    });

    const teamBPromises = balance.teamB.map((player) => {
      const userId = userMap.get(player.discordId);
      if (!userId) throw new Error(`User not found for ${player.discordId}`);
      return prisma.matchTeam.create({
        data: { matchId: match.id, teamName: 'Team B', userId },
      });
    });

    await Promise.all([...teamAPromises, ...teamBPromises]);

    return {
      id: match.id,
      guildId,
      teamA: balance.teamA,
      teamB: balance.teamB,
      status: 'lobby',
    };
  }

  static async getMatch(matchId: string): Promise<IMatch | null> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        teams: {
          include: { user: true },
        },
        vetoBans: true,
      },
    });

    if (!match) return null;

    const teamA = match.teams
      .filter((t) => t.teamName === 'Team A')
      .map((t) => ({
        discordId: t.user.discordId,
        steamUrl: t.user.steamUrl || undefined,
        faceitNick: t.user.faceitNick || undefined,
        elo: t.user.elo,
        wins: t.user.wins,
        losses: t.user.losses,
      }));

    const teamB = match.teams
      .filter((t) => t.teamName === 'Team B')
      .map((t) => ({
        discordId: t.user.discordId,
        steamUrl: t.user.steamUrl || undefined,
        faceitNick: t.user.faceitNick || undefined,
        elo: t.user.elo,
        wins: t.user.wins,
        losses: t.user.losses,
      }));

    return {
      id: match.id,
      guildId: match.guildId,
      teamA,
      teamB,
      map: match.currentMap || undefined,
      sideChoice: (match.sideChoice as 'CT' | 'TR' | undefined) || undefined,
      status: match.status as 'lobby' | 'veto' | 'live' | 'finished',
    };
  }

  static async updateMatchStatus(matchId: string, status: 'lobby' | 'veto' | 'live' | 'finished') {
    return prisma.match.update({
      where: { id: matchId },
      data: { status },
    });
  }

  static async setMatchMap(matchId: string, map: string) {
    return prisma.match.update({
      where: { id: matchId },
      data: { currentMap: map },
    });
  }

  static async setMatchSide(matchId: string, side: 'CT' | 'TR') {
    return prisma.match.update({
      where: { id: matchId },
      data: { sideChoice: side },
    });
  }

  static async finalizeMatch(
    matchId: string,
    winner: 'Team A' | 'Team B'
  ) {
    const match = await this.getMatch(matchId);
    if (!match) throw new Error('Match not found');

    const winningTeam = winner === 'Team A' ? match.teamA : match.teamB;

    // Update wins for winners
    await Promise.all(
      winningTeam.map((player) =>
        prisma.user.update({
          where: { discordId: player.discordId },
          data: { wins: { increment: 1 } },
        })
      )
    );

    // Update losses for losers
    const losingTeam = winner === 'Team A' ? match.teamB : match.teamA;
    await Promise.all(
      losingTeam.map((player) =>
        prisma.user.update({
          where: { discordId: player.discordId },
          data: { losses: { increment: 1 } },
        })
      )
    );

    await this.updateMatchStatus(matchId, 'finished');
  }
}
