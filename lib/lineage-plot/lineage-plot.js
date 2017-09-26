import BaseLineagePlotController from '../base-lineage-plot/base-lineage-plot.js'
import baseLayoutTemplate from '../base-lineage-plot/base-lineage-plot-default-layout.js';
import {
    createTreeLayout,
    mergeTemplateLayout,
    adjustExtent
} from '../shared-features.js'

import angular from 'angular'
import './lineage-plot.css'

let d3 = Object.assign({},
    require('d3-scale'),
    require('d3-array'),
    require('d3-hierarchy')
);

let lineageLayout = {
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
    }
};


class LineagePlotController extends BaseLineagePlotController {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-lineage-plot');
    }

    static getLayoutTemplate() {
        return mergeTemplateLayout(lineageLayout, baseLayoutTemplate);
    }

    linkGenerator(d) {
        let c = Math.abs(d.parent.x - d.x) / 2;

        return 'M' + d.x + ',' + d.y
            + 'C' + (d.parent.x + c) + ',' + d.y
            + ' ' + (d.parent.x + c) + ',' + d.parent.y
            + ' ' + d.parent.x + ',' + d.parent.y;
    }

    setupScales() {
        this.xExtent = adjustExtent(d3.extent(this.nodes, node => this.isTimePlot ? new Date(node.data.date * 1000)
            : node.depth), this.isTimePlot);

        this.xScale = (this.isTimePlot ? d3.scaleTime() : d3.scaleLinear())
            .domain(this.xExtent)
            .range([0, this.plotWidth]);

        this.yScale = d3.scaleLinear()
            .domain([0, this.plotHeight])
            .range([0, this.plotHeight]);
    }

    drawMainAxes() {
        this.drawAxis(this.treeFixedContainer, 'x-main', this.xScale, this.plotHeight, this.isTimePlot, true);
    }

    drawBrushAxes() {
        this.drawAxis(this.brushFixedContainer, 'x-brush', this.brushContext.xScale, this.brushContext.plotHeight,
            this.isTimePlot, true);
    }

    prepareNodes(data, context) {
        let root = {name: 'virtualRoot', children: [], parent: null};

        let allTrees = createTreeLayout(data);

        root.children = allTrees.map(node => {
            node.parent = 'virtualRoot';
            return node;
        });

        let hierarchy = d3.hierarchy(root, d => d.children);

        if (context.isTimePlot) {
            (function calcTotalChildren(node) {
                node.totalChildren = 0;
                if (!node.children || node.children.length == 0) {
                    return 1;
                }
                for (let child of node.children) {
                    node.totalChildren += calcTotalChildren(child);
                }
                return node.totalChildren;
            })(hierarchy);

            hierarchy.each(node => {
                let oldChildren = node.children;
                if (!oldChildren || oldChildren.length == 0) {
                    return;
                }
                let newChildren = [];
                oldChildren.sort((a, b) => (a.totalChildren - b.totalChildren) || (b.data.date - a.data.date));
                while (oldChildren.length) {
                    newChildren[oldChildren.length % 2 === 0 ? 'push' : 'unshift'](oldChildren.shift());
                }
                node.children = newChildren;
            });
        }

        let treeLayout = d3.tree().size([context.plotHeight, context.plotWidth]),
            nodes = treeLayout(hierarchy).descendants().filter(n => n.parent !== null);

        for (let node of nodes) {
            node._y = node.x;
            node._x = context.isTimePlot ? new Date(node.data.date * 1000) : node.depth;
            if (node.parent.data.name === 'virtualRoot') {
                node.parent = null;
            }
        }

        return nodes.filter(node => node.data.name !== 'virtualRoot');
    }
}

const LineagePlotComponent = {
    template: '',
    controller: LineagePlotController,
    bindings: {
        plotData: '<',
        plotLayout: '<',
        nodesSelection: '&',
        nodeClick: '&',
        customNode: '&'
    }
};

export default angular.module('ancestry.lineage', [])
    .component('lineagePlot', LineagePlotComponent);
