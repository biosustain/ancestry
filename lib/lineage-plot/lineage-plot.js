import './lineage-plot.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import { d3tooltip, mergeTemplateLayout, createNodeTypes, labelCollisionDetection, createTreeLayout, spreadGenerations,
    createDynamicNodeAttr, scaleProperties, getNodeLabelBBox, drawColourBar, calcColourBarSize } from '../shared-features.js'

function LineagePlotDirective($window, WindowResize, $location) {
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
                selectedNodes = null,
                LCD = null, // label collision detection
                lastLCDUpdateTime = 0,
                LCDUpdateID,
                heatmapColourScale = null,
                heatmapCircle = null;

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();
                selectedNodes = new Set();

                if (!scope.value || !scope.value.data.length) return;

                let treeData = scope.value.data,
                    layout = mergeTemplateLayout(scope.value.layout, layoutTemplate);
                // do not continue rendering if there is no data

                let initialLabelPosition = labelPositions[0];

                let virtualRootNode = {name: "virtualRoot", children: [], parent: null};

                let allTrees = createTreeLayout(treeData),
                    root = virtualRootNode;

                virtualRootNode.children = allTrees.map(node => {
                    node.parent = "virtualRoot";
                    return node;
                });

                if (layout.axis.valueProperty === "default") {
                    spreadGenerations(root);
                }

                let types = createNodeTypes(treeData, layout.nodeTypes, defaultNode),
                    nodeAttr = createDynamicNodeAttr(types, Object.keys(defaultNode));

                // FIXME: time plotting not implemented / checked yet
                let isTimePlot = false;//trees[0].generation instanceof Date;


                let elementWidth = d3.select(element[0]).node().offsetWidth;

                let margin = {top: 50, right: 30, bottom: 50, left: 30},
                    width = elementWidth - margin.right - margin.left,
                    height = 600 - margin.top - margin.bottom;

                if (layout.heatmap.enabled && layout.heatmap.colourBar.show) width -= 90;

                // diagonal generator
                let diagonal = d3.svg.diagonal()
                    .target(d => {return {x: d.target.y, y: d.target.x}})
                    .source(d => {return {x: d.source.y, y: d.source.x}})
                    .projection(d => [d.y, d.x]);

                let treeLayout = d3.layout.tree().size([height, width]),
                    nodes = treeLayout.nodes(root).reverse(),
                    links = treeLayout.links(nodes),
                    generationExtent = d3.extent(nodes, node => node.generation);

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
                    .scaleExtent([1, layout.maxZoom])
                    //.x(xScale) // TODO: can be reworked when xExtent is implemented in d3.js
                    .on("zoom", zoomed);

                if (!layout.title) margin.top = 25;
                if (!layout.axis.title) margin.bottom = 25;

                let defs = svg.append("defs");

                let clip = defs.append("svg:clipPath")
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
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)
                    .call(zoom)
                    .on("dblclick.zoom", onDoubleClick);

                if (layout.heatmap.enabled) {

                    let domain = d3.extent(treeData, node => node.z);

                    if (domain[0] == domain[1]) {
                        if (domain[0] === undefined) {
                            domain[0] = domain[1] = 0;
                        }
                        domain[0] -= 0.5;
                        domain[1] += 0.5;
                    }

                    heatmapColourScale = d3.scale.linear()
                        .domain(domain)
                        .range(layout.heatmap.colourScale.map(v => v[1]));

                    if (layout.heatmap.colourBar.show) {console.log(layout.heatmap.colourBar.height);
                        layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, height);
                        layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, width);
