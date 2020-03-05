import { LineBasicMaterial, Vector3, Line, BufferGeometry, Sprite, Texture, SpriteMaterial, LinearFilter } from 'three'
import { Graph } from '../graph/graph'

export enum StepDirection {
  vertical,
  horizontal
}

export class AxisStep {
  public static material = new LineBasicMaterial({ color: 0x000000 })
  private static fontSize = 15

  private graph: Graph
  private direction: StepDirection

  public value: number
  public object: Line
  public text: Sprite

  constructor(graph: Graph, direction: StepDirection, value: number ) {
    this.graph = graph
    this.direction = direction
    this.value = value

    this.draw()
  }

  isVisible(): boolean {
    return this.direction == StepDirection.horizontal ? this.graph.visibleRange.containsX(this.value) : this.graph.visibleRange.containsY(this.value)
  }

  draw(): void {
    this.drawLine()
    this.drawNumber()
  }

  private drawLine(): void {
    let firstPoint: Vector3
    let secondPoint: Vector3

    if(this.direction === StepDirection.horizontal) {
      firstPoint = new Vector3(this.value * this.graph.xZoom, 0, 0)
      secondPoint = new Vector3(this.value * this.graph.xZoom, -0.5, 0)
    } else {
      firstPoint = new Vector3(0, this.value * this.graph.yZoom, 0)
      secondPoint = new Vector3(0.5, this.value * this.graph.yZoom, 0)
    }

    const geometry = new BufferGeometry().setFromPoints([firstPoint, secondPoint])

    this.object = new Line(geometry, AxisStep.material)

    this.graph.scene.add(this.object)
  }

  private drawNumber(): void {
    const canvas = document.createElement('canvas')
    const canvasContext = canvas.getContext('2d')
    canvasContext.font = `${AxisStep.fontSize}px Arial`
    canvasContext.fillStyle = 'black'

    // Read canvas size with correct font
    canvas.width = canvasContext.measureText(this.value.toString()).width
    canvas.height = AxisStep.fontSize

    // Set font again because it's reset from reading
    canvasContext.font = `${AxisStep.fontSize}px Arial`

    canvasContext.fillText(this.value.toString(), 0, AxisStep.fontSize)

    // canvas contents will be used for a texture
    const texture = new Texture(canvas) 
    texture.minFilter = LinearFilter

    texture.needsUpdate = true

    this.text = new Sprite( new SpriteMaterial( { map: texture }))

    
    if(this.direction === StepDirection.horizontal) {
      this.text.position.x = this.value * this.graph.xZoom //+ 0.15
      this.text.position.y = -1.4
    } else {
      this.text.position.x = 0.8
      this.text.position.y = this.value * this.graph.yZoom
    }
    
    this.text.scale.set((canvas.width / canvas.height), 1, 1)
    this.graph.scene.add(this.text)
  }

  remove(): void {
    this.graph.scene.remove(this.object)
    this.graph.scene.remove(this.text)
  }

  redraw(): void {
    this.remove()
    this.draw()
  }
}