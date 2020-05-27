import { WebGLRenderer, Vector2 } from 'three'
import { Graph } from './graph'
import { TimedValues } from './timedValues'

/**
 * Manages all the graphs in the page
 *
 * @export
 * @class GraphManager
 */
export class GraphManager {
  private canvas: HTMLCanvasElement
  private renderer: WebGLRenderer
  private graphs: Graph[]

  constructor() {
    this.canvas = document.getElementById('webGL-canvas') as HTMLCanvasElement

    this.initRenderer()
    this.initGraphs()
  }

  /**
   * Creates a graph and appends it to the element with the class "graphs"
   *
   * @memberof GraphManager
   */
  addGraph(): void {
    // Max number of graphs is 8
    if (this.graphs.length == 8) return

    const graphs = document.querySelector('.graphs')
    const newGraph = document.createElement('div')
    newGraph.setAttribute('class', 'graph')
    graphs.appendChild(newGraph)

    this.graphs.push(new Graph(newGraph))
  }

  /**
   * Deletes the last added graph aswell as it's element
   *
   * @memberof GraphManager
   */
  deleteGraph(): void {
    if (this.graphs.length == 1) return
    const lastGraph = this.graphs.pop()
    lastGraph.element.remove()
  }

  /**
   * Adds a Vector2 point to a graph, the index of the point in the points array corresponds to the index of the graph
   * it'll be added to.
   *
   * @param {Vector2[]} points
   * @memberof GraphManager
   */
  addPoints(points: Vector2[]): void {
    this.graphs.forEach((graph, index) => {
      if (index < points.length) {
        graph.addPoint(points[index])
      }
    })
  }

  /**
   * Adds a multiple timed values to the graphs, each value index corresponds to the index of the graph it'll be added to.
   *
   * @param {TimedValues[]} timedValues
   * @memberof GraphManager
   */
  addTimedValues(timedValues: TimedValues[]): void {
    timedValues.forEach(tv => {
      for (let i = 0; i < this.graphs.length; i++) {
        this.graphs[i].addPoint(new Vector2(tv.time, tv.values[i]))
      }
    })
  }

  /**
   * Renders all the graphs to the canvas using the WebGLRender, should be called every frame it needs to paint
   *
   * @memberof GraphManager
   */
  render(): void {
    this.canvasHasUpdated()

    this.canvas.style.transform = `translateY(${window.scrollY}px)`

    this.renderer.setScissorTest(false)
    this.renderer.clear()
    this.renderer.setScissorTest(true)

    this.graphs.forEach(graph => {
      graph.render(this.renderer)
    })
  }

  /**
   * Updates the renderer size if the canvas was updated
   *
   * @private
   * @memberof GraphManager
   */
  private canvasHasUpdated(): void {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.renderer.setSize(width, height, false)
    }
  }

  /**
   * Initiates a new graph for every element with the class 'graph'
   *
   * @private
   * @memberof GraphManager
   */
  private initGraphs(): void {
    this.graphs = []
    document.querySelectorAll('.graph').forEach(element => {
      this.graphs.push(new Graph(element as HTMLDivElement))
    })
  }

  /**
   * Initiates the WebGL renderer and all it's settings
   *
   * @private
   * @memberof GraphManager
   */
  private initRenderer(): void {
    this.renderer = new WebGLRenderer({ canvas: this.canvas })
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1
    this.renderer.setClearColor(0xffffff, 1)
    this.renderer.setPixelRatio(DPR)
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight, false)
  }
}
