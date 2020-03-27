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

  onMove(delta: number): void {
    const firstValue = this.steps[0].value
    const lastValue = this.steps[this.steps.length - 1].value

    if (delta > 0) {
      for (let i = lastValue + this.stepSize; i < this.graph.visibleRange.maxX; i += this.stepSize) {
        this.steps.push(new AxisStep(this.graph, StepDirection.horizontal, i))
      }

      for (let j = firstValue; j < this.graph.visibleRange.minX; j += this.stepSize) {
        this.steps.shift().remove()
      }
    }

    if (delta < 0) {
      for (let i = firstValue - this.stepSize; i > this.graph.visibleRange.minX; i -= this.stepSize) {
        this.steps.unshift(new AxisStep(this.graph, StepDirection.horizontal, i))
      }

      for (let j = lastValue; j > this.graph.visibleRange.maxX; j -= this.stepSize) {
        this.steps.pop().remove()
      }
    }
  }

  onZoom(): void {
    let i = this.steps.length
    while (i--) {
      const step = this.steps[i]
      if (step.value > this.graph.visibleRange.minX && step.value < this.graph.visibleRange.maxX) {
        step.position()
      } else {
        step.remove()
        this.steps.splice(i, 1)
      }
    }

    const firstValue = this.steps[0].value
    const lastValue = this.steps[this.steps.length - 1].value

    for (let i = lastValue + this.stepSize; i < this.graph.visibleRange.maxX; i += this.stepSize) {
      this.steps.push(new AxisStep(this.graph, StepDirection.horizontal, i))
    }

    for (let i = firstValue - this.stepSize; i > this.graph.visibleRange.minX; i -= this.stepSize) {
      this.steps.unshift(new AxisStep(this.graph, StepDirection.horizontal, i))
    }
  }

  moveAxis(delta: number): void {
    this.axis.position.x += delta
  }

  private buildAxis(): void {
    const geometry = new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(1, 0, 0)])

    this.axis = new Line(geometry, Axis.material)

    this.axis.scale.x = this.graph.windowWidth
    this.graph.scene.add(this.axis)
  }

  private buildSteps(): void {
    for (let i = 0; i < this.graph.visibleRange.maxX; i += this.stepSize) {
      this.steps.push(new AxisStep(this.graph, StepDirection.horizontal, i))
    }
  }
}
