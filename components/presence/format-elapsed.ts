const pad = (n: number) => String(n).padStart(2, "0");

/** Time since a game started, as `m:ss` under an hour and `h:mm:ss` after. */
export const formatElapsed = (milliseconds: number): string => {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
};
