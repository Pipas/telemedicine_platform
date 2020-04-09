import { ValueGenerator, GeneratorType } from './valueGenerator';
import * as dat from 'dat.gui';
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
        this.folders = [];
        this.gui = new dat.GUI();
        this.gui.addFolder('Generating Values');
        this.gui.add(this, 'frequency', 1, 1000).onChange(function () { return _this.start(); });
        this.gui.add(this, 'toggle');
        this.gui.add(this, 'addGraph');
        this.gui.add(this, 'removeGraph');
        this.gui.close();
    };
    GeneratorManager.prototype.addGraph = function () {
        this.createGenerator();
        this.graphManager.addGraph();
    };
    GeneratorManager.prototype.removeGraph = function () {
        this.generators.pop();
        this.gui.removeFolder(this.folders.pop());
        this.graphManager.deleteGraph();
    };
    GeneratorManager.prototype.createGenerator = function () {
        var newGenerator = new ValueGenerator(this.generators.length + 1);
        var controlsFolder = this.gui.addFolder("Graph " + newGenerator.id);
        controlsFolder
            .add(newGenerator, 'type', [
            GeneratorType.SineGenerator,
            GeneratorType.SquareGenerator,
            GeneratorType.LinearGenerator,
        ])
            .onChange(function () { return newGenerator.updateGeneratingFunction(); });
        controlsFolder.add(newGenerator, 'period');
        controlsFolder.add(newGenerator, 'multiplier');
        this.folders.push(controlsFolder);
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
export { GeneratorManager };
//# sourceMappingURL=generatorManager.js.map