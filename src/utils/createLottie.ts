import { WORKERS_LIMIT } from '../configuration/constants';

import { addEventListener, removeEventListener } from './EventsUtils';
import { clear } from './LottieUtils/clear';
import { clearPlayers, isPaused, onMediaControlAction } from './PlayerUtils';
import { FrameQueue } from './FrameUtils';
import { isLottieSupported, isSafari } from './LottieUtils';
import { QueryableWorker } from './WorkersUtils';

import type { Lottie } from '../types/Lottie';

export const createLottie = () => {
  let checkViewportDate: any = false;
  let curWorkerNum = 0;
  let deviceRatio = window.devicePixelRatio || 1;
  let initCallbacks: any = [];
  let lastRenderDate: any = false;

  let reqId = 0;
  let segmentId = 0;

  let lottie = {} as Lottie;

  let apiInited = false;
  let apiInitStarted = false;
  let lottieWorkers: any = [];

  lottie.Api = {};
  lottie.events = Object.create(null);
  lottie.frames = new Map();
  lottie.players = Object.create(null);

  let mainLoopTO: any = false;

  let isRAF = isSafari();

  function getDataKey(reqId: any) {
    const rlPlayer = lottie.players[reqId];

    if (!rlPlayer) return null;

    const { fileId, width, height } = rlPlayer;

    return `${fileId}_${width}_${height}`;
  }

  function destroyWorkers() {
    for (let workerNum = 0; workerNum < WORKERS_LIMIT; workerNum++) {
      if (lottieWorkers[workerNum]) lottieWorkers[workerNum].terminate();
    }

    apiInitStarted = apiInited = false;
    lottieWorkers = [];
  }

  function doRender(rlPlayer: any, frame: any, frameNo: any) {
    rlPlayer.frameNo = frameNo;
    rlPlayer.forceRender = false;
    rlPlayer.imageData.data.set(frame);
    rlPlayer.context.putImageData(rlPlayer.imageData, 0, 0);

    fireFirstFrameEvent(rlPlayer);
  }

  function initApi(callback?: any) {
    if (apiInited) {
      callback && callback();
    } else {
      callback && initCallbacks.push(callback);

      if (!apiInitStarted) {
        apiInitStarted = true;
        let workersRemain = WORKERS_LIMIT;

        for (let workerNum = 0; workerNum < WORKERS_LIMIT; workerNum++) {
          (function(workerNum) {
            const lottieWorker = (lottieWorkers[workerNum] = new QueryableWorker('../lottie/lottie-wasm.worker.js'));

            lottieWorker.addListener('ready', function() {
              lottieWorker.addListener('frame', onFrame);
              lottieWorker.addListener('loaded', onLoaded);
              --workersRemain;

              if (!workersRemain) {
                apiInited = true;

                for (let i = 0; i < initCallbacks.length; i++) {
                  initCallbacks[i]();
                }

                initCallbacks = [];
              }
            });
          })(workerNum);
        }
      }
    }
  }

  function initPlayer(el: any, options: any) {
    options = options || {};
    const rlPlayer: any = {};
    let fileId = options.fileId;
    // if (options.fileId && (options.animationData || options.stringData)) {
    //   console.log('options', options.fileId);
    //   fileId = options.fileId;
    // }

    options.maxDeviceRatio = 1.5;
    console.log('fileId', fileId);

    if (!fileId) {
      console.log('fileId not found hey');
      return;
    }
    let pic_width = options.width;
    let pic_height = options.height;
    if (!pic_width || !pic_height) {
      pic_width = pic_height = 256;
    }
    rlPlayer.autoplay = options.autoplay || false;
    rlPlayer.paused = !rlPlayer.autoplay;
    rlPlayer.loop = options.loop || false;
    rlPlayer.playWithoutFocus = options.playWithoutFocus;
    rlPlayer.inViewportFunc = options.inViewportFunc;
    rlPlayer.queueLength = options.queueLength;

    const curDeviceRatio = options.maxDeviceRatio ? Math.min(options.maxDeviceRatio, deviceRatio) : deviceRatio;

    rlPlayer.fileId = fileId;
    rlPlayer.reqId = ++reqId;
    rlPlayer.el = el;
    rlPlayer.width = Math.trunc(pic_width * curDeviceRatio);
    rlPlayer.height = Math.trunc(pic_height * curDeviceRatio);
    rlPlayer.imageData = new ImageData(rlPlayer.width, rlPlayer.height);
    lottie.players[reqId] = rlPlayer;

    rlPlayer.canvas = document.createElement('canvas');
    rlPlayer.canvas.width = pic_width * curDeviceRatio;
    rlPlayer.canvas.height = pic_height * curDeviceRatio;
    rlPlayer.el.innerHTML = null;
    rlPlayer.el.appendChild(rlPlayer.canvas);
    rlPlayer.context = rlPlayer.canvas.getContext('2d');
    rlPlayer.forceRender = true;

    const rWorker = lottieWorkers[curWorkerNum++];
    if (curWorkerNum >= lottieWorkers.length) {
      curWorkerNum = 0;
    }
    rlPlayer.nextFrameNo = false;
    rlPlayer.rWorker = rWorker;
    rlPlayer.clamped = new Uint8ClampedArray(rlPlayer.width * rlPlayer.height * 4);

    const dataKey = getDataKey(reqId);
    const data = lottie.frames.get(dataKey);
    if (data) {
      const frameData = data.frames[0];

      if (frameData) {
        doRender(rlPlayer, frameData.frame, 0);
      }
    } else {
      lottie.frames.set(dataKey, {
        frames: {},
        cachingModulo: options.cachingModulo || 3,
        fileId: rlPlayer.fileId,
        width: rlPlayer.width,
        height: rlPlayer.height
      });
    }

    if (options.stringData) {
      rWorker.sendQuery('loadFromJson', rlPlayer.reqId, options.stringData, rlPlayer.width, rlPlayer.height);
    } else if (options.animationData) {
      rWorker.sendQuery('loadFromBlob', rlPlayer.reqId, options.animationData, rlPlayer.width, rlPlayer.height);
    } else {
      rWorker.sendQuery('loadFromData', rlPlayer.reqId, fileId, rlPlayer.width, rlPlayer.height);
    }

    return rlPlayer.reqId;
  }

  function fireFirstFrameEvent(rlPlayer: any) {
    if (!rlPlayer.firstFrame) {
      rlPlayer.firstFrame = true;
      const rlEvents = lottie.events[rlPlayer.reqId];

      if (rlEvents) {
        rlEvents['firstFrame'] && rlEvents['firstFrame']();
      }
    }
  }

  function fireLoopComplete(rlPlayer: any) {
    const rlEvents = lottie.events[rlPlayer.reqId];

    if (rlEvents) rlEvents['loopComplete'] && rlEvents['loopComplete']();
  }

  function mainLoop() {
    const now = +Date.now();
    const checkViewport = !checkViewportDate || now - checkViewportDate > 1000;

    for (let reqId in lottie.players) {
      const rlPlayer: any = lottie.players[reqId];

      if (rlPlayer && rlPlayer.frameCount) {
        const delta = now - rlPlayer.frameThen;

        if (delta > rlPlayer.frameInterval) {
          const rendered = render(rlPlayer, checkViewport);

          if (rendered) lastRenderDate = now;
        }
      }
    }

    const delay = now - lastRenderDate < 100 ? 16 : 500;
    mainLoopTO = delay < 20 && isRAF ? requestAnimationFrame(mainLoop) : setTimeout(mainLoop, delay);

    if (checkViewport) checkViewportDate = now;
  }

  function setupMainLoop() {
    let isEmpty = true;

    for (const key in lottie.players) {
      const rlPlayer: any = lottie.players[key];

      if (rlPlayer && rlPlayer.frameCount) {
        isEmpty = false;
        break;
      }
    }

    if ((mainLoopTO !== false) === isEmpty) {
      if (isEmpty) {
        if (isRAF) {
          cancelAnimationFrame(mainLoopTO);
        }

        try {
          clearTimeout(mainLoopTO);
        } catch (e) {}

        mainLoopTO = false;
      } else {
        mainLoopTO = isRAF ? requestAnimationFrame(mainLoop) : setTimeout(mainLoop, 0);
      }
    }
  }

  function render(rlPlayer: any, checkViewport: any) {
    let renderPlayer = true;

    if (!rlPlayer.canvas || rlPlayer.canvas.width == 0 || rlPlayer.canvas.height == 0) renderPlayer = false;

    if (!rlPlayer.forceRender) {
      // not focused
      if ((!rlPlayer.playWithoutFocus && !document.hasFocus()) || !rlPlayer.frameCount) renderPlayer = false;

      // paused
      if (rlPlayer.paused) renderPlayer = false;

      // not in viewport
      let { isInViewport, inViewportFunc } = rlPlayer;

      if (isInViewport === undefined || checkViewport) {
        const rect = rlPlayer.el.getBoundingClientRect() as DOMRect;

        if (inViewportFunc) {
          isInViewport = inViewportFunc(rlPlayer.fileId, rect);
        } else {
          const { bottom, left, right, top } = rect;
          const { clientHeight, clientWidth } = document.documentElement;
          const { innerHeight, innerWidth } = window;
          const isNotInViewPort = bottom < 0 || right < 0 || top > (innerHeight || clientHeight) || left > (innerWidth || clientWidth);

          isInViewport = !isNotInViewPort;
        }

        rlPlayer.isInViewport = isInViewport;
      }

      if (!isInViewport) renderPlayer = false;
    }

    if (!renderPlayer) return false;

    const frameData = rlPlayer.frameQueue.shift();

    if (frameData !== null) {
      const { frameNo, frame } = frameData;

      doRender(rlPlayer, frame, frameNo);

      if (rlPlayer.from === undefined && rlPlayer.to === undefined) {
        if (rlPlayer.frameCount - 1 === frameNo) {
          if (!rlPlayer.loop) {
            rlPlayer.paused = true;
          }

          fireLoopComplete(rlPlayer);
        }
      } else {
        if (frameNo === rlPlayer.to) {
          rlPlayer.paused = true;
        }
      }

      const now = +new Date();
      rlPlayer.frameThen = now - (now % rlPlayer.frameInterval);

      const nextFrameNo = rlPlayer.nextFrameNo;

      if (nextFrameNo !== false) {
        rlPlayer.nextFrameNo = false;
        requestFrame(rlPlayer.reqId, nextFrameNo, rlPlayer.segmentId);
      }
    }

    return true;
  }

  function requestFrame(reqId: any, frameNo: any, segmentId: any) {
    const dataKey = getDataKey(reqId);
    const data = lottie.frames.get(dataKey);

    if (!data) return;

    const rlPlayer = lottie.players[reqId];
    const frameData = data.frames[frameNo];

    if (frameData) {
      onFrame(reqId, frameNo, frameData.frame, segmentId);
    } else if (isSafari()) {
      rlPlayer.rWorker.sendQuery('renderFrame', reqId, frameNo, segmentId);
    } else {
      if (!rlPlayer.clamped.length) {
        // fix detached
        rlPlayer.clamped = new Uint8ClampedArray(rlPlayer.width * rlPlayer.height * 4);
      }
      rlPlayer.rWorker.sendQuery('renderFrame', reqId, frameNo, segmentId, rlPlayer.clamped);
    }
  }

  function onFrame(reqId: any, frameNo: any, frame: any, segmentId: any) {
    const dataKey = getDataKey(reqId);
    const data = lottie.frames.get(dataKey);
    const rlPlayer = lottie.players[reqId];

    if (!rlPlayer) return;

    if (rlPlayer.segmentId !== segmentId) return;

    if (data.cachingModulo && !data.frames[frameNo] && (!frameNo || (reqId + frameNo) % data.cachingModulo)) {
      data.frames[frameNo] = {
        // hash: new Uint8ClampedArray(frame).reduce((a, b) => a + b),
        frame: new Uint8ClampedArray(frame)
      };
    }

    if (rlPlayer) rlPlayer.frameQueue.push({ frameNo, frame, segmentId });

    // immediately render first frame
    if (frameNo === 0) {
      for (let key in lottie.players) {
        const rlPlayer = lottie.players[key];

        if (rlPlayer && rlPlayer.forceRender) {
          const dataKey2 = getDataKey(key);

          if (dataKey === dataKey2) {
            doRender(rlPlayer, frame, frameNo);
          }
        }
      }
    }

    let nextFrameNo;

    if (rlPlayer.from !== undefined && rlPlayer.to !== undefined) {
      nextFrameNo = rlPlayer.from > rlPlayer.to ? frameNo - 1 : frameNo + 1;
    } else {
      nextFrameNo = frameNo + 1;
    }

    if (nextFrameNo < 0) nextFrameNo = data.frameCount - 1;

    if (nextFrameNo >= data.frameCount) nextFrameNo = 0;

    if (rlPlayer.frameQueue.needsMore()) {
      requestFrame(reqId, nextFrameNo, segmentId);
    } else {
      rlPlayer.nextFrameNo = nextFrameNo;
    }
  }

  function onLoaded(reqId: any, frameCount: any, fps: any) {
    const dataKey = getDataKey(reqId);
    const data = lottie.frames.get(dataKey);
    const rlPlayer = lottie.players[reqId];

    let frameNo = 0;
    if (data) {
      data.fps = fps;
      data.frameCount = frameCount;
    }

    if (rlPlayer) {
      const queueLength = rlPlayer.queueLength || fps / 4;

      rlPlayer.fps = fps;
      rlPlayer.frameCount = frameCount;
      rlPlayer.frameThen = Date.now();
      rlPlayer.frameInterval = 1000 / fps;
      rlPlayer.frameQueue = new FrameQueue(queueLength);
      rlPlayer.nextFrameNo = false;

      setupMainLoop();
      requestFrame(reqId, frameNo, rlPlayer.segmentId);
    }
  }

  function loadAnimation(options: any, callback: any) {
    if (!lottie.isSupported) {
      return false;
    }

    initApi(() => {
      const reqId = initPlayer(options.container, options);
      callback && callback(reqId);
    });

    return true;
  }

  function unloadAnimation(reqId: any) {
    const rlPlayer = lottie.players[reqId];
    if (!rlPlayer) return;

    let hasOther = false;
    const dataKey = getDataKey(reqId);

    for (let key in lottie.players) {
      if (getDataKey(key) === dataKey && String(reqId) !== key) {
        hasOther = true;
        break;
      }
    }

    if (!hasOther) {
      const data = lottie.frames.get(dataKey);
      if (data && data.frames[0]) {
        data.frames = { 0: { frame: data.frames[0].frame } };
      }
    }

    delete lottie.players[reqId];

    setupMainLoop();
  }

  lottie.isSafari = isSafari();
  lottie.isSupported = isLottieSupported();

  lottie.addEventListener = (reqId: any, eventName: any, callback: any) => addEventListener(lottie.events[reqId], eventName, callback);
  lottie.removeEventListener = (reqId: any, eventName: any) => removeEventListener(lottie.events[reqId], eventName, reqId);

  lottie.clear = () => clear(lottie.frames);
  lottie.clearPlayers = () => clearPlayers(lottie.players);

  lottie.destroy = (reqId: any) => unloadAnimation(reqId);
  lottie.destroyWorkers = () => destroyWorkers();

  lottie.loadAnimation = (options: any, callback: any) => loadAnimation(options, callback);

  lottie.pause = (reqId: any) => onMediaControlAction(lottie.players[reqId], 'pause');
  lottie.play = (reqId: any) => onMediaControlAction(lottie.players[reqId], 'play');
  lottie.preload = (fileId: any, stringData: any) => initPlayer(null, { fileId, stringData });
  lottie.playSegments = function(reqId: any, segments: any, forceFlag: any) {
    const rlPlayer = lottie.players[reqId];
    if (!rlPlayer) return;

    if (!segments || segments.length < 2) return;

    rlPlayer.segmentId = ++segmentId;
    rlPlayer.from = forceFlag ? segments[0] : rlPlayer.frameNo;
    rlPlayer.to = segments[1];
    rlPlayer.paused = false;

    if (rlPlayer.fps) {
      rlPlayer.frameQueue = new FrameQueue(rlPlayer.fps / 4);
      rlPlayer.nextFrameNo = false;

      setupMainLoop();
      requestFrame(rlPlayer.reqId, rlPlayer.from, rlPlayer.segmentId);
    }
  };

  lottie.isPaused = (reqId: any) => isPaused(lottie.players[reqId]);
  lottie.hasFirstFrame = function(reqId: any) {
    const dataKey = getDataKey(reqId);
    const data = lottie.frames.get(dataKey);

    return data && Boolean(data.frames[0]);
  };

  lottie.initApi = () => initApi();
  lottie.init = (el: any, options: any): boolean => {
    if (!lottie.isSupported) {
      return false;
    }
    initApi(() => {
      if (el && options) {
        initPlayer(el, options);
      }
    });

    return true;
  };

  return lottie;
};
