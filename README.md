<!-- [![Logo](./resources/logo.png)](https://github.com/SeanSobey/ChartjsNodeCanvas) -->
<a href="https://github.com/SeanSobey/ChartjsNodeCanvas" align="center">
  <img src="https://raw.githubusercontent.com/SeanSobey/ChartjsNodeCanvas/HEAD/resources/logo.png">
</a>

# chartjs-node-canvas

<!-- [![CircleCI](https://circleci.com/gh/SeanSobey/ChartjsNodeCanvas.svg?style=svg)](https://circleci.com/gh/SeanSobey/ChartjsNodeCanvas) -->
[![GitHub](https://github.com/SeanSobey/ChartjsNodeCanvas/workflows/Node%20CI/badge.svg)](https://github.com/SeanSobey/ChartjsNodeCanvas/actions)
[![codecov](https://codecov.io/gh/SeanSobey/ChartjsNodeCanvas/branch/master/graph/badge.svg)](https://codecov.io/gh/SeanSobey/ChartjsNodeCanvas)
[![NPM](https://img.shields.io/npm/v/chartjs-node-canvas.svg)](https://www.npmjs.com/package/chartjs-node-canvas)
[![packagephobia publish](https://badgen.net/packagephobia/publish/chartjs-node-canvas@latest)](https://bundlephobia.com/result?p=chartjs-node-canvas)
<!-- [![bundlephobia](https://badgen.net/bundlephobia/min/chartjs-node-canvas@latest)](https://bundlephobia.com/result?p=chartjs-node-canvas) -->
<!-- [![packagephobia install](https://badgen.net/packagephobia/install/chartjs-node-canvas@latest)](https://bundlephobia.com/result?p=chartjs-node-canvas) -->

A Node JS renderer for [Chart.js](http://www.chartjs.org) using [canvas](https://github.com/Automattic/node-canvas).

Provides and alternative to [chartjs-node](https://www.npmjs.com/package/chartjs-node) that does not require jsdom (or the global variables that this requires) and allows chartJS as a peer dependency, so you can manage its version yourself.

## Contents

1. [Installation](#Installation)
2. [Node JS version](#Node%20JS%20version)
3. [Features](#Features)
4. [Limitations](#Limitations)
5. [API](#API)
6. [Usage](#Usage)
7. [Full Example](#Full%20Example)
8. [Known Issues](#Known%20Issues)

## Installation

```
npm i chartjs-node-canvas chart.js
```

## Node JS version

This is limited by the upstream dependency [canvas](https://github.com/Automattic/node-canvas).

See the GitHub Actions [yml](.github/workflows/nodejs.yml) section for the current supported Node version(s). You will need to do a `npm rebuild` to rebuild the canvas binaries.

## Features

* Supports all Chart JS features and charts.
* No heavy DOM virtualization libraries, thanks to a [pull request](https://github.com/chartjs/Chart.js/pull/5324) to chart.js allowing it to run natively on node, requiring only a Canvas API.
* Chart JS is a peer dependency, so you can bump and manage it yourself.
* Provides a callback with the global ChartJS variable, so you can use the [Global Configuration](https://www.chartjs.org/docs/latest/configuration/#global-configuration).
* Uses (similar to) [fresh-require](https://www.npmjs.com/package/fresh-require) for each instance of `ChartJSNodeCanvas`, so you can mutate the ChartJS global variable separately within each instance.
* Support for custom fonts.

## Limitations

### Animations

Chart animation (and responsive resize) is disabled by this library. This is necessary since the animation API's required are not available in Node JS/canvas-node (this is not a browser environment after all).

This is the same as:

```js
Chart.defaults.global.animation = false;
Chart.defaults.global.responsive = false;
```

### SVG and PDF

For some unknown reason canvas requires use of the [sync](https://github.com/Automattic/node-canvas#canvastobuffer) API's to use SVG's or PDF's. This libraries which support these are:

* [renderToBufferSync](./API.md#ChartJSNodeCanvas+renderToBufferSync) ('application/pdf' | 'image/svg+xml')
* [renderToStream](./API.md#ChartJSNodeCanvas+renderToStream) ('application/pdf')

You also need to set the canvas type when you initialize the `ChartJSNodeCanvas` instance like the following:

```js
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const chartJSNodeCanvas = new ChartJSNodeCanvas({ type: 'svg', width: 800, height: 600 }); 
```

## API

See the [API docs](https://github.com/SeanSobey/ChartjsNodeCanvas/blob/master/API.md).

### V3.0

Note, there are breaking changes in the version 3 bump, see the updated API docs and [Change Log](./CHANGELOG.md) for details.

### V3.1.1

Note, there were issues with the V3 deploy, see [#60](https://github.com/SeanSobey/ChartjsNodeCanvas/issues/60), to address this the legacy API was added back.

## Usage

```js
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 400; //px
const height = 400; //px
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

(async () => {
    const configuration = {
        ... // See https://www.chartjs.org/docs/latest/configuration
    };
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const stream = chartJSNodeCanvas.renderToStream(configuration);
})();
```

### Memory Management

Every instance of `ChartJSNodeCanvas` creates its own [canvas](https://github.com/Automattic/node-canvas). To ensure efficient memory and GC use make sure your implementation creates as few instances as possible and reuses them:

```js
// Re-use one service, or as many as you need for different canvas size requirements
const smallChartJSNodeCanvas = new ChartJSNodeCanvas({ width: 400, height: 400 });
const bigCChartJSNodeCanvas = new ChartJSNodeCanvas({ width: 2000, height: 2000 });

// Expose just the 'render' methods to downstream code so they don't have to worry about life-cycle management.
exports = {
    renderSmallChart: (configuration) => smallChartJSNodeCanvas.renderToBuffer(configuration),
    renderBigChart: (configuration) => bigCChartJSNodeCanvas.renderToBuffer(configuration)
};
```

### Custom Charts

Just use the ChartJS reference in the callback:

```js
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width, height, chartCallback: (ChartJS) => {
    // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
    ChartJS.controllers.MyType = Chart.DatasetController.extend({
        // chart implementation
    });
}
});
```

### Global Config

Just use the ChartJS reference in the callback:

```js
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback: (ChartJS) => {
    // Global config example: https://www.chartjs.org/docs/latest/configuration/
    ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
} });
```

### Custom Fonts

Just use the `registerFont` method:

```js
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback: (ChartJS) => {
    // Just example usage
    ChartJS.defaults.global.defaultFontFamily = 'VTKS UNAMOUR';
} });
// Register before rendering any charts
chartJSNodeCanvas.registerFont('./testData/VTKS UNAMOUR.ttf', { family: 'VTKS UNAMOUR' });
```

See the node-canvas [docs](https://github.com/Automattic/node-canvas#registerfont) and the chart js [docs](https://www.chartjs.org/docs/latest/general/fonts.html).

### Loading plugins

This library is designed to make loading plugins as simple as possible. For legacy plugins, you should just be able to add the module name to the appropriate array option and the library handles the rest.

The Chart.JS [plugin API](https://www.chartjs.org/docs/latest/developers/plugins.html) has changed over time and this requires compatibility options for the different ways plugins have been historically loaded. ChartJS Node Canvas has a `plugin` option with specifiers for the different ways supported plugin loading methods are handled. If you are not sure about your plugin, just try the different ones until your plugin loads:

#### Newer plugins

Let `ChartJSNodeCanvas` manage the lifecycle of the plugin itself, each instance will have a separate instance of the plugin:

```js
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, plugins: {
    modern: ['chartjs-plugin-annotation']
} });
```

You want to share the plugin instance, this may cause unwanted issues, use at own risk:

```js
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, plugins: {
    modern: [require('chartjs-plugin-annotation')]
} });
```

#### Older plugins

---

1. Plugin that expects a global Chart variable.

```js
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, plugins: {
    requireChartJSLegacy: ['<some plugin>']
}});
```

---

1. Plugins that `require` ChartJS themselves.

```js
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, plugins: {
    globalVariableLegacy: ['chartjs-plugin-crosshair']
} });
```

---

3. Register plugin directly with ChartJS:

```js
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, plugins: {
    requireLegacy: ['chartjs-plugin-datalabels']
} });
```

---

These approaches can be combined also:

```js
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, plugins: {
    modern: ['chartjs-plugin-annotation'],
    requireLegacy: ['chartjs-plugin-datalabels']
} });
```

See the [tests](src/index.e2e.spec.ts#106) for some examples.

## Full Example

```js
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 400;
const height = 400;
const chartCallback = (ChartJS) => {

    // Global config example: https://www.chartjs.org/docs/latest/configuration/
    ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
    // Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
    ChartJS.plugins.register({
        // plugin implementation
    });
    // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
    ChartJS.controllers.MyType = ChartJS.DatasetController.extend({
        // chart implementation
    });
};
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

(async () => {
    const configuration = {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: (value) => '$' + value
                    }
                }]
            }
        }
    };
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const stream = chartJSNodeCanvas.renderToStream(configuration);
})();
```

## Known Issues

There is a problem with persisting config objects between render calls, see this [issue](https://github.com/SeanSobey/ChartjsNodeCanvas/issues/9) for details and workarounds.
