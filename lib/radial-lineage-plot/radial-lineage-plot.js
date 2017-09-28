import BaseRadialLineagePlotController from '../base-radial-lineage-plot/base-radial-lineage-plot.js'
import {defaultBindings} from '../base-lineage-plot/base-lineage-plot.js'
import {
    createTreeLayout,
    mergeTemplateLayout,
    spreadNodes,
    project
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

let radialLineageLayout = {
    sameLevel: 'both' // 'roots', 'leaves' or 'both'
};


class RadialLineagePlotController extends BaseRadialLineagePlotController {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-lineage-plot');
    }

    static getLayoutTemplate() {
        return mergeTemplateLayout(radialLineageLayout, BaseRadialLineagePlotController.getLayoutTemplate());
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

        for (let node of nodes) {
            node._theta = node.x;
            node._lastTheta = node.x;
            node._r = multipleTreeOffset + (context.layout.sameLevel == 'both' ? node.depth : node.y) * totalTreeLength;
            [node._x, node._y] = project(node);
            // below is hack to calculate curvature of brush links correctly
            node._r2 = context.xScale ? Math.sqrt(Math.pow(context.xScale(context.plotOrigin[0] + node._x) -
                    context.xScale(context.plotOrigin[0]), 2) + Math.pow(context.yScale(context.plotOrigin[1] + node._y)
                    - context.yScale(context.plotOrigin[1]), 2)) : node._r;
            node._m = project({_theta: node._theta, _r: node.parent._r});
            if (node.parent.data.name === 'virtualRoot') {
                node.parent = null;
            }
        }

        return nodes.filter(node => node.data.name !== 'virtualRoot');
    }
}

const RadialLineagePlotComponent = {
    template: '',
    controller: RadialLineagePlotController,
    bindings: defaultBindings
};

export default angular.module('ancestry.radial-lineage', [])
    .component('radialLineagePlot', RadialLineagePlotComponent);