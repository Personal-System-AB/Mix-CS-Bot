# CS2 Mix Bot 🎮

Um bot Discord completo para organizar partidas 5v5 de Counter-Strike 2 em comunidades. Inclui sistema de fila, balanceamento automático de times, veto de mapas e escolha de lado.

## Features ✨

- 🎯 **Sistema de Fila**: Fila dinâmica com embed fixa mostrando jogadores
- ⚖️ **Balanceamento Inteligente**: Algoritmo que gera combinações de times minimizando diferença de ELO
- 🗺️ **Veto de Mapas**: Veto alternado entre times (Team A bane, Team B bane, etc)
- 🛡️ **Escolha de Lado**: CT ou TR após mapas definidos
- 👤 **Sistema de Perfil**: Elo interno, Steam URL, FACEIT nick
- 📊 **Estatísticas**: Rastreamento de vitórias e derrotas
- 🔒 **Controle Admin**: Comandos restritos para administradores
- 💾 **Banco de Dados**: SQLite com Prisma para persistência

## Tech Stack 🛠️

- **Node.js**: 22+
- **TypeScript**: Tipagem completa
- **discord.js**: v14
- **Prisma**: ORM para SQLite
- **dotenv**: Gerenciamento de variáveis de ambiente

## Instalação 📦

### Pré-requisitos

- Node.js 22 ou superior
- npm ou yarn
- Conta no Discord
- Bot criado no Discord Developer Portal

### Passo 1: Criar o Bot no Discord Developer Portal

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em "New Application"
3. Dê um nome ao bot (ex: "CS2 Mix Bot")
4. Vá para a aba "Bot" e clique em "Add Bot"
5. Copie o **TOKEN** (você vai precisar depois)
6. Em "Bot" → "TOKEN", clique em "Copy"

### Passo 2: Configurar Permissões e Scopes

1. Vá para "OAuth2" → "URL Generator"
2. Em **Scopes**, selecione:
   - `bot`
   - `applications.commands`

3. Em **Permissions**, selecione:
   - `Send Messages`
   - `Embed Links`
   - `Read Message History`
   - `Add Reactions`
   - `Use Slash Commands`
   - `Manage Channels`
   - `Move Members`

4. Copie a URL gerada e abra em seu navegador para adicionar o bot ao servidor

### Passo 3: Obter Client ID

1. Em "Application" → "General Information"
2. Copie o **CLIENT ID**

### Passo 4: Clonar e Instalar

```bash
# Clonar repositório (ou criar pasta e copiar arquivos)
cd Mix-CS

# Instalar dependências
npm install

# Ou com yarn
yarn install
```

### Passo 5: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

2. Edite `.env` e preencha:

```env
DISCORD_TOKEN=seu_token_bot_aqui
CLIENT_ID=seu_client_id_aqui
DATABASE_URL="file:./dev.db"
NODE_ENV=development
```

### Passo 6: Inicializar Banco de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Criar/atualizar banco
npm run db:push
```

### Passo 7: Fazer Deploy dos Comandos

```bash
npm run deploy:commands
```

## Rodando Localmente 🚀

```bash
npm run dev
```

O bot vai conectar e você verá:
```
✅ Conectado ao banco de dados
✅ Bot conectado como CS2 Mix Bot#1234
```

## Rodando em VPS 🖥️

### Instalação na VPS

```bash
# SSH na VPS
ssh user@seu_ip

# Clonar projeto
git clone seu_repositorio.git
cd Mix-CS

# Instalar dependências
npm install --production

# Configurar .env
nano .env

# Build TypeScript
npm run build

# Inicializar banco
npm run db:push

# Deploy comandos
npm run deploy:commands
```

### Rodar com PM2 (recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar bot
pm2 start dist/index.js --name "cs2-mix-bot"

# Monitorar
pm2 status

# Ver logs
pm2 logs cs2-mix-bot

# Reiniciar se houver erro
pm2 restart cs2-mix-bot

# Salvar configuração
pm2 save
pm2 startup
```

### Usar systemd (alternativa)

Crie `/etc/systemd/system/cs2-mix-bot.service`:

```ini
[Unit]
Description=CS2 Mix Bot
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/home/your_user/Mix-CS
ExecStart=/usr/bin/node /home/your_user/Mix-CS/dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable cs2-mix-bot
sudo systemctl start cs2-mix-bot
sudo systemctl status cs2-mix-bot
```

## Comandos 💬

### Gerenciar Fila

**`/setup-fila`** - Admin
- Configura fila de mix no canal
- Cria embed fixa com botões

**`/fila-status`** - Todos
- Mostra jogadores atuais na fila

**`/cancelar-fila`** - Admin
- Cancela fila e deleta mensagem

### Gerenciar Perfil

**`/perfil [steam_url] [faceit_nick] [elo]`** - Todos
- Ver ou atualizar perfil
- Opções: `steam_url`, `faceit_nick`, `elo`

