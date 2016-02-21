import './lineage-scatter-plot.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import { d3tooltip, mergeTemplateLayout, createNodeTypes } from '../shared-features.js'

function LineageScatterPlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            selected: '='
        },
        link(scope, element, attributes) {

            element.addClass("plotify plotify-lineage-scatter-plot");

            let defaultTimeFormat = "%d %b %y",
                defaultScalarFormat = null;

            let svg = d3.select(element[0])
                .append("svg")
                .style('width', '100%');

            let links,
                mouseStart,
                colours = d3.scale.category10().range(),
                isDrag = false,
                tooltip = new d3tooltip(d3.select(element[0])),
                defaultNode = {
                    r: 4,
                    strokeWidth: 2
                };

            scope.scatterSelection = [];

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                let elementWidth = d3.select(element[0]).node().offsetWidth;

                let margin = {top: 40, right: 70, bottom: 120, left: 70},
                    marginRatio = {axisX: 0.1, axisY: 0.1},
                    width =  elementWidth - margin.left - margin.right,
                    height = 600 - margin.top - margin.bottom;

                // don't continue rendering if there is no data
                if (!scope.value || !scope.value.data.length) return;

                let nodesData = scope.value.data,
                    layout = mergeTemplateLayout(scope.value.layout, layoutTemplate);

                if (scope.selected.length)
                    nodesData = nodesData.filter((node) => {
                        return scope.selected.indexOf(node.name) !== -1;
                    });

                scope.scatterSelection = scope.scatterSelection.filter((nodeName) => {
                    return scope.selected.indexOf(nodeName) !== -1;
                });

                createLinks();

                let types = createNodeTypes(nodesData, layout.nodeTypes, defaultNode);

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

                // define x axis
                let xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .innerTickSize(-height)
                    .tickFormat(xAxisFormat);

                // define y axis
                let yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .innerTickSize(-width)
                    .tickFormat(yAxisFormat);

                // read x and y axes labels
                let xAxisLabel = layout.xAxis.title;
                let yAxisLabel = layout.yAxis.title;

                // define node link function
                let nodeLink = d3.svg.line()
                    .x(node => xScale(node.x))
                    .y(node => yScale(node.y));

                // render chart area
                let chart = svg
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

                let mouseRect = chart.append("rect")
                    .attr("id", "mouse-capture")
                    .attr("x", -margin.left)
                    .attr("y", -margin.top)
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .style("opacity", 0);

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
                    .attr("class", "axis")
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
                chart.append("svg:defs").selectAll("marker")
                    .data(["end"])
                    .enter().append("svg:marker")
                    .attr("id", String)
                    .attr("class", "arrowhead")
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 15)
                    .attr("refY", 0)
                    .attr("markerWidth", 6)
                    .attr("markerHeight", 6)
                    .attr("orient", "auto")
                    .append("svg:path")
                    .attr("d", "M0,-3L10,0L0,3");

                // render links
                chart.selectAll(".link")
                    .data(links)
                    .enter()
                    .append("svg:path")
                    .attr("stroke-dasharray", ("3, 3"))
                    .attr("d", conn => {
                        return nodeLink(conn);
                    })
                    .attr("class", "link")
                    .attr("marker-end", "url(#end)");

                // create node groups
                let node = chart.selectAll("g.node")
                    .data(nodesData)
                    .enter()
                    .append("g")
                    .attr("class", "node")
                    .attr("transform", node => `translate(${xScale(node.x)}, ${yScale(node.y)})`);

                // render node circles
                node.append("circle")
                    .attr("r", d => types[d.type].r)
                    .style("stroke", d => colours[d.treeId])
                    .attr("stroke-width", d =>  types[d.type].strokeWidth)
                    .style("fill", d => {
                        if (scope.scatterSelection.indexOf(d.name) !== -1)
                            return colours[d.treeId];
                        else
                            return "#FFF";
                    })
                    .on("click", click)
                    .on("mouseup", mouseUp)
                    .on("mouseover", function(d, i) {
                        let groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = `<div class="tooltip-colour-box" style=\"background-color: ${colours[d.treeId]}\"></div>` +
                                `<span class="tooltip-text">${d.name}</span>` +
                                `<span class="tooltip-text">x: ${d.x.toFixed(1)}</span>` +
                                `<span class="tooltip-text">y: ${d.y.toFixed(1)}</span>`;
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
                    .text(node => node.name)
                    .style("fill-opacity", 1);

                mouseRect.on( "mousedown", mouseDown)
                    .on( "mousemove", mouseMove)
                    .on( "mouseup", mouseUp)
                    .on( "mouseout", mouseOut);

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
                            ty = t.translate[1];

                        if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                            n.classed("selected", true);
                            n.select("circle").style("fill", d => colours[d.treeId]);
                            any = true;
                        }
                        else if(scope.scatterSelection.indexOf(d.name) === -1) {
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
                        }
                    });

                    return any;
                }

                function updateSelection() {
                    let selectedNodes = [];

                    chart.selectAll("g.node.selected").each(function(d, i) {
                        selectedNodes.push(d.name);
                    });

                    let wasChange = selectedNodes.length !== scope.scatterSelection.length ||
                        selectedNodes.some(function(d) { return scope.scatterSelection.indexOf(d) === -1 });

                    if (wasChange){
                        scope.scatterSelection = selectedNodes;
                        //scope.$apply();
                    }
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
                let nodes = scope.selected.length ? scope.selected : scope.value.data.map(node => node.name);

                for(let node of nodes) {
                    let parent = nodeDict[node].parent;
                    let found = false;
                    while(parent) {
                        if(scope.selected.indexOf(parent) !== -1 || !scope.selected.length) {
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

            scope.$watch("selected", (selected) => {
                console.log(selected);
                render(scope.value);
            });
        }
    }
}

let layoutTemplate = {
    title: "",
    size: 800,
    xAxis: {
        title: "",
        units: null,
        format: null
    },
    yAxis: {
        title: "",
        units: "",
        format: null
    },
    nodeTypes: {}
};

export default angular.module('plotify.lineage-scatter', ['plotify.utils'])
    .directive('lineageScatterPlot', LineageScatterPlotDirective);