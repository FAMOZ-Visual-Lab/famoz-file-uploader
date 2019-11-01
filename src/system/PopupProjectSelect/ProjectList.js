import React, { Component } from "react";
import styled from "styled-components";
import Icon_ from "@material-ui/core/Icon";

const Icon = styled(Icon_)`
  color: #fbd44b !important;
  font-size: 3rem !important;
  margin: 0 2rem;
`;

const ListItem = styled.div`
  width: 98%;
  height: 5rem;
  box-sizing: border-box;
  transition: all 0.2s;
  margin: 1rem auto;
  display: flex;
  border: ${props =>
    props.select && props.select === props.path
      ? `1px solid ${props.theme.mainColor}`
      : "1px solid lightgray"};
  align-items: center;
  &:hover {
    cursor: pointer;
    margin-bottom: 1rem;
    box-shadow: 0 0px 4px 0 rgba(0, 0, 0, 0.2);
  }
`;

const NoResult = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default class ProjectList extends Component {
  renderProjectList = datas => {
    console.log(this.props.selectProject);
    if (!datas) return;

    let result = [];
    datas.map((data, key) => {
      if (data.isdir) {
        result.push(
          <ListItem
            key={key}
            select={
              this.props.selectProject ? this.props.selectProject.path : false
            }
            onDoubleClick={() => this.props.handleListDoubleClick(data.path)}
            path={data.path}
            onClick={() => this.props.setStateHandler("selectProject", data)}
          >
            <Icon>folder</Icon>
            {data.name}
          </ListItem>
        );
      }
      return false;
    });

    if (result.length === 0) {
      return <NoResult>현재 등록된 폴더가 없습니다.</NoResult>;
    } else {
      return result;
    }
  };

  render() {
    return (
      <React.Fragment>
        {this.renderProjectList(this.props.project)}
      </React.Fragment>
    );
  }
}
