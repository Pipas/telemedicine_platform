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

  addGraph(): void {
    if (this.graphs.length == 8) return

    const graphs = document.querySelector('.graphs')
    const newGraph = document.createElement('div')
    newGraph.setAttribute('class', 'graph')
    graphs.appendChild(newGraph)

    this.graphs.push(new Graph(newGraph))
  }

  deleteGraph(): void {
    if (this.graphs.length == 1) return
    const lastGraph = this.graphs.pop()
    lastGraph.element.remove()
  }

  private buildRender(): void {
    this.renderer = new WebGLRenderer({ canvas: this.canvas })
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1
    this.renderer.setClearColor(0xffffff, 1)
    this.renderer.setPixelRatio(DPR)
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight, false)
  }

  addPoints(points: Vector2[]): void {
    this.graphs.forEach((graph, index) => {
      graph.addPoint(points[index])
    })
  }

  canvasHasUpdated(): void {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.renderer.setSize(width, height, false)
    }
  }

  update(): void {
    this.canvasHasUpdated()

    this.canvas.style.transform = `translateY(${window.scrollY}px)`

    this.renderer.setScissorTest(false)
    this.renderer.clear()
    this.renderer.setScissorTest(true)

    this.graphs.forEach(graph => {
      graph.render(this.renderer)
    })
  }
}
