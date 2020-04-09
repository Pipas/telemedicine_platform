import { LineBasicMaterial, Vector3, Line, BufferGeometry, Sprite, SpriteMaterial, LinearFilter, Group, TextureLoader, } from 'three';
export var StepDirection;
(function (StepDirection) {
    StepDirection[StepDirection["vertical"] = 0] = "vertical";
    StepDirection[StepDirection["horizontal"] = 1] = "horizontal";
})(StepDirection || (StepDirection = {}));
var AxisStep = /** @class */ (function () {
    function AxisStep(graph, direction, value, isTime) {
        this.graph = graph;
        this.direction = direction;
        this.value = value;
        this.isTime = isTime;
        this.group = new Group();
        this.initDigits();
        this.draw();
    }
    AxisStep.prototype.isVisible = function () {
        return this.direction == StepDirection.horizontal
            ? this.graph.visibleRange.containsX(this.value)
            : this.graph.visibleRange.containsY(this.value);
    };
    AxisStep.prototype.draw = function () {
        this.drawLine();
        this.drawNumber();
        this.position();
        this.graph.scene.add(this.group);
    };
    AxisStep.prototype.drawLine = function () {
        var firstPoint;
        var secondPoint;
        if (this.direction === StepDirection.horizontal) {
            firstPoint = new Vector3(0, 0, 0);
            secondPoint = new Vector3(0, -0.5, 0);
        }
        else {
            firstPoint = new Vector3(0, 0, 0);
            secondPoint = new Vector3(0.5, 0, 0);
        }
        var geometry = new BufferGeometry().setFromPoints([firstPoint, secondPoint]);
        var line = new Line(geometry, AxisStep.material);
        this.group.add(line);
    };
    AxisStep.prototype.initDigits = function () {
        if (AxisStep.digits == null) {
            var digits = '0123456789-:,.';
            AxisStep.digits = new Map();
            AxisStep.digitWidth = 11 / 16;
            for (var i = 0; i < digits.length; i++) {
                var texture = new TextureLoader().load('images/digits.png');
                texture.minFilter = LinearFilter;
                texture.repeat.x = 1 / digits.length;
                texture.offset.x = (i * (154 / digits.length)) / 154;
                var sprite = new Sprite(new SpriteMaterial({ map: texture }));
                sprite.scale.set(AxisStep.digitWidth, 1, 1);
                AxisStep.digits.set(digits.split('')[i], sprite);
            }
        }
    };
    AxisStep.prototype.drawNumber = function () {
        var _this = this;
        var valueDigits = this.isTime ? this.getValueAsTime().split('') : this.value.toString().split('');
        valueDigits.forEach(function (digit, i) {
            var spriteDigit = AxisStep.digits.get(digit).clone();
            if (_this.direction === StepDirection.horizontal) {
                spriteDigit.position.x = -((AxisStep.digitWidth * (valueDigits.length - 1)) / 2) + AxisStep.digitWidth * i;
                spriteDigit.position.y = -1.4;
            }
            else {
                spriteDigit.position.x = 1 + (AxisStep.digitWidth * (valueDigits.length - 1)) / 2 + AxisStep.digitWidth * i;
                spriteDigit.position.y = 0;
            }
            _this.group.add(spriteDigit);
        });
    };
    AxisStep.prototype.getValueAsTime = function () {
        var seconds = this.value < 60 ? this.value : this.value % 60;
        var minutes = this.value < 60 ? 0 : (this.value - seconds) / 60;
        return minutes.toString() + ':' + ('0' + seconds).slice(-2);
    };
    AxisStep.prototype.position = function () {
        if (this.direction == StepDirection.horizontal) {
            this.group.position.x = this.value * this.graph.xZoom;
            this.group.position.y = 0;
        }
        else {
            this.group.position.x = this.graph.visibleRange.minX * this.graph.xZoom;
            this.group.position.y = this.value * this.graph.yZoom;
        }
    };
    AxisStep.prototype.remove = function () {
        this.graph.scene.remove(this.group);
    };
    AxisStep.prototype.redraw = function () {
        this.remove();
        this.draw();
    };
    AxisStep.material = new LineBasicMaterial({ color: 0x000000 });
    return AxisStep;
}());
export { AxisStep };
//# sourceMappingURL=axisStep.js.map