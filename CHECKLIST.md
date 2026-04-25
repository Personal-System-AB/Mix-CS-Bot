# Checklist Completo - CS2 Mix Bot

## 📋 Pré-Instalação

### Requisitos
- [ ] Node.js 22+ instalado
- [ ] npm ou yarn disponível
- [ ] Conta Discord criada
- [ ] Acesso ao Discord Developer Portal

### Credenciais Discord
- [ ] Bot criado no Developer Portal
- [ ] Token do bot copiado
- [ ] Client ID copiado
- [ ] Scopes configurados (`bot`, `applications.commands`)
- [ ] Permissões selecionadas

## 🚀 Instalação

### 1. Setup Inicial
- [ ] Clonar/copiar arquivos do repositório
- [ ] Abrir terminal na pasta do projeto
- [ ] Executar `setup.bat` (Windows) ou `bash setup.sh` (Mac/Linux)
- [ ] Aguardar conclusão do setup

### 2. Configuração de Ambiente
- [ ] Arquivo `.env` criado
- [ ] `DISCORD_TOKEN` preenchido
- [ ] `CLIENT_ID` preenchido
- [ ] `DATABASE_URL` configurado (padrão: `file:./dev.db`)
- [ ] `NODE_ENV` definido como `development`

### 3. Banco de Dados
- [ ] Prisma gerado (`npm run db:generate`)
- [ ] Banco inicializado (`npm run db:push`)
- [ ] Schema criado corretamente

### 4. Comandos Discord
- [ ] Comandos deployados (`npm run deploy:commands`)
- [ ] Sem erros no console
- [ ] Comandos visíveis no Discord

## 💻 Desenvolvimento

### Ambiente de Desenvolvimento
- [ ] Bot iniciado (`npm run dev`)
- [ ] Conectado ao Discord
- [ ] Respondendo a comandos
- [ ] Embeds aparecendo corretamente

### Testes Básicos
- [ ] Comando `/perfil` criando usuário
- [ ] Comando `/setup-fila` criando embed
- [ ] Botões "Entrar" e "Sair" funcionando
- [ ] Fila atualizando corretamente

## 🎮 Testes de Funcionalidade

### Sistema de Fila
- [ ] Fila criada com `/setup-fila`
- [ ] Embed fixa aparece no canal
- [ ] Botões funcionam
- [ ] Lista de jogadores atualiza
- [ ] Validação: não repetir jogador

### Sistema de Perfil
- [ ] Perfil criado com `/perfil`
- [ ] ELO salvo corretamente
- [ ] Admin pode editar com `/set-elo`
- [ ] Steam URL e FACEIT nick salvos

### Sistema de Mapas
- [ ] Mapas adicionados com `/map-pool add`
- [ ] Mapas removidos com `/map-pool remove`
- [ ] Lista mostra corretamente com `/map-pool list`
- [ ] Validação: não duplicar mapas

### Criação de Partida
- [ ] 10 jogadores → partida automática
- [ ] Times balanceados corretamente
- [ ] Diferença de ELO minimizada
- [ ] Embed de lobby aparece

### Veto de Mapas
- [ ] Veto alternado funciona (A, B, A, B, ...)
- [ ] Mapas banidos desaparecem da lista
- [ ] Último mapa selecionado automaticamente
- [ ] Sem mapas duplicados

### Escolha de Lado
- [ ] Team A consegue escolher CT ou TR
- [ ] Embed de resultado correto
- [ ] Partida marcada como "pronta"

### Resultado e Finalização
- [ ] `/resultado` registra vencedor
- [ ] Wins/losses atualizados
- [ ] `/finalizar-match` deleta canais
- [ ] Partida marcada como "finished"

## 🔧 Troubleshooting

### Se algo não funcionar
- [ ] Verificar logs do console
- [ ] Verificar `.env`
- [ ] Verificar banco com `npm run db:studio`
- [ ] Resetar banco se necessário
- [ ] Re-deploy comandos

### Problemas Específicos
- [ ] Bot não responde? → Deploy comandos
- [ ] Erro de database? → Resetar banco
- [ ] Botões não funcionam? → Verificar intents
- [ ] Permissões negadas? → Verificar perms do bot

## 📦 Build para Produção

