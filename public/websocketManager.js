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
import { EventDispatcher, Vector2 } from 'three';
import * as dat from 'dat.gui';
var GeneratorType;
(function (GeneratorType) {
    GeneratorType["SineGenerator"] = "SineGenerator";
    GeneratorType["SquareGenerator"] = "SquareGenerator";
    GeneratorType["LinearGenerator"] = "LinearGenerator";
})(GeneratorType || (GeneratorType = {}));
var ChangeGraphMessage = /** @class */ (function () {
    function ChangeGraphMessage() {
        this.graph = 0;
        this.type = GeneratorType.SineGenerator;
        this.period = 1;
        this.multiplier = 10;
    }
    ChangeGraphMessage.prototype.toString = function () {
        return JSON.stringify({
            graph: Math.round(this.graph),
            type: this.type,
            period: this.period,
            multiplier: this.multiplier,
        });
    };
    return ChangeGraphMessage;
}());
var WebsocketManager = /** @class */ (function (_super) {
    __extends(WebsocketManager, _super);
    function WebsocketManager(graphManager, generatorCallback, onError) {
        var _this = _super.call(this) || this;
        _this.websocketLocation = 'ws://localhost'; //'wss://protected-mesa-09317.herokuapp.com'
        _this.graphManager = graphManager;
        _this.connection = new WebSocket(_this.websocketLocation);
        _this.connection.addEventListener('open', function () {
            console.log("Connected to " + _this.websocketLocation);
            _this.initGUI();
        });
        _this.connection.addEventListener('message', function (e) {
            // onMessage(e.data)
            var data = JSON.parse(e.data);
            data.forEach(function (points) { return generatorCallback(points.map(function (point) { return new Vector2(point.x, point.y); })); });
        });
        _this.connection.addEventListener('error', function () {
            onError();
        });
        window.onbeforeunload = function () {
            _this.connection.onclose = function () {
                console.log('closing');
            }; // disable onclose handler first
            _this.connection.close();
        };
        return _this;
    }
    WebsocketManager.prototype.initGUI = function () {
        this.graphMessage = new ChangeGraphMessage();
        this.gui = new dat.GUI();
        this.gui.addFolder('Connected to WebSocket');
        this.gui.add(this, 'toggle');
        this.gui.add(this, 'addGraph');
        this.gui.add(this, 'removeGraph');
        var controlsFolder = this.gui.addFolder('Change Graph Settings');
        controlsFolder.add(this.graphMessage, 'graph', 0, 8);
        controlsFolder.add(this.graphMessage, 'type', [
            GeneratorType.SineGenerator,
            GeneratorType.SquareGenerator,
            GeneratorType.LinearGenerator,
        ]);
        controlsFolder.add(this.graphMessage, 'period');
        controlsFolder.add(this.graphMessage, 'multiplier');
        controlsFolder.add(this, 'sendMessage');
        this.gui.close();
    };
    WebsocketManager.prototype.sendMessage = function () {
        this.connection.send(this.graphMessage.toString());
    };
    WebsocketManager.prototype.toggle = function () {
        this.connection.send('toggle');
    };
    WebsocketManager.prototype.addGraph = function () {
        this.graphManager.addGraph();
    };
    WebsocketManager.prototype.removeGraph = function () {
        this.graphManager.deleteGraph();
    };
    return WebsocketManager;
}(EventDispatcher));
export { WebsocketManager };
//# sourceMappingURL=websocketManager.js.map