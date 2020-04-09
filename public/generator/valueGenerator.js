import { Vector2 } from 'three';
export var GeneratorType;
(function (GeneratorType) {
    GeneratorType["SineGenerator"] = "SineGenerator";
    GeneratorType["SquareGenerator"] = "SquareGenerator";
    GeneratorType["LinearGenerator"] = "LinearGenerator";
})(GeneratorType || (GeneratorType = {}));
var ValueGenerator = /** @class */ (function () {
    function ValueGenerator(id) {
        this.type = GeneratorType.SineGenerator;
        this.period = 1;
        this.multiplier = 10;
        this.id = id;
        this.updateGeneratingFunction();
    }
    ValueGenerator.prototype.generate = function (time) {
        return this.generatingFunction(time);
    };
    ValueGenerator.prototype.updateGeneratingFunction = function () {
        var _this = this;
        switch (this.type) {
            case GeneratorType.SineGenerator:
                this.generatingFunction = function (time) {
                    return new Vector2(time, Math.sin((Math.PI * time) / _this.period) * _this.multiplier);
                };
                break;
            case GeneratorType.SquareGenerator:
                this.generatingFunction = function (time) {
                    return new Vector2(time, Math.floor(time / _this.period) % 2 ? -1 * _this.multiplier : 1 * _this.multiplier);
                };
                break;
            case GeneratorType.LinearGenerator:
                this.generatingFunction = function (time) { return new Vector2(time, time * _this.multiplier); };
                break;
            default:
                break;
        }
    };
    return ValueGenerator;
}());
export { ValueGenerator };
//# sourceMappingURL=valueGenerator.js.map