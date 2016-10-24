'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

require('./radial-lineage-plot/radial-lineage-plot.js');

require('./radial-phylogenetic-tree/radial-phylogenetic-tree.js');

require('./lineage-plot/lineage-plot.js');

require('./lineage-scatter-plot/lineage-scatter-plot.js');

require('./common.css!');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _angular2.default.module('ancestry', ['ancestry.lineage', 'ancestry.radial-lineage', 'ancestry.radial-phylogenetic-tree', 'ancestry.lineage-scatter']);