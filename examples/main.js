import angular from 'angular';
import "angular-material";
import "../dist/index.js";

let nodesArr = createRandomLineageScatterPlotData2(36, 3);

function createTreeLayout(nodesArray) {
    let trees = [],
        nodesDict = {},
        roots = [],
        notRoots = [],
        hasChildren = [],
        youngest = [];

    for (let i = 0; i < nodesArray.length; i++) {
        let node = nodesArray[i];
        nodesDict[node.name] = {
            name: node.name,
            parent: node.parent,
            children: [],
            series: node.series
        };
    }

    for (let i = 0; i < nodesArray.length; i++) {
        let curr = nodesArray[i];
        if (notRoots.indexOf(curr.name) !== -1) continue;
        while(true) {
            if (notRoots.indexOf(curr.name) !== -1) break;
            if (curr.parent == null)  {
                if (roots.indexOf(curr.name) === -1)
                    roots.push(curr.name);
                break;
            }
            else {
                notRoots.push(curr.name);
                if (hasChildren.indexOf(curr.parent) === -1)
                    hasChildren.push(curr.parent);
                curr = nodesDict[curr.parent];
            }
        }
    }

    for (let node in nodesDict) {
        if (nodesDict.hasOwnProperty(node) && hasChildren.indexOf(node) === -1) {
            youngest.push(node);
        }
    }
    let gen = youngest;
    let visited = [];
    while (gen.length) {
        let prevGen = [];
        for (let i = 0; i < gen.length; i++) {
            let node = nodesDict[gen[i]];
            let parent = nodesDict[node.parent];

            if (visited.indexOf(node.name) !== -1 || parent === undefined)
                continue;

            if(parent.parent !== null && prevGen.indexOf(node.parent) === -1)
                prevGen.push(parent.name);

            parent.children.push(node);
            visited.push(node.name);
        }
        gen = prevGen;
    }

    for (let root of roots) {
        trees.push(nodesDict[root]);
    }

    return trees;
}

function createRandomBoxPlotData(nodes) {
    function generateRandomValues(n) {
        let result = [];
        let level = Math.random() * 500 + 500;
        for (let i = 0; i < n; i++) {
            if (i >= n - 4)
                result.push(Math.round(level + Math.random() * 500)); // push some possible outliers
            else
                result.push(Math.round(level + Math.random() * 200));
        }
        return result;
    }

    let boxPlotData = [];
    for (let node of nodes) {
        let values = generateRandomValues(20);
        boxPlotData.push({name: node.name, values: values, seriesName: "series " + node.series})
    }
    return boxPlotData;
}

