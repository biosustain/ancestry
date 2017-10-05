import angular from 'angular';
import * as d3 from 'd3-selection'
import 'angular-material';
import '../lib/index.js';
import {phyloData, phyloLayout} from './phylo_example.js'
import baseLayoutTemplate from '../lib/base-lineage-plot/base-lineage-plot-default-layout.js'

let nodesArray = createRandomLineageData(250, 7);

function createRandomLineageData(totalNodes, n) {
    let nodes = [],
        children,
        labels = 'ABCDEFGHIJKLMNOPQRSTVWXYZ'.split(''),
        gen_labels = [],
        parents = null,
        totalChildren,
    // cumulative probability
        pr = [0.1, 0.4, 0.8, 1.0];

    for(let i = 0; i < 25; i++) {
        labels.push(labels[i] + labels[i]);
    }

    if (n === undefined)
        n = Math.round(Math.random() * 5) + 1;

    function getNumberOfChildren(len=1) {
        let result = [],
            sum = 0;
        for (let j = 0; j < len; j++) {
            let number = Math.random() - len * 0.02 - 1.0 / totalNodes;
            for (let i = 0; i < pr.length; i++) {
                if (number <= pr[i]) {
                    if (sum < 22 / n)
                        result.push(i);
                    else
                        result.push(0);
                    sum += i;
                    break;
                }
            }
        }
       if (!sum)
            result = getNumberOfChildren(len);

        return result;
    }


    let nodesNum = [];
    for (let i = 0; i < n; i++) {
        nodesNum.push(Math.random());
    }
    let sum = nodesNum.reduce((a, b) => { return a + b }, 0);
    for (let i = 0; i < n; i++) {
        nodesNum[i] = Math.round(nodesNum[i] / sum * totalNodes);
    }

    let rn = Math.pow(10, Math.round(Math.random() * 12 - 8));
    for (let s = 0; s < n; s++) {

        for (let i = 0, gen = 1; i < nodesNum[s]; i+=totalChildren, gen++) {

            if (gen_labels[gen - 1] === undefined)
                gen_labels.push(0);
            children = gen == 1 ? [1] : getNumberOfChildren(parents ? parents.length : 1);

            totalChildren = children.reduce((a, b) => { return a + b }, 0);
            let p = 0,
                cumSum = children[0],
                _parents = [];
            for (let j = 0; j < totalChildren; j++) {
                let parent = parents ? parents[p] : null,
                    name = 'Node_' + gen + labels[gen_labels[gen - 1]++],
                    inLinkLabel = Math.random() > 0.5 ? undefined : Math.random().toString(36).substr(2, 8),
                    node = {
                        name,
                        x: gen-1,
                        y: (s * 10 + gen + j) * rn,
                        z: Math.random() > 0.7 ? undefined : Math.round(Math.random() * 100) / 10,
                        selected: Math.random() < 0.5 ? false : (Math.random() < 0.5 ? true : undefined),
                        parent: parent,
                        inLinkLabel,
                        series: 10 + Math.floor(Math.random() * 4),
                        type: Math.random() > 0.5 ? 'type1' : 'type2',
                        tooltip: [name, 'Link in: ' + inLinkLabel,
                            'Link out: ' + Math.random().toString(36).substr(2, 15)]
                    };
                _parents.push(node.name);
                nodes.push(node);
                if (j >= cumSum) {
                    p++;
                    cumSum += children[p];
                }
            }
            parents = _parents;
        }
        parents = null;
    }

    return nodes;
}


let lineageScatterConfig = {
    margin: {
        left: 70,
        bottom: 30,
        right: 140
    },
    axis: {
        x: {
            format: '.3s',
            title: 'x axis title'
        },
        y: {
            format: '.3s',
            title: 'y axis title'
        }
    },
    nodeTypes: {
        'type1': {
            r: 4,
            'stroke-width': 3
        },
        'type2': {
            r: 6,
            'stroke-width': 1
        }
    },
    labelCollisionDetection: {
        enabled: 'onDelay',
        order: {
            nodeLabel: 1,
            linkLabel: 2
        }
    },
    groupSelection: {
        enabled: true
    },
    heatmap: {
        title: 'z values',
        colorBar: {
            show: true,
            height: '90%'
        }
    },
    legend: {
        show: true
    },
    brush: {
        margin: {
            top: 35
        }
    },
    controls: {
        select: {
            active: true
        }
    }
};

