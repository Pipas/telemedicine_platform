import { LineBasicMaterial, Line } from 'three'
import { Graph } from '../graph/graph'
import { AxisStep } from '../models/axisStep'

/**
 * Representation of an Axis in the graph
 *
 * @export
 * @class Axis
 */
export class Axis {
  protected graph: Graph

  // Axis line material
  protected static material = new LineBasicMaterial({ color: 0x000000 })

  // Step size to draw indicator
  protected stepSize = 1

  // Axis drawable objects
  protected axis: Line
  protected steps: AxisStep[]

  constructor(graph: Graph) {
    this.graph = graph
    this.steps = []
  }
}
