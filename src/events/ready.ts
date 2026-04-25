import { Client } from 'discord.js';

export const readyEvent = {
  name: 'ready',
  once: true,
  async execute(client: Client<true>) {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
  },
};
