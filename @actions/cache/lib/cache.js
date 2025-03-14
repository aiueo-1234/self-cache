"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCache = exports.restoreCache = exports.isFeatureAvailable = exports.ReserveCacheError = exports.ValidationError = void 0;
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const ioUtil = __importStar(require("@actions/io/lib/io-util"));
const path = __importStar(require("path"));
const utils = __importStar(require("./internal/cacheUtils"));
const cacheHttpClient = __importStar(require("./internal/cacheHttpClient"));
const cacheTwirpClient = __importStar(require("./internal/shared/cacheTwirpClient"));
const config_1 = require("./internal/config");
const tar_1 = require("./internal/tar");
const constants_1 = require("./internal/constants");
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
class ReserveCacheError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ReserveCacheError';
        Object.setPrototypeOf(this, ReserveCacheError.prototype);
    }
}
exports.ReserveCacheError = ReserveCacheError;
function checkPaths(paths) {
    if (!paths || paths.length === 0) {
        throw new ValidationError(`Path Validation Error: At least one directory or file path is required`);
    }
}
function checkKey(key) {
    if (key.length > 512) {
        throw new ValidationError(`Key Validation Error: ${key} cannot be larger than 512 characters.`);
    }
    const regex = /^[^,]*$/;
    if (!regex.test(key)) {
        throw new ValidationError(`Key Validation Error: ${key} cannot contain commas.`);
    }
}
function checkLocalCacheDirectoryBasePath(options) {
    if (!(options === null || options === void 0 ? void 0 : options.useLocalCache)) {
        return;
    }
    if (options.localCacheDirectoryBasePath === '' ||
        options.localCacheDirectoryBasePath === undefined) {
        throw new ValidationError(`localCacheDirectoryBasePath is empty. If you want to save cache to local machine, you must set this option.`);
    }
    if (!ioUtil.isRooted(options.localCacheDirectoryBasePath)) {
        throw new ValidationError('localCacheDirectoryBasePath must be absolute path.');
    }
}
/**
 * isFeatureAvailable to check the presence of Actions cache service
 *
 * @returns boolean return true if Actions cache service feature is available, otherwise false
 */
function isFeatureAvailable() {
    return !!process.env['ACTIONS_CACHE_URL'];
}
exports.isFeatureAvailable = isFeatureAvailable;
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
function restoreCache(paths, primaryKey, restoreKeys, options, enableCrossOsArchive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheServiceVersion = (0, config_1.getCacheServiceVersion)();
        core.debug(`Cache service version: ${cacheServiceVersion}`);
        checkPaths(paths);
        switch (cacheServiceVersion) {
            case 'v2':
                return yield restoreCacheV2(paths, primaryKey, restoreKeys, options, enableCrossOsArchive);
            case 'v1':
            default:
                return yield restoreCacheV1(paths, primaryKey, restoreKeys, options, enableCrossOsArchive);
        }
    });
}
exports.restoreCache = restoreCache;
/**
 * Restores cache using the legacy Cache Service
 *
 * @param paths a list of file paths to restore from the cache
 * @param primaryKey an explicit key for restoring the cache. Lookup is done with prefix matching.
 * @param restoreKeys an optional ordered list of keys to use for restoring the cache if no cache hit occurred for primaryKey
 * @param options cache download options
 * @param enableCrossOsArchive an optional boolean enabled to restore on Windows any cache created on any platform
 * @returns string returns the key for the cache hit, otherwise returns undefined
 */
