import angular from 'angular'
import './lineage-plot/lineage-plot.js'
import './lineage-scatter-plot/lineage-scatter-plot.js'
//import './radial-lineage-plot/radial-lineage-plot.js'
//import './radial-phylogenetic-tree/radial-phylogenetic-tree.js'
import './common.css'
export default angular.module('ancestry', [
    'ancestry.lineage',
    'ancestry.lineage-scatter'
    //'ancestry.radial-lineage',
    //'ancestry.radial-phylogenetic-tree',
]);