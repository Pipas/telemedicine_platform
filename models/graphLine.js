import { LineBasicMaterial, Vector3, Line, BufferGeometry, LineSegments, BufferAttribute } from 'three';
var GraphLine = /** @class */ (function () {
    function GraphLine() {
    }
    GraphLine.create = function (startPoint, endPoint) {
        var firstPoint = new Vector3(startPoint.x, startPoint.y, 0);
        var secondPoint = new Vector3(endPoint.x, endPoint.y, 0);
        var geometry = new BufferGeometry().setFromPoints([firstPoint, secondPoint]);
        return new Line(geometry, GraphLine.material);
    };
    GraphLine.createLineSegment = function () {
        var geometry = new BufferGeometry();
        var positions = new Float32Array(500 * 3);
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        geometry.setDrawRange(0, 0);
        return new LineSegments(geometry, GraphLine.material);
    };
    GraphLine.material = new LineBasicMaterial({ color: 0x0000ff });
    return GraphLine;
}());
export { GraphLine };
//# sourceMappingURL=graphLine.js.map