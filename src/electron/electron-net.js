const request = require("../utils/utils");
const urlencode = require("urlencode");

let NET = {},
  SID = "";
const FOLDER_PATH = "/sv";

NET.login = async query => {
  const datas = await request.get(
    `auth.cgi?api=SYNO.API.Auth&version=3&method=login&account=${query.id}&passwd=${query.pw}&format=sid`
  );

  if (datas.success === true) {
    SID = datas.data.sid;
  }

  return datas;
};

NET.getProjectData = async path => {
  let urlpath_ = urlencode(path);
  let path_ = `entry.cgi?api=SYNO.FileStation.List&version=2&method=list&folder_path=${String(
    urlpath_
  )}&_sid=${SID}`;

  console.log("path_", path_);

  const datas = await request.get(path_);
  return datas;
};

NET.getPeopleData = async () => {
  return await request.get();
};

NET.createFolder = async (path, name) => {
  return await request.get("entry.cgi", {
    api: "SYNO.FileStation.CreateFolder",
    version: 2,
    method: "create",
    folder_path: `${FOLDER_PATH}${path ? `/${path}` : ""}`,
    name: `${name}`,
    _sid: SID
  });
};

NET.addProjectFolder = async name => {
  const path = "Project";
  const data = await NET.createFolder(path, name);

  if (!data) return data;
  const arr = ["Pre-Production", "Production", "Post-Production"];
  for (let i = 0; i < arr.length; i++) {
    await NET.createFolder(`${path}/${name}`, arr[i]);
  }
  return true;
};

module.exports = NET;
