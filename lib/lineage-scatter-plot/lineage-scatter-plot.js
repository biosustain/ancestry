import './lineage-scatter-plot.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import {  d3legend, d3tooltip, mergeTemplateLayout, createNodeTypes, createDynamicNodeAttr, roundOffFix, labelCollisionDetection,
    scaleProperties, getNodeLabelBBox, calcColourBarSize, drawColourBar} from '../shared-features.js'

function LineageScatterPlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            selectedNodes: '='
        },
        link(scope, element, attributes) {

            element.addClass("plotify plotify-lineage-scatter-plot");

            let defaultTimeFormat = "%d %b %y",
                defaultScalarFormat = "g";

            let svg = d3.select(element[0])
                .append("svg")
                .style('width', '100%');

            let //links,
                mouseStart,
                colours = d3.scale.category10(),
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
                LCD = null, //label collision detection
                lastLCDUpdateTime = 0,
                LCDUpdateID,
                heatmapColourScale = null,
                heatmapCircle = null,
                visibleSeries = null;

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                let elementWidth = d3.select(element[0]).node().offsetWidth;

                let marginRatio = {axisX: 0.15, axisY: 0.1};

                // don't continue rendering if there is no data
                if (!scope.value || !scope.value.data.length) return;

                selectedNodes = new Set();

                let seriesNames = Array.from(new Set(scope.value.data.map(d => d.series)));

                if (visibleSeries == null) visibleSeries = new Set(seriesNames);

                let copy = angular.copy(scope.value),
                    {nodesData, links} = createLinks(copy.data, visibleSeries),
                    layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                    pathname = $window.location.pathname,
                    legendHeight = 0, legendWidth = 0, colourbarHeight = 0, colourbarWidth = 0,
                    colourBarOffset = layout.heatmap.colourBar.show ? 20 : 0,
                    colourbar = d3.select(),
                    legend = d3.select();

                let margin = {top: 50, right: 30, bottom: 45, left: 20},
                    width =  elementWidth - margin.left - margin.right,
                    height = 600 - margin.top - margin.bottom;

                if (!layout.title) margin.top = 25;
                if (layout.xAxis.title) margin.bottom += 25;
                if (layout.yAxis.title) margin.left += 25;

                let chart = svg.append("g");
                let defs = chart.append("svg:defs");

                if (layout.heatmap.enabled) {

                    let domain = d3.extent(nodesData, node => node.z);

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

                    if (layout.heatmap.colourBar.show) {
                        layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, height);
                        layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, width);

                        colourbar = chart.append("g")
                            .attr("class", "plotify-colourbar");

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                        let bbox = colourbar.node().getBoundingClientRect(),
                            pos = layout.heatmap.colourBar.position;
                        colourbarWidth = bbox.width;
                        colourbarHeight = bbox.height;
                        if (pos === "right" || pos === "left")
                            margin.right += colourbarWidth + colourBarOffset;
                        else if (pos === "top" || pos === "bottom")
                            margin.top += colourbarHeight;
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
                        .attr("class", "plotify-legend")
                        .call(drawLegend);

                    let bbox = legend.node().getBoundingClientRect();
                    legendHeight = bbox.height; legendWidth = bbox.width;
                    if (anchor.x === "outside" && pos.x !== "center") {
                        margin[pos.x] += legendWidth;
                    }
                    else if(anchor.y === "outside" && pos.y !== "center") {
                        margin[pos.y] += legendHeight;
                    }
                }

                function legendClick(label) {
                    let clicked = d3.select(this);
                    if (visibleSeries.has(label))
                        visibleSeries.delete(label);
                    else
                        visibleSeries.add(label);
                    clicked.classed("legend-item-selected", visibleSeries.has(label));
                    clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                    render()
                }

                let initialLabelPosition = labelPositions[0];

                let types = createNodeTypes(nodesData, layout.nodeTypes, defaultNode),
                    nodeAttr = createDynamicNodeAttr(types, Object.keys(defaultNode));

                // check if x axis data is time data
                //let isTimePlot = nodesData[0].x instanceof Date;
                let isTimePlot = false;

                // define x and y axes formats
                let xAxisFormat = isTimePlot ? d3.time.format(layout.xAxis.format || defaultTimeFormat) :
                                  d3.format(layout.xAxis.format || defaultScalarFormat),
                    yAxisFormat = d3.format(layout.yAxis.format || defaultScalarFormat);

                // find extent of input data and calculate margins
                let xExtent = d3.extent(nodesData, node => node.x),
                    yExtent = d3.extent(nodesData, node => node.y);

                if (xExtent[0] === undefined || yExtent[0] === undefined) {
                    xExtent[0] = xExtent[1] = 0;
                    yExtent[0] = yExtent[1] = 0;
                }

                let xMargin = marginRatio.axisX * (xExtent[1] - xExtent[0]) / 2,
                    yMargin = marginRatio.axisY * (yExtent[1] - yExtent[0]) / 2;

                // add margins to horizontal axis data
                if (isTimePlot) {
                    xExtent[0] = new Date(xExtent[0].getTime() - xMargin);
                    xExtent[1] = new Date(xExtent[1].getTime() + xMargin);
                } else {
                    if (xMargin == 0) xMargin = 0.5;
                    if (yMargin == 0) yMargin = 0.5;
                    xExtent[0] -= xMargin; xExtent[1] += xMargin;
                }

                // add margins to vertical axis data
                yExtent[0] -= yMargin; yExtent[1] += yMargin;

                height = 600 - margin.top - margin.bottom;

                // define x scale
                let xScale = (isTimePlot ? d3.time.scale() : d3.scale.linear())
                    .domain(xExtent)
                    .range([0, width]);

                // define y scale
                let yScale = d3.scale.linear()
                    .domain(yExtent)
                    .range([height, 0]);

                let zoom = d3.behavior.zoom()
                    .scaleExtent([1, layout.maxZoom])
                    //.x(xScale) // TODO: can be reworked when xExtent is implemented in d3.js
                    .on("zoom", zoomed);

                // define x axis
                let xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .innerTickSize(-height)
                    .tickFormat(roundOffFix(xAxisFormat));

                // define y axis
                let yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .innerTickSize(-width)
                    .tickFormat(roundOffFix(yAxisFormat));

                // read x and y axes labels
                let xAxisLabel = layout.xAxis.title;
                let yAxisLabel = layout.yAxis.title;

                // define node link function
                let nodeLink = d3.svg.line()
                    .x(node => xScale(node.x))
                    .y(node => yScale(node.y));

                let mouseCaptureGroup = chart.append("g");

                // render x axis
                let xAxisSVG = chart.append("g")
                    .attr("class", "axis x-axis")
                    .attr("transform", `translate(0, ${height})`)
                    .call(xAxis);

                // rotate tick labels if time plot
                if (isTimePlot) {
                    xAxisSVG.selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-65)");
                }

                // render x axis label if exists
                if (xAxisLabel) {
                    let tickHeight = chart.selectAll("g.x-axis g.tick text")[0][0].getBBox().height;
                    xAxisLabel += layout.xAxis.units ? `, ${layout.xAxis.units}` : "";
                    chart.append("text")             // text label for the x axis
                        .style("text-anchor", "middle")
                        .text(xAxisLabel)
                        .attr("transform", `translate(${width/2}, ${height + tickHeight + 20})`);
                }

                // render y axis
                let yAxisSVG = chart.append("g")
                    .attr("class", "axis y-axis")
                    .call(yAxis);

                // render y axis label if exists
                if (yAxisLabel) {
                    yAxisLabel += layout.yAxis.units ? `, ${layout.yAxis.units}` : "";
                    chart.append("text")            // text label for the y axis
                        .attr("transform", "rotate(-90)")
                        .attr("y", -40)
                        .attr("x",-(height / 2))
                        .attr("dy", "1em")
                        .style("text-anchor", "middle")
                        .text(yAxisLabel);
                }

                let yAxisOffset = yAxisSVG.node().getBBox().x;
                margin.left += Math.abs(yAxisOffset);

                // render chart title
                if (layout.title) {
                    chart.append("text")
                        .attr("x", (width / 2))
                        .attr("y", 0 - (margin.top / 2))
                        .attr("text-anchor", "middle")
                        .style("font-size", "20px")
                        .text(layout.title);
                }


                width = elementWidth - margin.right - margin.left;

                colourbar.attr("transform", `translate(${width + colourBarOffset},${(height - layout.heatmap.colourBar.height)/2})`);
                if (layout.legend.show) {
                    let pos = layout.legend.position,
                        anchor = layout.legend.anchor,
                        xOffset = yAxisOffset - (layout.yAxis.title ? 25 : 0),
                        yOffset = 15 + (layout.xAxis.title ? 25 : 0),
                        posX = pos.x === "left" ? xOffset : (pos.x === "right" ? width + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2),
                        posY = pos.y === "top" ? 0 : (pos.y === "bottom" ? height + (anchor.y === "outside" ? yOffset : 0): height / 2);

                    legend.attr("transform", `translate(${posX},${posY})`);
                }

                svg.attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);

                yScale.range([height, 0]);
                xScale.range([0, width]);

                let xScale0 = xScale.copy(),
                    yScale0 = yScale.copy();

                xAxis.innerTickSize(-height); yAxis.innerTickSize(-width);
                xAxisSVG.call(xAxis);
                yAxisSVG.call(yAxis);

                let mouseRect = mouseCaptureGroup.append("rect")
                    .attr("id", "mouse-capture")
                    .attr("x", -margin.left)
                    .attr("y", -margin.top)
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .style("fill", "transparent");

                // render chart area
                chart.attr("transform", `translate(${margin.left}, ${margin.top})`)
                    .call(zoom)
                    .on("dblclick.zoom", onDoubleClick);

                // define arrowhead

                defs.append("marker")
                    .attr({
                        "id":"marker-arrowhead",
                        "viewBox":"0 -5 10 10",
                        "refX":15,
                        "refY":0,
                        "markerWidth":8,
                        "markerHeight":8,
                        "orient":"auto"
                    })
                    .append("path")
                    .attr("d", "M0,-4L10,0L0,4")
                    .attr("fill", layout.link.stroke)
                    .attr("class","arrowHead");

                defs.append("svg:clipPath")
                    .attr("id", "lineage-scatter-clip-rect")
                    .append("svg:rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height);

                // render links
                let plotArea = chart.append("g")
                    .attr("id", "scatter-plot-area")
                    .attr("clip-path", `url(${pathname}#lineage-scatter-clip-rect)`)
                    .append("g");

                if (layout.heatmap.enabled) {
                    heatmapCircle = plotArea.append("g")
                        .attr("class", "heatmap-layer")
                        .selectAll("circle.heatmap-circle")
                        .data(nodesData.filter(n => !isNaN(parseFloat(n.z))))
                        .enter()
                        .append("circle")
                        .attr("class", "heatmap-circle")
                        .style("fill", d => heatmapColourScale(d.z))
                        .style("opacity", layout.heatmap.opacity)
                        .attr(layout.heatmap.circle)
                        .attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`);
                }

                plotArea.selectAll(".link")
                    .data(links)
                    .enter()
                    .append("svg:path")
                    .attr("stroke-dasharray", ("3, 3"))
                    .attr("d", conn => {
                        return nodeLink(conn);
                    })
                    .attr(layout.link)
                    .attr("class", "link")
                    .attr("marker-end", `url(${pathname}#marker-arrowhead)`);

                // create node groups
                let node = plotArea.selectAll("g.node")
                    .data(nodesData)
                    .enter()
                    .append("g")
                    .attr("class", "node")
                    .attr("transform", node => `translate(${xScale(node.x)}, ${yScale(node.y)})`);

                 //render node circles
                let circle = node.append("circle")
                    .attr(nodeAttr)
                    .style("stroke", d => colours(d.series))
                    .style("fill", d => !selectedNodes.has(d.name) ? '#FFF' : colours(d.series))
                    .each(function(d) {
                        d.bboxCircle = this.getBoundingClientRect();
                    })
                    .on("click", click)
                    .on("mouseup", mouseUp)
                    .on("mouseover", function(d) {
                        let groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = `<div class="tooltip-colour-box" style=\"background-color: ${colours(d.series)}\"></div>` +
                                `<span class="tooltip-text">${d.name}</span>` +
                                `<span class="tooltip-text">x: ${d.x.toPrecision(3)}</span>` +
                                `<span class="tooltip-text">y: ${d.y.toPrecision(3)}</span>`;
                        tooltip.html(text).position([xPos, yPos]).show();
                    })
                    .on("mouseout", (d) => {
                        tooltip.hide();
                    });

                // render node labels
                let label = node.append("text")
                    .attr("dy", ".35em")
                    .attr(layout.nodeLabel)
                    .attr(initialLabelPosition)
                    .text(node => node.name)
                    .style("opacity", 1)
                    .each(getNodeLabelBBox)
                    .each(d => d.labelPos = initialLabelPosition);

                let maxNodeLabelLength = d3.max(label.data().map(d => d.bboxLabel.width)),
                    searchRadius = 2 * maxNodeLabelLength + 13;

                if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" ||
                    layout.labelCollisionDetection.enabled === "onDelay") {
                    LCD = new labelCollisionDetection(nodesData, labelPositions, layout.nodeLabel, xScale, yScale,
                            width, height, searchRadius);
                    LCD.initializeLabelPositions(label);
                }

                legend.each(function() { this.parentNode.appendChild(this);});

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

                function click(d) {
                    d3.event.preventDefault();
                    let n = d3.select(this.parentNode);
                    if (!n.classed("selected")) {
                        n.classed("selected", true);
                        n.select("circle").style("fill", d => colours(d.series));
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

                    node.each(function(d, i, j) {
                        let n = d3.select(this);
                        let t = d3.transform(n.attr("transform")),
                            tx = t.translate[0],
                            ty = t.translate[1];

                        if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                            n.classed("selected", true);
                            n.select("circle").style("fill", d => colours(d.series));
                            any = true;
                        }
                        else if(!selectedNodes.has(d.name)) {
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
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

                    if (wasChange && scope.selected) {
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
                    yScale.domain(yScale0.range().map(y => (y - translate[1]) / scale).map(yScale0.invert));
                    applyZoom();
                    if (layout.labelCollisionDetection.enabled ===  "onEveryChange"){
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
                    plotArea.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                    mouseCaptureGroup.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                    svg.select(".x-axis.axis").call(xAxis);
                    svg.select(".y-axis.axis").call(yAxis);
                    svg.selectAll(".node circle")
                        .attr(scaleProperties(nodeAttr, scale, true))
                        .each(function (d) {
                            d.bboxCircle = this.getBoundingClientRect();
                        });
                    svg.selectAll("path.link").attr(scaleProperties(layout.link, scale));
                    if (layout.heatmap.enabled) {
                        heatmapCircle.attr(scaleProperties(layout.heatmap.circle, scale));
                    }
                    if (layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay" ||
                        layout.labelCollisionDetection.enabled === false) {
                        label.each(function(d) {
                            let self = d3.select(this);
                            self.attr(scaleProperties(layout.nodeLabel, scale))
                                .attr(scaleProperties(d.labelPos, scale));
                        })
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
                    yScale.domain(yScale0.domain());
                    applyZoom();
                    if (layout.labelCollisionDetection.enabled === "onEveryChange"){
                        LCD.recalculateLabelPositions(label, scale);
                    }
                    else if (layout.labelCollisionDetection.enabled === "onDelay") {
                        window.clearTimeout(LCDUpdateID);
                        LCDUpdateID = window.setTimeout(() => {
                            LCD.recalculateLabelPositions(label, scale);
                        }, layout.labelCollisionDetection.enabled.updateDelay);
                        lastLCDUpdateTime = now;
                    }
                }

            }

            // Handle window resize event.
            scope.$on('window-resize', (event) => {
                render();
            });

            scope.$watch("value", () => {
                render();
            });
        }
    }
}

let layoutTemplate = {
    title: null,
    size: 800,
    xAxis: {
        title: null,
        units: null,
        format: null
    },
    yAxis: {
        title: null,
        units: null,
        format: null
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
        stroke: "#838383",
        "stroke-width": 1,
        "stroke-dasharray": 4
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
            x: "center",
            y: "top"
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
        x: 13,
        y: 0,
        "text-anchor": "start"
    },
    {
        x: -13,
        y: 0,
        "text-anchor": "end"
    }
];

function createLinks(nodes, activeSeries) {
    let filteredNodes = [],
        nodesDict = {},
        parent,
        links = [];

    for (let node of nodes) {
        nodesDict[node.name] = node;
    }

    for (let node of nodes) {
        let currentNode = node;
        if (!activeSeries.has(currentNode.series)) continue;
        while(parent = currentNode.parent) {
            let parentNode = nodesDict[parent];
            if (activeSeries.has(parentNode.series)) {
                node.parent = parent;
                links.push([parentNode, node]);
                break;
            }
            currentNode = parentNode;
        }
        if (node.parent && !activeSeries.has(nodesDict[node.parent].series)) {
            node.parent = null;
        }
        filteredNodes.push(node);
    }

    return {nodesData: filteredNodes, links: links};
}

export default angular.module('plotify.lineage-scatter', ['plotify.utils'])
    .directive('lineageScatterPlot', LineageScatterPlotDirective);