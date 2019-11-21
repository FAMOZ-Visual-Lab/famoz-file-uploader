import React, { Component } from "react";
import styled from "styled-components";
import LoadingBar from "./LoadingBar";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  border: 1px solid lightgray;
  box-sizing: border-box;
  border-radius: 1rem;
  background-color: white;
  margin: 1rem 0;
  padding: 1rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-y: hidden;
  overflow-x: hidden;
`;

const Title = styled.p`
  font-size: 1.6rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-y: hidden;
  overflow-x: hidden;
`;

const LoadingBarWrapper = styled(LoadingBar)`
  margin: 0.5rem 0;
`;

export default class LoadingStauts extends Component {
  render() {
    const { className, percent, id } = this.props;

    return (
      <Wrapper className={className}>
        <Title>{id}</Title>
        <LoadingBarWrapper percent={percent} />
      </Wrapper>
    );
  }
}
