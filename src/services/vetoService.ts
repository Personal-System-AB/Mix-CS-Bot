import { prisma } from '../db/prisma.js';

export class VetoService {
  static async getMapPool(guildId: string): Promise<string[]> {
    const maps = await prisma.mapPool.findMany({
      where: { guildId },
      orderBy: { map: 'asc' },
    });

    if (maps.length === 0) {
      return ['Mirage', 'Inferno', 'Nuke', 'Ancient', 'Anubis'];
    }

    return maps.map((m) => m.map);
  }

  static async addMapToPool(guildId: string, map: string) {
    return prisma.mapPool.create({
      data: { guildId, map },
    });
  }

  static async removeMapFromPool(guildId: string, map: string) {
    return prisma.mapPool.delete({
      where: { guildId_map: { guildId, map } },
    });
  }

  static async banMap(
    matchId: string,
    map: string,
    bannedBy: 'Team A' | 'Team B',
    order: number
  ) {
    return prisma.vetoBan.create({
      data: { matchId, map, bannedBy, order },
    });
  }

  static async getVetoBans(matchId: string) {
    return prisma.vetoBan.findMany({
      where: { matchId },
      orderBy: { order: 'asc' },
    });
  }

  static async getRemainingMaps(guildId: string, matchId: string): Promise<string[]> {
    const pool = await this.getMapPool(guildId);
    const bans = await this.getVetoBans(matchId);

    const bannedMaps = new Set(bans.map((b) => b.map));

    return pool.filter((map) => !bannedMaps.has(map));
  }

  static getVetoOrder(banCount: number): { team: 'Team A' | 'Team B' } {
    const team = banCount % 2 === 0 ? 'Team A' : 'Team B';
    return { team };
  }
}