# FAQ - Perguntas Frequentes

## Configuração Inicial

### P: Como obtenho o DISCORD_TOKEN?
**R:** 
1. Vá para [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique na sua aplicação
3. Vá para "Bot" no menu esquerdo
4. Clique em "Copy" sob "TOKEN"
5. Cole em `.env` como `DISCORD_TOKEN=seu_token`

### P: Qual é o CLIENT_ID?
**R:**
1. Em "Application" → "General Information"
2. Copie o "APPLICATION ID"
3. Cole em `.env` como `CLIENT_ID=seu_id`

### P: Como adiciono o bot ao meu servidor?
**R:**
1. Em "OAuth2" → "URL Generator"
2. Selecione scopes: `bot` e `applications.commands`
3. Selecione permissões necessárias
4. Copie URL gerada e abra no navegador

## Instalação e Setup

### P: Erro "npm not found"
**R:** Instale Node.js 22+ em https://nodejs.org/

### P: Erro "DISCORD_TOKEN not configured"
**R:** Crie arquivo `.env` e adicione seu token:
```
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui
```

### P: Comandos não aparecem no Discord
**R:** Execute:
```bash
npm run deploy:commands
```

### P: Erro de banco de dados
**R:** Resetar banco:
```bash
rm dev.db
npm run db:push
```

## Funcionalidades

### P: Como configurar mapas para o veto?
**R:** Use o comando `/map-pool`:
```
/map-pool add dust2
/map-pool add inferno
/map-pool add mirage
/map-pool list
```

### P: Posso mudar o ELO de um jogador?
**R:** Sim, como admin:
```
/set-elo @jogador 1500
```

### P: Como vejo o perfil de um jogador?
**R:** Qualquer jogador pode ver seu próprio perfil:
```
/perfil
```

### P: Posso editar ELO, Steam URL, etc?
**R:** Sim, na mesma mensagem `/perfil`:
```
/perfil steam_url:url faceit_nick:nick elo:1500
```

## Fluxo de Partida

### P: Por que minha fila não preenche?
**R:** Verifique:
1. Há jogadores o suficiente?
2. Todos criaram perfil com `/perfil`?
3. A fila está ativa? `/fila-status`

### P: Posso cancelar uma partida no meio do veto?
**R:** Sim, use `/cancelar-fila` para limpar

### P: Como edito o resultado de uma partida?
**R:** Use `/resultado`:
```
/resultado match_id:abc123 vencedor:Team A
```

### P: Os canais de voz se criam automaticamente?
**R:** Sim, se o bot tiver permissão de "Manage Channels"

## Desenvolvimento

### P: Como rodar em desenvolvimento?
**R:** 
```bash
npm run dev
```

### P: Como compilar para produção?
**R:**
```bash
npm run build
```

### P: Posso adicionar novos comandos?
**R:** Sim! Veja a estrutura em `src/commands/`

### P: Como adiciono novos eventos?
**R:** Crie arquivo em `src/events/` e importe em `src/events/index.ts`

## Deployment

### P: Como rodar em uma VPS?
**R:** Veja seção "Rodando em VPS" no README.md

### P: É possível usar Docker?
**R:** Sim! Use docker-compose:
```bash
docker-compose up -d
```

### P: Como verificar logs em produção?
**R:** Com PM2:
```bash
pm2 logs cs2-mix-bot
```

### P: Bot desconecta aleatoriamente
**R:** Possíveis causas:
1. VPS sem RAM suficiente
2. Limite de conexões atingido
3. Problema com token Discord

Use PM2 para auto-restart:
```bash
pm2 restart cs2-mix-bot
```

## Problemas Comuns

### P: Erro "EACCES: permission denied"
**R:** Em VPS, execute como sudo ou use PM2:
```bash
sudo chown -R $USER /caminho/projeto
```

### P: "ChannelNotFound" ao criar canais de voz
**R:** Verifique permissões do bot:
- [ ] "Manage Channels"
- [ ] "Move Members"
- [ ] "Create Private Channels"

### P: Veto não funciona
**R:** Possíveis causas:
1. Nenhum mapa no pool: `/map-pool list`
2. Usuário não tem permissão para clicar botão
3. Partida expirou

### P: Banco de dados corrompido
**R:** Backup e reset:
```bash
cp dev.db dev.db.bak
rm dev.db
npm run db:push
```

## Performance

### P: Bot está lento
**R:** Verifique:
1. Número de guilds e canais
2. Quantidade de dados no banco
3. Recursos de CPU/RAM da VPS

### P: Muitos erros de timeout
**R:** Aumentar timeout em `.env`:
```
COMMAND_TIMEOUT=30000
```

## Segurança

### P: Como protejo meu token?
**R:** NUNCA commit `.env`:
```
echo ".env" >> .gitignore
```

### P: Posso resetar o token?
**R:** Sim, em Developer Portal → Bot → "Reset Token"

### P: Como revogo acesso do bot?
**R:** Discord → Connections → aplicação → "Remove"

## Suporte

Se nenhuma resposta ajudar:

1. **Verificar logs**: `npm run dev`
2. **Consultar banco**: `npm run db:studio`
3. **Verificar Discord API status**: https://status.discord.com
4. **Verificar erro específico**: Google do erro completo
5. **Pedir ajuda**: Incluir logs completos e versões

---

**Dúvidas frequentes adicionadas?** Abra uma issue ou PR!
