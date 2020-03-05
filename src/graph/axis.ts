import { Line, Vector3, LineBasicMaterial, BufferGeometry, Texture, Sprite, SpriteMaterial } from 'three'
import { Graph } from '../graph/graph'
import { AxisStep, StepDirection } from '../models/axisStep'

export class Axis {
  
  private graph: Graph
  
  // Axis line material
  private static material = new LineBasicMaterial({ color: 0x000000 })
  
  // Step size to draw indicator
  private stepSize = 1

  // Last drawn indicator
  private lastDrawnStep = 0

  private steps: AxisStep[]

  constructor(graph: Graph) {
    this.graph = graph
    this.steps = []

    this.buildAxis()
    this.buildSteps()
  }

  update(): void {
    this.buildSteps()
  }

  private buildAxis(): void {
    let geometry = new BufferGeometry().setFromPoints([new Vector3(-100000, 0, 0), new Vector3(100000, 0, 0)])
    let line = new Line(geometry, Axis.material)

    this.graph.scene.add(line)

    geometry = new BufferGeometry().setFromPoints([new Vector3(0, -100000, 0), new Vector3(0, 100000, 0)])
    line = new Line(geometry, Axis.material)

    this.graph.scene.add(line)
  }

  private buildSteps(): void {
    for (this.lastDrawnStep; this.lastDrawnStep < this.graph.visibleRange.maxX; this.lastDrawnStep += this.stepSize) {
      this.steps.push(new AxisStep(this.graph, StepDirection.horizontal, this.lastDrawnStep))
    }
  }
}
