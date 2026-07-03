import type { Track, UnresolvedTrack } from 'lavalink-client';

export const QUEUE_PAGE_SIZE = 10;

export interface QueuePage {
  page: number;
  totalPages: number;
  items: (Track | UnresolvedTrack)[];
  startIndex: number;
}

export function paginateQueue(
  tracks: (Track | UnresolvedTrack)[],
  page: number,
): QueuePage {
  const totalPages = Math.max(1, Math.ceil(tracks.length / QUEUE_PAGE_SIZE));
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const startIndex = clampedPage * QUEUE_PAGE_SIZE;
  const items = tracks.slice(startIndex, startIndex + QUEUE_PAGE_SIZE);

  return { page: clampedPage, totalPages, items, startIndex };
}
