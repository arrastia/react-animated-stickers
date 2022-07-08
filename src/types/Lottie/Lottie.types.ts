import type { Player } from 'types/Player';

export type LottieAPI = any;

export type LottieEvents = any;

export type LottieEventListener = (reqId: any, eventName: string, callback?: () => void) => void;

export interface Lottie {
  addEventListener: (reqId: any, eventName: any, callback: any) => void;
  Api: LottieAPI;
  clear: () => boolean;
  clearPlayers: () => boolean;
  destroy: (reqId: any) => void;
  destroyWorkers: () => void;
  events: LottieEvents;
  frames: Map<any, any>;
  hasFirstFrame: (reqId: any) => boolean;
  init: (el: any, options: any) => boolean;
  initApi: () => void;
  isPaused: (reqId: any) => boolean;
  isSafari: boolean;
  isSupported: boolean;
  loadAnimation: (options: any, callback: any) => void;
  pause: (reqId: any) => void;
  play: (reqId: any) => void;
  players: Player[];
  playSegments: (reqId: any, segments: any, forceFlag: any) => void;
  preload: (fileId: any, stringData: any) => void;
  removeEventListener: (reqId: any, eventName: any, callback?: () => void) => void;
  WORKERS_LIMIT: number;
}
