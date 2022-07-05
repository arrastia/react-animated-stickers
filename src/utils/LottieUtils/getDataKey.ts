export function getDataKey(rlPlayer: any) {
  if (!rlPlayer) return null;

  const { fileId, width, height } = rlPlayer;

  return `${fileId}_${width}_${height}`;
}
