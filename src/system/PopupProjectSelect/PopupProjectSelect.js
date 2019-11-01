import React, { Component } from "react";
import _ from "lodash";
import styled from "styled-components";
import Icon_ from "@material-ui/core/Icon";

import { SERVER_PATH } from "../../configs/config";

import FolderLocation from "./FolderLocation";
import ProjectList from "./ProjectList";
import PopupButton from "./PopupButton";
import Button from "../../components/Button";
import Input from "./../../components/Input";
import PopupDriveMount from "./PopupDriveMount";

const Icon = styled(Icon_)`
  color: #fbd44b !important;
  font-size: 3rem !important;
  margin-right: 2rem;
`;

const moment = require("moment");

const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 7rem);
  background-color: white;
  box-sizing: border-box;
  padding: 2rem;
  color: black;
`;

const Title = styled.div`
  font-size: 2.5rem;
  text-align: left;
  font-weight: bold;
`;

const ScrollWrapper = styled.div`
  width: 100%;
  height: ${props => `calc(100% - ${props.minus}rem)`};
  margin: 1.5rem 0;
  overflow-y: auto;
`;

const Path = styled.div`
  width: 100%;
  margin-bottom: 1rem;
`;

const AddFolderButton = styled(Button)`
  width: 100%;
  background-color: white !important;
  border: 1px solid #fbd44b !important;
  margin: 0 !important;
  box-sizing: border-box;

  &:hover {
    background-color: #fbd44b40 !important;
  }
`;

const Label = styled.span`
  font-size: 1.8rem;
  color: black;
`;

const Warning = styled.p`
  font-size: 1.6rem;
  color: red;
  text-align: left;
  margin: 1.5rem 0;
`;

const Description = styled.p`
  font-size: 1.5rem;
  margin: 1rem 0;
