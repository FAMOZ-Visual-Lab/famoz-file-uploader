import React, { Component } from "react";
import theme from "./utils/theme";
import styled, { ThemeProvider } from "styled-components";
import GlobalStyle from "./utils/globalStyle";
import Rotuer from "./system/Rotuer/Rotuer";

const Wrapper = styled.div`
  box-sizing: border-box;
  color: ${props => props.theme.textColor};
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: white;
  border: 1px solid lightgray;
  overflow: hidden;
`;

export default class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Wrapper>
          <GlobalStyle />
          <Rotuer />
        </Wrapper>
      </ThemeProvider>
    );
  }
}
