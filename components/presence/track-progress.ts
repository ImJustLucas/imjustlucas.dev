/**
 * How far a track has played at `now`, between 0 and 1: Lanyard sends the
 * track's start and end, and its next update may come a little after the
 * end, so the ratio holds at 1 meanwhile.
 */
export const trackProgress = (
  now: number,
  startedAt: number,
  endsAt: number,
): number => {
  const duration = endsAt - startedAt;
  if (duration <= 0) return 0;
  return Math.min(1, Math.max(0, (now - startedAt) / duration));
};
