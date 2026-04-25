# Guia Rápido - 5 Minutos para Começar

## 1️⃣ Configurar Token Discord (1 minuto)

```bash
# Copiar template de ambiente
cp .env.example .env

# Editar .env com seu editor de texto favorito
# Adicione:
# DISCORD_TOKEN=seu_token_do_bot
# CLIENT_ID=seu_client_id
```

## 2️⃣ Instalar Dependências (2 minutos)

```bash
# Windows
setup.bat

# Mac/Linux
bash setup.sh

# Ou manual
npm install
npm run db:generate
npm run db:push
npm run deploy:commands
```

## 3️⃣ Iniciar Bot (30 segundos)

```bash
npm run dev
```

Você verá:
```
✅ Conectado ao banco de dados
✅ Bot conectado como CS2 Mix Bot#1234
```

## 4️⃣ Usar no Discord (1 minuto 30 segundos)

No servidor Discord:

```bash
# Admin configura fila
/setup-fila

# Jogadores veem a fila e entram
(clicam botão "Entrar na Fila")

# Admin configura mapas
/map-pool add dust2
/map-pool add inferno
/map-pool add mirage

# Quando 10 jogadores entram:
# - Times são criados automaticamente
# - Veto de mapas começa
# - Escolha de lado acontece
# - Partida fica pronta!
```

## 📋 Checklist Rápido

- [ ] Node.js 22+ instalado
- [ ] Bot criado em Discord Developer Portal
- [ ] Token e Client ID em `.env`
- [ ] Dependências instaladas
- [ ] Banco iniciado
- [ ] Comandos deployados
- [ ] Bot conectado (npm run dev)
- [ ] Bot adicionado ao servidor
- [ ] `/setup-fila` executado

## 🎮 Primeiro Mix

```
1. Você (Admin) digita: /setup-fila
   ↓ (embed fixa aparece no canal)
   ↓
2. Amigos clicam "Entrar na Fila"
   ↓ (embed atualiza mostrando jogadores)
   ↓
3. 10º jogador entra
   ↓ (partida criada automaticamente)
   ↓
4. Times balanceados aparecem
   ↓
5. Veto de mapas (Team A bane, Team B bane)
   ↓
6. 1 mapa sobra (automático)
   ↓
7. Team A escolhe lado (CT ou TR)
   ↓
8. Partida pronta!
```

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Bot não responde | `npm run deploy:commands` |
| Erro de banco | `rm dev.db && npm run db:push` |
| Token inválido | Verificar `.env` |
| Sem permissões | Bot deve ter "Administrator" ou permissões específicas |

## 📚 Próximos Passos

- [ ] Ler [README.md](README.md) para documentação completa
- [ ] Consultar [FAQ.md](FAQ.md) para perguntas
- [ ] Modificar `src/` para customizações
- [ ] Deploy em VPS (veja README.md)

---

**Pronto para começar?** Bora fazer `/setup-fila`! 🎮
