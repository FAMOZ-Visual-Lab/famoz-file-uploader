import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  height: 3rem;
  border: 1px solid lightgray;
  box-sizing: border-box;
  background-color: ${props => props.theme.mainColor}50;
  border-radius: 1rem;
  overflow: hidden;
`;

const Progress = styled.div`
  width: ${props => props.width || 0}%;
  height: 100%;
  background: linear-gradient(
    to right,
    skyblue,
    ${props => props.theme.mainColor}
  );
  transition: all 0.4s;
`;

const LoadingBar = ({ percent, className }) => (
  <Wrapper className={className}>
    <Progress width={percent}></Progress>
  </Wrapper>
);

export default LoadingBar;
