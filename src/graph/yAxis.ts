import { Graph } from '../graph/graph'
import { AxisStep, StepDirection } from '../models/axisStep'
import { Axis } from './axis'

export class YAxis extends Axis {
  private stepMultipliers = [1, 2.5, 5]

  constructor(graph: Graph) {
    super(graph)

    this.calculateNewStep()
    this.buildSteps()
  }

  rebuildSteps(): void {
    if (this.calculateNewStep()) {
      while (this.steps.length > 0) {
        this.steps.pop().remove()
      }
      this.buildSteps()
    } else {
      this.steps.forEach(step => {
        step.position()
      })
    }
  }

  moveSteps(delta: number): void {
    this.steps.forEach(step => {
      step.group.position.x += delta
    })
  }

  private calculateNewStep(): boolean {
    let newStepSize = this.stepSize
    const magnitude = Math.pow(10, Math.floor(Math.log((this.graph.visibleRange.maxY * 2) / 3) / Math.LN10))

    this.stepMultipliers.forEach(multiplier => {
      if (multiplier * magnitude <= (this.graph.visibleRange.maxY * 2) / 3) newStepSize = multiplier * magnitude
    })

    const rebuildSteps =
      this.stepSize != newStepSize || Math.floor(this.graph.visibleRange.maxY / newStepSize) > this.steps.length / 2
    this.stepSize = newStepSize

    return rebuildSteps
  }

  private getNewStep(value: number): AxisStep {
    return new AxisStep(this.graph, StepDirection.vertical, value, false)
  }

  private buildSteps(): void {
    for (let i = this.stepSize; i < this.graph.visibleRange.maxY; i += this.stepSize) {
      this.steps.push(this.getNewStep(i))
    }

    for (let i = -this.stepSize; i > this.graph.visibleRange.minY; i -= this.stepSize) {
      this.steps.push(this.getNewStep(i))
    }
  }
}
