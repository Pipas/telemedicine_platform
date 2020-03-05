import { LineBasicMaterial, Vector3, Line, BufferGeometry } from 'three'
import { Point } from './point'
import { Graph } from '../graph/graph'

export class GraphLine {
  public static material = new LineBasicMaterial({ color: 0x0000ff })

  private graph: Graph

  public startPoint: Point
  public endPoint: Point

  public object: Line

  constructor(graph: Graph, startPoint: Point, endPoint: Point) {
    this.graph = graph
    this.startPoint = startPoint
    this.endPoint = endPoint

    this.draw()
  }

  isVisible(): boolean {
    return this.graph.visibleRange.contains(this.startPoint) || this.graph.visibleRange.contains(this.endPoint)
  }

  draw(): void {
    const firstPoint = new Vector3(this.startPoint.x * this.graph.xZoom, this.startPoint.y * this.graph.yZoom, 0)
    const secondPoint = new Vector3(this.endPoint.x * this.graph.xZoom, this.endPoint.y * this.graph.yZoom, 0)
    const geometry = new BufferGeometry().setFromPoints([firstPoint, secondPoint])

    this.object = new Line(geometry, GraphLine.material)

    this.graph.scene.add(this.object)
  }

  remove(): void {
    this.graph.scene.remove(this.object)
  }

  redraw(): void {
    this.remove()
    this.draw()
  }
}