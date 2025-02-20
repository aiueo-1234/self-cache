"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = exports.GetCacheEntryDownloadURLResponse = exports.GetCacheEntryDownloadURLRequest = exports.FinalizeCacheEntryUploadResponse = exports.FinalizeCacheEntryUploadRequest = exports.CreateCacheEntryResponse = exports.CreateCacheEntryRequest = void 0;
// @generated by protobuf-ts 2.9.1 with parameter long_type_string,client_none,generate_dependencies
// @generated from protobuf file "results/api/v1/cache.proto" (package "github.actions.results.api.v1", syntax proto3)
// tslint:disable
const runtime_rpc_1 = require("@protobuf-ts/runtime-rpc");
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
const cachemetadata_1 = require("../../entities/v1/cachemetadata");
// @generated message type with reflection information, may provide speed optimized methods
class CreateCacheEntryRequest$Type extends runtime_5.MessageType {
    constructor() {
        super("github.actions.results.api.v1.CreateCacheEntryRequest", [
            { no: 1, name: "metadata", kind: "message", T: () => cachemetadata_1.CacheMetadata },
            { no: 2, name: "key", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "version", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { key: "", version: "" };
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* github.actions.results.entities.v1.CacheMetadata metadata */ 1:
                    message.metadata = cachemetadata_1.CacheMetadata.internalBinaryRead(reader, reader.uint32(), options, message.metadata);
                    break;
                case /* string key */ 2:
                    message.key = reader.string();
                    break;
                case /* string version */ 3:
                    message.version = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* github.actions.results.entities.v1.CacheMetadata metadata = 1; */
        if (message.metadata)
            cachemetadata_1.CacheMetadata.internalBinaryWrite(message.metadata, writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* string key = 2; */
        if (message.key !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.key);
        /* string version = 3; */
        if (message.version !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.version);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message github.actions.results.api.v1.CreateCacheEntryRequest
 */
exports.CreateCacheEntryRequest = new CreateCacheEntryRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class CreateCacheEntryResponse$Type extends runtime_5.MessageType {
    constructor() {
        super("github.actions.results.api.v1.CreateCacheEntryResponse", [
            { no: 1, name: "ok", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 2, name: "signed_upload_url", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { ok: false, signedUploadUrl: "" };
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bool ok */ 1:
                    message.ok = reader.bool();
                    break;
                case /* string signed_upload_url */ 2:
                    message.signedUploadUrl = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* bool ok = 1; */
        if (message.ok !== false)
            writer.tag(1, runtime_1.WireType.Varint).bool(message.ok);
        /* string signed_upload_url = 2; */
        if (message.signedUploadUrl !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.signedUploadUrl);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message github.actions.results.api.v1.CreateCacheEntryResponse
 */
exports.CreateCacheEntryResponse = new CreateCacheEntryResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class FinalizeCacheEntryUploadRequest$Type extends runtime_5.MessageType {
    constructor() {
        super("github.actions.results.api.v1.FinalizeCacheEntryUploadRequest", [
            { no: 1, name: "metadata", kind: "message", T: () => cachemetadata_1.CacheMetadata },
            { no: 2, name: "key", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "size_bytes", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 4, name: "version", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { key: "", sizeBytes: "0", version: "" };
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* github.actions.results.entities.v1.CacheMetadata metadata */ 1:
                    message.metadata = cachemetadata_1.CacheMetadata.internalBinaryRead(reader, reader.uint32(), options, message.metadata);
                    break;
                case /* string key */ 2:
                    message.key = reader.string();
                    break;
                case /* int64 size_bytes */ 3:
                    message.sizeBytes = reader.int64().toString();
                    break;
                case /* string version */ 4:
                    message.version = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* github.actions.results.entities.v1.CacheMetadata metadata = 1; */
        if (message.metadata)
            cachemetadata_1.CacheMetadata.internalBinaryWrite(message.metadata, writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* string key = 2; */
        if (message.key !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.key);
        /* int64 size_bytes = 3; */
        if (message.sizeBytes !== "0")
            writer.tag(3, runtime_1.WireType.Varint).int64(message.sizeBytes);
        /* string version = 4; */
        if (message.version !== "")
            writer.tag(4, runtime_1.WireType.LengthDelimited).string(message.version);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message github.actions.results.api.v1.FinalizeCacheEntryUploadRequest
 */
exports.FinalizeCacheEntryUploadRequest = new FinalizeCacheEntryUploadRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class FinalizeCacheEntryUploadResponse$Type extends runtime_5.MessageType {
    constructor() {
        super("github.actions.results.api.v1.FinalizeCacheEntryUploadResponse", [
            { no: 1, name: "ok", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 2, name: "entry_id", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value) {
        const message = { ok: false, entryId: "0" };
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bool ok */ 1:
                    message.ok = reader.bool();
                    break;
                case /* int64 entry_id */ 2:
                    message.entryId = reader.int64().toString();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* bool ok = 1; */
        if (message.ok !== false)
            writer.tag(1, runtime_1.WireType.Varint).bool(message.ok);
        /* int64 entry_id = 2; */
        if (message.entryId !== "0")
            writer.tag(2, runtime_1.WireType.Varint).int64(message.entryId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message github.actions.results.api.v1.FinalizeCacheEntryUploadResponse
 */
exports.FinalizeCacheEntryUploadResponse = new FinalizeCacheEntryUploadResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetCacheEntryDownloadURLRequest$Type extends runtime_5.MessageType {
    constructor() {
        super("github.actions.results.api.v1.GetCacheEntryDownloadURLRequest", [
            { no: 1, name: "metadata", kind: "message", T: () => cachemetadata_1.CacheMetadata },
            { no: 2, name: "key", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "restore_keys", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "version", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { key: "", restoreKeys: [], version: "" };
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* github.actions.results.entities.v1.CacheMetadata metadata */ 1:
                    message.metadata = cachemetadata_1.CacheMetadata.internalBinaryRead(reader, reader.uint32(), options, message.metadata);
                    break;
                case /* string key */ 2:
                    message.key = reader.string();
                    break;
                case /* repeated string restore_keys */ 3:
                    message.restoreKeys.push(reader.string());
                    break;
                case /* string version */ 4:
                    message.version = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* github.actions.results.entities.v1.CacheMetadata metadata = 1; */
        if (message.metadata)
            cachemetadata_1.CacheMetadata.internalBinaryWrite(message.metadata, writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* string key = 2; */
        if (message.key !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.key);
        /* repeated string restore_keys = 3; */
        for (let i = 0; i < message.restoreKeys.length; i++)
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.restoreKeys[i]);
        /* string version = 4; */
        if (message.version !== "")
            writer.tag(4, runtime_1.WireType.LengthDelimited).string(message.version);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message github.actions.results.api.v1.GetCacheEntryDownloadURLRequest
 */
exports.GetCacheEntryDownloadURLRequest = new GetCacheEntryDownloadURLRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetCacheEntryDownloadURLResponse$Type extends runtime_5.MessageType {
    constructor() {
        super("github.actions.results.api.v1.GetCacheEntryDownloadURLResponse", [
            { no: 1, name: "ok", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 2, name: "signed_download_url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "matched_key", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { ok: false, signedDownloadUrl: "", matchedKey: "" };
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bool ok */ 1:
                    message.ok = reader.bool();
                    break;
                case /* string signed_download_url */ 2:
                    message.signedDownloadUrl = reader.string();
                    break;
                case /* string matched_key */ 3:
                    message.matchedKey = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* bool ok = 1; */
        if (message.ok !== false)
            writer.tag(1, runtime_1.WireType.Varint).bool(message.ok);
        /* string signed_download_url = 2; */
        if (message.signedDownloadUrl !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.signedDownloadUrl);
        /* string matched_key = 3; */
        if (message.matchedKey !== "")
            writer.tag(3, runtime_1.WireType.LengthDelimited).string(message.matchedKey);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message github.actions.results.api.v1.GetCacheEntryDownloadURLResponse
 */
exports.GetCacheEntryDownloadURLResponse = new GetCacheEntryDownloadURLResponse$Type();
/**
 * @generated ServiceType for protobuf service github.actions.results.api.v1.CacheService
 */
exports.CacheService = new runtime_rpc_1.ServiceType("github.actions.results.api.v1.CacheService", [
    { name: "CreateCacheEntry", options: {}, I: exports.CreateCacheEntryRequest, O: exports.CreateCacheEntryResponse },
    { name: "FinalizeCacheEntryUpload", options: {}, I: exports.FinalizeCacheEntryUploadRequest, O: exports.FinalizeCacheEntryUploadResponse },
    { name: "GetCacheEntryDownloadURL", options: {}, I: exports.GetCacheEntryDownloadURLRequest, O: exports.GetCacheEntryDownloadURLResponse }
]);
//# sourceMappingURL=cache.js.map