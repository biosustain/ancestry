import lineageTimePlotData from './data.js'
import lineageTimePlotLayout from './layout.js'

export default class TimeLineageExampleController {
    constructor($scope) {
        $scope.plotData = lineageTimePlotData;
        $scope.plotLayout = lineageTimePlotLayout;

        $scope.customNode = function($selection, $event) {
            if ($event == 'draw') {
                return $selection.append('rect')
                    .attr('width', 8)
                    .attr('height', 8)
                    .attr('stroke', 'orange')
                    .style('fill', d => d.data.selected ? 'orange' : 'white')
                    .attr('x', d => d.x - 4)
                    .attr('y', d => d.y - 4);
            }

            if ($event == 'select') {
                $selection.style('fill', d => d.data.selected ? 'orange' : 'white');
            }

            if ($event == 'update') {
                $selection.attr('x', d => d.x - 4)
                    .attr('y', d => d.y - 4);
            }
        };

        $scope.customLink = function($linkObject) {
            let d = $linkObject;
            return `M${d.sourceNode.x},${d.sourceNode.y}L${d.sourceNode.x},${d.targetNode.y
                }L${d.targetNode.x},${d.targetNode.y}`;
        };
    }
}

