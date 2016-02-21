import './lineage-plot.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import { d3tooltip, mergeTemplateLayout, createNodeTypes, createTreeLayout, spreadGenerations } from '../shared-features.js'

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
                tooltip = new d3tooltip(d3.select(element[0])),
                defaultNode = {
                    r: 4,
                    strokeWidth: 2
                },
                linkStrokeWidth = 1,
                labelFontSize = 12,
                selectionRectRxy = 3,
                selectionRectStrokeWidth = 2,
                scale = 1,
                translate = [0, 0];

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

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

                console.log(trees);
                if (layout.axis.valueProperty === "default") {
                    for (let tree of trees) {
                        spreadGenerations(tree);
                    }
                }

                let types = createNodeTypes(treeData, layout.nodeTypes, defaultNode);

                // FIXME: time plotting not implemented / checked yet
                let isTimePlot = false;//trees[0].generation instanceof Date;


                let elementWidth = d3.select(element[0]).node().offsetWidth;

                let margin = {top: 40, right: 70, bottom: 50, left: 70},
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
                    //.x(xScale)
                    .on("zoom", zoomed);

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

                let mouseCaptureGroup = chart.append("g");

                let mouseRect = mouseCaptureGroup.append("rect")
                    .attr("id", "mouse-capture")
                    .attr("x", -margin.left)
                    .attr("y", -margin.top)
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .style("fill", "transparent");

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
                        .text(treeData.title);
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
                    .classed("selected", (d) => {
                        return scope.selected.indexOf(d.name) !== -1;
                    })
                    .attr("transform", d => `translate(${d.y},${d.x})`);

                // Add node circles
                nodeEnter.append("circle")
                    .attr("r", d => types[d.type].r)
                    .style("fill", d => {
                        if (scope.selected.indexOf(d.name) !== -1)
                            return colours[d.treeId];
                        else
                            return "#FFF";
                    })
                    .style("stroke", d => colours[d.treeId])
                    .attr("stroke-width", d =>types[d.type].strokeWidth)
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
                    .attr("font-size", labelFontSize)
                    .attr("x", d => d.children ? -13 : 13)
                    .attr("dy", ".35em")
                    .attr("text-anchor", d => d.children ? "end" : "start")
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
                    .attr("stroke-width", linkStrokeWidth);
                //.attr("d", conn => {
                //    let connNodes = [conn.source, conn.target];
                //    return lineStepBefore(connNodes);
                //});

                mouseRect.on("mousedown", mouseDown)
                    .on("mousemove", mouseMove)
                    .on("mouseup", mouseUp)
                    .on("mouseout", mouseOut);

                function mouseDown() {

                    if (!d3.event.ctrlKey) return;
                    d3.event.preventDefault();
                    isDrag = true;
                    let p = d3.mouse(this); console.log(p);
                    mouseStart = p;
                    mouseCaptureGroup.select(".selection-rect").remove();
                    mouseCaptureGroup.append("rect")
                        .attr({
                            rx: selectionRectRxy,
                            ry: selectionRectRxy,
                            "class": "selection-rect",
                            x: p[0],
                            y: p[1],
                            width: 0,
                            height: 0,
                            "stroke-width": selectionRectStrokeWidth
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

                    let s = mouseCaptureGroup.select(".selection-rect"),
                        p = d3.mouse(this);
                    if (mouseStart === null) return;
                    if (!selectPoints(s) && mouseStart[0] != p[0] && mouseStart[1] != p[1])
                        node.each(function () {
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
                    let p = d3.mouse(this);
                    if (!(p[0] >= -margin.left && p[0] <= width + margin.right &&
                        p[1] >= -margin.top && p[1] <= height + margin.bottom)) {

                        mouseCaptureGroup.select(".selection-rect").remove();
                        updateSelection();
                        mouseStart = null;
                    }

                }

                function mouseMove() {
                    let s = mouseCaptureGroup.select("rect.selection-rect");
                    if (!s.empty()) {
                        let p = d3.mouse(this),
                            d = {
                                x: (p[0] < mouseStart[0] ? p[0] : mouseStart[0]),
                                y: (p[1] < mouseStart[1] ? p[1] : mouseStart[1]),
                                height: Math.abs(p[1] - mouseStart[1]),
                                width: Math.abs(p[0] - mouseStart[0]),
                                "stroke-width": selectionRectStrokeWidth / scale,
                                "rx": selectionRectRxy / scale,
                                "ry": selectionRectRxy / scale
                            };
                        s.node().style["stroke-dasharray"] = (4 / scale) + "px";
                        s.attr(d);
                        selectPoints(s);
                    }
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
                        else if (scope.selected.indexOf(d.name) === -1) {
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
                        }
                    });

                    return any;
                }

                function updateSelection() {
                    let selectedNodes = [];

                    svg.selectAll("g.node.selected").each(function (d, i) {
                        selectedNodes.push(d.name);
                    });

                    let wasChange = selectedNodes.length !== scope.selected.length ||
                        selectedNodes.some(function (d) {
                            return scope.selected.indexOf(d) === -1
                        });

                    if (wasChange) {
                        //scope.selected.push("node2");
                        scope.selected = selectedNodes;
                        scope.$apply();
                    }
                }

                function zoomed() {
                    if (d3.event.sourceEvent.ctrlKey) {
                        zoom.translate(translate);
                        zoom.translate(translate);
                        return;
                    }
                    scale = zoom.scale();
                    translate = d3.event.translate;
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
                    svg.selectAll(".node circle").attr("r", d => types[d.type].r / scale);
                    svg.selectAll(".node circle").attr("stroke-width", d => types[d.type].strokeWidth / scale);
                    svg.selectAll("path.link").attr("stroke-width", linkStrokeWidth / scale);
                    svg.selectAll(".node text")
                        .attr("font-size", labelFontSize / scale)
                        .attr("x", d => d.children ? -13 / scale : 13 / scale);
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
    nodeTypes: {}
};

export default angular.module('plotify.lineage', ['plotify.utils'])
    .directive('lineagePlot', LineagePlotDirective);