import type { BotClient } from '../../structures/BotClient';

export default {
  name: 'raw',
  once: false,
  // discord.js emite 'raw' con (data, shardId) — el eventHandler añade `client` como último argumento.
  async execute(payload: unknown, _shardId: number, client: BotClient) {
    client.lavalink.sendRawData(payload as never);
  },
};
