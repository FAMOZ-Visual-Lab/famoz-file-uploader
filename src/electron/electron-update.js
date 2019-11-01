const { app, autoUpdater, dialog } = require("electron");
const util = require("util");

const isDEBUG = process.env.DEBUG_MODE;
if (isDEBUG) {
	console.log('Running in development');



    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'A new version has been downloaded. Restart the application to apply the updates.'
        }
    
        dialog.showMessageBox(dialogOpts, (response) => {
            if (response === 0) autoUpdater.quitAndInstall()
        });
    });
    
    autoUpdater.on('error', (message) => {
        console.error('There was a problem updating the application')
        console.error(message)
    });

}