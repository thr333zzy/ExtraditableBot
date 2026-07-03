import { ActivityType, type Client } from 'discord.js';
import type { BotClient } from '../../structures/BotClient';

export default {
  name: 'clientReady',
  once: true,
  async execute(readyClient: Client<true>, client: BotClient) {
    console.log(`[ready] Sesión iniciada como ${readyClient.user.tag}`);

    client.lavalink.init({ id: readyClient.user.id, username: readyClient.user.username });

    client.user?.setPresence({
      activities: [{ name: '/play', type: ActivityType.Listening }],
      status: 'online',
    });
  },
};
