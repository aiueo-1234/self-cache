import { isDirectory } from '@actions/io/lib/io-util';

export async function isAllDirectories(directoryPathes: string[]) {
  let ret = await Promise.all(
    directoryPathes.map(async path => {
      return { p: path, isNotDir: !(await isDirectory(path)) };
    }),
  );
  return ret.filter(val => val.isNotDir).map(val => val.p);
}
