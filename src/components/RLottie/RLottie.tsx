import React, { forwardRef, CSSProperties, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
// import { buildRLottieObject } from '../../utils/buildRLottieObject';
import { createLottie as buildRLottieObject } from '../../utils/createLottie';
import { Lottie } from './RLottie.styles';

export interface RLottieEventListeners {
  callback?: () => void;
  eventName: string;
}

interface RLottieOptions {
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

export interface RLottieProps {
  ariaLabel?: string;
  ariaRole?: string;
  eventListeners?: RLottieEventListeners[];
  height?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseOut?: () => void;
  options: RLottieOptions;
  style?: CSSProperties;
  title?: string;
  width?: number;
}

interface RLottieHandleProps {
  pause: () => void;
  play: () => void;
  playSegments: (segments: any, forceFlag: any) => void;
}

export const RLottie = forwardRef(
  (
    { ariaLabel, ariaRole, eventListeners, height, onClick, onMouseEnter, onMouseOut, options, style, title, width }: RLottieProps,
    ref: Ref<RLottieHandleProps>
  ) => {
    const lottie = buildRLottieObject();

    const [animation, setAnimation] = useState<any>(null);

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

      let _options: any = { ...defaultOptions, ...options };

      lottie.loadAnimation(_options, (anim: any) => {
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
        // _options.blob = null;
        // _options.container = null;
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

    const playSegments = (segments: any, forceFlag: any) => {
      console.log('plause :>> ');
      lottie.playSegments(animation, segments, forceFlag);
    };

    const unregisterEvents = (eventListeners: RLottieEventListeners[]) => {
      if (!animation) return;
      if (!eventListeners) return;

      eventListeners.forEach(({ eventName, callback }) => {
        lottie.removeEventListener(animation, eventName, callback);
      });
    };

    const registerEvents = (eventListeners: RLottieEventListeners[]) => {
      if (!animation) return;

      if (!eventListeners) return;

      eventListeners.forEach(({ eventName, callback }) => {
        lottie.addEventListener(animation, eventName, callback);
      });
    };

    return (
      <Lottie
        aria-label={ariaLabel}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseOut={onMouseOut}
        role={ariaRole}
        style={{ height: height || '100%', outline: 'none', overflow: 'hidden', width: width || '100%', ...style }}
        tabIndex={0}
        title={title}>
        <picture className="dev_page_tgsticker tl_main_card_animated js-tgsticker_image" ref={containerRef}></picture>
      </Lottie>
    );
  }
);

RLottie.displayName = 'RLottie';
