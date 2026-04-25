import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { commands } from './commands/index.js';

config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  throw new Error('DISCORD_TOKEN, CLIENT_ID e GUILD_ID precisam estar no .env');
}

if (!token || !clientId) {
  console.error('❌ DISCORD_TOKEN ou CLIENT_ID não configurados');
  process.exit(1);
}

const rest = new REST().setToken(token);

async function deployCommands() {
  try {
    console.log('🔄 Registrando comandos slash...');

    const commandData = commands.map((cmd) => cmd.data.toJSON());

    await rest.put(Routes.applicationCommands(clientId ?? ''), {
      body: commandData,
    });

    console.log('✅ Comandos registrados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
    process.exit(1);
  }
}

deployCommands();
