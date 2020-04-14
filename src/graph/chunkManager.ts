import { Chunk } from '../models/chunk'
import { Vector2 } from 'three'
import { Graph } from './graph'

import * as localforage from 'localforage'

export class ChunkManager {
  private static chunkPadding = 3

  graph: Graph
  visibleChunks: Chunk[]
  leftLoadedChunks: Chunk[]
  rightLoadedChunks: Chunk[]

  lastPoint: Vector2
  updatingChunk: Chunk
  chunkIdAccumulator = 0

  constructor(graph: Graph) {
    this.graph = graph
    this.visibleChunks = []

    this.leftLoadedChunks = []
    this.rightLoadedChunks = []

    this.updatingChunk = new Chunk(this.chunkIdAccumulator++)
    this.showChunk(this.updatingChunk)
    this.visibleChunks.push(this.updatingChunk)
  }

  addPoint(point: Vector2): void {
    if (this.lastPoint == null) {
      this.lastPoint = point
      return
    }

    this.updatingChunk.add(this.lastPoint, point)
    this.lastPoint = point

    if (this.updatingChunk.isFull()) {
      this.createNewUpdatingChunk()

      if (this.visibleChunks[this.visibleChunks.length - 1].getLastValue() < this.graph.visibleRange.maxX) {
        this.pushVisibleChunk()
      }
    }

    // console.log({
    //   left: this.leftLoadedChunks,
    //   visible: this.visibleChunks,
    //   right: this.rightLoadedChunks,
    // })
  }

  checkChunkChange(delta: number): void {
    if (delta > 0) {
      if (this.visibleChunks[this.visibleChunks.length - 1].getLastValue() < this.graph.visibleRange.maxX) {
        this.pushVisibleChunk()
      }
      if (this.visibleChunks[0].getLastValue() < this.graph.visibleRange.minX) {
        this.shiftVisibleChunk()
      }
    } else {
      if (this.visibleChunks[0].getFirstValue() > this.graph.visibleRange.minX) {
        this.unshiftVisibleChunk()
      }
      if (this.visibleChunks[this.visibleChunks.length - 1].getFirstValue() > this.graph.visibleRange.maxX) {
        this.popVisibleChunk()
      }
    }
  }

  private updateEmptyVisibleChunks(): void {
    if (this.updatingChunk.getLastValue() > this.graph.visibleRange.minX) {
      this.showChunk(this.updatingChunk)
      this.visibleChunks.push(this.updatingChunk)
    }
  }

  onZoomOut(): void {
    while (this.visibleChunks[0].getFirstValue() > this.graph.visibleRange.minX) {
      if (!this.unshiftVisibleChunk()) break
    }

    while (this.visibleChunks[this.visibleChunks.length - 1].getLastValue() < this.graph.visibleRange.maxX) {
      if (!this.pushVisibleChunk()) break
    }
  }

  onZoomIn(): void {
    while (this.visibleChunks[0].getLastValue() < this.graph.visibleRange.minX) {
      this.shiftVisibleChunk()
    }

    while (this.visibleChunks[this.visibleChunks.length - 1].getFirstValue() > this.graph.visibleRange.maxX) {
      this.popVisibleChunk()
    }
  }

  private createNewUpdatingChunk(): void {
    if (this.rightLoadedChunks.length >= ChunkManager.chunkPadding) {
      this.storeChunk(this.updatingChunk)
    }

    this.updatingChunk = new Chunk(this.chunkIdAccumulator++)

    if (this.rightLoadedChunks.length < ChunkManager.chunkPadding) {
      this.rightLoadedChunks.push(this.updatingChunk)
    }
  }

  private unshiftRightChunk(chunk: Chunk): void {
    if (this.rightLoadedChunks.length >= ChunkManager.chunkPadding) {
      const chunk = this.rightLoadedChunks.pop()
      if (chunk != this.updatingChunk) this.storeChunk(chunk)
    }

    this.rightLoadedChunks.unshift(chunk)
  }

  private shiftRightChunk(): Chunk {
    if (this.rightLoadedChunks.length == 0) return null

    const chunk = this.rightLoadedChunks.shift()

    if (this.rightLoadedChunks.length == ChunkManager.chunkPadding - 1) {
      const nextId = this.rightLoadedChunks[this.rightLoadedChunks.length - 1].id + 1
      if (nextId < this.updatingChunk.id) {
        this.rightLoadedChunks.push(this.getStoredChunk(nextId))
      } else if (nextId == this.updatingChunk.id) {
        this.rightLoadedChunks.push(this.updatingChunk)
      }
    }

    return chunk
  }

  private pushLeftChunk(chunk: Chunk): void {
    if (this.leftLoadedChunks.length >= ChunkManager.chunkPadding) {
      this.storeChunk(this.leftLoadedChunks.shift())
    }

    this.leftLoadedChunks.push(chunk)
  }

  private popLeftChunk(): Chunk {
    if (this.leftLoadedChunks.length == 0) return null

    const chunk = this.leftLoadedChunks.pop()

    if (this.leftLoadedChunks.length == ChunkManager.chunkPadding - 1) {
      const previousId = this.leftLoadedChunks[0].id - 1
      if (previousId >= 0) {
        this.leftLoadedChunks.unshift(this.getStoredChunk(previousId))
      }
    }

    return chunk
  }

  private pushVisibleChunk(): boolean {
    const chunk = this.shiftRightChunk()

    if (chunk == null) return false

    this.showChunk(chunk)
    this.visibleChunks.push(chunk)

    console.log('   Push chunk', chunk, ` ~ Right: ${this.rightLoadedChunks.map(x => x.id)}`)

    return true
  }

  private shiftVisibleChunk(): void {
    const chunk = this.visibleChunks.shift()
    this.hideChunk(chunk)

    this.pushLeftChunk(chunk)

    console.log('  Shift chunk', chunk, ` ~ Left:  ${this.leftLoadedChunks.map(x => x.id)}`)
  }

  private unshiftVisibleChunk(): boolean {
    const chunk = this.popLeftChunk()

    if (chunk == null) return false

    this.showChunk(chunk)
    this.visibleChunks.unshift(chunk)

    console.log('Unshift chunk', chunk, ` ~ Left:  ${this.leftLoadedChunks.map(x => x.id)}`)

    return true
  }

  private popVisibleChunk(): void {
    const chunk = this.visibleChunks.pop()
    this.hideChunk(chunk)

    this.unshiftRightChunk(chunk)

    console.log('    Pop chunk', chunk, ` ~ Right: ${this.rightLoadedChunks.map(x => x.id)}`)
  }

  private hideChunk(chunk: Chunk): void {
    this.graph.plotLine.remove(chunk.line)
  }

  private showChunk(chunk: Chunk): void {
    this.graph.plotLine.add(chunk.line)
  }

  private getStoredChunk(id: number): Chunk {
    const chunk = new Chunk(id)

    // console.log(`Created #${id}`)

    localforage.getItem(`${this.graph.id}-${id}`).then((encoded: string) => {
      if (encoded == null) return
      chunk.fromBase64(encoded)
      if (this.visibleChunks.includes(chunk)) this.showChunk(chunk)

      // console.log(`Updated #${id}`)
    })

    return chunk
  }

  private storeChunk(chunk: Chunk): void {
    localforage.keys().then((keys: string[]) => {
      if (!keys.includes(`${this.graph.id}-${chunk.id}`))
        localforage.setItem(`${this.graph.id}-${chunk.id}`, chunk.toBase64())
    })
  }
}
