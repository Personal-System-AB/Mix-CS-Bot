import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { commands } from './commands/index.js';

config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('❌ DISCORD_TOKEN ou CLIENT_ID não configurados');
  process.exit(1);
}

const rest = new REST().setToken(TOKEN);

async function deployCommands() {
  try {
    console.log('🔄 Registrando comandos slash...');

    const commandData = commands.map((cmd) => cmd.data.toJSON());

    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commandData,
    });

    console.log('✅ Comandos registrados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
    process.exit(1);
  }
}

deployCommands();
