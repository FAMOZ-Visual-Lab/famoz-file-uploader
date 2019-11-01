import React, { Component } from "react";
import styled from "styled-components";
import Icon_ from "@material-ui/core/Icon";

const FolderIcon = styled(Icon_)`
  color: #fbd44b !important;
  font-size: 3rem !important;
`;

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  height: 10rem;
  margin: 2.25rem 0;
`;

const FlexWrapper = styled.div`
  width: 100%;
  height: auto;
`;

const Input = styled.input`
  width: 100%;
  position: absolute;
  z-index: 5;
  background-color: transparent;
  height: 100%;
  box-sizing: border-box;
  opacity: 0;
  cursor: pointer;
`;

const ViewInput = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 0;
  text-align: center;
  display: flex;
  align-items: center;
  border: ${props =>
    props.drag === true
      ? `3px dashed ${props.theme.mainColor}`
      : `3px dashed ${props.theme.subColor}`};
`;

const Title = styled.p`
  font-size: 2.3rem;
  font-weight: bold;
`;

const SubTitle = styled.p`
  font-size: 1.7rem;
  margin-top: 1rem;
`;

const OpenDir = styled.div`
  width: 4rem;
  height: 4rem;
  background-color: white;
  position: absolute;
  right: 0.6rem;
  top: 1rem;
  z-index: 10;
  cursor: pointer;
  border-radius: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: white;
    box-shadow: 0 0px 4px 0 rgba(0, 0, 0, 0.7);
  }
`;

export default class FileUpload extends Component {
  state = {
    dragging: false
  };

  ipcRenderer;

  componentDidMount() {
    this.ipcRenderer = window.require("electron").ipcRenderer;
    this.ipcRenderer.on("open_file_select_res", (event, arg) => {
      if (arg >= 1) {
        this.props.onChange(arg);
      }
    });
  }

  onChange = e => {
    if (this.state.dragging) {
      this.props.onDrop(e.target.files);
      this.setState({ dragging: false });
    } else {
      e.preventDefault();
      this.props.onChange(e.target.files);
    }
  };

  onDragOver = e => {
    if (!this.state.dragging) {
      this.setState({ dragging: true });
    }
  };

  setStateHandler = (name, value) => {
    this.setState({ [name]: value });
  };

  onClickPrevenEvent = async e => {
    e.preventDefault();
    this.props.onClick(this.props.id);
  };

  onClickFolderOpen = () => {
    const path = this.capitalizeFirstLetter(this.props.id);
    this.ipcRenderer.send("open_exlpore", path);
  };

  capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  render() {
    const { value, subtitle } = this.props;
    const { onChange, onDragOver, setStateHandler } = this;
    return (
      <Wrapper>
        <Input
          type="file"
          value={value}
          onChange={e => onChange(e)}
          onDragOver={e => onDragOver(e)}
          onDragLeave={e => setStateHandler("dragging", false)}
          multiple
          draggable
          onClick={e => this.onClickPrevenEvent(e)}
        />
        <ViewInput drag={this.state.dragging}>
          <FlexWrapper>
            <SubTitle>{subtitle}</SubTitle>
            <Title>Drag & Drop</Title>
          </FlexWrapper>
        </ViewInput>
        <OpenDir onClick={this.onClickFolderOpen}>
          <FolderIcon>folder</FolderIcon>
        </OpenDir>
      </Wrapper>
    );
  }
}
