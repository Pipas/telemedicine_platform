import { Scene, Color, WebGLRenderer, PerspectiveCamera, Vector2 } from 'three'
import { Graph } from './graph/graph'
import { MouseDragger } from './mouseDragger'
import { GraphControls } from './graphControls'

type ScreenDimentions = { width: number; height: number }

export class GraphManager {
  private canvas: HTMLCanvasElement

  private scene: Scene
  private renderer: WebGLRenderer
  private camera: PerspectiveCamera
  private graph: Graph

  private mouseDragger: MouseDragger
  private controls: GraphControls

  private screenDimensions: ScreenDimentions

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    this.screenDimensions = {
      width: canvas.offsetWidth,
      height: canvas.offsetHeight,
    }

    this.buildScene()
    this.buildRender()
    this.buildCamera()

    this.graph = new Graph(this.scene, this.camera, this.screenDimensions.width / this.screenDimensions.height)
    this.controls = new GraphControls(this.graph, this.canvas)

    this.initMouseDragger()
  }

  private initMouseDragger(): void {
    this.mouseDragger = new MouseDragger(this.canvas)

    this.mouseDragger.addEventListener('drag', event => {
      this.graph.dragCamera(-event.delta.x * (this.graph.windowWidth / this.canvas.offsetWidth))
    })
  }

  private buildScene(): void {
    this.scene = new Scene()
    this.scene.background = new Color('#fff')
  }

  private buildRender(): void {
    this.renderer = new WebGLRenderer({ canvas: this.canvas })
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1
    this.renderer.setPixelRatio(DPR)
    this.renderer.setSize(this.screenDimensions.width, this.screenDimensions.height)
  }

  private buildCamera(): void {
    const aspectRatio = this.screenDimensions.width / this.screenDimensions.height
    const fieldOfView = 90
    const nearPlane = 1
    const farPlane = 1000
    this.camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
  }

  addPoint(point: Vector2): void {
    this.graph.addPoint(point)
  }

  initGraph(): void {
    this.graph.init()
  }

  followLiveValue(): void {
    this.graph.setCameraToLiveValue()
  }

  update(): void {
    this.renderer.render(this.scene, this.camera)
    this.graph.update()
  }

  onWindowResize(): void {
    // const { offsetWidth, offsetHeight } = canvas
    // screenDimensions.width = offsetWidth
    // screenDimensions.height = offsetHeight
    // camera.aspect = offsetWidth / offsetHeight
    // camera.updateProjectionMatrix()
    // renderer.setSize(offsetWidth, offsetHeight)
  }
}