console.log(layout.heatmap.colourBar.height);
                        let colourbar = chart.append("g")
                            .attr("class", "plotify-colourbar")
                            .attr("transform", `translate(${width + 20},${(height - layout.heatmap.colourBar.height)/2})`);

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, $location.path());
                    }
                }

                // Define x axis and grid
                let xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .innerTickSize(-height);

                // Calculate depth positions.
                nodes.forEach(node => {
                    node.y = node.x;
                    node.x = xScale(node.generation);
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
                    chart.selectAll("g.x-axis path.domain, g.x-axis g.tick text, text.axis-title").style("opacity", 1e-6);
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
                    .attr("clip-path", `url(${$location.path()}#lineage-clip-rect)`)
                    .append("g")
                    .attr("id", "trees-containter");
                //.call(zoom)

                if (layout.heatmap.enabled) {
                    heatmapCircle = treesContainer.append("g")
                        .attr("class", "heatmap-layer")
                        .selectAll("circle.heatmap-circle")
                        .data(nodes.filter(n => n.name != "virtualRoot" && !isNaN(parseFloat(n.z))))
                        .enter()
                        .append("circle")
                        .attr("class", "heatmap-circle")
                        .style("fill", d => heatmapColourScale(d.z))
                        .style("opacity", layout.heatmap.opacity)
                        .attr(layout.heatmap.circle)
                        .attr("transform", d => `translate(${d.x},${d.y})`);
                }

                // Declare the nodes
                let node = treesContainer.selectAll("g.node")
                    .data(nodes.filter(n => n.name != "virtualRoot"));

                // Enter the nodes.
                let nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .classed("selected", (d) => selectedNodes.has(d.name))
                    .attr("transform", d => `translate(${d.x},${d.y})`);

                // Add node circles
                let circle = nodeEnter.append("circle")
                    .attr("class", "node-circle")
                    .attr(nodeAttr)
                    .style("fill", d => !selectedNodes.has(d.name) ? '#FFF' : colours[d.treeId])
                    .style("stroke", d => colours[d.treeId])
                    .each(function(d) {
                        d.bboxCircle = this.getBoundingClientRect();
                    })
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
                let label = nodeEnter.append("text")
                    .attr("class", "node-label")
                    .attr("dy", ".35em")
                    .attr(layout.nodeLabel)
                    .attr(initialLabelPosition)
                    .text(d => d.name)
                    .style("opacity", 1)
                    .each(getNodeLabelBBox)
                    .each(d => d.labelPos = initialLabelPosition);

                let maxNodeLabelLength = d3.max(label.data().map(d => d.bboxLabel.width)),
                    searchRadius = 2 * maxNodeLabelLength + 10;

                if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" ||
                    layout.labelCollisionDetection.enabled === "onDelay") {
                    LCD = new labelCollisionDetection(nodes.slice(0, -1), labelPositions, layout.nodeLabel, (x) => x, (y) => y,
                        width, height, searchRadius);
                    LCD.initializeLabelPositions(label);
                }

                // Declare the links
                let link = treesContainer.selectAll("path.link")
                    .data(links.filter(l => l.source.name != "virtualRoot"));

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
                        n.select("circle.node-circle").style("fill", d => colours[d.treeId]);
                    }
                    else {
                        n.classed("selected", false);
                        n.select("circle.node-circle").style("fill", "#FFF");
                    }
                    updateSelection();
                }

                function mouseUp(pos) {
                    if (!isDrag || !mouseStart) return;

                    let p = arguments.length == 1 ? pos : d3.mouse(this);
                    if (!selectPoints(selectionRect) && mouseStart[0] != p[0] && mouseStart[1] != p[1]) {
                        node.classed("selected", false).selectAll("circle.node-circle").style("fill", "#FFF");
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

                    node.each(function (d, i) {
                        let n = d3.select(this);
                        let t = d3.transform(n.attr("transform")),
                            tx = t.translate[0],
                            ty = t.translate[1];

                        if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                            n.classed("selected", true);
                            n.select("circle.node-circle").style("fill", d => colours[d.treeId]);
                            any = true;
                        }
                        else if(!selectedNodes.has(d.name)) {
                            n.classed("selected", false);
                            n.select("circle.node-circle").style("fill", "#FFF");
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
                        s = zoom.scale(),
                        now = performance.now();
                    if (s == scale && t[0] == translate[0] && t[1] == translate[1]) return;
                    scale = s;
                    translate = t;
                    translate[0] = translate[0].clamp((1 - scale) * width, 0);
                    translate[1] = translate[1].clamp((1 - scale) * height, 0);
                    zoom.translate(translate);
                    xScale.domain(xScale0.range().map(x => (x - translate[0]) / scale).map(xScale0.invert));
                    applyZoom();
                    if (layout.labelCollisionDetection.enabled === "onEveryChange"){
                        LCD.recalculateLabelPositions(label, scale);
                    }
                    else if (layout.labelCollisionDetection.enabled === "onDelay") {
                        window.clearTimeout(LCDUpdateID);
                        LCDUpdateID = window.setTimeout(() => {
                            LCD.recalculateLabelPositions(label, scale);
                        }, layout.labelCollisionDetection.updateDelay);
                        lastLCDUpdateTime = now;
                    }
                }

                function applyZoom() {
                    treesContainer.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                    mouseCaptureGroup.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                    xAxis.ticks(xScale.domain().reduce((a, b) => b - a));
                    svg.select(".x-axis.axis").call(xAxis);
                    if (layout.axis.gridOnly) {
                        chart.selectAll("g.x-axis g.tick text").style("opacity", 1e-6);
                    }
                    svg.selectAll(".node circle.node-circle")
                        .attr(scaleProperties(nodeAttr, scale, true))
                        .each(function (d) {
                            d.bboxCircle = this.getBoundingClientRect();
                        });
                    if (layout.heatmap.enabled) {
                        heatmapCircle.attr(scaleProperties(layout.heatmap.circle, scale));
                    }
                    svg.selectAll("path.link").attr(scaleProperties(layout.link, scale));
                    if (layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay" ||
                        layout.labelCollisionDetection.enabled === "never") {
                        label.each(function(d) {
                            let self = d3.select(this);
                            self.attr(scaleProperties(layout.nodeLabel, scale))
                                .attr(scaleProperties(d.labelPos, scale));
                        });
                    }

                    if (layout.groupSelection.enabled) {
                        selectionRect.attr(scaleProperties(layout.groupSelection.selectionRectangle, scale));
                    }
                }

                function onDoubleClick() {
                    let now = performance.now();
                    scale = 1;
                    translate = [0, 0];
                    zoom.scale(1);
                    xScale.domain(xScale0.domain());
                    applyZoom();
                    if (layout.labelCollisionDetection.enabled === "onEveryChange"){
                        LCD.recalculateLabelPositions(label, scale);
                    }
                    else if (layout.labelCollisionDetection.enabled === "onDelay") {
                        window.clearTimeout(LCDUpdateID);
                        LCDUpdateID = window.setTimeout(() => {
                            LCD.recalculateLabelPositions(label, scale);
                        }, layout.labelCollisionDetection.updateDelay);
                        lastLCDUpdateTime = now;
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
    labelCollisionDetection: {
        enabled: false,
        updateDelay: 500
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
    },
    maxZoom: 10,
    heatmap: {
        enabled: false,
        colourScale: [
            [0, '#008ae5'],
            [1, 'yellow']
        ],
        colourBar: {
            show: true,
            height: "90%",
            width: 30
        },
        circle: {
            r: 16
        },
        opacity: 0.4
    }
};

let labelPositions = [
    {
        x: 10,
        y: 0,
        "text-anchor": "start"
    },
    {
        x: -10,
        y: 0,
        "text-anchor": "end"
    }
];

export default angular.module('plotify.lineage', ['plotify.utils'])
    .directive('lineagePlot', LineagePlotDirective);