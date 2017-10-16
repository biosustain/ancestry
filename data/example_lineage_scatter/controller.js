import * as d3 from 'd3-selection'
import lineageScatterData from './data.js'
import lineageScatterLayout from './layout.js'

export default class TimeLineageExampleController {
    constructor($scope) {
        $scope.plotData = lineageScatterData;
        $scope.plotLayout = lineageScatterLayout;

        $scope.linkClick = function($object) {
            alert(`You clicked the link going from ${$object.sourceNode.data.name
                } to ${$object.targetNode.data.name}`);
        };

        $scope.linkMouseOver = function($object) {
            d3.selectAll([$object.sourceNode.DOMElement, $object.targetNode.DOMElement]).attr('r', 7);
        };
        $scope.linkMouseOut = function($object) {
            d3.selectAll([$object.sourceNode.DOMElement, $object.targetNode.DOMElement]).attr('r', 4);
        };


    }
}

