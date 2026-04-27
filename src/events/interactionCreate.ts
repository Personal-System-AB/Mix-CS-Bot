import {
  Interaction,
  ChatInputCommandInteraction,
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
import { Cs2ServerService } from '../services/cs2ServerService.js';

export const interactionCreateEvent = {
  name: 'interactionCreate',
  async execute(interaction: Interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        await handleSlashCommand(interaction);
      } else if (interaction.isButton()) {
        await handleButton(interaction);
      } else if (interaction.isStringSelectMenu()) {
        await handleSelectMenu(interaction);
      }
    } catch (error) {
      console.error('Error handling interaction:', error);

      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Ocorreu um erro ao processar sua interação.',
          ephemeral: true,
        }).catch(() => { });
        setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
      }
    }
  },
};

async function tempReply(
  interaction: ButtonInteraction | StringSelectMenuInteraction,
  content: string
) {
  await interaction.reply({
    content,
    ephemeral: true,
  });

  setTimeout(() => {
    interaction.deleteReply().catch(() => { });
  }, 4000);
}

async function getPanelMessage(
  interaction: ButtonInteraction | StringSelectMenuInteraction,
  messageId?: string | null
) {
  if (!messageId) return null;
  if (!interaction.channel?.isTextBased()) return null;

  return interaction.channel.messages.fetch(messageId).catch(() => null);
}

async function handleSlashCommand(interaction: ChatInputCommandInteraction) {
  const command = commands.find((cmd) => cmd.data.name === interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: '❌ Comando não encontrado.',
      ephemeral: true,
    });
    setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
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
  } else if (customId === 'close_queue') {
    await handleCloseQueue(interaction);
  } else if (customId.startsWith('start_match:')) {
    await handleStartMatch(interaction);
  }
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  if (interaction.customId === 'map_veto') {
    await handleMapVeto(interaction);
  }
}

async function handleJoinQueue(interaction: ButtonInteraction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const queue = await prisma.queue.findFirst({
      where: {
        guildId: interaction.guildId ?? '',
        channelId: interaction.channelId ?? '',
        isActive: true,
      },
    });

    if (!queue) {
      await interaction.editReply('❌ Nenhuma fila ativa neste canal.');
      setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
      return;
    }

    const discordId = interaction.user.id;
    const user = await prisma.user.findUnique({ where: { discordId } });

    if (!user) {
      await interaction.editReply('❌ Você precisa criar um perfil antes! Use `/perfil`.');
      setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
      return;
    }

    const isInQueue = await QueueService.isPlayerInQueue(queue.id, user.id);

    if (isInQueue) {
      await interaction.editReply('⚠️ Você já está na fila!');
      setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
      return;
    }

    await QueueService.addPlayerToQueue(queue.id, user.id, discordId);

    const players = await QueueService.getQueuePlayers(queue.id);
    const count = await QueueService.getQueueCount(queue.id);
    const maxSize = QueueService.getQueueSize();

    const embed = EmbedUtils.createQueueEmbed(players, maxSize);
    const buttons = EmbedUtils.createQueueButtonRow();

    const panelMessage = await getPanelMessage(interaction, queue.messageId);

    await panelMessage?.edit({
      embeds: [embed],
      components: [buttons],
    });

    await interaction.editReply(`✅ Você entrou na fila! (${count}/${maxSize})`);
    setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);

    if (count === maxSize) {
      await createMatchFromQueue(interaction, queue, players);
    }
  } catch (error) {
    console.error('Error joining queue:', error);
    await interaction.editReply('❌ Erro ao entrar na fila.');
    setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
  }
}

async function handleLeaveQueue(interaction: ButtonInteraction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const queue = await prisma.queue.findFirst({
      where: {
        guildId: interaction.guildId ?? '',
        channelId: interaction.channelId ?? '',
        isActive: true,
      },
    });

    if (!queue) {
      await interaction.editReply('❌ Nenhuma fila ativa neste canal.');
      setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { discordId: interaction.user.id },
    });

    if (!user) {
      await interaction.editReply('❌ Você não está na fila.');
      setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
      return;
    }

    const isInQueue = await QueueService.isPlayerInQueue(queue.id, user.id);

    if (!isInQueue) {
      await interaction.editReply('⚠️ Você não está na fila!');
      setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
      return;
    }

    await QueueService.removePlayerFromQueue(queue.id, user.id);

    const players = await QueueService.getQueuePlayers(queue.id);
    const count = await QueueService.getQueueCount(queue.id);
    const maxSize = QueueService.getQueueSize();

    const embed = EmbedUtils.createQueueEmbed(players, maxSize);
    const buttons = EmbedUtils.createQueueButtonRow();

    const panelMessage = await getPanelMessage(interaction, queue.messageId);

    await panelMessage?.edit({
      embeds: [embed],
      components: [buttons],
    });

    await interaction.editReply(`✅ Você saiu da fila. (${count}/${maxSize})`);
    setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
  } catch (error) {
    console.error('Error leaving queue:', error);
    await interaction.editReply('❌ Erro ao sair da fila.');
    setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
  }
}

