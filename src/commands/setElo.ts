import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';
import { prisma } from '../db/prisma.js';

const rankNames: Record<number, string> = {
  1: 'Silver',
  2: 'Gold',
  3: 'AK',
  4: 'Aguia',
  5: 'Global',
};

export const setEloCommand = {
  data: new SlashCommandBuilder()
    .setName('set-elo')
    .setDescription('Define o rank de um jogador (apenas admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName('jogador')
        .setDescription('Jogador para definir o rank')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('rank')
        .setDescription('Rank do jogador')
        .setRequired(true)
        .addChoices(
          { name: 'Silver', value: '1' },
          { name: 'Gold', value: '2' },
          { name: 'AK', value: '3' },
          { name: 'Aguia', value: '4' },
          { name: 'Global', value: '5' }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('jogador', true);
    const newElo = Number(interaction.options.getString('rank', true));

    try {
      await prisma.user.update({
        where: { discordId: targetUser.id },
        data: { elo: newElo },
      });

      await interaction.reply({
        content: `✅ Rank de <@${targetUser.id}> atualizado para **${rankNames[newElo]}**.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error updating rank:', error);

      await interaction.reply({
        content:
          '❌ Erro ao atualizar rank. O jogador precisa criar perfil com /perfil primeiro.',
        ephemeral: true,
      });
    }
  },
};