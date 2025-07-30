"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundColourPlugin = void 0;
var BackgroundColourPlugin = /** @class */ (function () {
    function BackgroundColourPlugin(_width, _height, _fillStyle) {
        this._width = _width;
        this._height = _height;
        this._fillStyle = _fillStyle;
        this.id = 'chartjs-plugin-chartjs-node-canvas-background-colour';
    }
    BackgroundColourPlugin.prototype.beforeDraw = function (chart) {
        var ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = this._fillStyle;
        ctx.fillRect(0, 0, this._width, this._height);
        ctx.restore();
    };
    return BackgroundColourPlugin;
}());
exports.BackgroundColourPlugin = BackgroundColourPlugin;
