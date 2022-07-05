export const isSafari = (): boolean => {
  let { userAgent } = window.navigator;

  return !!(userAgent && (/\b(iPad|iPhone|iPod)\b/.test(userAgent) || (!!userAgent.match('Safari') && !userAgent.match('Chrome'))));
};
