var GraphControls = /** @class */ (function () {
    function GraphControls(graph, element) {
        this.element = element;
        this.graph = graph;
        this.initControls();
    }
    GraphControls.prototype.initControls = function () {
        this.controlDiv = document.createElement('div');
        this.controlDiv.setAttribute('class', 'controls');
        this.element.appendChild(this.controlDiv);
        this.addXPositiveZoomButton();
        this.addXNegativeZoomButton();
        this.addYPositiveZoomButton();
        this.addYNegativeZoomButton();
        this.addMiddleButton();
        this.createFollowLineButton();
        this.createUpdateVerticalRangeButton();
    };
    GraphControls.prototype.setFollowLineButtonVisability = function (visability) {
        if (visability)
            this.followLine.style.display = 'block';
        else
            this.followLine.style.display = 'none';
    };
    GraphControls.prototype.setUpdateVerticalRangeButtonVisability = function (visability) {
        if (visability)
            this.updateVerticalRange.style.display = 'block';
        else
            this.updateVerticalRange.style.display = 'none';
    };
    GraphControls.prototype.addMiddleButton = function () {
        var button = document.createElement('button');
        button.setAttribute('class', 'mid vmid');
        this.controlDiv.appendChild(button);
    };
    GraphControls.prototype.createFollowLineButton = function () {
        var _this = this;
        this.followLine = document.createElement('button');
        this.followLine.setAttribute('class', 'top right');
        this.followLine.innerHTML = '>';
        this.controlDiv.appendChild(this.followLine);
        this.followLine.style.display = 'none';
        this.followLine.addEventListener('click', function () {
            _this.graph.setAutoMoveHorizontalRange(true);
        });
    };
    GraphControls.prototype.createUpdateVerticalRangeButton = function () {
        var _this = this;
        this.updateVerticalRange = document.createElement('button');
        this.updateVerticalRange.setAttribute('class', 'top left');
        this.updateVerticalRange.innerHTML = '[';
        this.controlDiv.appendChild(this.updateVerticalRange);
        this.updateVerticalRange.style.display = 'none';
        this.updateVerticalRange.addEventListener('click', function () {
            _this.graph.setAutoUpdateVerticalRange(true);
        });
    };
    GraphControls.prototype.addXPositiveZoomButton = function () {
        var _this = this;
        var button = document.createElement('button');
        button.setAttribute('class', 'right vmid');
        button.innerHTML = '+';
        this.controlDiv.appendChild(button);
        button.addEventListener('click', function () {
            _this.graph.increaseHorizontalZoom();
        });
    };
    GraphControls.prototype.addXNegativeZoomButton = function () {
        var _this = this;
        var button = document.createElement('button');
        button.setAttribute('class', 'left vmid');
        button.innerHTML = '-';
        this.controlDiv.appendChild(button);
        button.addEventListener('click', function () {
            _this.graph.decreaseHorizontalZoom();
        });
    };
    GraphControls.prototype.addYPositiveZoomButton = function () {
        var _this = this;
        var button = document.createElement('button');
        button.setAttribute('class', 'top mid');
        button.innerHTML = '+';
        this.controlDiv.appendChild(button);
        button.addEventListener('click', function () {
            _this.graph.increaseVerticalZoom();
        });
    };
    GraphControls.prototype.addYNegativeZoomButton = function () {
        var _this = this;
        var button = document.createElement('button');
        button.setAttribute('class', 'bottom mid');
        button.innerHTML = '-';
        this.controlDiv.appendChild(button);
        button.addEventListener('click', function () {
            _this.graph.decreaseVerticalZoom();
        });
    };
    return GraphControls;
}());
export { GraphControls };
//# sourceMappingURL=graphControls.js.map