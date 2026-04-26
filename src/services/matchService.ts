import { prisma } from '../db/prisma.js';
import { IUser, IMatch } from '../types/index.js';
import { VetoService } from './vetoService.js';

export class MatchService {
  static async createMatch(
    queueId: string,
    guildId: string,
    players: IUser[]
  ): Promise<IMatch> {
    if (players.length !== 10) {
      throw new Error('Match requires exactly 10 players');
    }

    // 🔥 Balanceamento simples
    const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);

    const teamA: IUser[] = [];
    const teamB: IUser[] = [];

    sortedPlayers.forEach((player, index) => {
      if (index % 2 === 0) teamA.push(player);
      else teamB.push(player);
    });

    // 🔗 Mapear users
    const users = await prisma.user.findMany({
      where: {
        discordId: { in: players.map((p) => p.discordId) },
      },
    });

    const userMap = new Map(users.map((u) => [u.discordId, u.id]));

    const match = await prisma.match.create({
      data: {
        queueId,
        guildId,
        status: 'veto', // 🔥 começa direto em veto
      },
    });

    // Criar times no banco
    await Promise.all([
      ...teamA.map((p) =>
        prisma.matchTeam.create({
          data: {
            matchId: match.id,
            teamName: 'Team A',
            userId: userMap.get(p.discordId)!,
          },
        })
      ),
      ...teamB.map((p) =>
        prisma.matchTeam.create({
          data: {
            matchId: match.id,
            teamName: 'Team B',
            userId: userMap.get(p.discordId)!,
          },
        })
      ),
    ]);

    // 🔥 INICIAR VETO AUTOMATICO
    const maps = VetoService.getMatchMapPool(match.id);

    // Se tiver só 1 mapa → já define
    if (maps.length === 1) {
      await prisma.match.update({
        where: { id: match.id },
        data: {
          currentMap: maps[0].name,
          status: 'live',
        },
      });
    }

    return {
      id: match.id,
      guildId,
      teamA,
      teamB,
      status: 'veto',
    };
  }

  static async getMatch(matchId: string): Promise<IMatch | null> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        teams: { include: { user: true } },
        vetoBans: true,
      },
    });

    if (!match) return null;

    const mapPlayer = (t: any) => ({
      discordId: t.user.discordId,
      steamNick: t.user.steamNick || undefined,
      elo: t.user.elo,
      wins: t.user.wins,
      losses: t.user.losses,
    });

    return {
      id: match.id,
      guildId: match.guildId,
      teamA: match.teams.filter((t) => t.teamName === 'Team A').map(mapPlayer),
      teamB: match.teams.filter((t) => t.teamName === 'Team B').map(mapPlayer),
      map: match.currentMap || undefined,
      sideChoice: match.sideChoice as 'CT' | 'TR' | undefined,
      status: match.status as 'lobby' | 'veto' | 'live' | 'finished',
    };
  }

  static async finalizeMatch(matchId: string, winner: 'Team A' | 'Team B') {
    const match = await this.getMatch(matchId);
    if (!match) throw new Error('Match not found');

    const winners = winner === 'Team A' ? match.teamA : match.teamB;
    const losers = winner === 'Team A' ? match.teamB : match.teamA;

    await Promise.all([
      ...winners.map((p) =>
        prisma.user.update({
          where: { discordId: p.discordId },
          data: { wins: { increment: 1 } },
        })
      ),
      ...losers.map((p) =>
        prisma.user.update({
          where: { discordId: p.discordId },
          data: { losses: { increment: 1 } },
        })
      ),
    ]);

    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'finished' },
    });
  }
  static async updateMatchStatus(
    matchId: string,
    status: 'lobby' | 'veto' | 'live' | 'finished'
  ) {
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
}