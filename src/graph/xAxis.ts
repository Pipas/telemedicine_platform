import { Line, Vector3, BufferGeometry } from 'three'
import { Graph } from '../graph/graph'
import { AxisStep, StepDirection } from '../models/axisStep'
import { Axis } from './axis'

export class XAxis extends Axis {
  private lastStep: number

  constructor(graph: Graph) {
    super(graph)

    this.buildAxis()
    this.buildSteps()
  }

  rebuildSteps(): void {
    if (this.graph.visibleRange.maxX > this.lastStep + this.stepSize) {
      this.lastStep += this.stepSize
      this.steps.push(new AxisStep(this.graph, StepDirection.horizontal, this.lastStep))
    }

    if (this.graph.visibleRange.minX > this.steps[0].value) {
      this.steps.shift().remove()
    }
  }

  private buildAxis(): void {
    const geometry = new BufferGeometry().setFromPoints([new Vector3(-100000, 0, 0), new Vector3(100000, 0, 0)])

    const line = new Line(geometry, Axis.material)
    this.graph.scene.add(line)
  }

  private buildSteps(): void {
    this.lastStep = Math.ceil(this.graph.visibleRange.minX) - (Math.ceil(this.graph.visibleRange.maxX) % this.stepSize)

    for (this.lastStep; this.lastStep < this.graph.visibleRange.maxX; this.lastStep += this.stepSize) {
      this.steps.push(new AxisStep(this.graph, StepDirection.horizontal, this.lastStep))
    }
    this.lastStep--
  }
}
