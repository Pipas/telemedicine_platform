import { Chunk } from '../models/chunk'
import { Vector2 } from 'three'
import { Graph } from './graph'
import { Buffer } from 'buffer/'
import { spawn, Worker, TransferDescriptor } from 'threads'
import { LocalChunkHandler } from '../workers/localChunkHandler'

/**
 * Manages all the logic regarding data in a graph
 *
 * @export
 * @class ChunkManager
 */
export class ChunkManager {
  // Number of chunks it should have loaded out of view on each side of the graph
  private static chunkPadding = 3

  graph: Graph

  // Visible and loaded chunk arrays
  private visibleChunks: Chunk[]
  private leftLoadedChunks: Chunk[]
  private rightLoadedChunks: Chunk[]

  // Webworker that handles storage of chunks locally
  private localChunkHandler: LocalChunkHandler

  // Last point added to the graph
  lastPoint: Vector2

  // Chunk where new values added
  private updatingChunk: Chunk

  // Graph starting value
  private firstValue: number

  // Used to number chunks incrementally
  private chunkIdAccumulator = 0

  constructor(graph: Graph) {
    this.graph = graph

    this.visibleChunks = []
    this.leftLoadedChunks = []
    this.rightLoadedChunks = []

    // Starts the first chunk and sets it as the updatingChunk
    this.updatingChunk = new Chunk(this.chunkIdAccumulator++)
    this.visibleChunks.push(this.updatingChunk)
    this.showChunk(this.updatingChunk)

    this.initLocalChunkHandler()
  }

  /**
   * Initializes the local chunk handler asynchronously
   *
   * @returns {Promise<void>}
   * @memberof ChunkManager
   */
  async initLocalChunkHandler(): Promise<void> {
    this.localChunkHandler = await spawn<LocalChunkHandler>(new Worker('../workers/localChunkHandler'))
  }

  /**
   * Adds points to the graph, changing chunks if necessary
   *
   * @param {Vector2[]} p
   * @memberof ChunkManager
   */
  addPoints(p: Vector2[]): void {
    const points = p

    // If it's the first point added to the chunk
    if (this.lastPoint == null) {
      const firstPoint = points.shift()
      if (firstPoint == undefined) return

      // Initializes lastPoint and firstValue
      this.lastPoint = firstPoint
      this.firstValue = firstPoint.x
    }

    if (points.length == 0) return

    while (points.length > 0) {
      points.unshift(this.lastPoint)

      // Calculates the available space in the chunk
      const availableSpace = this.updatingChunk.availableSpace()

      // Adds the points needed to fill the available space
      const sliced = points.splice(0, availableSpace < points.length ? availableSpace + 1 : points.length)
      this.updatingChunk.addPoints(sliced)

      // Updates lastPoint
      this.lastPoint = sliced.pop()

      // If updatingChunk is full creates a new chunk
      if (this.updatingChunk.isFull()) {
        this.createNewUpdatingChunk()

        // Forces the previous updating chunk to be processed
        this.onMove(1)
      }
    }

    // If visible chunks are empty checks if it should reappear in view
    this.updateEmptyVisibleChunks()
  }

  /**
   * Called when the graph moves to update the currently visible chunks
   *
   * @param {number} delta
   * @memberof ChunkManager
   */
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

  /**
   * Called when the graph 'jumps' to the current updating chunk
   *
   * @memberof ChunkManager
   */
  onJump(): void {
    // Hides currently visible chunks
    this.visibleChunks.forEach(chunk => {
      this.hideChunk(chunk)
    })

    // Cleans all buffers
    this.visibleChunks = []
    this.leftLoadedChunks = []
    this.rightLoadedChunks = []

    // Creates a new leftLoadedChunks with updatingChunk being the at the top
    this.leftLoadedChunks.unshift(this.updatingChunk)

    while (this.leftLoadedChunks.length < ChunkManager.chunkPadding) {
      const chunk = this.getStoredChunk(this.leftLoadedChunks[0].id - 1)
      if (chunk != null) this.leftLoadedChunks.unshift(chunk)
      else break
    }

    // Unshifts chunks from the new leftLoadedChunks until they are no longer visible
    this.unshiftVisibleChunk()
    while (this.visibleChunks[0].getFirstValue() > this.graph.visibleRange.minX) {
      if (!this.unshiftVisibleChunk()) break
    }
  }

  /**
   * Called when graph is zoomed out and more chunks might be visible
   *
   * @memberof ChunkManager
   */
  onZoomOut(): void {
    while (this.visibleChunks[this.visibleChunks.length - 1].getLastValue() < this.graph.visibleRange.maxX) {
      if (!this.pushVisibleChunk()) break
    }

    while (this.visibleChunks[0].getFirstValue() > this.graph.visibleRange.minX) {
      if (!this.unshiftVisibleChunk()) break
    }
  }

  /**
   * Called when graph is zoomed in and chunks might stop being visible
   *
   * @memberof ChunkManager
   */
  onZoomIn(): void {
    while (this.visibleChunks[0].getLastValue() < this.graph.visibleRange.minX) {
      this.shiftVisibleChunk()
    }

    while (this.visibleChunks[this.visibleChunks.length - 1].getFirstValue() > this.graph.visibleRange.maxX) {
      this.popVisibleChunk()
    }
  }

  /**
   * If no chunks are visible and the updatingChunk's last value enters the visible range add's the chunk to visibleChunks
   *
   * @private
   * @memberof ChunkManager
   */
  private updateEmptyVisibleChunks(): void {
    if (
      this.visibleChunks.length == 0 &&
      this.rightLoadedChunks.length == 0 &&
      this.leftLoadedChunks[this.leftLoadedChunks.length - 1].getLastValue() > this.graph.visibleRange.minX
    ) {
      this.unshiftVisibleChunk()
    }
  }

