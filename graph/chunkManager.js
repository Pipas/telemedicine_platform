import { Chunk } from '../models/chunk';
import * as localforage from 'localforage';
var ChunkManager = /** @class */ (function () {
    function ChunkManager(graph) {
        this.chunkIdAccumulator = 0;
        this.graph = graph;
        this.visibleChunks = [];
        this.storedChunks = [];
        this.createNewUpdatingChunk();
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
            this.checkChunkChange(1);
        }
        if (this.visibleChunks.length == 0)
            this.updateEmptyVisibleChunks();
    };
    ChunkManager.prototype.checkChunkChange = function (delta) {
        if (this.visibleChunks.length == 0) {
            this.updateEmptyVisibleChunks();
            return;
        }
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
        while (this.visibleChunks[0].getFirstValue() > this.graph.visibleRange.minX) {
            if (!this.unshiftVisibleChunk())
                break;
        }
        while (this.visibleChunks[this.visibleChunks.length - 1].getLastValue() < this.graph.visibleRange.maxX) {
            if (!this.pushVisibleChunk())
                break;
        }
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
        this.updatingChunk = new Chunk(this.chunkIdAccumulator++);
        this.storeChunk(this.updatingChunk);
    };
    ChunkManager.prototype.pushVisibleChunk = function () {
        var _this = this;
        var chunk = this.storedChunks.find(function (chunk) { return chunk.id == _this.visibleChunks[_this.visibleChunks.length - 1].id + 1; });
        if (chunk == null)
            return false;
        this.showChunk(chunk);
        this.visibleChunks.push(chunk);
        return true;
    };
    ChunkManager.prototype.popVisibleChunk = function () {
        this.hideChunk(this.visibleChunks.pop());
    };
    ChunkManager.prototype.unshiftVisibleChunk = function () {
        var _this = this;
        var chunk = this.storedChunks.find(function (chunk) { return chunk.id == _this.visibleChunks[0].id - 1; });
        if (chunk == null)
            return false;
        console.log('recalling', chunk);
        this.showChunk(chunk);
        this.visibleChunks.unshift(chunk);
        var lowestStoredChunk = this.getLowestStoredChunk();
        if (this.visibleChunks[0].id - lowestStoredChunk.id < ChunkManager.chunkPadding) {
            localforage.getItem(this.graph.id + "-" + (lowestStoredChunk.id - 1)).then(function (encodedChunk) {
                if (encodedChunk == null)
                    return;
                _this.storedChunks.push(new Chunk(0, encodedChunk));
            });
        }
        return true;
    };
    ChunkManager.prototype.shiftVisibleChunk = function () {
        this.hideChunk(this.visibleChunks.shift());
        if (this.visibleChunks.length == 0)
            return;
        var lowestStoredChunk = this.getLowestStoredChunk();
        if (this.visibleChunks[0].id - lowestStoredChunk.id > ChunkManager.chunkPadding) {
            this.storeChunkLocally(lowestStoredChunk);
        }
    };
    ChunkManager.prototype.getLowestStoredChunk = function () {
        return this.storedChunks.reduce(function (lowest, chunk) {
            return lowest === undefined || chunk.id < lowest.id ? chunk : lowest;
        }, undefined);
    };
    ChunkManager.prototype.getHighestStoredChunk = function () {
        return this.storedChunks.reduce(function (highest, chunk) {
            return highest === undefined || chunk.id > highest.id ? chunk : highest;
        }, undefined);
    };
    ChunkManager.prototype.hideChunk = function (chunk) {
        this.graph.plotLine.remove(chunk.line);
    };
    ChunkManager.prototype.showChunk = function (chunk) {
        this.graph.plotLine.add(chunk.line);
    };
    ChunkManager.prototype.storeChunk = function (chunk) {
        if (!this.storedChunks.find(function (stored) { return stored.id == chunk.id; })) {
            this.storedChunks.push(chunk);
        }
    };
    ChunkManager.prototype.storeChunkLocally = function (chunk) {
        var _this = this;
        localforage.keys().then(function (keys) {
            if (!keys.includes(_this.graph.id + "-" + chunk.id)) {
                localforage.setItem(_this.graph.id + "-" + chunk.id, chunk.toBase64()).then(function () {
                    _this.storedChunks = _this.storedChunks.filter(function (stored) { return stored.id !== chunk.id; });
                });
            }
            else {
                _this.storedChunks = _this.storedChunks.filter(function (stored) { return stored.id !== chunk.id; });
            }
        });
    };
    ChunkManager.chunkPadding = 3;
    return ChunkManager;
}());
export { ChunkManager };
//# sourceMappingURL=chunkManager.js.map