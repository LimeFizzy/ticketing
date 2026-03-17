export const FADE_PX = 8;
export const MIN_SCROLL_PX = 280;

export const buildScrollerMask = (
  canLeft: boolean,
  canRight: boolean
): string | undefined => {
  if (!canLeft && !canRight) return undefined;
  const left = canLeft ? `transparent 0, black ${FADE_PX}px` : 'black 0';
  const right = canRight
    ? `black calc(100% - ${FADE_PX}px), transparent 100%`
    : 'black 100%';
  return `linear-gradient(to right, ${left}, ${right})`;
};
