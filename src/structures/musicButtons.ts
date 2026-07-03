import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from 'discord.js';
import type { Player } from 'lavalink-client';

export const BUTTON_PREFIX = {
  SHUFFLE: 'mp:shuffle',
  PREVIOUS: 'mp:previous',
  PAUSE: 'mp:pause',
  SKIP: 'mp:skip',
  QUEUE: 'mp:queue',
  QUEUE_PREV: 'mq:prev',
  QUEUE_NEXT: 'mq:next',
} as const;

export const PLAYER_OPTIONS_SELECT_ID = 'player_options';

const VOLUME_PRESETS = [25, 50, 75, 100];

export function nowPlayingRow(guildId: string, paused: boolean): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${BUTTON_PREFIX.SHUFFLE}:${guildId}`)
      .setEmoji('🔀')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${BUTTON_PREFIX.PREVIOUS}:${guildId}`)
      .setEmoji('⏮️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${BUTTON_PREFIX.PAUSE}:${guildId}`)
      .setEmoji(paused ? '▶️' : '⏸️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${BUTTON_PREFIX.SKIP}:${guildId}`)
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${BUTTON_PREFIX.QUEUE}:${guildId}:0`)
      .setEmoji('📋')
      .setStyle(ButtonStyle.Secondary),
  );
}

export function playerOptionsRow(guildId: string, player: Player): ActionRowBuilder<StringSelectMenuBuilder> {
  const select = new StringSelectMenuBuilder()
    .setCustomId(`${PLAYER_OPTIONS_SELECT_ID}:${guildId}`)
    .setPlaceholder('Opciones del reproductor')
    .addOptions(
      {
        label: '🔁 Repetir: Desactivado',
        value: 'loop:off',
        default: player.repeatMode === 'off',
      },
      {
        label: '🔁 Repetir: Canción actual',
        value: 'loop:track',
        default: player.repeatMode === 'track',
      },
      {
        label: '🔁 Repetir: Toda la cola',
        value: 'loop:queue',
        default: player.repeatMode === 'queue',
      },
      ...VOLUME_PRESETS.map((volume) => ({
        label: `🔊 Volumen: ${volume}%`,
        value: `volume:${volume}`,
      })),
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

export function queueRow(
  guildId: string,
  page: number,
  totalPages: number,
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${BUTTON_PREFIX.QUEUE_PREV}:${guildId}:${page}`)
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 0),
    new ButtonBuilder()
      .setCustomId(`${BUTTON_PREFIX.QUEUE_NEXT}:${guildId}:${page}`)
      .setEmoji('▶️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1),
  );
}
