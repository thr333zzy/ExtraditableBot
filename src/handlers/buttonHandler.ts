import {
  MessageFlags,
  type ButtonInteraction,
  type GuildMember,
  type StringSelectMenuInteraction,
} from 'discord.js';
import type { Player } from 'lavalink-client';
import type { BotClient } from '../structures/BotClient';
import { nowPlayingEmbed, queueEmbed } from '../structures/musicEmbeds';
import { nowPlayingRow, playerOptionsRow, queueRow, BUTTON_PREFIX } from '../structures/musicButtons';
import { playPrevious } from '../utils/previousTrack';

function inSameVoiceChannel(
  interaction: ButtonInteraction | StringSelectMenuInteraction,
  voiceChannelId?: string | null,
): boolean {
  const member = interaction.member as GuildMember | null;
  return Boolean(member?.voice.channelId && member.voice.channelId === voiceChannelId);
}

function nowPlayingComponents(guildId: string, player: Player) {
  return [nowPlayingRow(guildId, player.paused), playerOptionsRow(guildId, player)];
}

export async function handleButton(interaction: ButtonInteraction, client: BotClient): Promise<void> {
  const [prefix, action, guildId, extra] = interaction.customId.split(':');
  const id = `${prefix}:${action}`;

  if (!guildId || interaction.guildId !== guildId) return;

  const player = client.lavalink.getPlayer(guildId);
  if (!player) {
    await interaction.reply({
      content: 'No hay ninguna reproducción activa en este servidor.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!inSameVoiceChannel(interaction, player.voiceChannelId)) {
    await interaction.reply({
      content: 'Debes estar en el mismo canal de voz que el bot para usar estos controles.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  switch (id) {
    case BUTTON_PREFIX.SHUFFLE: {
      await player.queue.shuffle();
      const current = player.queue.current;
      if (current) {
        await interaction.update({
          embeds: [nowPlayingEmbed(player, current, client)],
          components: nowPlayingComponents(guildId, player),
        });
      } else {
        await interaction.deferUpdate();
      }
      break;
    }

    case BUTTON_PREFIX.PREVIOUS: {
      await interaction.deferUpdate();
      await playPrevious(player);
      break;
    }

    case BUTTON_PREFIX.PAUSE: {
      if (player.paused) {
        await player.resume();
      } else {
        await player.pause();
      }

      const current = player.queue.current;
      if (current) {
        await interaction.update({
          embeds: [nowPlayingEmbed(player, current, client)],
          components: nowPlayingComponents(guildId, player),
        });
      } else {
        await interaction.deferUpdate();
      }
      break;
    }

    case BUTTON_PREFIX.SKIP: {
      await interaction.deferUpdate();
      await player.skip();
      break;
    }

    case BUTTON_PREFIX.QUEUE: {
      const page = 0;
      await interaction.reply({
        embeds: [queueEmbed(player, page)],
        components: [queueRow(guildId, page, Math.max(1, Math.ceil(player.queue.tracks.length / 10)))],
        flags: MessageFlags.Ephemeral,
      });
      break;
    }

    case BUTTON_PREFIX.QUEUE_PREV:
    case BUTTON_PREFIX.QUEUE_NEXT: {
      const currentPage = Number(extra ?? '0');
      const nextPage = id === BUTTON_PREFIX.QUEUE_NEXT ? currentPage + 1 : currentPage - 1;
      const totalPages = Math.max(1, Math.ceil(player.queue.tracks.length / 10));

      await interaction.update({
        embeds: [queueEmbed(player, nextPage)],
        components: [queueRow(guildId, Math.min(Math.max(nextPage, 0), totalPages - 1), totalPages)],
      });
      break;
    }

    default:
      break;
  }
}

export async function handleSelectMenu(
  interaction: StringSelectMenuInteraction,
  client: BotClient,
): Promise<void> {
  const [, guildId] = interaction.customId.split(':');
  if (!guildId || interaction.guildId !== guildId) return;

  const player = client.lavalink.getPlayer(guildId);
  if (!player) {
    await interaction.reply({
      content: 'No hay ninguna reproducción activa en este servidor.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!inSameVoiceChannel(interaction, player.voiceChannelId)) {
    await interaction.reply({
      content: 'Debes estar en el mismo canal de voz que el bot para usar estos controles.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const [type, value] = interaction.values[0]?.split(':') ?? [];

  if (type === 'loop') {
    await player.setRepeatMode(value as 'off' | 'track' | 'queue');
  } else if (type === 'volume') {
    await player.setVolume(Number(value));
  }

  const current = player.queue.current;
  if (current) {
    await interaction.update({
      embeds: [nowPlayingEmbed(player, current, client)],
      components: nowPlayingComponents(guildId, player),
    });
  } else {
    await interaction.deferUpdate();
  }
}