async function createMatchFromQueue(
  interaction: ButtonInteraction,
  queue: any,
  players: any[]
) {
  try {
    const match = await MatchService.createMatch(queue.id, interaction.guildId ?? '', players);

    await QueueService.clearQueue(queue.id);

    await prisma.queue.update({
      where: { id: queue.id },
      data: { isActive: false },
    });

    VetoService.resetMatch(match.id);

    const lobbyEmbed = EmbedUtils.createMatchLobbyEmbed(match);
    const panelMessage = await getPanelMessage(interaction, queue.messageId);

    await panelMessage?.edit({
      embeds: [lobbyEmbed],
      components: [],
    });

    setTimeout(async () => {
      await startMapVeto(interaction, match, queue.messageId);
    }, 1500);
  } catch (error) {
    console.error('Error creating match:', error);
  }
}

async function startMapVeto(
  interaction: ButtonInteraction,
  match: any,
  messageId?: string | null
) {
  try {
    const maps = VetoService.getMatchMapNames(match.id);

    const vetoEmbed = EmbedUtils.createVetoEmbed(match, maps, 'Team A', 0);
    const selectRow = EmbedUtils.createVetoMapSelectRow(maps, match.id);

    const panelMessage = await getPanelMessage(interaction, messageId);

    await panelMessage?.edit({
      embeds: [vetoEmbed],
      components: [selectRow],
    });

    await MatchService.updateMatchStatus(match.id, 'veto');
  } catch (error) {
    console.error('Error starting map veto:', error);
  }
}

async function handleMapVeto(interaction: StringSelectMenuInteraction) {
  try {
    const selectedValue = interaction.values[0];
    const [, matchId, map] = selectedValue.split(':');

    const match = await MatchService.getMatch(matchId);

    if (!match) {
      await tempReply(interaction, '❌ Partida não encontrada.');
      return;
    }

    const bans = await VetoService.getVetoBans(matchId);
    const vetoOrder = VetoService.getVetoOrder(bans.length);

    const teamPlayers = vetoOrder.team === 'Team A' ? match.teamA : match.teamB;

    const isPlayerFromTeam = teamPlayers.some(
      (player) => player.discordId === interaction.user.id
    );

    const isTestUser = interaction.user.id === process.env.TEST_ADMIN_ID;

    if (!isPlayerFromTeam && !isTestUser) {
      await tempReply(
        interaction,
        `❌ Apenas jogadores do **${vetoOrder.team}** podem banir agora.`
      );
      return;
    }

    await VetoService.banMap(matchId, map, vetoOrder.team, bans.length);

    const remainingMaps = await VetoService.getRemainingMaps(matchId);

    if (remainingMaps.length === 1) {
      const selectedMap = remainingMaps[0];

      await MatchService.setMatchMap(matchId, selectedMap);

      const sidePickEmbed = EmbedUtils.createSidePickEmbed(match, selectedMap);
      const sidePickRow = EmbedUtils.createSidePickButtonRow(matchId);

      await interaction.update({
        embeds: [sidePickEmbed],
        components: [sidePickRow],
      });

      return;
    }

    const nextVeto = VetoService.getVetoOrder(bans.length + 1);
    const vetoEmbed = EmbedUtils.createVetoEmbed(
      match,
      remainingMaps,
      nextVeto.team,
      bans.length + 1
    );
    const selectRow = EmbedUtils.createVetoMapSelectRow(remainingMaps, matchId);

    await interaction.update({
      embeds: [vetoEmbed],
      components: [selectRow],
    });
  } catch (error) {
    console.error('Error handling map veto:', error);

    if (!interaction.replied && !interaction.deferred) {
      await tempReply(interaction, '❌ Erro ao processar veto de mapa.');
    }
  }
}

