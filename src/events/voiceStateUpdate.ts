import { ChannelType } from 'discord.js';

export default {
  name: 'voiceStateUpdate',
  async execute(oldState: any, newState: any) {
    const triggerId = process.env.TEMP_VOICE_TRIGGER_ID;

    // Entrou no canal trigger
    if (newState.channelId === triggerId) {
      const guild = newState.guild;

      const tempChannel = await guild.channels.create({
        name: `Sala de ${newState.member.user.username}`,
        type: ChannelType.GuildVoice,
        parent: newState.channel.parentId ?? undefined,
      });

      await newState.member.voice.setChannel(tempChannel);
    }

    // Saiu de um canal → verifica se ficou vazio
    if (oldState.channel && oldState.channel.members.size === 0) {
      const channel = oldState.channel;

      // evita deletar o canal trigger
      if (channel.id !== triggerId) {
        await channel.delete().catch(() => {});
      }
    }
  },
};