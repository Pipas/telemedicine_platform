"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var valueGenerator_1 = require("./valueGenerator");
var dat = __importStar(require("dat.gui"));
var GeneratorManager = /** @class */ (function () {
    function GeneratorManager(callback, graphManager) {
        this.generating = false;
        this.frequency = 60;
        this.callback = callback;
        this.graphManager = graphManager;
        this.generators = [];
        this.initGUI();
        this.createGenerator();
    }
    GeneratorManager.prototype.initGUI = function () {
        var _this = this;
        this.gui = new dat.GUI();
        this.gui.add(this, 'frequency', 1, 1000).onChange(function () { return _this.start(); });
        this.gui.add(this, 'toggle');
        this.gui.add(this, 'addGraph');
        this.gui.close();
    };
    GeneratorManager.prototype.addGraph = function () {
        this.createGenerator();
        this.graphManager.addGraph();
    };
    GeneratorManager.prototype.createGenerator = function () {
        var newGenerator = new valueGenerator_1.ValueGenerator();
        var controlsFolder = this.gui.addFolder("Graph " + newGenerator.id);
        controlsFolder
            .add(newGenerator, 'type', [
            valueGenerator_1.GeneratorType.SineGenerator,
            valueGenerator_1.GeneratorType.SquareGenerator,
            valueGenerator_1.GeneratorType.LinearGenerator,
        ])
            .onChange(function () { return newGenerator.updateGeneratingFunction(); });
        controlsFolder.add(newGenerator, 'period');
        controlsFolder.add(newGenerator, 'multiplier');
        this.generators.push(newGenerator);
    };
    GeneratorManager.prototype.start = function () {
        var _this = this;
        if (this.initTime == null)
            this.initTime = Date.now();
        if (this.interval != null)
            clearInterval(this.interval);
        this.interval = setInterval(function () {
            _this.callback(_this.generate());
        }, 1000 / this.frequency);
        this.generating = true;
    };
    GeneratorManager.prototype.stop = function () {
        clearInterval(this.interval);
        this.generating = false;
    };
    GeneratorManager.prototype.toggle = function () {
        if (this.generating) {
            this.stop();
        }
        else {
            this.start();
        }
    };
    GeneratorManager.prototype.generate = function () {
        var time = (Date.now() - this.initTime) / 1000;
        return this.generators.map(function (generator) { return generator.generate(time); });
    };
    return GeneratorManager;
}());
exports.GeneratorManager = GeneratorManager;
