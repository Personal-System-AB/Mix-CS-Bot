# Exemplos Práticos - Customizações

## Adicionando um Novo Comando

### Exemplo: Comando `/stats`

Crie `src/commands/stats.ts`:

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../db/prisma.js';

export const statsCommand = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Mostra suas estatísticas de jogador')
    .addUserOption((option) =>
      option
        .setName('jogador')
        .setDescription('Jogador para verificar (deixe vazio para você)')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('jogador') || interaction.user;

    try {
      const user = await prisma.user.findUnique({
        where: { discordId: targetUser.id },
      });

      if (!user) {
        await interaction.reply({
          content: '❌ Jogador não encontrado. Use `/perfil` para criar um.',
          ephemeral: true,
        });
        return;
      }

      const totalPartidas = user.wins + user.losses;
      const taxaVitoria = totalPartidas > 0 
        ? ((user.wins / totalPartidas) * 100).toFixed(1) 
        : '0.0';

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`📊 Estatísticas de ${targetUser.username}`)
        .addFields(
          { name: 'Partidas Jogadas', value: `${totalPartidas}`, inline: true },
          { name: 'Vitórias', value: `${user.wins}`, inline: true },
          { name: 'Derrotas', value: `${user.losses}`, inline: true },
          { name: 'Taxa de Vitória', value: `${taxaVitoria}%`, inline: true },
          { name: 'ELO Atual', value: `${user.elo}`, inline: true },
          { name: 'Nível', value: getNivel(user.elo), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error('Error getting stats:', error);
      await interaction.reply({
        content: '❌ Erro ao buscar estatísticas.',
        ephemeral: true,
      });
    }
  },
};

function getNivel(elo: number): string {
  if (elo < 800) return '🥉 Bronze';
  if (elo < 1200) return '⚪ Prata';
  if (elo < 1600) return '🥇 Ouro';
  if (elo < 2000) return '💎 Platina';
  return '👑 Radiante';
}
```

Depois registre em `src/commands/index.ts`:

```typescript
import { statsCommand } from './stats.js';

export const commands = [
  // ... outros
  statsCommand,
];
```

## Customizando Embeds

### Exemplo: Embed com Reações Personalizadas

Em `src/utils/embeds.ts`:

```typescript
export class EmbedUtils {
  static createCustomEmbed(title: string, data: Record<string, string>): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle(title)
      .setAuthor({ name: 'CS2 Mix Bot', iconURL: 'https://...' })
      .setThumbnail('https://...')
      .setFooter({ text: 'Boa diversão! ⚔️' });

    for (const [key, value] of Object.entries(data)) {
      embed.addFields({ name: key, value: value, inline: false });
    }

    return embed;
  }
}
```

## Adicionando um Novo Serviço

### Exemplo: Serviço de Histórico

Crie `src/services/historyService.ts`:

```typescript
import { prisma } from '../db/prisma.js';

export class HistoryService {
  static async getMatchHistory(userId: string, limit: number = 10) {
    const matches = await prisma.match.findMany({
      where: {
        teams: {
          some: { userId },
        },
      },
      include: { teams: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return matches;
  }

  static async getWinRate(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { wins: true, losses: true },
    });

    if (!user) return null;

    const total = user.wins + user.losses;
    return total > 0 ? (user.wins / total) * 100 : 0;
  }
}
```

## Modificando o Banco de Dados

### Exemplo: Adicionar Campo de Reputação

1. Edite `prisma/schema.prisma`:

```prisma
model User {
  // ... campos existentes
  reputation Int @default(0)  // Novo campo
}
```

2. Aplique migração:

```bash
npm run db:push
```

3. Use em código:

```typescript
await prisma.user.update({
  where: { discordId: userId },
  data: { reputation: { increment: 1 } }
});
```

## Criando Eventos Customizados

### Exemplo: Notificação ao Entrar no Servidor

Crie `src/events/guildMemberAdd.ts`:

```typescript
import { GuildMember, EmbedBuilder } from 'discord.js';

export const guildMemberAddEvent = {
  name: 'guildMemberAdd',
  async execute(member: GuildMember) {
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('👋 Bem-vindo ao servidor!')
      .setDescription(`Olá ${member.user.username}!\n\nUse \`/perfil\` para começar!`)
      .setThumbnail(member.user.displayAvatarURL());

    // Enviar em canal específico
    const welcomeChannel = member.guild.channels.cache.get('ID_DO_CANAL');
    if (welcomeChannel && welcomeChannel.isTextBased()) {
      await welcomeChannel.send({ embeds: [embed] });
    }
  },
};
```

Registre em `src/events/index.ts`:

```typescript
import { guildMemberAddEvent } from './guildMemberAdd.js';

export const events = [
  // ... outros
  guildMemberAddEvent,
];
```

## Alterando Cores e Temas

### Exemplo: Tema Dark

Em `src/utils/embeds.ts`:

```typescript
const COLORS = {
  primary: '#1f1f1f',      // Preto
  success: '#00FF00',      // Verde
  error: '#FF0000',        // Vermelho
  warning: '#FFFF00',      // Amarelo
  info: '#0088FF',         // Azul
};

export class EmbedUtils {
  static createQueueEmbed(...): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.primary)  // Usar constantes
      // ... resto
  }
}
```

## Adicionando Validações

### Exemplo: Validar ELO Mínimo

```typescript
const MIN_ELO = 500;
const MAX_ELO = 3000;

