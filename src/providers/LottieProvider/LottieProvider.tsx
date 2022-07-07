import React from 'react'

import { LottieContext } from '../../contexts/LottieContext';
// import { buildRLottieObject } from './util';

import type { ReactNode } from 'react';
import { createLottie } from '../../utils/createLottie';

export const LottieProvider = ({ children }: { children: ReactNode }) => {
  const lottie = createLottie();

  return <LottieContext.Provider value={lottie}>{children}</LottieContext.Provider>;
};
