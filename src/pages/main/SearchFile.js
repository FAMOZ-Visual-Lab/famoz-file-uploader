import React, { useState, useEffect, Fragment } from "react";
import styled, { css } from "styled-components";
import _Icon from "@material-ui/core/Icon";
import _Tooltip from "@material-ui/core/Tooltip";

import _Input from "../../components/Input";
import FoldrListItem from "./FolderListItem";
import { inject } from "mobx-react";

const ipcRenderer = window.require("electron").ipcRenderer;

const flexStyle = css`
  display: flex;
  align-items: center;
`;

const Tooltip = styled(_Tooltip)`
  font-size: 1.6rem !important;
`;

const Icon = styled(_Icon)`
  font-size: 2rem !important;
  width: 10% !important;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    transform: translateX(-0.2rem);
  }
`;

const HeaderContainer = styled.div`
  ${flexStyle};
`;

const ListContainer = styled.ul`
  width: 100%;
  height: calc(100% - 6rem);
  overflow-y: auto;
`;

const Input = styled(_Input)`
  width: 90%;
`;

const NoResult = styled.div`
  ${flexStyle};
  justify-content: center;

  height: 100%;
  width: 100%;
`;

const SearchFile = props => {
  const [input, setInput] = useState("");
  const [projects, setProject] = useState([]);
  const [filterProjects, setFilterProjects] = useState(projects);

  useEffect(() => {
    console.log("나 몇번 생긴거야?");
    ipcRenderer.send("get_project_list", "/sv/Project");

    ipcRenderer.on("res_project_list", (e, arg) => {
      console.log(arg);
      const data = arg.map(data => data.isdir && data.name);
      console.log(data);
      setProject(data);
    });
  }, []);

  const filterData = _input => {
    const _projects = projects.filter(data => data.match(_input));

    setFilterProjects(_projects);
  };

  const handleInputChange = e => {
    setInput(e);
    filterData(e);
    renderList();
  };

  const handleBackButtonClick = () => {
    const { setIsDefault } = props;

    setIsDefault(true);
  };

  const renderList = () => {
    let datas;

    if (input) datas = filterProjects;
    else datas = projects;

    if (datas.length > 0)
      return datas.map((data, key) => <FoldrListItem label={data} key={key} />);
    else return <NoResult>현재 등록된 프로젝트가 없습니다.</NoResult>;
  };

  return (
    <Fragment>
      <HeaderContainer>
        <Icon onClick={handleBackButtonClick}>arrow_back</Icon>
        <Input value={input} onChange={handleInputChange} />
      </HeaderContainer>

      <ListContainer>{renderList()}</ListContainer>
    </Fragment>
  );
};

export default inject(stores => ({
  setIsDefault: stores.main.setIsDefault
}))(SearchFile);
