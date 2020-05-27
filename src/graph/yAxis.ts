import { Graph } from '../graph/graph'
import { AxisStep, StepDirection } from './axisStep'
import { Axis } from './axis'

/**
 * Represents the graph Y Axis and hadles it's related logic
 *
 * @export
 * @class YAxis
 * @extends {Axis}
 */
export class YAxis extends Axis {
  private stepMultipliers = [1, 2.5, 5]

  constructor(graph: Graph) {
    super(graph)

    this.calculateNewStep()
    this.buildSteps()
  }

  /**
   * Called when Y zoom is changed
   *
   * @memberof YAxis
   */
  updateScale(): void {
    // If a new step is calculated rebuilds steps, else repositions them
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

  /**
   * Moves steps horizontally according to delta so they stay visible when the graph window moves
   *
   * @param {number} delta
   * @memberof YAxis
   */
  moveSteps(delta: number): void {
    this.steps.forEach(step => {
      step.group.position.x += delta * this.graph.xZoom
    })
  }

  /**
   * Returns true if a new step value is calculated
   *
   * @private
   * @returns {boolean}
   * @memberof YAxis
   */
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

  /**
   * Returns a new step for value
   *
   * @private
   * @param {number} value
   * @returns {AxisStep}
   * @memberof YAxis
   */
  private getNewStep(value: number): AxisStep {
    return new AxisStep(this.graph, StepDirection.vertical, value, false)
  }

  /**
   * Builds visible steps
   *
   * @private
   * @memberof YAxis
   */
  private buildSteps(): void {
    for (let i = this.stepSize; i < this.graph.visibleRange.maxY; i += this.stepSize) {
      this.steps.push(this.getNewStep(i))
    }

    for (let i = -this.stepSize; i > this.graph.visibleRange.minY; i -= this.stepSize) {
      this.steps.push(this.getNewStep(i))
    }
  }
}
