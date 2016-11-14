'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function WindowResize($window, $rootScope) {
    var window = _angular2.default.element($window);
    var width = window[0].innerWidth;
    var height = window[0].innerHeight;

    _angular2.default.element($window).on('resize', function (event) {
        console.log(window[0]);
        var newWidth = window[0].innerWidth;
        var newHeight = window[0].innerHeight;
        if (width != newWidth || height != newHeight) {
            $rootScope.$broadcast('window-resize', width = newWidth, height = newHeight);
        }
    });
}

exports.default = _angular2.default.module('ancestry.utils', []).service("WindowResize", WindowResize);