function restoreCacheV1(paths, primaryKey, restoreKeys, options, enableCrossOsArchive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        restoreKeys = restoreKeys || [];
        const keys = [primaryKey, ...restoreKeys];
        core.debug('Resolved Keys:');
        core.debug(JSON.stringify(keys));
        if (keys.length > 10) {
            throw new ValidationError(`Key Validation Error: Keys are limited to a maximum of 10.`);
        }
        for (const key of keys) {
            checkKey(key);
        }
        const compressionMethod = yield utils.getCompressionMethod();
        let archivePath = '';
        try {
            // path are needed to compute version
            const cacheEntry = yield cacheHttpClient.getCacheEntry(keys, paths, {
                compressionMethod,
                enableCrossOsArchive
            });
            if (!(cacheEntry === null || cacheEntry === void 0 ? void 0 : cacheEntry.archiveLocation)) {
                // Cache not found
                return undefined;
            }
            if (options === null || options === void 0 ? void 0 : options.lookupOnly) {
                core.info('Lookup only - skipping download');
                return cacheEntry.cacheKey;
            }
            archivePath = path.join(yield utils.createTempDirectory(), utils.getCacheFileName(compressionMethod));
            core.debug(`Archive Path: ${archivePath}`);
            // Download the cache from the cache entry
            yield cacheHttpClient.downloadCache(cacheEntry.archiveLocation, archivePath, options);
            if (core.isDebug()) {
                yield (0, tar_1.listTar)(archivePath, compressionMethod);
            }
            const archiveFileSize = utils.getArchiveFileSizeInBytes(archivePath);
            core.info(`Cache Size: ~${Math.round(archiveFileSize / (1024 * 1024))} MB (${archiveFileSize} B)`);
            yield (0, tar_1.extractTar)(archivePath, compressionMethod);
            core.info('Cache restored successfully');
            return cacheEntry.cacheKey;
        }
        catch (error) {
            const typedError = error;
            if (typedError.name === ValidationError.name) {
                throw error;
            }
            else {
                // Supress all non-validation cache related errors because caching should be optional
                core.warning(`Failed to restore: ${error.message}`);
            }
        }
        finally {
            // Try to delete the archive to save space
            try {
                yield utils.unlinkFile(archivePath);
            }
            catch (error) {
                core.debug(`Failed to delete archive: ${error}`);
            }
        }
        return undefined;
    });
}
/**
 * Restores cache using Cache Service v2
 *
 * @param paths a list of file paths to restore from the cache
 * @param primaryKey an explicit key for restoring the cache. Lookup is done with prefix matching
 * @param restoreKeys an optional ordered list of keys to use for restoring the cache if no cache hit occurred for primaryKey
 * @param downloadOptions cache download options
 * @param enableCrossOsArchive an optional boolean enabled to restore on windows any cache created on any platform
 * @returns string returns the key for the cache hit, otherwise returns undefined
 */