`;

const Buttons = styled.div``;

class PopupProjectSelect extends Component {
  state = {
    project: [],
    selectProject: null,
    initPath: "",
    innerPopup: false,
    newFolderName: "",
    warning: 0,
    selectMountFolderName: ""
    // 0: 경고 없음
    // 1: 이미 있는 값
    // 2: 사용할 수 없는 값
  };

  path = "";
  initPath = "";

  ipcRenderer;
  fs;

  componentDidMount() {
    this.setState({
      innerPopup: this.props.innerPopup
    });
    this.ipcRenderer = window.require("electron").ipcRenderer;
    this.fs = window.require("fs");

    this.ipcRenderer.on("add_project_folder_res", (event, arg) => {
      console.log(
        "나 프로젝트 만들었으니까 칭찬해줘!",
        this.state.newFolderName,
        this.state.innerPopup
      );
      this.ipcRenderer.send("popup_open", "project");
    });

    this.ipcRenderer.on("re_popup_close", (e, arg) => {
      this.props.setStateHandler("popupType", "");
      this.setState({ innerPopup: false }, () => {
        this.props.setStateHandler("innerPopup", false);
      });
    });

    this.ipcRenderer.on("re_popup_open", (e, arg) => {
      console.log("제발 제대로 좀 나와줘", arg);
      let type;
      if (arg === "open_popup_date") {
        type = "date";
      } else {
        type = "project";
      }
      this.setState({ innerPopup: false }, () => {
        this.props.setStateHandler("innerPopup", false);
      });
      this.props.setStateHandler("popupType", type);
      this.ipcRenderer.send("popup_open", type);
    });

    this.ipcRenderer.on("popup_open_res", async (event, arg) => {
      if (arg) {
        console.log(arg);
        let files;
        if (arg && arg.length >= 1) {
          files = arg[0].files;
          await this.setState({
            newFolderName: arg[1],
            innerPopup: "add_folder"
          });
        } else {
          files = arg.files;
        }
        const { type } = this.props;

        let selectProject_ = _.cloneDeep(this.state.selectProject);
        let default_path = "";
        let projectData;
        let isOneDepth = false;

        if (this.props.type === "project") {
          default_path = "/sv/Project/";
          if (this.path) {
            let path = _.cloneDeep(this.path);

            path = path.slice(path.indexOf("/sv/") + 4).split("/");
            path = path.filter(data => data !== "");

            if (path.length === 1) {
              isOneDepth = true;
            }
          }

          if (!this.path || isOneDepth) {
            let path = default_path;
            path = path.slice(path.indexOf("/sv/") + 4).split("/");
            path = path.filter(data => data !== "");
            path = path.join("/");
            projectData = await this.isProject(files);
            files = projectData;
            selectProject_ = {
              ...selectProject_,
              path: `/sv/${path}/`
            };
          } else {
            if (selectProject_) {
              let path;
              if (selectProject_.path === this.path) {
                path = selectProject_.path;
              } else {
                path = this.path;
              }
              path = path.slice(path.indexOf("/sv/") + 4).split("/");
              path = path.filter(data => data !== "");
              path = path.join("/");

              selectProject_ = {
                ...selectProject_,
                path: `/sv/${path}/`
              };
            }
          }

          console.log(this.state.innerPopup);
          if (this.state.innerPopup === "add_folder") {
            let project_path = `${default_path}${this.state.newFolderName}`;
            selectProject_ = {
              path: project_path
            };
          }

          if (!selectProject_) {
            selectProject_ = {
              path: default_path
            };
          }

          console.log("this.path", this.path);
          console.log("selectProject_", selectProject_);
          console.log("this.state.innerPopup", this.state.innerPopup);
          console.log("isOneDepth", isOneDepth);
          console.log("최종 selepr", selectProject_);

          this.setState(
            {
              project: files,
              selectProject: selectProject_,
              innerPopup: false
            },
            () => {
              this.props.setStateHandler("innerPopup", false);
            }
          );
        } else {
          if (this.path) {
            files.map(data => {
              if (data.path === this.path) selectProject_ = data;
              return data;
            });
          }
          if (type === "date") {
            default_path = `/sv/Date/${moment(new Date()).format("YYYYMMDD")}/`;
          } else if (type === "project") {
          } else if (type === "send") {
            default_path = "/sv/User/";
          }

          if (
            this.state.innerPopup !== "add_folder" &&
            this.props.type !== "project"
          ) {
            if (selectProject_ && selectProject_.path === this.initPath) {
              // 1depth 폴더일 때
              selectProject_ = {
                path: default_path
              };
            } else if (selectProject_ && files) {
              // 선택 후 폴더가 있거나 없을때
              selectProject_ = {
                ...selectProject_,
                path: `${this.path}/`
              };
            } else if (!selectProject_ && this.initPath === "") {
              this.initPath = default_path;
              selectProject_ = {
                path: default_path
              };
              // 아예 선택된 폴더가 없을때 (완전 초기)
            }
          }

          this.setState({
            project: files,
            selectProject: selectProject_ || null
          });
        }
      }
    });
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.innerPopup !== nextProps.innerPopup) {
      this.setState({ innerPopup: nextProps.innerPopup });
    }
  };
  setStateHandler = (name, value) => {
    this.setState({ [name]: value });
  };

  isProject = async data => {
    const proejctArray = ["Pre-Production", "Production", "Post-Production"];
    console.log(data);
    if (!data) return;
    console.log(data);
    const returnData = await data
      .filter(f_data => f_data.isdir)
      .map(item => {
        let result = [];
        const path = String(item.path).replace(/\//gi, "\\");
        const pathname = `${SERVER_PATH}${path}`;
        let filelist;
        try {
          filelist = this.fs.readdirSync(pathname);
        } catch (e) {
          console.log(e);
        }

        if (!filelist) {
          return false;
        } else {
          if (filelist && filelist.length >= 3) {
            const inner = filelist;
            result = inner.filter(it => proejctArray.includes(it));
            if (result.length === 3) return item;
            else return false;
          } else return false;
        }
      })
      .filter(r_data => r_data !== false);

    return returnData;
  };

  onClickButton = bool => {
    console.log(this.state.innerPopup);
    if (this.state.innerPopup === "add_folder") {
      if (bool) {
        this.ipcRenderer.send("add_project_folder", this.state.newFolderName);
      } else {
        this.setState({ innerPopup: false }, () => {
          this.props.setStateHandler("innerPopup", false);
          this.ipcRenderer.send("set_popup_display");
        });
      }
      return;
    } else if (this.state.innerPopup === "mount_drive") {
      if (bool) {
        console.log("보내기 전 select: ", this.state.selectProject);
        this.ipcRenderer.send("mount_drive", [
          this.state.selectMountFolderName,
          this.props.endAction
        ]);
      } else {
        this.ipcRenderer.send("popup_close", false);
        this.props.setStateHandler("popupType", "");
        this.setState({ innerPopup: false }, () => {
          this.props.setStateHandler("innerPopup", false);
        });
      }
      return;
    }

    this.props.setStateHandler("popupType", "");
    if (bool) {
      console.log(this.state.selectProject);
      if (!this.state.selectProject) {
        return;
      }
      let path = this.state.selectProject.path;
      const arrayPath = this.state.selectProject.path.split("/");
      if (arrayPath[arrayPath.length - 1] === "") {
        arrayPath.splice(arrayPath.length - 1, 1);
        path = arrayPath.join("/");
      }
      this.ipcRenderer.send("popup_close", [true, path, null]);
    } else {
      this.ipcRenderer.send("popup_close", false);
    }
  };

  handleListDoubleClick = async path => {
    this.onClickPath(path);
  };

  onClickPath = path => {
    this.ipcRenderer.send("select_path", path);
    this.path = path;
  };

  onClickAddFolderButton = () => {
    this.setState({ innerPopup: "add_folder", newFolderName: "" }, () => {
      this.ipcRenderer.send("set_cumstom_height");
    });
  };

  onChangeFolderName = e => {
    // warning: 1: 중복, 2: 특수문자 안됨
    const diableList = ["\\", ":", "*", "?", "<", ">", "|", "/"];
    const filter_arr = this.state.project.map(data => {
      return data.name;
    });
    let disabled = false;

    if (filter_arr.includes(e)) {
      this.setState({ warning: 1, newFolderName: e });
      return;
    }

    for (let i = 0; i < diableList.length; i++) {
      if (e.includes(diableList[i])) disabled = true;
    }

    if (disabled) {
      this.setState({ warning: 2, newFolderName: e });
      return;
    }
    this.setState({ newFolderName: e, warning: 0 });
  };

  onChangeMountFolder = e => {
    console.log(e);
    this.setState({ selectMountFolderName: e });
  };

  renderPopupContents = name => {
    if (name === "add_folder") {
      return (
        <React.Fragment>
          <Title>새 프로젝트 폴더 추가하기</Title>
          <Input
            onChange={e => this.onChangeFolderName(e)}
            placeholder={"새로 추가할 프로젝트의 이름을 입력해주세요."}
            value={this.state.newFolderName}
          />
          <Warning>{this.renderWarning(this.state.warning)}</Warning>
        </React.Fragment>
      );
    } else if (name === "mount_drive") {
      return (
        <React.Fragment>
          <Title>네트워크 드라이브 연결</Title>
          <Description>
            네트워크 드라이브가 연결되지 않았습니다. 연결할 드라이브를
            선택해주세요.
          </Description>
          <PopupDriveMount
            onChangeMountFolder={e => this.onChangeMountFolder(e)}
          />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <Title>
            {this.props.type === "project" ? "프로젝트" : "업로드 폴더"} 선택
          </Title>
          <Path>
            <FolderLocation
              onClick={e => this.onClickPath(e)}
              type={this.props.type}
              isInit={true}
              path={
                this.state.selectProject
                  ? this.state.selectProject.path
                  : this.initPath
              }
            />
          </Path>
          <ScrollWrapper
            minus={
              this.props.type === "project" &&
              this.isAbleNewProjectFolder(this.state.selectProject)
                ? "20"
                : "14"
            }
          >
            <ProjectList
              project={this.state.project}
              selectProject={this.state.selectProject}
              handleListDoubleClick={this.handleListDoubleClick}
              setStateHandler={this.setStateHandler}
            />
          </ScrollWrapper>
        </React.Fragment>
      );
    }
  };

  isAbleNewProjectFolder = selectProject => {
    if (this.props.type === "project") {
      if (this.state.innerPopup === "add_folder") {
        return false;
      }
      if (selectProject && selectProject !== null) {
        let path = this.path;
        if (path) {
          path = path.slice(path.indexOf("/sv/") + 4).split("/");
          path = path.filter(data => data !== "");
          if (path.length <= 1) {
            return true;
          } else {
            if (this.path !== "") return false;
            else return true;
          }
        } else {
          return true;
        }
      }
    }
  };

  renderWarning = num => {
    if (num === 2)
      return " \\ / : * ? \" < > | 와 같은 특수문자는 사용할 수 없습니다.";
    else if (num === 1) return "이미 등록된 폴더 이름입니다.";
    else return;
  };

  isDisabled = () => {
    if (this.state.innerPopup || this.props.type === "project") {
      if (this.state.innerPopup === "add_folder") {
        if (this.state.warning !== 0) return true;
        if (this.state.newFolderName.length === 0) return true;
        return false;
      } else if (this.state.innerPopup === "mount_drive") {
        if (!this.state.selectMountFolderName) return true;
        else return false;
      } else {
        if (!this.state.selectProject) return true;
        if (this.state.selectProject) {
          console.log(this.state.selectProject);
          let path = this.state.selectProject.path;
          path = path.slice(path.indexOf("/sv/") + 4).split("/");
          path = path.filter(data => data !== "");
          if (path.length <= 2) return true;
        }
        return false;
      }
    }
  };

  isSelectProjectOneDepth = path => {
    if (path) {
      path = path.slice(path.indexOf("/sv/") + 4).split("/");
      path = path.filter(data => data !== "");
      if (path.length === 2) return true;
    } else return false;
  };

  render() {
    return (
      <Wrapper>
        {this.renderPopupContents(this.state.innerPopup)}
        <Buttons>
          {this.isAbleNewProjectFolder(this.state.selectProject) ? (
            <AddFolderButton onClick={this.onClickAddFolderButton}>
              <Icon>folder</Icon>
              <Label>새 프로젝트 폴더 추가하기</Label>
            </AddFolderButton>
          ) : (
            <React.Fragment />
          )}
          <PopupButton
            okDisabled={this.isDisabled()}
            innerPopup={this.state.innerPopup}
            onClickButton={this.onClickButton}
          />
        </Buttons>
      </Wrapper>
    );
  }
}
export default PopupProjectSelect;
