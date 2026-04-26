import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { prisma } from '../db/prisma.js';
import { VetoService } from '../services/vetoService.js';

export const mapPoolCommand = {
  data: new SlashCommandBuilder()
    .setName('map-pool')
    .setDescription('Gerencia o pool de mapas')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Adiciona um mapa ao pool')
        .addStringOption((option) =>
          option.setName('mapa').setDescription('Nome do mapa').setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('tipo')
            .setDescription('Tipo do mapa')
            .setRequired(true)
            .addChoices(
              { name: 'Fixo', value: 'fixed' },
              { name: 'Rotação', value: 'rotation' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove um mapa do pool')
        .addStringOption((option) =>
          option.setName('mapa').setDescription('Nome do mapa').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('Lista todos os mapas do pool')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand !== 'list' && !interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: '❌ Apenas administradores podem gerenciar o pool de mapas.',
        ephemeral: true,
      });
      return;
    }

    const guildId = interaction.guildId ?? '';

    try {
      if (subcommand === 'add') {
        const map = interaction.options.getString('mapa', true).trim();
        const tipo = interaction.options.getString('tipo', true) as 'fixed' | 'rotation';

        await interaction.reply({
          content: `✅ Mapa **${map}** adicionado como **${tipo === 'fixed' ? 'Fixo' : 'Rotação'}**.`,
          ephemeral: true,
        });
        return;
      }

      if (subcommand === 'remove') {
        const map = interaction.options.getString('mapa', true).trim();


        await interaction.reply({
          content: `✅ Mapa **${map}** removido do pool.`,
          ephemeral: true,
        });
        return;
      }

      if (subcommand === 'list') {
        const maps = await prisma.mapPool.findMany({
          where: { guildId },
          orderBy: [{ category: 'asc' }, { map: 'asc' }],
        });

        const fixed = maps.filter((m) => m.category === 'fixed');
        const rotation = maps.filter((m) => m.category === 'rotation');

        const embed = new EmbedBuilder()
          .setColor('#9B59B6')
          .setTitle('🗺️ Pool de Mapas')
          .addFields(
            {
              name: `Fixos (${fixed.length})`,
              value: fixed.length > 0 ? fixed.map((m) => `• ${m.map}`).join('\n') : 'Nenhum',
            },
            {
              name: `Rotação (${rotation.length})`,
              value:
                rotation.length > 0
                  ? rotation.map((m) => `• ${m.map}`).join('\n')
                  : 'Nenhum',
            }
          )
          .setTimestamp();

        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }
    } catch (error: any) {
      console.error('Error in map-pool command:', error);

      if (error.code === 'P2002') {
        await interaction.reply({
          content: '⚠️ Esse mapa já está cadastrado.',
          ephemeral: true,
        });
        return;
      }

      if (error.code === 'P2025') {
        await interaction.reply({
          content: '⚠️ Esse mapa não está cadastrado.',
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        content: '❌ Erro ao gerenciar pool de mapas.',
        ephemeral: true,
      });
    }
  },
};