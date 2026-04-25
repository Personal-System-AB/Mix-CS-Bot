import {
  Interaction,
  CommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ChannelType,
} from 'discord.js';
import { commands } from '../commands/index.js';
import { QueueService } from '../services/queueService.js';
import { MatchService } from '../services/matchService.js';
import { VetoService } from '../services/vetoService.js';
import { EmbedUtils } from '../utils/embeds.js';
import { prisma } from '../db/prisma.js';

export const interactionCreateEvent = {
  name: 'interactionCreate',
  async execute(interaction: Interaction) {
    try {
      // Handle slash commands
      if (interaction.isChatInputCommand()) {
        await handleSlashCommand(interaction as CommandInteraction);
      }
      // Handle button interactions
      else if (interaction.isButton()) {
        await handleButton(interaction as ButtonInteraction);
      }
      // Handle select menu interactions
      else if (interaction.isStringSelectMenu()) {
        await handleSelectMenu(interaction as StringSelectMenuInteraction);
      }
    } catch (error) {
      console.error('Error handling interaction:', error);
      if (interaction.isRepliable() && !interaction.replied) {
        await interaction.reply({
          content: '❌ Ocorreu um erro ao processar sua interação. Tente novamente.',
          ephemeral: true,
        }).catch(() => {});
      }
    }
  },
};

async function handleSlashCommand(interaction: CommandInteraction) {
  const command = commands.find((cmd) => cmd.data.name === interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: '❌ Comando não encontrado.',
      ephemeral: true,
    });
    return;
  }

  await command.execute(interaction);
}

async function handleButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  if (customId === 'join_queue') {
    await handleJoinQueue(interaction);
  } else if (customId === 'leave_queue') {
    await handleLeaveQueue(interaction);
  } else if (customId.startsWith('side_pick:')) {
    await handleSidePick(interaction);
  }
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  const customId = interaction.customId;

  if (customId === 'map_veto') {
    await handleMapVeto(interaction);
  }
}

async function handleJoinQueue(interaction: ButtonInteraction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const queue = await prisma.queue.findFirst({
      where: {
        guildId: interaction.guildId!,
        channelId: interaction.channelId,
        isActive: true,
      },
    });

    if (!queue) {
      await interaction.editReply('❌ Nenhuma fila ativa neste canal.');
      return;
    }

    // Check if user already in queue
    const userId = interaction.user.id;
    const user = await prisma.user.findUnique({ where: { discordId: userId } });
    const isInQueue = user ? await QueueService.isPlayerInQueue(queue.id, user.id) : false;

    if (isInQueue) {
      await interaction.editReply('⚠️ Você já está na fila!');
      return;
    }

    // Check if user has profile
    if (!user) {
      await interaction.editReply(
        '❌ Você precisa criar um perfil antes! Use `/perfil` para começar.'
      );
      return;
    }

    // Add to queue
    await QueueService.addPlayerToQueue(queue.id, user.id, userId);
    const players = await QueueService.getQueuePlayers(queue.id);
    const count = await QueueService.getQueueCount(queue.id);
    const maxSize = QueueService.getQueueSize();

    // Update embed
    const embed = EmbedUtils.createQueueEmbed(players, maxSize);
    const buttons = EmbedUtils.createQueueButtonRow();

    if (queue.messageId) {
      try {
        const channel = interaction.channel;
        if (channel && channel.isTextBased()) {
          const message = await channel.messages.fetch(queue.messageId);
          await message.edit({ embeds: [embed], components: [buttons] });
        }
      } catch (error) {
        console.error('Error updating queue message:', error);
      }
    }

    await interaction.editReply(`✅ Você entrou na fila! (${count}/${maxSize})`);

    // Check if queue is full
    if (count === maxSize) {
      await createMatchFromQueue(interaction, queue, players);
    }
  } catch (error) {
    console.error('Error joining queue:', error);
    await interaction.editReply('❌ Erro ao entrar na fila. Tente novamente.');
  }
}

async function handleLeaveQueue(interaction: ButtonInteraction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const queue = await prisma.queue.findFirst({
      where: {
        guildId: interaction.guildId!,
        channelId: interaction.channelId,
        isActive: true,
      },
    });

    if (!queue) {
      await interaction.editReply('❌ Nenhuma fila ativa neste canal.');
      return;
    }

    const userId = interaction.user.id;
    const user = await prisma.user.findUnique({ where: { discordId: userId } });

    if (!user) {
      await interaction.editReply('❌ Você não está na fila.');
      return;
    }

    const isInQueue = await QueueService.isPlayerInQueue(queue.id, user.id);
    if (!isInQueue) {
      await interaction.editReply('⚠️ Você não está na fila!');
      return;
    }

    // Remove from queue
    await QueueService.removePlayerFromQueue(queue.id, user.id);
    const players = await QueueService.getQueuePlayers(queue.id);
    const count = await QueueService.getQueueCount(queue.id);
    const maxSize = QueueService.getQueueSize();

    // Update embed
    const embed = EmbedUtils.createQueueEmbed(players, maxSize);
    const buttons = EmbedUtils.createQueueButtonRow();

    if (queue.messageId) {
      try {
        const channel = interaction.channel;
        if (channel && channel.isTextBased()) {
          const message = await channel.messages.fetch(queue.messageId);
          await message.edit({ embeds: [embed], components: [buttons] });
        }
      } catch (error) {
        console.error('Error updating queue message:', error);
      }
    }

    await interaction.editReply(`✅ Você saiu da fila. (${count}/${maxSize})`);
  } catch (error) {
    console.error('Error leaving queue:', error);
    await interaction.editReply('❌ Erro ao sair da fila. Tente novamente.');
  }
}

