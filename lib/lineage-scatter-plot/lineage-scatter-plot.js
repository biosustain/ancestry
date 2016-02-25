import './lineage-scatter-plot.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import { d3tooltip, mergeTemplateLayout, createNodeTypes, createDynamicNodeAttr,
    scaleProperties } from '../shared-features.js'

function LineageScatterPlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            externalSelection: '=',
            selectedNodes: '='
        },
        link(scope, element, attributes) {

            element.addClass("plotify plotify-lineage-scatter-plot");

            let defaultTimeFormat = "%d %b %y",
                defaultScalarFormat = "g";

            let svg = d3.select(element[0])
                .append("svg")
                .style('width', '100%');

            let links,
                mouseStart,
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

                let elementWidth = d3.select(element[0]).node().offsetWidth;

                let margin = {top: 40, right: 30, bottom: 50, left: 70},
                    marginRatio = {axisX: 0.1, axisY: 0.1},
                    width =  elementWidth - margin.left - margin.right,
                    height = 600 - margin.top - margin.bottom;

                // don't continue rendering if there is no data
                if (!scope.value || !scope.value.data.length) return;

                let nodesData = scope.value.data,
                    layout = mergeTemplateLayout(scope.value.layout, layoutTemplate);

                if(scope.externalSelection) {
                    if (scope.externalSelection.length)
                        nodesData = nodesData.filter((node) => {
                            return scope.externalSelection.indexOf(node.name) !== -1;
                        });

                    selectedNodes.forEach(name => {
                        if (scope.externalSelection.indexOf(name) !== -1)
                            selectedNodes.delete(name);
                    });
                }

                createLinks();

                let types = createNodeTypes(nodesData, layout.nodeTypes, defaultNode),
                    nodeAttr = createDynamicNodeAttr(types, Object.keys(defaultNode));

                // check if x axis data is time data
                let isTimePlot = nodesData[0].x instanceof Date;

                // define x and y axes formats
                let xAxisFormat = isTimePlot ? d3.time.format(layout.xAxis.format || defaultTimeFormat) :
                                  d3.format(layout.xAxis.format || defaultScalarFormat),
                    yAxisFormat = d3.format(layout.yAxis.format || defaultScalarFormat);

                // find extent of input data and calculate margins
                let xExtent = d3.extent(nodesData, node => node.x),
                    yExtent = d3.extent(nodesData, node => node.y),
                    xMargin = marginRatio.axisX * (xExtent[1] - xExtent[0]) / 2,
                    yMargin = marginRatio.axisY * (yExtent[1] - yExtent[0]) / 2;

                // add margins to horizontal axis data
                if (isTimePlot) {
                    xExtent[0] = new Date(xExtent[0].getTime() - xMargin);
                    xExtent[1] = new Date(xExtent[1].getTime() + xMargin);
                } else {
                    if (xMargin === 0)
                        xMargin = 1;
                    xExtent[0] -= xMargin; xExtent[1] += xMargin;
                }

                // add margins to vertical axis data
                yExtent[0] -= yMargin; yExtent[1] += yMargin;

                // define x scale
                let xScale = (isTimePlot ? d3.time.scale() : d3.scale.linear())
                    .domain(xExtent)
                    .range([0, width]);

                // define y scale
                let yScale = d3.scale.linear()
                    .domain(yExtent)
                    .range([height, 0]);

                let xScale0 = xScale.copy(),
                    yScale0 = yScale.copy();

                let zoom = d3.behavior.zoom()
                    .scaleExtent([1, 10])
                    //.x(xScale) // TODO: can be reworked when xExtent is implemented in d3.js
                    .on("zoom", zoomed);

                let roundOffFix = function(format) {
                    return d => {
                        let str = d.toString();
                        return str.length > 10 && str.slice(-9, -1) == "00000000" ?
                            xAxisFormat(Number(str.slice(0, -1))) : format(d);
                    }
                };

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

                if (!layout.title) margin.top = 20;
                if (!layout.xAxis.title) margin.bottom = 25;
                if (!layout.yAxis.title) margin.left = 50;

                // render chart area
                let chart = svg
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
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
                chart.append("g")
                    .attr("class", "axis y-axis")
                    .call(yAxis);

                // render y axis label if exists
                if (yAxisLabel) {
                    yAxisLabel += layout.yAxis.units ? `, ${layout.yAxis.units}` : "";
                    chart.append("text")            // text label for the y axis
                        .attr("transform", "rotate(-90)")
                        .attr("y", -margin.left + 10)
                        .attr("x",-(height / 2))
                        .attr("dy", "1em")
                        .style("text-anchor", "middle")
                        .text(yAxisLabel);
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

                // define arrowhead
                let defs = chart.append("svg:defs");

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
                    .attr("clip-path", "url(#lineage-scatter-clip-rect)")
                    .append("g");

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
                    .attr("marker-end", "url(#marker-arrowhead)");

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
                    .style("stroke", d => colours[d.treeId])
                    .style("fill", d => !selectedNodes.has(d.name) ? '#FFF' : colours[d.treeId])
                    .on("click", click)
                    .on("mouseup", mouseUp)
                    .on("mouseover", function(d, i) {
                        let groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = `<div class="tooltip-colour-box" style=\"background-color: ${colours[d.treeId]}\"></div>` +
                                `<span class="tooltip-text">${d.name}</span>` +
                                `<span class="tooltip-text">x: ${d.x.toPrecision(3)}</span>` +
                                `<span class="tooltip-text">y: ${d.y.toPrecision(3)}</span>`;
                        tooltip.html(text).position([xPos, yPos]).show();
                    })
                    .on("mouseout", (d) => {
                        tooltip.hide();
                    });

                // render node labels
                node.append("text")
                    .attr("x", 13)
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .attr(layout.nodeLabel)
                    .text(node => node.name)
                    .style("fill-opacity", 1);

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

                    node.each(function(d, i, j) {
                        let n = d3.select(this);
                        let t = d3.transform(n.attr("transform")),
                            tx = t.translate[0],
                            ty = t.translate[1];

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
                        s = zoom.scale();
                    if (s == scale && t[0] == translate[0] && t[1] == translate[1]) return;
                    scale = s;
                    translate = t;
                    translate[0] = translate[0].clamp((1 - scale) * width, 0);
                    translate[1] = translate[1].clamp((1 - scale) * height, 0);
                    zoom.translate(translate);
                    xScale.domain(xScale0.range().map(x => (x - translate[0]) / scale).map(xScale0.invert));
                    yScale.domain(yScale0.range().map(y => (y - translate[1]) / scale).map(yScale0.invert));
                    applyZoom();
                }

                function applyZoom() {
                    plotArea.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                    mouseCaptureGroup.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                    svg.select(".x-axis.axis").call(xAxis);
                    svg.select(".y-axis.axis").call(yAxis);
                    svg.selectAll(".node circle").attr(scaleProperties(nodeAttr, scale, true));
                    svg.selectAll("path.link").attr(scaleProperties(layout.link, scale));
                    svg.selectAll(".node text").attr(scaleProperties(layout.nodeLabel, scale));
                    if (layout.groupSelection.enabled) {
                        selectionRect.attr(scaleProperties(layout.groupSelection.selectionRectangle, scale));
                    }
                }

                function onDoubleClick() {
                    scale = 1;
                    translate = [0, 0];
                    zoom.scale(1);
                    xScale.domain(xScale0.domain());
                    yScale.domain(yScale0.domain());
                    applyZoom();
                }

            }
            function createLinks() {
                if (scope.value === undefined) return;
                let nodeDict = {};
                links = [];
                for(let node of scope.value.data) {
                    node.children = [];
                    nodeDict[node.name] = node;
                }
                for(let node of scope.value.data) {
                    if (node.parent)
                        nodeDict[node.parent].children.push(node.name);
                }

                let nodes = scope.externalSelection && scope.externalSelection.length ? scope.externalSelection :
                    scope.value.data.map(node => node.name);

                for(let node of nodes) {
                    let parent = nodeDict[node].parent;
                    let found = false;
                    while(parent) {
                        if(!scope.externalSelection || (scope.externalSelection.indexOf(parent) !== -1 || !scope.externalSelection.length)) {
                            links.push([nodeDict[parent], nodeDict[node]]);
                            found = true;
                            break;
                        }
                        else {
                            parent = nodeDict[parent].parent;
                        }

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

            scope.$watch("externalSelection", (ext) => {
                translate = [0, 0];
                scale = 1;
                render(scope.value);
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
        "font-size": 12,
        x: 13
    },
    link: {
        stroke: "#ccc",
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
    }
};

export default angular.module('plotify.lineage-scatter', ['plotify.utils'])
    .directive('lineageScatterPlot', LineageScatterPlotDirective);