function createRandomLineageScatterPlotData(n) {
    let nodes = [],
        children,
        labels = "ABCDEFGHIJKLMNOPQRSTVWXYZ".split(""),
        gen_labels = [],
        parents = null,
        totalChildren,
    // cumulative probability
        pr = [0.1, 0.3, 0.7, 1.0];

    function getNumberOfChildren(len=1) {
        let result = [];
        for (let j = 0; j < len; j++) {
            let number = Math.random() - len * 0.02 - 1.0 / n;
            for (let i = 0; i < pr.length; i++) {
                if (number <= pr[i]) {
                    result.push(i);
                    break;
                }
            }
        }
        if (!result.reduce((a, b) => { return a + b }, 0))
            result = getNumberOfChildren(len);
        return result;
    }

    for (let i = 0, gen = 1; i < n; i+=totalChildren, gen++) {
        gen_labels[gen - 1] = 0;
        children = getNumberOfChildren(parents ? parents.length : 1);
        totalChildren = children.reduce((a, b) => { return a + b }, 0);
        let p = 0,
            cumSum = children[0],
            _parents = [];

        for (let j = 0; j < totalChildren; j++) {
            let parent = parents ? parents[p] : null,
                node = {
                name: "node_" + gen + labels[gen_labels[gen - 1]++],
                x: gen-1,
                y: gen,
                parent: parent,
                series: 10 + Math.floor(Math.random() * 4)//i == 0 ? j : nodes.filter((d) => d.name == parent)[0].series
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

    return nodes;
}

function createRandomLineageScatterPlotData2(totalNodes, n) {
    let nodes = [],
        children,
        labels = "ABCDEFGHIJKLMNOPQRSTVWXYZ".split(""),
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
                    node = {
                        name: "node_" + gen + labels[gen_labels[gen - 1]++],
                        x: gen-1,
                        y: (s * 10 + gen + j) * rn,
                        z: Math.random() > 0.7 ? undefined : Math.round(Math.random() * 100) / 10,
                        parent: parent,
                        series: 10 + Math.floor(Math.random() * 4),
                        type: Math.random() > 0.5 ? "type1" : "type2"
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


let data = {
    data: nodesArr,
    layout: {
        xAxis: {
            format: ".3s"
        },
        yAxis: {
            format: ".3s"
        },
        nodeTypes: {
            "type1": {
                r: 4,
                "stroke-width": 3
            },
            "type2": {
                r: 6,
                "stroke-width": 1
            }
        },
        labelCollisionDetection: {
            enabled: "onDelay",
            updateDelay: 500
        },
        groupSelection: {
            enabled: true
        },
        heatmap: {
            enabled: false,
            title: "z values",
            colourBar: {height: "90%"}
        },
        legend: {
            show: true,
            position: {
                "x": "right",
                "y": "center"
            },
            anchor: {
                "x": "outside",
                "y": "inside"
            },
            orientation: "vertical"
        }
    }
};

let data2 = {
    data: nodesArr,
    layout: {
        nodeTypes: {
            "type1": {
                r: 4,
                "stroke-width": 3
            },
            "type2": {
                r: 6,
                "stroke-width": 1
            }
        },
        axis: {
            show: true,
            gridOnly: true,
            valueProperty: "default"
        },
        labelCollisionDetection: {
            enabled: "onDelay",
            updateDelay: 500
        },
        //groupSelection: {
        //    enabled: true
        //},
        heatmap: {
            enabled: true,
            title: "z values",
            colourBar: {
                show: true
            }
        },
        legend: {
            show: true,
            position: {
                "x": "right",
                "y": "center"
            },
            anchor: {
                "x": "outside",
                "y": "inside"
            },
            orientation: "vertical"
        }
    }
};

let data5 = {
    data: nodesArr,
    layout: {
        xAxis:{title:"x Values"},
        yAxis:{title:"y Values"},
        nodeTypes: {
            "type1": {
                r: 4,
                "stroke-width": 3
            },
            "type2": {
                r: 6,
                "stroke-width": 1
            }
        },
        axis: {
            gridOnly: true,
            valueProperty: "default"
        },
        labelCollisionDetection: {
            enabled: "onDelay",
            updateDelay: 500
        },
        groupSelection: {
            enabled: true
        },
        heatmap: {
            enabled: true,
            title: "z values",
            colourBar: {
                show: true
            }
        },
        legend: {
            show: true,
            position: {
                "x": "center",
                "y": "top"
            },
            anchor: {
                "x": "inside",
                "y": "outside"
            },
            orientation: "horizontal"
        }
    }
};

let data3 = {
    data: createRandomBoxPlotData(nodesArr)
};

let data4 = {
    "series": [
        {
            name: "series 1",
            values: []
        },
        {
            name: "series 2",
            values: []
        },
        {
            name: "series 3",
            values: []
        },
        {
            name: "series 4",
            values: []
        }
    ]
};

//new Date(2015, 9, 9, 9 + Math.floor(i / 60), i % 60, 0)
let data_points = 50;
for (let s = 0; s < data4.series.length; s++) {
    let series = data4.series[s];
    let level = 10 * Math.random() + 5;
    for (let i = 0; i < data_points; i++) {
        series.values.push([i, 2*Math.sin(i/(8-s)) + level]);
    }
}

let phylo = JSON.parse('{"data":[{"taxon":null,"length":null,"children":[{"taxon":null,"length":1.375,"children":[{"taxon":{"name":"H1","z":1,"parent":null,"series":0,"type":"pool"},"length":1,"children":[]},{"taxon":null,"length":0,"children":[{"taxon":{"name":"H2","parent":null,"z":2,"series":0,"type":"pool"},"length":1,"children":[]},{"taxon":null,"length":0,"children":[{"taxon":{"name":"H3","z":null,"parent":null,"series":1,"type":"pool"},"length":1,"children":[]},{"taxon":null,"length":1,"children":[{"taxon":{"name":"H4","parent":null,"z":4,"series":0,"type":"pool"},"length":0,"children":[]},{"taxon":{"name":"H55","parent":null,"z":3.2,"series":1,"type":"pool"},"length":0,"children":[]}]}]}]}]},{"taxon":null,"length":1.375,"children":[{"taxon":null,"length":2.75,"children":[{"taxon":null,"length":0.5833333333333334,"children":[{"taxon":{"name":"H5","series":1,"z":0,"type":"pool"},"length":0.2857142857142857,"children":[]},{"taxon":{"name":"H6","z":null,"parent":null,"series":0,"type":"pool"},"length":1.7142857142857144,"children":[]}]},{"taxon":{"name":"H8","z":null,"parent":null,"series":0,"type":"pool"},"length":0.41666666666666663,"children":[]}]},{"taxon":{"name":"H7","z":null,"parent":null,"series":0,"type":"pool"},"length":0.25,"children":[]}]}]}],"layout":{"nodeTypes":{"strain":{"r":4,"strokeWidth":3},"pool":{"r":6,"strokeWidth":1}},"groupSelection":{"enabled":true,"selectionRectangle":{"stroke-width":1,"stroke-dasharray":4,"rx":3,"ry":3,"stroke":"steelblue"}},"labelCollisionDetection":{"enabled":"onDelay","updateDelay":500},"showLeafNodes":true,"axis":{"title":"","show":true,"gridOnly":false,"valueProperty":"default"},"nodeLabel":{"font-size":12},"heatmap":{"enabled":true,"title":null,"colourScale":[[0,"#008ae5"],[1,"yellow"]],"colourBar":{"show":true},"circle":{"r":16},"opacity":0.4}}}');
phylo.data.push(JSON.parse(JSON.stringify(phylo.data[0])));
var dat = {"taxon":null,"length":null,"children":[{"taxon":{"name":"H1","z":1,"parent":null,"series":0,"type":"pool"},"length":1,"children":[]},{"taxon":null,"length":0.4,"children":[{"taxon":{"name":"H2","parent":null,"z":2,"series":0,"type":"pool"},"length":1,"children":[]},{"taxon":{"name":"H4","parent":null,"z":2,"series":1,"type":"pool"},"length":0.3,"children":[]}]}]};
phylo.data.push(dat);
phylo.layout.heatmap.title = "z values";
phylo.layout.legend = {
    show: true,
    position: {
        "x": "center",
        "y": "top"
    },
    anchor: {
        "x": "inside",
        "y": "outside"
    },
    orientation: "horizontal"
};

class AppController {
    constructor($scope, $http) {
        $scope.buttonText = 'It works!';

        $scope.selectedNodes = [];

        $http.get('sample.json').then((response) => {
            $scope.treeData = data;
            $scope.treeData2 = data2;
        });

        $scope.radialPlotData = data5;
        $scope.boxPlotData = data3;
        $scope.violinPlotData = data3;
        $scope.timeData = data4;
        $scope.showBranchLengths = true;
        $scope.phyloData = phylo;

        $scope.nodeClick = function($event, $node) {
            console.log($event, $node);
        }

    }
}

const App = angular.module('Visualizer', ["ancestry", "ngMaterial"])
    .controller('AppController', AppController);

angular.element(document).ready(function () {
    return angular.bootstrap(document, [App.name], {
        strictDi: false
    });
});