import { getInput, info, platform } from "@actions/core";
import * as exec from "@actions/exec";
import { mkdirP, mv, rmRF } from "@actions/io";
import { exists } from "@actions/io/lib/io-util";
import { dirname, isAbsolute, join } from "path";

import { Inputs } from "./constants";
import { isAllDirectories } from "./path";
import { getStoreInfo, StoreInfo } from "./storeInfo";

export async function saveCache(
    cachePaths: string[],
    key: string
): Promise<number> {
    const base = getInput(Inputs.Base);

    // convert abs path
    cachePaths = cachePaths.map(path => {
        if (!isAbsolute(path)) {
            return join(process.env["GITHUB_WORKSPACE"] ?? process.cwd(), base);
        } else {
            return path;
        }
    });

    // check directory
    const ret = await isAllDirectories([...cachePaths, base]);
    if (ret.length > 0) {
        throw new Error(`${ret.join(",")} is not directory or don't exist.`);
    }

    const storeInfo = await getStoreInfo(key, base);
    await compress(cachePaths, storeInfo);
    return 1;
}

export async function compress(
    compDirPaths: string[],
    storeInfo: StoreInfo
): Promise<void> {
    if (!platform.isLinux) {
        throw new Error(`Sorry. Cureent suport is Linux only.`);
    } else {
        if (await exists(storeInfo.storeFilePath)) {
            await rmRF(storeInfo.storeFilePath);
        }
        let myOutput = "";
        let myError = "";
        const ret = await exec.exec(
            "7z",
            ["a", storeInfo.storeFileName, ...compDirPaths],
            {
                cwd: storeInfo.storeDir,
                listeners: {
                    stdout: (data: Buffer) => {
                        myOutput += data.toString();
                    },
                    stderr: (data: Buffer) => {
                        myError += data.toString();
                    }
                }
            }
        );
        info(`out: ${myOutput}`);
        info(`err: ${myError}`);
        if (ret !== 0) {
            throw new Error("faile compression");
        }
    }
}

export async function restoreCache(
    cachePaths: string[],
    key: string,
    restoreKeys: string[],
    lookupOnly: boolean
): Promise<string | null> {
    const base = getInput(Inputs.Base);

    // convert abs path
    cachePaths = cachePaths.map(path => {
        if (!isAbsolute(path)) {
            return join(process.env["GITHUB_WORKSPACE"] ?? process.cwd(), base);
        } else {
            return path;
        }
    });

    // check directory
    const ret = await isAllDirectories([...cachePaths, base]);
    if (ret.length > 0) {
        throw new Error(`${ret.join(",")} is not directory or don't exist.`);
    }

    let storeInfo = await getStoreInfo(key, base);
    let restoredKey = await decompress(cachePaths, storeInfo, lookupOnly);
    if (restoredKey === null || restoredKey === undefined) {
        for (let index = 0; index < restoreKeys.length; index++) {
            const restoreKey = restoreKeys[index];
            storeInfo = await getStoreInfo(restoreKey, base);
            restoredKey = await decompress(cachePaths, storeInfo, lookupOnly);
            if (restoreKey !== null) {
                break;
            }
        }
    }
    return restoredKey ? restoredKey : null;
}

export async function decompress(
    cachePaths: string[],
    storeInfo: StoreInfo,
    lookupOnly: boolean
): Promise<string | null | void> {
    if (!platform.isLinux) {
        throw new Error(`Sorry. Cureent suport is Linux only.`);
    } else {
        if (await exists(storeInfo.storeFilePath)) {
            return null;
        }
        if (!lookupOnly) {
            const ret = await exec.exec("7z", ["x", storeInfo.storeFilePath], {
                cwd: storeInfo.storeDir
            });
            if (ret !== 0) {
                throw new Error("faile decompression");
            }
            cachePaths.forEach(path => {
                mkdirP(path);
                mv(join(storeInfo.storeDir, dirname(path)), path, {
                    force: true
                });
            });
            return storeInfo.key;
        } else {
            return null;
        }
    }
}
