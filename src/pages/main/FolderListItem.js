import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Icon_ from "@material-ui/core/Icon";

import { SERVER_FOLDER_PATH } from "../../configs/config";

const ipcRenderer = window.require("electron").ipcRenderer;

const Container = styled.li`
  width: 100%;
  height: 3rem;
  line-height: 3rem;
  box-sizing: border-box;
  margin: 0.5rem 0;
  padding-left: 1rem;
  border: 1px solid lightgray;
  position: relative;
  /* display: flex; */
  align-items: center;
  padding-right: 4rem;
  white-space: nowrap;
  overflow: hidden;
  word-break: break-all;
  text-overflow: ellipsis;
  border-radius: 0.3rem;
`;

const Icon = styled(Icon_)`
  color: #fbd44b !important;
  font-size: 2.5rem !important;
  position: absolute;
  cursor: pointer;
  right: 1rem;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.2);
  }
`;

const FoldrListItem = ({ label }) => {
  const handleOpenFolderClick = () => {
    const path = `${SERVER_FOLDER_PATH.PROJECT}\\${label}`;
    ipcRenderer.send("open_exlpore", path);
  };

  return (
    <Container>
      {label}
      <Icon onClick={handleOpenFolderClick}>folder</Icon>
    </Container>
  );
};

export default FoldrListItem;
