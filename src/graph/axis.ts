import { Line, Vector3, LineBasicMaterial, BufferGeometry } from 'three'
import { Graph } from '../graph/graph'

export class Axis {
  
  private graph: Graph
  
  // Axis line material
  private static material = new LineBasicMaterial({ color: 0x000000 })
  
  // Step size to draw indicator
  private stepSize = 1

  // Last drawn indicator
  private lastDrawnStep = 0

  constructor(graph: Graph) {
    this.graph = graph
    this.buildAxis()
    this.buildSteps()
  }

  update(): void {
    this.buildSteps()
  }

  private buildAxis(): void {
    this.addLine([new Vector3(-100000, 0, 0), new Vector3(100000, 0, 0)])
  }

  private buildSteps(): void {
    for (this.lastDrawnStep; this.lastDrawnStep < this.graph.visibleRange.maxX; this.lastDrawnStep += this.stepSize) {
      this.addStep(this.lastDrawnStep)
    }
  }

  addStep(x: number): void {
    this.addLine([new Vector3(x * this.graph.xZoom, 0, 0), new Vector3(x * this.graph.xZoom, -0.5, 0)])
  }

  addLine (points: Vector3[]): void {
    const geometry = new BufferGeometry().setFromPoints(points)
    const line = new Line(geometry, Axis.material)

    this.graph.scene.add(line)
  }
}
