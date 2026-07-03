import type { VoiceState } from 'discord.js';
import type { BotClient } from '../../structures/BotClient';

const EMPTY_CHANNEL_GRACE_MS = 30_000;

export default {
  name: 'voiceStateUpdate',
  once: false,
  async execute(oldState: VoiceState, newState: VoiceState, client: BotClient) {
    const guildId = newState.guild.id;
    const player = client.lavalink.getPlayer(guildId);
    if (!player?.voiceChannelId) return;

    // Solo nos interesa cuando alguien sale del canal donde está el bot.
    if (oldState.channelId !== player.voiceChannelId) return;
    if (newState.channelId === player.voiceChannelId) return;

    const voiceChannel = newState.guild.channels.cache.get(player.voiceChannelId);
    if (!voiceChannel?.isVoiceBased()) return;

    const humanMembers = voiceChannel.members.filter((member) => !member.user.bot);
    if (humanMembers.size > 0) return;

    setTimeout(async () => {
      const stillThere = client.lavalink.getPlayer(guildId);
      if (!stillThere?.voiceChannelId) return;

      const channel = newState.guild.channels.cache.get(stillThere.voiceChannelId);
      if (!channel?.isVoiceBased()) return;

      const stillEmpty = channel.members.filter((member) => !member.user.bot).size === 0;
      if (stillEmpty) {
        await stillThere.destroy().catch(() => undefined);
      }
    }, EMPTY_CHANNEL_GRACE_MS);
  },
};
