export interface IUser {
  discordId: string;
  steamUrl?: string;
  faceitNick?: string;
  elo: number;
  wins: number;
  losses: number;
}

export interface IQueueStatus {
  guildId: string;
  channelId: string;
  players: IUser[];
  count: number;
  maxSize: number;
}

export interface IMatch {
  id: string;
  guildId: string;
  teamA: IUser[];
  teamB: IUser[];
  map?: string;
  sideChoice?: 'CT' | 'TR';
  status: 'lobby' | 'veto' | 'live' | 'finished';
}

export interface ITeamBalance {
  teamA: IUser[];
  teamB: IUser[];
  eloDifference: number;
}

export interface IMapPool {
  guildId: string;
  maps: string[];
}
