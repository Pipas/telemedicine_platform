import { Group, Line, Vector2 } from 'three'

export class Chunk {
  static latestId = -1
  id: number
  group: Group
  firstValue: number
  lastValue: number

  constructor() {
    this.id = Chunk.latestId++
    this.group = new Group()
  }

  add(line: Line, point: Vector2): void {
    this.group.add(line)

    if (this.firstValue == null) this.firstValue = point.x

    this.lastValue = point.x
  }
}
