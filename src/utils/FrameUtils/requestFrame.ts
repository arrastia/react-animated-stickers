export function requestFrame(reqId: any, frameNo: any, players: any[]) {
  const rlPlayer = players[reqId];
  const data = rlottieFrames.get(rlPlayer.url);

  const frame = data.frames[frameNo];

  if (frame) {
    onFrame(reqId, frameNo, frame);
  } else if (isSafari) {
    if (data.reqId === reqId) data.rWorker.sendQuery('renderFrame', reqId, frameNo);
  } else {
    if (!rlPlayer.clamped.length) {
      // fix detached
      rlPlayer.clamped = new Uint8ClampedArray(rlPlayer.width * rlPlayer.height * 4);
    }
    if (data.reqId === reqId) data.rWorker.sendQuery('renderFrame', reqId, frameNo, rlPlayer.clamped);
  }
}
