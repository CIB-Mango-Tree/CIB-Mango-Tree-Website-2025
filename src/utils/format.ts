export function formatTime(currentTime: number): string {
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
