import React from "react";
import styled from "styled-components";

const ButtonWrapper = styled.div`
  width: 100%;
  height: 5rem;
  box-sizing: border-box;
  transition: all 0.2s;
  border-radius: 0.5rem;
  background-color: ${props => props.theme.successColor || props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    border: 1px solid lightgray;
    box-sizing: border-box;
    background-color: transparent;
    color: ${props => props.theme.textColor};
  }

  &:hover {
    opacity: 0.9;
  }
`;

const Button = ({ onClick, disabled = false, className, children, color }) => (
  <ButtonWrapper
    onClick={disabled ? (() => {})() : e => onClick(e.target.value)}
    disabled={disabled}
    className={className}
    color={color}
  >
    {children}
  </ButtonWrapper>
);

export default Button;
