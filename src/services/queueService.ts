import { prisma } from '../db/prisma.js';
import { IUser } from '../types/index.js';
import { MatchService } from './matchService.js';

export class QueueService {
  private static readonly QUEUE_SIZE = 10;

  static async getOrCreateQueue(guildId: string, channelId: string) {
    return prisma.queue.upsert({
      where: { guildId_channelId: { guildId, channelId } },
      update: { isActive: true },
      create: { guildId, channelId, isActive: true },
    });
  }

  static async addPlayerToQueue(queueId: string, userId: string, discordId: string) {
    const user = await prisma.user.upsert({
      where: { discordId },
      update: {},
      create: {
        discordId,
        elo: 1,
      },
    });

    const entry = await prisma.queueEntry.create({
      data: {
        queueId,
        userId: user.id,
      },
    });

    const count = await this.getQueueCount(queueId);

    if (count >= this.QUEUE_SIZE) {
      const queue = await prisma.queue.findUnique({
        where: { id: queueId },
      });

      if (!queue) return;

      const players = await this.getQueuePlayers(queueId);

      await MatchService.createMatch(queueId, queue.guildId, players);
    }

    return entry;
  }

  static async removePlayerFromQueue(queueId: string, userId: string) {
    return prisma.queueEntry.delete({
      where: { queueId_userId: { queueId, userId } },
    });
  }

  static async getQueuePlayers(queueId: string): Promise<IUser[]> {
    const entries = await prisma.queueEntry.findMany({
      where: { queueId },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    });

    return entries.map((entry) => ({
      discordId: entry.user.discordId,
      steamNick: entry.user.steamNick || undefined,
      elo: entry.user.elo,
      wins: entry.user.wins,
      losses: entry.user.losses,
    }));
  }

  static async getQueueCount(queueId: string): Promise<number> {
    return prisma.queueEntry.count({
      where: { queueId },
    });
  }

  static async isPlayerInQueue(queueId: string, userId: string): Promise<boolean> {
    const entry = await prisma.queueEntry.findFirst({
      where: { queueId, userId },
    });

    return !!entry;
  }

  static async clearQueue(queueId: string) {
    return prisma.queueEntry.deleteMany({
      where: { queueId },
    });
  }

  static async updateQueueMessageId(queueId: string, messageId: string) {
    return prisma.queue.update({
      where: { id: queueId },
      data: { messageId },
    });
  }

  static getQueueSize(): number {
    return this.QUEUE_SIZE;
  }
}