import React from 'react'

import { LottieContext } from '../../contexts/LottieContext';
import { buildRLottieObject } from './util';

import type { ReactNode } from 'react';

export const LottieProvider = ({ children }: { children: ReactNode }) => {
  const lottie = buildRLottieObject();

  return <LottieContext.Provider value={lottie}>{children}</LottieContext.Provider>;
};
