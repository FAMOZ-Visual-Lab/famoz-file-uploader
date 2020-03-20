import React, { Component } from "react";
import styled from "styled-components";
import { inject } from "mobx-react";
import Icon_ from "@material-ui/core/Icon";

const Wrapper = styled.div`
  width: 100%;
  height: 10rem;
  background-color: ${props => props.theme.subColor};
  color: black;
  display: flex;
  align-items: center;
`;

const Content = styled.div`
  width: 100%;
  height: 100%;
  transition: all 0.2s;
  &:hover {
    background-color: ${props => props.theme.textColor};
    opacity: 0.7;
    cursor: pointer;
    > *,
    span {
      color: white !important;
    }
  }

  &:active {
    background-color: ${props => props.theme.textColor};
    opacity: 1;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 70%;
`;

const Icon = styled(Icon_)`
  font-size: 5rem !important;
  color: ${props => props.theme.textColor};
`;

const Label = styled.p`
  width: 100%;
  height: 25%;
  font-size: 1.7rem;
  color: black;
  text-align: center;
`;

@inject(stores => ({
  setIsDefault: stores.main.setIsDefault
}))
class Footer extends Component {
  ipcRenderer;

  componentDidMount() {
    this.ipcRenderer = window.require("electron").ipcRenderer;
  }

  onClickMenu = name => {
    if (name === "folder") {
      this.ipcRenderer.send("open_exlpore");
      return;
    }

    if (name === "search") {
      this.props.setIsDefault(false);
      return;
    }
    
    if (name === "more") {
      this.ipcRenderer.send("update_alert_show_dialog_open");
      return;
    }
  };

  renderMenu = datas => {
    return datas.map((dt, i) => {
      return (
        <Content key={i} onClick={() => this.onClickMenu(dt.id)}>
          <IconWrapper>
            <Icon>{dt.icon}</Icon>
          </IconWrapper>
          <Label>{dt.label}</Label>
        </Content>
      );
    });
  };

  render() {
    const menu = [
      { icon: "folder_open", id: "folder", label: "폴더 열기" },
      { icon: "search", id: "search", label: "탐색" },
      { icon: "more_horiz", id: "more", label: "공지사항" }
    ];
    return <Wrapper>{this.renderMenu(menu)}</Wrapper>;
  }
}

export default Footer;
