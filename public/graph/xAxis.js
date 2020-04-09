var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Line, Vector3, BufferGeometry } from 'three';
import { AxisStep, StepDirection } from '../models/axisStep';
import { Axis } from './axis';
var XAxis = /** @class */ (function (_super) {
    __extends(XAxis, _super);
    function XAxis(graph) {
        var _this = _super.call(this, graph) || this;
        _this.buildAxis();
        _this.buildSteps();
        return _this;
    }
    XAxis.prototype.moveScale = function (delta) {
        if (this.steps.length == 0) {
            this.rebuildSteps();
            return;
        }
        var firstStep = this.steps[0].value;
        var lastStep = this.steps[this.steps.length - 1].value;
        var padding = XAxis.windowPadding / this.graph.xZoom;
        var newFirstStep = this.getClosestStep(this.graph.visibleRange.minX - padding);
        var newLastStep = this.getClosestStep(this.graph.visibleRange.maxX + padding);
        if (newFirstStep > lastStep || newLastStep < firstStep) {
            this.rebuildSteps();
            return;
        }
        if (delta > 0) {
            for (var i = lastStep + this.stepSize; i < this.graph.visibleRange.maxX + padding; i += this.stepSize) {
                this.steps.push(this.getStep(i));
            }
            for (var j = firstStep; j < this.graph.visibleRange.minX - padding; j += this.stepSize) {
                this.steps.shift().remove();
            }
        }
        if (delta < 0) {
            for (var i = firstStep - this.stepSize; i > this.graph.visibleRange.minX - padding; i -= this.stepSize) {
                if (i == 0)
                    break;
                this.steps.unshift(this.getStep(i));
            }
            for (var j = lastStep; j > this.graph.visibleRange.maxX + padding; j -= this.stepSize) {
                this.steps.pop().remove();
            }
        }
    };
    XAxis.prototype.updateScale = function () {
        if (this.calculateNewStep() || this.steps.length == 0) {
            this.rebuildSteps();
        }
        else {
            var i = this.steps.length;
            while (i--) {
                var step = this.steps[i];
                if (step.value > this.graph.visibleRange.minX && step.value < this.graph.visibleRange.maxX) {
                    step.position();
                }
                else {
                    step.remove();
                    this.steps.splice(i, 1);
                }
            }
            var firstValue = this.steps[0].value;
            var lastValue = this.steps[this.steps.length - 1].value;
            var padding = XAxis.windowPadding / this.graph.xZoom;
            for (var i_1 = lastValue + this.stepSize; i_1 < this.graph.visibleRange.maxX + padding; i_1 += this.stepSize) {
                this.steps.push(this.getStep(i_1));
            }
            for (var i_2 = firstValue - this.stepSize; i_2 > this.graph.visibleRange.minX - padding; i_2 -= this.stepSize) {
                this.steps.unshift(this.getStep(i_2));
            }
        }
    };
    XAxis.prototype.moveAxis = function (delta) {
        this.axis.position.x += delta * this.graph.xZoom;
    };
    XAxis.prototype.updateAxisSize = function () {
        var axisGeometry = this.axis.geometry;
        var positions = axisGeometry.attributes.position;
        positions.setX(1, this.graph.visibleRange.maxX);
        positions.needsUpdate = true;
    };
    XAxis.prototype.calculateNewStep = function () {
        var _this = this;
        var stepWidth = (this.stepSize * this.graph.element.offsetWidth) / (this.graph.visibleRange.maxX - this.graph.visibleRange.minX);
        if (stepWidth < 50) {
            var nextStep = XAxis.stepPossibilities[XAxis.stepPossibilities.findIndex(function (step) { return step == _this.stepSize; }) + 1];
            if (nextStep == undefined)
                return false;
            this.stepSize = nextStep;
            return true;
        }
        else if (stepWidth > 100) {
            var nextStep = XAxis.stepPossibilities[XAxis.stepPossibilities.findIndex(function (step) { return step == _this.stepSize; }) - 1];
            if (nextStep == undefined)
                return false;
            this.stepSize = nextStep;
            return true;
        }
        return false;
    };
    XAxis.prototype.buildAxis = function () {
        var geometry = new BufferGeometry().setFromPoints([
            new Vector3(this.graph.visibleRange.minX, 0, 0),
            new Vector3(this.graph.visibleRange.maxX, 0, 0),
        ]);
        this.axis = new Line(geometry, Axis.material);
        this.axis.scale.x = this.graph.xZoom;
        this.graph.scene.add(this.axis);
    };
    XAxis.prototype.rebuildSteps = function () {
        while (this.steps.length > 0) {
            this.steps.pop().remove();
        }
        this.buildSteps();
    };
    XAxis.prototype.buildSteps = function () {
        for (var i = this.getClosestStep(this.graph.visibleRange.minX); i < this.graph.visibleRange.maxX; i += this.stepSize) {
            this.steps.push(this.getStep(i));
        }
    };
    XAxis.prototype.getStep = function (value) {
        return new AxisStep(this.graph, StepDirection.horizontal, value, true);
    };
    XAxis.prototype.getClosestStep = function (value) {
        var initialStep;
        var roundMin = Math.ceil(value);
        var remaninder = roundMin % this.stepSize;
        if (remaninder == 0)
            initialStep = roundMin;
        else
            initialStep = roundMin + this.stepSize - remaninder;
        return initialStep ? initialStep : this.stepSize;
    };
    XAxis.stepPossibilities = [1, 2, 5, 10, 30, 60];
    XAxis.windowPadding = 2;
    return XAxis;
}(Axis));
export { XAxis };
//# sourceMappingURL=xAxis.js.map