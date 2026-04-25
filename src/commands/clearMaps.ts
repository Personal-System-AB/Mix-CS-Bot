import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';
import { prisma } from '../db/prisma.js';

export const clearMapsCommand = {
  data: new SlashCommandBuilder()
    .setName('clear-maps')
    .setDescription('Apaga todos os mapas do servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await prisma.mapPool.deleteMany({
        where: { guildId: interaction.guildId! },
      });

      await interaction.reply({
        content: '🧹 Todos os mapas foram apagados!',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);

      await interaction.reply({
        content: '❌ Erro ao limpar mapas.',
        ephemeral: true,
      });
    }
  },
};