let lineageConfig = {
    backgroundColor: 'white',
    margin: {
        top: 30,
        bottom: 20
    },
    seriesColors: {
        10: 'red',
        11: 'purple',
        12: '#777',
        13: 'orange'
    },
    labelCollisionDetection: {
        enabled: 'onDelay'
    },
    groupSelection: {
        enabled: true
    },
    heatmap: {
        enabled: false
    },
    legend: {
        show: true,
        x: 0.5,
        y: 0.0,
        anchor: {
            x: 'center',
            y: 'bottom'
        },
        orientation: 'horizontal'
    },
    brush: {
        lockY: true,
        height: 12,
        drawTrees: false,
        axis: {
            x: {
                showGrid: false,
                showTickText: false
            }
        }

    },
    minViewportWidth: {
        generationWidth: 100
    },
    controls: {
        brush: {
            active: true
        }
    }
};

let lineageTimeConfig = {
    backgroundColor: 'white',
    margin: {
        bottom: 20
    },
    labelCollisionDetection: {
        enabled: 'onDelay'
    },
    heatmap: {
        enabled: false
    },
    minViewportWidth: {
        timeIntervalInPixels: 200
    },
    controls: {
        select: {
            show: false
        },
        brush: {
            active: true
        }
    }
};

let radialLineageConfig = {
    height: 500,
    margin: {
        right: 160
    },
    labelCollisionDetection: {
        enabled: 'onDelay'
    },
    groupSelection: {
        enabled: true
    },
    heatmap: {
        title: 'z values',
        colorBar: {
            show: true,
            height: '90%'
        }
    },
    legend: {
        show: true
    },
    controls: {
        download: {
            format: 'svg'
        }
    }
};

class AppController {
    constructor($scope/*, $http */) {
        $scope.selectedNodes = [];

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

        let clickedPath = [],
            mouseoveredPath = [],
            originalPathAttrs = baseLayoutTemplate.link,
            highlightPathAttrs = {
                'stroke-width': 2,
                stroke: 'black'
            },
            originalNodeRadius = 4;

        $scope.nodeClick = function($event, $object) {
            if (clickedPath.length) {
                d3.selectAll(clickedPath).attrs(originalPathAttrs);
                let firstLink = clickedPath[0];
                clickedPath = [];
                if (firstLink.__data__.targetNode == $object) return;
            }
            while ($object.parent) {
                clickedPath.push($object.inLink.DOMElement);
                mouseoveredPath = mouseoveredPath.filter(d => d != $object.inLink.DOMElement);
                $object = $object.parent;
            }
            d3.selectAll(clickedPath).attrs(highlightPathAttrs);

        };

        $scope.nodeMouseOver = function($event, $object) {
            while ($object.parent) {
                if (clickedPath.includes($object.inLink.DOMElement)) break;
                mouseoveredPath.push($object.inLink.DOMElement);
                $object = $object.parent;
            }
            d3.selectAll(mouseoveredPath).attrs(highlightPathAttrs);
        };

        $scope.nodeMouseOut = function() {
            d3.selectAll(mouseoveredPath).attrs(originalPathAttrs);
            mouseoveredPath = [];
        };

        $scope.linkClick = function($event, $object) {
            console.log($object.sourceNode.data.name + '\t->\t' + ($object.label ? $object.label.text : '') + '\t->\t'
                + $object.targetNode.data.name);
        };
        $scope.linkMouseOver = function($event, $object) {
            d3.selectAll([$object.sourceNode.DOMElement, $object.targetNode.DOMElement]).attr('r', 6);
        };
        $scope.linkMouseOut = function($event, $object) {
            d3.selectAll([$object.sourceNode.DOMElement, $object.targetNode.DOMElement]).attr('r', originalNodeRadius);
        };

        $scope.nodesSelection = function($nodes) {
            console.log($nodes);
        };

        //$http.get('sample_data.json').then((data) => {
        //    $scope.lineagePlotTimeData = data.data;
        //    $scope.lineagePlotTimeLayout = lineageTimeConfig;
        //});
        //console.log(nodesArray)

        $scope.lineagePlotTimeData = createRandomLineageData(100, 1).map(d => {
            d.date = 1369180800 + (d.x + Math.random()) * 2592000;
            return d;
        });
        $scope.lineagePlotTimeLayout = lineageTimeConfig;

        $scope.lineagePlotData = nodesArray;
        $scope.lineagePlotLayout = lineageConfig;

        $scope.lineageScatterPlotData = nodesArray;
        $scope.lineageScatterPlotLayout = lineageScatterConfig;

        $scope.radialPlotData = nodesArray;
        $scope.radialPlotLayout = radialLineageConfig;
        $scope.showBranchLengths = true;
        $scope.phyloData = phyloData;
        $scope.phyloLayout = phyloLayout;

    }
}

AppController.$$ngIsClass = true; // temporary Firefox fix
const App = angular.module('Visualizer', ['ancestry', 'ngMaterial'])
    .controller('AppController', AppController);


angular.element(document).ready(function () {
    return angular.bootstrap(document, [App.name], {
        strictDi: false
    });
});
