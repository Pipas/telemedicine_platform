var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Chunk } from '../models/chunk';
import * as localforage from 'localforage';
var ChunkManager = /** @class */ (function () {
    function ChunkManager(graph) {
        this.chunkIdAccumulator = 0;
        this.graph = graph;
        this.visibleChunks = [];
        this.leftLoadedChunks = [];
        this.rightLoadedChunks = [];
        this.updatingChunk = new Chunk(this.chunkIdAccumulator++);
        this.showChunk(this.updatingChunk);
        this.visibleChunks.push(this.updatingChunk);
    }
    ChunkManager.prototype.addPoint = function (point) {
        if (this.lastPoint == null) {
            this.lastPoint = point;
            return;
        }
        this.updatingChunk.add(this.lastPoint, point);
        this.lastPoint = point;
        if (this.updatingChunk.isFull()) {
            this.createNewUpdatingChunk();
            if (this.visibleChunks[this.visibleChunks.length - 1].getLastValue() < this.graph.visibleRange.maxX) {
                this.pushVisibleChunk();
            }
        }
        // console.log({
        //   left: this.leftLoadedChunks,
        //   visible: this.visibleChunks,
        //   right: this.rightLoadedChunks,
        // })
    };
    ChunkManager.prototype.checkChunkChange = function (delta) {
        if (delta > 0) {
            if (this.visibleChunks[this.visibleChunks.length - 1].getLastValue() < this.graph.visibleRange.maxX) {
                this.pushVisibleChunk();
            }
            if (this.visibleChunks[0].getLastValue() < this.graph.visibleRange.minX) {
                this.shiftVisibleChunk();
            }
        }
        else {
            if (this.visibleChunks[0].getFirstValue() > this.graph.visibleRange.minX) {
                this.unshiftVisibleChunk();
            }
            if (this.visibleChunks[this.visibleChunks.length - 1].getFirstValue() > this.graph.visibleRange.maxX) {
                this.popVisibleChunk();
            }
        }
    };
    ChunkManager.prototype.updateEmptyVisibleChunks = function () {
        if (this.updatingChunk.getLastValue() > this.graph.visibleRange.minX) {
            this.showChunk(this.updatingChunk);
            this.visibleChunks.push(this.updatingChunk);
        }
    };
    ChunkManager.prototype.onZoomOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.visibleChunks[0].getFirstValue() > this.graph.visibleRange.minX)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.unshiftVisibleChunk()];
                    case 1:
                        if (!(_a.sent()))
                            return [3 /*break*/, 2];
                        return [3 /*break*/, 0];
                    case 2:
                        if (!(this.visibleChunks[this.visibleChunks.length - 1].getLastValue() < this.graph.visibleRange.maxX)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.pushVisibleChunk()];
                    case 3:
                        if (!(_a.sent()))
                            return [3 /*break*/, 4];
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ChunkManager.prototype.onZoomIn = function () {
        while (this.visibleChunks[0].getLastValue() < this.graph.visibleRange.minX) {
            this.shiftVisibleChunk();
        }
        while (this.visibleChunks[this.visibleChunks.length - 1].getFirstValue() > this.graph.visibleRange.maxX) {
            this.popVisibleChunk();
        }
    };
    ChunkManager.prototype.createNewUpdatingChunk = function () {
        if (this.rightLoadedChunks.length >= ChunkManager.chunkPadding) {
            this.storeChunk(this.updatingChunk);
        }
        else if (!this.visibleChunks.includes(this.updatingChunk)) {
            this.rightLoadedChunks.push(this.updatingChunk);
        }
        this.updatingChunk = new Chunk(this.chunkIdAccumulator++);
        if (this.rightLoadedChunks.length < ChunkManager.chunkPadding) {
            this.rightLoadedChunks.push(this.updatingChunk);
        }
    };
    ChunkManager.prototype.unshiftRightChunk = function (chunk) {
        if (this.rightLoadedChunks.length >= ChunkManager.chunkPadding) {
            var chunk_1 = this.rightLoadedChunks.pop();
            if (chunk_1 != this.updatingChunk)
                this.storeChunk(chunk_1);
        }
        this.rightLoadedChunks.unshift(chunk);
    };
    ChunkManager.prototype.shiftRightChunk = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chunk, storedChunk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.rightLoadedChunks.length == 0)
                            return [2 /*return*/, null];
                        chunk = this.rightLoadedChunks.shift();
                        if (!(this.rightLoadedChunks.length == ChunkManager.chunkPadding - 1)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getStoredChunk(this.rightLoadedChunks[this.rightLoadedChunks.length - 1].id + 1)];
                    case 1:
                        storedChunk = _a.sent();
                        if (storedChunk != null)
                            this.rightLoadedChunks.push(storedChunk);
                        _a.label = 2;
                    case 2: return [2 /*return*/, chunk];
                }
            });
        });
    };
    ChunkManager.prototype.pushLeftChunk = function (chunk) {
        if (this.leftLoadedChunks.length >= ChunkManager.chunkPadding) {
            this.storeChunk(this.leftLoadedChunks.shift());
        }
        this.leftLoadedChunks.push(chunk);
    };
    ChunkManager.prototype.popLeftChunk = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chunk, storedChunk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.leftLoadedChunks.length == 0)
                            return [2 /*return*/, null];
                        chunk = this.leftLoadedChunks.pop();
                        if (!(this.leftLoadedChunks.length == ChunkManager.chunkPadding - 1)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getStoredChunk(this.leftLoadedChunks[0].id - 1)];
                    case 1:
                        storedChunk = _a.sent();
                        if (storedChunk != null)
                            this.leftLoadedChunks.unshift(storedChunk);
                        _a.label = 2;
                    case 2: return [2 /*return*/, chunk];
                }
            });
        });
    };
    ChunkManager.prototype.pushVisibleChunk = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chunk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.shiftRightChunk()];
                    case 1:
                        chunk = _a.sent();
                        if (chunk == null)
                            return [2 /*return*/, false];
                        this.showChunk(chunk);
                        this.visibleChunks.push(chunk);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    ChunkManager.prototype.shiftVisibleChunk = function () {
        var chunk = this.visibleChunks.shift();
        this.hideChunk(chunk);
        this.pushLeftChunk(chunk);
    };
    ChunkManager.prototype.unshiftVisibleChunk = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chunk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.popLeftChunk()];
                    case 1:
                        chunk = _a.sent();
                        if (chunk == null)
                            return [2 /*return*/, false];
                        this.showChunk(chunk);
                        this.visibleChunks.unshift(chunk);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    ChunkManager.prototype.popVisibleChunk = function () {
        var chunk = this.visibleChunks.pop();
        this.hideChunk(chunk);
        this.unshiftRightChunk(chunk);
    };
    ChunkManager.prototype.hideChunk = function (chunk) {
        this.graph.plotLine.remove(chunk.line);
    };
    ChunkManager.prototype.showChunk = function (chunk) {
        this.graph.plotLine.add(chunk.line);
    };
    ChunkManager.prototype.getStoredChunk = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var encodedChunk, chunk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, localforage.getItem(this.graph.id + "-" + id)];
                    case 1:
                        encodedChunk = (_a.sent());
                        chunk = encodedChunk == null ? null : new Chunk(0, encodedChunk);
                        return [2 /*return*/, chunk];
                }
            });
        });
    };
    ChunkManager.prototype.storeChunk = function (chunk) {
        var _this = this;
        localforage.keys().then(function (keys) {
            if (!keys.includes(_this.graph.id + "-" + chunk.id))
                localforage.setItem(_this.graph.id + "-" + chunk.id, chunk.toBase64());
        });
    };
    ChunkManager.chunkPadding = 3;
    return ChunkManager;
}());
export { ChunkManager };
//# sourceMappingURL=chunkManager.js.map