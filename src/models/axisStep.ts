import {
  LineBasicMaterial,
  Vector3,
  Line,
  BufferGeometry,
  Sprite,
  Texture,
  SpriteMaterial,
  LinearFilter,
  Group,
} from 'three'
import { Graph } from '../graph/graph'

export enum StepDirection {
  vertical,
  horizontal,
}

export class AxisStep {
  public static material = new LineBasicMaterial({ color: 0x000000 })
  private static digits: Map<string, Sprite>
  private static digitWidth: number
  private static fontSize = 15

  private graph: Graph
  private direction: StepDirection

  public value: number
  public group: Group

  constructor(graph: Graph, direction: StepDirection, value: number) {
    this.graph = graph
    this.direction = direction
    this.value = value

    this.group = new Group()

    this.initDigits()
    this.draw()
  }

  isVisible(): boolean {
    return this.direction == StepDirection.horizontal
      ? this.graph.visibleRange.containsX(this.value)
      : this.graph.visibleRange.containsY(this.value)
  }

  draw(): void {
    this.drawLine()
    this.drawNumber()

    this.position()
    this.graph.scene.add(this.group)
  }

  private drawLine(): void {
    let firstPoint: Vector3
    let secondPoint: Vector3

    if (this.direction === StepDirection.horizontal) {
      firstPoint = new Vector3(0, 0, 0)
      secondPoint = new Vector3(0, -0.5, 0)
    } else {
      firstPoint = new Vector3(0, 0, 0)
      secondPoint = new Vector3(0.5, 0, 0)
    }

    const geometry = new BufferGeometry().setFromPoints([firstPoint, secondPoint])

    const line = new Line(geometry, AxisStep.material)

    this.group.add(line)
  }

  private initDigits(): void {
    if (AxisStep.digits == null) {
      const digits = '-0123456789'

      const canvas = document.createElement('canvas') as HTMLCanvasElement
      const canvasContext = canvas.getContext('2d')
      canvasContext.font = `${AxisStep.fontSize}px 'monospace'`
      canvasContext.fillStyle = 'black'

      // Read canvas size with correct font
      canvas.width = canvasContext.measureText(digits).width
      canvas.height = AxisStep.fontSize

      // Set font again because it's reset from reading
      canvasContext.font = `${AxisStep.fontSize}px 'monospace'`

      canvasContext.fillText(digits, 0, AxisStep.fontSize)

      // canvas contents will be used for a texture
      AxisStep.digits = new Map<string, Sprite>()
      AxisStep.digitWidth = canvas.width / digits.length / AxisStep.fontSize

      for (let i = 0; i < digits.length; i++) {
        const texture = new Texture(canvas)
        texture.minFilter = LinearFilter

        texture.needsUpdate = true

        texture.repeat.x = 1 / digits.length

        texture.offset.x = (i * (canvas.width / digits.length)) / canvas.width

        const sprite = new Sprite(new SpriteMaterial({ map: texture }))
        sprite.scale.set(AxisStep.digitWidth, 1, 1)

        AxisStep.digits.set(digits.split('')[i], sprite)
      }
    }
  }

  private drawNumber(): void {
    const valueDigits = this.value.toString().split('')

    valueDigits.forEach((digit, i) => {
      const spriteDigit = AxisStep.digits.get(digit).clone()
      if (this.direction === StepDirection.horizontal) {
        spriteDigit.position.x = -((AxisStep.digitWidth * (valueDigits.length - 1)) / 2) + AxisStep.digitWidth * i
        spriteDigit.position.y = -1.4
      } else {
        spriteDigit.position.x = 1 + (AxisStep.digitWidth * (valueDigits.length - 1)) / 2 + AxisStep.digitWidth * i
        spriteDigit.position.y = 0
      }

      this.group.add(spriteDigit)
    })
  }

  position(): void {
    if (this.direction == StepDirection.horizontal) {
      this.group.position.x = this.value * this.graph.xZoom
      this.group.position.y = 0
    } else {
      this.group.position.x = this.graph.visibleRange.minX * this.graph.xZoom
      this.group.position.y = this.value * this.graph.yZoom
    }
  }

  remove(): void {
    this.graph.scene.remove(this.group)
  }

  redraw(): void {
    this.remove()
    this.draw()
  }
}
