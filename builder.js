const builder = require("electron-builder");
const Platform = builder.Platform;
let params = process.argv.slice(2)[0];

let win32 = {
  targets: Platform.WINDOWS.createTarget(),
  config: {
    appId: "com.famoz.filemanagement",
    productName: "FAMOZ File Management",
    copyright: "Copyright © 2019 FAMOZ Visual Lab",
    extends: null,
    asar: true,
    protocols: {
      name: "FAMOZ File Management",
      schemes: ["filemanager"]
    },

    win: {
      publish: ["github", "bintray"],
      target: ["nsis"],
      icon: "./resources/logo.png"
    },
    nsis: {
      perMachine: true,
      include: "./installer.nsh",
      oneClick: true,
      multiLanguageInstaller: true,
      shortcutName: "FAMOZ File Management",
      language: "1042"
    },

    directories: {
      buildResources: "./public",
      output: "./dist",
      app: "."
    }
  }
};

let linux = {
  targets: Platform.LINUX.createTarget(),
  config: {
    appId: "com.famoz.filemanagement",
    productName: "FAMOZ File Management",
    extends: null,
    protocols: {
      name: "FAMOZ File Management",
      schemes: ["filemanager"]
    },

    linux: {
      target: ["AppImage", "deb", "rpm", "zip", "tar.gz"],
      icon: "./resources/installer/linux.ico"
    },

    directories: {
      buildResources: "./public",
      output: "./@build",
      app: "."
    }
  }
};

let mac = {
  targets: Platform.MAC.createTarget(),
  config: {
    appId: "com.famoz.horizonAgent",
    productName: "FAMOZ File Management",
    extends: null,
    asar: true,
    protocols: {
      name: "FAMOZ File Management",
      schemes: ["filemanager"]
    },

    mac: {
      target: ["default"],
      icon: "./resources/installer/windows.ico"
    },
    dmg: {
      title: "FAMOZ File Management",
      icon: "./resources/installer/windows.ico"
    },

    directories: {
      buildResources: "./public",
      output: "./@build",
      app: "."
    }
  }
};

(async () => {
  try {
    let result;

    switch (params) {
      case undefined:
      case "windows":
        result = await builder.build(win32);
        break;

      case "mac":
        result = await builder.build(mac);
        break;

      case "linux":
        result = await builder.build(linux);
        break;

      default:
        throw new Error(`Invalid Parameter, ${params}`);
    }

    console.log(`[Success build], result : ${result}`);
  } catch (e) {
    console.error("error : ", e);
  }
})();
