import './lineage-plot.css!'
import '../utils.js'
import angular from 'angular'
import * as d3 from 'd3'

import { d3legend, d3tooltip, mergeTemplateLayout, createNodeTypes, LabelCollisionDetection, createTreeLayout,
    spreadGenerations, createDynamicNodeAttr, scaleProperties, getNodeLabelBBox, resetNodeLabelBBox, drawColourBar,
    calcColourBarSize, getExtraSpaceForLabel, testLabelLength, multiAttr, getTranslation, createPlotControls} from '../shared-features.js'

function LineagePlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            selectedNodes: '='
        },
        link(scope, element, attributes) {

            element.addClass("ancestry ancestry-lineage-plot");

            let svg = d3.select(element[0])
                .style("position", "relative")
                .append("svg")
                .style('width', '100%');

            let maxAllowedDepth = 180,
                mouseStart = null,
                colours = d3.scaleOrdinal(d3.schemeCategory10),
                selectionRect = null,
                tooltip = new d3tooltip(d3.select(element[0])),
                defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                selectedNodes = null,
                LCD = null, // label collision detection
                lastLCDUpdateTime = 0,
                LCDUpdateID,
                heatmapColourScale = null,
                heatmapCircle = null,
                visibleSeries = new Set();

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                let defs = svg.append("defs");

                selectedNodes = new Set();

                if (!scope.value || !scope.value.data.length) return;

                let seriesNames = Array.from(new Set(scope.value.data.map(d => d.series)));

                if (options.isNewData) {
                    colours.domain([]);
                    visibleSeries = new Set(seriesNames);
                }

                let copy = angular.copy(scope.value),
                    treeData = filterSeries(copy.data, visibleSeries),
                    longestNodeName = treeData.length ? treeData.reduce((a, b) => a.name.length > b.name.length ? a : b).name : "",
                    verticalExtraSpace = 40,
                    layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                    pathname = $window.location.pathname,
                    maxLabelLength = testLabelLength(svg, longestNodeName, layout.nodeLabel),
                    maxLabelOffset = d3.max(labelPositions, (pos) => Math.abs(pos.x)),
                    legendHeight = 0, legendWidth = 0, colourbarHeight = 0, colourbarWidth = 0,
                    legendOut = {top: false, right: false, bottom: false, left: false},
                    lcdEnabled = layout.labelCollisionDetection.enabled != "never",
                    lastTransform = d3.zoomIdentity,
                    showAxisTitle = layout.axis.show && !layout.axis.gridOnly && layout.axis.title,
                    showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
                    colourBarOrigWidth = layout.heatmap.colourBar.width, colourBarOrigHeight = layout.heatmap.colourBar.height,
                    colourBarOffset = layout.heatmap.enabled && layout.heatmap.colourBar.show ? 15 : 0,
                    colourbar = d3.select(),
                    legend = d3.select(),
                    xAxisOffset = 0,
                    titleSVG = d3.select(),
                    axisSVG = d3.select();

                if (layout.legend.show) {
                    if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                    if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                }

                if (maxLabelLength < 40) maxLabelLength = 40;

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

                let margin = layout.margin;

                if (layout.title) margin.top += legendOut.top ? 26 : 25;
                //if (!(layout.legend.position.y == "top" && layout.legend.anchor.y == "outside")) margin.top += 10;
                if (showAxisTitle) margin.bottom += legendOut.bottom ? 16 : 18;

                let width = layout.width || elementWidth,
                    height = layout.height;

                // render chart area
                svg.attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);

                svg.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", "white");

                let chart = svg.append("g");

                if (layout.heatmap.enabled) {

                    let domain = d3.extent(treeData, node => node.z);

                    if (domain[0] == domain[1]) {
                        if (domain[0] === undefined) {
                            domain[0] = domain[1] = 0;
                        }
                        domain[0] -= 0.5;
                        domain[1] += 0.5;
                    }

                    heatmapColourScale = d3.scaleLinear()
                        .domain(domain)
                        .range(layout.heatmap.colourScale.map(v => v[1]));

                    if (layout.heatmap.colourBar.show) {
                        layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
                        layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                        colourbar = chart.append("g")
                            .attr("class", "ancestry-colourbar");

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                        let bbox = colourbar.node().getBoundingClientRect(),
                            pos = layout.heatmap.colourBar.position;
                        colourbarWidth = bbox.width;
                        colourbarHeight = bbox.height;
                        if (pos === "right" || pos === "left")
                            margin.right += colourbarWidth - (showHeatmapTitle ? 1 : 0) + colourBarOffset;
                        //else if (pos === "top" || pos === "bottom")
                        //    margin.top += colourbarHeight;
                    }
                }

                if (layout.legend.show) {
                    let pos = layout.legend.position,
                        anchor = layout.legend.anchor,
                        orientation = layout.legend.orientation;

                    let splitAfter = orientation === "horizontal" ? 0 : 1;

                    let drawLegend = d3legend()
                        .splitAfter(splitAfter)
                        .position(pos)
                        .anchor(anchor)
                        .seriesNames(seriesNames)
                        .colourScale(colours)
                        .maxSize({width, height})
                        .onClick(legendClick)
                        .selectedItems(visibleSeries);

                    legend = chart.append("g")
                        .attr("class", "ancestry-legend")
                        .call(drawLegend);

                    let bbox = legend.node().getBoundingClientRect();
                    legendHeight = bbox.height;
                    legendWidth = bbox.width;

                    if (anchor.x === "outside" && pos.x !== "center") {
                        margin[pos.x] += legendOut.right ? legendWidth - 10 : (legendOut.left ? legendWidth - 11 : legendWidth);
                    }
                    else if (anchor.y === "outside" && pos.y !== "center") {
                        margin[pos.y] += legendOut.bottom ? (layout.axis.show && !layout.axis.gridOnly ? legendHeight - 9 : legendHeight - 12) :
                            (legendOut.top ? legendHeight - 11 : legendHeight);
                    }
                }

                width = (layout.width || elementWidth) - margin.right - margin.left;

                function legendClick(label) {
                    let clicked = d3.select(this);
                    if (visibleSeries.has(label))
                        visibleSeries.delete(label);
                    else
                        visibleSeries.add(label);
                    clicked.classed("legend-item-selected", visibleSeries.has(label));
                    clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                    render({isNewData: false});
                }

                // diagonal generator
                function diagonal(d) {
                    let c = Math.abs(d.parent.x - d.x) / 2;

                    return "M" + d.x + "," + d.y
                        + "C" + (d.parent.x + c) + "," + d.y
                        + " " + (d.parent.x + c) + "," + d.parent.y
                        + " " + d.parent.x + "," + d.parent.y;
                }

                let generationExtent = d3.extent(treeData, node => node.generation),
                    originalExtent = angular.copy(generationExtent);

                generationExtent[1] += 1;
                generationExtent[0] -= 1;
                let depth = width / (generationExtent[1] - generationExtent[0]);
                let spaceRight = 1;
                 //trim depth if exceeds maximum allowed depth
                if (depth > maxAllowedDepth) {
                    depth = maxAllowedDepth;
                    spaceRight = (width / depth) - originalExtent[1];
                    generationExtent[1] = width / depth;
                }

                // define x scale
                let xScale = d3.scaleLinear()
                    .domain(generationExtent)
                    .range([0, width]);


                let labelExtraSpace = getExtraSpaceForLabel(xScale, maxLabelLength + maxLabelOffset + 5),
                    newDomain = angular.copy(xScale.domain());

                if (labelExtraSpace > 1) {
                    newDomain[0] = originalExtent[0] - labelExtraSpace;
                }
                if (labelExtraSpace > spaceRight) {
                    newDomain[1] = originalExtent[1] + labelExtraSpace;
                }

                xScale.domain(newDomain);

                // Define x axis and grid
                let xAxis = d3.axisBottom()
                    .scale(xScale)
                    .tickSizeInner(0)
                    .tickSizeOuter(0);

                //render x axis
                if (layout.axis.show) {
                    axisSVG = chart.append("g")
                        .attr("class", "axis x-axis")
                        .call(xAxis);

                    if (!layout.axis.gridOnly) {
                        xAxisOffset = axisSVG.node().getBBox().height;
                        margin.bottom += xAxisOffset - 3;
                    }

                    xAxis.ticks(Math.ceil(xScale.domain().reduce((a, b) => b - a)));
                }

                height = layout.height - margin.top - margin.bottom;
                xAxis.tickSizeInner(-height);
                axisSVG.attr("transform", `translate(0, ${height})`).call(xAxis);
                axisSVG.selectAll(".tick line").attr("opacity", 0.2).style("shape-rendering", "crispEdges");
                axisSVG.selectAll("path.domain").attr("stroke", "grey");
                axisSVG.selectAll("path.domain").style("shape-rendering", "crispEdges");

                chart.attr("transform", `translate(${margin.left}, ${margin.top})`);

                let treeLayout = d3.tree().size([height - verticalExtraSpace, width]),
                    nodes = treeLayout(d3.hierarchy(root, d => d.children));

                let descendants = nodes.descendants().filter(n => n.parent !== null);
                // Calculate depth positions.
                descendants.forEach(node => {
                    node.y = node.x + verticalExtraSpace / 2;
                    node.x = xScale(node.data.generation);
                });

                let clip = defs.append("svg:clipPath")
                    .attr("id", "lineage-clip-rect")
                    .append("svg:rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height);

                svg.attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);

                // render chart title
                if (layout.title) {
                    titleSVG = chart.append("text")
                        .attr("x", (width / 2))
                        .attr("y", legendOut.top ? -legendHeight : -10)
                        .attr("text-anchor", "middle")
                        .style("font-size", "20px")
                        .text(layout.title);
                }

                // render x axis label if exists
                if (showAxisTitle) {
                    chart.append("text")             // text label for the x axis
                        .attr("class", "axis-title")
                        .style("text-anchor", "middle")
                        .text(layout.axis.title)
                        .attr("transform", `translate(${width / 2}, ${height + xAxisOffset + 15})`);
                }

                if (layout.axis.gridOnly) {
                    chart.selectAll("g.x-axis path.domain, g.x-axis g.tick text").style("opacity", 1e-6);
                }

                if (layout.legend.show) {
                    let pos = layout.legend.position,
                        anchor = layout.legend.anchor,
                        titleOffset = showAxisTitle ? 16 : 0,
                        posX = pos.x === "left" ? 0 : (pos.x === "right" ? width + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2),
                        posY = pos.y === "top" ? 0 : (pos.y === "bottom" ? height - 1 + (anchor.y === "outside" ? xAxisOffset + titleOffset : 0) : height / 2);

                    legend.attr("transform", `translate(${posX},${posY})`);
                }


                if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                    layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
                    layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                    drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                    colourbar.attr("transform", `translate(${width + colourBarOffset},${(height - layout.heatmap.colourBar.height)/2})`);
                }
                // for nicer png downloads
                svg.selectAll(".tick text").attr("font-size", 12);

                let mouseCaptureGroup = chart.append("g");

                let mouseRect = mouseCaptureGroup.append("rect")
                    .attr("id", "mouse-capture")
                    .attr("width", width)
                    .attr("height", height)
                    .style("fill", "transparent");

                let treesContainer = chart.append("g")
                    .attr("clip-path", `url(${pathname}#lineage-clip-rect)`)
                    .append("g")
                    .attr("id", "trees-containter");

                if (layout.heatmap.enabled) {
                    heatmapCircle = treesContainer.append("g")
                        .attr("class", "heatmap-layer")
                        .selectAll("circle.heatmap-circle")
                        .data(descendants.filter(n => !isNaN(parseFloat(n.data.z))))
                        .enter()
                        .append("circle")
                        .attr("class", "heatmap-circle")
                        .style("fill", d => heatmapColourScale(d.data.z))
                        .style("opacity", layout.heatmap.opacity)
                        .attr("transform", d => `translate(${d.x},${d.y})`);

                    multiAttr.call(heatmapCircle, layout.heatmap.circle);
                }

                // Declare the nodes
                let node = treesContainer.selectAll("g.node")
                    .data(descendants)
                    .enter().append("g")
                    .attr("class", "node")
                    .classed("selected", (d) => selectedNodes.has(d.data.name))
                    .attr("transform", d => `translate(${d.x},${d.y})`);

                // Add node circles
                let circle = node.append("circle")
                    .attr("class", "node-circle")
                    .style("fill", d => !selectedNodes.has(d.data.name) ? '#FFF' : colours(d.data.series))
                    .style("stroke", d => colours(d.data.series))
                    .on("mouseover", function (d, i) {
                        let groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = `<div class="tooltip-colour-box" style=\"background-color: ${colours(d.data.series)}\"></div>` +
                                `<span class="tooltip-text">${d.data.name}</span>`;
                        tooltip.html(text).position([xPos, yPos]).show();
                    })
                    .on("mouseout", (d) => {
                        tooltip.hide();
                    });

                multiAttr.call(circle, nodeAttr);
                circle.each(function (d) {
                    d.bboxCircle = this.getBoundingClientRect();
                    d.bbox = d.bboxCircle;
                })

                // Add node labels
                let label = node.append("text")
                    .attr("class", "node-label")
                    .attr("dy", ".35em")
                    .text(d => d.data.name)
                    .style("opacity", 1)
                    .each(getNodeLabelBBox)
                    .each(d => d.labelPos = initialLabelPosition);

                multiAttr.call(label, layout.nodeLabel);
                multiAttr.call(label, initialLabelPosition);

                let maxNodeLabelLength = d3.max(label.data().map(d => d.bboxLabel.width)),
                    maxNodeLabelHeight = d3.max(label.data().map(d => d.bboxLabel.height)),
                    searchRadius = {x: 2 * maxNodeLabelLength + 10, y: 2 * maxNodeLabelHeight};

                if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" ||
                    layout.labelCollisionDetection.enabled === "onDelay") {
                    LCD = new LabelCollisionDetection(node, labelPositions, layout.nodeLabel, width, height, searchRadius);
                    LCD.recalculateLabelPositions(label, d3.zoomIdentity);
                }

                // Declare the links
                let link = treesContainer.selectAll("path.link")
                    //.data(links.filter(l => l.source.name != "virtualRoot"));
                    .data(descendants.filter(n => n.parent.data.name != "virtualRoot"))
                    .enter()
                    .insert("path", "g")
                    .attr("class", "link")
                    .attr("d", diagonal);

                multiAttr.call(link, layout.link);

                legend.each(function () {
                    this.parentNode.appendChild(this);
                });
                titleSVG.each(function () {
                    this.parentNode.appendChild(this);
                });

                if (layout.groupSelection.enabled) {
                    selectionRect = mouseCaptureGroup.append("rect")
                        .attr("class", "selection-rect");

                    multiAttr.call(selectionRect, layout.groupSelection.selectionRectangle);
                }

                function click() {
                    d3.event.preventDefault();
                    let n = d3.select(this.parentNode);
                    if (!n.classed("selected")) {
                        n.classed("selected", true);
                        n.select("circle.node-circle").style("fill", d => colours(d.data.series));
                    }
                    else {
                        n.classed("selected", false);
                        n.select("circle.node-circle").style("fill", "#FFF");
                    }
                    updateSelection();
                }
                function mouseDown() {
                    d3.event.preventDefault();
                    mouseStart = d3.mouse(mouseRect.node());
                    mouseRect.on("mousemove", mouseMove)
                        .on("mouseup", finalizeSelection)
                        .on("mouseout", finalizeSelection);
                    circle.style("pointer-events", "none");
                }

                function finalizeSelection() {
                    selectionRect.attr("width", 0);
                    updateSelection();
                    circle.style("pointer-events", "all");
                    mouseRect.on("mousemove", null)
                        .on("mouseup", null)
                        .on("mouseout", null);
                }

                function mouseMove() {
                    let p = d3.mouse(mouseRect.node());
                    let d = {
                        x: (p[0] < mouseStart[0] ? p[0] : mouseStart[0]),
                        y: (p[1] < mouseStart[1] ? p[1] : mouseStart[1]),
                        height: Math.abs(p[1] - mouseStart[1]),
                        width: Math.abs(p[0] - mouseStart[0])
                    };
                    multiAttr.call(selectionRect, d);
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
                        let [tx, ty] = getTranslation(n.attr("transform"));

                        if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                            n.classed("selected", true);
                            n.select("circle.node-circle").style("fill", d => colours(d.data.series));
                            any = true;
                        }
                        else if (!selectedNodes.has(d.data.name)) {
                            n.classed("selected", false);
                            n.select("circle.node-circle").style("fill", "#FFF");
                        }
                    });

                    return any;
                }

                function updateSelection() {
                    let wasChange = false;

                    svg.selectAll("g.node.selected").each(d => {
                        if (!selectedNodes.has(d.data.name)) {
                            selectedNodes.add(d.data.name);
                            wasChange = true;
                        }
                    });

                    svg.selectAll("g.node:not(.selected)").each(d => {
                        if (selectedNodes.has(d.data.name)) {
                            selectedNodes.delete(d.data.name);
                            wasChange = true;
                        }
                    });

                    if (wasChange && scope.selectedNodes) {
                        scope.selectedNodes = Array.from(selectedNodes);
                        scope.$apply();
                    }
                }

                let zoom = d3.zoom()
                    .scaleExtent([1, layout.maxZoom])
                    .extent([[0, 0],[width, height]])
                    .translateExtent([[0, 0],[width, height]])
                    .on("zoom", onZoom);

                function onZoom() {
                    applyZoom(d3.event.transform);
                    if (lcdEnabled) {
                        applyLCD(d3.event.transform);
                    }
                    lastTransform = d3.event.transform;
                }

                function applyZoom(zoomTransform) {
                    let scale = zoomTransform.k;
                    treesContainer.attr("transform", zoomTransform);
                    mouseCaptureGroup.attr("transform", zoomTransform);
                    xAxis.ticks(Math.ceil(xScale.domain().reduce((a, b) => b - a) / scale));
                    axisSVG.call(xAxis.scale(zoomTransform.rescaleX(xScale)));
                    axisSVG.selectAll(".tick line").style("shape-rendering", "crispEdges").attr("opacity", 0.2);
                    if (layout.axis.gridOnly) {
                        chart.selectAll("g.x-axis g.tick text").style("opacity", 1e-6);
                    }

                    multiAttr.call(circle, scaleProperties(nodeAttr, scale, true));

                    circle.attr("stroke", d => colours(d.data.series))
                        .each(function (d) {
                        d.bboxCircle = this.getBoundingClientRect();
                    });

                    if (layout.heatmap.enabled) {
                        multiAttr.call(heatmapCircle, scaleProperties(layout.heatmap.circle, scale));
                    }
                    multiAttr.call(svg.selectAll("path.link"), scaleProperties(layout.link, scale));
                    label.each(function (d) {
                        let self = d3.select(this);
                        multiAttr.call(self, scaleProperties(layout.nodeLabel, scale));
                        multiAttr.call(self, scaleProperties(d.labelPos, scale));
                    });

                    if (layout.groupSelection.enabled) {
                        multiAttr.call(selectionRect, scaleProperties(layout.groupSelection.selectionRectangle, scale));
                    }
                }

                function onDoubleClick() {
                    let I = d3.zoomIdentity;
                    chart.call(zoom.transform, I);
                    applyZoom(I);
                    if (lcdEnabled) {
                        applyLCD(I);
                    }
                    lastTransform = I;
                }

                function applyLCD(transform) {
                    if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                        LCD.recalculateLabelPositions(label, transform);
                    }
                    else if (layout.labelCollisionDetection.enabled === "onDelay") {
                        window.clearTimeout(LCDUpdateID);
                        LCDUpdateID = window.setTimeout(() => {
                            LCD.recalculateLabelPositions(label, transform);
                        }, layout.labelCollisionDetection.updateDelay);
                        lastLCDUpdateTime = performance.now();
                    }
                }

                let controls = {
                    'download': function() {},
                    'zoom': toggleZoom,
                    'select': toggleSelect,
                    'label': toggleLabels
                };
                let activeControls = [];
                if (layout.showLabel) activeControls.push("label");

                createPlotControls(element[0], controls, activeControls);

                function toggleZoom(toggle) {
                    if (toggle) {
                        chart.call(zoom)
                            .on('dblclick.zoom', onDoubleClick);
                    }
                    else {
                        chart.on("wheel.zoom", null)
                            .on("mousedown.zoom", null)
                            .on("dblclick.zoom", null)
                            .on("touchstart.zoom", null)
                            .on("touchmove.zoom", null)
                            .on("touchend.zoom", null)
                            .on("touchcancel.zoom", null);
                    }
                }

                function toggleSelect(toggle) {
                    mouseRect.on("mousedown", toggle ? mouseDown : null);
                    circle.on("click", toggle ? click : null);
                }

                function toggleLabels(toggle) {
                    label.style("opacity", d => toggle && !d.isColliding ? 1 : 1e-6);
                    if (layout.labelCollisionDetection.enabled != "never" && layout.labelCollisionDetection.enabled != "onInit") {
                        lcdEnabled = !lcdEnabled;
                        if (lcdEnabled) {
                            LCD.recalculateLabelPositions(label, lastTransform);
                        }
                    }
                }
            }

            // Handle window resize event.
            scope.$on('window-resize', (event) => {
                render({isNewData: false});
            });

            scope.$watch("value", () => {
                render({isNewData: true});
            });
        }
    }
}

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};