### Compilação
- [ ] Rodar `npm run build`
- [ ] Pasta `dist/` criada
- [ ] Nenhum erro de compilação

### Configuração Produção
- [ ] `.env` com variáveis de produção
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` apontando para prod

### Testes em Staging
- [ ] Bot iniciado com `node dist/index.js`
- [ ] Todos comandos testados
- [ ] Sem erros críticos

## 🚢 Deployment

### VPS Linux
- [ ] Acesso SSH funcionando
- [ ] Node.js 22+ instalado na VPS
- [ ] Git clonado ou arquivos copiados
- [ ] Dependências instaladas (`npm install --production`)
- [ ] Banco inicializado
- [ ] PM2 ou systemd configurado
- [ ] Comandos deployados na VPS
- [ ] Bot iniciado e testado

### Docker
- [ ] Dockerfile criado
- [ ] docker-compose.yml configurado
- [ ] `.env` preparado
- [ ] `docker-compose up -d` executado
- [ ] Logs verificados: `docker logs cs2-mix-bot`
- [ ] Bot respondendo a comandos

### PM2
- [ ] PM2 instalado globalmente
- [ ] Bot iniciado: `pm2 start dist/index.js --name "cs2-mix-bot"`
- [ ] Status verificado: `pm2 status`
- [ ] Logs visíveis: `pm2 logs`
- [ ] Auto-restart habilitado: `pm2 startup`

## 📚 Documentação

### Lida e Entendida
- [ ] README.md (configuração completa)
- [ ] QUICKSTART.md (início rápido)
- [ ] FAQ.md (perguntas frequentes)
- [ ] CONTRIBUTING.md (desenvolvimento)
- [ ] BALANCE_ALGORITHM.md (algoritmo)
- [ ] PROJECT_SUMMARY.md (resumo)
- [ ] EXAMPLES.md (exemplos práticos)

### Criada Documentação Extra (se necessário)
- [ ] Documentação customizada
- [ ] Guias de uso para comunidade
- [ ] Procedimentos operacionais

## 🔒 Segurança

### Antes de Ir para Produção
- [ ] Token não está em `.env` versionado
- [ ] `.gitignore` contém `.env`
- [ ] Nenhuma credencial em logs
- [ ] Permissões do bot revisadas
- [ ] Rate limiting implementado
- [ ] Validações em todos comandos

### Pós-Deployment
- [ ] Backup do banco de dados
- [ ] Monitoramento ativo
- [ ] Logs sendo guardados
- [ ] Plano de recuperação

## 👥 Operação

### Primeiros Dias
- [ ] Bot testado com usuários reais
- [ ] Feedback coletado
- [ ] Bugs corrigidos
- [ ] Performance monitorada

### Manutenção Contínua
- [ ] Atualizações verificadas mensalmente
- [ ] Banco de dados mantido
- [ ] Logs revisados
- [ ] Usuários suportados

## 📊 Monitoramento

### Métricas a Acompanhar
- [ ] Uptime do bot
- [ ] Número de comandos por dia
- [ ] Taxa de erro
- [ ] Tempo de resposta
- [ ] Uso de memória/CPU

### Alertas Configurados
- [ ] Bot desconecta? → Restart automático
- [ ] Erro no banco? → Notificação
- [ ] High CPU/Memory? → Alerta

## 🎯 Próximas Melhorias

### Curto Prazo
- [ ] Coletar feedback dos usuários
- [ ] Corrigir bugs encontrados
- [ ] Otimizar performance
- [ ] Adicionar mais mapas

### Médio Prazo
- [ ] Integração FACEIT API
- [ ] Sistema de ratings dinâmico
- [ ] Histórico de partidas
- [ ] Leaderboard

### Longo Prazo
- [ ] Web dashboard
- [ ] Análise estatística
- [ ] Sistema de badges/achievements
- [ ] Matchmaking aprimorado

## ✅ Final

- [ ] Todo checklist completo
- [ ] Documentação lida
- [ ] Bot em produção
- [ ] Usuários usando
- [ ] Suporte disponível

---

**Parabéns!** 🎉 Seu bot está pronto para uso! 

Se tiver dúvidas, consulte os arquivos de documentação ou abra uma issue. 🚀
