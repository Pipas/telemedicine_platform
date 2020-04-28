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
    if ('ontouchstart' in document.documentElement) {
      console.log('touch yall')
      document.addEventListener('touchstart', this.onDocumentTouchStart, false)
      document.addEventListener('touchmove', this.onDocumentTouchMove, false)
      document.addEventListener('touchend', this.onDocumentTouchEnd, false)
    }

    document.addEventListener('mousedown', this.onDocumentMouseDown, false)
    document.addEventListener('mousemove', this.onDocumentMouseMove, false)
    document.addEventListener('mouseup', this.onDocumentMouseUp, false)
  }

  onDocumentTouchStart = (event: TouchEvent): void => {
    if (!this.touchInElement(event)) return

    event.preventDefault()

    this.mousePosition = this.getTouchPosition(event)
  }

  onDocumentTouchMove = (event: TouchEvent): void => {
    if (this.mousePosition == null) return

    event.preventDefault()

    const newPosition = this.getTouchPosition(event)

    if (newPosition.equals(this.mousePosition)) return

    this.dispatchEvent({
      type: 'drag',
      delta: new Vector2(newPosition.x - this.mousePosition.x, newPosition.y - this.mousePosition.y),
    })

    this.mousePosition = newPosition
  }

  onDocumentTouchEnd = (): void => {
    this.mousePosition = null
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
