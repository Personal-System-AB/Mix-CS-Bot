import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { prisma } from '../db/prisma.js';

const rankNames: Record<number, string> = {
  1: 'Silver',
  2: 'Gold',
  3: 'AK',
  4: 'Aguia',
  5: 'Global',
};

export const profileCommand = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Visualize ou atualize seu perfil de jogador')
    .addStringOption((option) =>
      option
        .setName('steam_nick')
        .setDescription('Seu nick da Steam')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const discordId = interaction.user.id;
    const steamNick = interaction.options.getString('steam_nick');

    try {
      let user = await prisma.user.findUnique({
        where: { discordId },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            discordId,
            steamNick: steamNick || interaction.user.username,
            elo: 1,
          },
        });
      } else if (steamNick) {
        user = await prisma.user.update({
          where: { discordId },
          data: {
            steamNick,
          },
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle(`📋 Perfil de ${interaction.user.username}`)
        .addFields(
          {
            name: 'Discord',
            value: `<@${user.discordId}>`,
            inline: true,
          },
          {
            name: 'Nick Steam',
            value: user.steamNick || 'Não configurado',
            inline: true,
          },
          {
            name: 'Rank',
            value: rankNames[user.elo] ?? 'Silver',
            inline: true,
          },
          {
            name: 'Vitórias',
            value: `${user.wins}`,
            inline: true,
          },
          {
            name: 'Derrotas',
            value: `${user.losses}`,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({
          text: `Atualizado em ${new Date().toLocaleString('pt-BR')}`,
        });

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error in profile command:', error);

      await interaction.reply({
        content: '❌ Erro ao gerenciar o perfil. Tente novamente.',
        ephemeral: true,
      });
    }
  },
};