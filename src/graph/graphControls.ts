import { Graph } from './graph'

/**
 * Handles the display and interaction with the graph controls
 *
 * @export
 * @class GraphControls
 */
export class GraphControls {
  private graph: Graph
  private element: HTMLDivElement
  private controlDiv: HTMLDivElement

  private followLine: HTMLButtonElement
  private updateVerticalRange: HTMLButtonElement

  constructor(graph: Graph, element: HTMLDivElement) {
    this.element = element
    this.graph = graph

    this.controlDiv = document.createElement('div')
    this.controlDiv.setAttribute('class', 'controls')
    this.element.appendChild(this.controlDiv)

    this.addXPositiveZoomButton()
    this.addXNegativeZoomButton()
    this.addYPositiveZoomButton()
    this.addYNegativeZoomButton()
    this.addMiddleButton()

    this.createFollowLineButton()
    this.createUpdateVerticalRangeButton()
  }

  /**
   * Sets the visibility of the follow line button
   *
   * @param {boolean} visability
   * @memberof GraphControls
   */
  setFollowLineButtonVisability(visability: boolean): void {
    if (visability) this.followLine.style.display = 'block'
    else this.followLine.style.display = 'none'
  }

  /**
   * Sets the visibility of the auto update vertical range button
   *
   * @param {boolean} visability
   * @memberof GraphControls
   */
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
      this.graph.setAutoMoveHorizontalRange(true)
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
