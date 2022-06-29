import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import monkey from './monkey-idle.json'

import { Lottie } from '../../components/Lottie';

import type { ElementRef } from 'react';

type LottieHandleRef = ElementRef<typeof Lottie>;

export const Monkey = () => {
  const [data, setData] = useState<string | undefined>(undefined);

  const lottieRef = useRef<LottieHandleRef>(null);

  const loadData = useCallback(async () => {
    try {
      // const res = await (await fetch('./monkey-idle.json')).text()
      // console.log('res :>> ', res);
      // setData(res);
      setData(JSON.stringify(monkey));
      playSegments([0, 179], true);
    } catch (error) {}
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const playSegments = (segments: any, forceFlag: any) => {
    const { current } = lottieRef;
    if (!current) {
      setTimeout(() => {
        const { current } = lottieRef;
        if (!current) return;

        current.playSegments(segments, forceFlag);
      }, 100);
      return;
    }

    current.playSegments(segments, forceFlag);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Lottie
        options={{ autoplay: false, fileId: 'IDLE', height: 160, loop: false, stringData: data, width: 160 }}
        ref={lottieRef}
        style={{ height: '100px', width: '100px' }}
      />
    </Suspense>
  );
};
