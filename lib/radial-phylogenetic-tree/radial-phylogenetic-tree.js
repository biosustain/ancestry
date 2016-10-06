import './radial-phylogenetic-tree.css!'
import '../utils.js'
import angular from 'angular'
import * as d3 from 'd3'
import { d3legend, createTreeLayout, mergeTemplateLayout, calcColourBarSize, drawColourBar,
    createNodeTypes, createDynamicNodeAttr, testLabelLength, multiAttr, createPlotControls } from '../shared-features.js'

function RadialPhylogeneticTreeDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            branchlength: '='
        },
        link(scope, element, attributes) {

            element.addClass("ancestry ancestry-radial-phylogenetic-tree");

            let svg = d3.select(element[0])
                .style("position", "relative")
                .append("svg")
                .style("width", "100%");

            let hovering = false,
                virtualRoot = null,
                virtualRootName = "virtual_root",
                r,
                labelOffset = 20,
                defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                link = null,
                node = null,
                linkExtension = null,
                totalTreeLength,
                multipleTreeOffset = 0,
                visibleSeries = new Set(),
                colours = d3.scaleOrdinal(d3.schemeCategory10);

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                let defs = svg.append("defs");

                // do not continue rendering if there is no data
                if (!scope.value || !scope.value.data.length) return;

                let seriesNames = Array.from(new Set(extractProp(scope.value.data, "series")));

                if (options.isNewData) {
                    colours.domain([]);
                    visibleSeries = new Set(seriesNames);
                }

                let copy = angular.copy(scope.value),
                    treeData = copy.data,
                    layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                    pathname = $window.location.pathname;

                let elementWidth = element[0].offsetWidth;

                treeData = treeData.map(t => collapseSeries(t, visibleSeries)).filter(t => t !== null);

                let isMultipleTree = treeData.length > 1,
                    longestNodeName = treeData.length ? extractProp(treeData, "name")
                        .reduce((a, b) => a.length > b.length ? a : b) : "",
                    maxLabelLength = testLabelLength(svg, longestNodeName, layout.outerNodeLabel),
                    colourBarOffset = 20,
                    start = null,
                    rotate = 0,
                    heatmapColourScale = null,
                    heatmapCircle = null,
                    trees = null,
                    legendHeight = 0, legendWidth = 0, colourbarHeight = 0, colourbarWidth = 0,
                    legendOut = {top:false, right: false, bottom:false, left:false},
                    colourBarOrigWidth = layout.heatmap.colourBar.width, colourBarOrigHeight = layout.heatmap.colourBar.height,
                    showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
                    legend = d3.select(),
                    colourbar = d3.select(),
                    titleSVG = d3.select();

                let width = layout.width || elementWidth,
                    height = layout.height;

                svg.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", "white");

                if (layout.legend.show) {
                    if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                    if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                }

                let margin = layout.margin;
                if (layout.title) margin.top += legendOut.top ? 26 : 25;

                let chart = svg.append("g");

                multipleTreeOffset = isMultipleTree ? 30 : 0;

                if (layout.heatmap.enabled) {

                    let domain = d3.extent(extractProp(treeData, "z").filter(d => !!d));

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
                height = layout.height - margin.top - margin.bottom;

                let r = Math.min(height, width) / 2;

                totalTreeLength =  r - maxLabelLength - labelOffset - multipleTreeOffset;

                chart.attr("transform", `translate(${margin.left},${margin.top})`);

                if (layout.legend.show) {
                    let pos = layout.legend.position,
                        anchor = layout.legend.anchor,
                        posX = pos.x === "left" ? width / 2 - r : (pos.x === "right" ? width / 2 + r + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2),
                        posY = pos.y === "top" ? height / 2 - r : (pos.y === "bottom" ? height / 2 + r: height / 2);

                    legend.attr("transform", `translate(${posX},${posY})`);
                }

                if(isMultipleTree) {
                    virtualRoot = {
                        name: virtualRootName,
                        parent: null,
                        children: [],
                        series: 0,
                        _depth: 0,
                        length: 0,
                        type: undefined
                    };

                    for(let tree of treeData) {
                        spreadNodes(tree);
                        tree.parent = virtualRootName;
                        virtualRoot.children.push(tree);
                    }
                    trees = virtualRoot;
                }
                else if (treeData.length) {
                    trees = treeData[0];
                    spreadNodes(trees);
                }

                let types = createNodeTypes(treeData, layout.nodeTypes, defaultNode),
                    nodeAttr = createDynamicNodeAttr(types, Object.keys(defaultNode));


                let treeLayout = d3.cluster().size([360, 1]).separation(() => 1),
                    treeRoot = d3.hierarchy(trees, d => d.children).sort((a,b) => b.depth - a.depth),
                    nodes = treeLayout(treeRoot),
                    descendants = nodes.descendants().filter(n => n.parent != null );

                svg.attr("width", width + margin.left + margin.right)
                    .attr("height",  height + margin.top + margin.bottom)
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
                    d.y = d.name === virtualRootName ? 0 : multipleTreeOffset + d.data._depth * (totalTreeLength);
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
                        .data(descendants.filter(n => n.data.taxon && n.data.taxon.name !== null &&!isNaN(parseFloat(n.data.taxon.z))))
                        .enter()
                        .append("circle")
                        .attr("class", "heatmap-circle")
                        .style("fill", d => heatmapColourScale(d.data.taxon.z))
                        .style("opacity", layout.heatmap.opacity)
                        .attr("transform", d => `rotate(${d.x - 90})translate(${d.y})`);

                    multiAttr.call(heatmapCircle, layout.heatmap.circle);
                }

                if (treeData.length) {
                    removeNegativeLengths(trees);
                    setRadius(trees, trees.length = 0, totalTreeLength / maxLength(trees));
                }

                let show = scope.branchlength !== undefined ? scope.branchlength : true;
                linkExtension = vis.append("g")
                    .selectAll("path")
                    .data(descendants.filter(d => !d.children))
                    .enter().append("path")
                    .attr("stroke", "black")
                    .style("opacity", 0.2)
                    .attr("class", "link-extension")
                    .each(function(d) { d.linkExtensionNode = this; })
                    .attr("d", d => step2(d.x, show ? d.data.radius : d.y, d.x, totalTreeLength + multipleTreeOffset));

                link = vis.append("g")
                    .selectAll("path")
                    .data(descendants.filter(n => n.parent.data.name != virtualRootName))
                    .enter().append("path")
                    .attr("class", "link")
                    .attr("fill", "none")
                    .each(function(d) { d.linkNode = this; })
                    .attr("d", d =>  step2(d.parent.x, show ? d.parent.data.radius : d.parent.y, d.x, show ? d.data.radius : d.y))
                    .style("stroke", "black");

                multiAttr.call(link, layout.link);

                if (isMultipleTree) {
                    link.filter(d => d.parent.name === virtualRootName).style("opacity", 0);
                }

                if(layout.showLeafNodes) {
                    node = vis.selectAll("g.node")
                        .data(descendants.filter(d => !d.children || !d.children.length))
                        .enter().append("g")
                        //.attr("id", d => d.name)
                        .attr("class", "node")
                        .attr("transform", d => `rotate(${d.x - 90})translate(${d.y})`)
                        .on("mouseover", mouseovered(true))
                        .on("mouseout", mouseovered(false))
                        .each(function(d) { d.nodeGroupNode = this; });

                    node.filter(d => !d.data.taxon)
                        .style("opacity", 0);

                    let nodeCircle = node.append("circle")
                        .attr("fill", "white")
                        .style("stroke", d => d.data.taxon && d.data.name !== virtualRootName ? colours(d.data.taxon.series) : "none");

                    multiAttr.call(nodeCircle, nodeAttr);
                }

                let maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + labelOffset) /
                    descendants.filter(d => !d.children || !d.children.length).length;

                layout.outerNodeLabel["font-size"] = d3.min([layout.outerNodeLabel["font-size"], maxLabelHeight]);

                let label = vis.selectAll("text.outer-label")
                    .data(descendants.filter(d => !!d.data.taxon))
                    .enter().append("text")
                    .attr("class", "outer-label")
                    .attr("dy", ".31em")
                    .attr("text-anchor", d => d.x < 180 ? "start" : "end")
                    .attr("transform", d => `rotate(${d.x - 90})
                                             translate(${totalTreeLength + labelOffset + multipleTreeOffset})
                                             rotate(${d.x < 180 ? 0 : 180})`)
                    .text(d => d.data.taxon.name)
                    .on("mouseover", mouseovered(true))
                    .on("mouseout", mouseovered(false));

                multiAttr.call(label, layout.outerNodeLabel);

                legend.each(moveToFront);
                titleSVG.each(moveToFront);

                function mouseovered(active) {
                    return function(d) {
                        d3.select(this).classed("label-active", active);
                        d3.select(d.linkExtensionNode).classed("link-extension-active", active).each(moveToFront);
                        do d3.select(d.linkNode).classed("link-active", active).each(moveToFront); while (d = d.parent);
                    };
                }



                let controls = {
                    'download': function() {},
                    'zoom': toggleMove
                };

                createPlotControls(element[0], controls);

                function toggleMove(toggle) {
                    if (toggle) {
                        chart.on("mousedown", function() {
                            if(!hovering) {
                                svg.style("cursor", "move");
                                start = mouse(svg.node());
                                d3.event.preventDefault();
                            }
                        })
                        .on("mouseup", function() {
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
                        .on("mousemove", function() {
                            if (start) {
                                let m = mouse(svg.node());
                                let delta = Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                                vis.attr("transform", `translate(${visTranslate[0]},${visTranslate[1]})rotate(${rotate + delta})`);
                            }
                        });
                    }
                    else {
                        chart.on("mousedown", null)
                            .on("mouseup", null)
                            .on("mousemove", null);
                    }
                }

                function mouse(element) { return d3.mouse(element).map((d, i) => d - visTranslate[i]); }

                function moveToFront() {
                    this.parentNode.appendChild(this);
                }

                function cross(a, b) { return a[0] * b[1] - a[1] * b[0]; }

                function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
            }

            function setRadius(d, y0, k) {
                d.radius = (y0 += d.length) * k + multipleTreeOffset;
                if (d.children && d.children.length > 0) d.children.forEach(d => setRadius(d, y0, k));
            }

            function removeNegativeLengths(d) {
                if (d.length < 0) d.length = 0;
                if (d.children && d.children.length > 0) d.children.forEach(removeNegativeLengths);
            }

            function maxLength(d) {
                return d.length + (d.children && d.children.length > 0 ? d3.max(d.children, maxLength) : 0);
            }

            function step2(startAngle, startRadius, endAngle, endRadius) {
                var c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
                    s0 = Math.sin(startAngle),
                    c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
                    s1 = Math.sin(endAngle);
                return "M" + startRadius * c0 + "," + startRadius * s0
                    + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 "
                    + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
                    + "L" + endRadius * c1 + "," + endRadius * s1;
            }

            function extractProp(trees, prop) {
                let values = [];
                for (let tree of trees) {
                    extract(tree);
                }
                function extract(tree) {
                    if (tree.taxon !== null) values.push(tree.taxon[prop]);
                    else {
                        extract(tree.children[0]);
                        extract(tree.children[1]);
                    }
                }
                return values;
            }

            // Handle window resize event.
            scope.$on('window-resize', (event) => {
                render({isNewData: false});
            });

            scope.$watch("value", () => {
                render({isNewData: true});
            });

            scope.$watch("branchlength", (show) => {
                if (!linkExtension || !link || !totalTreeLength) return;
                d3.transition().duration(750).each(function() {
                    linkExtension.transition().attr("d", d => step2(d.x, show ? d.data.radius : d.y, d.x, totalTreeLength + multipleTreeOffset));
                    link.transition().attr("d", d =>  step2(d.parent.x, show ? d.parent.data.radius : d.parent.y, d.x, show ? d.data.radius : d.y));
                });
            })
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

function collapseSeries(tree, visibleSeries) {

    let leaves = [];
    (function findLeaves(t) {
        if (t.taxon !== null) {
            leaves.push(t);
            return;
        }
        findLeaves(t.children[0]);
        findLeaves(t.children[1]);
    })(tree);
    (function addParents(t, parent) {
        if (parent) {
            t.parent = parent;
        }
        if (t.taxon !== null) {
            return;
        }
        addParents(t.children[0], t);
        addParents(t.children[1], t);
    })(tree, null);
    let leavesOut = leaves.filter(l => !visibleSeries.has(l.taxon.series));

    for (let leaf of leavesOut) {
        let parent = leaf.parent;
        if (!parent && leaf.taxon) {
            return null;
        }
        let sibling = parent.children[parent.children.indexOf(leaf) ^ 1];
        let parent2 = parent.parent;
        if (!parent2) {
            sibling.parent = null;
            tree = sibling;
            continue;
        }
        parent2.children[parent2.children.indexOf(parent)] = sibling;
        sibling.length += parent.length;
        sibling.parent = parent2;
    }
    return !tree.children.length ? null : tree;
}

let layoutTemplate = {
    title: null,
    width: null,
    height: 600,
    margin: {
        top: 10,
        bottom: 10,
        right: 10,
        left: 10
    },
    nodeTypes: {},
    showLeafNodes: true,
    outerNodeLabel: {
        "font-size": 14
    },
    link: {
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
        orientation: "vertical"
    }
};

export default angular.module('ancestry.radial-phylogenetic-tree', ['ancestry.utils'])
    .directive('radialPhylogeneticTree', RadialPhylogeneticTreeDirective);


