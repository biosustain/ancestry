import './radial-phylogenetic-tree.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import { d3legend, createTreeLayout, mergeTemplateLayout, calcColourBarSize, drawColourBar,
    createNodeTypes, createDynamicNodeAttr, testLabelLength } from '../shared-features.js'

function RadialPhylogeneticTreeDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            branchlength: '='
        },
        link(scope, element, attributes) {

            element.addClass("plotify plotify-radial-phylogenetic-tree");

            let svg = d3.select(element[0])
                .append("svg");

            let hovering = false,
                virtualRoot = null,
                virtualRootName = "virtual_root",
                margin,
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
                visibleSeries = null;

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                let defs = svg.append("defs");

                // do not continue rendering if there is no data
                if (!scope.value || !scope.value.data.length) return;

                let seriesNames = Array.from(new Set(extractProp(scope.value.data, "series")));

                if (visibleSeries == null) visibleSeries = new Set(seriesNames);

                let copy = angular.copy(scope.value),
                    treeData = copy.data,
                    layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                    pathname = $window.location.pathname,
                    longestNodeName = treeData.length ? extractProp(treeData, "name")
                        .reduce((a, b) => a.length > b.length ? a : b) : "";

                let elementWidth = element[0].offsetWidth;

                for (let t of treeData) {
                    collapseSeries(t, visibleSeries);
                }

                r = layout.size / 2;
                margin = layout.margin;

                let isMultipleTree = treeData.length > 1,
                    maxLabelLength = testLabelLength(svg, longestNodeName, layout.outerNodeLabel),
                    colourBarOffset = 20,
                    start = null,
                    rotate = 0,
                    colours = d3.scale.category10(),
                    heatmapColourScale = null,
                    heatmapCircle = null,
                    trees = null,
                    legendHeight = 0, legendWidth = 0, colourbarHeight = 0, colourbarWidth = 0,
                    legend = d3.select(),
                    colourbar = d3.select();

                let width = elementWidth,
                    height = layout.size;

                let chart = svg.append("g")
                    .attr("transform", `translate(${margin},${margin})`);

                multipleTreeOffset = isMultipleTree ? 30 : 0;
                totalTreeLength =  r - maxLabelLength - labelOffset - multipleTreeOffset;

                if (layout.heatmap.enabled) {

                    let domain = d3.extent(copy.data, node => node.z);

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
                        layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, layout.size);
                        layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, layout.size);

                        colourbar = chart.append("g")
                            .attr("class", "plotify-colourbar").attr("transform", "translate(0,0)");

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                        let bbox = colourbar.node().getBoundingClientRect();

                        colourbarWidth = bbox.width;
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

                width = elementWidth - 2 * margin;
                height = layout.size + (layout.legend.position === "bottom" || layout.legend.position === "top" ? legendHeight : 0);


                colourbar.attr("transform", `translate(${width / 2 + r + colourBarOffset},${(height - layout.heatmap.colourBar.height)/2})`);

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
                else {
                    trees = treeData[0];
                    spreadNodes(trees);
                }

                let types = createNodeTypes(treeData, layout.nodeTypes, defaultNode),
                    nodeAttr = createDynamicNodeAttr(types, Object.keys(defaultNode));

                let cluster = d3.layout.cluster()
                    .size([360, 1])
                    .sort((a, b) => d3.ascending(a.length, b.length))
                    .children(d => d.children)
                    .separation(() => 1);

                svg.attr("width", elementWidth)
                    .attr("height",  height + 2 * layout.margin)
                    .style("-webkit-backface-visibility", "hidden");

                // Catch mouse events in Safari.
                svg.append("rect")
                    .attr("width", elementWidth)
                    .attr("height", r * 2)
                    .attr("fill", "none");

                let visTranslate = [width / 2, r],
                    vis = chart.append("g")
                        .attr("transform", `translate(${visTranslate[0]},${visTranslate[1]})`);

                let nodes = cluster.nodes(trees),
                    links = cluster.links(nodes);

                nodes.forEach(d => {
                    d.y = d.name === virtualRootName ? 0 : multipleTreeOffset + d._depth * (totalTreeLength);
                });

                if (layout.heatmap.enabled) {
                    heatmapCircle = vis.append("g")
                        .attr("class", "heatmap-layer")
                        .selectAll("circle.heatmap-circle")
                        .data(nodes.filter(n => n.taxon && n.taxon.name !== null &&!isNaN(parseFloat(n.taxon.z))))
                        .enter()
                        .append("circle")
                        .attr("class", "heatmap-circle")
                        .style("fill", d => heatmapColourScale(d.taxon.z))
                        .style("opacity", layout.heatmap.opacity)
                        .attr(layout.heatmap.circle)
                        .attr("transform", d => `rotate(${d.x - 90})translate(${d.y})`)
                }


                removeNegativeLengths(trees);
                setRadius(trees, trees.length = 0, totalTreeLength / maxLength(trees));

                let show = scope.branchlength !== undefined ? scope.branchlength : true;
                linkExtension = vis.append("g")
                    .selectAll("path")
                    .data(links.filter(d => !d.target.children))
                    .enter().append("path")
                    .attr("class", "link-extension")
                    .each(function(d) { d.target.linkExtensionNode = this; })
                    .attr("d", d => step2(d.target.x, show ? d.target.radius : d.target.y, d.target.x, totalTreeLength + multipleTreeOffset));

                link = vis.append("g")
                    .selectAll("path")
                    .data(links)
                    .enter().append("path")
                    .attr("class", "link")
                    .attr(layout.link)
                    .each(function(d) { d.target.linkNode = this; })
                    .attr("d", d =>  step2(d.source.x, show ? d.source.radius : d.source.y, d.target.x, show ? d.target.radius : d.target.y))
                    .style("stroke", "black");

                if (isMultipleTree) {
                    link.filter(d => d.source.name === virtualRootName).style("opacity", 0);
                }

                if(layout.showLeafNodes) {
                    node = vis.selectAll("g.node")
                        .data(nodes)
                        .enter().append("g")
                        //.attr("id", d => d.name)
                        .attr("class", "node")
                        .attr("transform", d => `rotate(${d.x - 90})translate(${d.y})`)
                        .on("mouseover", mouseovered(true))
                        .on("mouseout", mouseovered(false))
                        .each(function(d) { d.nodeGroupNode = this; });

                    node.filter(d => !d.taxon)
                        .style("opacity", 0);

                    node.append("circle")
                        .style("stroke", d => d.taxon && d.name !== virtualRootName ? colours(d.taxon.series) : "none")
                        .attr(nodeAttr);
                }

                let maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + labelOffset) /
                    nodes.filter(d => !d.children || !d.children.length).length;

                layout.outerNodeLabel["font-size"] = d3.min([layout.outerNodeLabel["font-size"], maxLabelHeight]);

                let label = vis.selectAll("text.outer-label")
                    .data(nodes.filter(d => !!d.taxon))
                    .enter().append("text")
                    .attr(layout.outerNodeLabel)
                    .attr("class", "outer-label")
                    .attr("dy", ".31em")
                    .attr("text-anchor", d => d.x < 180 ? "start" : "end")
                    .attr("transform", d => `rotate(${d.x - 90})
                                             translate(${totalTreeLength + labelOffset + multipleTreeOffset})
                                             rotate(${d.x < 180 ? 0 : 180})`)
                    .text(d => d.taxon.name)
                    .on("mouseover", mouseovered(true))
                    .on("mouseout", mouseovered(false));

                function mouseovered(active) {
                    return function(d) {
                        d3.select(this).classed("label-active", active);
                        d3.select(d.linkExtensionNode).classed("link-extension-active", active).each(moveToFront);
                        do d3.select(d.linkNode).classed("link-active", active).each(moveToFront); while (d = d.parent);
                    };
                }

                svg.on("mousedown", function() {
                    if(!hovering) {
                        svg.style("cursor", "move");
                        start = mouse(this);
                        d3.event.preventDefault();
                    }
                });
                svg.on("mouseup", function() {
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
                let names = [];
                for (let tree of trees) {
                    extract(tree);
                }
                function extract(tree) {
                    if (tree.taxon !== null) names.push(tree.taxon[prop]);
                    else {
                        extract(tree.children[0]);
                        extract(tree.children[1]);
                    }
                }
                return names;
            }

            // Handle window resize event.
            scope.$on('window-resize', (event) => {
                render();
            });

            scope.$watch("value", () => {
                render();
            });

            scope.$watch("branchlength", (show) => {
                if (!linkExtension || !link) return;
                d3.transition().duration(750).each(function() {
                    linkExtension.transition().attr("d", d => step2(d.target.x, show ? d.target.radius : d.target.y, d.target.x, totalTreeLength + multipleTreeOffset));
                    link.transition().attr("d", d =>  step2(d.source.x, show ? d.source.radius : d.source.y, d.target.x, show ? d.target.radius : d.target.y));
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
            return sibling;
        }
        parent2.children[parent2.children.indexOf(parent)] = sibling;
        sibling.length += parent.length;
        sibling.parent = parent2;
    }
}

let layoutTemplate = {
    title: "",
    size: 600,
    margin: 25,
    nodeTypes: {},
    showLeafNodes: true,
    outerNodeLabel: {
        "font-size": 14
    },
    link: {
        "stroke-width": 1.5
    },
    heatmap: {
        enabled: false,
        colourScale: [
            [0, '#008ae5'],
            [1, 'yellow']
        ],
        colourBar: {
            show: true,
            height: "70%",
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

export default angular.module('plotify.radial-phylogenetic-tree', ['plotify.utils'])
    .directive('radialPhylogeneticTree', RadialPhylogeneticTreeDirective);


