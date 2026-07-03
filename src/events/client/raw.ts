import type { BotClient } from '../../structures/BotClient';

export default {
  name: 'raw',
  once: false,
  async execute(payload: unknown, client: BotClient) {
    client.lavalink.sendRawData(payload as never);
  },
};
