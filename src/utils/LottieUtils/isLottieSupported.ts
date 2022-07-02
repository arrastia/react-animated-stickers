import { isWASMSupported } from '../WASMUtils/isWASMSupported';

export const isLottieSupported = () => {
  return isWASMSupported() && typeof Uint8ClampedArray !== 'undefined' && typeof Worker !== 'undefined' && typeof ImageData !== 'undefined';
};
