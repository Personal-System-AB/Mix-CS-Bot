import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';
import { prisma } from '../db/prisma.js';
import { QueueService } from '../services/queueService.js';
import { MatchService } from '../services/matchService.js';

export const testQueueCommand = {
  data: new SlashCommandBuilder()
    .setName('test-queue')
    .setDescription('Preenche fila com bots para teste')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName('amigo')
        .setDescription('Amigo real para cair no time adversário')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: '❌ Apenas admins podem usar o modo teste.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const queue = await prisma.queue.findFirst({
        where: {
          guildId: interaction.guildId!,
          channelId: interaction.channelId,
        },
      });

      if (!queue) {
        await interaction.editReply('❌ Nenhuma fila ativa.');
        return;
      }

      await QueueService.clearQueue(queue.id);

      const friend = interaction.options.getUser('amigo');

      const realPlayers = [
        {
          discordId: interaction.user.id,
          steamNick: interaction.user.username,
          elo: 5,
        },
      ];

      if (friend && friend.id !== interaction.user.id) {
        realPlayers.push({
          discordId: friend.id,
          steamNick: friend.username,
          elo: 5,
        });
      }

      for (const player of realPlayers) {
        const user = await prisma.user.upsert({
          where: { discordId: player.discordId },
          update: {
            steamNick: player.steamNick,
            elo: player.elo,
          },
          create: {
            discordId: player.discordId,
            steamNick: player.steamNick,
            elo: player.elo,
          },
        });

        await prisma.queueEntry.create({
          data: {
            queueId: queue.id,
            userId: user.id,
          },
        });
      }

      const botsToCreate = 10 - realPlayers.length;

      for (let i = 1; i <= botsToCreate; i++) {
        const fakeUser = await prisma.user.create({
          data: {
            discordId: `bot-${Date.now()}-${i}`,
            steamNick: `Bot_${i}`,
            elo: Math.floor(Math.random() * 4) + 1,
          },
        });

        await prisma.queueEntry.create({
          data: {
            queueId: queue.id,
            userId: fakeUser.id,
          },
        });
      }

      const players = await QueueService.getQueuePlayers(queue.id);

      await MatchService.createMatch(queue.id, queue.guildId, players);

      await interaction.editReply(
        friend
          ? `✅ Teste criado: você e ${friend.username} ficaram em times opostos.`
          : '✅ Teste criado com você + 9 bots.'
      );
    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ Erro no modo teste.');
    }
  },
};