function restoreCacheV2(paths, primaryKey, restoreKeys, options, enableCrossOsArchive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        // Override UploadOptions to force the use of Azure
        options = Object.assign(Object.assign({}, options), { useAzureSdk: true });
        restoreKeys = restoreKeys || [];
        const keys = [primaryKey, ...restoreKeys];
        core.debug('Resolved Keys:');
        core.debug(JSON.stringify(keys));
        if (keys.length > 10) {
            throw new ValidationError(`Key Validation Error: Keys are limited to a maximum of 10.`);
        }
        for (const key of keys) {
            checkKey(key);
        }
        let archivePath = '';
        try {
            const twirpClient = cacheTwirpClient.internalCacheTwirpClient();
            const compressionMethod = yield utils.getCompressionMethod();
            if (options === null || options === void 0 ? void 0 : options.useLocalCache) {
                return yield restoreCacheLocal(primaryKey, restoreKeys, utils.getCacheVersion(paths, compressionMethod, enableCrossOsArchive), options, compressionMethod, options.lookupOnly);
            }
            const request = {
                key: primaryKey,
                restoreKeys,
                version: utils.getCacheVersion(paths, compressionMethod, enableCrossOsArchive)
            };
            const response = yield twirpClient.GetCacheEntryDownloadURL(request);
            if (!response.ok) {
                core.debug(`Cache not found for keys: ${keys.join(', ')}`);
                return undefined;
            }
            core.info(`Cache hit for: ${request.key}`);
            if (options === null || options === void 0 ? void 0 : options.lookupOnly) {
                core.info('Lookup only - skipping download');
                return response.matchedKey;
            }
            archivePath = path.join(yield utils.createTempDirectory(), utils.getCacheFileName(compressionMethod));
            core.debug(`Archive path: ${archivePath}`);
            core.debug(`Starting download of archive to: ${archivePath}`);
            yield cacheHttpClient.downloadCache(response.signedDownloadUrl, archivePath, options);
            const archiveFileSize = utils.getArchiveFileSizeInBytes(archivePath);
            core.info(`Cache Size: ~${Math.round(archiveFileSize / (1024 * 1024))} MB (${archiveFileSize} B)`);
            if (core.isDebug()) {
                yield (0, tar_1.listTar)(archivePath, compressionMethod);
            }
            yield (0, tar_1.extractTar)(archivePath, compressionMethod);
            core.info('Cache restored successfully');
            return response.matchedKey;
        }
        catch (error) {
            const typedError = error;
            if (typedError.name === ValidationError.name) {
                throw error;
            }
            else {
                // Supress all non-validation cache related errors because caching should be optional
                core.warning(`Failed to restore: ${error.message}`);
            }
        }
        finally {
            try {
                if (archivePath) {
                    yield utils.unlinkFile(archivePath);
                }
            }
            catch (error) {
                core.debug(`Failed to delete archive: ${error}`);
            }
        }
        return undefined;
    });
}
function restoreCacheLocal(primaryKey, restoreKeys, version, localCacheOptions, compressionMethod, lookupOnly = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let restoredKey = primaryKey;
        let dist = utils.getLocalCacheDirectory(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        localCacheOptions.localCacheDirectoryBasePath, primaryKey, version);
        if (!(yield ioUtil.exists(dist))) {
            for (const key of restoreKeys) {
                dist = utils.getLocalCacheDirectory(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                localCacheOptions.localCacheDirectoryBasePath, key, version);
                if (yield ioUtil.exists(dist)) {
                    restoredKey = key;
                    break;
                }
            }
            restoredKey = undefined;
        }
        if (lookupOnly) {
            return restoredKey;
        }
        yield (0, tar_1.extractTar)(dist, compressionMethod);
        return restoredKey;
    });
}
/**
 * Saves a list of files with the specified key
 *
 * @param paths a list of file paths to be cached
 * @param key an explicit key for restoring the cache
 * @param enableCrossOsArchive an optional boolean enabled to save cache on windows which could be restored on any platform
 * @param options cache upload options
 * @returns number returns cacheId if the cache was saved successfully and throws an error if save fails
 */
function saveCache(paths, key, options, enableCrossOsArchive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheServiceVersion = (0, config_1.getCacheServiceVersion)();
        core.debug(`Cache service version: ${cacheServiceVersion}`);
        checkPaths(paths);
        checkKey(key);
        checkLocalCacheDirectoryBasePath(options);
        switch (cacheServiceVersion) {
            case 'v2':
                return yield saveCacheV2(paths, key, options, enableCrossOsArchive);
            case 'v1':
            default:
                return yield saveCacheV1(paths, key, options, enableCrossOsArchive);
        }
    });
}
exports.saveCache = saveCache;
/**
 * Save cache using the legacy Cache Service
 *
 * @param paths
 * @param key
 * @param options
 * @param enableCrossOsArchive
 * @returns
 */
