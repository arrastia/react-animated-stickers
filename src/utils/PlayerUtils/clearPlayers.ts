import type { Player } from '../../types/Player';

export const clearPlayers = (players: Player[]): boolean => {
  console.log('players', players);
  players = Object.create(null);

  return true;
};
