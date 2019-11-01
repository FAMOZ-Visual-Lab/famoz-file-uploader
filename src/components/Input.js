import React from "react";
import styled from "styled-components";

const InputWrapper = styled.input`
  width: 100%;
  height: 100%;
  text-align: left;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: left;
  box-sizing: border-box;
  padding-left: 1rem;
  margin: 1rem 0;
  color: ${props => props.theme.textColor};
  border: none;
  border-radius: 0.1rem;
  background-color: #00000005;
  transition: all 0.2s;
  box-shadow: 0 0px 4px 0 rgba(0, 0, 0, 0.14);
  font-family: "NanumSquare", "sans-serif";
  font-size: 1.6rem;
  &:focus {
    background-color: #ffffff50;
    box-shadow: 0 0px 4px 0 rgba(0, 0, 0, 0.3);
  }

  &::placeholder {
    opacity: 0.5;
  }
`;

const Input = ({
  value,
  onChange,
  disabled = false,
  type = "text",
  className,
  placeholder,
  onKeyUp
}) => (
  <InputWrapper
    className={className}
    value={value}
    placeholder={placeholder || "내용을 입력해주세요."}
    onChange={disabled ? (() => {})() : e => onChange(e.target.value)}
    disabled={disabled}
    type={type}
    onKeyUp={onKeyUp ? e => onKeyUp(e) : (() => {})()}
  />
);

export default Input;
