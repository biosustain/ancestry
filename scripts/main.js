'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

require('d3');

require('plotify');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AppController = function AppController($scope, $http) {
    _classCallCheck(this, AppController);

    $http.get('data/lineage_data.json').then((response) => {
        $scope.lineageExampleData = response.data;
        $scope.lineageScatterExampleData = response.data;
    });
};

var App = _angular2.default.module('Visualizer', ["plotify"]).controller('AppController', AppController);

_angular2.default.element(document).ready(function () {
    return _angular2.default.bootstrap(document, [App.name], {
        strictDi: false
    });
});
