import { MAP_POOL, ROTATION_MAP_COUNT, CsMap } from '../config/maps.js';

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
  private static bansByMatch = new Map<
    string,
    { mapName: string; bannedBy: 'Team A' | 'Team B'; order: number }[]
  >();

  static getMatchMapPool(matchId: string): CsMap[] {
    const fixedMaps = MAP_POOL.filter((map) => map.category === 'fixed');
    const rotationMaps = MAP_POOL.filter((map) => map.category === 'rotation');

    const selectedRotationMaps = seededShuffle(rotationMaps, matchId).slice(
      0,
      ROTATION_MAP_COUNT
    );

    return [...fixedMaps, ...selectedRotationMaps];
  }

  static getMatchMapNames(matchId: string): string[] {
    return this.getMatchMapPool(matchId).map((map) => map.name);
  }

  static getMapByName(mapName: string): CsMap | undefined {
    return MAP_POOL.find((map) => map.name === mapName);
  }

  static async banMap(
    matchId: string,
    mapName: string,
    bannedBy: 'Team A' | 'Team B',
    order: number
  ) {
    const currentBans = this.bansByMatch.get(matchId) ?? [];

    currentBans.push({
      mapName,
      bannedBy,
      order,
    });

    this.bansByMatch.set(matchId, currentBans);

    return {
      matchId,
      map: mapName,
      bannedBy,
      order,
    };
  }

  static async getVetoBans(matchId: string) {
    return this.bansByMatch.get(matchId) ?? [];
  }

  static async getRemainingMaps(matchId: string): Promise<string[]> {
    const pool = this.getMatchMapPool(matchId);
    const bans = await this.getVetoBans(matchId);
    const bannedMaps = new Set(bans.map((ban) => ban.mapName));

    return pool
      .filter((map) => !bannedMaps.has(map.name))
      .map((map) => map.name);
  }

  static getVetoOrder(banCount: number): { team: 'Team A' | 'Team B' } {
    const round = Math.floor(banCount / 3);
    const team = round % 2 === 0 ? 'Team A' : 'Team B';

    return { team };
  }

  static resetMatch(matchId: string) {
    this.bansByMatch.delete(matchId);
  }
}