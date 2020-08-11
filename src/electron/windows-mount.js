"use strict";
const util = require('util');
const driveLetters = require("windows-drive-letters");
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const MAX_BUFFER_SIZE = 2000 * 1024;

function assertIfNonEmptyString(input)
{
	/**
	 * Ignore this in code coverage because it should never happen
	 */
	/* istanbul ignore if */
	if ("string" === typeof input &&
		0 !== input.length)
	{
		throw (new Error(input));
	}

	return;
}

let WindowsNetwork = {};

/**
 * Windows 운영체제인지 검사
 */
WindowsNetwork.isWinOs = () => {
    return /^win/.test(process.platform);
}


/**
 * 드라이브 패스를 지정해서 해당 패스에 맞는 네트워크 드라이브가 있는지 찾는다.
 *  */    
WindowsNetwork.find = async (drivePath, isPart) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!WindowsNetwork.isWinOs()) {
                throw new Error("윈도우 OS만 사용 가능");
            }

            if(typeof drivePath != "string" || drivePath.trim().length <= 0) {
                throw new Error("drivePath가 유효하지 않음");
            }

            const networkDrives = await WindowsNetwork.list();

            let type = "all";
            if(isPart == true) {
                type = "part";
            }

            let driveLetters = [];
            for (const key of Object.keys(networkDrives)) {
                let drive = networkDrives[key];
                if(type == "all") {
                    if (drive == drivePath) {
                        driveLetters.push(drive.toUpperCase());
                    }
                }
                else {
                    if (drive.indexOf(drivePath) != -1) {
                        driveLetters.push(key);
                    }
                }
            }
            resolve(driveLetters);
        }
        catch(e) {
            reject(e);
        }
    });
}


/**
 * 네트워크 드라이브 리스트
 */
WindowsNetwork.list = async () => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!WindowsNetwork.isWinOs()) {
                throw new Error("윈도우 OS만 사용 가능");
            }
            const result = await exec("wmic path Win32_LogicalDisk Where DriveType=\"4\" get DeviceID, ProviderName", { maxBuffer: MAX_BUFFER_SIZE });
            if (result.stderr.indexOf('No Instance(s) Available') == -1) {
                assertIfNonEmptyString(result.stderr);
            }

            let pathList;
            let drivePaths = {};
            let currentPathIndex;

            pathList = result.stdout.split(/\s*[\n\r]+/g);
            pathList.splice(0, 1);

            for (currentPathIndex = 0; currentPathIndex < pathList.length; currentPathIndex++) {
                let currentPath = pathList[currentPathIndex];
                if (typeof currentPath == "string" && currentPath.length > 0) {
                    let colonIndex = currentPath.indexOf(':');
                    let driveLetter = currentPath.substring(0, colonIndex);
                    let drivePath = currentPath.substring(colonIndex + 1);
                    drivePaths[driveLetter.trim().toUpperCase()] = drivePath.trim();
                }
            }
            resolve(drivePaths);
        }
        catch(e) {
            reject(e);
        }
    });
}


/**
 * 일반 경로를 윈도우즈 경로로 변경
 */
WindowsNetwork.pathToWindowsPath = async (drivePath) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!WindowsNetwork.isWinOs()) {
                throw new Error("윈도우 OS만 사용 가능");
            }
            
            if (typeof drivePath != "string") {
                throw (new Error("유효하지 않은 드라이브 경로"));
            }

            drivePath = drivePath.trim();
            if (drivePath.length <= 0) {
                throw (new Error("유효하지 않은 드라이브 경로 2"));
            }

            drivePath = path.normalize(drivePath);
            drivePath = drivePath.replace('/', '\\');
            drivePath = drivePath.replace(/\\+$/, '');
            return drivePath;

        }
        catch(e) {
            reject(e);
        }
    });
}


/**
 * 네트워크 드라이브로 마운트
 */
WindowsNetwork.mount = async (drivePath, driveLetter, username, password) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!WindowsNetwork.isWinOs()) {
                throw new Error("윈도우 OS만 사용 가능");
            }            
            if (typeof drivePath != "string" || drivePath.trim().length <= 0) {
                throw (new Error("유효하지 않은 드라이브 경로"));
            }
            drivePath = drivePath.trim();

            
            if (typeof driveLetter == "string")	{
                driveLetter = driveLetter.trim();
                if(driveLetter == "") {
                    driveLetter = undefined;
                }
            }
            else {
                throw (new Error("유효하지 않은 드라이브 지정"));
            }

            // #check username 
            if (typeof username != "string" && undefined != username) {
                throw (new Error("유효하지 않은 이름"));
            }
            else if (username == "") {
                username = undefined;
            }

            if (typeof password != "string" && undefined != password) {
                throw (new Error("유효하지 않은 패스워드"));
            }
            else if (password == "") {
                password = undefined;
            }


            const newDriveLetter = await driveLetters.randomFree();
            if (driveLetter == undefined) {
                driveLetter = newDriveLetter;
            }
            let mountCommand = "net use " + driveLetter + ": \"" + drivePath + "\" /P:Yes";
            if (username != undefined && password != undefined) {
                // mountCommand += " /user:" + username + "\" \"" + password + "\"";
                mountCommand = mountCommand + ` /user:"${username}" "${password}"`;
            }
            const result = await exec(mountCommand, { maxBuffer: MAX_BUFFER_SIZE });
            assertIfNonEmptyString(result.stderr);
            resolve();
        }
        catch(e) {
            reject(e);
        }
    });
}


/**
 * 네트워크 드라이브 해제
 */
WindowsNetwork.unmount = async (driveLetter) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!WindowsNetwork.isWinOs()) {
                throw new Error("윈도우 OS만 사용 가능");
            }
            
            if (typeof driveLetter != "string" || driveLetter.trim().length <= 0) {
                throw (new Error('잘못된 letter'));
            }
            driveLetter = driveLetter.trim().toUpperCase();

            const usedList = await driveLetters.used();                
            if (usedList.indexOf(driveLetter) != -1)
            {
                let unmountCommand = "net use " + driveLetter + ": /Delete /y";
                const result = await exec(unmountCommand, { maxBuffer: MAX_BUFFER_SIZE });
                assertIfNonEmptyString(result.stderr);
            }
            resolve();
        }
        catch(e) {
            reject(e);
        }
    });
}
module.exports = WindowsNetwork;