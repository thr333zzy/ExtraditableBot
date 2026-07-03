import { EmbedBuilder, type User } from 'discord.js';
import type { Player, Track, UnresolvedTrack } from 'lavalink-client';
import { formatDuration, progressBar } from '../utils/formatDuration';
import { paginateQueue } from '../utils/paginateQueue';

const COLOR = 0x5865f2;

function requesterTag(track: Track | UnresolvedTrack): string {
  const requester = track.requester as Partial<User> | undefined;
  if (!requester) return 'Desconocido';
  return requester.username ?? 'Desconocido';
}

export function nowPlayingEmbed(player: Player, track: Track): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setAuthor({ name: '🎵 Sonando ahora' })
    .setTitle(track.info.title)
    .setURL(track.info.uri)
    .addFields(
      { name: 'Artista', value: track.info.author || 'Desconocido', inline: true },
      { name: 'Fuente', value: track.info.sourceName ?? 'desconocida', inline: true },
      { name: 'Pedido por', value: requesterTag(track), inline: true },
    )
    .setDescription(progressBar(player.position ?? 0, track.info.duration))
    .setFooter({ text: `Volumen: ${player.volume}% | Repetir: ${player.repeatMode ?? 'off'}` });

  if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);

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
