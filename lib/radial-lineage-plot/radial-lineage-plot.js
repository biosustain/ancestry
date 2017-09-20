import BaseLineagePlotController from '../base-lineage-plot/base-lineage-plot.js'
import baseLayoutTemplate from '../base-lineage-plot/base-lineage-plot-default-layout.js';
import {
    createTreeLayout,
    mergeTemplateLayout
} from '../shared-features.js'

import angular from 'angular'
import './radial-lineage-plot.css'

let d3 = Object.assign({},
    require('d3-selection'),
    require('d3-scale'),
    require('d3-array'),
    require('d3-hierarchy'),
    require('d3-zoom')
);

d3.getEvent = () => require('d3-selection').event;

let lineageLayout = {
    sameLevel: 'both', // 'roots', 'leaves' or 'both'
    plotPadding: {
        x: 0,
        y: 30
    },
    axis: {
        x: {
            title: null,
            showAxisLine: false,
            showGrid: true,
            showTickText: true
        }
    },
    brush: {
        axis: {
            x: {
                title: null,
                showAxisLine: false,
                showGrid: true,
                showTickText: true
            }
        }
    },
    controls: {
        rotate: {
            show: true,
            enabled: false,
            position: 2.5
        }
    }
};


class RadialLineagePlotController extends BaseLineagePlotController {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-lineage-plot');
        this.originAtCenter = true;
        this.isCartesian = false;
        this.totalRotation = 0;
        this.controlMappings.rotate = this.toggleRotate.bind(this);
    }

    static getLayoutTemplate() {
        return mergeTemplateLayout(lineageLayout, baseLayoutTemplate);
    }

    linkGenerator(d) {
        let s = [d.parent.x, d.parent.y],
            t = [d.x, d.y],
            rx = d.parent._r * this.transform.kx,
            ry = d.parent._r * this.transform.ky,
            sweep = d._theta > d.parent._theta ? 1 : 0,
            largeArc = Math.abs(d._theta - d.parent._theta) % 360 > 180 ? 1 : 0;

        return `M${s[0]},${s[1]}A${rx},${ry} 0 ${largeArc},${sweep} ${d.m[0]},${d.m[1]}L${t[0]},${t[1]}`;
    }

    setupScales() {
        this.xExtent = d3.extent(this.nodes, node => this.isTimePlot ? new Date(node.data.date * 1000) : node.depth);

        this.xScale = d3.scaleLinear()
            .domain([0, this.plotWidth])
            .range([0, this.plotWidth]);

        this.yScale = d3.scaleLinear()
            .domain([0, this.plotHeight])
            .range([0, this.plotHeight]);
    }

    // todo: improve inheritance?
    updatePositions(context) {
        for (let node of context.nodes) {
            node.x = context.xScale(context.plotOrigin[0] + node._x);
            node.y = context.yScale(context.plotOrigin[1] + node._y);
            node.m = [context.xScale(context.plotOrigin[0] + node._m[0]), context.yScale(context.plotOrigin[1] + node._m[1])];
        }

        if (context.nodeLabelData) {
            for (let node of context.nodeLabelData) {
                node.x = node.node.x + node.currentLabelPos.x;
                node.y = node.node.y + node.currentLabelPos.y + node.dy;
            }
        }

        if (context.linkLabelData) {
            for (let node of this.linkLabelData) {
                node.x = (node.nodeTo.x + node.nodeTo.m[0]) / 2;
                node.y = (node.nodeTo.y + node.nodeTo.m[1]) / 2 + node.dy;
            }
        }
    }

    adjustScales() {}

    drawMainAxes() {}

    drawBrushAxes() {}

    afterRender() {
        //this.treeContainer.attr('transform', `translate(${this.plotWidth/2},${this.plotHeight/2})`);
    }

    prepareNodes(data, context) {
        let root = {name: 'virtualRoot', children: [], parent: null};

        let allTrees = createTreeLayout(data),
            multipleTreeOffset = allTrees.length == 1 ? 0 : 30;

        root.children = allTrees.map(node => {
            node.parent = 'virtualRoot';
            return node;
        });

        let r = Math.min(context.plotHeight, context.plotWidth) / 2,
            totalTreeLength = r - multipleTreeOffset - Math.max(...Object.values(context.layout.plotPadding));

        let hierarchy = d3.hierarchy(root, d => d.children).sort((a,b) => b.depth - a.depth),
            treeLayout = (context.layout.sameLevel == 'roots' ? d3.tree : d3.cluster)().size([360, 1]),
            nodes = treeLayout(hierarchy).descendants().filter(n => n.parent !== null);

        for (let child of hierarchy.children) {
            spreadNodes(child);
        }

        nodes.forEach(node => {
            node._theta = node.x;
            node._lastTheta = node.x;
            node._r = multipleTreeOffset + (context.layout.sameLevel == 'both' ? node.depth : node.y) * totalTreeLength;
            [node._x, node._y] = project(node);
            node._m = project({_theta: node._theta, _r: node.parent._r});
        });

        return nodes;
    }

    toggleRotate(toggle) {
        let that = this,
            start = null,
            delta;
        if (toggle) {
            this.treeFixedContainer
                .on('dblclick', this.onDoubleClick)
                .on("mousedown", function () {
                    d3.getEvent().preventDefault();
                    that.svg.style("cursor", "move");
                    that.marker.style('pointer-events', 'none');
                    start = that.transform.invert(d3.mouse(that.treeContainer.node()))
                        .map((d, i) => d - that.plotOrigin[i]);
                })
                .on("mouseup", mouseOutUp)
                .on("mouseout", mouseOutUp)
                .on("mousemove", function () {
                    if (!start) return;
                    d3.getEvent().preventDefault();

                    let m = that.transform.invert(d3.mouse(that.treeContainer.node()))
                        .map((d, i) => d - that.plotOrigin[i]);

                    delta = Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;

                    for (let node of that.nodes) {
                        node._theta = node._lastTheta + delta;
                        [node._x, node._y] = project(node);
                        node._m = project({_theta: node._theta, _r: node.parent._r});
                    }
                    that.updateAndRedraw();
                });
        }
        else {
            this.treeFixedContainer.on('dblclick', null)
                .on('mousedown', null)
                .on('mouseup', null)
                .on('mousemove', null)
                .on('mouseout', null);
        }

        function mouseOutUp() {
            if (!start) return;
            that.totalRotation += delta;
            start = null;
            delta = 0;
            for (let node of that.nodes) {
                node._lastTheta = node._theta;
            }
            if (that.totalRotation !== null) {
                that.brushContainer.attr('transform', `rotate(${that.totalRotation},${that.brushContext.plotOrigin[0]
                    },${that.brushContext.plotOrigin[1]})`);
            }
            that.svg.style("cursor", "auto");
            that.marker.style('pointer-events', 'all');
        }
    }
}

function spreadNodes(node, level=0) {
    if (!node.children || !node.children.length) {
        node.depth = 1;
        return level;
    }
    let max = 1, childMax;
    for (let child of node.children) {
        childMax = spreadNodes(child, level + 1);
        if (childMax > max) {
            max = childMax;
        }
    }
    node.depth = level / max;
    return max;
}

const RadialLineagePlotComponent = {
    template: '',
    controller: RadialLineagePlotController,
    bindings: {
        plotData: '<',
        plotLayout: '<',
        nodesSelection: '&',
        nodeClick: '&',
        customNode: '&'
    }
};

export default angular.module('ancestry.radial-lineage', [])
    .component('radialLineagePlot', RadialLineagePlotComponent);


function cross(a, b) { return a[0] * b[1] - a[1] * b[0]; }

function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

function project(d) {
    let a = (d._theta - 90) / 180 * Math.PI;
    return [d._r * Math.cos(a), d._r * Math.sin(a)];
}
