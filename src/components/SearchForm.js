import React, { useState } from "react";
import styled, { css } from "styled-components";

import _Input from "./Input";
import _Button from "./Button";

const flexStyle = css`
  display: flex;
  align-items: center;
`;

const Container = styled.div`
  ${flexStyle};
  width: 100%;
`;

const Input = styled(_Input)`
  width: 100%;
`;

const Button = styled(_Button)`
  max-width: 3rem;
  min-width: 3rem !important;
`;

const SearchForm = ({ onButtonClick, onInputChange, value, placeholder }) => {
  return (
    <Container>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => onInputChange(e)}
      />
      <Button onClick={onButtonClick} />
    </Container>
  );
};

export default SearchForm;
