import { Line, Vector3, BufferGeometry, BufferAttribute } from 'three'
import { Graph } from '../graph/graph'
import { AxisStep, StepDirection } from '../models/axisStep'
import { Axis } from './axis'

/**
 * Represents the graph X Axis and hadles it's related logic
 *
 * @export
 * @class XAxis
 * @extends {Axis}
 */
export class XAxis extends Axis {
  // In seconds the values that a scale step can take
  private static stepPossibilities = [1, 2, 5, 10, 30, 60]

  private static windowPadding = 2

  constructor(graph: Graph) {
    super(graph)

    this.buildAxis()
    this.buildSteps()
  }

  /**
   * Called when graphs visible range moved by a delta ammount
   *
   * @param {number} delta
   * @memberof XAxis
   */
  moveScale(delta: number): void {
    // If no steps visible rebuild steps
    if (this.steps.length == 0) {
      this.rebuildSteps()
      return
    }

    const firstStep = this.steps[0].value
    const lastStep = this.steps[this.steps.length - 1].value
    const padding = XAxis.windowPadding / this.graph.xZoom
    const newFirstStep = this.getClosestStep(this.graph.visibleRange.minX - padding)
    const newLastStep = this.getClosestStep(this.graph.visibleRange.maxX + padding)

    // If no existing steps are repurposed, rebuild steps
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

  /**
   * Called when the visible range is changed by a zoom or viewport change
   *
   * @memberof XAxis
   */
  updateScale(): void {
    // If step size changes rebuilds steps
    if (this.calculateNewStep() || this.steps.length == 0) {
      this.rebuildSteps()
    } else {
      let i = this.steps.length
      while (i--) {
        const step = this.steps[i]
        // If step is still visible, repositions it, if it isn't removes it
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

  /**
   * Moves the axis line a delta ammount
   *
   * @param {number} delta
   * @memberof XAxis
   */
  moveAxis(delta: number): void {
    this.axis.position.x += delta * this.graph.xZoom
  }

  /**
   * Updates the size of the axis line to graph window size
   *
   * @memberof XAxis
   */
  updateAxisSize(): void {
    const axisGeometry = this.axis.geometry as BufferGeometry
    const positions = axisGeometry.attributes.position as BufferAttribute

    positions.setX(1, this.graph.visibleRange.maxX)
    positions.needsUpdate = true
  }

  /**
   * Calculates if it should change the step size
   *
   * @private
   * @returns {boolean}
   * @memberof XAxis
   */
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

  /**
   * Builds the axis line
   *
   * @private
   * @memberof XAxis
   */
  private buildAxis(): void {
    const geometry = new BufferGeometry().setFromPoints([
      new Vector3(this.graph.visibleRange.minX, 0, 0),
      new Vector3(this.graph.visibleRange.maxX, 0, 0),
    ])

    this.axis = new Line(geometry, Axis.material)

    this.axis.scale.x = this.graph.xZoom
    this.graph.scene.add(this.axis)
  }

  /**
   * Rebuilds all steps
   *
   * @private
   * @memberof XAxis
   */
  private rebuildSteps(): void {
    while (this.steps.length > 0) {
      this.steps.pop().remove()
    }
    this.buildSteps()
  }

  /**
   * Builds visible steps
   *
   * @private
   * @memberof XAxis
   */
  private buildSteps(): void {
    for (
      let i = this.getClosestStep(this.graph.visibleRange.minX);
      i < this.graph.visibleRange.maxX;
      i += this.stepSize
    ) {
      this.steps.push(this.getStep(i))
    }
  }

  /**
   * Returns a new step for value
   *
   * @private
   * @param {number} value
   * @returns {AxisStep}
   * @memberof XAxis
   */
  private getStep(value: number): AxisStep {
    return new AxisStep(this.graph, StepDirection.horizontal, value, true)
  }

  /**
   * Calculates the closes step to a particuler value
   *
   * @private
   * @param {number} value
   * @returns {number}
   * @memberof XAxis
   */
  private getClosestStep(value: number): number {
    let initialStep
    const roundMin = Math.ceil(value)
    const remaninder = roundMin % this.stepSize

    if (remaninder == 0) initialStep = roundMin
    else initialStep = roundMin + this.stepSize - remaninder

    return initialStep ? initialStep : this.stepSize
  }
}
