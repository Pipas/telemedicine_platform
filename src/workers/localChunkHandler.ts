import { expose, Transfer } from 'threads/worker'
import * as localforage from 'localforage'
import { BufferAttribute } from 'three'
import { Buffer } from 'buffer/'
import { deflate, inflate } from 'pako'
import { TransferDescriptor } from 'threads'

const localChunkHandler = {
  /**
   * Stores a compressed buffer of the positions in a local IndexedDB
   *
   * @param {BufferAttribute} positions
   * @param {number} chunkId
   * @param {number} graphId
   * @returns {Promise<void>}
   */
  async store(positions: BufferAttribute, chunkId: number, graphId: number): Promise<void> {
    const keys = await localforage.keys()
    if (!keys.includes(`${graphId}-${chunkId}`)) {
      const buffer = Buffer.alloc(4 * ((positions.array.length / 6) * 2 + 2))
      let offset = 0
      for (let i = 0; i < positions.array.length; i += 6) {
        buffer.writeFloatBE(positions.array[i], offset)
        buffer.writeFloatBE(positions.array[i + 1], offset + 4)
        offset += 8
      }

      buffer.writeFloatBE(positions.array[positions.array.length - 3], offset)
      buffer.writeFloatBE(positions.array[positions.array.length - 2], offset + 4)

      localforage.setItem(`${graphId}-${chunkId}`, deflate(buffer))
    }
  },
  /**
   * Transfers ownership of a decoded buffer with position information from local IndexedDB
   *
   * @param {number} chunkId
   * @param {number} graphId
   * @returns {Promise<TransferDescriptor<ArrayBuffer>>}
   */
  async get(chunkId: number, graphId: number): Promise<TransferDescriptor<ArrayBuffer>> {
    const encoded = (await localforage.getItem(`${graphId}-${chunkId}`)) as Uint8Array
    if (encoded == null) return
    return Transfer(inflate(encoded).buffer)
  },
}

export type LocalChunkHandler = typeof localChunkHandler

expose(localChunkHandler)
