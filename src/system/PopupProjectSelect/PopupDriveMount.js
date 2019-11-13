import React, { Component } from "react";
// import styled from "styled-components";
import alphabet from "alphabet";
import { Select, MenuItem } from "@material-ui/core";

export default class PopupDriveMount extends Component {
  state = {
    mountFolder: "",
    selectFolder: []
  };

  componentDidMount() {
    let result = [];
    const alphabet_ = alphabet.upper;
    const mountList = this.props.mountList;
    for (let item of alphabet_) {

      // 조건. mountList로 넘어온 친구 목록에 있는 드라이브 제외
      if(Array.from(mountList).includes(item)) {
        continue;
      }

      result.push({
        id: item,
        label: `${item} 드라이브`
      });
    }
    this.setState({ selectFolder: result });
  }

  onHandleChange = e => {
    const value = e.target.value;
    console.log(value);
    this.props.onChangeMountFolder(value);
    this.setState({ mountFolder: value });
  };

  renderItem = datas => {
    if (!datas) return;
    return datas.map((dt, i) => {
      return (
        <MenuItem key={i} style={{ fontSize: "1.7rem" }} value={dt.id}>
          {dt.label}
        </MenuItem>
      );
    });
  };

  render() {
    return (
      <Select
        value={this.state.mountFolder}
        onChange={e => this.onHandleChange(e)}
        style={{ width: "100%", fontSize: "1.7rem" }}
      >
        {this.renderItem(this.state.selectFolder)}
      </Select>
    );
  }
}
