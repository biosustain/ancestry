import angular from 'angular'
import './radial-lineage-plot/radial-lineage-plot.js'
import './radial-phylogenetic-tree/radial-phylogenetic-tree.js'
import './lineage-plot/lineage-plot.js'
import './lineage-scatter-plot/lineage-scatter-plot.js'
import './box-plot/box-plot.js'
import './violin-plot/violin-plot.js'
import './line-plot/line-plot.js'
import './common.css!'
export default angular.module('plotify', [
    'plotify.lineage',
    'plotify.radial-lineage',
    'plotify.radial-phylogenetic-tree',
    'plotify.lineage-scatter',
    'plotify.box',
    'plotify.violin',
    'plotify.line'
]);