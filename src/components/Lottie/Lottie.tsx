/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// import { buildRLottieObject } from '../../utils/buildRLottieObject';
import { createLottie as buildRLottieObject } from '../../utils/createLottie';


import type { LottieEvents, LottieProps, LottieRef } from './@types/Lottie.types';
import type { Ref } from 'react';
import { LottieStyles } from './Lottie.styles';

export const Lottie = forwardRef((props: LottieProps, ref: Ref<LottieRef>) => {
  const { ariaLabel, ariaRole, eventListeners, height, onClick, onMouseEnter, onMouseOut, options, style, title, width } = props;

  const lottie = buildRLottieObject();

  const [animation, setAnimation] = useState(null);

  const containerRef = useRef<HTMLPictureElement>(null);

  useEffect(() => {
    const { animationData, autoplay, loop, queueLength, stringData } = options;
    const defaultOptions = {
      animationData,
      autoplay: Boolean(autoplay),
      container: containerRef.current,
      loop: Boolean(loop),
      queueLength,
      stringData
    };

    let _options: any = { ...defaultOptions, ...options, fileId: 'monkney-idle' };
    console.log('_options :>> ', _options);

    lottie?.loadAnimation(_options, (anim: any) => {
      // console.log('anim :>> ', anim);
      setAnimation(anim);
      if (lottie.hasFirstFrame(anim)) {
        if (!eventListeners) return;

        eventListeners.forEach(({ callback, eventName }) => {
          if (eventName === 'firstFrame') {
            callback && callback();
          }
        });
      }
    });
    eventListeners && registerEvents(eventListeners);

    return () => {
      destroy();
      setAnimation(null);
      eventListeners && unregisterEvents(eventListeners);

      _options = {};
      _options.blob = null;
      _options.container = null;
    };
  }, [options.animationData, options.fileId, options.stringData]);

  useImperativeHandle(ref, () => ({ pause, play, playSegments }));

  const destroy = () => {
    if (!animation) return;

    lottie.destroy(animation);
  };

  const pause = () => {
    if (!lottie.isPaused(animation)) {
      lottie.pause(animation);
      return true;
    }

    return false;
  };

  const play = () => lottie.play(animation);

  const playSegments = (segments: any, forceFlag: any) => lottie.playSegments(animation, segments, forceFlag);

  const unregisterEvents = (eventListeners: LottieEvents[]) => {
    if (!animation || !eventListeners) return;

    eventListeners.forEach(({ eventName, callback }) => lottie.removeEventListener(animation, eventName, callback));
  };

  const registerEvents = (eventListeners: LottieEvents[]) => {
    if (!animation || !eventListeners) return;

    eventListeners.forEach(({ eventName, callback }) => lottie.addEventListener(animation, eventName, callback));
  };

  return (
    <LottieStyles
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseOut={onMouseOut}
      role={ariaRole}
      style={{ height: height || '100%', outline: 'none', overflow: 'hidden', width: width || '100%', ...style }}
      tabIndex={0}
      title={title}>
      <picture ref={containerRef} style={{ display: 'block', height: '100%', maxWidth: '256px', position: 'relative', width: '100%' }} />
    </LottieStyles>
  );
});
