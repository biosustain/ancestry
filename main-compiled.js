'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

require('biosustain/plotify');

require('angular-highlightjs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
//import 'biosustain/plotify/dist/plotify.css!';


var AppController = function AppController($scope, $http) {
    _classCallCheck(this, AppController);

    $http.get('data/lineage_data.json').then(function (response) {
        $scope.lineageExampleData = response.data;
    });

    $http.get('data/lineage_scatter_data.json').then(function (response) {
        $scope.lineageScatterExampleData = response.data;
    });

    $http.get('data/radial_lineage_data.json').then(function (response) {
        $scope.radialLineageExampleData = response.data;
    });

    $scope.showLengths = true;

    $http.get('data/radial_phylogenetic_tree_data.json').then(function (response) {
        $scope.radialPhylogeneticTreeExampleData = response.data;
    });
};

var App = _angular2.default.module('Visualizer', ["plotify", "hljs"]).controller('AppController', AppController);

_angular2.default.element(document).ready(function () {
    return _angular2.default.bootstrap(document, [App.name], {
        strictDi: false
    });
});