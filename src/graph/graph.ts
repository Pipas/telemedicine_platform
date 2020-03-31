import { Scene, Camera, Group, Box3, Vector2 } from 'three'
import { XAxis } from './xAxis'
import { YAxis } from './yAxis'
import { VisibleRange } from '../models/visibleRange'
import { ChunkManager } from './chunkManager'
import { GraphControls } from '../graphControls'

export class Graph {
  private cameraDistance = 10
  private percentagePadding = 0.1
  private verticalUpdateSpeed = 0.05

  public scene: Scene
  camera: Camera

  cameraFollow = true
  autoUpdateVerticalRange = true
  aspectRatio: number

  private controls: GraphControls

  visibleRange: VisibleRange
  xZoom: number
  yZoom: number
  xAxis: XAxis
  yAxis: YAxis

  windowWidth: number

  plotLine: Group

  chunkManager: ChunkManager

  pointBuffer: Vector2[]

  constructor(scene: Scene, camera: Camera, canvas: HTMLCanvasElement) {
    this.scene = scene
    this.camera = camera
    this.aspectRatio = canvas.offsetWidth / canvas.offsetHeight

    this.xZoom = 10
    this.yZoom = 1

    this.pointBuffer = []

    this.setupCamera()
    this.setupPlotLine()

    this.controls = new GraphControls(this, canvas)
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

  setCameraFollow(follow: boolean): void {
    this.cameraFollow = follow

    this.controls.setFollowLineButtonVisability(!follow)
  }

  setAutoUpdateVerticalRange(update: boolean): void {
    this.autoUpdateVerticalRange = update

    this.controls.setUpdateVerticalRangeButtonVisability(!update)
  }

  dragCamera(delta: number): void {
    this.setCameraFollow(false)

    this.moveCamera(delta)
  }

  increaseHorizontalZoom(): void {
    this.updateHorizontalZoom(1.2)
  }

  decreaseHorizontalZoom(): void {
    this.updateHorizontalZoom(1 / 1.2)
  }

  increaseVerticalZoom(): void {
    this.updateVerticalZoom(1.2)
  }

  decreaseVerticalZoom(): void {
    this.updateVerticalZoom(1 / 1.2)
  }

  private getSyncPoint(): number {
    if (this.visibleRange.minX == 0) return 0
    if (this.cameraFollow) return this.visibleRange.maxX
    else return this.visibleRange.minX + (this.visibleRange.maxX - this.visibleRange.minX) / 2
  }

  private updateHorizontalZoom(multiplier: number): void {
    this.xZoom = this.xZoom * multiplier

    this.plotLine.scale.x = this.xZoom

    const syncPoint = this.getSyncPoint()

    this.visibleRange.maxX = this.visibleRange.maxX / multiplier
    this.visibleRange.minX = this.visibleRange.minX / multiplier

    const newSyncPoint = this.getSyncPoint()
    let delta = syncPoint - newSyncPoint

    if (this.visibleRange.minX + delta < 0) {
      delta = 0 - this.visibleRange.minX
    }

    this.camera.position.x += delta * this.xZoom
    this.visibleRange.maxX += delta
    this.visibleRange.minX += delta

    this.xAxis.moveAxis(delta * this.xZoom)
    this.yAxis.moveSteps(delta * this.xZoom)

    this.xAxis.onZoom()

    if (multiplier > 1) this.chunkManager.onZoomIn()
    else this.chunkManager.onZoomOut()
  }

  private updateVerticalZoom(multiplier: number): void {
    this.setAutoUpdateVerticalRange(false)

    this.yZoom = this.yZoom * multiplier

    this.plotLine.scale.y = this.yZoom

    this.visibleRange.maxY = this.visibleRange.maxY / multiplier
    this.visibleRange.minY = this.visibleRange.minY / multiplier

    this.yAxis.rebuildSteps()
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

    const highestValue = Math.max(Math.abs(plotLineOutline.min.y / this.yZoom), plotLineOutline.max.y / this.yZoom)

    if (highestValue != this.visibleRange.maxY) {
      this.updateVerticalRange(highestValue)
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

    this.xAxis.onMove(delta)
    this.xAxis.moveAxis(delta)
    this.yAxis.moveSteps(delta)

    this.chunkManager.checkChunkChange(delta)
  }

  private updateVerticalRange(value: number): void {
    if (!this.autoUpdateVerticalRange) return

    let newValue = Math.abs(value)

    if (Math.abs(this.visibleRange.maxY - newValue) > this.visibleRange.maxY * this.verticalUpdateSpeed) {
      newValue =
        this.visibleRange.maxY - newValue > 0
          ? this.visibleRange.maxY * (1 - this.verticalUpdateSpeed)
          : this.visibleRange.maxY * (1 + this.verticalUpdateSpeed)
    }

    this.yZoom = (this.cameraDistance * (1 - this.percentagePadding)) / newValue
    this.visibleRange.minY = -newValue
    this.visibleRange.maxY = newValue

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
