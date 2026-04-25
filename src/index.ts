import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { events } from './events/index.js';
import { prisma } from './db/prisma.js';

config();

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.error('❌ DISCORD_TOKEN não configurado. Verifique o arquivo .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Register events
for (const event of events) {
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Handle process signals
process.on('SIGINT', async () => {
  console.log('\n🛑 Desconectando...');
  await prisma.$disconnect();
  await client.destroy();
  process.exit(0);
});

// Login
async function main() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conectado ao banco de dados');

    await client.login(TOKEN);
  } catch (error) {
    console.error('❌ Erro ao iniciar bot:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
