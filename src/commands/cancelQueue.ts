import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { QueueService } from '../services/queueService.js';
import { prisma } from '../db/prisma.js';

export const cancelQueueCommand = {
  data: new SlashCommandBuilder()
    .setName('cancelar-fila')
    .setDescription('Cancela a fila ativa (apenas admin)'),

  async execute(interaction: CommandInteraction) {
    // Check if user is admin
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: '❌ Apenas administradores podem usar este comando.',
        ephemeral: true,
      });
      return;
    }

    try {
      const queue = await prisma.queue.findFirst({
        where: {
          guildId: interaction.guildId!,
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

      // Clear queue
      await QueueService.clearQueue(queue.id);

      // Deactivate queue
      await prisma.queue.update({
        where: { id: queue.id },
        data: { isActive: false },
      });

      // Delete message if exists
      if (queue.messageId) {
        try {
          const channel = interaction.guild?.channels.cache.get(queue.channelId);
          if (channel && channel.isTextBased()) {
            const message = await channel.messages.fetch(queue.messageId);
            await message.delete();
          }
        } catch (error) {
          console.error('Error deleting queue message:', error);
        }
      }

      await interaction.reply({
        content: '✅ Fila cancelada e limpa.',
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error canceling queue:', error);
      await interaction.reply({
        content: '❌ Erro ao cancelar a fila. Tente novamente.',
        ephemeral: true,
      });
    }
  },
};
