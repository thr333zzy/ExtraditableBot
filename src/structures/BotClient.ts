import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { LavalinkManager } from 'lavalink-client';
import type { Command } from './Command';
import { env } from '../config/env';

export class BotClient extends Client {
  public commands: Collection<string, Command> = new Collection();
  public lavalink: LavalinkManager;

  /** Guild -> id of the "Now Playing" message currently shown, so we can edit it in place. */
  public nowPlayingMessages: Collection<string, { channelId: string; messageId: string }> =
    new Collection();

  /** Guild -> number of tracks played this session, for the "N · requester" line on the embed. */
  public trackCounters: Collection<string, number> = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
      ],
      partials: [Partials.Channel],
    });

    this.lavalink = new LavalinkManager({
      nodes: [
        {
          id: 'Main',
          host: env.LAVALINK_HOST,
          port: env.LAVALINK_PORT,
          authorization: env.LAVALINK_PASSWORD,
          secure: env.LAVALINK_SECURE,
          retryAmount: 10,
          retryDelay: 10_000,
        },
      ],
      sendToShard: (guildId, payload) => this.guilds.cache.get(guildId)?.shard?.send(payload),
      client: {
        id: env.DISCORD_CLIENT_ID,
        username: 'ExtraditableBot',
      },
      autoSkip: true,
      playerOptions: {
        defaultSearchPlatform: 'ytsearch',
        onDisconnect: {
          autoReconnect: true,
          destroyPlayer: false,
        },
        onEmptyQueue: {
          destroyAfterMs: 60_000,
        },
      },
    });
  }
}
