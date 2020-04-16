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

  firstValue: number
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

  addPoints(p: Vector2[]): void {
    const points = p
    if (this.lastPoint == null) {
      const firstPoint = points.shift()
      if (firstPoint == undefined) return
      this.lastPoint = firstPoint
      this.firstValue = firstPoint.x
    }

    if (points.length == 0) return

    let shouldBreak = 0
    while (points.length > 0) {
      points.unshift(this.lastPoint)

      const availableSpace = this.updatingChunk.availableSpace()
      const sliced = points.splice(0, availableSpace < points.length ? availableSpace + 1 : points.length)
      this.updatingChunk.addPoints(sliced)
      this.lastPoint = sliced.pop()

      if (this.updatingChunk.isFull()) {
        this.createNewUpdatingChunk()
        this.onMove(1)
      }

      shouldBreak++
      if (shouldBreak == 10) break
    }

    this.updateEmptyVisibleChunks()
  }

  onMove(delta: number): void {
    if (delta > 0) {
      while (
        this.rightLoadedChunks.length > 0 &&
        this.rightLoadedChunks[0].getFirstValue() < this.graph.visibleRange.maxX
      ) {
        if (!this.pushVisibleChunk()) break
      }
      while (this.visibleChunks.length > 0 && this.visibleChunks[0].getLastValue() < this.graph.visibleRange.minX) {
        this.shiftVisibleChunk()
      }
    } else {
      while (
        this.leftLoadedChunks.length > 0 &&
        this.leftLoadedChunks[this.leftLoadedChunks.length - 1].getLastValue() > this.graph.visibleRange.minX
      ) {
        if (!this.unshiftVisibleChunk()) break
      }
      while (
        this.visibleChunks.length > 0 &&
        this.visibleChunks[this.visibleChunks.length - 1].getFirstValue() > this.graph.visibleRange.maxX
      ) {
        this.popVisibleChunk()
      }
    }
  }

  onJump(): void {
    this.visibleChunks.forEach(chunk => {
      this.hideChunk(chunk)
    })

    this.visibleChunks = []
    this.leftLoadedChunks = []
    this.rightLoadedChunks = []

    this.leftLoadedChunks.unshift(this.updatingChunk)

    while (this.leftLoadedChunks.length < ChunkManager.chunkPadding) {
      const chunk = this.getStoredChunk(this.leftLoadedChunks[0].id - 1)
      if (chunk != null) this.leftLoadedChunks.unshift(chunk)
      else break
    }

    this.unshiftVisibleChunk()
    while (this.visibleChunks[0].getFirstValue() > this.graph.visibleRange.minX) {
      if (!this.unshiftVisibleChunk()) break
    }
  }

  private updateEmptyVisibleChunks(): void {
    if (
      this.visibleChunks.length == 0 &&
      this.rightLoadedChunks.length == 0 &&
      this.leftLoadedChunks[this.leftLoadedChunks.length - 1].getLastValue() > this.graph.visibleRange.minX
    ) {
      this.unshiftVisibleChunk()
    }
  }

  onZoomOut(): void {
    while (this.visibleChunks[this.visibleChunks.length - 1].getLastValue() < this.graph.visibleRange.maxX) {
      if (!this.pushVisibleChunk()) break
    }

    while (this.visibleChunks[0].getFirstValue() > this.graph.visibleRange.minX) {
      if (!this.unshiftVisibleChunk()) break
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
    this.storeChunk(this.updatingChunk)

    this.updatingChunk = new Chunk(this.chunkIdAccumulator++)

    if (this.rightLoadedChunks.length == 0 && this.visibleChunks.length == 0) {
      this.pushLeftChunk(this.updatingChunk)
    } else if (this.rightLoadedChunks.length < ChunkManager.chunkPadding) {
      this.rightLoadedChunks.push(this.updatingChunk)
    }
  }

  private unshiftRightChunk(chunk: Chunk): void {
    if (this.rightLoadedChunks.length >= ChunkManager.chunkPadding) {
      this.rightLoadedChunks.pop()
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
      this.leftLoadedChunks.shift()
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

    // console.log('   Push chunk', chunk, ` ~ Right: ${this.rightLoadedChunks.map(x => x.id)}`)

    return true
  }

  private shiftVisibleChunk(): void {
    const chunk = this.visibleChunks.shift()
    this.hideChunk(chunk)

    this.pushLeftChunk(chunk)

    // console.log('  Shift chunk', chunk, ` ~ Left:  ${this.leftLoadedChunks.map(x => x.id)}`)
  }

  private unshiftVisibleChunk(): boolean {
    const chunk = this.popLeftChunk()

    if (chunk == null) return false

    this.showChunk(chunk)
    this.visibleChunks.unshift(chunk)

    // console.log('Unshift chunk', chunk, ` ~ Left:  ${this.leftLoadedChunks.map(x => x.id)}`)

    return true
  }

  private popVisibleChunk(): void {
    const chunk = this.visibleChunks.pop()
    this.hideChunk(chunk)

    this.unshiftRightChunk(chunk)

    // console.log('    Pop chunk', chunk, ` ~ Right: ${this.rightLoadedChunks.map(x => x.id)}`)
  }

  private hideChunk(chunk: Chunk): void {
    this.graph.plotLine.remove(chunk.line)
  }

  private showChunk(chunk: Chunk): void {
    this.graph.plotLine.add(chunk.line)
  }

  private getStoredChunk(id: number): Chunk {
    const storedId = sessionStorage.getItem(`${this.graph.id}-${id}`)

    if (storedId == null) return

    const firstValue =
      id > 0 ? Number.parseFloat(sessionStorage.getItem(`${this.graph.id}-${id - 1}`)) : this.firstValue

    const lastValue = Number.parseFloat(storedId)

    const chunk = new Chunk(id, firstValue, lastValue)

    localforage.getItem(`${this.graph.id}-${id}`).then((encoded: string) => {
      if (encoded == null) return
      chunk.fromBase64(encoded)
    })

    return chunk
  }

  private storeChunk(chunk: Chunk): void {
    sessionStorage.setItem(`${this.graph.id}-${chunk.id}`, chunk.getLastValue().toString())

    localforage.keys().then((keys: string[]) => {
      if (!keys.includes(`${this.graph.id}-${chunk.id}`))
        localforage.setItem(`${this.graph.id}-${chunk.id}`, chunk.toBase64())
    })
  }
}
