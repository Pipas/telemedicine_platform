import { LineBasicMaterial, Vector3, Line, BufferGeometry, Vector2 } from 'three'
export class GraphLine {
  public static material = new LineBasicMaterial({ color: 0x0000ff })

  static create(startPoint: Vector2, endPoint: Vector2): Line {
    const firstPoint = new Vector3(startPoint.x, startPoint.y, 0)
    const secondPoint = new Vector3(endPoint.x, endPoint.y, 0)
    const geometry = new BufferGeometry().setFromPoints([firstPoint, secondPoint])

    return new Line(geometry, GraphLine.material)
  }
}