async function handleStartMatch(interaction: ButtonInteraction) {
  if (!interaction.memberPermissions?.has('Administrator')) {
    await interaction.reply({
      content: '❌ Apenas admins podem iniciar a partida.',
      ephemeral: true,
    });
    setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    await Cs2ServerService.startLiveMatch();

    await interaction.editReply('✅ Partida iniciada! GL HF.');
    setTimeout(() => interaction.deleteReply().catch(() => { }), 4000);
  } catch (error) {
    console.error(error);

    await interaction.editReply('❌ Erro ao iniciar partida no servidor.');
    setTimeout(() => interaction.deleteReply().catch(() => { }), 4000); 
  }
}

async function handleCloseQueue(interaction: ButtonInteraction) {
  if (!interaction.memberPermissions?.has('Administrator')) {
    await tempReply(interaction, '❌ Apenas admins podem fechar a fila.');
    return;
  }

  await interaction.deferUpdate();

  await interaction.message.delete().catch(() => { });
}

async function handleSidePick(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  try {
    const [, matchId, side] = interaction.customId.split(':');

    const match = await MatchService.getMatch(matchId);
    if (!match) {
      await interaction.followUp({
        content: '❌ Partida não encontrada.',
        ephemeral: true,
      });
      return;
    }

    const isTeamA = match.teamA.some(
      (player) => player.discordId === interaction.user.id
    );

    const isTestUser = interaction.user.id === process.env.TEST_ADMIN_ID;

    if (!isTeamA && !isTestUser) {
      await interaction.followUp({
        content: '❌ Apenas Team A escolhe lado.',
        ephemeral: true,
      });
      return;
    }

    await MatchService.setMatchSide(matchId, side as 'CT' | 'TR');

    const updatedMatch = await MatchService.getMatch(matchId);
    await moveTeamsToVoiceChannels(interaction, updatedMatch);
    if (!updatedMatch) throw new Error('Match not found');

    const host = process.env.CS2_SERVER_IP;
    const port = process.env.CS2_SERVER_PORT ?? '27015';
    const password = process.env.CS2_SERVER_PASSWORD ?? 'mix123';

    const connectCommand = `connect ${host}:${port}; password ${password}`;

    const readyEmbed = EmbedUtils.createMatchReadyEmbed(updatedMatch);

    await interaction.message.edit({
      embeds: [readyEmbed],
      components: [EmbedUtils.createReadyMatchButtonRow(updatedMatch.id)],
    });

    const followUpMessage = await interaction.followUp({
      content:
        `🎮 **Partida pronta!**\n\n` +
        `📋 Copie e cole no console do CS2:\n` +
        `\`\`\`\n${connectCommand}\n\`\`\`\n` +
        `🔐 Senha: **${password}**`,
      ephemeral: false,
      fetchReply: true,
    });

    setTimeout(() => {
      followUpMessage.delete().catch(() => { });
    }, 10 * 60 * 1000);

    // RCON roda em background. NÃO usar await aqui.
    if (updatedMatch.map) {
      Cs2ServerService.prepareMatch(updatedMatch.map).catch((error) => {
        console.error('Erro preparando servidor CS2:', error);
      });
    }
    await moveTeamsToVoiceChannels(interaction, updatedMatch);
  } catch (error) {
    console.error(error);

    await interaction.followUp({
      content: '❌ Erro ao escolher lado.',
      ephemeral: true,
    }).catch(() => { });
  }
}

async function moveTeamsToVoiceChannels(interaction: ButtonInteraction, match: any) {
  if (!interaction.guild) return;

  const parentId =
    interaction.channel &&
      'parentId' in interaction.channel
      ? interaction.channel.parentId ?? undefined
      : undefined;

  const teamAChannel = await interaction.guild.channels.create({
    name: `Team A - ${match.id.slice(-4)}`,
    type: ChannelType.GuildVoice,
    parent: parentId,
  });

  const teamBChannel = await interaction.guild.channels.create({
    name: `Team B - ${match.id.slice(-4)}`,
    type: ChannelType.GuildVoice,
    parent: parentId,
  });

  for (const player of match.teamA) {
    const member = await interaction.guild.members
      .fetch(player.discordId)
      .catch(() => null);

    if (member?.voice.channel) {
      await member.voice.setChannel(teamAChannel.id).catch(() => { });
    }
  }

  for (const player of match.teamB) {
    const member = await interaction.guild.members
      .fetch(player.discordId)
      .catch(() => null);

    if (member?.voice.channel) {
      await member.voice.setChannel(teamBChannel.id).catch(() => { });
    }
  }

  // Backup: apaga depois de 2h caso o evento não apague
  setTimeout(async () => {
    await teamAChannel.delete().catch(() => { });
    await teamBChannel.delete().catch(() => { });
  }, 2 * 60 * 60 * 1000);
}