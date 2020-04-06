import { Line, Vector3, BufferGeometry, BufferAttribute } from 'three'
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
    const firstStep = this.steps[0].value
    const lastStep = this.steps[this.steps.length - 1].value
    const padding = XAxis.windowPadding / this.graph.xZoom
    const newFirstStep = this.getClosestStep(this.graph.visibleRange.minX - padding)
    const newLastStep = this.getClosestStep(this.graph.visibleRange.maxX + padding)

    if (newFirstStep > lastStep || newLastStep < firstStep) {
      this.rebuildSteps()
      return
    }

    if (delta > 0) {
      for (let i = lastStep + this.stepSize; i < this.graph.visibleRange.maxX + padding; i += this.stepSize) {
        this.steps.push(this.getStep(i))
      }

      for (let j = firstStep; j < this.graph.visibleRange.minX - padding; j += this.stepSize) {
        this.steps.shift().remove()
      }
    }

    if (delta < 0) {
      for (let i = firstStep - this.stepSize; i > this.graph.visibleRange.minX - padding; i -= this.stepSize) {
        if (i == 0) break
        this.steps.unshift(this.getStep(i))
      }

      for (let j = lastStep; j > this.graph.visibleRange.maxX + padding; j -= this.stepSize) {
        this.steps.pop().remove()
      }
    }
  }

  updateScale(): void {
    if (this.calculateNewStep()) {
      this.rebuildSteps()
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
      const padding = XAxis.windowPadding / this.graph.xZoom

      for (let i = lastValue + this.stepSize; i < this.graph.visibleRange.maxX + padding; i += this.stepSize) {
        this.steps.push(this.getStep(i))
      }

      for (let i = firstValue - this.stepSize; i > this.graph.visibleRange.minX - padding; i -= this.stepSize) {
        this.steps.unshift(this.getStep(i))
      }
    }
  }

  moveAxis(delta: number): void {
    this.axis.position.x += delta * this.graph.xZoom
  }

  updateAxisSize(): void {
    const axisGeometry = this.axis.geometry as BufferGeometry
    const positions = axisGeometry.attributes.position as BufferAttribute

    positions.setX(1, this.graph.visibleRange.maxX)
    positions.needsUpdate = true
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

  private rebuildSteps(): void {
    while (this.steps.length > 0) {
      this.steps.pop().remove()
    }
    this.buildSteps()
  }

  private buildSteps(): void {
    for (
      let i = this.getClosestStep(this.graph.visibleRange.minX);
      i < this.graph.visibleRange.maxX;
      i += this.stepSize
    ) {
      this.steps.push(this.getStep(i))
    }
  }

  private getStep(value: number): AxisStep {
    return new AxisStep(this.graph, StepDirection.horizontal, value, true)
  }

  private getClosestStep(value: number): number {
    let initialStep
    const roundMin = Math.ceil(value)
    const remaninder = roundMin % this.stepSize

    if (remaninder == 0) initialStep = roundMin
    else initialStep = roundMin + this.stepSize - remaninder

    return initialStep ? initialStep : this.stepSize
  }
}
