export interface PlayerOption {
  cachingModulo: number;
}

export interface Player {
  clamped: any;
  fileId: string;
  forceRender: boolean;
  fps: any;
  frameCount: number;
  frameInterval: number;
  frameNo: any;
  frameQueue: any;
  frameThen: number;
  from: any;
  height: number;
  nextFrameNo: boolean;
  options: PlayerOption;
  paused: boolean;
  queueLength: number;
  reqId: any;
  rWorker: any;
  segmentId: any;
  to: any;
  url: string;
  width: number;
}
