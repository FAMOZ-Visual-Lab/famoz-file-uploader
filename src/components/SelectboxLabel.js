import React from "react";
import styled from "styled-components";
import Icon_ from "@material-ui/core/Icon";

const Wrapper = styled.div`
  width: 100%;
  height: 4rem;
`;

const Icon = styled(Icon_)`
  color: #fbd44b !important;
  font-size: 2rem !important;
  display: flex;
  align-items: center;
  width: 3rem;
  float: left;
  margin-right: 1rem;
`;

const LabelComponent = ({ children, icon }) => (
  <Wrapper>
    <Icon>folder</Icon>
    <span>{children}</span>
  </Wrapper>
);

export default LabelComponent;
