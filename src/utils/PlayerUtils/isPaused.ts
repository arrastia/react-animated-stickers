export const isPaused = (player: any) => {
  if (!player) return false;

  return player.paused;
};
