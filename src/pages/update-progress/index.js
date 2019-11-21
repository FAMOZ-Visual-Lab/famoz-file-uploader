import React, { Component } from "react";
import styled from "styled-components";

import LoadingStauts from "../../components/LoadingStauts";
import Header from "../../system/Header/Header";

const ipcRenderer = window.require("electron").ipcRenderer;

const ExLoadingStauts = styled(LoadingStauts)`
  border: none;
  height: 100%;
`;

class UpdateProgress extends Component {
  state = {
    progress: 0
  };

  componentDidMount() {
    ipcRenderer.on("update_progress_percent", (e, args) => {
      this.setState({ progress: args });
    });
  }

  render() {
    const { progress } = this.state;

    return (
      <ExLoadingStauts
        percent={progress}
        id={"파모즈 파일 관리자 업데이트 진행률"}
      />
    );
  }
}

export default UpdateProgress;
