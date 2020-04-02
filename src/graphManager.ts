import { WebGLRenderer, Vector2 } from 'three'
import { Graph } from './graph/graph'

export class GraphManager {
  private canvas: HTMLCanvasElement

  private renderer: WebGLRenderer
  private graphs: Graph[]

  constructor() {
    this.canvas = document.getElementById('webGL-canvas') as HTMLCanvasElement

    this.buildRender()
    this.initGraphs()
  }

  initGraphs(): void {
    this.graphs = []
    document.querySelectorAll('.graph').forEach(element => {
      this.graphs.push(new Graph(element as HTMLDivElement))
    })
  }

  private buildRender(): void {
    this.renderer = new WebGLRenderer({ canvas: this.canvas })
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1
    this.renderer.setPixelRatio(DPR)
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight)
  }

  addPoint(point: Vector2): void {
    this.graphs[0].addPoint(point)
  }

  update(): void {
    this.graphs.forEach(graph => {
      graph.render(this.renderer)
    })
  }

  onWindowResize(): void {
    // const { offsetWidth, offsetHeight } = canvas
    // screenDimensions.width = offsetWidth
    // screenDimensions.height = offsetHeight
    // camera.aspect = offsetWidth / offsetHeight
    // camera.updateProjectionMatrix()
    // renderer.setSize(offsetWidth, offsetHeight)
  }
}
