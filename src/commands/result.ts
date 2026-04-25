import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { MatchService } from '../services/matchService.js';
import { prisma } from '../db/prisma.js';

export const resultCommand = {
  data: new SlashCommandBuilder()
    .setName('resultado')
    .setDescription('Registra o resultado da partida (apenas admin)')
    .addStringOption((option) =>
      option
        .setName('match_id')
        .setDescription('ID da partida')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('vencedor')
        .setDescription('Time vencedor')
        .setRequired(true)
        .addChoices(
          { name: 'Team A', value: 'Team A' },
          { name: 'Team B', value: 'Team B' }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Check if user is admin
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: '❌ Apenas administradores podem registrar resultados.',
        ephemeral: true,
      });
      return;
    }

    const matchId = interaction.options.getString('match_id', true);
    const winner = interaction.options.getString('vencedor', true) as 'Team A' | 'Team B';

    try {
      const match = await MatchService.getMatch(matchId);
      if (!match) {
        await interaction.reply({
          content: '❌ Partida não encontrada.',
          ephemeral: true,
        });
        return;
      }

      await MatchService.finalizeMatch(matchId, winner);

      await interaction.reply({
        content: `✅ Resultado registrado! **${winner}** venceu a partida #${matchId.slice(0, 8)}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error registering result:', error);
      await interaction.reply({
        content: '❌ Erro ao registrar resultado. Tente novamente.',
        ephemeral: true,
      });
    }
  },
};
