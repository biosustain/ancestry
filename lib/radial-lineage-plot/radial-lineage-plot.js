import './radial-lineage-plot.css'
import '../utils.js'
import angular from 'angular'
import * as d3 from 'd3';
import { d3tooltip, d3legend, createTreeLayout, mergeTemplateLayout, calcColourBarSize, drawColourBar,
    createNodeTypes, createDynamicNodeAttr, testLabelLength, multiAttr, createPlotControls } from '../shared-features.js'

function RadialLineagePlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            nodeClick: '&'
        },
        link(scope, element, attributes) {

            element.addClass("ancestry ancestry-radial-lineage-plot");

            let svg = d3.select(element[0])
                .style("position", "relative")
                .append("svg");

            let colours = d3.scaleOrdinal(d3.schemeCategory10),
                hovering = false,
                virtualRoot = null,
                virtualRootName = "virtual_root",
                r,
                labelOffset = 20,
                defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                visibleSeries = new Set();

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                let defs = svg.append("defs");

                // do not continue rendering if there is no data
                if (!scope.value || !scope.value.data.length) return;

                let seriesNames = Array.from(new Set(scope.value.data.map(d => d.series)));

                if (options.isNewData) {
                    colours.domain([]);
                    visibleSeries = new Set(seriesNames);
                }

                let copy = angular.copy(scope.value),
                    layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                    pathname = $window.location.pathname;

                let treeData = createTreeLayout(filterSeries(copy.data, visibleSeries)),
                    longestNodeName = copy.data.length ? copy.data.reduce((a, b) => a.name.length > b.name.length ? a : b).name : "";

                let elementWidth = element[0].offsetWidth,
                    elementHeight = element[0].offsetHeight;

                let isMultipleTree = treeData.length > 1,
                    multipleTreeOffset = isMultipleTree ? 30 : 0,
                    maxLabelLength = testLabelLength(svg, longestNodeName, layout.outerNodeLabel),
                    colourBarOffset = 20,
                    start = null,
                    rotate = 0,
                    rotateOld = 0,
                    rotationDifference,
                    transitionScale = d3.scaleLog().domain([1, 181]).range([0, 1500]),
                    reorgDuration = 1000,
                    prevX = 0,
                    heatmapColourScale = null,
                    heatmapCircle = d3.select(),
                    legendHeight = 0, legendWidth = 0, colourbarHeight = 0, colourbarWidth = 0,
                    legendOut = {top:false, right: false, bottom:false, left:false},
                    showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
                    colourBarOrigWidth = layout.heatmap.colourBar.width, colourBarOrigHeight = layout.heatmap.colourBar.height,
                    legend = d3.select(),
                    colourbar = d3.select(),
                    titleSVG = d3.select();

                let width = layout.width || elementWidth,
                    height = layout.height || elementHeight;

                svg.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", layout.backgroundColour);

                if (layout.legend.show) {
                    if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                    if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                }

                let margin = layout.margin;
                if (layout.title) margin.top += legendOut.top ? 26 : 25;

                let chart = svg.append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

                if (layout.heatmap.enabled) {

                    let domain = d3.extent(copy.data, node => node.z);

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
                        layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, height);
                        layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, width);

                        colourbar = chart.append("g")
                            .attr("class", "ancestry-colourbar").attr("transform", "translate(0,0)");

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                        let bbox = colourbar.node().getBoundingClientRect();

                        colourbarWidth = bbox.width;
                        margin.right += colourbarWidth - (showHeatmapTitle ? 1 : 0) + colourBarOffset;
                        colourbarHeight = bbox.height;
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
                        .backgroundColour(layout.legend.backgroundColour || layout.backgroundColour)
                        .onClick(legendClick)
                        .maxSize({width, height})
                        .selectedItems(visibleSeries);

                    legend = chart.append("g")
                        .attr("class", "ancestry-legend")
                        .call(drawLegend);

                    let bbox = legend.node().getBoundingClientRect();
                    legendHeight = bbox.height; legendWidth = bbox.width;
                    if (anchor.x === "outside" && pos.x !== "center") {
                        margin[pos.x] += legendOut.right ? legendWidth - 10 : (legendOut.left ? legendWidth - 11 : legendWidth);
                    }
                    else if(anchor.y === "outside" && pos.y !== "center") {
                        margin[pos.y] += legendOut.bottom ? legendHeight - 11 : (legendOut.top ? legendHeight - 11 : legendHeight);
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
                    render({isNewData: false})
                }

                width = (layout.width || elementWidth) - margin.right - margin.left;
                height = (layout.height || elementHeight) - margin.top - margin.bottom;

                let r = Math.min(height, width) / 2,
                    totalTreeLength = r - maxLabelLength - labelOffset - multipleTreeOffset;

                chart.attr("transform", `translate(${margin.left},${margin.top})`);

                if (layout.legend.show) {
                    let pos = layout.legend.position,
                        anchor = layout.legend.anchor,
                        posX = pos.x === "left" ? width / 2 - r : (pos.x === "right" ? width / 2 + r + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2),
                        posY = pos.y === "top" ? height / 2 - r : (pos.y === "bottom" ? height / 2 + r: height / 2);

                    legend.attr("transform", `translate(${posX},${posY})`);
                }


                virtualRoot = {
                    name: virtualRootName,
                    parent: null,
                    children: [],
                    treeId: 0,
                    _depth: 0,
                    type: undefined
                };

                for(let tree of treeData) {
                    spreadNodes(tree);
                    tree.parent = virtualRootName;
                    virtualRoot.children.push(tree);
                }
                treeData = virtualRoot;

                let types = createNodeTypes(copy.data, layout.nodeTypes, defaultNode),
                    nodeAttr = createDynamicNodeAttr(types, Object.keys(defaultNode));


                let treeLayout = d3.cluster().size([360, 1]).separation(() => 1),
                    treeRoot = d3.hierarchy(treeData, d => d.children).sort((a,b) => b.depth - a.depth),
                    nodes = treeLayout(treeRoot),
                    descendants = nodes.descendants().filter(n => n.parent != null );

                svg.attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .style("-webkit-backface-visibility", "hidden");

                // Catch mouse events in Safari.
                svg.append("rect")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .attr("fill", "none");

                let visTranslate = [width / 2, height / 2],
                    vis = chart.append("g")
                    .attr("transform", `translate(${visTranslate[0]},${visTranslate[1]})`);

                vis.append("rect")
                    .attr("x", -r)
                    .attr("y", -r)
                    .attr("width", 2 * r)
                    .attr("height", 2 * r)
                    .style("opacity", 1e-6);

                descendants.forEach(d => {
                    d.x0 = d.x; // remember initial position
                    d.y = d.name === virtualRootName ? 0 :multipleTreeOffset + d.data._depth * (totalTreeLength);
                });

                // render chart title
                if (layout.title) {
                    titleSVG = chart.append("text")
                        .attr("x", (width / 2))
                        .attr("y", height / 2 - r - (layout.legend.position.y == "top" && layout.legend.anchor.y == "outside" ? legendHeight : 10))
                        .attr("text-anchor", "middle")
                        .style("font-size", "20px")
                        .text(layout.title);
                }

                // TODO: implement equidistant generations
                //let maxGen = 15;//d3.max(treeData.trees[0].map(d => d.generation));
                //nodes.forEach(function(d){d.y = d.generation / maxGen * 300});

                if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                    layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, 2 * r);
                    layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                    drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                    colourbar.attr("transform", `translate(${width / 2 + r + colourBarOffset},${(height - layout.heatmap.colourBar.height)/2})`);
                }

                if (layout.heatmap.enabled) {
                    heatmapCircle = vis.append("g")
                        .attr("class", "heatmap-layer")
                        .selectAll("circle.heatmap-circle")
                        .data(descendants.filter(n => !isNaN(parseFloat(n.data.z))))
                        .enter()
                        .append("circle")
                        .attr("class", "heatmap-circle")
                        .style("fill", d => heatmapColourScale(d.data.z))
                        .style("opacity", layout.heatmap.opacity)
                        .attr("transform", d => `rotate(${d.x - 90})translate(${d.y})`);

                    multiAttr.call(heatmapCircle, layout.heatmap.circle);
                }

                let link = vis.selectAll("path.link")
                    .data(descendants.filter(n => n.parent.data.name != virtualRootName))
                    .enter().append("path")
                    .attr("class", "link")
                    .attr("fill", "none")
                    .attr("d", step)
                    .each(function(d) {
                        d.inLinkNode = this;
                        if(d.parent.outLinkNodes) d.parent.outLinkNodes.push(this);
                        else d.parent.outLinkNodes = [this];
                    });

                multiAttr.call(link, layout.link);

                let node = vis.selectAll("g.node")
                    .data(descendants)
                    .enter().append("g")
                    .attr("id", d => d.name)
                    .attr("class", "node")
                    .attr("transform", d => `rotate(${d.x - 90})translate(${d.y})`)
                    .on("mouseover", mouseovered(true))
                    .on("mouseout", mouseovered(false))
                    .each(function(d) { d.nodeGroupNode = this; });

                let nodeLabel = node.append("text")
                    .attr("class", "mouseover-label")
                    .attr("transform", "rotate(90)")
                    .attr("dy", ".25em")
                    .attr("dx", ".6em")
                    .style("opacity", 1e-6)
                    .text(d => d.data.name);

                multiAttr.call(nodeLabel, layout.nodeLabel);
                nodeLabel.call(getBB);

                node.insert("rect","text")
                    .attr("x", d => d.bbox.x - 3)
                    .attr("y", d => d.bbox.y)
                    .attr("width", d => d.bbox.width + 6)
                    .attr("height", d => d.bbox.height + 3)
                    .attr("transform", "rotate(90)")
                    .style("fill", "white")
                    .style("opacity", 1e-6);

                let circle = node.append("circle")
                    .attr("fill", "white")
                    .style("stroke",  d => colours(d.data.series));


                multiAttr.call(circle, nodeAttr);
                toggleNodeClickCallback(true);

                let maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + labelOffset) /
                        descendants.filter(d => !d.children || !d.children.length).length;

                layout.outerNodeLabel["font-size"] = d3.min([layout.outerNodeLabel["font-size"], maxLabelHeight]);

                let label = vis.selectAll("text.outer-label")
                    .data(descendants.filter(d => d.x !== undefined && !d.children))
                    .enter().append("text")
                    .attr("class", "outer-label")
                    .attr("dy", ".31em")
                    .attr("text-anchor", d => d.x < 180 ? "start" : "end")
                    .attr("transform", d => `rotate(${d.x - 90})
                                             translate(${totalTreeLength + labelOffset + multipleTreeOffset})
                                             rotate(${d.x < 180 ? 0 : 180})`)
                    .text(d => d.data.name);

                multiAttr.call(label, layout.outerNodeLabel);

                svg.selectAll("text").attr("fill", layout.textColour);

                legend.each(moveToFront);
                titleSVG.each(moveToFront);


                function mouseovered(active) {
                    return function(d) {

                        hovering = active;
                        let hoveredNode = d3.select(d.nodeGroupNode);

                        hoveredNode.select("text.mouseover-label")
                            .style("opacity", active ? 1 : 1e-6)
                            .attr("transform", active ? `rotate(${-rotate -d.x + 90})` : "rotate(90)");
                        hoveredNode.select("rect")
                            .style("opacity", active ? 0.9 : 1e-6)
                            .attr("transform", active ? `rotate(${-rotate -d.x + 90})` : "rotate(90)");

                        do {
                            d3.select(d.inLinkNode)
                                .classed("link-active", active)
                                .each(moveToFront);
                            if (d.outLinkNodes) {
                                d.outLinkNodes.forEach(node => d3.select(node).classed("link-affected", active));
                            }
                            d3.select(d.nodeGroupNode)
                                .classed("node-active", active)
                                .each(moveToFront)
                                .selectAll("circle")
                                .attr("stroke-width", d => {
                                    let strokeWidth = nodeAttr["stroke-width"](d);
                                    return active ? strokeWidth + 1: strokeWidth;
                                });
                        } while (d = d.parent);

                        hoveredNode.each(moveToFront);

                        if (hoveredNode.classed("node-aligned")) {
                            d3.selectAll("g.node-aligned text.mouseover-label").style("opacity", active ? 1 : 1e-6);
                            d3.selectAll("g.node-aligned rect").style("opacity", active ? 0.9 : 1e-6);
                        }
                    };
                }

                function clicked(selectedNode) {
                    rotationDifference = selectedNode.x < prevX ? 360 - prevX + selectedNode.x : selectedNode.x - prevX;
                    if(rotationDifference > 180) rotationDifference = 360 - rotationDifference;
                    prevX = selectedNode.x;

                    rotate = 360 - selectedNode.x;
                    if (rotate > 360) rotate %= 360;
                    else if (rotate < 0) rotate = (360 + rotate) % 360;

                    d3.selectAll("g.node text.mouseover-label").attr("transform", "rotate(90)").style("opacity", 1e-6);
                    d3.selectAll("g.node rect").attr("transform", "rotate(90)").style("opacity", 1e-6);

                    let alignedNotActive = d3.selectAll("g.node-aligned:not(.node-active)"),
                        duration = alignedNotActive.size() || !rotateOld ? reorgDuration : 0;

                    alignedNotActive.classed("node-aligned", false)
                        .each((d) => {
                            d._x = d.x;
                            d.x = d.x0;
                        })
                        .transition()
                        .duration(duration)
                        .attrTween("transform", tweenNodeGroup)
                        .on("end", d => d._x = undefined);

                    heatmapCircle.transition()
                        .duration(duration)
                        .attrTween("transform", tweenNodeGroup);

                    d3.selectAll("g.node-active")
                        .classed("node-aligned", true)
                        .each((d) => {
                                d._x = d.x;
                                d.x = selectedNode.x;
                        })
                        .transition()
                        .duration(duration)
                        .attrTween("transform", tweenNodeGroup);

                    d3.selectAll("path.link-affected, path.link-displaced")
                        .classed("link-displaced", true)
                        .transition()
                        .duration(duration)
                        .attrTween("d", tweenPath);

                    d3.selectAll("path.link-displaced:not(.link-affected)")
                        .classed("link-displaced", false);

                    d3.selectAll("g.node-aligned text.mouseover-label")
                        .transition().style("opacity", 1);

                    d3.selectAll("g.node-aligned rect").style("opacity", 0.9);

                    if(rotationDifference > 0) {
                        vis.transition()
                            .delay(duration)
                            .duration(transitionScale(rotationDifference + 1))
                            .attr("transform", `translate(${visTranslate[0]},${visTranslate[1]})rotate(${rotate})`)
                            .on("end", function () {
                                d3.select(this).selectAll("text.outer-label")
                                    .attr("text-anchor", d => (d.x + rotate) % 360 < 180 ? "start" : "end")
                                    .attr("transform", d => `rotate(${d.x - 90})
                                                             translate(${totalTreeLength + labelOffset + multipleTreeOffset})
                                                             rotate(${(d.x + rotate) % 360 < 180 ? 0 : 180})`);
                            });
                    }

                    rotateOld = rotate;
                }

                function toggleNodeClickCallback(active) {
                    if (scope.nodeClick === undefined) return;

                    function nodeClickCallback(d) {
                        scope.nodeClick({ $event: d3.event, $node: d.data});
                    }

                    node.on('click', active ? nodeClickCallback : null);
                }

                function mouse(element) { return d3.mouse(element).map((d, i) => d - visTranslate[i]); }

                function getBB(selection) {
                    selection.each(function(d){d.bbox = this.getBBox();})
                }

                function moveToFront() {
                    this.parentNode.appendChild(this);
                }                
                
                function project(d) {
                    let r = d.y, a = (d.x - 90) / 180 * Math.PI;
                    return [r * Math.cos(a), r * Math.sin(a)];
                }

                function cross(a, b) { return a[0] * b[1] - a[1] * b[0]; }
                
                function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

                function step(d) {
                    let s = project(d.parent),
                        m = project({x: d.x, y: d.parent.y}),
                        t = project(d),
                        r = d.parent.y,
                        sweep = d.x > d.parent.x ? 1 : 0,
                        largeArc = Math.abs(d.x - d.parent.x) % 360 > 180 ? 1 : 0;

                    return `M${s[0]},${s[1]}A${r},${r} 0 ${largeArc},${sweep} ${m[0]},${m[1]}L${t[0]},${t[1]}`;
                }

                function tweenPath(d) {
                    let midSourceX = d.parent._x !== undefined ? d3.interpolateNumber(d.parent._x, d.parent.x) : () => d.parent.x,
                        midTargetX = d._x !== undefined ? d3.interpolateNumber(d._x, d.x) : () => d.x,
                        midpoints = {x: 0, y: d.y, parent: {x: 0, y:  d.parent.y}};

                    return function(t) {
                        midpoints.parent.x = midSourceX(t);
                        midpoints.x = midTargetX(t);
                        return step(midpoints);
                    };
                }

                function tweenNodeGroup(d) {
                    let midpointX = d._x !== undefined ? d3.interpolateNumber(d._x, d.x) : () => d.x;

                    return function(t) {
                        let x = midpointX(t);
                        return `rotate(${(x - 90)})translate(${d.y})`;
                    }
                }

                let controls = {
                    'download': function() {},
                    'zoom': toggleMove
                };

                createPlotControls(element[0], controls);

                function toggleMove(toggle) {
                    if (toggle) {
                        node.on("click", clicked);
                        chart.on("mousedown", function () {
                            if (!hovering) {
                                svg.style("cursor", "move");
                                start = mouse(svg.node());
                                d3.event.preventDefault();
                            }
                        })
                            .on("mouseup", function () {
                            if (start && !hovering) {
                                svg.style("cursor", "auto");
                                let m = mouse(svg.node());
                                rotate += Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                                if (rotate > 360) rotate %= 360;
                                else if (rotate < 0) rotate = (360 + rotate) % 360;
                                start = null;
                                vis.attr("transform", `translate(${visTranslate[0]},${visTranslate[1]})rotate(${rotate})`)
                                    .selectAll("text.outer-label")
                                    .attr("text-anchor", d=> (d.x + rotate) % 360 < 180 ? "start" : "end")
                                    .attr("transform", d => `rotate(${d.x - 90})
                                                             translate(${totalTreeLength + labelOffset + multipleTreeOffset})
                                                             rotate(${(d.x + rotate) % 360 < 180 ? 0 : 180})`);
                            }
                        })
                            .on("mousemove", function () {
                                if (start) {
                                    let m = mouse(svg.node());
                                    let delta = Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                                    vis.attr("transform", `translate(${visTranslate[0]},${visTranslate[1]})rotate(${rotate + delta})`);
                                }
                            });
                    }
                    else {
                        node.on("click", null);
                        toggleNodeClickCallback(true);
                        chart.on("mousedown", null)
                            .on("mouseup", null)
                            .on("mousemove", null);
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

function spreadNodes(node, level=0) {
    if (!node.children || !node.children.length) {
        node._depth = 1;
        return level;
    }
    let max = 1, childMax;
    for (let child of node.children) {
        childMax = spreadNodes(child, level + 1);
        if (childMax > max) {
            max = childMax;
        }
    }
    node._depth = level / max;
    return max;
}

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
        while(parent = currentNode.parent) {
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

let layoutTemplate = {
    title: null,
    width: null,
    height: 600,
    backgroundColour: "none",
    textColour: "black",
    margin: {
        top: 10,
        bottom: 10,
        right: 10,
        left: 10
    },
    nodeTypes: {},
    nodeLabel: {
        "font-size": 12,
        "font-family": "Roboto,Helvetica Neue,sans-serif"
    },
    outerNodeLabel: {
        "font-size": 14,
        "font-family": "Roboto,Helvetica Neue,sans-serif"
    },
    link: {
        stroke: "#ccc",
        "stroke-width": 1
    },
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
        orientation: "vertical",
        backgroundColour: null
    }
};

export default angular.module('ancestry.radial-lineage', ['ancestry.utils'])
    .directive('radialLineagePlot', RadialLineagePlotDirective);


