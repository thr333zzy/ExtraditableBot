import { EmbedBuilder, type User } from 'discord.js';
import type { Player, Track, UnresolvedTrack } from 'lavalink-client';
import type { BotClient } from './BotClient';
import { formatDuration } from '../utils/formatDuration';
import { paginateQueue } from '../utils/paginateQueue';

const COLOR = 0x8b5cf6;

function requesterMention(track: Track | UnresolvedTrack): string {
  const requester = track.requester as Partial<User> | undefined;
  return requester?.id ? `<@${requester.id}>` : 'Desconocido';
}

export function nowPlayingEmbed(player: Player, track: Track, client: BotClient): EmbedBuilder {
  const trackNumber = client.trackCounters.get(player.guildId) ?? 1;

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setAuthor({
      name: client.user?.username ?? 'ExtraditableBot',
      iconURL: client.user?.displayAvatarURL(),
    })
    .setDescription(
      `**${trackNumber.toString().padStart(2, '0')}** · ${requesterMention(track)}`,
    )
    .setTitle(track.info.title)
    .setURL(track.info.uri)
    .addFields({
      name: '​',
      value: `${track.info.author || 'Desconocido'}\n${formatDuration(track.info.duration)}`,
    })
    .setFooter({
      text: `Volumen: ${player.volume}% | Repetir: ${player.repeatMode ?? 'off'} | ${track.info.sourceName ?? 'desconocida'}`,
    });

  if (track.info.artworkUrl) embed.setImage(track.info.artworkUrl);

  return embed;
}

export function queueEmbed(player: Player, page: number): EmbedBuilder {
  const current = player.queue.current;
  const { items, page: clampedPage, totalPages, startIndex } = paginateQueue(
    player.queue.tracks,
    page,
  );

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('📜 Cola de canciones')
    .setFooter({ text: `Página ${clampedPage + 1}/${totalPages}` });

  if (current) {
    embed.addFields({
      name: '▶️ Sonando ahora',
      value: `**${current.info.title}** — ${formatDuration(current.info.duration)}`,
    });
  }

  if (items.length === 0) {
    embed.addFields({ name: 'Próximas', value: 'La cola está vacía.' });
  } else {
    const list = items
      .map(
        (track, i) =>
          `**${startIndex + i + 1}.** ${track.info.title} — ${formatDuration(track.info.duration)}`,
      )
      .join('\n');
    embed.addFields({ name: 'Próximas', value: list });
  }

  return embed;
}
