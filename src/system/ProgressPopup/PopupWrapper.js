import React, { Component } from "react";
import PopupInnerStatus from "./PopupInnerStatus";
import Button from "../../components/Button";
import styled from "styled-components";
import { toJS } from "mobx";
import { inject } from "mobx-react";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 2rem;
  box-sizing: border-box;
`;

const Title = styled.p`
  font-size: 2.1rem;
  text-align: left;
  font-weight: bold;
`;

const InnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const ExtendButton = styled(Button)`
  width: 100%;
  height: 5rem;
`;

@inject(stores => ({
  progressList: toJS(stores.main.progressList)
}))
class PopupWrapper extends Component {
  ipcRenderer;

  componentDidMount() {
    this.ipcRenderer = window.require("electron").ipcRenderer;
  }

  onClickClose = () => {
    this.ipcRenderer.send("close_progress");
  };

  render() {
    return (
      <Wrapper>
        <Title>업로드중인 파일 목록</Title>
        <InnerWrapper>
          <PopupInnerStatus progressList={this.props.progressList} />
        </InnerWrapper>
        <ExtendButton onClick={this.onClickClose}>닫기</ExtendButton>
      </Wrapper>
    );
  }
}
export default PopupWrapper;
