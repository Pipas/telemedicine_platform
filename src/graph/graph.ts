import { Scene, Group, Box3, Vector2, Color, PerspectiveCamera, WebGLRenderer } from 'three'
import { XAxis } from './xAxis'
import { YAxis } from './yAxis'
import { VisibleRange } from '../models/visibleRange'
import { ChunkManager } from './chunkManager'
import { GraphControls } from './graphControls'
import { DragHandler } from './dragHandler'

/**
 * Handles logic for each individual graph
 *
 * @export
 * @class Graph
 */
export class Graph {
  // Graph constants
  private static cameraDistance = 10
  private static percentagePadding = 0.1
  private static verticalUpdateSpeed = 0.05

  // Graph IDs
  private static _id = 0
  id: number

  // Graph elements
  scene: Scene
  element: HTMLDivElement
  private camera: PerspectiveCamera
  private controls: GraphControls
  private dragHandler: DragHandler

  // Graph settings
  private autoMoveHorizontalRange = true
  private autoUpdateVerticalRange = true

  // Graph range and zoom
  visibleRange: VisibleRange
  xZoom = 10
  yZoom = 1

  // Rendered objects
  private xAxis: XAxis
  private yAxis: YAxis
  plotLine: Group

  // Data structures
  private chunkManager: ChunkManager
  private pointBuffer: Vector2[]

  constructor(element: HTMLDivElement) {
    this.element = element
    this.id = Graph._id++

    this.initScene()
    this.initCamera()
    this.initMouseDragger()
    this.initPlotLine()

    this.xAxis = new XAxis(this)
    this.yAxis = new YAxis(this)

    this.pointBuffer = []

    this.controls = new GraphControls(this, element)
  }

  /**
   * Renders the graph with renderer
   *
   * @param {WebGLRenderer} renderer
   * @memberof Graph
   */
  render(renderer: WebGLRenderer): void {
    // Gets rendering element bounds
    const rect = this.element.getBoundingClientRect()

    // returns if it's outside of the screen
    if (
      rect.bottom < 0 ||
      rect.top > renderer.domElement.clientHeight ||
      rect.right < 0 ||
      rect.left > renderer.domElement.clientWidth
    )
      return

    const width = rect.right - rect.left
    const height = rect.bottom - rect.top

    if (width / height != this.camera.aspect) this.updateGraphSize()

    const left = rect.left
    const bottom = renderer.domElement.clientHeight - rect.bottom

    // Sets the renderer viewport
    renderer.setViewport(left, bottom, width, height)
    renderer.setScissor(left, bottom, width, height)

    // Renders the graph
    renderer.render(this.scene, this.camera)

    // Empties point buffer for next render
    this.emptyPointBuffer()
  }

  /**
   * Adds points to the graph point buffer
   *
   * @param {Vector2[]} points
   * @memberof Graph
   */
  addPoint(points: Vector2): void {
    this.pointBuffer.push(points)
  }

  /**
   * Sets if the camera should follow the new displaying values
   *
   * @param {boolean} follow
   * @memberof Graph
   */
  setAutoMoveHorizontalRange(follow: boolean): void {
    this.autoMoveHorizontalRange = follow

    this.controls.setFollowLineButtonVisability(!follow)
  }

  /**
   * Sets if the vertical range of the graph is automatically updated with new values
   *
   * @param {boolean} update
   * @memberof Graph
   */
  setAutoUpdateVerticalRange(update: boolean): void {
    this.autoUpdateVerticalRange = update

    this.controls.setUpdateVerticalRangeButtonVisability(!update)
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

  /**
   * Initializes the MouseDragger class that manages user interaction with the graph
   *
   * @private
   * @memberof Graph
   */
  private initMouseDragger(): void {
    this.dragHandler = new DragHandler(this.element)

    this.dragHandler.addEventListener('drag', event => {
      this.setAutoMoveHorizontalRange(false)

      this.moveHorizontalRange(-event.delta.x * (this.visibleRange.getWidth() / this.element.offsetWidth))
    })
  }

  /**
   * Initializes the Camera for the graph and it's related parameters
   *
   * @private
   * @memberof Graph
   */
  private initCamera(): void {
    // Initialize camera object
    const aspectRatio = this.element.offsetWidth / this.element.offsetHeight
    const fieldOfView = 90
    const nearPlane = 1
    const farPlane = 1000
    this.camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)

    // Move camera to position
    this.camera.position.z = Graph.cameraDistance

    // Sets the 0 of the graph to be in the left most visible camera
    this.camera.position.x = Graph.cameraDistance * aspectRatio

    // Initializes the graphs Visible Range
    this.visibleRange = new VisibleRange(
      0,
      (Graph.cameraDistance * aspectRatio * 2) / this.xZoom,
      -Graph.cameraDistance * (1 - Graph.percentagePadding),
      Graph.cameraDistance * (1 - Graph.percentagePadding),
    )
  }

