const electron_updater = require("electron-updater");

let autoUpdater = function () {    
    const log = require("electron-log");
    log.transports.file.level = "debug"
    electron_updater.autoUpdater.logger = log;
    electron_updater.autoUpdater.checkForUpdatesAndNotify();
}

module.exports = autoUpdater;