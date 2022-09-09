import React from "react";
import styled, { css, keyframes } from "styled-components";
import logo from "../assets/logo.png";
const pulse = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  width: 100%;

  ${(props) =>
    props.fill && !props.height
      ? css`
          height: 100vh;
        `
      : css`
          height: 180px;
        `}
`;

const AnimatedImg = styled.div`
  transform-origin: center;
  animation: ${pulse} 800ms linear infinite;
  & > * {
    width: 105px;
  }
`;

const LocalLoader = ({ fill }) => {
  return (
    <Wrapper fill={fill}>
      <AnimatedImg>
        <img src={logo} alt="loading-icon" />
      </AnimatedImg>
    </Wrapper>
  );
};

export default LocalLoader;
