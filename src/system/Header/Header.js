import React, { Component } from "react";
import styled, { css } from "styled-components";
import { inject } from "mobx-react";
import { toJS } from "mobx";
import { Icon as Icon_ } from "@material-ui/core";

import SpinLogo from "./../../components/SpinLogo";

const FlexOption = `
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 7rem;
  background-color: ${props => props.theme.mainColor};
  box-sizing: border-box;
  padding: 1rem 2rem;
  ${FlexOption};
  -webkit-app-region: drag;
`;

const TitleWrapper = styled.div`
  width: 70%;
  height: 100%;
  text-align: center;
  color: white;
  display: flex;
  align-items: center;
`;

const Title = styled.p`
  font-size: 1.8rem;
  font-weight: bold;
  width: 100%;
`;

const SubTitle = styled.p`
  font-size: 1.8rem;
`;

const CloseButtonWrapper = styled.div`
  width: 15%;
  height: 100%;
  ${FlexOption};
  -webkit-app-region: no-drag;
`;

const Icon = styled(Icon_)`
  color: white;
  font-size: 4.6rem !important;
  font-weight: thin;

  transition: all 0.2s;
  &:hover {
    cursor: pointer;
    opacity: 0.5;
  }
`;

const FlexWrapper = styled.div`
  width: 100%;
  height: auto;
`;

const ExSpinLogo = styled(SpinLogo)`
  width: 15%;
`;

@inject(stores => ({
  progressList: toJS(stores.main.progressList)
}))
class Header extends Component {
  ipcRenderer;

  componentDidMount = () => {
    this.ipcRenderer = window.require("electron").ipcRenderer;
  };

  onClickCloseButton = () => {
    this.ipcRenderer.send("closed");
  };

  isTransform = data => {
    if (data && data.length !== 0) {
      return true;
    } else return false;
  };

  onClickLogo = () => {
    const { disabled } = this.props;

    if (disabled) return;
    this.ipcRenderer.send("open_progress");
  };

  render() {
    const { disabled } = this.props;

    return (
      <Wrapper>
        <ExSpinLogo
          onClick={!disabled && this.onClickLogo}
          isSpin={this.isTransform(this.props.progressList)}
        />
        <TitleWrapper>
          <FlexWrapper>
            <Title>파모즈 파일 관리자</Title>
            <SubTitle>Famoz File Manager</SubTitle>
          </FlexWrapper>
        </TitleWrapper>
        <CloseButtonWrapper>
          <Icon onClick={e => this.onClickCloseButton(e)}>close</Icon>
        </CloseButtonWrapper>
      </Wrapper>
    );
  }
}
export default Header;
