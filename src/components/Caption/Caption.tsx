import React from 'react';

import { AuthCaptionTelegramLogo } from './Caption.styles';

import { close, idle, peek, tracking } from '../../assets/stickers/monkey';

import RLottie from '../../components/RLottie';

// const RLottie = React.lazy(() => import('../RLottie'));

class Caption extends React.Component {
  state: any;
  lottieRef: any;

  constructor(props: any) {
    super(props);
    this.state = { fileId: null, data: null, lastUpdate: 'idle' };
    this.lottieRef = React.createRef();
  }

  loadData = async () => {
    // const { closeData } = this.state;
    // console.log('closeData', closeData);

    // if (closeData) return;

    try {
      const closeData = JSON.stringify(close);
      const idleData = JSON.stringify(idle);
      const peekData = JSON.stringify(peek);
      const trackingData = JSON.stringify(tracking);

      this.setState({ closeData, idleData, peekData, trackingData }, () => {
        const { lastUpdate } = this.state;

        if (lastUpdate) {
          switch (lastUpdate) {
            case 'idle': {
              this.onClientUpdateMonkeyIdle();
              break;
            }

            case 'tracking': {
              this.onClientUpdateMonkeyTracking(lastUpdate);
              break;
            }

            case 'close': {
              this.onClientUpdateMonkeyClose();
              break;
            }

            case 'peek': {
              this.onClientUpdateMonkeyPeek(lastUpdate);
              break;
            }

            default:
              this.onClientUpdateMonkeyIdle();
              break;
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  async componentDidMount() {
    setTimeout(this.loadData, 100);
  }

  playSegments = (segments: any, forceFlag: any) => {
    const { current } = this.lottieRef;
    if (!current) {
      setTimeout(() => {
        const { current } = this.lottieRef;
        if (!current) return;

        console.log('current :>> ', current);

        current.playSegments(segments, forceFlag);
      }, 100);
      return;
    }

    current.playSegments(segments, forceFlag);
  };

  onClientUpdateMonkeyIdle = () => {
    const { idleData } = this.state;

    this.setState({ fileId: 'idle', data: idleData, lastUpdate: 'idle' }, () => {
      this.playSegments([0, 179], true);
    });
  };

  getFrame = (length: any, paddingFrames: any, letterFrames: any, framesCount: any) => {
    if (!length) {
      return 0;
    }

    const lastAnimatedLetter = (framesCount - 2 * paddingFrames) / letterFrames;

    let frames = paddingFrames + (length - 1) * letterFrames;
    if (length > lastAnimatedLetter + 1) {
      frames += paddingFrames;
    }

    return Math.min(frames, framesCount - 1);
  };

  onClientUpdateMonkeyTracking = (update: any) => {
    const { code, prevCode } = update;
    const { trackingData } = this.state;

    const FRAMES_COUNT = 180;
    const LETTER_FRAMES = 10;
    const PADDING_FRAMES = 20;

    const from = this.getFrame(prevCode.length, PADDING_FRAMES, LETTER_FRAMES, FRAMES_COUNT);
    const to = this.getFrame(code.length, PADDING_FRAMES, LETTER_FRAMES, FRAMES_COUNT);

    const isLastFrom = from === 0 || from === 179;
    const isLastTo = to === 0 || to === 179;

    if (isLastFrom && isLastTo) {
      return;
    }

    this.setState({ fileId: 'tracking', data: trackingData, lastUpdate: 'tracking' }, () => {
      this.playSegments([from, to], true);
    });
  };

  onClientUpdateMonkeyClose = () => {
    const { closeData } = this.state;

    this.setState({ fileId: 'close', data: closeData, lastUpdate: 'close' }, () => {
      this.playSegments([0, 49], true);
    });
  };

  onClientUpdateMonkeyPeek = (update: any) => {
    const { peek } = update;
    const { peekData, lastUpdate } = this.state;

    if (lastUpdate && lastUpdate['@type'] === 'clientUpdateMonkeyPeek' && lastUpdate.peek === peek) {
      return;
    }

    this.setState({ fileId: 'peek', data: peekData, lastUpdate: 'peek' }, () => {
      if (peek) {
        this.playSegments([0, 15], true);
      } else {
        this.playSegments([15, 0], true);
      }
    });
  };

  render() {
    const { closeData, data, fileId, idleData, peekData, trackingData } = this.state;
    console.log('data :>> ', data);

    return (
      <AuthCaptionTelegramLogo
        onMouseDown={() => this.onClientUpdateMonkeyPeek({ peek: true })}
        onMouseUp={() => this.onClientUpdateMonkeyPeek({ peek: false })}>
        {data && (
          <React.Suspense fallback={null}>
            <RLottie ref={this.lottieRef} options={{ width: 160, height: 160, autoplay: true, loop: true, fileId, stringData: data }} />
            <RLottie
              options={{ width: 160, height: 160, autoplay: false, loop: false, fileId: 'tracking', stringData: trackingData, queueLength: 1 }}
              style={{ display: 'none' }}
            />
            <RLottie
              options={{ width: 160, height: 160, autoplay: false, loop: false, fileId: 'close', stringData: closeData, queueLength: 1 }}
              style={{ display: 'none' }}
            />
            <RLottie
              options={{ width: 160, height: 160, autoplay: false, loop: false, fileId: 'peek', stringData: peekData, queueLength: 1 }}
              style={{ display: 'none' }}
            />
            <RLottie
              options={{ width: 160, height: 160, autoplay: false, loop: false, fileId: 'idle', stringData: idleData, queueLength: 1 }}
              style={{ display: 'none' }}
            />
          </React.Suspense>
        )}
      </AuthCaptionTelegramLogo>
    );
  }
}

export { Caption };
