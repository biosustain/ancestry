import angular from 'angular';
import './lib/index.js';
import 'angular-highlightjs';
import 'angular-material';
import 'angular-material/angular-material.min.css'

import LineageExampleController from './data/example_lineage/controller.js'
import TimeLineageExampleController from './data/example_lineage_time/controller.js'
import LineageScatterExampleController from './data/example_lineage_scatter/controller.js'
import RadialLineageExampleController from './data/example_radial_lineage/controller.js'
import PhylogeneticTreeExampleController from './data/example_phylogenetic_tree/controller.js'


const App = angular.module('Visualizer', ['ancestry', 'hljs', 'ngMaterial'])
    .config(['$mdIconProvider', function($mdIconProvider) {
        $mdIconProvider.icon('md-close', './icons/ic_close_black_24px.svg', 24);
    }])
    .controller('LineageExampleController', LineageExampleController)
    .controller('TimeLineageExampleController', TimeLineageExampleController)
    .controller('LineageScatterExampleController', LineageScatterExampleController)
    .controller('RadialLineageExampleController', RadialLineageExampleController)
    .controller('PhylogeneticTreeExampleController', PhylogeneticTreeExampleController);

angular.element(document).ready(function () {
    return angular.bootstrap(document, [App.name], {
        strictDi: false
    });
});