import { IUser, ITeamBalance } from '../types/index.js';

export class BalanceService {
  static balance(players: IUser[]): ITeamBalance {
    if (players.length !== 10) {
      throw new Error('Exactly 10 players required for balancing');
    }

    // Generate all possible combinations of 5 from 10
    const combinations = this.generateCombinations(Array.from({ length: 10 }, (_, i) => i), 5);

    let bestBalance: ITeamBalance | null = null;
    let minDifference = Infinity;

    for (const teamAIndices of combinations) {
      const teamBIndices = Array.from({ length: 10 }, (_, i) => i).filter(
        (i) => !teamAIndices.includes(i)
      );

      const teamA = teamAIndices.map((i) => players[i]);
      const teamB = teamBIndices.map((i) => players[i]);

      const eloA = teamA.reduce((sum, p) => sum + p.elo, 0);
      const eloB = teamB.reduce((sum, p) => sum + p.elo, 0);
      const difference = Math.abs(eloA - eloB);

      if (difference < minDifference) {
        minDifference = difference;
        bestBalance = { teamA, teamB, eloDifference: difference };
      }
    }

    if (!bestBalance) {
      throw new Error('Failed to generate balanced teams');
    }

    return bestBalance;
  }

  private static generateCombinations(arr: number[], size: number): number[][] {
    if (size === 1) return arr.map((x) => [x]);
    if (size === arr.length) return [arr];

    const result: number[][] = [];
    for (let i = 0; i <= arr.length - size; i++) {
      const head = arr[i];
      const tail = this.generateCombinations(arr.slice(i + 1), size - 1);
      for (const combination of tail) {
        result.push([head, ...combination]);
      }
    }
    return result;
  }

  static getTeamElo(team: IUser[]): number {
    return team.reduce((sum, player) => sum + player.elo, 0);
  }

  static getTeamAverageElo(team: IUser[]): number {
    return Math.round(this.getTeamElo(team) / team.length);
  }
}
