import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { prisma } from '../db/prisma.js';
import { EmbedBuilder } from 'discord.js';

export const profileCommand = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Visualize ou atualize seu perfil de jogador')
    .addStringOption((option) =>
      option
        .setName('steam_url')
        .setDescription('URL do seu perfil Steam')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('faceit_nick')
        .setDescription('Seu nickname no FACEIT')
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('elo')
        .setDescription('Seu ELO interno (1-3000)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(3000)
    ),

  async execute(interaction: CommandInteraction) {
    const discordId = interaction.user.id;
    const steamUrl = interaction.options.getString('steam_url');
    const faceitNick = interaction.options.getString('faceit_nick');
    const elo = interaction.options.getInteger('elo');

    try {
      let user = await prisma.user.findUnique({ where: { discordId } });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            discordId,
            steamUrl: steamUrl || undefined,
            faceitNick: faceitNick || undefined,
            elo: elo || 1000,
          },
        });
      } else if (steamUrl || faceitNick || elo) {
        // Update existing user
        user = await prisma.user.update({
          where: { discordId },
          data: {
            ...(steamUrl && { steamUrl }),
            ...(faceitNick && { faceitNick }),
            ...(elo && { elo }),
          },
        });
      }

      // Create profile embed
      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle(`📋 Perfil de ${interaction.user.username}`)
        .addFields(
          {
            name: 'Discord ID',
            value: `<@${user.discordId}>`,
            inline: true,
          },
          {
            name: 'ELO',
            value: `${user.elo}`,
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
          },
          {
            name: 'Steam URL',
            value: user.steamUrl ? `[Clique aqui](${user.steamUrl})` : 'Não configurado',
            inline: true,
          },
          {
            name: 'FACEIT Nick',
            value: user.faceitNick || 'Não configurado',
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({ text: `Atualizado em ${new Date().toLocaleString('pt-BR')}` });

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
