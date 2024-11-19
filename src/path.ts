import { isDirectory } from "@actions/io/lib/io-util";

export async function isAllDirectories(
    directoryPathes: string[]
): Promise<string[]> {
    const ret = await Promise.all(
        directoryPathes.map(async path => {
            return { p: path, isNotDir: !(await isDirectory(path)) };
        })
    );
    return ret.filter(val => val.isNotDir).map(val => val.p);
}
