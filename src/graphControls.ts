import { Graph } from './graph/graph'

export class GraphControls {
  private graph: Graph
  private canvas: HTMLCanvasElement
  private controlDiv: HTMLDivElement

  private followLine: HTMLButtonElement
  private updateVerticalRange: HTMLButtonElement

  constructor(graph: Graph, canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.graph = graph
    this.initControls()
  }

  private initControls(): void {
    this.controlDiv = document.createElement('div')
    this.controlDiv.setAttribute('class', 'controls')
    this.canvas.parentElement.appendChild(this.controlDiv)

    this.addXPositiveZoomButton()
    this.addXNegativeZoomButton()
    this.addYPositiveZoomButton()
    this.addYNegativeZoomButton()
    this.addMiddleButton()

    this.createFollowLineButton()
    this.createUpdateVerticalRangeButton()
  }

  setFollowLineButtonVisability(visability: boolean): void {
    if (visability) this.followLine.style.display = 'block'
    else this.followLine.style.display = 'none'
  }

  setUpdateVerticalRangeButtonVisability(visability: boolean): void {
    if (visability) this.updateVerticalRange.style.display = 'block'
    else this.updateVerticalRange.style.display = 'none'
  }

  private addMiddleButton(): void {
    const button = document.createElement('button')
    button.setAttribute('class', 'mid vmid')
    this.controlDiv.appendChild(button)
  }

  private createFollowLineButton(): void {
    this.followLine = document.createElement('button')
    this.followLine.setAttribute('class', 'top right')
    this.followLine.innerHTML = '>'
    this.controlDiv.appendChild(this.followLine)

    this.followLine.style.display = 'none'

    this.followLine.addEventListener('click', () => {
      this.graph.setCameraFollow(true)
    })
  }

  private createUpdateVerticalRangeButton(): void {
    this.updateVerticalRange = document.createElement('button')
    this.updateVerticalRange.setAttribute('class', 'top left')
    this.updateVerticalRange.innerHTML = '['
    this.controlDiv.appendChild(this.updateVerticalRange)

    this.updateVerticalRange.style.display = 'none'

    this.updateVerticalRange.addEventListener('click', () => {
      this.graph.setAutoUpdateVerticalRange(true)
    })
  }

  private addXPositiveZoomButton(): void {
    const button = document.createElement('button')
    button.setAttribute('class', 'right vmid')
    button.innerHTML = '+'
    this.controlDiv.appendChild(button)

    button.addEventListener('click', () => {
      this.graph.increaseHorizontalZoom()
    })
  }

  private addXNegativeZoomButton(): void {
    const button = document.createElement('button')
    button.setAttribute('class', 'left vmid')
    button.innerHTML = '-'
    this.controlDiv.appendChild(button)

    button.addEventListener('click', () => {
      this.graph.decreaseHorizontalZoom()
    })
  }

  private addYPositiveZoomButton(): void {
    const button = document.createElement('button')
    button.setAttribute('class', 'top mid')
    button.innerHTML = '+'
    this.controlDiv.appendChild(button)

    button.addEventListener('click', () => {
      this.graph.increaseVerticalZoom()
    })
  }

  private addYNegativeZoomButton(): void {
    const button = document.createElement('button')
    button.setAttribute('class', 'bottom mid')
    button.innerHTML = '-'
    this.controlDiv.appendChild(button)

    button.addEventListener('click', () => {
      this.graph.decreaseVerticalZoom()
    })
  }
}
