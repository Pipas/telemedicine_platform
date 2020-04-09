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
import { AxisStep, StepDirection } from '../models/axisStep';
import { Axis } from './axis';
var YAxis = /** @class */ (function (_super) {
    __extends(YAxis, _super);
    function YAxis(graph) {
        var _this = _super.call(this, graph) || this;
        _this.stepMultipliers = [1, 2.5, 5];
        _this.calculateNewStep();
        _this.buildSteps();
        return _this;
    }
    YAxis.prototype.updateScale = function () {
        if (this.calculateNewStep()) {
            while (this.steps.length > 0) {
                this.steps.pop().remove();
            }
            this.buildSteps();
        }
        else {
            this.steps.forEach(function (step) {
                step.position();
            });
        }
    };
    YAxis.prototype.moveSteps = function (delta) {
        var _this = this;
        this.steps.forEach(function (step) {
            step.group.position.x += delta * _this.graph.xZoom;
        });
    };
    YAxis.prototype.calculateNewStep = function () {
        var _this = this;
        var newStepSize = this.stepSize;
        var magnitude = Math.pow(10, Math.floor(Math.log((this.graph.visibleRange.maxY * 2) / 3) / Math.LN10));
        this.stepMultipliers.forEach(function (multiplier) {
            if (multiplier * magnitude <= (_this.graph.visibleRange.maxY * 2) / 3)
                newStepSize = multiplier * magnitude;
        });
        var rebuildSteps = this.stepSize != newStepSize || Math.floor(this.graph.visibleRange.maxY / newStepSize) > this.steps.length / 2;
        this.stepSize = newStepSize;
        return rebuildSteps;
    };
    YAxis.prototype.getNewStep = function (value) {
        return new AxisStep(this.graph, StepDirection.vertical, value, false);
    };
    YAxis.prototype.buildSteps = function () {
        for (var i = this.stepSize; i < this.graph.visibleRange.maxY; i += this.stepSize) {
            this.steps.push(this.getNewStep(i));
        }
        for (var i = -this.stepSize; i > this.graph.visibleRange.minY; i -= this.stepSize) {
            this.steps.push(this.getNewStep(i));
        }
    };
    return YAxis;
}(Axis));
export { YAxis };
//# sourceMappingURL=yAxis.js.map