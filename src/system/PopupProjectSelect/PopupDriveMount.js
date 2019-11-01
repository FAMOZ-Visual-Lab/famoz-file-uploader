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
    for (let item of alphabet_) {
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
        <MenuItem style={{ fontSize: "1.7rem" }} value={dt.id}>
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
