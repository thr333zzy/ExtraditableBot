import { TextChannel } from 'discord.js';
import type { Player, Track } from 'lavalink-client';
import type { BotClient } from '../../structures/BotClient';
import { nowPlayingEmbed } from '../../structures/musicEmbeds';
import { nowPlayingRow, playerOptionsRow } from '../../structures/musicButtons';

export default {
  name: 'trackStart',
  once: false,
  emitter: 'lavalink' as const,
  // lavalink-client emite (player, track, payload) — el eventHandler añade `client` al final.
  async execute(player: Player, track: Track, _payload: unknown, client: BotClient) {
    const channel = client.channels.cache.get(player.textChannelId ?? '');
    if (!(channel instanceof TextChannel)) return;

    const previous = client.nowPlayingMessages.get(player.guildId);
    if (previous) {
      await channel.messages.delete(previous.messageId).catch(() => undefined);
    }

    client.trackCounters.set(player.guildId, (client.trackCounters.get(player.guildId) ?? 0) + 1);

    let message;
    try {
      message = await channel.send({
        embeds: [nowPlayingEmbed(player, track, client)],
        components: [nowPlayingRow(player.guildId, player.paused), playerOptionsRow(player.guildId, player)],
      });
    } catch (error) {
      console.error('[trackStart] Error enviando el embed de Now Playing:', error);
      return;
    }

    if (message) {
      client.nowPlayingMessages.set(player.guildId, {
        channelId: channel.id,
        messageId: message.id,
      });
    }
  },
};
