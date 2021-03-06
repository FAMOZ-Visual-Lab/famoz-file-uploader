﻿const {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  Menu,
  Tray,
  dialog,
  nativeImage
} = require("electron");
const autoUpdater = require("electron-updater").autoUpdater;
const fs = require("fs");
const fs_extra = require("fs-extra");
const electron = require("electron");
const NET = require("./electron-net");
const limit_queue = require("./queue");
const node_dir = require("node-dir");
const url = require("url");
const event = require("events");
const path = require("path");
const isDev = require("electron-is-dev");
const moment = require("moment");
const log = require("electron-log");
const drivelist = require("drivelist");
const fileHelper = require("./file");

const networkDriveUtil = require("./windows-mount");
const server_config = require("../configs/config");
let SERVER_PATH = "";
let isTel;

let win;

const MountState = {
  UNKNOWN: -1,
  S_DRIVE_MOUNT: 100,
  S_NORMAL_MOUNT: 101,
  F_FAIL: 400
};

let mountState = MountState.UNKNOWN;

// https://electronjs.org/docs/api/app#apprequestsingleinstancelock
const isLock = app.requestSingleInstanceLock();
if (!isLock) {
  app.quit();
  app.exit();
} else {
  app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
  app.commandLine.appendSwitch("enable-transparent-visuals", "disable-gpu");


  const iconPath = path.join(__dirname, "../../resources/logo.png");
  let trayIcon = nativeImage.createFromPath(iconPath);
  trayIcon = trayIcon.resize({ width: 16, height: 16 });

  let id = "";
  let pw = "";
  let selectData = [];
  let selectProejct = null;
  let drive = "";
  let innerPath = "";
  let child;
  let progressMap = new Map();
  let childOpen = false;
  let addProjectFolrder = "";
  let updateData = null;

  let config = {
    resizable: false,
    frame: false,
    transparent: true,
    movable: true,
    acceptFirstMouse: true,
    width: 350,
    height: 500,
    webPreferences: {
      nodeIntegration: true
    }
  };

  function createWindow(isUpdate) {
    if (isUpdate) {
      config = {
        ...config,
        width: 600,
        height: 500
      };

      win = new BrowserWindow({
        ...config,
        center: true
      });

      const startUrl = isDev
        ? "http://localhost:3000#/update-progress"
        : process.env.ELECTRON_START_URL ||
          url.format({
            pathname: path.join(__dirname, "../../build/index.html"),
            protocol: "file:",
            slashes: true,
            hash: "update-progress"
          });

      win.setIcon(trayIcon, "파모즈 파일 관리자 앱");

      win.loadURL(startUrl);
    } else {
      extendConfig = {};

      if (updateData) {
        config = {
          ...config,
          width: 600,
          height: 500
        };
      }
      else {
        config = {
          ...config,
          width: 350,
          height: 500
        };
      }

      win = new BrowserWindow({
        center: true,
        alwaysOnTop: true,
        useContentSize: true,
        ...config
      });
      console.log("updateData:", updateData);
      let startUrl = setStartUrl(updateData && "update-alert");
      console.log("startUrl:", startUrl);
      win.setIcon(trayIcon, "파모즈 파일 관리자 앱");
      win.loadURL(startUrl);

      win.on("close", event => {
        win = null;
      });

      // ipc 이벤트 등록
      ipcMain.on("closed", event => {
        app.quitting = true;
        win.hide();
      });

      ipcMain.on("update_alert_show", () => {
        try {
          win.webContents.send("update_alert_data", updateData);
          updateData = null;
        } catch (e) {}
      });

      // 업데이트 목록을 다시 보여준다.
      ipcMain.on("update_alert_show_dialog_open", () => {
        try {
          const read = JSON.parse(
            fileHelper.readFile(app.getPath("userData") + "/updateInfo.txt")
          );
          openUpdateInfoPopup(read);
        } catch (e) {}
      });

      ipcMain.on("login", async (event, arg) => {
        let step = 0;
        try {
          const datas = await NET.login(arg);
          if (datas.success) {
            step++;

            id = arg.id;
            pw = arg.pw;
            isTel = arg.isTel;
            if(arg.isTel == true) {
              SERVER_PATH = server_config.SERVER_PATH_SUB;
            }
            else {
              SERVER_PATH = server_config.SERVER_PATH_MAIN;
            }
            console.log("SERVER_PATH : ", SERVER_PATH);
            const isFile = fileHelper.isStat(
              app.getPath("userData") + "/mount.json"
            );
            if (isFile) {
              const read = JSON.parse(
                fileHelper.readFile(app.getPath("userData") + "/mount.json")
              );
              step++;
              await mountFolder(read.mount);
            }
            console.log("SERVER_PATH : ", SERVER_PATH);
            win.webContents.send("login_res", { success: true, type: 0 });
            setDefaultDisplay();
          }
          else {
            win.webContents.send("login_res", { success: false, type: 0 });
          }
        } catch (e) {
          log.error("e :", e);
          if(step == 2) {
            win.webContents.send("login_res", { success: false, type: 1 });
          }
          else {
            win.webContents.send("login_res", { success: false, type: 2 });
          }
          return e;
        }
      });

      ipcMain.on("popup_open", async (event, arg) => {
        try {
          let res;
          if (arg === "project") {
            const ismount = await ismountAble("open_popup_project");
            if (ismount == MountState.F_FAIL) {
              return;
            }

            let datas = await NET.getProjectData("/sv/Project");
            if (!datas.success) {
              await login();
              datas = await NET.getProjectData("/sv/Project");
            }
            res = datas.data;
          } else if (arg === "date") {
            const ismount = await ismountAble("open_popup_date");
            if (ismount == MountState.F_FAIL) {
              return;
            }
            const name = JSON.stringify(moment(new Date()).format("YYYYMMDD"));
            await NET.createFolder("Date", name);
            let projects = await NET.getProjectData(
              `/sv/Date/${JSON.parse(name)}`
            );
            if (!projects.success) {
              await login();
              projects = await NET.getProjectData(
                `/sv/Date/${JSON.parse(name)}`
              );
            }
            res = projects.data;
          }

          win.webContents.send("popup_res", arg);
          win.webContents.send(
            "popup_open_res",
            addProjectFolrder ? [res, addProjectFolrder] : res
          );
          setPopupDisplay();
        } catch (e) {}
      });

      ipcMain.on("popup_close", async (event, arg) => {
        try {
          // arg[0] : ok, cancel
          // arg[1] : upload path
          // arg[2] : upload file
          if (arg[0] === true) {
            selectProejct = arg[1];
            fileUpload(arg[1]);
          }
          selectData = [];
          setDefaultDisplay();
          addProjectFolrder = "";
        } catch (e) {
          log.error(e.message);
          setDefaultDisplay();
          addProjectFolrder = "";
        }
      });

      ipcMain.on("open_exlpore", (event, arg) => {
        try {
          openFileExplore(arg || "");
        } catch (e) {
          setDefaultDisplay();
        }
      });

      ipcMain.on("select_path", async (event, arg) => {
        try {
          const datas = await getProejctFolderData(arg);
          win.webContents.send("popup_open_res", datas.data);
        } catch (e) {}
      });

      ipcMain.on("get_project_list", async (event, arg) => {
        try {
          const datas = await getProejctFolderData(arg);
          win.webContents.send("res_project_list", datas.data.files);
        } catch (e) {}
      });

      ipcMain.on("open_file_select", () => {
        try {
          dialog.showOpenDialog(
            {
              properties: ["openFile", "multiSelections"]
            },
            data => {
              if (selectData.length === 0) {
                win.webContents.send("open_file_select_res", data.length);
                selectData = data;
              }
            }
          );
        } catch (e) {}
      });

      ipcMain.on("on_dragstart", async (e, arg) => {
        try {
          await win.webContents.send("open_file_select_res", arg.length);
          selectData = arg;
        } catch (e) {
          log.error(e.message);
        }
      });

      ipcMain.on("add_project_folder", async (e, arg) => {
        try {
          const data = await NET.addProjectFolder(arg);
          addProjectFolrder = arg;
          win.webContents.send("add_project_folder_res", data);
          setPopupDisplay();
        } catch (e) {
          log.error(e.message);
        }
      });

      ipcMain.on("mount_drive", async (e, arg) => {
        try {
          //arg[0]: Z, F, G...
          //arg[1]: endAction
          await mountFolder(arg[0]);
          if (arg[1] === "open_explore") {
            openFileExplore(innerPath || "");
            win.webContents.send("re_popup_close");
            innerPath = "";
            return;
          } else if (arg[1] === "popup_close") {
            fileUpload(selectProejct);
            selectData = [];
            selectProejct = null;
            win.webContents.send("re_popup_close");
          } else {
            win.webContents.send("re_popup_open", arg[1]);
          }
          setDefaultDisplay();
        } catch (e) {
          log.error(e.message);
          setDefaultDisplay();
        }
      });

      ipcMain.on("open_progress", () => {
        openProgressPopup();
      });

      ipcMain.on("close_progress", () => {
        closeProgressPopup();
      });

      ipcMain.on("close_modal", () => {
        closeModal();
      });

      ipcMain.on("set_custom_height", (e, arg) => {
        setCustomDisplay(arg);
      });

      ipcMain.on("set_custom_login", () => {
        setCustomLoginDisplay();
      });



      ipcMain.on("set_popup_display", () => {
        setPopupDisplay();
      });
    }
  }

  function setStartUrl(hash) {
    return isDev
      ? `http://localhost:3000${hash ? `#/${hash}` : ""}`
      : process.env.ELECTRON_START_URL ||
          url.format({
            pathname: path.join(__dirname, "../../build/index.html"),
            protocol: "file:",
            slashes: true,
            hash: hash && hash
          });
  }

  async function getProejctFolderData(arg) {
    let datas = await NET.getProjectData(arg);
    if (!datas.success) {
      datas = await NET.getProjectData(arg);
    }
    return datas;
  }

  function openProgressPopup() {
    child = new BrowserWindow({
      parent: win,
      modal: true,
      show: false,
      ...config
    });

    const startUrl = isDev
      ? "http://localhost:3000#/progress"
      : process.env.ELECTRON_START_URL ||
        url.format({
          pathname: path.join(__dirname, "../../build/index.html"),
          protocol: "file:",
          slashes: true,
          hash: "progress"
        });
    child.loadURL(startUrl);

    child.once("ready-to-show", async () => {
      childOpen = true;
      child.show();
      const list = await resolveMapToArray();
      if (childOpen) {
        child.webContents.send("change_progress", list);
      }
    });
  }

  function openUpdateInfoPopup(data) {
    let child_config = {
      ...config,
      width: 600,
      height: 500
    };
    
    child = new BrowserWindow({
      parent: win,
      modal: true,
      show: false,
      ...child_config
    });
    const startUrl = isDev
      ? "http://localhost:3000#/update-alert"
      : process.env.ELECTRON_START_URL ||
        url.format({
          pathname: path.join(__dirname, "../../build/index.html"),
          protocol: "file:",
          slashes: true,
          hash: "update-alert"
        });
    child.loadURL(startUrl);

    child.once("ready-to-show", async () => {
      childOpen = true;
      child.show();
      if (childOpen) {
        child.webContents.send("update_alert_data_2", data);
      }
    });
  }

  async function resolveMapToArray() {
    let pList = [];
    for (const key of progressMap.keys()) {
      pList.push({
        id: key,
        progress: progressMap.get(key)
      });
    }
    return pList;
  }

  function closeProgressPopup() {
    childOpen = false;
    child.hide();
  }

  function closeModal() {
    childOpen = false;
    child.hide();
  }


  async function login() {
    try {
      const qurey = {
        id: id,
        pw: pw
      };
      NET.login(qurey);
    } catch (e) {
      log.error(e.message);
    }
  }

  async function fileUpload(_path) {
    try {
      for (let i = 0; i < selectData.length; i++) {
        const _path = selectData[i];
        const filename = _path.substring(_path.lastIndexOf("\\") + 1);

        let replace_path = String(_path).replace(/\//g, "\\");
        let dest = `${SERVER_PATH}${selectProejct}/${filename}`;
        dest = String(dest).replace(/\//g, "\\");
        getProgressData(replace_path, dest);
      }
    } catch (e) {
      log.error(e.message);
    }
  }

  async function makeDirEx(path) {
    return new Promise((resolve, reject) => {
      const directory = path.replace(/\//g, "\\");

      fs_extra.mkdir(directory, async error => {
        try {
          if (error) {
            if (error.code === "EEXIST") {
              resolve("already folder");
            }
            // 해상 상위 폴더가 없을 경우
            else if (error.code === "ENOENT") {
              const sub_path = error.path;
              if (sub_path) {
                const res_path = sub_path.substring(
                  0,
                  sub_path.lastIndexOf("\\" || "/")
                );
                await makeDirEx(res_path);
                await makeDirEx(sub_path);3
              } else {
                throw new Error("(SERVER) Nothing Path");
              }
            } else {
              throw error;
            }
          }
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  function getProgressData(_path, dest) {
    try {
      // 폴더
      if (fs_extra.lstatSync(_path).isDirectory()) {
        // #1. 최대 50개를 동시에 처리한다는 의미
        const MAX_COUNT = 30;

        // #2. queue. 사실상 이 친구가 본체
        let q = new limit_queue(MAX_COUNT);

        // #3. stream의 종료 이벤트를 감지하는 친구.
        // 스트림이 하나 종료할 때마다 처리 가능한 스트림을 하나 가용한다.
        let queueObserver = new event.EventEmitter();
        queueObserver.on("release", () => {
          // #4. queue에 한자리 비었다는 신호.
          q.release();

          // #5. queue 판단에 의거해 undefined이 아닌 메서드가 튀어 나올경우 실행.
          const go = q.dequeue();
          if (go !== undefined) {
            go();
          }
        });

        // 여기서부터 로직 시작
        // #6. 복사시킬 파일 목록 불러오기
        node_dir.paths(_path, async (err, _paths_) => {
          if (err) {
            throw err;
          }

          // #5. 폴더 내에 폴더가 존재하면 우선 생성
          if (_paths_.dirs.length > 0) {
            // 폴더가 존재한다면 순회해서 돌아 폴더 생성
            for (let i = 0; i < _paths_.dirs.length; i++) {
              const sDir = _paths_.dirs[i];

              const plus = sDir.substring(_path.length);
              const copyDest = dest + plus; // 복사된 경로
              await makeDirEx(copyDest);
            }
          } else {
            await makeDirEx(dest);
          }

          _paths_.files.forEach(_F => {
            q.enqueue(() => {
              const plus = _F.substring(_path.length);

              const origin = _F; // 원본 경로
              const copyDest = dest + plus; // 복사된 경로

              const final_size = fs_extra.lstatSync(_path).size;
              let size = 0;
              let valueSize = 0;

              const readStream = fs.createReadStream(origin);
              readStream.on("error", e => {
                queueObserver.emit("release");
                console.error("read error : ", e);
              });
              readStream.on("data", async data => {
                size += data.length;

                let percent = Math.floor((size / final_size) * 100);
                if (valueSize < percent) {
                  valueSize++;
                  progressMap.set(copyDest, percent);

                  const list = await resolveMapToArray();
                  win.webContents.send("change_progress", list);

                  if (childOpen) {
                    child.webContents.send("change_progress", list);
                  }
                }
              });

              const writeStream = fs.createWriteStream(copyDest, {});

              writeStream.on("error", e => {
                queueObserver.emit("release");
                log.error(e.message);
              });

              writeStream.on("close", async () => {
                queueObserver.emit("release"); // queue 실행.
                progressMap.delete(copyDest);

                const list = await resolveMapToArray();
                win.webContents.send("change_progress", list);
                if (childOpen) {
                  child.webContents.send("change_progress", list);
                }
              });

              readStream.pipe(writeStream);
            });

            // ★ queue 실행!
            const go = q.dequeue();
            if (go !== undefined) {
              go();
            }
          });
        });
      }
      // 파일
      else {
        const plus = _path.substring(_path.length);
        const copyDest = dest + plus; // 복사된 경로

        const final_size = fs_extra.lstatSync(_path).size;
        let size = 0;
        let valueSize = 0;

        const readStream = fs.createReadStream(_path);
        readStream.on("error", e => {
          log.error(e.message);
        });
        readStream.on("data", async data => {
          size += data.length;

          let percent = Math.floor((size / final_size) * 100);
          if (valueSize < percent) {
            valueSize++;

            progressMap.set(copyDest, percent);
            // 호출
            const list = await resolveMapToArray();
            win.webContents.send("change_progress", list);
            if (childOpen) {
              child.webContents.send("change_progress", list);
            }
          }
        });

        const writeStream = fs.createWriteStream(copyDest, {});

        writeStream.on("error", e => {
          log.error(e.message);
        });

        writeStream.on("close", async () => {
          progressMap.delete(copyDest);

          const list = await resolveMapToArray();
          win.webContents.send("change_progress", list);
          if (childOpen) {
            child.webContents.send("change_progress", list);
          }
        });

        readStream.pipe(writeStream);
      }
    } catch (e) {
      throw e;
    }
  }

  function setCustomDisplay(arg) {
    let mainWidth;
    let mainHeight;

    if (!arg) {
      mainWidth = 600;
      mainHeight = 290;
    } else {
      mainWidth = 600;
      mainHeight = arg;
    }

    const { width, height } = electron.screen.getPrimaryDisplay().size;
    const x = width / 2 - mainWidth / 2;
    const y = height / 2 - mainHeight / 2;

    win.setBounds({
      x,
      y,
      width: mainWidth,
      height: mainHeight
    });
    win.center();
  }

  function setCustomLoginDisplay() {
    let mainWidth;
    let mainHeight;

    mainWidth = 350;
    mainHeight = 500;

    const { width, height } = electron.screen.getPrimaryDisplay().size;
    const x = width / 2 - mainWidth / 2;
    const y = height / 2 - mainHeight / 2;

    win.setBounds({
      x,
      y,
      width: mainWidth,
      height: mainHeight
    });
    win.center();
  }

  function setDefaultDisplay() {
    const { width, height } = electron.screen.getPrimaryDisplay().size;
    win.setAlwaysOnTop(true);
    win.setBounds({ x: width - 350, y: height - 510, width: 350, height: 470 });
  }

  function setPopupDisplay() {
    // const bounds = win.getContentSize();
    win.setAlwaysOnTop(false);
    win.setSize(600, 750, true);
    win.center();
  }

  async function ismountAble(endAction) {
    let physics_drive = ["A", "B"];

    try {
      const drives = await drivelist.list();
      for (const drive of drives) {
        for (let i = 0; i < drive.mountpoints.length; i++) {
          const path = drive.mountpoints[i].path;
          physics_drive.push(path.substring(0, path.indexOf(":")));
        }
      }
      
      let data = [];
      if(isTel) {
        console.log(" >> 1");
        data = await networkDriveUtil.find(`famoz.synology.me@5005`, true);
      }
      else {
        console.log(" >> 2");
        data = await networkDriveUtil.find(`FAMOZ_NAS`, true);
      }
      console.log("data : ", data);
      for (let i = 0; i < data.length; i++) {
        physics_drive.push(data[i]);
      }
      log.info("physics_drive + net mount : ", physics_drive);

      if (data.length > 0) {
        drive = data[0];
        log.info("drive : ", data);

        if (data.length == 0) {
          return MountState.S_NORMAL_MOUNT;
        }
        return MountState.S_DRIVE_MOUNT;
      } 
      else {
        drive = "";
        win.webContents.send("open_drivemoumt_popup", [
          endAction || "",
          physics_drive
        ]);
        setPopupDisplay();
        return MountState.F_FAIL;
      }
    } catch (e) {
      log.error(e.message);
      drive = "";
      win.webContents.send("open_drivemoumt_popup", [
        endAction || "",
        physics_drive
      ]);
      setPopupDisplay();
      return MountState.F_FAIL;
    }
  }

  /**
   * 네트워크 드라이브를 특정 논리 드라이브로 마운트 시킨다.
   */
  function mountFolder(send_drive) {
    return new Promise(async (resolve, reject) => {
      try {
        drive = send_drive;
        console.log("send_drive : ", send_drive);

        /** 이하에서 업데이트 목록 출력 */
        const result = fileHelper.isStat(
          app.getPath("userData") + "/mount.json"
        );
        if (result) {
          fileHelper.deleteFile(app.getPath("userData") + "/mount.json");
        }
        fileHelper.writeFile(
          app.getPath("userData") + "/mount.json",
          JSON.stringify({ mount: drive })
        );

        console.log("Unmount : ", drive);
        await networkDriveUtil.unmount(drive);
        console.log("Mount ${SERVER_PATH} : ", `${SERVER_PATH}`);
        let mountPath = SERVER_PATH;
        if(isTel) {
          console.log("재택근무");
          mountPath += "/sv";
        }
        else {
          mountPath += "\\sv";
        }
        await networkDriveUtil.mount(mountPath, drive, id, pw);
        setDefaultDisplay();
        resolve();
      } catch (e) {
        log.error("drive Mount Error : " + e.message);
        reject(e);
      }
    });
  }

  async function openFileExplore(path_) {
    try {
      console.log("drive 1 : ", drive);
      console.log("path_ : ", path_);
      const result = await ismountAble("open_explore");
      log.info("mountable : ", result);

      if (result == MountState.S_DRIVE_MOUNT) {
        if (path_ != "") {
          log.info(`already path : ${drive}:\\${path_}`);
          shell.openItem(`${drive}:\\${path_}`);
        } 
        else {
          log.info("default path : ", drive);
          shell.openItem(`${drive}:\\`);
        }
      }
      // 이 상태는 마운트는 되었는데 가상 네트워크 드라이브로 할당된 것이 아닌 다른 방식으로 할당 됨
      else if (result == MountState.S_NORMAL_MOUNT) {
        console.log(`drive 2 : ${drive}:\\`);
        shell.openItem(`${drive}:\\`);
      } 
      else {
        setPopupDisplay();
      }
    } catch (e) {
      setDefaultDisplay();
    }
  }

  let tray = null;
  app.on("ready", async () => {
    try {
      // RELEASE MODE
      if (process.env.DEBUG_MODE == undefined) {
        autoUpdater.logger = log;
        autoUpdater.autoDownload = false;

        // autoUpdater.signals.progress(info => {
        //   // info.total;
        //   // info.delta;
        //   // info.transferred;
        //   // info.percent;
        //   // info.bytesPerSecond;
        //   log.info("download : " + info);
        // });

        // info.releaseDate --> 업데이트 된 날짜(ex. 2019-11-01T08:25:09.540Z)
        // info.releaseName --> 업데이트 명칭
        // info.releaseNotes --> 업데이트 내용(ex. <p>업데이트 되었습니다.<br> 내용은 이겁니다.</p>)
        autoUpdater.checkForUpdates();
        autoUpdater.on("checking-for-update", () => {
          log.info("<< checking-for-update >>");
        });

        /**
         * 사용 가능한 업데이트 감지
         */
        autoUpdater.on("update-available", () => {
          log.info("<update-available>\n");

          const options = {
            type: "info",
            title: "파모즈 파일 관리자 업데이트 확인",
            message:
              "업데이트가 감지되었습니다. 확인 버튼을 누르면 업데이트를 진행합니다."
          };

          // 확인을 누르면 업데이트를 진행
          dialog
            .showMessageBox(options)
            .then(async () => {
              autoUpdater.on("update-downloaded", info => {
                log.info("<update-downloaded>");
                fileHelper.writeFile(
                  app.getPath("userData") + "/update.txt",
                  JSON.stringify({
                    version: info.version,
                    releaseName: info.releaseName,
                    releaseNotes: info.releaseNotes,
                    releaseDate: info.releaseDate
                  })
                );
                log.info("quitAndInstall()");
                autoUpdater.quitAndInstall();
              });

              createWindow(true);
              const path = await autoUpdater.downloadUpdate();
              log.info("path : " + path);
            })
            .catch(e => {});

          autoUpdater.on("download-progress", download => {
            win.webContents.send(
              "update_progress_percent",
              Number(download.percent).toFixed(2)
            );
          });
        });

        /**
         * 사용 가능한 업데이트가 없음
         */
        autoUpdater.on("update-not-available", () => {
          try {
            log.info("<update-not-available>\n");
            const isFile = fileHelper.isStat(
              app.getPath("userData") + "/update.txt"
            );
            if (isFile) {
              const read = JSON.parse(
                fileHelper.readFile(app.getPath("userData") + "/update.txt")
              );

              fileHelper.deleteFile(app.getPath("userData") + "/updateInfo.txt");
              fileHelper.writeFile(
                app.getPath("userData") + "/updateInfo.txt",
                JSON.stringify({
                  version: read.version,
                  releaseName: read.releaseName,
                  releaseNotes: read.releaseNotes,
                  releaseDate: read.releaseDate
                })
              );

              updateData = read;
              log.info("releaseName : " + read.releaseName);
              log.info("releaseNotes : " + read.releaseNotes);

              /** 이하에서 업데이트 목록 출력 */
              fileHelper.deleteFile(app.getPath("userData") + "/update.txt");
            }
          } catch (e) {
            log.error("e : " + e.message);
          } finally {
            createWindow();
            tray = new Tray(trayIcon);
            const contextMenu = Menu.buildFromTemplate([
              {
                label: "앱 닫기",
                type: "normal",
                click: () => {
                  win = null;
                  app.quit();
                }
              }
            ]);

            tray.on("click", () => {
              win.isVisible() ? win.hide() : win.show();
            });

            tray.setToolTip("파모즈 파일 관리자 앱 입니다.");
            tray.setContextMenu(contextMenu);
            // tray.setHighlightMode("always");
          }
        });

        autoUpdater.on("error", error => {
          autoUpdater.logger.transparent.file.level = "error";
          log.info("error");
          log.error(error.message);
          log.error(error.stack);
        });
      }

      // DEBUG MODE
      else {
        createWindow();
        tray = new Tray(trayIcon);
        const contextMenu = Menu.buildFromTemplate([
          {
            label: "앱 닫기",
            type: "normal",
            click: () => {
              win = null;
              app.quit();
            }
          }
        ]);

        tray.on("click", () => {
          win.isVisible() ? win.hide() : win.show();
        });

        tray.setToolTip("파모즈 파일 관리자 앱 입니다.");
        tray.setContextMenu(contextMenu);
        // tray.setHighlightMode("always");
      }
    } catch (error) {
      log.info("autoupdate failed");
      log.error(error.message, "error");
    }
  });

  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (win) {
      win.isMinimized() ? win.restore() : () => {};
      win.isVisible() ? win.hide() : win.show();
      win.focus();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("quit", async () => {
    try {
      await NET.logout();
    }
    catch(e) {
      log.log(">> Program quit event : ", e);
    }
  })

  app.on("activate", () => {
    win.show();
  });
}
