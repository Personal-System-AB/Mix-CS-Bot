import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { QueueService } from '../services/queueService.js';
import { EmbedUtils } from '../utils/embeds.js';

export const setupQueue = {
  data: new SlashCommandBuilder()
    .setName('setup-fila')
    .setDescription('Configura a fila de mix CS2 no canal'),

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild || !interaction.channel) {
      await interaction.reply({
        content: 'Este comando só funciona em servidores e canais.',
        ephemeral: true,
      });
      return;
    }

    // Check if user is admin
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: '❌ Apenas administradores podem usar este comando.',
        ephemeral: true,
      });
      return;
    }

    try {
      // Create or get queue
      const queue = await QueueService.getOrCreateQueue(interaction.guildId, interaction.channelId);

      // Create embed and buttons
      const embed = EmbedUtils.createQueueEmbed([], QueueService.getQueueSize());
      const buttons = EmbedUtils.createQueueButtonRow();

      // Send message
      const message = await interaction.channel.send({
        embeds: [embed],
        components: [buttons],
      });

      // Update queue with message ID
      await QueueService.updateQueueMessageId(queue.id, message.id);

      await interaction.reply({
        content: `✅ Fila configurada! Mensagem enviada em ${message.url}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error setting up queue:', error);
      await interaction.reply({
        content: '❌ Erro ao configurar a fila. Tente novamente.',
        ephemeral: true,
      });
    }
  },
};
