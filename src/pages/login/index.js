import React, { Component } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  /* max-width: 60rem; */
  height: 100%;
  width: 100%;
  padding: 3rem;
  box-sizing: border-box;
`;

const flexCenterStyle = `
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`;

const LoginWait = styled.div`
  width: 100%;
  height: 5rem;
  box-sizing: border-box;
  ${flexCenterStyle};
  color: black;
`;

export default class Login extends Component {
  state = {
    id: "admin",
    pw: "famoz1234!@",
    islogin: true
  };

  ipcRenderer;

  componentDidMount() {
    this.ipcRenderer = window.require("electron").ipcRenderer;
    this.login();

    this.ipcRenderer.on("login_res", (event, res) => {
      if (res) {
        this.props.setStateHandler("isLogin", true);
      } else {
        this.setState({ islogin: false });
      }
    });
  }

  login = () => {
    const query = {
      id: this.state.id,
      pw: this.state.pw
    };
    this.ipcRenderer.send("login", query);
  };

  render() {
    return (
      <Wrapper>
        <LoginWait>잠시만 기다려주세요. 데이터를 설정하고 있습니다.</LoginWait>
      </Wrapper>
    );
  }
}
