import React from "react";
import styled from "styled-components";
import Button from "../../components/Button";

const PopupButtonWrapper = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  margin: 1rem 0;
`;

const OkButton = styled.div`
  width: calc(50% - 2rem);
  margin-right: 2rem;
  height: 100%;
`;

const CancelButton = styled.div`
  width: calc(50% - 2rem);
  height: 100%;
  margin-left: 2rem;
`;

const PopupButton = ({ onClickButton, okDisabled, innerPopup }) => (
  <PopupButtonWrapper>
    <OkButton>
      <Button disabled={okDisabled} onClick={() => onClickButton(true)}>
        {!innerPopup ? "선택" : "확인"}
      </Button>
    </OkButton>
    <CancelButton>
      <Button onClick={() => onClickButton(false)}>취소</Button>
    </CancelButton>
  </PopupButtonWrapper>
);

export default PopupButton;
