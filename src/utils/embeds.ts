import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from 'discord.js';
import { IUser, IMatch } from '../types/index.js';
import { BalanceService } from '../services/balanceService.js';

export class EmbedUtils {
  static createQueueEmbed(players: IUser[], maxSize: number = 10): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor('#1f1f1f')
      .setTitle('🎮 Fila Mix CS2')
      .setDescription(`**${players.length}/${maxSize}** jogadores na fila`)
      .setTimestamp();

    const playerList = players.length > 0
      ? players
          .map((p, idx) => `${idx + 1}. <@${p.discordId}> - **${p.elo}** ELO`)
          .join('\n')
      : 'Nenhum jogador na fila';

    embed.addFields({
      name: 'Jogadores',
      value: playerList,
      inline: false,
    });

    return embed;
  }

  static createQueueButtonRow(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('join_queue')
        .setLabel('Entrar na Fila')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('leave_queue')
        .setLabel('Sair da Fila')
        .setStyle(ButtonStyle.Danger)
    );
  }

  static createMatchLobbyEmbed(match: IMatch): EmbedBuilder {
    const teamAElo = BalanceService.getTeamElo(match.teamA);
    const teamBElo = BalanceService.getTeamElo(match.teamB);
    const difference = Math.abs(teamAElo - teamBElo);

    const teamAList = match.teamA.map((p) => `<@${p.discordId}> - ${p.elo} ELO`).join('\n');
    const teamBList = match.teamB.map((p) => `<@${p.discordId}> - ${p.elo} ELO`).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🏆 Partida #${match.id.slice(0, 8)}`)
      .setDescription('Times estão balanceados! Aguardando veto de mapas...')
      .addFields(
        {
          name: `👥 Team A (${teamAElo} ELO)`,
          value: teamAList,
          inline: true,
        },
        {
          name: `👥 Team B (${teamBElo} ELO)`,
          value: teamBList,
          inline: true,
        },
        {
          name: 'Diferença de ELO',
          value: `${difference} pontos`,
          inline: false,
        }
      )
      .setTimestamp();

    return embed;
  }

  static createVetoEmbed(match: IMatch, remainingMaps: string[], currentBanTeam: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle(`🗺️ Veto de Mapas - Partida #${match.id.slice(0, 8)}`)
      .setDescription(`**${currentBanTeam}** escolhe um mapa para banir`)
      .addFields(
        {
          name: 'Mapas Disponíveis',
          value: remainingMaps.join(' • ') || 'Nenhum',
          inline: false,
        }
      )
      .setTimestamp();

    return embed;
  }

  static createVetoMapSelectRow(remainingMaps: string[], matchId: string): ActionRowBuilder<StringSelectMenuBuilder> {
    const options = remainingMaps.map((map) => ({
      label: map,
      value: `map_ban:${matchId}:${map}`,
    }));

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('map_veto')
        .setPlaceholder('Escolha um mapa para banir')
        .addOptions(options)
    );
  }

  static createSidePickEmbed(match: IMatch, selectedMap: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor('#4ECDC4')
      .setTitle(`⚔️ Escolha de Lado - Partida #${match.id.slice(0, 8)}`)
      .setDescription(`Mapa: **${selectedMap}**\n\n**Team A** escolhe o lado inicial`)
      .addFields(
        {
          name: 'Opções',
          value: '🛡️ CT (Contra-terroristas)\n⚔️ TR (Terroristas)',
          inline: false,
        }
      )
      .setTimestamp();

    return embed;
  }

  static createSidePickButtonRow(matchId: string): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`side_pick:${matchId}:CT`)
        .setLabel('🛡️ CT (Contra-terroristas)')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`side_pick:${matchId}:TR`)
        .setLabel('⚔️ TR (Terroristas)')
        .setStyle(ButtonStyle.Primary)
    );
  }

  static createMatchReadyEmbed(match: IMatch): EmbedBuilder {
    const teamAList = match.teamA.map((p) => `<@${p.discordId}>`).join(' ');
    const teamBList = match.teamB.map((p) => `<@${p.discordId}>`).join(' ');

    const sideMapping: { [key: string]: string } = {
      CT: '🛡️ Contra-terroristas',
      TR: '⚔️ Terroristas',
    };

    const teamASide = match.sideChoice ? sideMapping[match.sideChoice] : 'Não definido';
    const teamBSide = match.sideChoice 
      ? sideMapping[match.sideChoice === 'CT' ? 'TR' : 'CT']
      : 'Não definido';

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle(`✅ Partida Pronta #${match.id.slice(0, 8)}`)
      .setDescription('A partida está pronta para começar!')
      .addFields(
        {
          name: '👥 Team A',
          value: teamAList || 'Nenhum jogador',
          inline: true,
        },
        {
          name: '👥 Team B',
          value: teamBList || 'Nenhum jogador',
          inline: true,
        },
        {
          name: '🗺️ Mapa',
          value: match.map || 'Não definido',
          inline: false,
        },
        {
          name: 'Lado - Team A',
          value: teamASide,
          inline: true,
        },
        {
          name: 'Lado - Team B',
          value: teamBSide,
          inline: true,
        }
      )
      .setFooter({ text: 'Boa sorte! 🎮' })
      .setTimestamp();

    return embed;
  }
}
