import BaseLineagePlotController from '../base-lineage-plot/base-lineage-plot.js'
import baseLayoutTemplate from '../base-lineage-plot/base-lineage-plot-default-layout.js';
import {
    createTreeLayout,
    mergeTemplateLayout
} from '../shared-features.js'

import angular from 'angular'
import './radial-lineage-plot.css'

let d3 = Object.assign({},
    require('d3-scale'),
    require('d3-array'),
    require('d3-hierarchy'),
    require('d3-zoom')
);

let lineageLayout = {
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
            enabled: false
        }
    }
};


class RadialLineagePlotController extends BaseLineagePlotController {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-lineage-plot');
        this.originAtCenter = true;
    }

    static getLayoutTemplate() {
        return mergeTemplateLayout(lineageLayout, baseLayoutTemplate);
    }

    linkGenerator(d) {
        let s = [d.parent.x, d.parent.y],
            m = this.transform.apply(project({_theta: d._theta, _r: d.parent._r})),
            t = [d.x, d.y],
            rx = d.parent._r * this.transform.kx,
            ry = d.parent._r * this.transform.ky,
            sweep = d._theta > d.parent._theta ? 1 : 0,
            largeArc = Math.abs(d._theta - d.parent._theta) % 360 > 180 ? 1 : 0;

        return `M${s[0]},${s[1]}A${rx},${ry} 0 ${largeArc},${sweep} ${m[0]},${m[1]}L${t[0]},${t[1]}`;
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

    adjustScales() {}

    drawMainAxes() {}

    drawBrushAxes() {}

    afterRender() {
        //this.treeContainer.attr('transform', `translate(${this.plotWidth/2},${this.plotHeight/2})`);
    }

    prepareNodes(data) {
        let root = {name: 'virtualRoot', children: [], parent: null};

        let allTrees = createTreeLayout(data),
            multipleTreeOffset = allTrees.length == 1 ? 0 : 30;

        root.children = allTrees.map(node => {
            node.parent = 'virtualRoot';
            return node;
        });

        let r = Math.min(this.plotHeight, this.plotWidth),
            totalTreeLength = r - multipleTreeOffset - Math.max(...Object.values(this.layout.plotPadding));

        let hierarchy = d3.hierarchy(root, d => d.children).sort((a,b) => b.depth - a.depth),
            treeLayout = d3.cluster().size([360, 1]),
            nodes = treeLayout(hierarchy).descendants().filter(n => n.parent !== null);

        nodes.forEach(node => {
            node._theta = node.x;
            node._lastTheta = node.x;
            node._r = multipleTreeOffset + node.y * totalTreeLength;
            [node._x, node._y] = project(node);
        });

        return nodes;
    }
}


function project(d) {
    let a = (d._theta - 90) / 180 * Math.PI;
    return [d._r * Math.cos(a), d._r * Math.sin(a)];
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
