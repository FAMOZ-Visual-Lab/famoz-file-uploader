import React, { Component } from "react";
import styled, { keyframes } from "styled-components";
import Button from "../../components/Button";
import Checkbox from "./checkbox";
import config from "../../configs/config";
const logoImage = require("../../assets/image/NAS Server Logo.png");

const LoadingWrapper = styled.div`
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(1,1,1,0.5);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  animation: ${rotate360} 1s linear infinite;
  transform: translateZ(0);
  
  border-top: 4px solid #fff;
  border-left: 6px solid #fff;
  border-bottom: 4px solid #fff;
  background: transparent;
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
`;

const Wrapper = styled.div`
    position: fixed;
    padding: 2.5rem;
    left: 50%;
    top: 50%;
    width: 90%;

    transform: translate(-50%, -50%);
    background: white;
    border-radius: 1rem;
    border: 2px #e5e5ef solid;
`;

const TitleImage = styled.img`
    width: 100%;
    height: auto;
    margin-top: 2rem;
    margin-bottom: 2rem;
`;

const CheckPanel = styled.div`
    margin-top: 1.5rem;
    margin-bottom: 1rem;
`;

const MiniLabel = styled.p`
    font-size: 1.2rem;
    margin-bottom: 0.2rem;
`;

const MiniSpanLabel = styled.span`
    font-size: 1.2rem;
    margin-left: 1rem;
    color: #0ed32e;
    justify-content: center;
    vertical-align: middle;
    display: inline-flex;
`;

const WarningLabel = styled.p`
    text-align: center;
    font-size: 1.3rem;
    color: #ff2b7b;
    margin-top: 2rem;
`;

const InputPanel = styled.input`
    width: 100%;
    height: 3rem;
    border-radius: 0.3rem;
    border-width: 1px;
    border-color: #7f8192;
    outline: none;
    padding: 1rem;
    box-sizing: border-box;
    margin-bottom: 2.5rem;

    &:focus {
      border-color: #7b80fc;
      box-shadow: 0 0 0.3rem 0 #7b80fc;
    }
`;

const LoginButton = styled(Button)`
    height: 4rem;
    background-color: #7b80fc;
    &:hover {
        background-color: #989cff;
    }
    margin-top: 1rem;
    margin-bottom: 1rem;
`;


export default class Login extends Component {
  state = {
    id: "",
    pw: "",
    loading: false,
    failLogin: "",
    isTel: false
  };
  ipcRenderer;

  componentDidMount() {
    this.ipcRenderer = window.require("electron").ipcRenderer;

    this.ipcRenderer.on("login_res", (event, res) => {
      if (res.success) {
        if(this.state.isTel) {
          this.props.setServerPathHandler(config.SERVER_PATH_SUB);
        } 
        else {
          this.props.setServerPathHandler(config.SERVER_PATH_MAIN);
        }
        this.props.setStateHandler("isLogin", true);
      } else {
        if(res.type == 0) {
          this.setState({ loading: false, failLogin: true, failMessage: "! 아이디와 비밀번호를 다시 확인해 주세요." });
        }
        else if(res.type == 1) {
          this.setState({ loading: false, failLogin: true, failMessage: "! 재택근무환경을 확인하세요." });
        }
        else {
          this.setState({ loading: false, failLogin: true, failMessage: "! Unknown" });
        }
      }
    });
  }
  
  handleIDChange = (e, target) => {
    if(target == "id") {
      this.setState({ id: e.target.value });
    }
  }

  handlePasswordChange = (e, type) => {
      if(type == "password") {
        this.setState({ pw: e.target.value });
      }
  }

  handlePasswordPassport = (e) => {
    if (e.key === "Enter") {
      this.login();
    }
  }

  handleCheckboxChange = (e) => {
    this.setState({ isTel: e.target.checked }, () => {
      console.log("isTEl : ", this.state.isTel);
    });
  }

  loginFailed = () => {
    if(!this.state.failLogin) {
      return <div />;
    }
    return <WarningLabel>{this.state.failMessage}</WarningLabel>;
  }

  login = () => {
    const query = {
      id: this.state.id,
      pw: this.state.pw,
      isTel: this.state.isTel
    };

    if(this.state.id == "") {          
      this.setState({ failLogin: true, failMessage: "! 아이디를 입력해 주세요." });
      return;
    }
    else if(this.state.pw == "") {
      this.setState({ failLogin: true, failMessage: "! 비밀번호를 입력해 주세요." });
      return;
    }

    this.setState({loading: true}, () => {
        this.ipcRenderer.send("login", query);
    });
  };


  loadingRenderer = () => {
    if(this.state.loading) {
      return <LoadingWrapper><Spinner></Spinner></LoadingWrapper>;
    }
    return <div/>;
  }
  

  render() {
    return (
      <React.Fragment>
        { this.loadingRenderer() }
        <Wrapper>
            <TitleImage src={logoImage} />
            <MiniLabel>ID</MiniLabel>
            <InputPanel type="text" value={this.state.id} autoComplete="off" onChange={ (e) => { this.handleIDChange(e, "id"); }} onKeyPress={(e) => { this.handlePasswordPassport(e); }} maxLength={30} placeholder="ID" autoFocus required />
            <MiniLabel>Password</MiniLabel>
            <InputPanel type="password" value={this.state.pw} autoComplete="off" autoSave="off" onChange={ (e) => { this.handlePasswordChange(e, "password"); }} onKeyPress={(e) => { this.handlePasswordPassport(e); }} placeholder="password" required /> 
            <LoginButton onClick={(e) => { this.login(); }} type="submit">로그인</LoginButton> 
            <CheckPanel>
              <Checkbox checked={this.state.isTel} onChange={this.handleCheckboxChange}/>
              <MiniSpanLabel>※ 재택근무 환경이라면 반드시 체크해 주세요.</MiniSpanLabel>
            </CheckPanel>
            { this.loginFailed() }
        </Wrapper>
      </React.Fragment>
      );    
  }
}
