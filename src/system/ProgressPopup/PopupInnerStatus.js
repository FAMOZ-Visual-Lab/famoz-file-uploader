import React from "react";
import styled from "styled-components";
import LoadingStauts from "../../components/LoadingStauts";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const NoResult = styled.div`
  width: 100%;
  height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
`;

const PopupInnerStatus = ({ progressList }) => {
  if (!progressList || progressList.length === 0) {
    return <NoResult>현재 업로드중인 파일이 없습니다.</NoResult>;
  } else {
    return progressList.map((data, i) => {
      return (
        <Wrapper>
          <LoadingStauts key={i} id={data.id} percent={data.progress} />
        </Wrapper>
      );
    });
  }
};

export default PopupInnerStatus;
