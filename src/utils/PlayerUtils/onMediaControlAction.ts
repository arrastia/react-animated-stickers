import type { Player } from 'types/Player';

export const onMediaControlAction = (player: Player, action: 'play' | 'pause') => {
  if (!player) return;

  player.paused = action === 'play' ? false : true;
};
