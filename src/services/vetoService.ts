import { prisma } from '../db/prisma.js';

function seededShuffle<T>(array: T[], seed: string): T[] {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280;
    const j = Math.abs(hash) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export class VetoService {
  static async getMatchMapPool(guildId: string, matchId: string): Promise<string[]> {
    const maps = await prisma.mapPool.findMany({
      where: { guildId },
      orderBy: { map: 'asc' },
    });

    if (maps.length === 0) {
      return ['Mirage', 'Inferno', 'Nuke', 'Ancient', 'Anubis'];
    }

    const fixedMaps = maps
      .filter((m) => m.category === 'fixed')
      .map((m) => m.map);

    const rotationMaps = maps
      .filter((m) => m.category === 'rotation')
      .map((m) => m.map);

    const randomRotationMaps = seededShuffle(rotationMaps, matchId).slice(0, 4);

    return [...fixedMaps, ...randomRotationMaps];
  }

  static async addMapToPool(
    guildId: string,
    map: string,
    category: 'fixed' | 'rotation' = 'fixed'
  ) {
    return prisma.mapPool.create({
      data: { guildId, map, category },
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
    const pool = await this.getMatchMapPool(guildId, matchId);
    const bans = await this.getVetoBans(matchId);
    const bannedMaps = new Set(bans.map((b) => b.map));

    return pool.filter((map) => !bannedMaps.has(map));
  }

  static getVetoOrder(banCount: number): { team: 'Team A' | 'Team B' } {
    const round = Math.floor(banCount / 3);
    const team = round % 2 === 0 ? 'Team A' : 'Team B';

    return { team };
  }
}