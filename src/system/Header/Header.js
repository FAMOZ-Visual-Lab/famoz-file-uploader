import React, { Component } from "react";
import styled, { css } from "styled-components";
import Icon_ from "@material-ui/core/Icon";
import LogoImg from "../../assets/image/logo.png";
import { inject } from "mobx-react";
import { toJS } from "mobx";

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

const LogoWrapper = styled.div`
  width: 15%;
  height: 100%;
  ${FlexOption};
  transition: all ease 1s;
  position: relative;
  cursor: pointer;
  -webkit-app-region: no-drag;
  ${props =>
    props.isTransform
      ? css`
          opacity: 0.7;
          animation-name: spin;
          animation-duration: 3000ms;
          animation-iteration-count: infinite;
          animation-timing-function: linear;

          &:hover {
            opacity: 1;
          }
        `
      : ""}

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  ::before {
    content: "";
    display: block;
    position: absolute;
    z-index: 1;
    width: 3rem;
    height: 3rem;
    border-radius: 100%;
    background-color: white;
  }
`;

const Logo = styled.img`
  width: 4rem;
  height: 4rem;
  position: absolute;
  z-index: 5;
  opacity: 1;
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
    this.ipcRenderer.send("open_progress");
  };

  render() {
    return (
      <Wrapper>
        <LogoWrapper
          onClick={this.onClickLogo}
          isTransform={this.isTransform(this.props.progressList)}
        >
          <Logo src={LogoImg} alt="파모즈 로고" />
        </LogoWrapper>
        <TitleWrapper>
          <FlexWrapper>
            <Title>파모즈 파일 관리자22</Title>
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
