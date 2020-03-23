import { Scene, Camera, Group, Box3, Vector2 } from 'three'
import { XAxis } from './xAxis'
import { YAxis } from './yAxis'
import { VisibleRange } from '../models/visibleRange'
import { ChunkManager } from './chunkManager'

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

  windowWidth: number

  plotLine: Group

  chunkManager: ChunkManager

  pointBuffer: Vector2[]

  constructor(scene: Scene, camera: Camera, aspectRatio: number) {
    this.scene = scene
    this.camera = camera
    this.aspectRatio = aspectRatio

    this.xZoom = 10
    this.yZoom = 1

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

    this.chunkManager = new ChunkManager(this, this.windowWidth)
  }

  private setupCamera(): void {
    this.camera.position.z = this.cameraDistance

    // 0 of the graph to be in the start of the camera
    this.camera.position.x = this.cameraDistance * this.aspectRatio
    this.windowWidth = this.cameraDistance * this.aspectRatio * 2

    this.visibleRange = new VisibleRange(
      0,
      (this.cameraDistance * this.aspectRatio * 2) / this.xZoom,
      -this.cameraDistance * (1 - this.percentagePadding),
      this.cameraDistance * (1 - this.percentagePadding),
    )
  }

  setCameraToLiveValue(): void {
    this.cameraFollow = true
  }

  dragCamera(delta: number): void {
    this.cameraFollow = false

    this.moveCamera(delta)
  }

  private moveCamera(delta: number): void {
    const updatedDelta =
      this.camera.position.x + delta < this.cameraDistance * this.aspectRatio
        ? this.cameraDistance * this.aspectRatio - this.camera.position.x
        : delta

    this.updateHorizontalRange(updatedDelta)
  }

  private checkUpdateVerticalRange(): void {
    const plotLineOutline = new Box3().setFromObject(this.plotLine)

    if (
      plotLineOutline.max.y / this.yZoom > this.visibleRange.maxY ||
      plotLineOutline.min.y / this.yZoom < this.visibleRange.minY
    ) {
      this.updateVerticalRange(
        Math.max(Math.abs(plotLineOutline.min.y / this.yZoom), plotLineOutline.max.y / this.yZoom),
      )
    }
  }

  private moveCameraToLine(): void {
    this.checkUpdateVerticalRange()

    if (this.chunkManager.lastPoint.x > this.visibleRange.maxX) {
      const delta = this.chunkManager.lastPoint.x - this.visibleRange.maxX
      this.moveCamera(delta)
    }
  }

  private updateHorizontalRange(delta: number): void {
    this.camera.position.x += delta

    this.visibleRange.maxX += delta / this.xZoom
    this.visibleRange.minX += delta / this.xZoom

    this.xAxis.updateSteps()
    this.xAxis.moveAxis(delta)
    this.yAxis.moveSteps(delta)

    this.chunkManager.checkChunkChange(delta)
  }

  private updateVerticalRange(newValue: number): void {
    this.yZoom = (this.cameraDistance * (1 - this.percentagePadding)) / Math.abs(newValue)
    this.visibleRange.minY = -Math.abs(newValue)
    this.visibleRange.maxY = Math.abs(newValue)

    this.plotLine.scale.y = this.yZoom

    this.yAxis.rebuildSteps()
  }

  toggleCameraFollow(): void {
    this.cameraFollow = !this.cameraFollow
  }

  addPoint(point: Vector2): void {
    this.pointBuffer.push(point)
  }

  update(): void {
    if (this.pointBuffer.length === 0) return

    this.pointBuffer.forEach(point => {
      this.chunkManager.addNewPoint(point)
    })

    this.pointBuffer = []

    if (this.cameraFollow) this.moveCameraToLine()
  }
}
