export interface PlayerOption {
  cachingModulo: number;
}

export interface Player {
  clamped: any;
  height: number;
  options: PlayerOption;
  paused: boolean;
  url: string;
  width: number;
}
