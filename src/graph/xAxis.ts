import { Line, Vector3, BufferGeometry } from 'three'
import { Graph } from '../graph/graph'
import { AxisStep, StepDirection } from '../models/axisStep'
import { Axis } from './axis'

export class XAxis extends Axis {
  constructor(graph: Graph) {
    super(graph)

    this.buildAxis()
    this.buildSteps()
  }

  updateSteps(): void {
    const firstValue = this.steps[0].value
    const lastValue = this.steps[this.steps.length - 1].value

    if (this.graph.visibleRange.maxX > lastValue + this.stepSize) {
      this.steps.push(new AxisStep(this.graph, StepDirection.horizontal, lastValue + this.stepSize))
    } else if (this.graph.visibleRange.maxX < lastValue) {
      this.steps.pop().remove()
    }

    if (this.graph.visibleRange.minX < firstValue - this.stepSize) {
      this.steps.unshift(new AxisStep(this.graph, StepDirection.horizontal, firstValue - this.stepSize))
    } else if (this.graph.visibleRange.minX > firstValue) {
      this.steps.shift().remove()
    }
  }

  private buildAxis(): void {
    const geometry = new BufferGeometry().setFromPoints([new Vector3(-100000, 0, 0), new Vector3(100000, 0, 0)])

    const line = new Line(geometry, Axis.material)
    this.graph.scene.add(line)
  }

  private buildSteps(): void {
    let lastStep = Math.ceil(this.graph.visibleRange.minX) - (Math.ceil(this.graph.visibleRange.maxX) % this.stepSize)

    for (lastStep; lastStep < this.graph.visibleRange.maxX; lastStep += this.stepSize) {
      this.steps.push(new AxisStep(this.graph, StepDirection.horizontal, lastStep))
    }
  }
}
