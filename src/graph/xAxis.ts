import { Line, Vector3, BufferGeometry } from 'three'
import { Graph } from '../graph/graph'
import { AxisStep, StepDirection } from '../models/axisStep'
import { Axis } from './axis'

export class XAxis extends Axis {
  private static stepPossibilities = [1, 2, 5, 10, 30, 60]
  private static windowPadding = 2

  constructor(graph: Graph) {
    super(graph)

    this.buildAxis()
    this.buildSteps()
  }

  moveScale(delta: number): void {
    const firstValue = this.steps[0].value
    const lastValue = this.steps[this.steps.length - 1].value
    const padding = XAxis.windowPadding / this.graph.xZoom

    if (delta > 0) {
      for (let i = lastValue + this.stepSize; i < this.graph.visibleRange.maxX + padding; i += this.stepSize) {
        this.steps.push(this.getStep(i))
      }

      for (let j = firstValue; j < this.graph.visibleRange.minX - padding; j += this.stepSize) {
        this.steps.shift().remove()
      }
    }

    if (delta < 0) {
      for (let i = firstValue - this.stepSize; i > this.graph.visibleRange.minX - padding; i -= this.stepSize) {
        if(i == 0) continue
        this.steps.unshift(this.getStep(i))
      }

      for (let j = lastValue; j > this.graph.visibleRange.maxX + padding; j -= this.stepSize) {
        this.steps.pop().remove()
      }
    }
  }

  updateScale(): void {
    if (this.calculateNewStep()) {
      this.steps.forEach(step => step.remove())
      this.buildSteps()
    } else {
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
        this.steps.push(this.getStep(i))
      }

      for (let i = firstValue - this.stepSize; i > this.graph.visibleRange.minX; i -= this.stepSize) {
        this.steps.unshift(this.getStep(i))
      }
    }
  }

  moveAxis(delta: number): void {
    this.axis.position.x += delta * this.graph.xZoom
  }

  private calculateNewStep(): boolean {
    const stepWidth =
      (this.stepSize * this.graph.element.offsetWidth) / (this.graph.visibleRange.maxX - this.graph.visibleRange.minX)

    if (stepWidth < 50) {
      const nextStep = XAxis.stepPossibilities[XAxis.stepPossibilities.findIndex(step => step == this.stepSize) + 1]
      if (nextStep == undefined) return false
      this.stepSize = nextStep

      return true
    } else if (stepWidth > 100) {
      const nextStep = XAxis.stepPossibilities[XAxis.stepPossibilities.findIndex(step => step == this.stepSize) - 1]
      if (nextStep == undefined) return false
      this.stepSize = nextStep

      return true
    }

    return false
  }

  private buildAxis(): void {
    const geometry = new BufferGeometry().setFromPoints([
      new Vector3(this.graph.visibleRange.minX, 0, 0),
      new Vector3(this.graph.visibleRange.maxX, 0, 0),
    ])

    this.axis = new Line(geometry, Axis.material)

    this.axis.scale.x = this.graph.xZoom
    this.graph.scene.add(this.axis)
  }

  private buildSteps(): void {
    for (let i = this.getInitialStep(); i < this.graph.visibleRange.maxX; i += this.stepSize) {
      this.steps.push(this.getStep(i))
    }
  }

  private getStep(value: number): AxisStep {
    return new AxisStep(this.graph, StepDirection.horizontal, value, true)
  }

  private getInitialStep(): number {
    let initialStep
    const roundMin = Math.ceil(this.graph.visibleRange.minX)
    const remaninder = roundMin % this.stepSize

    if (remaninder == 0) initialStep = roundMin
    else initialStep = roundMin + this.stepSize - remaninder

    return initialStep ? initialStep : this.stepSize
  }
}