  /**
   * Initializes the graph specific scene
   *
   * @private
   * @memberof Graph
   */
  private initScene(): void {
    this.scene = new Scene()
    this.scene.background = new Color('#fff')
  }

  /**
   * Initializes the Plot Line a group of Objects that scale is applied according to the zoom values
   *
   * @private
   * @memberof Graph
   */
  private initPlotLine(): void {
    // Initiates plotLine, sets the default zoom values and add's it to the scene
    this.plotLine = new Group()
    this.plotLine.scale.x = this.xZoom
    this.plotLine.scale.y = this.yZoom
    this.scene.add(this.plotLine)

    // Initiates the chunkManager that will handle displaying and storing chunks of data
    this.chunkManager = new ChunkManager(this)
  }

  /**
   * Updates the aspect ratio of the camera and adjust scene values accordingly if element has changed size
   *
   * @private
   * @memberof Graph
   */
  private updateGraphSize(): void {
    // Get new aspect ratio
    const newAspect = this.element.offsetWidth / this.element.offsetHeight
    const ratio = newAspect / this.camera.aspect

    // Calculate added delta based on the ratio of widths
    const delta = this.visibleRange.getWidth() * ratio - this.visibleRange.getWidth()
    this.visibleRange.maxX += delta

    // Adjust camera to new aspect and move to place
    this.camera.aspect = newAspect
    this.camera.updateProjectionMatrix()
    this.camera.position.x += (delta / 2) * this.xZoom

    // Updates X axis scale and line size
    this.xAxis.updateScale()
    this.xAxis.updateAxisSize()
  }

  /**
   * Changes the zoom factor of the horizontal scale by a multiplier
   *
   * @private
   * @param {number} multiplier
   * @memberof Graph
   */
  private updateHorizontalZoom(multiplier: number): void {
    // Updates the horizontal zoom
    this.xZoom = this.xZoom * multiplier
    this.plotLine.scale.x = this.xZoom

    // Gets the point which it should zoom around
    const syncPoint = this.getHorizontalZoomSyncPoint()

    // Applies the new zoom to the visible range
    this.visibleRange.maxX = this.visibleRange.maxX / multiplier
    this.visibleRange.minX = this.visibleRange.minX / multiplier

    // Gets the new value for the point to zoom around
    const newSyncPoint = this.getHorizontalZoomSyncPoint()

    // Gets the value it should shift the visible range
    let delta = syncPoint - newSyncPoint

    // Prevents going below the origin
    if (this.visibleRange.minX + delta < 0) delta = 0 - this.visibleRange.minX

    // Sets the new camera position and visible range values
    this.camera.position.x += delta * this.xZoom
    this.visibleRange.maxX += delta
    this.visibleRange.minX += delta

    // Moves the axis accoridingly
    this.xAxis.moveAxis(delta)
    this.yAxis.moveSteps(delta)

    // Updates horizontal scale
    this.xAxis.updateScale()

    // Handles chunk changes
    if (multiplier > 1) this.chunkManager.onZoomIn()
    else this.chunkManager.onZoomOut()
  }

  /**
   * Returns the point where a horizontal zoom is based around
   *
   * @private
   * @returns {number}
   * @memberof Graph
   */
  private getHorizontalZoomSyncPoint(): number {
    // If it's still at the origin zoom around 0
    if (this.visibleRange.minX == 0) return 0
    // If it's following the new displaying values zoom around the last value
    if (this.autoMoveHorizontalRange) return this.visibleRange.maxX
    // If the camera has moved zoom around the middle point of the graph
    else return this.visibleRange.minX + (this.visibleRange.maxX - this.visibleRange.minX) / 2
  }

