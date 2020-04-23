import { expose } from 'threads/worker'
import { Buffer } from 'buffer/'
import { inflate } from 'pako'
import { TimedValues } from '../models/timedValues'
import { TransferDescriptor } from 'threads'

expose(function readData(buffer: TransferDescriptor<ArrayBuffer>): Promise<TimedValues[]> {
  return new Promise<TimedValues[]>(resolve => {
    const decompresssed = Buffer.from(inflate((buffer as unknown) as Buffer))
    const firstTime = decompresssed.readFloatBE(0)
    const lastTime = decompresssed.readFloatBE(4)
    const timeStep = (lastTime - firstTime) / ((decompresssed.length / 4 - 2) / 8)
    const timedValues = []
    let tempValues = []
    for (let i = 8; i < decompresssed.length; i += 4) {
      tempValues.push(decompresssed.readFloatBE(i))
      if (tempValues.length == 8) {
        timedValues.push(new TimedValues(firstTime + timedValues.length * timeStep, tempValues))
        tempValues = []
      }
    }

    resolve(timedValues)
  })
})
