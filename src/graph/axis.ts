import { Line, Vector3, LineBasicMaterial, BufferGeometry, Texture, Sprite, SpriteMaterial } from 'three'
import { Graph } from '../graph/graph'
import { AxisStep, StepDirection } from '../models/axisStep'

export class Axis {
  protected graph: Graph

  // Axis line material
  protected static material = new LineBasicMaterial({ color: 0x000000 })

  // Step size to draw indicator
  protected stepSize = 1

  protected steps: AxisStep[]

  constructor(graph: Graph) {
    this.graph = graph
    this.steps = []
  }
}
