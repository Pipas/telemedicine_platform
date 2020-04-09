import { LineBasicMaterial } from 'three';
var Axis = /** @class */ (function () {
    function Axis(graph) {
        // Step size to draw indicator
        this.stepSize = 1;
        this.graph = graph;
        this.steps = [];
    }
    // Axis line material
    Axis.material = new LineBasicMaterial({ color: 0x000000 });
    return Axis;
}());
export { Axis };
//# sourceMappingURL=axis.js.map