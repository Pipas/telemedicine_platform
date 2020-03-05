import { Line, Vector3, BufferGeometry, Scene, Camera } from 'three'
import { Axis } from './axis'
import { Directions } from '../utils/directions'
import { Point } from '../models/point'
import { VisibleRange } from '../models/visibleRange'
import { GraphLine } from '../models/graphLine'

export class Graph {

  private cameraDistance = 10
  private percentagePadding = 0.1

  public scene: Scene
  camera: Camera

  cameraFollow = true
  aspectRatio: number

  visibleRange: VisibleRange
  xZoom: number
  yZoom: number
  axis: Axis
  lastPoint: Point
  initTime: number

  lines: GraphLine[]


  constructor(scene: Scene, camera: Camera, aspectRatio: number) {
    this.scene = scene
    this.camera = camera
    this.aspectRatio = aspectRatio

    this.xZoom = 10
    this.yZoom = 1

    this.lastPoint = new Point(0,0)

    this.lines = []

    this.setupCamera()
  }

  init(): void {
    this.initTime = (new Date()).getTime()

    this.setupCamera()

    this.axis = new Axis(this)
  }

  private setupCamera(): void {
    this.camera.position.z = this.cameraDistance

    // 0 of the graph to be in the start of the camera
    this.camera.position.x = this.cameraDistance * this.aspectRatio

    this.visibleRange = new VisibleRange(
      0,
      this.cameraDistance * this.aspectRatio * 2 / this.xZoom,
      -this.cameraDistance * (1 - this.percentagePadding),
      this.cameraDistance * (1 - this.percentagePadding)
    )
  }

  private moveCamera(direction: Directions, delta: number): void {
    if (direction === Directions.LEFT) {
      this.camera.position.x -= delta * this.xZoom
      this.visibleRange.maxX -= delta
      this.visibleRange.minX -= delta
    } else {
      this.camera.position.x += delta * this.xZoom
      this.visibleRange.maxX += delta
      this.visibleRange.minX += delta
    }

    this.axis.update()
  }

  private checkUpdateVisibleRange(point: Point): void {
    if (point.x > this.visibleRange.maxX) {
      this.moveCamera(Directions.RIGHT, point.x - this.visibleRange.maxX)
    }
    if (point.y > this.visibleRange.maxY || point.y < this.visibleRange.minY) {
      this.updateVerticalScale(point.y)
    }
  }

  private updateVerticalScale(newValue: number): void {
    this.yZoom = this.cameraDistance * (1 - this.percentagePadding) / Math.abs(newValue)
    this.visibleRange.minY = -newValue
    this.visibleRange.maxY = newValue

    this.redrawVisibleLines()
  }

  private redrawVisibleLines(): void {
    for (let i = 1; i < this.lines.length; i++) {
      const line = this.lines[i]
      if(line.isVisible())
        line.redraw()
      else
        line.remove()
    }
  }

  toggleCameraFollow(): void {
    this.cameraFollow = !this.cameraFollow
  }

  addPoint(value: number): void {
    const currentTime = (new Date()).getTime()

    const newPoint = new Point((currentTime - this.initTime) / 1000, value)

    this.lines.push(new GraphLine(this, this.lastPoint, newPoint))

    this.lastPoint = newPoint

    if (this.lines.length > 2500) {
      this.lines.shift().remove()
    }

    this.checkUpdateVisibleRange(newPoint)
  }
}
