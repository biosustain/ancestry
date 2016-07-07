import angular from 'angular';
import 'biosustain/plotify';
//import 'biosustain/plotify/dist/plotify.css!';
import 'angular-highlightjs';

class AppController {
    constructor($scope, $http) {
        $http.get('data/lineage_data.json').then((response) => {
            $scope.lineageExampleData = response.data;
        });

        $http.get('data/lineage_scatter_data.json').then((response) => {
            $scope.lineageScatterExampleData = response.data;
        });

        $http.get('data/radial_lineage_data.json').then((response) => {
            $scope.radialLineageExampleData = response.data;
        });

        $scope.showLengths = true;

        $http.get('data/radial_phylogenetic_tree_data.json').then((response) => {
            $scope.radialPhylogeneticTreeExampleData = response.data;
        });
    }
}

const App = angular.module('Visualizer', ["plotify", "hljs"])
    .controller('AppController', AppController);

angular.element(document).ready(function () {
    return angular.bootstrap(document, [App.name], {
        strictDi: false
    });
});