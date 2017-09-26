import angular from 'angular';
import './lib/index.js';
import 'angular-highlightjs';
import lineagePlotData from './data/lineage_data.js'
import lineagePlotLayout from './data/lineage_layout.js'
import lineageScatterPlotData from './data/lineage_scatter_data.js'
import lineageScatterPlotLayout from './data/lineage_scatter_layout.js'
import radialLineagePlotData from './data/radial_lineage_data.js'
import radialLineagePlotLayout from './data/radial_lineage_layout.js'
import radialPhylogeneticTreeData from './data/radial_phylogenetic_tree_data.js'
import radialPhylogeneticTreeLayout from './data/radial_phylogenetic_tree_layout.js'

class AppController {
    constructor($scope, $http) {
        $scope.lineageData = lineagePlotData;
        $scope.lineageLayout = lineagePlotLayout;

        $scope.lineageScatterData = lineageScatterPlotData;
        $scope.lineageScatterLayout = lineageScatterPlotLayout;

        $scope.radialLineageData = radialLineagePlotData;
        $scope.radialLineageLayout = radialLineagePlotLayout;

        $scope.radialPhylogeneticTreeData = radialPhylogeneticTreeData;
        $scope.radialPhylogeneticTreeLayout = radialPhylogeneticTreeLayout;
    }
}

const App = angular.module('Visualizer', ["ancestry", "hljs"])
    .controller('AppController', AppController);

angular.element(document).ready(function () {
    return angular.bootstrap(document, [App.name], {
        strictDi: false
    });
});