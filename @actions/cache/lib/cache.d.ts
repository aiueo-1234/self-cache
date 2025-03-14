import { DownloadOptions, UploadOptions } from './options';
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare class ReserveCacheError extends Error {
    constructor(message: string);
}
/**
 * isFeatureAvailable to check the presence of Actions cache service
 *
 * @returns boolean return true if Actions cache service feature is available, otherwise false
 */
export declare function isFeatureAvailable(): boolean;
/**
 * Restores cache from keys
 *
 * @param paths a list of file paths to restore from the cache
 * @param primaryKey an explicit key for restoring the cache. Lookup is done with prefix matching.
 * @param restoreKeys an optional ordered list of keys to use for restoring the cache if no cache hit occurred for primaryKey
 * @param downloadOptions cache download options
 * @param enableCrossOsArchive an optional boolean enabled to restore on windows any cache created on any platform
 * @returns string returns the key for the cache hit, otherwise returns undefined
 */
export declare function restoreCache(paths: string[], primaryKey: string, restoreKeys?: string[], options?: DownloadOptions, enableCrossOsArchive?: boolean): Promise<string | undefined>;
/**
 * Saves a list of files with the specified key
 *
 * @param paths a list of file paths to be cached
 * @param key an explicit key for restoring the cache
 * @param enableCrossOsArchive an optional boolean enabled to save cache on windows which could be restored on any platform
 * @param options cache upload options
 * @returns number returns cacheId if the cache was saved successfully and throws an error if save fails
 */
export declare function saveCache(paths: string[], key: string, options?: UploadOptions, enableCrossOsArchive?: boolean): Promise<number>;
