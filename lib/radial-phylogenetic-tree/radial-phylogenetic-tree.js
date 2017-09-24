import BaseRadialLineagePlotController from '../base-radial-lineage-plot/base-radial-lineage-plot.js'
import {
    createTreeLayout,
    mergeTemplateLayout,
    spreadNodes,
    project
} from '../shared-features.js'

import angular from 'angular'
import './radial-phylogenetic-tree.css'

let d3 = Object.assign({},
    require('d3-selection'),
    require('d3-scale'),
    require('d3-array'),
    require('d3-hierarchy'),
    require('d3-zoom')
);

d3.getEvent = () => require('d3-selection').event;

let radialPhylogeneticTreeLayout = {
    showBranchLength: true
};

class RadialPhylogeneticTreeController extends BaseRadialLineagePlotController {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-radial-lineage-plot');
        this.flatInput = false;
    }

    static getLayoutTemplate() {
        return mergeTemplateLayout(radialPhylogeneticTreeLayout, BaseRadialLineagePlotController.getLayoutTemplate());
    }

    prepareNodes(data, context) {
        let root = {name: 'virtualRoot', parent: null, children: data};

        let multipleTreeOffset = data.length == 1 ? 0 : 30;

        let r = Math.min(context.plotHeight, context.plotWidth) / 2,
            totalTreeLength = r - multipleTreeOffset - Math.max(...Object.values(context.layout.plotPadding));

        removeNegativeLengths(root);
        setRadius(root, root.length = 0, totalTreeLength / maxLength(root));

        function setRadius(d, y0, k) {
            d.radius = (y0 += d.length) * k + multipleTreeOffset;
            if (d.children && d.children.length > 0) d.children.forEach(d => setRadius(d, y0, k));
        }

        function removeNegativeLengths(d) {
            if (d.length < 0) d.length = 0;
            if (d.children && d.children.length > 0) d.children.forEach(removeNegativeLengths);
        }

        function maxLength(d) {
            return d.length + (d.children && d.children.length > 0 ? d3.max(d.children, maxLength) : 0);
        }

        let hierarchy = d3.hierarchy(root, d => d.children).sort((a,b) => b.depth - a.depth),
            treeLayout = d3.cluster().size([360, 1]).separation(() => 1),
            nodes = treeLayout(hierarchy).descendants().filter(n => n.parent !== null);

        for (let child of hierarchy.children) {
            spreadNodes(child);
        }

        for (let node of nodes) {
            node._r = this.layout.showBranchLength ? node.data.radius
                : multipleTreeOffset + node.depth * totalTreeLength;
            node.data = node.data.taxon || {hide: true};
            node._theta = node.x;
            node._lastTheta = node.x;
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

    static filterSeries(trees, activeSeries) {
        let newTrees = [];
        for (let tree of trees) {
            let leaves = [];
            (function findLeaves(t) {
                if (t.taxon !== null) {
                    leaves.push(t);
                    return;
                }
                findLeaves(t.children[0]);
                findLeaves(t.children[1]);
            })(tree);
            (function addParents(t, parent) {
                if (parent) {
                    t.parent = parent;
                }
                if (t.taxon !== null) {
                    return;
                }
                addParents(t.children[0], t);
                addParents(t.children[1], t);
            })(tree, null);
            let leavesOut = leaves.filter(l => !activeSeries.has(l.taxon.series));

            for (let leaf of leavesOut) {
                let parent = leaf.parent;
                if (!parent && leaf.taxon) {
                    return null;
                }
                let sibling = parent.children[parent.children.indexOf(leaf) ^ 1];
                let parent2 = parent.parent;
                if (!parent2) {
                    sibling.parent = null;
                    tree = sibling;
                    continue;
                }
                parent2.children[parent2.children.indexOf(parent)] = sibling;
                sibling.length += parent.length;
                sibling.parent = parent2;
            }
            if (tree.children) newTrees.push(tree);
        }
        return newTrees;
    }
}

const RadialPhylogeneticTreeComponent = {
    template: '',
    controller: RadialPhylogeneticTreeController,
    bindings: {
        plotData: '<',
        plotLayout: '<',
        nodesSelection: '&',
        nodeClick: '&',
        customNode: '&'
    }
};

export default angular.module('ancestry.radial-phylogenetic-tree', [])
    .component('radialPhylogeneticTree', RadialPhylogeneticTreeComponent);
