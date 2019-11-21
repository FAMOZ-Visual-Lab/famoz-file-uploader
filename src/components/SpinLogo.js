import React, { Component } from "react";
import styled, { css } from "styled-components";

import LogoImg from "../assets/image/logo.png";

const FlexOption = `
    display: flex;
    align-items: center;
    justify-content: center;
`;

const LogoWrapper = styled.div`
  height: 100%;
  ${FlexOption};
  transition: all ease 1s;
  position: relative;
  cursor: pointer;
  -webkit-app-region: no-drag;
  ${props =>
    props.isTransform
      ? css`
          opacity: 0.7;
          animation-name: spin;
          animation-duration: 3000ms;
          animation-iteration-count: infinite;
          animation-timing-function: linear;

          &:hover {
            opacity: 1;
          }
        `
      : ""}

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  ::before {
    content: "";
    display: block;
    position: absolute;
    z-index: 1;
    width: 3rem;
    height: 3rem;
    border-radius: 100%;
    background-color: white;
  }
`;

const Logo = styled.img`
  width: 4rem;
  height: 4rem;
  position: absolute;
  z-index: 5;
  opacity: 1;
`;

const SpinLogo = ({ onClickLogo, isSpin, className }) => {
  return (
    <LogoWrapper
      className={className}
      onClick={() => {
        onClickLogo && onClickLogo();
      }}
      isTransform={isSpin}
    >
      <Logo src={LogoImg} alt="파모즈 로고" />
    </LogoWrapper>
  );
};

export default SpinLogo;