function validarElo(elo: number): boolean {
  return elo >= MIN_ELO && elo <= MAX_ELO;
}

// No comando
const newElo = interaction.options.getInteger('elo', true);
if (!validarElo(newElo)) {
  await interaction.reply({
    content: `❌ ELO deve estar entre ${MIN_ELO} e ${MAX_ELO}`,
    ephemeral: true,
  });
  return;
}
```

## Cache de Dados

### Exemplo: Cache de Mapas

```typescript
const mapCache = new Map<string, string[]>();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutos

export async function getMapPoolCached(guildId: string): Promise<string[]> {
  if (mapCache.has(guildId)) {
    return mapCache.get(guildId)!;
  }

  const maps = await VetoService.getMapPool(guildId);
  mapCache.set(guildId, maps);

  // Limpar cache após duração
  setTimeout(() => mapCache.delete(guildId), CACHE_DURATION);

  return maps;
}
```

## Logging Customizado

### Exemplo: Logger Estruturado

Crie `src/utils/logger.ts`:

```typescript
export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data || '');
  }

  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data || '');
  }

  static debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, data || '');
    }
  }
}

// Uso
Logger.info('Fila criada', { guildId, channelId });
Logger.error('Erro ao criar partida', error);
```

## Rate Limiting Customizado

```typescript
const commandCooldown = new Map<string, Map<string, number>>();

function getCooldownKey(userId: string, commandName: string): string {
  return `${userId}:${commandName}`;
}

function isOnCooldown(userId: string, commandName: string, seconds: number = 5): boolean {
  const key = getCooldownKey(userId, commandName);
  const now = Date.now();
  
  if (!commandCooldown.has(commandName)) {
    commandCooldown.set(commandName, new Map());
  }

  const userCooldowns = commandCooldown.get(commandName)!;
  const expirationTime = (userCooldowns.get(userId) || 0) + seconds * 1000;

  if (now < expirationTime) {
    return true;
  }

  userCooldowns.set(userId, now);
  return false;
}

// No comando
if (isOnCooldown(interaction.user.id, 'join_queue', 3)) {
  await interaction.reply({
    content: '⏱️ Aguarde um pouco antes de tentar novamente',
    ephemeral: true,
  });
  return;
}
```

## Integração com API Externa

### Exemplo: Buscar Dados do FACEIT (Futura)

```typescript
async function getFaceitStats(faceitNick: string) {
  try {
    const response = await fetch(
      `https://open.faceit.com/api/v4/players?nickname=${faceitNick}`,
      {
        headers: { 'Authorization': `Bearer ${process.env.FACEIT_API_KEY}` }
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('FACEIT API Error:', error);
    return null;
  }
}
```

## Backup do Banco

```typescript
import { spawn } from 'child_process';
import { createWriteStream } from 'fs';

export async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backups/dev-${timestamp}.db`;

  return new Promise((resolve, reject) => {
    const file = createWriteStream(backupFile);
    file.on('finish', resolve);
    file.on('error', reject);
    
    // Copiar banco
    const fs = require('fs');
    fs.createReadStream('dev.db').pipe(file);
  });
}
```

---

**Dúvidas sobre customizações?** Consulte CONTRIBUTING.md!
