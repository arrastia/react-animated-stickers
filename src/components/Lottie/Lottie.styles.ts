import styled from 'styled-components';

export const LottieStyles = styled('div')`
  display: block;
  height: 100%;
  max-width: 256px;
  position: relative;
  width: 100%;

  & img,
  & canvas {
    bottom: 0;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
  }
`;
