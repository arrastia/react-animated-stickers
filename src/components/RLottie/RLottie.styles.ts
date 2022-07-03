import styled from 'styled-components';

export const Lottie = styled('picture')`
  width: 100%;
  height: 100%;
  position: relative;
  display: block;
  max-width: 256px;

  & img,
  & canvas {
    /* bottom: 0;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%; */
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
  }
`;
