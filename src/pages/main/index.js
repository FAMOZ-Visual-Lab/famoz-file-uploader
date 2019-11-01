import React, { Component } from "react";
import styled from "styled-components";
import { inject } from "mobx-react";

import FileSend from "./FileSend";
import SearchFile from "./SearchFile";
import Footer from "../../system/Footer/Footer";

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  box-sizing: border-box;
`;

const ContentsWrapper = styled.div`
  width: 100%;
  height: calc(100% - 17rem);
  overflow: hidden;
  box-sizing: border-box;
  padding: 0rem 1.5rem;
  background-color: white;
`;

@inject(stores => ({
  isDefault: stores.main.isDefault
}))
class Main extends Component {
  ipcRenderer;

  componentDidMount = () => {
    this.ipcRenderer = window.require("electron").ipcRenderer;
  };

  renderPage = () => {
    const { isDefault } = this.props;

    if (isDefault) return <FileSend />;
    else return <SearchFile />;
  };

  render() {
    return (
      <Wrapper>
        <ContentsWrapper>{this.renderPage()}</ContentsWrapper>
        <Footer />
      </Wrapper>
    );
  }
}
export default Main;