let layoutTemplate = {
    title: null,
    width: null,
    height: 600,
    margin: {
        right: 10,
        left: 10,
        top: 10,
        bottom: 10
    },
    axis: {
        title: "",
        show: true,
        gridOnly: false,
        valueProperty: "default"
    },
    showLabel: true,
    nodeTypes: {},
    nodeLabel: {
        "font-size": 12,
        "font-family": "Roboto,Helvetica Neue,sans-serif"
    },
    labelCollisionDetection: {
        enabled: "never",
        updateDelay: 500
    },
    link: {
        fill: "none",
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
        title: null,
        colourScale: [
            [0, '#008ae5'],
            [1, 'yellow']
        ],
        colourBar: {
            show: true,
            height: "90%",
            width: 30,
            position: "right"
        },
        circle: {
            r: 16
        },
        opacity: 0.4
    },
    legend: {
        show: false,
        position: {
            x: "right",
            y: "center"
        },
        anchor: {
            x: "outside",
            y: "inside"
        },
        orientation: "vertical"
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

function filterSeries(nodes, activeSeries) {
    let filteredNodes = [],
        nodesDict = {},
        parent;

    for (let node of nodes) {
        nodesDict[node.name] = node;
    }

    for (let node of nodes) {
        let currentNode = node;
        if (!activeSeries.has(currentNode.series)) continue;
        while (parent = currentNode.parent) {
            let parentNode = nodesDict[parent];
            if (activeSeries.has(parentNode.series)) {
                node.parent = parent;
                break;
            }
            currentNode = parentNode;
        }
        if (node.parent && !activeSeries.has(nodesDict[node.parent].series)) {
            node.parent = null;
        }
        filteredNodes.push(node);
    }
    return filteredNodes;
}

export default angular.module('ancestry.lineage', ['ancestry.utils'])
    .directive('lineagePlot', LineagePlotDirective);