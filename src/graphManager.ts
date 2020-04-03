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
    this.renderer.setClearColor(0xffffff, 1)
    this.renderer.setPixelRatio(DPR)
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight)
  }

  addPoints(points: Vector2[]): void {
    console.log(points)
    // this.graphs.forEach((graph, index) => {
    //   graph.addPoint(points[0])
    // })
  }

  update(): void {
    this.renderer.setScissorTest(false)
    this.renderer.clear()
    this.renderer.setScissorTest(true)

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