  /**
   * Changes the zoom factor of the vertical scale by a multiplier
   *
   * @private
   * @param {number} multiplier
   * @memberof Graph
   */
  private updateVerticalZoom(multiplier: number): void {
    // Disables the automatic update of the vertical scale
    this.setAutoUpdateVerticalRange(false)

    // Updates the vertical zoom
    this.yZoom = this.yZoom * multiplier
    this.plotLine.scale.y = this.yZoom

    // Sets the new visible range values
    this.visibleRange.maxY = this.visibleRange.maxY / multiplier
    this.visibleRange.minY = this.visibleRange.minY / multiplier

    // Updates vertical scale
    this.yAxis.updateScale()
  }

  /**
   * Moves the horizontal visible range by mDelta
   *
   * @private
   * @param {number} mDelta
   * @memberof Graph
   */
  private moveHorizontalRange(mDelta: number): void {
    // Prevent moving past the origin
    const delta = this.visibleRange.minX + mDelta < 0 ? 0 - this.visibleRange.minX : mDelta

    // Moves the camera and visible range to delta
    this.camera.position.x += delta * this.xZoom
    this.visibleRange.maxX += delta
    this.visibleRange.minX += delta

    // Moves the horizontal scale accordingly
    this.xAxis.moveScale(delta)

    // Moves axis objects accordingly
    this.xAxis.moveAxis(delta)
    this.yAxis.moveSteps(delta)

    // Handles chunk changes
    this.chunkManager.onMove(delta)
  }

  private jumpToLastPoint(delta: number): void {
    // Moves the camera and visible range to delta
    this.camera.position.x += delta * this.xZoom
    this.visibleRange.maxX += delta
    this.visibleRange.minX += delta

    // Moves the horizontal scale accordingly
    this.xAxis.moveScale(delta)

    // Moves axis objects accordingly
    this.xAxis.moveAxis(delta)
    this.yAxis.moveSteps(delta)

    // Handles chunk changes
    this.chunkManager.onJump()
  }

  /**
   * Updates vertical range to fit the current plot line
   *
   * @private
   * @memberof Graph
   */
  private updateVerticalRange(): void {
    // Gets the outline of the plotline
    const plotLineOutline = new Box3().setFromObject(this.plotLine)

    if (plotLineOutline.min.y == Infinity) return

    // Calculates the highest absolute value
    const highestValue = Math.max(Math.abs(plotLineOutline.min.y / this.yZoom), plotLineOutline.max.y / this.yZoom)

    // If the highest value is different update the range
    if (highestValue != this.visibleRange.maxY) {
      let newValue = highestValue

      // If the change is too abrupt change the value gradually, according to verticalUpdateSpeed
      if (Math.abs(this.visibleRange.maxY - newValue) > this.visibleRange.maxY * Graph.verticalUpdateSpeed) {
        newValue =
          this.visibleRange.maxY - newValue > 0
            ? this.visibleRange.maxY * (1 - Graph.verticalUpdateSpeed)
            : this.visibleRange.maxY * (1 + Graph.verticalUpdateSpeed)
      }

      // Updates vertical zoom and visible range to new value
      this.yZoom = (Graph.cameraDistance * (1 - Graph.percentagePadding)) / newValue
      this.plotLine.scale.y = this.yZoom
      this.visibleRange.minY = -newValue
      this.visibleRange.maxY = newValue

      // Updates vertical scale
      this.yAxis.updateScale()
    }
  }

  /**
   * Empties the graph point buffer by adding them to chunks and triggering assossiated logic
   *
   * @private
   * @memberof Graph
   */
  private emptyPointBuffer(): void {
    // If empty returns
    if (this.pointBuffer.length === 0) return

    // Add points to the chunk manager and empties it
    this.chunkManager.addPoints(this.pointBuffer)

    // Updates vertical range if it should
    if (this.autoUpdateVerticalRange) this.updateVerticalRange()

    // Moves horizontal range if it should
    const delta = this.chunkManager.lastPoint.x - this.visibleRange.maxX
    if (this.autoMoveHorizontalRange && delta > 0) {
      if (this.visibleRange.getWidth() < delta) {
        this.jumpToLastPoint(delta)
      } else {
        this.moveHorizontalRange(delta)
      }
    }
  }
}
