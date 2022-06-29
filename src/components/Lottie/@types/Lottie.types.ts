import type { CSSProperties } from 'react';

export interface LottieRef {
  pause: () => void;
  play: () => void;
  playSegments: (segments: any, forceFlag: any) => void;
}

export interface LottieEvents {
  callback?: () => void;
  eventName: string;
}

export interface LottieOptions {
  animationData?: any;
  autoplay: boolean;
  fileId?: number | string;
  height?: number;
  inViewportFunc?: boolean;
  loop: boolean;
  queueLength?: any;
  stringData?: string;
  width?: number;
}

export interface LottieProps {
  ariaLabel?: string;
  ariaRole?: string;
  eventListeners?: LottieEvents[];
  height?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseOut?: () => void;
  options: LottieOptions;
  style?: CSSProperties;
  title?: string;
  width?: number;
}
