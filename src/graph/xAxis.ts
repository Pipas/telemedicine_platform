import { Line, Vector3, BufferGeometry } from 'three'
import { Graph } from '../graph/graph'
import { AxisStep, StepDirection } from '../models/axisStep'
import { Axis } from './axis'

export class XAxis extends Axis {
  private stepPossibilities = [1, 5, 10, 30, 60]
  private windowPadding = 2

  constructor(graph: Graph) {
    super(graph)

    this.buildAxis()
    this.buildSteps()
  }

  onMove(delta: number): void {
    const firstValue = this.steps[0].value
    const lastValue = this.steps[this.steps.length - 1].value

    if (delta > 0) {
      for (
        let i = lastValue + this.stepSize;
        i < this.graph.visibleRange.maxX + this.windowPadding / this.graph.xZoom;
        i += this.stepSize
      ) {
        this.steps.push(this.getNewStep(i))
      }

      for (
        let j = firstValue;
        j < this.graph.visibleRange.minX - this.windowPadding / this.graph.xZoom;
        j += this.stepSize
      ) {
        this.steps.shift().remove()
      }
    }

    if (delta < 0) {
      for (
        let i = firstValue - this.stepSize;
        i > this.graph.visibleRange.minX - this.windowPadding / this.graph.xZoom;
        i -= this.stepSize
      ) {
        this.steps.unshift(this.getNewStep(i))
      }

      for (
        let j = lastValue;
        j > this.graph.visibleRange.maxX + this.windowPadding / this.graph.xZoom;
        j -= this.stepSize
      ) {
        this.steps.pop().remove()
      }
    }
  }

  onZoom(): void {
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
        this.steps.push(this.getNewStep(i))
      }

      for (let i = firstValue - this.stepSize; i > this.graph.visibleRange.minX; i -= this.stepSize) {
        this.steps.unshift(this.getNewStep(i))
      }
    }
  }

  private calculateNewStep(): boolean {
    const stepWidth =
      (this.stepSize * this.graph.windowWidth) / (this.graph.visibleRange.maxX - this.graph.visibleRange.minX)

    if (stepWidth < 5) {
      const nextStep = this.stepPossibilities[this.stepPossibilities.findIndex(step => step == this.stepSize) + 1]
      if (nextStep == undefined) return false
      this.stepSize = nextStep

      return true
    } else if (stepWidth > 25) {
      const nextStep = this.stepPossibilities[this.stepPossibilities.findIndex(step => step == this.stepSize) - 1]
      if (nextStep == undefined) return false
      this.stepSize = nextStep

      return true
    }

    return false
  }

  moveAxis(delta: number): void {
    this.axis.position.x += delta
  }

  private buildAxis(): void {
    const geometry = new BufferGeometry().setFromPoints([new Vector3(-0.1, 0, 0), new Vector3(1.1, 0, 0)])

    this.axis = new Line(geometry, Axis.material)

    this.axis.scale.x = this.graph.windowWidth
    this.graph.scene.add(this.axis)
  }

  private buildSteps(): void {
    for (let i = this.getInitialStep(); i < this.graph.visibleRange.maxX; i += this.stepSize) {
      this.steps.push(this.getNewStep(i))
    }
  }

  private getNewStep(value: number): AxisStep {
    return new AxisStep(this.graph, StepDirection.horizontal, value, true)
  }

  private getInitialStep(): number {
    const roundMin = Math.ceil(this.graph.visibleRange.minX)
    const remaninder = roundMin % this.stepSize
    if (remaninder == 0) return roundMin

    return roundMin + this.stepSize - remaninder
  }
}
