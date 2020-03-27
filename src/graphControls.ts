import { Graph } from './graph/graph'

export class GraphControls {
  private graph: Graph
  private canvas: HTMLCanvasElement
  private controlDiv: HTMLDivElement

  constructor(graph: Graph, canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.graph = graph
    this.initControls()
  }

  initControls(): void {
    this.controlDiv = document.createElement('div')
    this.controlDiv.setAttribute('class', 'controls')
    this.canvas.parentElement.appendChild(this.controlDiv)

    this.addXPositiveZoomButton()
    this.addXNegativeZoomButton()
  }

  addXPositiveZoomButton(): void {
    const button = document.createElement('button')
    button.setAttribute('class', 'right vmid')
    button.innerHTML = '+'
    this.controlDiv.appendChild(button)

    button.addEventListener('click', () => {
      this.graph.increaseHorizontalZoom()
    })
  }

  addXNegativeZoomButton(): void {
    const button = document.createElement('button')
    button.setAttribute('class', 'left vmid')
    button.innerHTML = '-'
    this.controlDiv.appendChild(button)

    button.addEventListener('click', () => {
      this.graph.decreaseHorizontalZoom()
    })
  }
}
