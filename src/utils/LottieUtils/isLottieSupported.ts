import { isWASMSupported } from '../WASMUtils';

export const isLottieSupported = () => {
  return isWASMSupported() && typeof Uint8ClampedArray !== 'undefined' && typeof Worker !== 'undefined' && typeof ImageData !== 'undefined';
};
