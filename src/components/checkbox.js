import React, { Component } from "react";
import styled from "styled-components";

const CheckboxContainer = styled.div`
  display: inline-flex;
  vertical-align: middle;
`;

const Icon = styled.svg`
  fill: none;
  stroke: white;
  stroke-width: 2px;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  border: 0;
  /* clip: rect(0 0 0 0); */
  width: 1.3rem;
  height: 1.3rem;
  opacity: 0;
  margin: 0;
  padding: 0;
  position: absolute;
  white-space: nowrap;
`;

const StyledCheckbox = styled.div`
  width: 1.3rem;
  height: 1.3rem;
  background: ${props => (props.checked ? "#929fb0" : "#b4b4b5")};
  border-radius: 0.2rem;
  transition: all 150ms;

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px pink;
  }

  ${Icon} {
    visibility: ${props => (props.checked ? "visible" : "hidden")};
  }
`;

// const Checkbox = ({ className, checked, ...props }) => (
// );

export default class Checkbox extends Component {
  render() {
    const { className, checked, handleChange, ...props } = this.props;
    return (
      <CheckboxContainer className={className}>
        <HiddenCheckbox checked={checked} {...props}/>
        <StyledCheckbox checked={checked} >
          <Icon viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </Icon>
        </StyledCheckbox>
      </CheckboxContainer>
    );
  }
}
// export default UpdateAlert;