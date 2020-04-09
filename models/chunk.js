import { LineSegments, BufferGeometry, BufferAttribute, LineBasicMaterial, ObjectLoader } from 'three';
import { GraphLine } from './graphLine';
var Chunk = /** @class */ (function () {
    function Chunk(id, encoded) {
        if (encoded === void 0) { encoded = null; }
        if (encoded != null) {
            this.fromBase64(encoded);
        }
        else {
            this.id = id;
            this.line = this.createLineSegment();
        }
    }
    Chunk.prototype.createLineSegment = function () {
        var geometry = new BufferGeometry();
        var positions = new Float32Array(Chunk.maxPoints * 2 * 3);
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        geometry.setDrawRange(0, 0);
        return new LineSegments(geometry, GraphLine.material);
    };
    Chunk.prototype.createLineFromPoints = function (points) {
        var geometry = new BufferGeometry();
        var positions = new Float32Array(Chunk.maxPoints * 2 * 3);
        var i = 0;
        for (; i < points.length - 2; i += 2) {
            positions.set([points[i], points[i + 1], 0, points[i + 2], points[i + 3], 0], i * 3);
        }
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        geometry.setDrawRange(0, Chunk.maxPoints * 3 * 2);
        geometry.computeBoundingSphere();
        geometry.computeBoundingBox();
        return new LineSegments(geometry, GraphLine.material);
    };
    Chunk.prototype.add = function (startPoint, endPoint) {
        var geometry = this.line.geometry;
        var range = geometry.drawRange.count;
        var positions = geometry.attributes.position;
        positions.set([startPoint.x, startPoint.y, 0, endPoint.x, endPoint.y, 0], range);
        positions.needsUpdate = true;
        geometry.setDrawRange(0, range + 6);
        geometry.computeBoundingSphere();
        geometry.computeBoundingBox();
    };
    Chunk.prototype.getFirstValue = function () {
        return this.line.geometry.attributes.position.array[0];
    };
    Chunk.prototype.getLastValue = function () {
        var geometry = this.line.geometry;
        return geometry.attributes.position.array[geometry.drawRange.count - 3];
    };
    Chunk.prototype.isFull = function () {
        var range = this.line.geometry.drawRange.count;
        return range / 6 == Chunk.maxPoints;
    };
    Chunk.prototype.toBase64 = function () {
        var geometry = this.line.geometry;
        var positions = geometry.attributes.position;
        var points = [];
        for (var i = 0; i < positions.array.length; i += 6) {
            points.push(positions.array[i]);
            points.push(positions.array[i + 1]);
        }
        points.push(positions.array[positions.array.length - 3]);
        points.push(positions.array[positions.array.length - 2]);
        return window.btoa(JSON.stringify({
            id: this.id,
            // firstValue: this.firstValue,
            // lastValue: this.lastValue,
            points: points,
        }));
    };
    Chunk.prototype.fromBase64 = function (encoded) {
        var unencoded = JSON.parse(window.atob(encoded));
        this.id = unencoded.id;
        // this.firstValue = unencoded.firstValue
        // this.lastValue = unencoded.lastValue
        this.line = this.createLineFromPoints(unencoded.points);
    };
    Chunk.loader = new ObjectLoader();
    Chunk.material = new LineBasicMaterial({ color: 0x0000ff });
    Chunk.maxPoints = 500;
    return Chunk;
}());
export { Chunk };
//# sourceMappingURL=chunk.js.map