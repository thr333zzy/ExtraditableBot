import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const BUTTON_PREFIX = {
  PAUSE: 'mp:pause',
  SKIP: 'mp:skip',
  STOP: 'mp:stop',
  QUEUE: 'mp:queue',
  QUEUE_PREV: 'mq:prev',
  QUEUE_NEXT: 'mq:next',
} as const;

export function nowPlayingRow(guildId: string, paused: boolean): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${BUTTON_PREFIX.PAUSE}:${guildId}`)
      .setEmoji(paused ? '▶️' : '⏸️')
      .setLabel(paused ? 'Reanudar' : 'Pausar')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${BUTTON_PREFIX.SKIP}:${guildId}`)
      .setEmoji('⏭️')
      .setLabel('Skip')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${BUTTON_PREFIX.STOP}:${guildId}`)
      .setEmoji('⏹️')
      .setLabel('Stop')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`${BUTTON_PREFIX.QUEUE}:${guildId}:0`)
      .setEmoji('📜')
      .setLabel('Cola')
      .setStyle(ButtonStyle.Secondary),
  );
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
