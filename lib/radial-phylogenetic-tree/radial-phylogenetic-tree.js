import './radial-phylogenetic-tree.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import { createTreeLayout, mergeTemplateLayout, calcColourBarSize, drawColourBar,
    createNodeTypes, createDynamicNodeAttr } from '../shared-features.js'

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
                margin,
                r,
                labelOffset = 15,
                defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                link = null,
                node = null,
                linkExtension = null,
                totalTreeLength,
                multipleTreeOffset = 0;

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                // do not continue rendering if there is no data
                if (!scope.value || !scope.value.data.length) return;

                let treeData = scope.value,
                    layout = mergeTemplateLayout(scope.value.layout, layoutTemplate),
                    pathname = $window.location.pathname;

                let elementWidth = element[0].offsetWidth;

                r = layout.size / 2;
                margin = layout.margin;

                let isMultipleTree = treeData.data.length > 1,
                    colourBarSpace = layout.heatmap.colourBar.show ? 80 : 0,
                    colourBarOffset = 100,
                    start = null,
                    rotate = 0,
                    colours = d3.scale.category10(),
                    heatmapColourScale = null,
                    heatmapCircle = null;

                multipleTreeOffset = isMultipleTree ? 30 : 0;
                totalTreeLength = r - margin - multipleTreeOffset;

                if(isMultipleTree) {
                    virtualRoot = {
                        name: "virtual_root",
                        parent: null,
                        children: [],
                        treeId: 0,
                        _depth: 0,
                        length: 0,
                        type: undefined
                    };

                    for(let tree of treeData.data) {
                        spreadNodes(tree);
                        tree.parent = "virtual_root";
                        virtualRoot.children.push(tree);
                    }
                    treeData.trees = virtualRoot;
                }
                else {
                    treeData.trees = treeData.data[0];
                    spreadNodes(treeData.trees);
                }

                let types = createNodeTypes(treeData.data, layout.nodeTypes, defaultNode),
                    nodeAttr = createDynamicNodeAttr(types, Object.keys(defaultNode));

                let cluster = d3.layout.cluster()
                    .size([360, 1])
                    .sort(null)
                    .children(d => d.children)
                    .separation(() => 1);

                let wrap = svg
                    .attr("width", elementWidth)
                    .attr("height", r * 2)
                    .style("-webkit-backface-visibility", "hidden");

                // Catch mouse events in Safari.
                wrap.append("rect")
                    .attr("width", elementWidth)
                    .attr("height", r * 2)
                    .attr("fill", "none");

                let defs = wrap.append("defs");

                let visTranslate = [(elementWidth - colourBarSpace) / 2, r],
                    vis = wrap.append("g")
                        .attr("transform", `translate(${visTranslate[0]},${visTranslate[1]})`);

                let nodes = cluster.nodes(treeData.trees),
                    links = cluster.links(nodes);

                nodes.forEach(d => {
                    d.y = d.name === "virtual_root" ? 0 : multipleTreeOffset + d._depth * (totalTreeLength);
                });

                if (layout.heatmap.enabled) {

                    let domain = d3.extent(nodes, node => node.taxon ? node.taxon.z : null);

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
                        layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, 2 * r);
                        layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, 2 * r);

                        let colourBarOffsetFromCenter = totalTreeLength + multipleTreeOffset + colourBarOffset;
                        let colourbar = wrap.append("g")
                            .attr("class", "plotify-colourbar")
                            .attr("transform", `translate(${(elementWidth - colourBarSpace) / 2 +
                                colourBarOffsetFromCenter},${(2 * r - layout.heatmap.colourBar.height)/2})`);

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                    }
                }

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
                setRadius(treeData.trees, treeData.trees.length = 0, totalTreeLength / maxLength(treeData.trees));

                linkExtension = vis.append("g")
                    .selectAll("path")
                    .data(links.filter(function(d) { return !d.target.children; }))
                    .enter().append("path")
                    .attr("class", "link-extension")
                    .each(function(d) { d.target.linkExtensionNode = this; })
                    .attr("d", function(d) { return step2(d.target.x, d.target.y, d.target.x, totalTreeLength + multipleTreeOffset); });

                link = vis.append("g")
                    .selectAll("path")
                    .data(links)
                    .enter().append("path")
                    .attr("class", "link")
                    .each(function(d) { d.target.linkNode = this; })
                    .attr("d", function(d) { return step2(d.source.x, d.source.y, d.target.x, d.target.y) })
                    .style("stroke", d => colours(d.treeId));

                if (isMultipleTree) {
                    link.filter(d => d.source.name === "virtual_root").style("opacity", 0);
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
                        .style("stroke", d => colours(d.treeId))
                        .attr(nodeAttr);
                }

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

                wrap.on("mousedown", function() {
                    if(!hovering) {
                        wrap.style("cursor", "move");
                        start = mouse(this);
                        d3.event.preventDefault();
                    }
                });
                svg.on("mouseup", function() {
                        if (start && !hovering) {
                            wrap.style("cursor", "auto");
                            let m = mouse(wrap.node());
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
                            let m = mouse(wrap.node());
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
                if(d.length < 0) d.length = 0;
                d.radius = (y0 += d.length) * k + multipleTreeOffset;
                if (d.children && d.children.length > 0) d.children.forEach(function(d) { setRadius(d, y0, k); });
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
            // Handle window resize event.
            //scope.$on('window-resize', (event) => {
            //    render(scope.value);
            //});

            scope.$watch("value", () => {
                render(scope.value);
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

let layoutTemplate = {
    title: "",
    size: 600,
    margin: 50,
    nodeTypes: {},
    showLeafNodes: true,
    outerNodeLabel: {
        "font-size": 14
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
            height: "70%",
            width: 30
        },
        circle: {
            r: 16
        },
        opacity: 0.4
    }
};

export default angular.module('plotify.radial-phylogenetic-tree', ['plotify.utils'])
    .directive('radialPhylogeneticTree', RadialPhylogeneticTreeDirective);


