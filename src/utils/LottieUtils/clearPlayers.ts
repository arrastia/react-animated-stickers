import type { Player } from '../../types/Player';

export const clearPlayers = (players: Player[]): boolean => {
  players = Object.create(null);

  return true;
};
