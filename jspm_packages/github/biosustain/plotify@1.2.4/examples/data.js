/**
 * Created by maciej on 10/1/15.
 */
/*let lineageScatterPlotData = {
    nodes: [
        {
            name: "node_1A",
            x: 1,
            y: 20,
            parent: null
        },
        {
            name: "node_2A",
            x: 2,
            y: 18,
            parent: "node_1A"
        },
        {
            name: "node_2B",
            x: 3,
            y: 24,
            parent: "node_1A"
        },
        {
            name: "node_2C",
            x: 4,
            y: 22,
            parent: "node_1A"
        },
        {
            name: "node_3A",
            x: 4,
            y: 27,
            parent: "node_2A"
        },
        {
            name: "node_2A",
            x: 2,
            y: 18,
            parent: "node_1A"
        },
        {
            name: "node_2B",
            x: 3,
            y: 24,
            parent: "node_1A"
        },
        {
            name: "node_2C",
            x: 4,
            y: 22,
            parent: "node_1A"
        },
        {
            name: "node_3A",
            x: 4,
            y: 27,
            parent: "node_2A"
        },
        {
            name: "node_2A",
            x: 2,
            y: 18,
            parent: "node_1A"
        },
        {
            name: "node_2B",
            x: 3,
            y: 24,
            parent: "node_1A"
        },
        {
            name: "node_2C",
            x: 4,
            y: 22,
            parent: "node_1A"
        },
        {
            name: "node_3A",
            x: 4,
            y: 27,
            parent: "node_2A"
        },
        {
            name: "node_2A",
            x: 2,
            y: 18,
            parent: "node_1A"
        },
        {
            name: "node_2B",
            x: 3,
            y: 24,
            parent: "node_1A"
        },
        {
            name: "node_2C",
            x: 4,
            y: 22,
            parent: "node_1A"
        },
        {
            name: "node_3A",
            x: 4,
            y: 27,
            parent: "node_2A"
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
*/

console.log("HJE");


let data = createRandomLineageScatterPlotData(20);
console.log(data);

function createRandomLineageScatterPlotData(n) {
    let nodes = [],
        children,
        labels = "ABCDEFGHIJKLMNOPQRSTVWXYZ".split(""),
        gen_labels = [],
        parents = null,
        totalChildren,
        // cumulative probability
        pr = [0.5, 0.8, 1];

    let getNumberOfChildren = function(len=1) {
        let result = [];
        for (let j = 0; j < len; j++) {
            let number = Math.random();
            for (let i = 0; i < p.length; i++) {
                if (number <= pr[i]) result.push(i + 1);
            }
        }
        return result;
    };

    for (let i = 0, gen = 1; i < n; i+=totalChildren, gen++) {
        console.log(gen);
        gen_labels[gen] = 0;
        children = getNumberOfChildren();
        totalChildren = children.reduce((a, b) => { return a + b }, 0);
        let p = 0,
            cumSum = children[0],
            _parents = [];

        for (let j = 0; j < totalChildren; j++) {
            let node = {
                name: "node_" + gen + labels[gen_labels[gen]++],
                x: gen,
                y: gen + j,
                parent: parents ? parents[p] : null
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
