import { Chunk } from '../models/chunk'
import { Vector2, Box3 } from 'three'
import { GraphLine } from '../models/graphLine'
import { Graph } from './graph'

export class ChunkManager {
  graph: Graph
  chunkWidth: number
  visibleChunks: Chunk[]

  lastPoint: Vector2
  updatingChunk: Chunk

  storedChunks: Map<number, Chunk>

  constructor(graph: Graph, width: number) {
    this.graph = graph
    this.chunkWidth = width
    this.lastPoint = new Vector2(0, 0)
    this.visibleChunks = []

    this.storedChunks = new Map()

    this.createNewUpdatingChunk()
    this.showChunk(this.updatingChunk)
    this.visibleChunks.push(this.updatingChunk)
  }

  addNewPoint(point: Vector2): void {
    const line = GraphLine.create(this.lastPoint, point)
    this.lastPoint = point
    this.updatingChunk.add(line, point)
  }

  checkChunkSize(): void {
    const currentChunkOutline = new Box3().setFromObject(this.updatingChunk.group)

    if (currentChunkOutline.max.x - currentChunkOutline.min.x > this.chunkWidth) {
      this.createNewUpdatingChunk()
    }
  }

  checkChunkChange(): void {
    // if (this.visibleChunks[0].firstValue > this.graph.visibleRange.minX) {
    //   this.visibleChunks.unshift(this.recallChunk(this.visibleChunks[0].id - 1))
    //   this.hideChunk(this.visibleChunks.pop())
    // }

    if (this.visibleChunks[this.visibleChunks.length - 1].lastValue < this.graph.visibleRange.maxX) {
      console.log('here')
      this.visibleChunks.push(this.recallChunk(this.visibleChunks[this.visibleChunks.length - 1].id + 1))
    }
  }

  private createNewUpdatingChunk(): void {
    this.updatingChunk = new Chunk()
    this.storeChunk(this.updatingChunk)
  }

  private pushVisibleChunk(chunk: Chunk): void {
    this.showChunk(chunk)
    this.visibleChunks.push(chunk)
  }

  private popVisibleChunk(): void {
    this.hideChunk(this.visibleChunks.pop())
  }

  private unshiftVisibleChunk(chunk: Chunk): void {
    this.showChunk(chunk)
    this.visibleChunks.push(chunk)
  }

  private shiftVisibleChunk(): void {
    this.hideChunk(this.visibleChunks.shift())
  }

  private hideChunk(chunk: Chunk): void {
    this.graph.plotLine.remove(chunk.group)
  }

  private showChunk(chunk: Chunk): void {
    this.graph.plotLine.add(chunk.group)
  }

  private storeChunk(chunk: Chunk): void {
    if (!this.storedChunks.has(chunk.id)) {
      this.storedChunks.set(chunk.id, chunk)
    }
  }

  private recallChunk(id: number): Chunk {
    const chunk = this.storedChunks.get(id)

    this.showChunk(chunk)

    return chunk
  }
}
