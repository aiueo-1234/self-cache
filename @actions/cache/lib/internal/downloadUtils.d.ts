/// <reference types="node" />
import { TransferProgressEvent } from '@azure/ms-rest-js';
import * as fs from 'fs';
import { DownloadOptions } from '../options';
/**
 * Class for tracking the download state and displaying stats.
 */
export declare class DownloadProgress {
    contentLength: number;
    segmentIndex: number;
    segmentSize: number;
    segmentOffset: number;
    receivedBytes: number;
    startTime: number;
    displayedComplete: boolean;
    timeoutHandle?: ReturnType<typeof setTimeout>;
    constructor(contentLength: number);
    /**
     * Progress to the next segment. Only call this method when the previous segment
     * is complete.
     *
     * @param segmentSize the length of the next segment
     */
    nextSegment(segmentSize: number): void;
    /**
     * Sets the number of bytes received for the current segment.
     *
     * @param receivedBytes the number of bytes received
     */
    setReceivedBytes(receivedBytes: number): void;
    /**
     * Returns the total number of bytes transferred.
     */
    getTransferredBytes(): number;
    /**
     * Returns true if the download is complete.
     */
    isDone(): boolean;
    /**
     * Prints the current download stats. Once the download completes, this will print one
     * last line and then stop.
     */
    display(): void;
    /**
     * Returns a function used to handle TransferProgressEvents.
     */
    onProgress(): (progress: TransferProgressEvent) => void;
    /**
     * Starts the timer that displays the stats.
     *
     * @param delayInMs the delay between each write
     */
    startDisplayTimer(delayInMs?: number): void;
    /**
     * Stops the timer that displays the stats. As this typically indicates the download
     * is complete, this will display one last line, unless the last line has already
     * been written.
     */
    stopDisplayTimer(): void;
}
/**
 * Download the cache using the Actions toolkit http-client
 *
 * @param archiveLocation the URL for the cache
 * @param archivePath the local path where the cache is saved
 */
export declare function downloadCacheHttpClient(archiveLocation: string, archivePath: string): Promise<void>;
/**
 * Download the cache using the Actions toolkit http-client concurrently
 *
 * @param archiveLocation the URL for the cache
 * @param archivePath the local path where the cache is saved
 */
export declare function downloadCacheHttpClientConcurrent(archiveLocation: string, archivePath: fs.PathLike, options: DownloadOptions): Promise<void>;
/**
 * Download the cache using the Azure Storage SDK.  Only call this method if the
 * URL points to an Azure Storage endpoint.
 *
 * @param archiveLocation the URL for the cache
 * @param archivePath the local path where the cache is saved
 * @param options the download options with the defaults set
 */
export declare function downloadCacheStorageSDK(archiveLocation: string, archivePath: string, options: DownloadOptions): Promise<void>;