  /**
   * Creates a new updating chunk
   *
   * @private
   * @memberof ChunkManager
   */
  private createNewUpdatingChunk(): void {
    // Stores previous updating chunk locally
    this.storeChunk(this.updatingChunk)

    this.updatingChunk = new Chunk(this.chunkIdAccumulator++)

    if (this.rightLoadedChunks.length == 0 && this.visibleChunks.length == 0) {
      this.pushLeftChunk(this.updatingChunk)
    } else if (this.rightLoadedChunks.length < ChunkManager.chunkPadding) {
      this.rightLoadedChunks.push(this.updatingChunk)
    }
  }

  /**
   * Unshifts a chunk to rightLoadedChunks and handles logic to maintain chunk padding
   *
   * @private
   * @param {Chunk} chunk
   * @memberof ChunkManager
   */
  private unshiftRightChunk(chunk: Chunk): void {
    if (this.rightLoadedChunks.length >= ChunkManager.chunkPadding) {
      this.rightLoadedChunks.pop()
    }

    this.rightLoadedChunks.unshift(chunk)
  }

  /**
   * Shifts a chunk from rightLoadedChunks and handles logic to maintain chunk padding
   *
   * @private
   * @returns {Chunk}
   * @memberof ChunkManager
   */
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

  /**
   * Pushes a chunk to leftLoadedChunks and handles logic to maintain chunk padding
   *
   * @private
   * @param {Chunk} chunk
   * @memberof ChunkManager
   */
  private pushLeftChunk(chunk: Chunk): void {
    if (this.leftLoadedChunks.length >= ChunkManager.chunkPadding) {
      this.leftLoadedChunks.shift()
    }

    this.leftLoadedChunks.push(chunk)
  }

  /**
   * Pops a chunk from leftLoadedChunks and handles logic to maintain chunk padding
   *
   * @private
   * @returns {Chunk}
   * @memberof ChunkManager
   */
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

  /**
   * Pushes a chunk from the rightLoadedChunks buffer to visible chunks and handles following logic
   *
   * @private
   * @returns {boolean}
   * @memberof ChunkManager
   */
  private pushVisibleChunk(): boolean {
    const chunk = this.shiftRightChunk()

    if (chunk == null) return false

    this.showChunk(chunk)
    this.visibleChunks.push(chunk)

    return true
  }

  /**
   * Unshifts a chunk from the leftLoadedChunks buffer to visible chunks and handles following logic
   *
   * @private
   * @returns {boolean}
   * @memberof ChunkManager
   */
  private unshiftVisibleChunk(): boolean {
    const chunk = this.popLeftChunk()

    if (chunk == null) return false

    this.showChunk(chunk)
    this.visibleChunks.unshift(chunk)

    return true
  }

  /**
   * Shifts a chunk from visibleChunks  and handles following logic
   *
   * @private
   * @memberof ChunkManager
   */
  private shiftVisibleChunk(): void {
    const chunk = this.visibleChunks.shift()
    this.hideChunk(chunk)

    this.pushLeftChunk(chunk)
  }

  /**
   * Pops a chunk from visibleChunks  and handles following logic
   *
   * @private
   * @memberof ChunkManager
   */
  private popVisibleChunk(): void {
    const chunk = this.visibleChunks.pop()
    this.hideChunk(chunk)

    this.unshiftRightChunk(chunk)
  }

  /**
   * Hides a chunk in the graph
   *
   * @private
   * @param {Chunk} chunk
   * @memberof ChunkManager
   */
  private hideChunk(chunk: Chunk): void {
    this.graph.plotLine.remove(chunk.line)
  }

  /**
   * Shows a chunk in the graph
   *
   * @private
   * @param {Chunk} chunk
   * @memberof ChunkManager
   */
  private showChunk(chunk: Chunk): void {
    this.graph.plotLine.add(chunk.line)
  }

  /**
   * Gets an empty chunk from storage that is asynchronously updated with the correct values
   *
   * @private
   * @param {number} id
   * @returns {Chunk}
   * @memberof ChunkManager
   */
  private getStoredChunk(id: number): Chunk {
    // Gets the last value of the chunk stored in session storage
    const storedLastValue = sessionStorage.getItem(`${this.graph.id}-${id}`)

    if (storedLastValue == null) return

    // Gets the first value of the chunk based on previous' chunk last value
    const firstValue =
      id > 0 ? Number.parseFloat(sessionStorage.getItem(`${this.graph.id}-${id - 1}`)) : this.firstValue

    const lastValue = Number.parseFloat(storedLastValue)

    // Creates empty chunk with the correct first and last values
    const chunk = new Chunk(id, firstValue, lastValue)

    // Requests chunk data from localChunkHandler and updates chunk with said data when retreived
    this.localChunkHandler.get(chunk.id, this.graph.id).then((buffer: TransferDescriptor<ArrayBuffer>) => {
      chunk.fromBuffer(Buffer.from((buffer as unknown) as ArrayBuffer))
    })

    return chunk
  }

  /**
   * Stores a chunk locally
   *
   * @private
   * @param {Chunk} chunk
   * @memberof ChunkManager
   */
  private storeChunk(chunk: Chunk): void {
    // Saves chunk last value in session storage
    sessionStorage.setItem(`${this.graph.id}-${chunk.id}`, chunk.getLastValue().toString())

    // Saves the chunk data locally
    this.localChunkHandler.store(chunk.getPositions(), chunk.id, this.graph.id)
  }
}
