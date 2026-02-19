/**
 * Retourne une chaîne comme "il y a 5 min" à partir d'un timestamp.
 * Port de getTimeSince() de client.js.
 */
export function getTimeSince(timestamp: number, t: (key: string, params?: Record<string, unknown>) => string): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const ago = t('lobby.ago');
  if (days > 0) return `${ago} ${t('time.days', { n: days })}`;
  if (hours > 0) return `${ago} ${t('time.hours', { n: hours })}`;
  if (minutes > 0) return `${ago} ${t('time.minutes', { n: minutes })}`;
  return t('lobby.justNow');
}