**`/set-elo <jogador> <elo>`** - Admin
- Define ELO de um jogador

### Mapas

**`/map-pool add <mapa>`** - Admin
- Adiciona mapa ao pool

**`/map-pool remove <mapa>`** - Admin
- Remove mapa do pool

**`/map-pool list`** - Todos
- Lista mapas configurados

### Partida

**`/resultado <match_id> <vencedor>`** - Admin
- Registra resultado (Team A ou Team B)
- Atualiza wins/losses

**`/finalizar-match <match_id>`** - Admin
- Finaliza partida
- Deleta canais de voz temporários

## Fluxo de Uso 📊

```
1. Admin configura fila → /setup-fila
   ↓
2. Jogadores entram → Clicam "Entrar na Fila"
   ↓
3. 10 jogadores → Bot cria partida automaticamente
   ↓
4. Veto de Mapas (alternado)
   Team A bane um mapa
   Team B bane um mapa
   Repetir até 1 mapa restante
   ↓
5. Escolha de Lado
   Team A escolhe CT ou TR
   Team B fica com o outro lado
   ↓
6. Partida Pronta
   Mostra times, mapa, lados
   Jogadores entram no servidor
   ↓
7. Admin registra resultado
   /resultado <match_id> Team A
   ↓
8. Finalizar
   /finalizar-match <match_id>
```

## Estrutura do Projeto 📁

```
.
├── src/
│   ├── commands/           # Comandos slash
│   │   ├── setupQueue.ts
│   │   ├── profile.ts
│   │   ├── setElo.ts
│   │   ├── queueStatus.ts
│   │   ├── cancelQueue.ts
│   │   ├── mapPool.ts
│   │   ├── result.ts
│   │   ├── finalizeMatch.ts
│   │   └── index.ts
│   ├── events/             # Event handlers
│   │   ├── ready.ts
│   │   ├── interactionCreate.ts
│   │   └── index.ts
│   ├── services/           # Lógica de negócio
│   │   ├── queueService.ts
│   │   ├── matchService.ts
│   │   ├── balanceService.ts
│   │   └── vetoService.ts
│   ├── utils/
│   │   └── embeds.ts       # Funções de embed
│   ├── types/
│   │   └── index.ts        # Tipos TypeScript
│   ├── db/
│   │   └── prisma.ts       # Cliente Prisma
│   ├── index.ts            # Arquivo principal
│   └── deploy-commands.ts  # Deploy de comandos
├── prisma/
│   └── schema.prisma       # Schema do banco
├── dist/                   # Código compilado
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## Modelo de Dados 🗄️

### User
```
- discordId (único)
- steamUrl (opcional)
- faceitNick (opcional)
- elo (padrão: 1000)
- wins
- losses
```

### Queue
```
- guildId + channelId (único)
- messageId (referência da embed)
- isActive
- entries: QueueEntry[]
```

### Match
```
- guildId
- status: lobby | veto | live | finished
- teams: MatchTeam[]
- vetoBans: VetoBan[]
- currentMap
- sideChoice (CT | TR)
```

### MapPool
```
- guildId + map (único)
- Mapas disponíveis para o servidor
```

## Algoritmo de Balanceamento ⚖️

O bot gera todas as combinações possíveis de 5v5 e escolhe a que minimiza a diferença total de ELO:

```
10 jogadores: [1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450]

Exemplo:
Team A: [1000, 1200, 1300, 1400, 1450] = 6350 ELO
Team B: [1050, 1100, 1150, 1250, 1350] = 5900 ELO
Diferença: 450 pontos

O algoritmo testa todas as combinações e escolhe a melhor.
```

## Troubleshooting 🔧

### Bot não responde aos comandos
- [ ] Verificar se comandos foram deployados: `npm run deploy:commands`
- [ ] Verificar se bot tem permissão "Use Slash Commands"
- [ ] Ver logs: `npm run dev`

### Erro de banco de dados
```bash
# Resetar banco (cuidado!)
rm dev.db
npm run db:push
```

### Bot desconecta em VPS
- Use PM2 ou systemd para auto-restart
- Verificar logs: `pm2 logs`

### Erro ao criar partida
- Verificar se há pelo menos 1 mapa no pool: `/map-pool list`
- Verificar se todos os 10 jogadores têm perfil criado

## Melhorias Futuras 🚀

- [ ] Sistema de ratings/MMR dinâmico
- [ ] Integração com API do FACEIT
- [ ] Histórico de partidas
- [ ] Leaderboard
- [ ] Sistema de badges/achievements
- [ ] Webhook para notificações
- [ ] Web dashboard
- [ ] Suporte a custom picks

## License 📄

MIT

## Suporte 💬

Se tiver dúvidas ou problemas, verifique:
1. Console de erros: `npm run dev`
2. Banco de dados: `npm run db:studio`
3. Logs: Verificar arquivo de saída

---

**Divirta-se organizando mixes! 🎮**