async function createMatchFromQueue(
  interaction: ButtonInteraction,
  queue: any,
  players: any[]
) {
  try {
    const match = await MatchService.createMatch(queue.id, interaction.guildId!, players);

    // Clear queue
    await QueueService.clearQueue(queue.id);

    // Deactivate queue
    await prisma.queue.update({
      where: { id: queue.id },
      data: { isActive: false },
    });

    // Create lobby embed
    const lobbyEmbed = EmbedUtils.createMatchLobbyEmbed(match);
    const buttonRow = EmbedUtils.createQueueButtonRow();

    // Send match lobby message
    const channel = interaction.channel;
    if (channel && channel.isTextBased()) {
      const matchMessage = await channel.send({
        embeds: [lobbyEmbed],
      });

      // Start veto process
      setTimeout(async () => {
        await startMapVeto(interaction, match);
      }, 2000);
    }
  } catch (error) {
    console.error('Error creating match:', error);
  }
}

async function startMapVeto(interaction: ButtonInteraction, match: any) {
  try {
    const maps = await VetoService.getMapPool(match.guildId);

    if (maps.length === 0) {
      await interaction.channel?.send(
        '⚠️ Nenhum mapa configurado! Configure com `/map-pool add`'
      );
      return;
    }

    const vetoEmbed = EmbedUtils.createVetoEmbed(match, maps, 'Team A');
    const selectRow = EmbedUtils.createVetoMapSelectRow(maps, match.id);

    const channel = interaction.channel;
    if (channel && channel.isTextBased()) {
      await channel.send({
        embeds: [vetoEmbed],
        components: [selectRow],
      });
    }

    // Update match status to veto
    await MatchService.updateMatchStatus(match.id, 'veto');
  } catch (error) {
    console.error('Error starting map veto:', error);
  }
}

async function handleMapVeto(interaction: StringSelectMenuInteraction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const selectedValue = interaction.values[0];
    const [, matchId, map] = selectedValue.split(':');

    const match = await MatchService.getMatch(matchId);
    if (!match) {
      await interaction.editReply('❌ Partida não encontrada.');
      return;
    }

    const bans = await VetoService.getVetoBans(matchId);
    const vetoOrder = VetoService.getVetoOrder(bans.length);

    // Ban the map
    await VetoService.banMap(matchId, map, vetoOrder.team, bans.length);

    const remainingMaps = await VetoService.getRemainingMaps(match.guildId, matchId);

    if (remainingMaps.length === 1) {
      // Only one map left, select it
      const selectedMap = remainingMaps[0];
      await MatchService.setMatchMap(matchId, selectedMap);

      // Show side pick
      const sidePickEmbed = EmbedUtils.createSidePickEmbed(match, selectedMap);
      const sidePickRow = EmbedUtils.createSidePickButtonRow(matchId);

      const channel = interaction.channel;
      if (channel && channel.isTextBased()) {
        await channel.send({
          embeds: [sidePickEmbed],
          components: [sidePickRow],
        });
      }

      await interaction.editReply(`✅ Mapa **${map}** banido por **${vetoOrder.team}**!`);
    } else {
      // Continue veto
      const nextVeto = VetoService.getVetoOrder(bans.length + 1);
      const vetoEmbed = EmbedUtils.createVetoEmbed(match, remainingMaps, nextVeto.team);
      const selectRow = EmbedUtils.createVetoMapSelectRow(remainingMaps, matchId);

      const channel = interaction.channel;
      if (channel && channel.isTextBased()) {
        await channel.send({
          embeds: [vetoEmbed],
          components: [selectRow],
        });
      }

      await interaction.editReply(`✅ Mapa **${map}** banido por **${vetoOrder.team}**!`);
    }
  } catch (error) {
    console.error('Error handling map veto:', error);
    await interaction.editReply('❌ Erro ao processar veto de mapa. Tente novamente.');
  }
}

async function handleSidePick(interaction: ButtonInteraction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const [, matchId, side] = interaction.customId.split(':');

    const match = await MatchService.getMatch(matchId);
    if (!match) {
      await interaction.editReply('❌ Partida não encontrada.');
      return;
    }

    await MatchService.setMatchSide(matchId, side as 'CT' | 'TR');

    // Get updated match
    const updatedMatch = await MatchService.getMatch(matchId);
    if (!updatedMatch) throw new Error('Match not found');

    // Show ready embed
    const readyEmbed = EmbedUtils.createMatchReadyEmbed(updatedMatch);

    const channel = interaction.channel;
    if (channel && channel.isTextBased()) {
      await channel.send({
        embeds: [readyEmbed],
      });
    }

    await interaction.editReply(`✅ Time A escolheu **${side}**! Partida pronta!`);
  } catch (error) {
    console.error('Error handling side pick:', error);
    await interaction.editReply('❌ Erro ao escolher lado. Tente novamente.');
  }
}
