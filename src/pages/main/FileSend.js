import React, { Component, Fragment } from "react";

import FileUpload from "../../components/FileUpload";

class FileSend extends Component {
  state = {
    file: []
  };
  selectType = "";
  ipcRenderer;

  componentDidMount = () => {
    this.ipcRenderer = window.require("electron").ipcRenderer;
  };

  renderFileUploads = datas => {
    return datas.map((dt, i) => {
      return (
        <FileUpload
          key={i}
          id={dt.id}
          subtitle={dt.subtitle}
          value={this.state.file}
          onClick={e => this.onClickFile(e)}
          onChange={e => this.onChangeFile(e)}
          onDrop={e => this.onDrop(e, dt.id)}
        />
      );
    });
  };

  onChangeFile = datas => {
    if (this.selectType) {
      this.ipcRenderer.send("popup_open", this.selectType);
      this.selectType = "";
    }
  };

  onDrop = async (datas, id) => {
    if (!datas) return;
    this.selectType = id;

    let pathArr = [];
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      pathArr.push(data.path);
    }
    await this.ipcRenderer.send("on_dragstart", pathArr);
    this.ipcRenderer.send("popup_open", this.selectType);
    this.selectType = "";
  };

  onClickFile = (id, type) => {
    this.selectType = id;
    this.ipcRenderer.send("open_file_select");
  };

  render() {
    const files = [
      { subtitle: "빠른 업로드 (프로젝트)", id: "project" },
      { subtitle: "빠른 업로드 (오늘 날짜)", id: "date" }
    ];
    return <Fragment>{this.renderFileUploads(files)}</Fragment>;
  }
}
export default FileSend;
