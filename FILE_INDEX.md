# Índice de Funções - Mapa do Código

## 🎯 Mapa Rápido: Encontre o que Precisa

### Por Funcionalidade

#### 📌 Fila de Jogadores
```
Comando: /setup-fila
  └─ src/commands/setupQueue.ts
     └─ src/services/queueService.ts (getOrCreateQueue, updateQueueMessageId)

Botões: join_queue, leave_queue
  └─ src/events/interactionCreate.ts (handleJoinQueue, handleLeaveQueue)
     └─ src/services/queueService.ts

Comando: /fila-status
  └─ src/commands/queueStatus.ts

Comando: /cancelar-fila
  └─ src/commands/cancelQueue.ts
```

#### 👤 Perfil do Jogador
```
Comando: /perfil
  └─ src/commands/profile.ts
     └─ src/db/prisma.ts (model User)

Comando: /set-elo
  └─ src/commands/setElo.ts
```

#### 🗺️ Pool de Mapas
```
Comando: /map-pool add/remove/list
  └─ src/commands/mapPool.ts
     └─ src/services/vetoService.ts (MapPool operations)
        └─ src/db/prisma.ts (model MapPool)
```

#### 🏆 Criação de Partida
```
Trigger: 10 jogadores
  └─ src/events/interactionCreate.ts (handleJoinQueue → createMatchFromQueue)
     └─ src/services/matchService.ts (createMatch)
        └─ src/services/balanceService.ts (balance)
        └─ src/utils/embeds.ts (createMatchLobbyEmbed)
        └─ src/db/prisma.ts (models Match, MatchTeam)
```

#### ⚖️ Balanceamento de Times
```
Serviço: Balanceamento
  └─ src/services/balanceService.ts
     ├─ balance(players) → gera combinações de 5v5
     ├─ generateCombinations(arr, size)
     ├─ getTeamElo(team)
     └─ getTeamAverageElo(team)

Usuário Final:
  Automático quando 10 jogadores entram
```

#### 🚫 Veto de Mapas
```
Menu Select: map_veto
  └─ src/events/interactionCreate.ts (handleMapVeto)
     └─ src/services/vetoService.ts (banMap, getRemainingMaps)
        └─ src/utils/embeds.ts (createVetoEmbed, createVetoMapSelectRow)
        └─ src/db/prisma.ts (model VetoBan)

Fluxo:
  1. Veto inicia (startMapVeto)
  2. Team A bane
  3. Team B bane
  4. Repete até 1 mapa
  5. Mapa selecionado automaticamente
```

#### ⚔️ Escolha de Lado
```
Botões: side_pick:matchId:CT, side_pick:matchId:TR
  └─ src/events/interactionCreate.ts (handleSidePick)
     └─ src/services/matchService.ts (setMatchSide)
        └─ src/utils/embeds.ts (createSidePickEmbed, createSidePickButtonRow)
        └─ src/db/prisma.ts (model Match)

Fluxo:
  1. Team A escolhe CT ou TR
  2. Team B fica com o outro
  3. Partida pronta
```

#### 📊 Resultado e Finalização
```
Comando: /resultado
  └─ src/commands/result.ts
     └─ src/services/matchService.ts (finalizeMatch)
        └─ src/db/prisma.ts (incrementa wins/losses em User)

Comando: /finalizar-match
  └─ src/commands/finalizeMatch.ts
     └─ Deleta canais de voz da partida
     └─ src/db/prisma.ts (atualiza status para "finished")
```

---

## 📂 Índice de Arquivos

### Configuração
| Arquivo | Função |
|---------|--------|
| package.json | Dependências, scripts |
| tsconfig.json | Config TypeScript |
| .env.example | Template de variáveis |
| Dockerfile | Imagem Docker |
| docker-compose.yml | Orquestração Docker |

### Banco de Dados
| Arquivo | Função |
|---------|--------|
| prisma/schema.prisma | Schema completo |
| src/db/prisma.ts | Cliente Prisma singleton |

### Comandos (src/commands/)
| Comando | Arquivo | Função |
|---------|---------|--------|
| /setup-fila | setupQueue.ts | Criar fila |
| /perfil | profile.ts | Ver/editar perfil |
| /set-elo | setElo.ts | Admin: editar ELO |
| /fila-status | queueStatus.ts | Ver jogadores na fila |
| /cancelar-fila | cancelQueue.ts | Admin: limpar fila |
| /map-pool | mapPool.ts | Admin: gerenciar mapas |
| /resultado | result.ts | Admin: registrar vencedor |
| /finalizar-match | finalizeMatch.ts | Admin: limpar partida |
| index.ts | Exportar todos |

