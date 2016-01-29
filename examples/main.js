import angular from 'angular';
import "angular-material";
import "../lib/index.js";

let nodesArr = createRandomLineageScatterPlotData2(120, 10);

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
            generation: node.generation,
            children: [],
            treeId: node.treeId
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
        boxPlotData.push({name: node.name, values: values, seriesName: "series " + node.treeId})
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
                generation: gen-1,
                x: gen-1,
                y: gen + j,
                parent: parent,
                treeId: i == 0 ? j : nodes.filter((d) => d.name == parent)[0].treeId
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
                        generation: gen-1,
                        x: gen-1,
                        y: s * 10 + gen + j,
                        parent: parent,
                        treeId: s
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
    nodes: nodesArr/*[
        {
            name: "node1",
            x: 1,
            y: 20
        },
        {
            name: "node2",
            x: 2,
            y: 18
        },
        {
            name: "node3",
            x: 3,
            y: 24
        },
        {
            name: "node4",
            x: 4,
            y: 22
        },
        {
            name: "node5",
            x: 4,
            y: 27
        }
    ]*/,
    links: [
        {
            sourceNode: 0,
            targetNode: 1
        },
        {
            sourceNode: 0,
            targetNode: 3
        },
        {
            sourceNode: 1,
            targetNode: 2
        },
        {
            sourceNode: 3,
            targetNode: 4
        }
    ],
    title: "Chart Title",
    xAxis: {
        title: "xAxisTitle",
        units: null,
        format: null
    },
    yAxis: {
        title: "yAxisTitle",
        units: "yAxisUnits",
        format: null
    }
};

let data2 = {
    nodes: nodesArr,
    title: "Chart Title",
    size: 800,
    margin: 120,
    axis: {
        title: "Generation"
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

class AppController {
    constructor($scope, $http) {
        $scope.buttonText = 'It works!';

        $scope.selectedNodes = [];

        $http.get('sample.json').then((response) => {
            $scope.treeData = data;
            $scope.treeData2 = data2;
        });

        $scope.boxPlotData = data3;
        $scope.violinPlotData = data3;
        $scope.timeData = data4;
    }
}

const App = angular.module('Visualizer', ["plotify", "ngMaterial"])
    .controller('AppController', AppController);

angular.element(document).ready(function () {
    return angular.bootstrap(document, [App.name], {
        strictDi: false
    });
});