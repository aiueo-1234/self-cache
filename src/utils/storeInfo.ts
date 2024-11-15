import { mkdirP } from '@actions/io';
import { join } from 'path';

export interface StoreInfo {
  key: string;
  storeDir: string;
  storeFileName: string;
  storeFilePath: string;
}

export async function getStoreInfo(
  key: string,
  base: string,
): Promise<StoreInfo> {
  const storeDir = join(base, key);
  const storeFileName = `${key}.7z`;
  const storeFilePath = join(storeDir, storeFileName);
  await mkdirP(storeDir);
  return {
    key: key,
    storeDir: storeDir,
    storeFileName: storeFileName,
    storeFilePath: storeFilePath,
  };
}
