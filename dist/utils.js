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

    _angular2.default.element($window).on('resize', function (event) {
        var newWidth = window[0].innerWidth;
        if (width != newWidth) {
            $rootScope.$broadcast('window-resize', width = newWidth);
        }
    });
}

exports.default = _angular2.default.module('ancestry.utils', []).service("WindowResize", WindowResize);