import React, { Component } from "react";
import { Route, HashRouter, Switch } from "react-router-dom";
import { inject } from "mobx-react";

import PopupProjectSelect from "./../PopupProjectSelect/PopupProjectSelect";
import PopupWrapper from "./../ProgressPopup/PopupWrapper";
import Main from "../../pages/main/index";
import Login from "../../pages/login/index";
import Header from "./../Header/Header";
import UpdateProgress from "../../pages/update-progress";
import UpdateAlert from "../../pages/update-alert";

@inject(stores => ({
  setProgressList: stores.main.setProgressList
}))
class Rotuer extends Component {
  state = {
    popupType: "",
    innerPopup: "",
    innerTrans: "",
    isLogin: false,
  };
  SERVER_PATH = "";
  endAction = "";
  list = [];
  ipcRenderer;

  componentDidMount() {
    this.ipcRenderer = window.require("electron").ipcRenderer;

    this.ipcRenderer.on("popup_res", (event, arg) => {
      console.log(arg);
      this.setState({ popupType: arg });
    });

    this.ipcRenderer.on("open_drivemoumt_popup", (e, arg) => {
      console.log("마운트가 안되어있어요");
      this.endAction = arg[0];
      if (arg[1] != undefined && arg[1] instanceof Array) {
        this.list = arg[1];
      } else {
        this.list = [];
      }
      this.setState({ popupType: "project", innerPopup: "mount_drive" }, () => {
        this.ipcRenderer.send("set_custom_height");
      });
    });

    this.ipcRenderer.on("change_progress", (e, arg) => {
      this.props.setProgressList(arg);
    });
  }

  setStateHandler = (name, value) => {
    this.setState({ [name]: value });
  };
  setServerPathHandler = (path) => {
    this.SERVER_PATH = path;
  }

  renderDisplay = login => {
    const { popupType, progressList } = this.state;

    if (login) {
      if (popupType === "") {
        return (
          <React.Fragment>
            <Header progressList={progressList} />
            <Main />
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment>
            <Header progressList={progressList} />
            <PopupProjectSelect
              type={popupType}
              endAction={this.endAction}
              mountList={this.list}
              innerPopup={this.state.innerPopup}
              setStateHandler={this.setStateHandler}
              SERVER_PATH={this.SERVER_PATH}
            />
          </React.Fragment>
        );
      }
    } else {
      return <Login setStateHandler={this.setStateHandler} setServerPathHandler={this.setServerPathHandler} />;
    }
  };

  render() {
    const { isLogin } = this.state;
    return (
      <HashRouter>
        <Switch>
          <Route path="/update-alert" render={props => <UpdateAlert />} />
          <Route path="/update-progress" render={props => <UpdateProgress />} />
          <Route path="/progress" render={props => <PopupWrapper />} />
          <Route path="/" render={props => this.renderDisplay(isLogin)} />
        </Switch>
      </HashRouter>
    );
  }
}

export default Rotuer;
