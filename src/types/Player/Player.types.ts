export interface PlayerOption {
  cachingModulo: number;
}

export interface Player {
  clamped: any;
  height: number;
  options: PlayerOption;
  url: string;
  width: number;
}
