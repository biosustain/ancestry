import './radial-lineage-plot.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import { d3tooltip, createTreeLayout, mergeTemplateLayout, calcColourBarSize, drawColourBar,
    createNodeTypes, createDynamicNodeAttr } from '../shared-features.js'

function RadialLineagePlotDirective($window, WindowResize, $location) {
    return {
        restrict: 'EA',
        scope: {
            value: '='
        },
        link(scope, element, attributes) {

            element.addClass("plotify plotify-radial-lineage-plot");

            let svg = d3.select(element[0])
                .append("svg");

            let colours = d3.scale.category10().range(),
                tooltip = new d3tooltip(d3.select(element[0])),
                hovering = false,
                virtualRoot = null,
                margin,
                r,
                rot = 0,
                labelOffset = 15,
                defaultNode = {
                    r: 4,
                    "stroke-width": 2
                };

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                // do not continue rendering if there is no data
                if (!scope.value || !scope.value.data.length) return;

                let treeData = scope.value,
                    layout = mergeTemplateLayout(scope.value.layout, layoutTemplate);

                treeData.trees = createTreeLayout(treeData.data);

                let elementWidth = element[0].offsetWidth;

                r = layout.size / 2;
                margin = layout.margin;

                let isMultipleTree = treeData.trees.length > 1,
                    multipleTreeOffset = isMultipleTree ? 30 : 0,
                    totalTreeLength = r - margin - multipleTreeOffset,
                    colourBarSpace = layout.heatmap.colourBar.show ? 80 : 0,
                    start = null,
                    rotate = 0,
                    rotateOld = 0,
                    rotationDifference,
                    div = element[0],
                    transitionScale = d3.scale.log().domain([1, 181]).range([0, 1500]),
                    colours = d3.scale.category10(),
                    reorgDuration = 1000,
                    prevX = 0,
                    heatmapColourScale = null,
                    heatmapCircle = null;

                if(isMultipleTree) {
                    virtualRoot = {
                        name: "virtual_root",
                        parent: null,
                        children: [],
                        treeId: 0,
                        _depth: 0,
                        type: undefined
                    };

                    for(let tree of treeData.trees) {
                        spreadNodes(tree);
                        tree.parent = "virtual_root";
                        virtualRoot.children.push(tree);
                    }
                    treeData.trees = virtualRoot;
                }
                else {
                    treeData.trees = treeData.trees[0];
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
                    d.x0 = d.x; // remember initial position
                    if (d.name === "virtual_root")
                        d.y = 0;
                    else
                        d.y = multipleTreeOffset + d._depth * (totalTreeLength);
                });

                if (layout.heatmap.enabled) {

                    let domain = d3.extent(nodes, node => node.z);

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

                        let colourbar = wrap.append("g")
                            .attr("class", "plotify-colourbar")
                            .attr("transform", `translate(${(elementWidth - colourBarSpace) / 2 + r},${(2 * r - layout.heatmap.colourBar.height)/2})`);

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, $location.path());
                    }
                }

                // TODO: implement equidistant generations
                //let maxGen = 15;//d3.max(treeData.trees[0].map(d => d.generation));
                //nodes.forEach(function(d){d.y = d.generation / maxGen * 300});

                if (layout.heatmap.enabled) {
                    heatmapCircle = vis.append("g")
                        .attr("class", "heatmap-layer")
                        .selectAll("circle.heatmap-circle")
                        .data(nodes.filter(n => n.name != "virtual_root" && !isNaN(parseFloat(n.z))))
                        .enter()
                        .append("circle")
                        .attr("class", "heatmap-circle")
                        .style("fill", d => heatmapColourScale(d.z))
                        .style("opacity", layout.heatmap.opacity)
                        .attr(layout.heatmap.circle)
                        .attr("transform", d => `rotate(${d.x - 90})translate(${d.y})`)
                }

                let link = vis.selectAll("path.link")
                    .data(links)
                    .enter().append("path")
                    .attr("class", "link")
                    .attr("d", step)
                    .attr(layout.link)
                    .each(function(d) {
                        d.target.inLinkNode = this;
                        if(d.source.outLinkNodes) d.source.outLinkNodes.push(this);
                        else d.source.outLinkNodes = [this];
                    });

                let node = vis.selectAll("g.node")
                    .data(nodes.filter(n => n.x !== undefined))
                    .enter().append("g")
                    .attr("id", d => d.name)
                    .attr("class", "node")
                    .attr("transform", d => `rotate(${d.x - 90})translate(${d.y})`)
                    .on("mouseover", mouseovered(true))
                    .on("mouseout", mouseovered(false))
                    .on("click", clicked)
                    .each(function(d) { d.nodeGroupNode = this; });

                
                if (isMultipleTree) {
                    let virtualNode = vis.select("g.node#virtual_root");

                    virtualNode.style("visibility", "hidden")
                    virtualNode.data()[0].outLinkNodes.forEach(link => {
                        d3.select(link).style("visibility", "hidden");
                    });
                }

                node.append("text")
                    .attr("class", "mouseover-label")
                    .attr("transform", "rotate(90)")
                    .attr("dy", ".25em")
                    .attr("dx", ".6em")
                    .attr(layout.nodeLabel)
                    .style("opacity", 1e-6)
                    .text(d => d.name)
                    .call(getBB);

                node.insert("rect","text")
                    .attr("x", d => d.bbox.x - 3)
                    .attr("y", d => d.bbox.y)
                    .attr("width", d => d.bbox.width + 6)
                    .attr("height", d => d.bbox.height + 3)
                    .attr("transform", "rotate(90)")
                    .style("fill", "white")
                    .style("opacity", 1e-6);

                node.append("circle")
                    .style("stroke", d => colours(d.treeId))
                    .attr(nodeAttr);

                let label = vis.selectAll("text.outer-label")
                    .data(nodes.filter(d => d.x !== undefined && !d.children))
                    .enter().append("text")
                    .attr(layout.outerNodeLabel)
                    .attr("class", "outer-label")
                    .attr("dy", ".31em")
                    .attr("text-anchor", d => d.x < 180 ? "start" : "end")
                    .attr("transform", d => `rotate(${d.x - 90})
                                             translate(${totalTreeLength + labelOffset + multipleTreeOffset})
                                             rotate(${d.x < 180 ? 0 : 180})`)
                    .text(d => d.name);

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
                        .each("end", d => d._x = undefined);

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
                            .each("end", function () {
                                d3.select(this).selectAll("text.outer-label")
                                    .attr("text-anchor", d => (d.x + rotate) % 360 < 180 ? "start" : "end")
                                    .attr("transform", d => `rotate(${d.x - 90})
                                                             translate(${totalTreeLength + labelOffset + multipleTreeOffset})
                                                             rotate(${(d.x + rotate) % 360 < 180 ? 0 : 180})`);
                            });
                    }

                    rotateOld = rotate;
                }

                wrap.on("mousedown", function() {
                    if(!hovering) {
                        wrap.style("cursor", "move");
                        start = mouse(this);
                        d3.event.preventDefault();
                    }
                });
                d3.select(window)
                    .on("mouseup", function() {
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
                    let s = project(d.source),
                        m = project({x: d.target.x, y: d.source.y}),
                        t = project(d.target),
                        r = d.source.y,
                        sweep = d.target.x > d.source.x ? 1 : 0,
                        largeArc = Math.abs(d.target.x - d.source.x) % 360 > 180 ? 1 : 0;

                    return `M${s[0]},${s[1]}A${r},${r} 0 ${largeArc},${sweep} ${m[0]},${m[1]}L${t[0]},${t[1]}`;
                }

                function tweenPath(d) {
                    let midSourceX = d.source._x !== undefined ? d3.interpolateNumber(d.source._x, d.source.x) : () => d.source.x,
                        midTargetX = d.target._x !== undefined ? d3.interpolateNumber(d.target._x, d.target.x) : () => d.target.x,
                        midpoints = {target: {x: 0, y: d.target.y}, source: {x: 0, y:  d.source.y}};

                    return function(t) {
                        midpoints.source.x = midSourceX(t);
                        midpoints.target.x = midTargetX(t);
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

            }
            // Handle window resize event.
            //scope.$on('window-resize', (event) => {
            //    render(scope.value);
            //});

            scope.$watch("value", () => {
                render(scope.value);
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

let layoutTemplate = {
    title: "",
    size: 800,
    margin: 150,
    nodeTypes: {},
    nodeLabel: {
        "font-size": 12
    },
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

export default angular.module('plotify.radial-lineage', ['plotify.utils'])
    .directive('radialLineagePlot', RadialLineagePlotDirective);


