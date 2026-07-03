export function formatDuration(ms: number | undefined): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return '00:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function progressBar(current: number, total: number | undefined, length = 20): string {
  if (typeof total !== 'number' || !Number.isFinite(total) || total <= 0) {
    return '🔴 ' + '▬'.repeat(length) + ' LIVE';
  }

  const ratio = Math.min(Math.max(current / total, 0), 1);
  const filledLength = Math.round(length * ratio);
  const bar = '▬'.repeat(filledLength) + '🔘' + '▬'.repeat(Math.max(length - filledLength, 0));

  return `${formatDuration(current)} ${bar} ${formatDuration(total)}`;
}
