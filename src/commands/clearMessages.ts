import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

export const clearMessagesCommand = {
  data: new SlashCommandBuilder()
    .setName('limpar')
    .setDescription('Apaga mensagens recentes do canal')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName('quantidade')
        .setDescription('Quantidade de mensagens para apagar')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const quantidade = interaction.options.getInteger('quantidade', true);

    if (!interaction.channel || !interaction.channel.isTextBased()) {
      await interaction.reply({
        content: '❌ Canal inválido.',
        ephemeral: true,
      });
      return;
    }

    if (!('bulkDelete' in interaction.channel)) {
      await interaction.reply({
        content: '❌ Não consigo apagar mensagens neste tipo de canal.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const deleted = await interaction.channel.bulkDelete(quantidade, true);

    await interaction.editReply(`✅ ${deleted.size} mensagens apagadas.`);

    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, 3000);
  },
};