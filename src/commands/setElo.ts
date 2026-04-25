import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { prisma } from '../db/prisma.js';

export const setEloCommand = {
  data: new SlashCommandBuilder()
    .setName('set-elo')
    .setDescription('Define o ELO de um jogador (apenas admin)')
    .addUserOption((option) =>
      option
        .setName('jogador')
        .setDescription('Jogador para definir ELO')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('elo')
        .setDescription('Novo ELO (1-3000)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(3000)
    ),

  async execute(interaction: CommandInteraction) {
    // Check if user is admin
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: '❌ Apenas administradores podem usar este comando.',
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser('jogador', true);
    const newElo = interaction.options.getInteger('elo', true);

    try {
      const user = await prisma.user.update({
        where: { discordId: targetUser.id },
        data: { elo: newElo },
      });

      await interaction.reply({
        content: `✅ ELO de <@${targetUser.id}> atualizado para **${newElo}** pontos.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error updating ELO:', error);
      await interaction.reply({
        content: '❌ Erro ao atualizar ELO. Tente novamente.',
        ephemeral: true,
      });
    }
  },
};
