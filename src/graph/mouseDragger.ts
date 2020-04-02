import { Vector2, EventDispatcher } from 'three'

export class MouseDragger extends EventDispatcher {
  private element: HTMLElement
  private mousePosition: Vector2

  constructor(element: HTMLElement) {
    super()
    this.element = element

    this.attachEvents()
  }

  attachEvents(): void {
    document.addEventListener('mousedown', this.onDocumentMouseDown, false)
    document.addEventListener('mousemove', this.onDocumentMouseMove, false)
    document.addEventListener('mouseup', this.onDocumentMouseUp, false)
  }

  onDocumentMouseDown = (event: MouseEvent): void => {
    if (!this.mouseInElement(event)) return

    event.preventDefault()

    this.mousePosition = this.getMousePosition(event)
  }

  onDocumentMouseMove = (event: MouseEvent): void => {
    if (this.mousePosition == null) return

    event.preventDefault()

    const newPosition = this.getMousePosition(event)

    if (newPosition.equals(this.mousePosition)) return

    this.dispatchEvent({
      type: 'drag',
      delta: new Vector2(newPosition.x - this.mousePosition.x, newPosition.y - this.mousePosition.y),
    })

    this.mousePosition = newPosition
  }

  onDocumentMouseUp = (): void => {
    this.mousePosition = null
  }

  private mouseInElement(event: MouseEvent): boolean {
    const rect = this.element.getBoundingClientRect()

    return !(
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
  }

  private getMousePosition(event: MouseEvent): Vector2 {
    const rect = this.element.getBoundingClientRect()

    const position = new Vector2(event.clientX - rect.left, event.clientY - rect.top)

    return position
  }
}
