import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType } from 'discord.js';
import { prisma } from '../db/prisma.js';

export const finalizeMatchCommand = {
  data: new SlashCommandBuilder()
    .setName('finalizar-match')
    .setDescription('Finaliza uma partida e deleta canais de voz (apenas admin)')
    .addStringOption((option) =>
      option
        .setName('match_id')
        .setDescription('ID da partida')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Check if user is admin
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: '❌ Apenas administradores podem finalizar partidas.',
        ephemeral: true,
      });
      return;
    }

    const matchId = interaction.options.getString('match_id', true);

    try {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match) {
        await interaction.reply({
          content: '❌ Partida não encontrada.',
          ephemeral: true,
        });
        return;
      }

      // Delete voice channels with this match ID
      if (interaction.guild) {
        const channels = await interaction.guild.channels.fetch();
        const voiceChannelsToDelete = channels.filter(
          (ch) =>
            ch?.type === ChannelType.GuildVoice &&
            (ch?.name.includes(`Team A - Match`) || ch?.name.includes(`Team B - Match`)) &&
            ch?.name.includes(matchId.slice(0, 8))
        );

        for (const [, channel] of voiceChannelsToDelete) {
          if (channel && channel.isVoiceBased()) {
            try {
              await channel.delete();
            } catch (error) {
              console.error(`Error deleting voice channel ${channel.name}:`, error);
            }
          }
        }
      }

      // Update match status to finished
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'finished' },
      });

      await interaction.reply({
        content: `✅ Partida #${matchId.slice(0, 8)} finalizada e canais de voz deletados.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error finalizing match:', error);
      await interaction.reply({
        content: '❌ Erro ao finalizar partida. Tente novamente.',
        ephemeral: true,
      });
    }
  },
};