function saveCacheV1(paths, key, options, enableCrossOsArchive = false) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const compressionMethod = yield utils.getCompressionMethod();
        let cacheId = -1;
        const cachePaths = yield utils.resolvePaths(paths);
        core.debug('Cache Paths:');
        core.debug(`${JSON.stringify(cachePaths)}`);
        if (cachePaths.length === 0) {
            throw new Error(`Path Validation Error: Path(s) specified in the action for caching do(es) not exist, hence no cache is being saved.`);
        }
        const archiveFolder = yield utils.createTempDirectory();
        const archivePath = path.join(archiveFolder, utils.getCacheFileName(compressionMethod));
        core.debug(`Archive Path: ${archivePath}`);
        try {
            yield (0, tar_1.createTar)(archiveFolder, cachePaths, compressionMethod);
            if (core.isDebug()) {
                yield (0, tar_1.listTar)(archivePath, compressionMethod);
            }
            const fileSizeLimit = 10 * 1024 * 1024 * 1024; // 10GB per repo limit
            const archiveFileSize = utils.getArchiveFileSizeInBytes(archivePath);
            core.debug(`File Size: ${archiveFileSize}`);
            // check useLocalCache
            if ((options === null || options === void 0 ? void 0 : options.useLocalCache) === true) {
                const version = utils.getCacheVersion(paths, compressionMethod, enableCrossOsArchive);
                yield saveCacheLocal(archivePath, key, version, options);
                cacheId = 0;
                return cacheId;
            }
            // For GHES, this check will take place in ReserveCache API with enterprise file size limit
            if (archiveFileSize > fileSizeLimit && !(0, config_1.isGhes)()) {
                throw new Error(`Cache size of ~${Math.round(archiveFileSize / (1024 * 1024))} MB (${archiveFileSize} B) is over the 10GB limit, not saving cache.`);
            }
            core.debug('Reserving Cache');
            const reserveCacheResponse = yield cacheHttpClient.reserveCache(key, paths, {
                compressionMethod,
                enableCrossOsArchive,
                cacheSize: archiveFileSize
            });
            if ((_a = reserveCacheResponse === null || reserveCacheResponse === void 0 ? void 0 : reserveCacheResponse.result) === null || _a === void 0 ? void 0 : _a.cacheId) {
                cacheId = (_b = reserveCacheResponse === null || reserveCacheResponse === void 0 ? void 0 : reserveCacheResponse.result) === null || _b === void 0 ? void 0 : _b.cacheId;
            }
            else if ((reserveCacheResponse === null || reserveCacheResponse === void 0 ? void 0 : reserveCacheResponse.statusCode) === 400) {
                throw new Error((_d = (_c = reserveCacheResponse === null || reserveCacheResponse === void 0 ? void 0 : reserveCacheResponse.error) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : `Cache size of ~${Math.round(archiveFileSize / (1024 * 1024))} MB (${archiveFileSize} B) is over the data cap limit, not saving cache.`);
            }
            else {
                throw new ReserveCacheError(`Unable to reserve cache with key ${key}, another job may be creating this cache. More details: ${(_e = reserveCacheResponse === null || reserveCacheResponse === void 0 ? void 0 : reserveCacheResponse.error) === null || _e === void 0 ? void 0 : _e.message}`);
            }
            core.debug(`Saving Cache (ID: ${cacheId})`);
            yield cacheHttpClient.saveCache(cacheId, archivePath, '', options);
        }
        catch (error) {
            const typedError = error;
            if (typedError.name === ValidationError.name) {
                throw error;
            }
            else if (typedError.name === ReserveCacheError.name) {
                core.info(`Failed to save: ${typedError.message}`);
            }
            else {
                core.warning(`Failed to save: ${typedError.message}`);
            }
        }
        finally {
            // Try to delete the archive to save space
            try {
                yield utils.unlinkFile(archivePath);
            }
            catch (error) {
                core.debug(`Failed to delete archive: ${error}`);
            }
        }
        return cacheId;
    });
}
/**
 * Save cache using Cache Service v2
 *
 * @param paths a list of file paths to restore from the cache
 * @param key an explicit key for restoring the cache
 * @param options cache upload options
 * @param enableCrossOsArchive an optional boolean enabled to save cache on windows which could be restored on any platform
 * @returns
 */
