import { setFailed, platform } from '@actions/core';
import * as exec from '@actions/exec';
import { rmRF } from '@actions/io';
import { exists } from '@actions/io/lib/io-util';
import { StoreInfo } from './storeInfo';

export async function comp(
  compDirPath: string,
  storeInfo: StoreInfo,
  earlyExit?: boolean | undefined,
) {
  try {
    if (!platform.isLinux) {
      throw new Error(`Sorry. Cureent suport is Linux only.`);
    } else {
      if (await exists(storeInfo.storeFilePath)) {
        rmRF(storeInfo.storeFilePath);
      }
      await exec.exec('7z', ['a', storeInfo.storeFileName, compDirPath], {
        cwd: storeInfo.storeDir,
      });
    }
  } catch (error: unknown) {
    setFailed((error as Error).message);
    if (earlyExit) {
      process.exit(1);
    }
  }
}
