const os = require("os");

const moment = require("moment");
const ARCHIVE_PATH = "C:/_NODES_/ARCHIVE/";

const file = require("./file");

let archive = {};

/**
 * @function log
 * @description 로그를 생성한다.
 */
archive.log = async (msg, type) => {
  let message = "";
  if (msg) {
    message = msg;
  }

  try {
    let date = new Date();
    const todayFolder = moment(date).format("YYYY-MM-DD");
    const timeFolder = moment(date).format("HH:mm:ss:SSS");
    const folder = ARCHIVE_PATH + todayFolder + ".txt";

    // #1. 날짜로 만들어진 폴더 생성
    await file.makeDirEx(ARCHIVE_PATH);

    // #2. 날짜에 맞는 에러 로그 파일을 만들어 저장
    if (type === "error") {
      await file.appendFile(
        folder,
        "[" +
          todayFolder +
          ", " +
          timeFolder +
          "], <<※ ERROR ※>> " +
          message +
          os.EOL
      );
    } else if (type === "init") {
      await file.appendFile(
        folder,
        os.EOL +
          "=================================================" +
          os.EOL +
          "[" +
          todayFolder +
          ", " +
          timeFolder +
          "] " +
          message +
          os.EOL
      );
    } else {
      await file.appendFile(
        folder,
        "[" + todayFolder + ", " + timeFolder + "] " + message + os.EOL
      );
    }
    console.log(msg);
  } catch (e) {
    console.log("123e : ", e);
    return;
  }
};

module.exports = archive;