function saveCacheV2(paths, key, options, enableCrossOsArchive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        // Override UploadOptions to force the use of Azure
        // ...options goes first because we want to override the default values
        // set in UploadOptions with these specific figures
        options = Object.assign(Object.assign({}, options), { uploadChunkSize: 64 * 1024 * 1024, uploadConcurrency: 8, useAzureSdk: true });
        const compressionMethod = yield utils.getCompressionMethod();
        const twirpClient = cacheTwirpClient.internalCacheTwirpClient();
        let cacheId = -1;
        const cachePaths = yield utils.resolvePaths(paths);
        core.debug('Cache Paths:');
        core.debug(`${JSON.stringify(cachePaths)}`);
        if (cachePaths.length === 0) {
            throw new Error(`Path Validation Error: Path(s) specified in the action for caching do(es) not exist, hence no cache is being saved.`);
        }
        const archiveFolder = yield utils.createTempDirectory();
        const archivePath = path.join(archiveFolder, utils.getCacheFileName(compressionMethod));
        core.debug(`Archive Path: ${archivePath}`);
        try {
            yield (0, tar_1.createTar)(archiveFolder, cachePaths, compressionMethod);
            if (core.isDebug()) {
                yield (0, tar_1.listTar)(archivePath, compressionMethod);
            }
            const archiveFileSize = utils.getArchiveFileSizeInBytes(archivePath);
            core.debug(`File Size: ${archiveFileSize}`);
            // For GHES, this check will take place in ReserveCache API with enterprise file size limit
            if (archiveFileSize > constants_1.CacheFileSizeLimit &&
                !(0, config_1.isGhes)() &&
                !options.useLocalCache) {
                throw new Error(`Cache size of ~${Math.round(archiveFileSize / (1024 * 1024))} MB (${archiveFileSize} B) is over the 10GB limit, not saving cache.`);
            }
            // Set the archive size in the options, will be used to display the upload progress
            options.archiveSizeBytes = archiveFileSize;
            core.debug('Reserving Cache');
            const version = utils.getCacheVersion(paths, compressionMethod, enableCrossOsArchive);
            // check useLocalCache
            if (options.useLocalCache) {
                yield saveCacheLocal(archivePath, key, version, options);
                cacheId = 0;
                return cacheId;
            }
            const request = {
                key,
                version
            };
            const response = yield twirpClient.CreateCacheEntry(request);
            if (!response.ok) {
                throw new ReserveCacheError(`Unable to reserve cache with key ${key}, another job may be creating this cache.`);
            }
            core.debug(`Attempting to upload cache located at: ${archivePath}`);
            yield cacheHttpClient.saveCache(cacheId, archivePath, response.signedUploadUrl, options);
            const finalizeRequest = {
                key,
                version,
                sizeBytes: `${archiveFileSize}`
            };
            const finalizeResponse = yield twirpClient.FinalizeCacheEntryUpload(finalizeRequest);
            core.debug(`FinalizeCacheEntryUploadResponse: ${finalizeResponse.ok}`);
            if (!finalizeResponse.ok) {
                throw new Error(`Unable to finalize cache with key ${key}, another job may be finalizing this cache.`);
            }
            cacheId = parseInt(finalizeResponse.entryId);
        }
        catch (error) {
            const typedError = error;
            if (typedError.name === ValidationError.name) {
                throw error;
            }
            else if (typedError.name === ReserveCacheError.name) {
                core.info(`Failed to save: ${typedError.message}`);
            }
            else {
                core.warning(`Failed to save: ${typedError.message}`);
            }
        }
        finally {
            // Try to delete the archive to save space
            try {
                yield utils.unlinkFile(archivePath);
            }
            catch (error) {
                core.debug(`Failed to delete archive: ${error}`);
            }
        }
        return cacheId;
    });
}
function saveCacheLocal(archivePath, key, version, localCacheOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const dist = utils.getLocalCacheDirectory(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        localCacheOptions.localCacheDirectoryBasePath, key, version);
        if (!(yield ioUtil.exists(dist))) {
            yield io.mkdirP(dist);
        }
        yield io.mv(archivePath, dist, { force: true });
    });
}
//# sourceMappingURL=cache.js.map