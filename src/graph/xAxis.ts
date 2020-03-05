import { Line, Vector3, LineBasicMaterial, BufferGeometry, Texture, Sprite, SpriteMaterial } from 'three'
import { Graph } from '../graph/graph'
import { AxisStep, StepDirection } from '../models/axisStep'
import { Axis } from './axis'

export class XAxis extends Axis {

  constructor(graph: Graph) {
    super(graph)

    this.buildAxis()
    this.buildSteps()
  }

  rebuildSteps(): void {
    this.steps.forEach(step => step.remove())
    this.buildSteps()
  }

  private buildAxis(): void {
    let geometry  = new BufferGeometry().setFromPoints([new Vector3(-100000, 0, 0), new Vector3(100000, 0, 0)])

    let line = new Line(geometry, Axis.material)
    this.graph.scene.add(line)
  }

  private buildSteps(): void {
    let firstStep = Math.floor(this.graph.visibleRange.minX) - Math.floor(this.graph.visibleRange.maxX) % this.stepSize

    for (firstStep; firstStep < this.graph.visibleRange.maxX; firstStep += this.stepSize) {
      this.steps.push(new AxisStep(this.graph, StepDirection.horizontal, firstStep))
    }
  }
}
