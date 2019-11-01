import React, { Component } from "react";
import styled from "styled-components";
import _ from "lodash";
import Icon_ from "@material-ui/core/Icon";

const Wrapper = styled.div`
  width: 100%;
  margin: 0.5rem 0;
`;

const Path = styled.span`
  font-size: 1.8rem;
  text-align: left;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &::after {
    content: ">";
    display: inline-block;
    font-size: 1.5rem;
    margin: 0 1rem;
  }

  &:last-child {
    font-weight: bold;
    &::after {
      display: none;
    }
  }
`;

const Icon = styled(Icon_)`
  color: #fbd44b !important;
  font-size: 2rem !important;
  display: flex;
  align-items: center;
  width: 3rem;
  float: left;
  margin-right: 1rem;
`;

class FolderLocation extends Component {
  state = {
    path: []
  };
  componentDidMount() {
    this.setPathInit(this.props);
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.path !== nextProps.path) this.setPathInit(nextProps);
  };

  setPathInit = datas => {
    if (!datas) return;
    const { type } = datas;

    let path = _.cloneDeep(datas.path);

    if (path.match("/")) {
      if (type === "date") {
        path = path.slice(path.indexOf("Date/") + 5, path.length);
      } else if (type === "project") {
        path = path.slice(path.indexOf("sv/") + 3, path.length);
      } else if (type === "send") {
        path = path.slice(path.indexOf("User/") + 5, path.length);
      }
    }

    path = path.split("/");
    path.splice(path.length - 1, 1);

    this.setState({ path: path });
  };

  onClick = i => {
    const { type } = this.props;
    if (type === "date") {
      i = i + 4;
    } else if (type === "project") {
      i = i + 3;
    } else if (type === "send") {
      i = i + 4;
    }
    let path = _.cloneDeep(this.props.path).split("/");
    path = path.slice(0, i);
    path = path.join("/");

    this.props.onClick(path);
  };

  render() {
    return (
      <Wrapper>
        <Icon>folder</Icon>
        {this.state.path.map((data, i) => {
          // 초기값은 맨 끝 배열을 사용하지 않음
          return (
            <Path key={i} onClick={() => this.onClick(i)}>
              {data}
            </Path>
          );
        })}
      </Wrapper>
    );
  }
}

export default FolderLocation;
