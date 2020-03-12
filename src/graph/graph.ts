import { Line, Vector3, BufferGeometry, Scene, Camera, Group } from 'three'
import { XAxis } from './xAxis'
import { YAxis } from './yAxis'
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
  xAxis: XAxis
  yAxis: YAxis
  lastPoint: Point

  plotLine: Group

  pointBuffer: Point[]


  constructor(scene: Scene, camera: Camera, aspectRatio: number) {
    this.scene = scene
    this.camera = camera
    this.aspectRatio = aspectRatio

    this.xZoom = 10
    this.yZoom = 1

    this.lastPoint = new Point(0,0)

    this.pointBuffer = []

    this.setupCamera()
    this.setupPlotLine()
  }

  init(): void {
    this.setupCamera()

    this.xAxis = new XAxis(this)
    this.yAxis = new YAxis(this)
  }

  private setupPlotLine(): void {
    this.plotLine = new Group()
    this.plotLine.scale.x = this.xZoom
    this.plotLine.scale.y = this.yZoom
    this.scene.add(this.plotLine)
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
  }

  private checkUpdateVisibleRange(point: Point): void {
    if (point.x > this.visibleRange.maxX) {
      const delta = point.x - this.visibleRange.maxX
      this.moveCamera(Directions.RIGHT, delta)
      this.xAxis.rebuildSteps()
      this.yAxis.moveSteps(delta)
    }
    if (point.y > this.visibleRange.maxY || point.y < this.visibleRange.minY) {
      this.updateVerticalScale(point.y)
      this.yAxis.rebuildSteps()
    }
  }

  private updateVerticalScale(newValue: number): void {
    this.yZoom = this.cameraDistance * (1 - this.percentagePadding) / Math.abs(newValue)
    this.visibleRange.minY = -Math.abs(newValue)
    this.visibleRange.maxY = Math.abs(newValue)

    this.plotLine.scale.y = this.yZoom
  }

  toggleCameraFollow(): void {
    this.cameraFollow = !this.cameraFollow
  }

  addPoint(point: Point): void {
    this.pointBuffer.push(point)
  }

  update(): void {
    if(this.pointBuffer.length === 0) return

    this.pointBuffer.forEach(point => {
      const line = GraphLine.create(this.lastPoint, point)
      this.lastPoint = point
      this.plotLine.add(line)
    })

    this.pointBuffer = []


    for (let i = 0; this.plotLine.children.length > 2000; i++) {
      this.plotLine.remove(this.plotLine.children[i])
    }



    this.checkUpdateVisibleRange(this.lastPoint)
  }
}
