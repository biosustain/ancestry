import './lineage-plot.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import { d3tooltip } from '../shared-features.js'

function LineagePlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            selected: '='
        },
        link(scope, element, attributes) {

            element.addClass("plotify plotify-lineage-plot");

            let svg = d3.select(element[0])
                .append("svg")
                .style('width', '100%');

            let maxAllowedDepth = 180,
                mouseStart = null,
                colours = d3.scale.category10().range(),
                isDrag = false,
                tooltip = new d3tooltip(d3.select(element[0]));

            function render(options) {

                // do not continue rendering if there is no data
                if (!scope.value) return;

                let treeData = scope.value;
                treeData.trees = createTreeLayout(treeData.nodes);

                // FIXME: time plotting not implemented / checked yet
                let isTimePlot = treeData.trees[0].generation instanceof Date;
                
                // clean svg before rendering plot
                svg.selectAll('*').remove();

                let elementWidth = d3.select(element[0]).node().offsetWidth;

                let margin = {top: 40, right: 70, bottom: 50, left: 70},
                    width = elementWidth - margin.right - margin.left,
                    height = 600 - margin.top - margin.bottom;

                let nodesInGenerations = [],
                    maxNodesInGeneration = [];

                // calculate maximum number of nodes in any generation for each tree
                for (let tree of treeData.trees) {

                    let tempLayout = d3.layout.tree().size([height, width]),
                        nodes = tempLayout.nodes(tree),
                        counts = {};

                    for (let node of nodes) {
                        if (counts[node.generation]) {
                            counts[node.generation]++;
                        }
                        else {
                            counts[node.generation] = 1;
                        }
                    }
                    nodesInGenerations.push(counts);
                    maxNodesInGeneration.push(d3.max(Object.keys(counts).map(k => counts[k])));
                }

                // calculate cumulative offset of consecutive trees
                let totalMaxNodes = maxNodesInGeneration.reduce((a, b) => a+b, 0);
                let heights = maxNodesInGeneration.map(n => (n / totalMaxNodes) * height);
                let offsets = heights.reduce(function(r, a) {
                    if (r.length > 0)
                        a += r[r.length - 1];
                    r.push(a);
                    return r;
                }, []);

                offsets.pop();
                offsets.unshift(0);

                // diagonal generator
                let diagonal = d3.svg.diagonal()
                    .projection(d => [d.y, d.x]);

                // optional link step-before generator
                let lineStepBefore = d3.svg.line()
                        .x(node => node.y)
                        .y(node => node.x)
                        .interpolate('step-before');

                // render chart area
                let chart = svg
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .datum(offsets)
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

                let mouseRect = chart.append("rect")
                    .attr("id", "mouse-capture")
                    .attr("x", -margin.left)
                    .attr("y", -margin.top)
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .style("opacity", 0);

                let roots = treeData.trees;

                let treesData = [],
                    generationExtents = [];

                // create tree layouts
                for(let i = 0; i < roots.length; i++) {
                    let treeLayout = d3.layout.tree().size([heights[i], width]), //.nodeSize([15,15])
                        nodes = treeLayout.nodes(roots[i]).reverse(),
                        links = treeLayout.links(nodes);

                    //let indexInGeneration = {};
                    //for (let node of nodes) {
                    //    if (indexInGeneration[node.generation] === undefined)
                    //        indexInGeneration[node.generation] = 0;
                    //    else
                    //        indexInGeneration[node.generation]++;
                    //
                    //    node.x = (nodesInGenerations[i][node.generation] - indexInGeneration[node.generation])
                    //        / (nodesInGenerations[i][node.generation] + 1) * heights[i] - 10 ;
                    //}
                    //console.log(nodes);
                    treesData.push({nodes, links});
                    generationExtents = generationExtents.concat(d3.extent(nodes, node => node.generation));
                }

                // calculate generation extent
                let generationExtent = d3.extent(generationExtents),
                    depth = width / (generationExtent[1] - generationExtent[0]);


                // trim depth if exceeds maximum allowed depth
                if (depth > maxAllowedDepth) {
                    depth = maxAllowedDepth;
                    generationExtent[1] = width / depth;
                }
                // define x scale
                let xScale = (isTimePlot ? d3.time.scale() : d3.scale.linear())
                    .domain(generationExtent)
                    .range([0, width]);

                // Define x axis and grid
                let xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .innerTickSize(-height);

                // Calculate depth positions.
                treesData.forEach(tree => { tree.nodes.forEach(node => { node.y = node.generation * depth}) });

                 //render x axis
                let xAxisSVG = chart.append("g")
                    .attr("class", "axis x-axis")
                    .attr("transform", `translate(0, ${height})`)
                    .call(xAxis);

                // render chart title
                if (treeData.title) {
                    chart.append("text")
                        .attr("x", (width / 2))
                        .attr("y", 0 - (margin.top / 2))
                        .attr("text-anchor", "middle")
                        .style("font-size", "20px")
                        .text(treeData.title);
                }

                // render x axis label if exists
                if (treeData.axis.title) {
                    chart.append("text")             // text label for the x axis
                        .style("text-anchor", "middle")
                        .text(treeData.axis.title)
                        .attr("transform", `translate(${width/2}, ${height + 50})`);
                }

                // add plotting areas for each separate tree
                let treeArea = chart.append("g")
                    .attr("id", "trees-containter")
                    .selectAll("g.tree-area")
                    .data(treesData)
                    .enter()
                    .append("g")
                    .attr("class", "tree-area")
                    .attr("transform", (d,i) => `translate(0, ${offsets[i]})`);

                // Declare the nodes
                let node = treeArea.selectAll("g.node")
                    .data(d => d.nodes);

                // Enter the nodes.
                let nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .classed("selected", (d) => {
                        return scope.selected.indexOf(d.name) !== -1;
                    })
                    .attr("transform", d => `translate(${d.y},${d.x})`);

                // Add node circles
                nodeEnter.append("circle")
                    .attr("r", 7)
                    .style("fill", d => {
                        if (scope.selected.indexOf(d.name) !== -1)
                            return colours[d.treeId];
                        else
                            return "#FFF";
                    })
                    .style("stroke", d => colours[d.treeId])
                    .on("click", click)
                    .on("mouseup", mouseUp)
                    .on("mouseover", function(d, i) {
                        let groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = `<div class="tooltip-colour-box" style=\"background-color: ${colours[d.treeId]}\"></div>` +
                                `<span class="tooltip-text">${d.name}</span>`;
                        tooltip.html(text).position([xPos, yPos]).show();
                    })
                    .on("mouseout", (d) => {
                        tooltip.hide();
                    });

                // Add node labels
                nodeEnter.append("text")
                    .attr("x", d => d.children ? -13 : 13)
                    .attr("dy", ".35em")
                    .attr("text-anchor", d => d.children ? "end" : "start")
                    .text(d => d.name)
                    .style("fill-opacity", 1);

                // Declare the links
                let link = treeArea.selectAll("path.link")
                    .data(d => d.links);

                // Enter the links.
                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", diagonal);
                    //.attr("d", conn => {
                    //    let connNodes = [conn.source, conn.target];
                    //    return lineStepBefore(connNodes);
                    //});

                mouseRect.on( "mousedown", mouseDown)
                .on( "mousemove", mouseMove)
                .on( "mouseup", mouseUp)
                .on( "mouseout", mouseOut);

                function mouseDown() {
                    d3.event.preventDefault();
                    isDrag = true;
                    let p = d3.mouse( this);
                    mouseStart = p;
                    chart.select( ".selection-rect").remove();
                    chart.append( "rect")
                        .attr({
                            rx      : 3,
                            ry      : 3,
                            class   : "selection-rect",
                            x       : p[0],
                            y       : p[1],
                            width   : 0,
                            height  : 0
                        });
                }

                function click() {
                    d3.event.preventDefault();
                    let n = d3.select(this.parentNode);
                    if (!n.classed("selected")) {
                        n.classed("selected", true);
                        n.select("circle").style("fill", d => colours[d.treeId]);
                    }
                    else {
                        n.classed("selected", false);
                        n.select("circle").style("fill", "#FFF");
                    }
                    updateSelection();
                }

                function mouseUp() {

                    if (!isDrag) return;

                    let s = chart.select( ".selection-rect"),
                        p = d3.mouse( this);
                    if (mouseStart === null) return;
                    if (!selectPoints(s) && mouseStart[0] != p[0] && mouseStart[1] != p[1])
                        node.each(function() {
                            let n = d3.select(this);
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
                        });
                    s.remove();
                    updateSelection();
                    mouseStart = null;
                    isDrag = false;
                }

                function mouseOut() {
                    let p = d3.mouse( this);
                    if(!(p[0] >= -margin.left && p[0] <= width + margin.right &&
                        p[1] >= -margin.top && p[1] <= height + margin.bottom)) {

                        chart.select(".selection-rect").remove();
                        updateSelection();
                        mouseStart = null;
                    }

                }

                function mouseMove() {
                    let s = chart.select( "rect.selection-rect");
                    if( !s.empty()) {
                        let p = d3.mouse( this),

                            d = {
                                x       : +s.attr( "x"),
                                y       : +s.attr( "y"),
                                width   : +s.attr( "width"),
                                height  : +s.attr( "height")
                            },
                            move = {
                                x : p[0] - d.x,
                                y : p[1] - d.y
                            }
                            ;

                        if( move.x < 1 || (move.x*2<d.width)) {
                            d.x = p[0];
                            d.width -= move.x;
                        } else {
                            d.width = move.x;
                        }

                        if( move.y < 1 || (move.y*2<d.height)) {
                            d.y = p[1];
                            d.height -= move.y;
                        } else {
                            d.height = move.y;
                        }

                        s.attr( d);
                        selectPoints(s);
                    }
                }

                function selectPoints(rect) {
                    let rect_x1 = +rect.attr("x"),
                        rect_y1 = +rect.attr("y"),
                        rect_x2 = +rect.attr("width") + rect_x1,
                        rect_y2 = +rect.attr("height") + rect_y1,
                        any = false;

                    node.each(function(d, i, j) {
                        let n = d3.select(this);
                        let t = d3.transform(n.attr("transform")),
                            tx = t.translate[0],
                            ty = t.translate[1] + offsets[j];

                        if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                            n.classed("selected", true);
                            n.select("circle").style("fill", d => colours[d.treeId]);
                            any = true;
                        }
                        else if(scope.selected.indexOf(d.name) === -1) {
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
                        }
                    });

                    return any;
                }

                function updateSelection() {
                    let selectedNodes = [];

                    svg.selectAll("g.node.selected").each(function(d, i) {
                        selectedNodes.push(d.name);
                    });

                    let wasChange = selectedNodes.length !== scope.selected.length ||
                        selectedNodes.some(function(d) { return scope.selected.indexOf(d) === -1 });

                    if (wasChange){
                        //scope.selected.push("node2");
                        scope.selected = selectedNodes;
                        scope.$apply();
                    }
                }
            }
            // Handle window resize event.
            scope.$on('window-resize', (event) => {
                render(scope.value);
            });

            scope.$watch("value", () => {
                render(scope.value);
            });
        }
    }
}

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};


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

export default angular.module('plotify.lineage', ['plotify.utils'])
    .directive('lineagePlot', LineagePlotDirective);