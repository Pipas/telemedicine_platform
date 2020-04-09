import { WebGLRenderer } from 'three';
import { Graph } from './graph/graph';
var GraphManager = /** @class */ (function () {
    function GraphManager() {
        this.canvas = document.getElementById('webGL-canvas');
        this.buildRender();
        this.initGraphs();
    }
    GraphManager.prototype.initGraphs = function () {
        var _this = this;
        this.graphs = [];
        document.querySelectorAll('.graph').forEach(function (element) {
            _this.graphs.push(new Graph(element));
        });
    };
    GraphManager.prototype.addGraph = function () {
        if (this.graphs.length == 8)
            return;
        var graphs = document.querySelector('.graphs');
        var newGraph = document.createElement('div');
        newGraph.setAttribute('class', 'graph');
        graphs.appendChild(newGraph);
        this.graphs.push(new Graph(newGraph));
    };
    GraphManager.prototype.deleteGraph = function () {
        if (this.graphs.length == 1)
            return;
        var lastGraph = this.graphs.pop();
        lastGraph.element.remove();
    };
    GraphManager.prototype.buildRender = function () {
        this.renderer = new WebGLRenderer({ canvas: this.canvas });
        var DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.setPixelRatio(DPR);
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight, false);
    };
    GraphManager.prototype.addPoints = function (points) {
        this.graphs.forEach(function (graph, index) {
            graph.addPoint(points[index]);
        });
    };
    GraphManager.prototype.canvasHasUpdated = function () {
        var width = this.canvas.clientWidth;
        var height = this.canvas.clientHeight;
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.renderer.setSize(width, height, false);
        }
    };
    GraphManager.prototype.update = function () {
        var _this = this;
        this.canvasHasUpdated();
        this.canvas.style.transform = "translateY(" + window.scrollY + "px)";
        this.renderer.setScissorTest(false);
        this.renderer.clear();
        this.renderer.setScissorTest(true);
        this.graphs.forEach(function (graph) {
            graph.render(_this.renderer);
        });
    };
    return GraphManager;
}());
export { GraphManager };
//# sourceMappingURL=graphManager.js.map