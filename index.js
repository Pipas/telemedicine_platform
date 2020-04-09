import { GraphManager } from './graphManager';
import * as Stats from 'stats.js';
import { WebsocketManager } from './websocketManager';
import * as localforage from 'localforage';
import { GeneratorManager } from './generator/generatorManager';
var graphManager;
var generator;
var stats;
var generatorCallback = function (points) { return graphManager.addPoints(points); };
function render() {
    stats.begin();
    graphManager.update();
    stats.end();
    requestAnimationFrame(render);
}
function initStats() {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
}
function initWebSocket() {
    new WebsocketManager(graphManager, generatorCallback, function () {
        console.log('error');
        generator = new GeneratorManager(generatorCallback, graphManager);
        generator.start();
    });
}
window.onload = function () {
    localforage.clear();
    graphManager = new GraphManager();
    initWebSocket();
    initStats();
    render();
};
//# sourceMappingURL=index.js.map