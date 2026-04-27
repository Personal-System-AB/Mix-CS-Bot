import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from 'discord.js';

export class EmbedUtils {
  static createQueueEmbed(players: any[], maxSize: number) {
    return new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('🎮 Fila Mix CS2')
      .setDescription(`${players.length}/${maxSize} jogadores na fila`)
      .addFields({
        name: 'Jogadores',
        value:
          players.length > 0
            ? players
              .map(
                (p: any, i: number) =>
                  `${i + 1}. <@${p.discordId}> - ${this.getEloName(p.elo)}`
              )
              .join('\n')
            : 'Nenhum jogador na fila',
      })
      .setTimestamp();
  }

  static createQueueButtonRow() {
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

  static createMatchLobbyEmbed(match: any) {
    return new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle(`🏆 Partida #${match.id}`)
      .setDescription('Times balanceados! Aguardando veto de mapas...')
      .addFields(
        {
          name: '👥 Team A',
          value: match.teamA
            .map(
              (p: any) => `<@${p.discordId}> - ${this.getEloName(p.elo)}`
            )
            .join('\n'),
          inline: true,
        },
        {
          name: '👥 Team B',
          value: match.teamB
            .map(
              (p: any) => `<@${p.discordId}> - ${this.getEloName(p.elo)}`
            )
            .join('\n'),
          inline: true,
        }
      )
      .setTimestamp();
  }

  static createVetoEmbed(match: any, maps: string[], team: string, banCount = 0) {
    return new EmbedBuilder()
      .setColor('#e74c3c')
    .setTitle('🗺️ Veto de Mapas')
    .setDescription(
      `**${team}** escolhe um mapa para banir\n\n` +
      `**Mapas restantes:** ${maps.length}\n` +
      `**Mapas banidos:** ${banCount}`
    )
    .addFields({
      name: 'Mapas disponíveis',
      value: maps.map((m, i) => `${i + 1}. ${m}`).join('\n'),
    })
     .setTimestamp();
 }

  static createVetoMapSelectRow(maps: string[], matchId: string) {
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('map_veto')
        .setPlaceholder('Escolha um mapa para banir')
        .addOptions(
          maps.map((map) => ({
            label: map,
            value: `map:${matchId}:${map}`,
          }))
        )
    );
  }

  static createSidePickEmbed(match: any, map: string) {
    return new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('⚔️ Escolha de Lado')
      .setDescription(`Mapa: **${map}**`)
      .addFields({
        name: 'Opções',
        value: '🛡️ CT (Contra-terroristas)\n⚔️ TR (Terroristas)',
      })
      .setTimestamp();
  }

  static createSidePickButtonRow(matchId: string) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`side_pick:${matchId}:CT`)
        .setLabel('CT')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`side_pick:${matchId}:TR`)
        .setLabel('TR')
        .setStyle(ButtonStyle.Danger)
    );
  }

  static createMatchReadyEmbed(match: any) {
    return new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('✅ Partida Pronta')
      .setDescription('A partida está pronta para começar!')
      .addFields(
        {
          name: '👥 Team A',
          value: match.teamA.map((p: any) => `<@${p.discordId}>`).join('\n'),
          inline: true,
        },
        {
          name: '👥 Team B',
          value: match.teamB.map((p: any) => `<@${p.discordId}>`).join('\n'),
          inline: true,
        },
        {
          name: '🗺️ Mapa',
          value: match.map,
        },
        {
          name: '🔫 Lados',
          value: `Team A: ${match.sideChoice}`,
        }
    )
      .setTimestamp();
  }

  static createReadyMatchButtonRow(matchId: string) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`start_match:${matchId}`)
        .setLabel('Iniciar Partida')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('reset_queue')
        .setLabel('Reiniciar Fila')
        .setStyle(ButtonStyle.Danger)
    );
  }

  static getEloName(elo: number) {
    if (elo >= 5) return 'Global';
    if (elo === 4) return 'Águia';
    if (elo === 3) return 'AK';
    if (elo === 2) return 'Gold';
    return 'Silver';
  }
}