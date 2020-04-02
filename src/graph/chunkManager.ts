import { Chunk } from '../models/chunk'
import { Vector2 } from 'three'
import { Graph } from './graph'

import * as localforage from 'localforage'

export class ChunkManager {
  static chunkPadding = 3

  graph: Graph
  visibleChunks: Chunk[]
  storedChunks: Chunk[]

  lastPoint: Vector2
  updatingChunk: Chunk

  constructor(graph: Graph) {
    this.graph = graph
    this.lastPoint = new Vector2(0, 0)
    this.visibleChunks = []

    this.storedChunks = []

    this.createNewUpdatingChunk()
    this.showChunk(this.updatingChunk)
    this.visibleChunks.push(this.updatingChunk)
  }

  addPoint(point: Vector2): void {
    this.updatingChunk.add(this.lastPoint, point)
    this.lastPoint = point

    if (this.updatingChunk.isFull()) {
      this.createNewUpdatingChunk()
      this.checkChunkChange(1)
    }

    if (this.visibleChunks.length == 0) this.updateEmptyVisibleChunks()
  }

  checkChunkChange(delta: number): void {
    if (this.visibleChunks.length == 0) {
      this.updateEmptyVisibleChunks()
      return
    }

    if (delta > 0) {
      if (this.visibleChunks[this.visibleChunks.length - 1].lastValue < this.graph.visibleRange.maxX) {
        this.pushVisibleChunk()
      }
      if (this.visibleChunks[0].lastValue < this.graph.visibleRange.minX) {
        this.shiftVisibleChunk()
      }
    } else {
      if (this.visibleChunks[this.visibleChunks.length - 1].firstValue > this.graph.visibleRange.maxX) {
        this.popVisibleChunk()
      }
      if (this.visibleChunks[0].firstValue > this.graph.visibleRange.minX) {
        this.unshiftVisibleChunk()
      }
    }
  }

  private updateEmptyVisibleChunks(): void {
    if (this.updatingChunk.lastValue > this.graph.visibleRange.minX) {
      this.showChunk(this.updatingChunk)
      this.visibleChunks.push(this.updatingChunk)
    }
  }

  onZoomOut(): void {
    while (this.visibleChunks[0].firstValue > this.graph.visibleRange.minX) {
      if (!this.unshiftVisibleChunk()) break
    }

    while (this.visibleChunks[this.visibleChunks.length - 1].lastValue < this.graph.visibleRange.maxX) {
      if (!this.pushVisibleChunk()) break
    }
  }

  onZoomIn(): void {
    while (this.visibleChunks[0].lastValue < this.graph.visibleRange.minX) {
      this.shiftVisibleChunk()
    }

    while (this.visibleChunks[this.visibleChunks.length - 1].firstValue > this.graph.visibleRange.maxX) {
      this.popVisibleChunk()
    }
  }

  private createNewUpdatingChunk(): void {
    this.updatingChunk = new Chunk()
    this.storeChunk(this.updatingChunk)
  }

  private pushVisibleChunk(): boolean {
    const chunk = this.storedChunks.find(chunk => chunk.id == this.visibleChunks[this.visibleChunks.length - 1].id + 1)

    if (chunk == null) return false

    this.showChunk(chunk)
    this.visibleChunks.push(chunk)

    return true
  }

  private popVisibleChunk(): void {
    this.hideChunk(this.visibleChunks.pop())
  }

  private unshiftVisibleChunk(): boolean {
    const chunk = this.storedChunks.find(chunk => chunk.id == this.visibleChunks[0].id - 1)

    if (chunk == null) return false

    this.showChunk(chunk)
    this.visibleChunks.unshift(chunk)

    const lowestStoredChunk = this.getLowestStoredChunk()

    if (this.visibleChunks[0].id - lowestStoredChunk.id < ChunkManager.chunkPadding) {
      localforage.getItem((lowestStoredChunk.id - 1).toString()).then((encodedChunk: string) => {
        if (encodedChunk == null) return
        this.storedChunks.push(new Chunk(encodedChunk))
      })
    }

    return true
  }

  private shiftVisibleChunk(): void {
    this.hideChunk(this.visibleChunks.shift())

    if (this.visibleChunks.length == 0) return

    const lowestStoredChunk = this.getLowestStoredChunk()
    if (this.visibleChunks[0].id - lowestStoredChunk.id > ChunkManager.chunkPadding) {
      this.storeChunkLocally(lowestStoredChunk)
    }
  }

  private getLowestStoredChunk(): Chunk {
    return this.storedChunks.reduce((lowest, chunk) => {
      return lowest === undefined || chunk.id < lowest.id ? chunk : lowest
    }, undefined)
  }

  private getHighestStoredChunk(): Chunk {
    return this.storedChunks.reduce((highest, chunk) => {
      return highest === undefined || chunk.id > highest.id ? chunk : highest
    }, undefined)
  }

  private hideChunk(chunk: Chunk): void {
    this.graph.plotLine.remove(chunk.line)
  }

  private showChunk(chunk: Chunk): void {
    this.graph.plotLine.add(chunk.line)
  }

  private storeChunk(chunk: Chunk): void {
    if (!this.storedChunks.find(stored => stored.id == chunk.id)) {
      this.storedChunks.push(chunk)
    }
  }

  private storeChunkLocally(chunk: Chunk): void {
    localforage.keys().then((keys: string[]) => {
      if (!keys.includes(chunk.id.toString())) {
        localforage.setItem(chunk.id.toString(), chunk.toBase64()).then(() => {
          this.storedChunks = this.storedChunks.filter(stored => stored.id !== chunk.id)
        })
      } else {
        this.storedChunks = this.storedChunks.filter(stored => stored.id !== chunk.id)
      }
    })
  }
}
