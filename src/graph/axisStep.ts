import {
  LineBasicMaterial,
  Vector3,
  Line,
  BufferGeometry,
  Sprite,
  SpriteMaterial,
  LinearFilter,
  Group,
  TextureLoader,
} from 'three'
import { Graph } from './graph'

export enum StepDirection {
  vertical,
  horizontal,
}

/**
 * Represents a labeled step in an axis and hadles it's related logic
 *
 * @export
 * @class AxisStep
 */
export class AxisStep {
  public static material = new LineBasicMaterial({ color: 0x000000 })
  private static digits: Map<string, Sprite>
  private static digitWidth: number
  private static digitScale: number

  private graph: Graph
  private direction: StepDirection
  private isTime: boolean

  public value: number
  public group: Group

  constructor(graph: Graph, direction: StepDirection, value: number, isTime: boolean) {
    this.graph = graph
    this.direction = direction
    this.value = value
    this.isTime = isTime

    this.group = new Group()

    this.initDigits()
    this.draw()
  }

  /**
   * Returns if the step is visible in the graph
   *
   * @returns {boolean}
   * @memberof AxisStep
   */
  isVisible(): boolean {
    return this.direction == StepDirection.horizontal
      ? this.graph.visibleRange.containsX(this.value)
      : this.graph.visibleRange.containsY(this.value)
  }

  /**
   * Positions the step using the graphs zoom values
   *
   * @memberof AxisStep
   */
  position(): void {
    if (this.direction == StepDirection.horizontal) {
      this.group.position.x = this.value * this.graph.xZoom
      this.group.position.y = 0
    } else {
      this.group.position.x = this.graph.visibleRange.minX * this.graph.xZoom
      this.group.position.y = this.value * this.graph.yZoom
    }
  }

  /**
   * Removes the step from the graph scene
   *
   * @memberof AxisStep
   */
  remove(): void {
    this.graph.scene.remove(this.group)
  }

  /**
   * Initializes the digits sprite map
   *
   * @private
   * @memberof AxisStep
   */
  private initDigits(): void {
    if (AxisStep.digits == null) {
      const digits = '0123456789-:,.'

      AxisStep.digits = new Map<string, Sprite>()
      AxisStep.digitWidth = 11 / 16 // From the sprite sizes
      AxisStep.digitScale = 1 //256 / this.graph.element.offsetHeight < only works if graph is showing at the start

      for (let i = 0; i < digits.length; i++) {
        const texture = new TextureLoader().load('images/digits.png')
        texture.minFilter = LinearFilter

        texture.repeat.x = 1 / digits.length

        texture.offset.x = (i * (154 / digits.length)) / 154

        const sprite = new Sprite(new SpriteMaterial({ map: texture }))
        sprite.scale.set(AxisStep.digitWidth * AxisStep.digitScale, AxisStep.digitScale, 1)

        AxisStep.digits.set(digits.split('')[i], sprite)
      }
    }
  }

  /**
   * Creates a step and adds it to the graph scene to be rendered
   *
   * @private
   * @memberof AxisStep
   */
  private draw(): void {
    this.drawLine()
    this.drawNumber()
    this.position()

    this.graph.scene.add(this.group)
  }

  /**
   * Creates the line segment portion of the step
   *
   * @private
   * @memberof AxisStep
   */
  private drawLine(): void {
    let firstPoint: Vector3
    let secondPoint: Vector3

    if (this.direction === StepDirection.horizontal) {
      firstPoint = new Vector3(0, 0, 0)
      secondPoint = new Vector3(0, -0.5 * AxisStep.digitScale, 0)
    } else {
      firstPoint = new Vector3(0, 0, 0)
      secondPoint = new Vector3(0.5 * AxisStep.digitScale, 0, 0)
    }

    const geometry = new BufferGeometry().setFromPoints([firstPoint, secondPoint])

    const line = new Line(geometry, AxisStep.material)

    this.group.add(line)
  }

  /**
   * Creates the number segment of the step
   *
   * @private
   * @memberof AxisStep
   */
  private drawNumber(): void {
    const valueDigits = this.isTime ? this.getValueAsTime().split('') : this.value.toString().split('')

    valueDigits.forEach((digit, i) => {
      const spriteDigit = AxisStep.digits.get(digit).clone()
      if (this.direction === StepDirection.horizontal) {
        spriteDigit.position.x =
          (-((AxisStep.digitWidth * (valueDigits.length - 1)) / 2) + AxisStep.digitWidth * i) * AxisStep.digitScale
        spriteDigit.position.y = -1.4 * AxisStep.digitScale
      } else {
        spriteDigit.position.x =
          AxisStep.digitScale +
          ((AxisStep.digitWidth * (valueDigits.length - 1)) / 2) * AxisStep.digitScale +
          AxisStep.digitWidth * i * AxisStep.digitScale
        spriteDigit.position.y = 0
      }

      this.group.add(spriteDigit)
    })
  }

  /**
   * Returns a string with the formatted time from a value of seconds
   *
   * @private
   * @returns {string}
   * @memberof AxisStep
   */
  private getValueAsTime(): string {
    const seconds = this.value < 60 ? this.value : this.value % 60
    const minutes = this.value < 60 ? 0 : (this.value - seconds) / 60

    return minutes.toString() + ':' + ('0' + seconds).slice(-2)
  }
}
