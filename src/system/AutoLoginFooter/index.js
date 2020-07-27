import React, { Component } from "react";
import styled from "styled-components";
import { inject } from "mobx-react";
import Checkbox from "../../components/checkbox";

const CheckPanel = styled.div`
    background-color: ${props => props.theme.subColor};
    display: flex;
    width: 100%;
    height: 3rem;
    padding-left: 1rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
`;

const MiniSpanLabel = styled.span`
    font-size: 1.2rem;
    margin-left: 1rem;
    color: #ff2275;
    justify-content: center;
    vertical-align: middle;
    display: inline-flex;
`;



@inject(stores => ({
  setIsDefault: stores.main.setIsDefault
}))
class AutoLoginFooter extends Component {
  state = {
    autoLogin: false
  }

  componentDidMount() {
    this.settingAutoLogin();
  }

  settingAutoLogin = () => {
    const autoLogin = localStorage.getItem("_FAMOZ_AUTO_LOGIN_");    
    if(autoLogin != undefined && autoLogin == "START") {
      this.setState({ autoLogin: true });
    }
    else {
      this.setState({ autoLogin: false });
    }
  }
  
  handleCheckboxChange = (e) => {
    this.setState({ autoLogin: e.target.checked }, () => {
    console.log("autoLogin : ", this.state.autoLogin);
      if(this.state.autoLogin) {
        localStorage.setItem("_FAMOZ_AUTO_LOGIN_", "START");
        this.settingAutoLogin();
      }
      else {
        localStorage.removeItem("_FAMOZ_AUTO_LOGIN_");
        this.settingAutoLogin();
      }
      console.log("localStorage.setItem(_FAMOZ_AUTO_LOGIN_) : ", localStorage.getItem("_FAMOZ_AUTO_LOGIN_"));
    });
  }


  render() {
    return (
      <React.Fragment>
        <CheckPanel>
            <Checkbox checked={this.state.autoLogin} onChange={this.handleCheckboxChange}/>
            <MiniSpanLabel>※ 자동 로그인을 적용하려면 체크해 주세요.</MiniSpanLabel>
        </CheckPanel>
      </React.Fragment>
    );
  }
}

export default AutoLoginFooter;
