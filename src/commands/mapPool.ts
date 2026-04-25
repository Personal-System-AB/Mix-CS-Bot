import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
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
          option
            .setName('mapa')
            .setDescription('Nome do mapa (ex: dust2, inferno, mirage)')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove um mapa do pool')
        .addStringOption((option) =>
          option
            .setName('mapa')
            .setDescription('Nome do mapa a remover')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('Lista todos os mapas do pool')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Check if user is admin (except for list)
    const subcommand = interaction.options.getSubcommand();
    if (subcommand !== 'list' && !interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: '❌ Apenas administradores podem gerenciar o pool de mapas.',
        ephemeral: true,
      });
      return;
    }

    try {
      const guildId = interaction.guildId!;

      if (subcommand === 'add') {
        const map = interaction.options.getString('mapa', true);

        try {
          await VetoService.addMapToPool(guildId, map);
          await interaction.reply({
            content: `✅ Mapa **${map}** adicionado ao pool.`,
            ephemeral: true,
          });
        } catch (error: any) {
          if (error.code === 'P2002') {
            await interaction.reply({
              content: `⚠️ O mapa **${map}** já está no pool.`,
              ephemeral: true,
            });
          } else {
            throw error;
          }
        }
      } else if (subcommand === 'remove') {
        const map = interaction.options.getString('mapa', true);

        try {
          await VetoService.removeMapFromPool(guildId, map);
          await interaction.reply({
            content: `✅ Mapa **${map}** removido do pool.`,
            ephemeral: true,
          });
        } catch (error: any) {
          if (error.code === 'P2025') {
            await interaction.reply({
              content: `⚠️ O mapa **${map}** não está no pool.`,
              ephemeral: true,
            });
          } else {
            throw error;
          }
        }
      } else if (subcommand === 'list') {
        const maps = await VetoService.getMapPool(guildId);

        const embed = new EmbedBuilder()
          .setColor('#9B59B6')
          .setTitle('🗺️ Pool de Mapas')
          .setDescription(maps.length > 0 ? maps.join('\n') : 'Nenhum mapa configurado')
          .setTimestamp();

        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error('Error in map-pool command:', error);
      await interaction.reply({
        content: '❌ Erro ao gerenciar pool de mapas. Tente novamente.',
        ephemeral: true,
      });
    }
  },
};
