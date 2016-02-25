import './lineage-plot.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import { d3tooltip, mergeTemplateLayout, createNodeTypes,
    createTreeLayout, spreadGenerations, createDynamicNodeAttr, scaleProperties } from '../shared-features.js'

function LineagePlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            selectedNodes: '='
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
                selectionRect = null,
                tooltip = new d3tooltip(d3.select(element[0])),
                defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                scale = 1,
                translate = [0, 0],
                selectedNodes = null;

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();
                selectedNodes = new Set();

                if (!scope.value || !scope.value.data.length) return;

                let treeData = scope.value.data,
                    layout = mergeTemplateLayout(scope.value.layout, layoutTemplate);
                // do not continue rendering if there is no data

                let virtualRootNode = {name: "virtualRoot", children: [], parent: null};

                let allTrees = createTreeLayout(treeData),
                    trees = [virtualRootNode];

                virtualRootNode.children = allTrees.map(node => {
                    node.parent = "virtualRoot";
                    return node;
                });

                if (layout.axis.valueProperty === "default") {
                    for (let tree of trees) {
                        spreadGenerations(tree);
                    }
                }

                let types = createNodeTypes(treeData, layout.nodeTypes, defaultNode),
                    nodeAttr = createDynamicNodeAttr(types, Object.keys(defaultNode));

                // FIXME: time plotting not implemented / checked yet
                let isTimePlot = false;//trees[0].generation instanceof Date;


                let elementWidth = d3.select(element[0]).node().offsetWidth;

                let margin = {top: 50, right: 30, bottom: 50, left: 30},
                    width = elementWidth - margin.right - margin.left,
                    height = 600 - margin.top - margin.bottom;

                let nodesInGenerations = [],
                    maxNodesInGeneration = [];

                // calculate maximum number of nodes in any generation for each tree
                for (let tree of trees) {

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
                let totalMaxNodes = maxNodesInGeneration.reduce((a, b) => a + b, 0);
                let heights = maxNodesInGeneration.map(n => (n / totalMaxNodes) * height);
                let offsets = heights.reduce(function (r, a) {
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


                let roots = trees;

                let treesData = [],
                    generationExtents = [];

                // create tree layouts
                for (let i = 0; i < roots.length; i++) {
                    let treeLayout = d3.layout.tree().size([heights[i], width]),
                        nodes = treeLayout.nodes(roots[i]).reverse(),
                        links = treeLayout.links(nodes);

                    treesData.push({nodes, links});
                    generationExtents = generationExtents.concat(d3.extent(nodes, node => node.generation));
                }

                // calculate generation extent
                let generationExtent = d3.extent(generationExtents);
                generationExtent[1] += 1;
                let depth = width / (generationExtent[1] - generationExtent[0]);


                // trim depth if exceeds maximum allowed depth
                if (depth > maxAllowedDepth) {
                    depth = maxAllowedDepth;
                    generationExtent[1] = width / depth;
                }

                // define x scale
                let xScale = (isTimePlot ? d3.time.scale() : d3.scale.linear())
                    .domain(generationExtent)
                    .range([0, width]);

                let xScale0 = xScale.copy();

                let zoom = d3.behavior.zoom()
                    .scaleExtent([1, 10])
                    //.x(xScale) // TODO: can be reworked when xExtent is implemented in d3.js
                    .on("zoom", zoomed);

                if (!layout.title) margin.top = 25;
                if (!layout.axis.title) margin.bottom = 25;

                let clip = svg.append("defs").append("svg:clipPath")
                    .attr("id", "lineage-clip-rect")
                    .append("svg:rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height);

                // render chart area
                let chart = svg
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .datum(offsets)
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)
                    .call(zoom)
                    .on("dblclick.zoom", onDoubleClick);

                // Define x axis and grid
                let xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .innerTickSize(-height);

                // Calculate depth positions.
                treesData.forEach(tree => {
                    tree.nodes.forEach(node => {
                        node.y = xScale(node.generation)
                    })
                });

                //render x axis
                if (layout.axis.show) {
                    chart.append("g")
                        .attr("class", "axis x-axis")
                        .attr("transform", `translate(0, ${height})`)
                        .call(xAxis);
                }

                // render chart title
                if (layout.title) {
                    chart.append("text")
                        .attr("x", (width / 2))
                        .attr("y", 0 - (margin.top / 2))
                        .attr("text-anchor", "middle")
                        .style("font-size", "20px")
                        .text(layout.title);
                }

                // render x axis label if exists
                if (layout.axis.title && layout.axis.show) {
                    chart.append("text")             // text label for the x axis
                        .attr("class", "axis-title")
                        .style("text-anchor", "middle")
                        .text(layout.axis.title)
                        .attr("transform", `translate(${width / 2}, ${height + 50})`);
                }

                if (layout.axis.gridOnly) {
                    chart.selectAll("g.axis path.domain, g.axis g.tick text, text.axis-title").style("opacity", 1e-6);
                }

                let mouseCaptureGroup = chart.append("g");

                let mouseRect = mouseCaptureGroup.append("rect")
                    .attr("id", "mouse-capture")
                    .attr("x", -margin.left)
                    .attr("y", -margin.top)
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .style("fill", "transparent");

                // add plotting areas for each separate tree
                let treesContainer = chart.append("g")
                    .attr("clip-path", "url(#lineage-clip-rect)")
                    .append("g")
                    .attr("id", "trees-containter")
                //.call(zoom)

                let treeArea = treesContainer.selectAll("g.tree-area")
                    .data(treesData)
                    .enter()
                    .append("g")
                    .attr("class", "tree-area")
                    .attr("transform", (d, i) => `translate(0, ${offsets[i]})`);

                // Declare the nodes
                let node = treeArea.selectAll("g.node")
                    .data(d => d.nodes.filter(n => n.name != "virtualRoot"));

                // Enter the nodes.
                let nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .classed("selected", (d) => selectedNodes.has(d.name))
                    .attr("transform", d => `translate(${d.y},${d.x})`);

                // Add node circles
                let circle = nodeEnter.append("circle")
                    .attr(nodeAttr)
                    .style("fill", d => !selectedNodes.has(d.name) ? '#FFF' : colours[d.treeId])
                    .style("stroke", d => colours[d.treeId])
                    .on("click", click)
                    .on("mouseup", mouseUp)
                    .on("mouseover", function (d, i) {
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
                    .attr("class", "node-label")
                    .attr("x", d => d.children ? -13 : 13)
                    .attr("dy", ".35em")
                    .attr("text-anchor", d => d.children ? "end" : "start")
                    .attr(layout.nodeLabel)
                    .text(d => d.name)
                    .style("fill-opacity", 1);

                // Declare the links
                let link = treeArea.selectAll("path.link")
                    .data(d => d.links.filter(l => l.source.name != "virtualRoot"));

                // Enter the links.
                link.enter()
                    .insert("path", "g")
                    .attr("class", "link")
                    .attr("d", diagonal)
                    .attr(layout.link);

                if(layout.groupSelection.enabled) {
                    mouseRect.on("mousedown", mouseDown)
                        .on("mousemove", mouseMove)
                        .on("mouseup", mouseUp)
                        .on("mouseout", mouseOut);

                    selectionRect = mouseCaptureGroup.append("rect")
                        .attr(layout.groupSelection.selectionRectangle)
                        .attr("class", "selection-rect");
                }

                function mouseDown() {
                    if (!d3.event.ctrlKey) return;
                    d3.event.preventDefault();
                    isDrag = true;
                    mouseStart = d3.mouse(this);
                    circle.style("pointer-events", "none");
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

                function mouseUp(pos) {
                    if (!isDrag || !mouseStart) return;

                    let p = arguments.length == 1 ? pos : d3.mouse(this);
                    if (!selectPoints(selectionRect) && mouseStart[0] != p[0] && mouseStart[1] != p[1]) {
                        node.classed("selected", false).selectAll("circle").style("fill", "#FFF");
                    }
                    selectionRect.attr("width", 0);
                    updateSelection();
                    mouseStart = null;
                    isDrag = false;
                    circle.style("pointer-events", "all");
                }

                function mouseOut() {
                    if(!isDrag) return;
                    selectionRect.attr("width", 0);
                    updateSelection();
                    mouseStart = null;
                    isDrag = false;
                    circle.style("pointer-events", "all");
                }

                function mouseMove() {
                    if (!isDrag)
                        return;
                    let p = d3.mouse(this);
                    if (!d3.event.ctrlKey) {
                        mouseUp(p);
                        return;
                    }
                    let d = {
                            x: (p[0] < mouseStart[0] ? p[0] : mouseStart[0]),
                            y: (p[1] < mouseStart[1] ? p[1] : mouseStart[1]),
                            height: Math.abs(p[1] - mouseStart[1]),
                            width: Math.abs(p[0] - mouseStart[0])
                        };
                    selectionRect.attr(d);
                    selectPoints(selectionRect);
                }

                function selectPoints(rect) {
                    let rect_x1 = +rect.attr("x"),
                        rect_y1 = +rect.attr("y"),
                        rect_x2 = +rect.attr("width") + rect_x1,
                        rect_y2 = +rect.attr("height") + rect_y1,
                        any = false;

                    node.each(function (d, i, j) {
                        let n = d3.select(this);
                        let t = d3.transform(n.attr("transform")),
                            tx = t.translate[0],
                            ty = t.translate[1] + offsets[j];

                        if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                            n.classed("selected", true);
                            n.select("circle").style("fill", d => colours[d.treeId]);
                            any = true;
                        }
                    });

                    return any;
                }

                function updateSelection() {
                    let wasChange = false;

                    svg.selectAll("g.node.selected").each(d => {
                        if(!selectedNodes.has(d.name)) {
                            selectedNodes.add(d.name);
                            wasChange = true;
                        }
                    });

                    svg.selectAll("g.node:not(.selected)").each(d => {
                        if(selectedNodes.has(d.name)) {
                            selectedNodes.delete(d.name);
                            wasChange = true;
                        }
                    });

                    if (wasChange && scope.selectedNodes) {
                        scope.selectedNodes = Array.from(selectedNodes);
                        scope.$apply();
                    }
                }

                function zoomed() {
                    if (d3.event.sourceEvent.ctrlKey) {
                        zoom.translate(translate);
                        zoom.scale(scale);
                        return;
                    }

                    let t = zoom.translate(),
                        s = zoom.scale();
                    if (s == scale && t[0] == translate[0] && t[1] == translate[1]) return;
                    scale = s;
                    translate = t;
                    translate[0] = translate[0].clamp((1 - scale) * width, 0);
                    translate[1] = translate[1].clamp((1 - scale) * height, 0);
                    zoom.translate(translate);
                    xScale.domain(xScale0.range().map(x => (x - translate[0]) / scale).map(xScale0.invert));
                    applyZoom();
                }

                function applyZoom() {
                    treesContainer.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                    mouseCaptureGroup.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                    xAxis.ticks(xScale.domain().reduce((a, b) => b - a));
                    svg.select(".x-axis.axis").call(xAxis);
                    if (layout.axis.gridOnly) {
                        chart.selectAll("g.tick text").style("opacity", 1e-6);
                    }
                    svg.selectAll(".node circle").attr(scaleProperties(nodeAttr, scale, true));
                    svg.selectAll("path.link").attr(scaleProperties(layout.link, scale));
                    svg.selectAll(".node text")
                        .attr(scaleProperties(layout.nodeLabel, scale))
                        .attr("x", d => d.children ? -13 / scale : 13 / scale);

                    if (layout.groupSelection.enabled) {
                        selectionRect.attr(scaleProperties(layout.groupSelection.selectionRectangle, scale));
                    }
                }

                function onDoubleClick() {
                    scale = 1;
                    translate = [0, 0];
                    zoom.scale(1);
                    xScale.domain(xScale0.domain());
                    applyZoom();
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

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};

let layoutTemplate = {
    title: "",
    size: 800,
    axis: {
        title: "",
        show: true,
        gridOnly: false,
        valueProperty: "default"
    },
    nodeTypes: {},
    nodeLabel: {
        "font-size": 12
    },
    link: {
        stroke: "#ccc",
        "stroke-width": 1
    },
    groupSelection: {
        enabled: false,
        selectionRectangle: {
            "stroke-width": 1,
            "stroke-dasharray": 4,
            rx: 3,
            ry: 3,
            stroke: "steelblue"
        }
    }
};

export default angular.module('plotify.lineage', ['plotify.utils'])
    .directive('lineagePlot', LineagePlotDirective);