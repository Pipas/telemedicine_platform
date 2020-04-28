import { Vector2, EventDispatcher } from 'three'

/**
 * Class that handles user input to make dragging actions possible
 *
 * @export
 * @class DragHandler
 * @extends {EventDispatcher}
 */
export class DragHandler extends EventDispatcher {
  // The element the user drags
  private element: HTMLElement
  private dragPosition: Vector2

  constructor(element: HTMLElement) {
    super()
    this.element = element

    // If the browser has touch capabilities
    if ('ontouchstart' in document.documentElement) {
      document.addEventListener('touchstart', this.onDocumentTouchStart, false)
      document.addEventListener('touchmove', this.onDocumentTouchMove, false)
      document.addEventListener('touchend', this.onDocumentTouchEnd, false)
    }

    document.addEventListener('mousedown', this.onDocumentMouseDown, false)
    document.addEventListener('mousemove', this.onDocumentMouseMove, false)
    document.addEventListener('mouseup', this.onDocumentMouseUp, false)
  }

  private onDocumentTouchStart = (event: TouchEvent): void => {
    if (!this.touchInElement(event)) return

    event.preventDefault()

    this.dragPosition = this.getTouchPosition(event)
  }

  private onDocumentTouchMove = (event: TouchEvent): void => {
    if (this.dragPosition == null) return

    event.preventDefault()

    const newPosition = this.getTouchPosition(event)

    if (newPosition.equals(this.dragPosition)) return

    this.dispatchEvent({
      type: 'drag',
      delta: new Vector2(newPosition.x - this.dragPosition.x, newPosition.y - this.dragPosition.y),
    })

    this.dragPosition = newPosition
  }

  private onDocumentTouchEnd = (): void => {
    this.dragPosition = null
  }

  private onDocumentMouseDown = (event: MouseEvent): void => {
    if (!this.mouseInElement(event)) return

    event.preventDefault()

    this.dragPosition = this.getMousePosition(event)
  }

  private onDocumentMouseMove = (event: MouseEvent): void => {
    if (this.dragPosition == null) return

    event.preventDefault()

    const newPosition = this.getMousePosition(event)

    if (newPosition.equals(this.dragPosition)) return

    this.dispatchEvent({
      type: 'drag',
      delta: new Vector2(newPosition.x - this.dragPosition.x, newPosition.y - this.dragPosition.y),
    })

    this.dragPosition = newPosition
  }

  private onDocumentMouseUp = (): void => {
    this.dragPosition = null
  }

  private touchInElement(event: TouchEvent): boolean {
    const target = event.target || event.srcElement

    if (target != this.element) return false

    const rect = this.element.getBoundingClientRect()

    return !(
      event.touches[0].clientX < rect.left ||
      event.touches[0].clientX > rect.right ||
      event.touches[0].clientY < rect.top ||
      event.touches[0].clientY > rect.bottom
    )
  }

  private mouseInElement(event: MouseEvent): boolean {
    const target = event.target || event.srcElement

    if (target != this.element) return false

    const rect = this.element.getBoundingClientRect()

    return !(
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
  }

  private getTouchPosition(event: TouchEvent): Vector2 {
    const rect = this.element.getBoundingClientRect()

    const position = new Vector2(event.touches[0].clientX - rect.left, event.touches[0].clientY - rect.top)

    return position
  }

  private getMousePosition(event: MouseEvent): Vector2 {
    const rect = this.element.getBoundingClientRect()

    const position = new Vector2(event.clientX - rect.left, event.clientY - rect.top)

    return position
  }
}
