import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { QueueService } from '../services/queueService.js';
import { EmbedUtils } from '../utils/embeds.js';

export const queueStatusCommand = {
  data: new SlashCommandBuilder()
    .setName('fila-status')
    .setDescription('Mostra o status atual da fila'),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // Find queue in this guild and channel
      const { prisma } = await import('../db/prisma.js');
      
      const queue = await prisma.queue.findFirst({
        where: {
          guildId: interaction.guildId ?? '',
          isActive: true,
        },
      });

      if (!queue) {
        await interaction.reply({
          content: '❌ Nenhuma fila ativa neste servidor.',
          ephemeral: true,
        });
        return;
      }

      const players = await QueueService.getQueuePlayers(queue.id);
      const count = await QueueService.getQueueCount(queue.id);
      const maxSize = QueueService.getQueueSize();

      const embed = EmbedUtils.createQueueEmbed(players, maxSize);

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error getting queue status:', error);
      await interaction.reply({
        content: '❌ Erro ao obter status da fila. Tente novamente.',
        ephemeral: true,
      });
    }
  },
};
