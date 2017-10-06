import BaseLineagePlotController, {defaultBindings} from '../base-lineage-plot/base-lineage-plot.js'
import baseLayoutTemplate from '../base-lineage-plot/base-lineage-plot-default-layout.js';
import {
    createTreeLayout,
    mergeTemplateLayout,
    adjustExtent
} from '../shared-features.js'

import './lineage-scatter-plot.css'
import angular from 'angular'

let d3 = Object.assign({},
    require('d3-scale'),
    require('d3-array'),
    require('d3-hierarchy')
);

let lineageScatterLayout = {
    showLinkArrowhead: true,
    link: {
        'stroke-dasharray': 4
    },
    axis: {
        x: {
            title: null,
            format: 'g',
            showAxisLine: true,
            showGrid: true,
            showTickText: true
        },
        y: {
            title: null,
            format: 'g',
            showAxisLine: true,
            showGrid: true,
            showTickText: true
        }
    },
    brush: {
        axis: {
            x: {
                title: null,
                format: 'g',
                showAxisLine: false,
                showGrid: true,
                showTickText: true
            },
            y: {
                title: null,
                format: 'g',
                showAxisLine: false,
                showGrid: true,
                showTickText: true
            }
        }
    }
};


class LineageScatterPlotController extends BaseLineagePlotController {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-lineage-scatter-plot');
    }

    static getLayoutTemplate() {
        return mergeTemplateLayout(lineageScatterLayout, baseLayoutTemplate);
    }

    linkGenerator(d) {
        return `M ${d.sourceNode.x} ${d.sourceNode.y} L ${d.targetNode.x} ${d.targetNode.y}`;
    }

    setupScales() {
        this.xExtent = adjustExtent(d3.extent(this.nodes, node => node._x));

        this.xScale = (this.isTimePlot ? d3.scaleTime() : d3.scaleLinear())
            .domain(this.xExtent)
            .range([0, this.plotWidth]);

        this.yScale = d3.scaleLinear()
            .domain(adjustExtent(d3.extent(this.nodes, node => node._y)).reverse())
            .range([0, this.plotHeight]);
    }

    drawMainAxes() {
        this.drawAxis(this.treeFixedContainer, 'x-main', this.xScale, this.plotHeight);
        this.drawAxis(this.treeFixedContainer, 'y-main', this.yScale, this.plotWidth);
    }

    drawBrushAxes() {
        this.drawAxis(this.brushFixedContainer, 'x-brush', this.brushContext.xScale, this.brushContext.plotHeight);
        this.drawAxis(this.brushFixedContainer, 'y-brush', this.brushContext.yScale, this.brushContext.plotWidth);
    }

    prepareNodes(data) {
        let root = {name: 'virtualRoot', children: [], parent: null};

        let allTrees = createTreeLayout(data);

        root.children = allTrees.map(node => {
            node.parent = 'virtualRoot';
            return node;
        });

        let hierarchy = d3.hierarchy(root, d => d.children),
            nodes = hierarchy.descendants().filter(n => n.parent !== null);

        for (let node of nodes) {
            node._y = node.data.y;
            node._x = node.data.x;
            if (node.parent.data.name === 'virtualRoot') {
                node.parent = null;
            }
        }

        return nodes.filter(node => node.data.name !== 'virtualRoot');
    }
}

const LineageScatterPlotComponent = {
    template: '',
    controller: LineageScatterPlotController,
    bindings: defaultBindings
};

export default angular.module('ancestry.lineage-scatter', [])
    .component('lineageScatterPlot', LineageScatterPlotComponent);





