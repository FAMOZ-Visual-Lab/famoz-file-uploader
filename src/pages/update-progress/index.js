import React, { Component } from "react";
import styled from "styled-components";

import LoadingStauts from "../../components/LoadingStauts";
import Header from "../../system/Header/Header";

const ipcRenderer = window.require("electron").ipcRenderer;

const Container = styled.div`
  width: 100%;
`;

class UpdateProgress extends Component {
  state = {
    progress: 0
  };

  componentDidMount() {
    ipcRenderer.on("update_progress_percent", (e, args) => {
      console.log("업데이트 프로그레스 : ", args);
      this.setState({ progress: args });
    });
  }

  render() {
    const { progress } = this.state;

    return (
      <Container>
        <Header disabled />
        <LoadingStauts percent={progress} id={"업데이트 진행률"} />
      </Container>
    );
  }
}

export default UpdateProgress;