### Serviços (src/services/)
| Serviço | Arquivo | Funções Principais |
|---------|---------|-------------------|
| Queue | queueService.ts | add, remove, get, update |
| Match | matchService.ts | create, get, update status |
| Balance | balanceService.ts | balance, combinations |
| Veto | vetoService.ts | ban, remaining maps |

### Eventos (src/events/)
| Evento | Arquivo | Handler |
|--------|---------|---------|
| ready | ready.ts | Bot conectado |
| interactionCreate | interactionCreate.ts | Todos botões e menus |
| index.ts | Exportar todos |

### Utilidades
| Arquivo | Função |
|---------|--------|
| src/utils/embeds.ts | Todas as funções de embed |
| src/types/index.ts | Interfaces TypeScript |

### Inicialização
| Arquivo | Função |
|---------|--------|
| src/index.ts | Inicia bot |
| src/deploy-commands.ts | Deploy de comandos |

---

## 🔍 Como Encontrar Algo

### Quero adicionar um novo comando
```
1. Crie: src/commands/meuComando.ts
2. Registre em: src/commands/index.ts
3. Deploy: npm run deploy:commands
```

### Quero adicionar uma nova tabela
```
1. Edite: prisma/schema.prisma
2. Aplique: npm run db:push
3. Use em: qualquer arquivo
```

### Quero modificar uma embed
```
Procure em: src/utils/embeds.ts
Funções: createXxxEmbed()
```

### Quero adicionar lógica de negócio
```
Crie ou edite: src/services/xxxService.ts
Métodos: static async
```

### Quero lidar com uma interação
```
Procure em: src/events/interactionCreate.ts
Adicione função: handleXxx()
```

---

## 🚀 Fluxo Principal: Passo a Passo

### 1. Bot Inicia
```
src/index.ts
  ├─ Importa eventos em src/events/
  ├─ Registra listeners
  ├─ Conecta ao banco src/db/prisma.ts
  └─ Login no Discord
```

### 2. Comando é usado
```
src/events/interactionCreate.ts (execute)
  ├─ Verifica se é comando
  ├─ Procura em src/commands/index.ts
  └─ Executa comando.execute()
```

### 3. Botão é clicado
```
src/events/interactionCreate.ts (execute)
  ├─ Verifica se é botão
  ├─ Chama handleButton()
  └─ Roteia para handler específico
```

### 4. 10 Jogadores Entram
```
handleJoinQueue()
  ├─ Valida jogador
  ├─ Chama QueueService.addPlayerToQueue()
  ├─ Conta jogadores
  ├─ Se 10: createMatchFromQueue()
  │   ├─ MatchService.createMatch()
  │   │   ├─ BalanceService.balance()
  │   │   ├─ Insere em DB
  │   │   └─ Retorna times balanceados
  │   └─ startMapVeto()
  │       └─ VetoService.getMapPool()
  └─ Atualiza embed
```

### 5. Veto Termina
```
handleMapVeto()
  ├─ VetoBan.create() no DB
  ├─ getRemainingMaps()
  ├─ Se restam mapas:
  │   └─ Próximo turno veto
  └─ Se 1 mapa:
      ├─ setMatchMap()
      └─ Mostra lado pick
```

### 6. Lado Escolhido
```
handleSidePick()
  ├─ setMatchSide()
  ├─ Cria embed de "pronto"
  └─ Partida aguardando resultado
```

### 7. Resultado Registrado
```
/resultado
  ├─ finalizeMatch()
  ├─ Incrementa wins (time A)
  ├─ Incrementa losses (time B)
  └─ status = "finished"
```

---

## 📊 Modelos de Dados

### User
```typescript
{
  discordId: string (unique),
  steamUrl?: string,
  faceitNick?: string,
  elo: number,        // 1000-3000
  wins: number,
  losses: number
}
```

### Queue
```typescript
{
  guildId: string,
  channelId: string,
  messageId?: string,  // embed fixo
  isActive: boolean
}
```

### Match
```typescript
{
  queueId: string,
  guildId: string,
  currentMap?: string,
  sideChoice?: "CT" | "TR",
  status: "lobby" | "veto" | "live" | "finished"
}
```

### MapPool
```typescript
{
  guildId: string,
  map: string        // "dust2", "inferno", etc
}
```

---

## 🎯 Checklist de Extensão

Se quiser estender o bot:

- [ ] Entender estrutura em PROJECT_SUMMARY.md
- [ ] Ler documentação relevante em docs/
- [ ] Procurar padrão similar no código
- [ ] Copiar e adaptar
- [ ] Testar em desenvolvimento
- [ ] Deploy em produção

---

**Precisando de um arquivo específico?** Use Ctrl+F neste documento!
