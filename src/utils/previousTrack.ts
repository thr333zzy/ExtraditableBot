import type { Player, Track } from 'lavalink-client';

export async function playPrevious(player: Player): Promise<Track | null> {
  const previous = await player.queue.shiftPrevious().catch(() => null);
  if (!previous) return null;

  await player.queue.add(previous, 0);
  await player.skip(0, false);

  return previous;
}
