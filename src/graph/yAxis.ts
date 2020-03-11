import { Line, Vector3, BufferGeometry } from 'three'
import { Graph } from '../graph/graph'
import { AxisStep, StepDirection } from '../models/axisStep'
import { Axis } from './axis'

export class YAxis extends Axis {

  private stepMultipliers = [1, 2.5, 5]

  constructor(graph: Graph) {
    super(graph)

    this.buildAxis()
    this.calculateNewStep()
    this.buildSteps()
  }

  rebuildSteps(): void {
    if(this.calculateNewStep()) {
      this.steps.forEach(step => step.remove())
      this.buildSteps()
    }
    else {
      this.steps.forEach(step => {
        step.position()
      })
    }
  }

  moveSteps(delta: number): void {
    this.steps.forEach(step => {
      step.group.position.x += delta * this.graph.xZoom
    });
  }

  private calculateNewStep(): boolean {
    let newStepSize
    let magnitude = Math.pow(10, Math.floor(Math.log(this.graph.visibleRange.maxY * 2/3) / Math.LN10))

    this.stepMultipliers.forEach(multiplier => {
      if(multiplier * magnitude <= this.graph.visibleRange.maxY * 2/3)
        newStepSize = multiplier * magnitude
    });

    this.stepSize = newStepSize

    return this.stepSize != newStepSize
  }

  private buildAxis(): void {
    let geometry  = new BufferGeometry().setFromPoints([new Vector3(0, -100000, 0), new Vector3(0, 100000, 0)])

    let line = new Line(geometry, Axis.material)
    this.graph.scene.add(line)
  }

  private buildSteps(): void {
    for (let i = this.stepSize; i < this.graph.visibleRange.maxY; i += this.stepSize) {
      this.steps.push(new AxisStep(this.graph, StepDirection.vertical, i))
    }

    for (let i = -this.stepSize; i > this.graph.visibleRange.minY; i -= this.stepSize) {
      this.steps.push(new AxisStep(this.graph, StepDirection.vertical, i))
    }
  }
}
