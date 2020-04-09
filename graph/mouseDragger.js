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
import { Vector2, EventDispatcher } from 'three';
var MouseDragger = /** @class */ (function (_super) {
    __extends(MouseDragger, _super);
    function MouseDragger(element) {
        var _this = _super.call(this) || this;
        _this.onDocumentMouseDown = function (event) {
            if (!_this.mouseInElement(event))
                return;
            event.preventDefault();
            _this.mousePosition = _this.getMousePosition(event);
        };
        _this.onDocumentMouseMove = function (event) {
            if (_this.mousePosition == null)
                return;
            event.preventDefault();
            var newPosition = _this.getMousePosition(event);
            if (newPosition.equals(_this.mousePosition))
                return;
            _this.dispatchEvent({
                type: 'drag',
                delta: new Vector2(newPosition.x - _this.mousePosition.x, newPosition.y - _this.mousePosition.y),
            });
            _this.mousePosition = newPosition;
        };
        _this.onDocumentMouseUp = function () {
            _this.mousePosition = null;
        };
        _this.element = element;
        _this.attachEvents();
        return _this;
    }
    MouseDragger.prototype.attachEvents = function () {
        document.addEventListener('mousedown', this.onDocumentMouseDown, false);
        document.addEventListener('mousemove', this.onDocumentMouseMove, false);
        document.addEventListener('mouseup', this.onDocumentMouseUp, false);
    };
    MouseDragger.prototype.mouseInElement = function (event) {
        var target = event.target || event.srcElement;
        if (target != this.element)
            return false;
        var rect = this.element.getBoundingClientRect();
        return !(event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom);
    };
    MouseDragger.prototype.getMousePosition = function (event) {
        var rect = this.element.getBoundingClientRect();
        var position = new Vector2(event.clientX - rect.left, event.clientY - rect.top);
        return position;
    };
    return MouseDragger;
}(EventDispatcher));
export { MouseDragger };
//# sourceMappingURL=mouseDragger.js.map