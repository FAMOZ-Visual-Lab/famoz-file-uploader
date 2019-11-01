const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  Tray,
  dialog,
  nativeImage
} = require("electron");
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
const networkDrive = require("windows-network-drive");
const moment = require("moment");

app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
app.commandLine.appendSwitch("enable-transparent-visuals", "disable-gpu");

const archive = require("./archive");
// const { SERVER_PATH } = require("../configs/config");

const SERVER_PATH = "\\\\FAMOZ_NAS";

let win;

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

const config = {
  resizable: false,
  frame: false,
  transparent: true,
  movable: true,
  acceptFirstMouse: true,
  webPreferences: {
    nodeIntegration: true
  }
};

function createWindow() {
  win = new BrowserWindow({
    center: true,
    alwaysOnTop: true,
    useContentSize: true,
    ...config
  });
  const startUrl = isDev
    ? "http://localhost:3000"
    : process.env.ELECTRON_START_URL ||
      url.format({
        pathname: path.join(__dirname, "../../build/index.html"),
        protocol: "file:",
        slashes: true
      });

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

  ipcMain.on("login", async (event, arg) => {
    try {
      const datas = await NET.login(arg);
      if (datas.success) {
        id = arg.id;
        pw = arg.pw;
        setDefaultDisplay();
      }
      win.webContents.send("login_res", datas.success);
    } catch (e) {
      try {
        const datas = await NET.login(arg);
        if (datas.success) {
          id = arg.id;
          pw = arg.pw;
          setDefaultDisplay();
        }
        win.webContents.send("login_res", datas.success);
      } catch (e) {
        console.log("e : ", e);
        setDefaultDisplay();
        win.webContents.send("login_res", false);
      }

      return e;
    }
  });

  ipcMain.on("popup_open", async (event, arg) => {
    try {
      let res;
      if (arg === "project") {
        const ismount = await ismountAble("open_popup_project");
        if (!ismount) return;
        let datas = await NET.getProjectData("/sv/Project");
        if (!datas.success) {
          await login();
          datas = await NET.getProjectData("/sv/Project");
        }
        res = datas.data;
      } else if (arg === "date") {
        const ismount = await ismountAble("open_popup_date");
        if (!ismount) return;
        const name = JSON.stringify(moment(new Date()).format("YYYYMMDD"));
        await NET.createFolder("Date", name);
        let projects = await NET.getProjectData(`/sv/Date/${JSON.parse(name)}`);
        if (!projects.success) {
          await login();
          projects = await NET.getProjectData(`/sv/Date/${JSON.parse(name)}`);
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
      console.log("e : ", e.message);
      setDefaultDisplay();
      addProjectFolrder = "";
    }
  });

  ipcMain.on("open_exlpore", (event, arg) => {
    console.log("open_exlpore:", arg);
    try {
      openFileExplore(arg || "");
    } catch (e) {
      setDefaultDisplay();
    }
  });

  ipcMain.on("select_path", async (event, arg) => {
    try {
      const datas = await getProejctFolderData(arg);
      console.log(arg);

      win.webContents.send("popup_open_res", datas.data);
    } catch (e) {}
  });

  ipcMain.on("get_project_list", async (event, arg) => {
    try {
      const datas = await getProejctFolderData(arg);
      console.log("datas:", datas);

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
      console.log(e);
    }
  });

  ipcMain.on("add_project_folder", async (e, arg) => {
    try {
      const data = await NET.addProjectFolder(arg);
      addProjectFolrder = arg;
      console.log("data: ", data);
      win.webContents.send("add_project_folder_res", data);
    } catch (e) {
      console.log("e:", e);
    }
  });

  ipcMain.on("mount_drive", async (e, arg) => {
    try {
      //arg[0]: Z, F, G...
      //arg[1]: endAction
      archive.log("arg[0] : " + arg[0]);
      archive.log("arg[1] : " + arg[1]);

      networkDrive
        .unmount(arg[0])
        .then(unm => {
          archive.log("then 직후 입니다! : " + unm);

          mountFolder(arg[0]).then(async res => {
            archive.log("mountFolder 함수 실행 후! : " + res);

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
          });
        })
        .catch(err => {
          archive.log(err, "error");
          setDefaultDisplay();
        });
    } catch (e) {
      console.log("e:", e);
    }
  });

  ipcMain.on("open_progress", () => {
    openProgressPopup();
  });

  ipcMain.on("close_progress", () => {
    closeProgressPopup();
  });

  // if (isDev) win.webContents.openDevTools();
}

async function getProejctFolderData(arg) {
  let datas = await NET.getProjectData(arg);
  if (!datas.success) {
    datas = await NET.getProjectData(arg);
  }
  console.log("결과:", datas, "arg: ", arg);

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

  console.log("start url: ", startUrl);

  child.once("ready-to-show", async () => {
    console.log("child show?");
    childOpen = true;
    child.show();
    const list = await resolveMapToArray();
    if (childOpen) {
      child.webContents.send("change_progress", list);
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

async function login() {
  try {
    const qurey = {
      id: id,
      pw: pw
    };
    NET.login(qurey);
  } catch (err) {
    console.log("err:", err);
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
  } catch (err) {
    console.log("err:", err);
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
              await makeDirEx(sub_path);
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
      console.log("-- folder");

      // #1. 최대 50개를 동시에 처리한다는 의미
      const MAX_COUNT = 30;

      // #2. queue. 사실상 이 친구가 본체
      let q = new limit_queue(MAX_COUNT);

      // #3. stream의 종료 이벤트를 감지하는 친구.
      // 스트림이 하나 종료할 때마다 처리 가능한 스트림을 하나 가용한다.
      let queueObserver = new event.EventEmitter();
      queueObserver.on("release", () => {
        console.log("대충 왔다는 뜻");

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
              console.log("write error : ", e);
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
      console.log("-- file");

      const plus = _path.substring(_path.length);
      const copyDest = dest + plus; // 복사된 경로

      const final_size = fs_extra.lstatSync(_path).size;
      let size = 0;
      let valueSize = 0;

      const readStream = fs.createReadStream(_path);
      readStream.on("error", e => {
        console.log("read error : ", e);
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
        console.log("write error : ", e);
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

function setDefaultDisplay() {
  const { width, height } = electron.screen.getPrimaryDisplay().size;
  win.setAlwaysOnTop(true);
  win.setBounds({ x: width - 350, y: height - 480, width: 350, height: 440 });
}

function setPopupDisplay() {
  const bounds = win.getContentSize();
  console.log(bounds);
  win.setAlwaysOnTop(false);
  win.setSize(600, 750);
  win.center();
}

async function ismountAble(endAction) {
  console.log("drive는 현재 이렇습니다 형님", drive);
  console.log("endAction", endAction);
  let isMount = false;

  try {
    await networkDrive
      .find(`${SERVER_PATH}\\sv`)
      .then(data => {
        if (data) {
          console.log(" >>> mount data : ", data);
          isMount = data.length !== 0;
          drive = data ? data[0] : "";
        }
      })
      .catch(e => {});

    console.log("isMount:", isMount);
    if (!isMount) {
      win.webContents.send("open_drivemoumt_popup", endAction || "");
      setPopupDisplay();
      return false;
    } else {
      return true;
    }
  } catch (e) {
    console.log("e : ", e);
  }
}

async function mountFolder(drive_) {
  try {
    drive = drive_ || drive;

    const defaultPath = `${SERVER_PATH}\\sv`;
    const driveLetter = await networkDrive.mount(defaultPath, drive, id, pw);

    console.log(driveLetter + "에 마운트 됨!");
    setDefaultDisplay();
    archive.log("driveLetter! : " + driveLetter);
  } catch (e) {
    throw e;
  }
}

async function openFileExplore(path_) {
  const data = await ismountAble("open_explore");
  innerPath = path_ || "";
  if (!data) return;

  try {
  } catch (e) {
    setDefaultDisplay();
  }
  if (path_) {
    console.log(`start "${drive}:\\${path_}"`);
    require("child_process").exec(`start "" "${drive}:\\${path_}"`);
  } else {
    require("child_process").exec(`start ${drive}:\\`);
  }
}

let tray = null;
app.on("ready", () => {
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
  tray.setHighlightMode("always");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  win.show();
});
