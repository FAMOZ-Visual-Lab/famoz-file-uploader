import React, { Component } from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";

import Button from "./../../components/Button";
import SpinLogo from "../../components/SpinLogo";

const moment = require("moment");

const ipcRenderer = window.require("electron").ipcRenderer;

const Container = styled.div`
  width: 100%;
  height: auto;
  padding: 1rem;
  box-sizing: border-box;
`;

const Title = styled.p`
  font-size: 2.3rem;
  font-weight: bold;
  text-align: center;
  margin: 1rem 0;
  margin-bottom: 2rem;
`;

const Label = styled.p`
  font-size: 1.8rem;
  margin: 1rem 0;
`;

const Contents = styled.div`
  border-top: 0.1rem solid lightgray;
  margin: 1rem 0;
  padding: 1rem 0;
  box-sizing: border-box;
  height: 30rem;
  overflow-y: auto;
  > * {
    font-size: 1.8rem;
    line-height: 2rem;
  }

  ol,
  ul {
    list-style-type: disc;
    margin: 1rem 0;
    li {
      padding-left: 1rem;
      box-sizing: border-box;
      list-style-type: disc;
    }
    p {
      font-weight: bold;
      font-size: 1.8rem;
      line-height: 2rem;
    }
  }
`;

const WaitText = styled.div`
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  text-align: center;
  line-height: 3rem;
`;

const ExSpinLogo = styled(SpinLogo)`
  position: absolute;
  top: -8rem;
  left: 0;
  right: 0;
`;

const FlexContainer = styled.div`
  margin: 1rem 0;
  position: relative;
`;

class UpdateAlert extends Component {
  state = {
    updateInfo: null
  };
  componentDidMount() {
    ipcRenderer.on("update_alert_data", (e, release) => {
      this.setState({ updateInfo: release });
    });

    ipcRenderer.send("update_alert_show");
  }

  handleClickApplyButton = () => {
    ipcRenderer.send("set_custom_height", 100);
  };

  render() {
    const { updateInfo } = this.state;

    if (!updateInfo) {
      return (
        <Container>
          <WaitText>
            <FlexContainer>
              <ExSpinLogo isSpin={true} />
              <Label>
                잠시만 기다려주세요. <br />
                업데이트 정보를 가져오고 있습니다.
              </Label>
            </FlexContainer>
          </WaitText>
        </Container>
      );
    } else {
      return (
        <Container>
          <Title>파모즈 파일 관리자 업데이트 내역</Title>
          <Label>{updateInfo.releaseName}</Label>
          <Label>
            업데이트 날짜:
            {moment(updateInfo.releaseDate).format("YYYY-MM-DD HH:mm:ss")}
          </Label>
          <Contents
            dangerouslySetInnerHTML={{
              __html: updateInfo.releaseNotes
            }}
          />
          <NavLink to={"/"}>
            <Button onClick={this.handleClickApplyButton}>확인</Button>
          </NavLink>
        </Container>
      );
    }
  }
}

export default UpdateAlert;
