/// <reference types="node" />
import * as fs from 'fs';
import { CompressionMethod } from './constants';
export declare function createTempDirectory(): Promise<string>;
export declare function getArchiveFileSizeInBytes(filePath: string): number;
export declare function resolvePaths(patterns: string[]): Promise<string[]>;
export declare function unlinkFile(filePath: fs.PathLike): Promise<void>;
export declare function getCompressionMethod(): Promise<CompressionMethod>;
export declare function getCacheFileName(compressionMethod: CompressionMethod): string;
export declare function getGnuTarPathOnWindows(): Promise<string>;
export declare function assertDefined<T>(name: string, value?: T): T;
export declare function getCacheVersion(paths: string[], compressionMethod?: CompressionMethod, enableCrossOsArchive?: boolean): string;
export declare function getRuntimeToken(): string;
export declare function getLocalCacheDirectory(localCacheDirectoryBasePath: string, key: string, version: string): string;
