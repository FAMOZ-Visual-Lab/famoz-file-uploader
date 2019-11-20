const fs = require("fs-extra");
const log = require("electron-log");

let file = {};

file.makeDirEx = path => {
  return new Promise((resolve, reject) => {
    const directory = path.replace(/\//g, "\\");

    fs.mkdir(directory, async error => {
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
              await this.makeDirEx(res_path);
              await this.makeDirEx(sub_path);
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
};

file.appendFile = (path, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!fs.exists(path)) {
        await this.write(path, "");
      }
      fs.appendFile(path, data, "utf-8", err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

file.write = (path, data) => {
  return new Promise((resolve, reject) => {
    try {
      fs.writeFile(path, "\ufeff" + data, "utf-8", err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

file.isStat = path => {
  try {
    const statSync = fs.statSync(path);
    if (statSync && statSync.isFile()) {
      return true;
    }
    return false;
  } catch (e) {
    log.error("isStat: " + e.message);
    return false;
  }
};

file.readFile = path => {
  try {
    const buffer = fs.readFileSync(path);
    return buffer;
  } catch (e) {
    log.error("readFile: " + e.message);
    return undefined;
  }
};

file.writeFile = (path, data) => {
  try {
    fs.writeFileSync(path, data);
  } catch (e) {
    log.error("writeFile: " + e.message);
  }
};

file.deleteFile = path => {
  try {
    fs.unlinkSync(path);
  } catch (e) {
    log.error("deleteFile: " + e.message);
  }
};

module.exports = file;
