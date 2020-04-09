var VisibleRange = /** @class */ (function () {
    function VisibleRange(minX, maxX, minY, maxY) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
    }
    VisibleRange.prototype.containsX = function (x) {
        return this.minX <= x && this.maxX >= x;
    };
    VisibleRange.prototype.containsY = function (y) {
        return this.minY <= y && this.maxY >= y;
    };
    return VisibleRange;
}());
export { VisibleRange };
//# sourceMappingURL=visibleRange.js.map