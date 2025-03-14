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
exports.saveCache = exports.reserveCache = exports.downloadCache = exports.getCacheEntry = void 0;
const core = __importStar(require("@actions/core"));
const http_client_1 = require("@actions/http-client");
const auth_1 = require("@actions/http-client/lib/auth");
const fs = __importStar(require("fs"));
const url_1 = require("url");
const utils = __importStar(require("./cacheUtils"));
const uploadUtils_1 = require("./uploadUtils");
const downloadUtils_1 = require("./downloadUtils");
const options_1 = require("../options");
const requestUtils_1 = require("./requestUtils");
const config_1 = require("./config");
const user_agent_1 = require("./shared/user-agent");
function getCacheApiUrl(resource) {
    const baseUrl = (0, config_1.getCacheServiceURL)();
    if (!baseUrl) {
        throw new Error('Cache Service Url not found, unable to restore cache.');
    }
    const url = `${baseUrl}_apis/artifactcache/${resource}`;
    core.debug(`Resource Url: ${url}`);
    return url;
}
function createAcceptHeader(type, apiVersion) {
    return `${type};api-version=${apiVersion}`;
}
function getRequestOptions() {
    const requestOptions = {
        headers: {
            Accept: createAcceptHeader('application/json', '6.0-preview.1')
        }
    };
    return requestOptions;
}
function createHttpClient() {
    const token = process.env['ACTIONS_RUNTIME_TOKEN'] || '';
    const bearerCredentialHandler = new auth_1.BearerCredentialHandler(token);
    return new http_client_1.HttpClient((0, user_agent_1.getUserAgentString)(), [bearerCredentialHandler], getRequestOptions());
}
function getCacheEntry(keys, paths, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const httpClient = createHttpClient();
        const version = utils.getCacheVersion(paths, options === null || options === void 0 ? void 0 : options.compressionMethod, options === null || options === void 0 ? void 0 : options.enableCrossOsArchive);
        const resource = `cache?keys=${encodeURIComponent(keys.join(','))}&version=${version}`;
        const response = yield (0, requestUtils_1.retryTypedResponse)('getCacheEntry', () => __awaiter(this, void 0, void 0, function* () { return httpClient.getJson(getCacheApiUrl(resource)); }));
        // Cache not found
        if (response.statusCode === 204) {
            // List cache for primary key only if cache miss occurs
            if (core.isDebug()) {
                yield printCachesListForDiagnostics(keys[0], httpClient, version);
            }
            return null;
        }
        if (!(0, requestUtils_1.isSuccessStatusCode)(response.statusCode)) {
            throw new Error(`Cache service responded with ${response.statusCode}`);
        }
        const cacheResult = response.result;
        const cacheDownloadUrl = cacheResult === null || cacheResult === void 0 ? void 0 : cacheResult.archiveLocation;
        if (!cacheDownloadUrl) {
            // Cache achiveLocation not found. This should never happen, and hence bail out.
            throw new Error('Cache not found.');
        }
        core.setSecret(cacheDownloadUrl);
        core.debug(`Cache Result:`);
        core.debug(JSON.stringify(cacheResult));
        return cacheResult;
    });
}
exports.getCacheEntry = getCacheEntry;
function printCachesListForDiagnostics(key, httpClient, version) {
    return __awaiter(this, void 0, void 0, function* () {
        const resource = `caches?key=${encodeURIComponent(key)}`;
        const response = yield (0, requestUtils_1.retryTypedResponse)('listCache', () => __awaiter(this, void 0, void 0, function* () { return httpClient.getJson(getCacheApiUrl(resource)); }));
        if (response.statusCode === 200) {
            const cacheListResult = response.result;
            const totalCount = cacheListResult === null || cacheListResult === void 0 ? void 0 : cacheListResult.totalCount;
            if (totalCount && totalCount > 0) {
                core.debug(`No matching cache found for cache key '${key}', version '${version} and scope ${process.env['GITHUB_REF']}. There exist one or more cache(s) with similar key but they have different version or scope. See more info on cache matching here: https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows#matching-a-cache-key \nOther caches with similar key:`);
                for (const cacheEntry of (cacheListResult === null || cacheListResult === void 0 ? void 0 : cacheListResult.artifactCaches) || []) {
                    core.debug(`Cache Key: ${cacheEntry === null || cacheEntry === void 0 ? void 0 : cacheEntry.cacheKey}, Cache Version: ${cacheEntry === null || cacheEntry === void 0 ? void 0 : cacheEntry.cacheVersion}, Cache Scope: ${cacheEntry === null || cacheEntry === void 0 ? void 0 : cacheEntry.scope}, Cache Created: ${cacheEntry === null || cacheEntry === void 0 ? void 0 : cacheEntry.creationTime}`);
                }
            }
        }
    });
}
function downloadCache(archiveLocation, archivePath, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const archiveUrl = new url_1.URL(archiveLocation);
        const downloadOptions = (0, options_1.getDownloadOptions)(options);
        if (archiveUrl.hostname.endsWith('.blob.core.windows.net')) {
            if (downloadOptions.useAzureSdk) {
                // Use Azure storage SDK to download caches hosted on Azure to improve speed and reliability.
                yield (0, downloadUtils_1.downloadCacheStorageSDK)(archiveLocation, archivePath, downloadOptions);
            }
            else if (downloadOptions.concurrentBlobDownloads) {
                // Use concurrent implementation with HttpClient to work around blob SDK issue
                yield (0, downloadUtils_1.downloadCacheHttpClientConcurrent)(archiveLocation, archivePath, downloadOptions);
            }
            else {
                // Otherwise, download using the Actions http-client.
                yield (0, downloadUtils_1.downloadCacheHttpClient)(archiveLocation, archivePath);
            }
        }
        else {
            yield (0, downloadUtils_1.downloadCacheHttpClient)(archiveLocation, archivePath);
        }
    });
}
exports.downloadCache = downloadCache;
// Reserve Cache
function reserveCache(key, paths, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const httpClient = createHttpClient();
        const version = utils.getCacheVersion(paths, options === null || options === void 0 ? void 0 : options.compressionMethod, options === null || options === void 0 ? void 0 : options.enableCrossOsArchive);
        const reserveCacheRequest = {
            key,
            version,
            cacheSize: options === null || options === void 0 ? void 0 : options.cacheSize
        };
        const response = yield (0, requestUtils_1.retryTypedResponse)('reserveCache', () => __awaiter(this, void 0, void 0, function* () {
            return httpClient.postJson(getCacheApiUrl('caches'), reserveCacheRequest);
        }));
        return response;
    });
}
exports.reserveCache = reserveCache;
function getContentRange(start, end) {
    // Format: `bytes start-end/filesize
    // start and end are inclusive
    // filesize can be *
    // For a 200 byte chunk starting at byte 0:
    // Content-Range: bytes 0-199/*
    return `bytes ${start}-${end}/*`;
}
function uploadChunk(httpClient, resourceUrl, openStream, start, end) {
    return __awaiter(this, void 0, void 0, function* () {
        core.debug(`Uploading chunk of size ${end - start + 1} bytes at offset ${start} with content range: ${getContentRange(start, end)}`);
        const additionalHeaders = {
            'Content-Type': 'application/octet-stream',
            'Content-Range': getContentRange(start, end)
        };
        const uploadChunkResponse = yield (0, requestUtils_1.retryHttpClientResponse)(`uploadChunk (start: ${start}, end: ${end})`, () => __awaiter(this, void 0, void 0, function* () {
            return httpClient.sendStream('PATCH', resourceUrl, openStream(), additionalHeaders);
        }));
        if (!(0, requestUtils_1.isSuccessStatusCode)(uploadChunkResponse.message.statusCode)) {
            throw new Error(`Cache service responded with ${uploadChunkResponse.message.statusCode} during upload chunk.`);
        }
    });
}
function uploadFile(httpClient, cacheId, archivePath, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // Upload Chunks
        const fileSize = utils.getArchiveFileSizeInBytes(archivePath);
        const resourceUrl = getCacheApiUrl(`caches/${cacheId.toString()}`);
        const fd = fs.openSync(archivePath, 'r');
        const uploadOptions = (0, options_1.getUploadOptions)(options);
        const concurrency = utils.assertDefined('uploadConcurrency', uploadOptions.uploadConcurrency);
        const maxChunkSize = utils.assertDefined('uploadChunkSize', uploadOptions.uploadChunkSize);
        const parallelUploads = [...new Array(concurrency).keys()];
        core.debug('Awaiting all uploads');
        let offset = 0;
        try {
            yield Promise.all(parallelUploads.map(() => __awaiter(this, void 0, void 0, function* () {
                while (offset < fileSize) {
                    const chunkSize = Math.min(fileSize - offset, maxChunkSize);
                    const start = offset;
                    const end = offset + chunkSize - 1;
                    offset += maxChunkSize;
                    yield uploadChunk(httpClient, resourceUrl, () => fs
                        .createReadStream(archivePath, {
                        fd,
                        start,
                        end,
                        autoClose: false
                    })
                        .on('error', error => {
                        throw new Error(`Cache upload failed because file read failed with ${error.message}`);
                    }), start, end);
                }
            })));
        }
        finally {
            fs.closeSync(fd);
        }
        return;
    });
}
function commitCache(httpClient, cacheId, filesize) {
    return __awaiter(this, void 0, void 0, function* () {
        const commitCacheRequest = { size: filesize };
        return yield (0, requestUtils_1.retryTypedResponse)('commitCache', () => __awaiter(this, void 0, void 0, function* () {
            return httpClient.postJson(getCacheApiUrl(`caches/${cacheId.toString()}`), commitCacheRequest);
        }));
    });
}
function saveCache(cacheId, archivePath, signedUploadURL, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const uploadOptions = (0, options_1.getUploadOptions)(options);
        if (uploadOptions.useAzureSdk) {
            // Use Azure storage SDK to upload caches directly to Azure
            if (!signedUploadURL) {
                throw new Error('Azure Storage SDK can only be used when a signed URL is provided.');
            }
            yield (0, uploadUtils_1.uploadCacheArchiveSDK)(signedUploadURL, archivePath, options);
        }
        else {
            const httpClient = createHttpClient();
            core.debug('Upload cache');
            yield uploadFile(httpClient, cacheId, archivePath, options);
            // Commit Cache
            core.debug('Commiting cache');
            const cacheSize = utils.getArchiveFileSizeInBytes(archivePath);
            core.info(`Cache Size: ~${Math.round(cacheSize / (1024 * 1024))} MB (${cacheSize} B)`);
            const commitCacheResponse = yield commitCache(httpClient, cacheId, cacheSize);
            if (!(0, requestUtils_1.isSuccessStatusCode)(commitCacheResponse.statusCode)) {
                throw new Error(`Cache service responded with ${commitCacheResponse.statusCode} during commit cache.`);
            }
            core.info('Cache saved successfully');
        }
    });
}
exports.saveCache = saveCache;
//# sourceMappingURL=cacheHttpClient.js.map