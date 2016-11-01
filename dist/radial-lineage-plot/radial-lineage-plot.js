'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('./radial-lineage-plot.css!');

require('../utils.js');

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

var _sharedFeatures = require('../shared-features.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function RadialLineagePlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            nodeClickCallback: '='
        },
        link: function link(scope, element, attributes) {

            element.addClass("ancestry ancestry-radial-lineage-plot");

            var svg = d3.select(element[0]).style("position", "relative").append("svg").style("width", "100%");

            var colours = d3.scaleOrdinal(d3.schemeCategory10),
                hovering = false,
                virtualRoot = null,
                virtualRootName = "virtual_root",
                r = void 0,
                labelOffset = 20,
                defaultNode = {
                r: 4,
                "stroke-width": 2
            },
                visibleSeries = new Set();

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                var defs = svg.append("defs");

                // do not continue rendering if there is no data
                if (!scope.value || !scope.value.data.length) return;

                var seriesNames = Array.from(new Set(scope.value.data.map(function (d) {
                    return d.series;
                })));

                if (options.isNewData) {
                    colours.domain([]);
                    visibleSeries = new Set(seriesNames);
                }

                var copy = _angular2.default.copy(scope.value),
                    layout = (0, _sharedFeatures.mergeTemplateLayout)(copy.layout, layoutTemplate),
                    pathname = $window.location.pathname;

                var treeData = (0, _sharedFeatures.createTreeLayout)(filterSeries(copy.data, visibleSeries)),
                    longestNodeName = copy.data.length ? copy.data.reduce(function (a, b) {
                    return a.name.length > b.name.length ? a : b;
                }).name : "";

                var elementWidth = element[0].offsetWidth;

                var isMultipleTree = treeData.length > 1,
                    multipleTreeOffset = isMultipleTree ? 30 : 0,
                    maxLabelLength = (0, _sharedFeatures.testLabelLength)(svg, longestNodeName, layout.outerNodeLabel),
                    colourBarOffset = 20,
                    start = null,
                    rotate = 0,
                    rotateOld = 0,
                    rotationDifference = void 0,
                    transitionScale = d3.scaleLog().domain([1, 181]).range([0, 1500]),
                    reorgDuration = 1000,
                    prevX = 0,
                    heatmapColourScale = null,
                    heatmapCircle = d3.select(),
                    legendHeight = 0,
                    legendWidth = 0,
                    colourbarHeight = 0,
                    colourbarWidth = 0,
                    legendOut = { top: false, right: false, bottom: false, left: false },
                    showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
                    colourBarOrigWidth = layout.heatmap.colourBar.width,
                    colourBarOrigHeight = layout.heatmap.colourBar.height,
                    legend = d3.select(),
                    colourbar = d3.select(),
                    titleSVG = d3.select();

                var width = layout.width || elementWidth,
                    height = layout.height;

                svg.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height).attr("fill", "white");

                if (layout.legend.show) {
                    if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                    if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                }

                var margin = layout.margin;
                if (layout.title) margin.top += legendOut.top ? 26 : 25;

                var chart = svg.append("g").attr("transform", 'translate(' + margin.left + ',' + margin.top + ')');

                if (layout.heatmap.enabled) {

                    var domain = d3.extent(copy.data, function (node) {
                        return node.z;
                    });

                    if (domain[0] == domain[1]) {
                        if (domain[0] === undefined) {
                            domain[0] = domain[1] = 0;
                        }
                        domain[0] -= 0.5;
                        domain[1] += 0.5;
                    }

                    heatmapColourScale = d3.scaleLinear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                        return v[1];
                    }));

                    if (layout.heatmap.colourBar.show) {
                        layout.heatmap.colourBar.height = (0, _sharedFeatures.calcColourBarSize)(layout.heatmap.colourBar.height, height);
                        layout.heatmap.colourBar.width = (0, _sharedFeatures.calcColourBarSize)(layout.heatmap.colourBar.width, width);

                        colourbar = chart.append("g").attr("class", "ancestry-colourbar").attr("transform", "translate(0,0)");

                        (0, _sharedFeatures.drawColourBar)(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                        var bbox = colourbar.node().getBoundingClientRect();

                        colourbarWidth = bbox.width;
                        margin.right += colourbarWidth - (showHeatmapTitle ? 1 : 0) + colourBarOffset;
                        colourbarHeight = bbox.height;
                    }
                }

                if (layout.legend.show) {
                    var pos = layout.legend.position,
                        anchor = layout.legend.anchor,
                        orientation = layout.legend.orientation;

                    var splitAfter = orientation === "horizontal" ? 0 : 1;

                    var drawLegend = (0, _sharedFeatures.d3legend)().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).onClick(legendClick).maxSize({ width: width, height: height }).selectedItems(visibleSeries);

                    legend = chart.append("g").attr("class", "ancestry-legend").call(drawLegend);

                    var _bbox = legend.node().getBoundingClientRect();
                    legendHeight = _bbox.height;legendWidth = _bbox.width;
                    if (anchor.x === "outside" && pos.x !== "center") {
                        margin[pos.x] += legendOut.right ? legendWidth - 10 : legendOut.left ? legendWidth - 11 : legendWidth;
                    } else if (anchor.y === "outside" && pos.y !== "center") {
                        margin[pos.y] += legendOut.bottom ? legendHeight - 11 : legendOut.top ? legendHeight - 11 : legendHeight;
                    }
                }

                function legendClick(label) {
                    var clicked = d3.select(this);
                    if (visibleSeries.has(label)) visibleSeries.delete(label);else visibleSeries.add(label);
                    clicked.classed("legend-item-selected", visibleSeries.has(label));
                    clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                    render({ isNewData: false });
                }

                width = (layout.width || elementWidth) - margin.right - margin.left;
                height = layout.height - margin.top - margin.bottom;

                var r = Math.min(height, width) / 2,
                    totalTreeLength = r - maxLabelLength - labelOffset - multipleTreeOffset;

                chart.attr("transform", 'translate(' + margin.left + ',' + margin.top + ')');

                if (layout.legend.show) {
                    var _pos = layout.legend.position,
                        _anchor = layout.legend.anchor,
                        posX = _pos.x === "left" ? width / 2 - r : _pos.x === "right" ? width / 2 + r + (_anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                        posY = _pos.y === "top" ? height / 2 - r : _pos.y === "bottom" ? height / 2 + r : height / 2;

                    legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                }

                virtualRoot = {
                    name: virtualRootName,
                    parent: null,
                    children: [],
                    treeId: 0,
                    _depth: 0,
                    type: undefined
                };

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = treeData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var tree = _step.value;

                        spreadNodes(tree);
                        tree.parent = virtualRootName;
                        virtualRoot.children.push(tree);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                treeData = virtualRoot;

                var types = (0, _sharedFeatures.createNodeTypes)(copy.data, layout.nodeTypes, defaultNode),
                    nodeAttr = (0, _sharedFeatures.createDynamicNodeAttr)(types, Object.keys(defaultNode));

                var treeLayout = d3.cluster().size([360, 1]).separation(function () {
                    return 1;
                }),
                    treeRoot = d3.hierarchy(treeData, function (d) {
                    return d.children;
                }).sort(function (a, b) {
                    return b.depth - a.depth;
                }),
                    nodes = treeLayout(treeRoot),
                    descendants = nodes.descendants().filter(function (n) {
                    return n.parent != null;
                });

                svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("-webkit-backface-visibility", "hidden");

                // Catch mouse events in Safari.
                svg.append("rect").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("fill", "none");

                var visTranslate = [width / 2, height / 2],
                    vis = chart.append("g").attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')');

                vis.append("rect").attr("x", -r).attr("y", -r).attr("width", 2 * r).attr("height", 2 * r).style("opacity", 1e-6);

                descendants.forEach(function (d) {
                    d.x0 = d.x; // remember initial position
                    d.y = d.name === virtualRootName ? 0 : multipleTreeOffset + d.data._depth * totalTreeLength;
                });

                // render chart title
                if (layout.title) {
                    titleSVG = chart.append("text").attr("x", width / 2).attr("y", height / 2 - r - (layout.legend.position.y == "top" && layout.legend.anchor.y == "outside" ? legendHeight : 10)).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                }

                // TODO: implement equidistant generations
                //let maxGen = 15;//d3.max(treeData.trees[0].map(d => d.generation));
                //nodes.forEach(function(d){d.y = d.generation / maxGen * 300});

                if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                    layout.heatmap.colourBar.height = (0, _sharedFeatures.calcColourBarSize)(colourBarOrigHeight, 2 * r);
                    layout.heatmap.colourBar.width = (0, _sharedFeatures.calcColourBarSize)(colourBarOrigWidth, width);

                    (0, _sharedFeatures.drawColourBar)(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                    colourbar.attr("transform", 'translate(' + (width / 2 + r + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                }

                if (layout.heatmap.enabled) {
                    heatmapCircle = vis.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(descendants.filter(function (n) {
                        return !isNaN(parseFloat(n.data.z));
                    })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                        return heatmapColourScale(d.data.z);
                    }).style("opacity", layout.heatmap.opacity).attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                    });

                    _sharedFeatures.multiAttr.call(heatmapCircle, layout.heatmap.circle);
                }

                var link = vis.selectAll("path.link").data(descendants.filter(function (n) {
                    return n.parent.data.name != virtualRootName;
                })).enter().append("path").attr("class", "link").attr("fill", "none").attr("d", step).each(function (d) {
                    d.inLinkNode = this;
                    if (d.parent.outLinkNodes) d.parent.outLinkNodes.push(this);else d.parent.outLinkNodes = [this];
                });

                _sharedFeatures.multiAttr.call(link, layout.link);

                var node = vis.selectAll("g.node").data(descendants).enter().append("g").attr("id", function (d) {
                    return d.name;
                }).attr("class", "node").attr("transform", function (d) {
                    return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false)).each(function (d) {
                    d.nodeGroupNode = this;
                });

                var nodeLabel = node.append("text").attr("class", "mouseover-label").attr("transform", "rotate(90)").attr("dy", ".25em").attr("dx", ".6em").style("opacity", 1e-6).text(function (d) {
                    return d.data.name;
                });

                _sharedFeatures.multiAttr.call(nodeLabel, layout.nodeLabel);
                nodeLabel.call(getBB);

                node.insert("rect", "text").attr("x", function (d) {
                    return d.bbox.x - 3;
                }).attr("y", function (d) {
                    return d.bbox.y;
                }).attr("width", function (d) {
                    return d.bbox.width + 6;
                }).attr("height", function (d) {
                    return d.bbox.height + 3;
                }).attr("transform", "rotate(90)").style("fill", "white").style("opacity", 1e-6);

                var circle = node.append("circle").attr("fill", "white").style("stroke", function (d) {
                    return colours(d.data.series);
                });

                _sharedFeatures.multiAttr.call(circle, nodeAttr);
                toggleNodeClickCallback(true);

                var maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + labelOffset) / descendants.filter(function (d) {
                    return !d.children || !d.children.length;
                }).length;

                layout.outerNodeLabel["font-size"] = d3.min([layout.outerNodeLabel["font-size"], maxLabelHeight]);

                var label = vis.selectAll("text.outer-label").data(descendants.filter(function (d) {
                    return d.x !== undefined && !d.children;
                })).enter().append("text").attr("class", "outer-label").attr("dy", ".31em").attr("text-anchor", function (d) {
                    return d.x < 180 ? "start" : "end";
                }).attr("transform", function (d) {
                    return 'rotate(' + (d.x - 90) + ')\n                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                             rotate(' + (d.x < 180 ? 0 : 180) + ')';
                }).text(function (d) {
                    return d.data.name;
                });

                _sharedFeatures.multiAttr.call(label, layout.outerNodeLabel);

                legend.each(moveToFront);
                titleSVG.each(moveToFront);

                function mouseovered(active) {
                    return function (d) {

                        hovering = active;
                        var hoveredNode = d3.select(d.nodeGroupNode);

                        hoveredNode.select("text.mouseover-label").style("opacity", active ? 1 : 1e-6).attr("transform", active ? 'rotate(' + (-rotate - d.x + 90) + ')' : "rotate(90)");
                        hoveredNode.select("rect").style("opacity", active ? 0.9 : 1e-6).attr("transform", active ? 'rotate(' + (-rotate - d.x + 90) + ')' : "rotate(90)");

                        do {
                            d3.select(d.inLinkNode).classed("link-active", active).each(moveToFront);
                            if (d.outLinkNodes) {
                                d.outLinkNodes.forEach(function (node) {
                                    return d3.select(node).classed("link-affected", active);
                                });
                            }
                            d3.select(d.nodeGroupNode).classed("node-active", active).each(moveToFront).selectAll("circle").attr("stroke-width", function (d) {
                                var strokeWidth = nodeAttr["stroke-width"](d);
                                return active ? strokeWidth + 1 : strokeWidth;
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
                    if (rotationDifference > 180) rotationDifference = 360 - rotationDifference;
                    prevX = selectedNode.x;

                    rotate = 360 - selectedNode.x;
                    if (rotate > 360) rotate %= 360;else if (rotate < 0) rotate = (360 + rotate) % 360;

                    d3.selectAll("g.node text.mouseover-label").attr("transform", "rotate(90)").style("opacity", 1e-6);
                    d3.selectAll("g.node rect").attr("transform", "rotate(90)").style("opacity", 1e-6);

                    var alignedNotActive = d3.selectAll("g.node-aligned:not(.node-active)"),
                        duration = alignedNotActive.size() || !rotateOld ? reorgDuration : 0;

                    alignedNotActive.classed("node-aligned", false).each(function (d) {
                        d._x = d.x;
                        d.x = d.x0;
                    }).transition().duration(duration).attrTween("transform", tweenNodeGroup).on("end", function (d) {
                        return d._x = undefined;
                    });

                    heatmapCircle.transition().duration(duration).attrTween("transform", tweenNodeGroup);

                    d3.selectAll("g.node-active").classed("node-aligned", true).each(function (d) {
                        d._x = d.x;
                        d.x = selectedNode.x;
                    }).transition().duration(duration).attrTween("transform", tweenNodeGroup);

                    d3.selectAll("path.link-affected, path.link-displaced").classed("link-displaced", true).transition().duration(duration).attrTween("d", tweenPath);

                    d3.selectAll("path.link-displaced:not(.link-affected)").classed("link-displaced", false);

                    d3.selectAll("g.node-aligned text.mouseover-label").transition().style("opacity", 1);

                    d3.selectAll("g.node-aligned rect").style("opacity", 0.9);

                    if (rotationDifference > 0) {
                        vis.transition().delay(duration).duration(transitionScale(rotationDifference + 1)).attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')rotate(' + rotate + ')').on("end", function () {
                            d3.select(this).selectAll("text.outer-label").attr("text-anchor", function (d) {
                                return (d.x + rotate) % 360 < 180 ? "start" : "end";
                            }).attr("transform", function (d) {
                                return 'rotate(' + (d.x - 90) + ')\n                                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                                             rotate(' + ((d.x + rotate) % 360 < 180 ? 0 : 180) + ')';
                            });
                        });
                    }

                    rotateOld = rotate;
                }

                function toggleNodeClickCallback(active) {
                    if (scope.nodeClickCallback === undefined) return;

                    function nodeClickCallback(d) {
                        scope.nodeClickCallback(d.data, d3.event);
                    }

                    node.on('click', active ? nodeClickCallback : null);
                }

                function mouse(element) {
                    return d3.mouse(element).map(function (d, i) {
                        return d - visTranslate[i];
                    });
                }

                function getBB(selection) {
                    selection.each(function (d) {
                        d.bbox = this.getBBox();
                    });
                }

                function moveToFront() {
                    this.parentNode.appendChild(this);
                }

                function project(d) {
                    var r = d.y,
                        a = (d.x - 90) / 180 * Math.PI;
                    return [r * Math.cos(a), r * Math.sin(a)];
                }

                function cross(a, b) {
                    return a[0] * b[1] - a[1] * b[0];
                }

                function dot(a, b) {
                    return a[0] * b[0] + a[1] * b[1];
                }

                function step(d) {
                    var s = project(d.parent),
                        m = project({ x: d.x, y: d.parent.y }),
                        t = project(d),
                        r = d.parent.y,
                        sweep = d.x > d.parent.x ? 1 : 0,
                        largeArc = Math.abs(d.x - d.parent.x) % 360 > 180 ? 1 : 0;

                    return 'M' + s[0] + ',' + s[1] + 'A' + r + ',' + r + ' 0 ' + largeArc + ',' + sweep + ' ' + m[0] + ',' + m[1] + 'L' + t[0] + ',' + t[1];
                }

                function tweenPath(d) {
                    var midSourceX = d.parent._x !== undefined ? d3.interpolateNumber(d.parent._x, d.parent.x) : function () {
                        return d.parent.x;
                    },
                        midTargetX = d._x !== undefined ? d3.interpolateNumber(d._x, d.x) : function () {
                        return d.x;
                    },
                        midpoints = { x: 0, y: d.y, parent: { x: 0, y: d.parent.y } };

                    return function (t) {
                        midpoints.parent.x = midSourceX(t);
                        midpoints.x = midTargetX(t);
                        return step(midpoints);
                    };
                }

                function tweenNodeGroup(d) {
                    var midpointX = d._x !== undefined ? d3.interpolateNumber(d._x, d.x) : function () {
                        return d.x;
                    };

                    return function (t) {
                        var x = midpointX(t);
                        return 'rotate(' + (x - 90) + ')translate(' + d.y + ')';
                    };
                }

                var controls = {
                    'download': function download() {},
                    'zoom': toggleMove
                };

                (0, _sharedFeatures.createPlotControls)(element[0], controls);

                function toggleMove(toggle) {
                    if (toggle) {
                        node.on("click", clicked);
                        chart.on("mousedown", function () {
                            if (!hovering) {
                                svg.style("cursor", "move");
                                start = mouse(svg.node());
                                d3.event.preventDefault();
                            }
                        }).on("mouseup", function () {
                            if (start && !hovering) {
                                svg.style("cursor", "auto");
                                var m = mouse(svg.node());
                                rotate += Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                                if (rotate > 360) rotate %= 360;else if (rotate < 0) rotate = (360 + rotate) % 360;
                                start = null;
                                vis.attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')rotate(' + rotate + ')').selectAll("text.outer-label").attr("text-anchor", function (d) {
                                    return (d.x + rotate) % 360 < 180 ? "start" : "end";
                                }).attr("transform", function (d) {
                                    return 'rotate(' + (d.x - 90) + ')\n                                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                                             rotate(' + ((d.x + rotate) % 360 < 180 ? 0 : 180) + ')';
                                });
                            }
                        }).on("mousemove", function () {
                            if (start) {
                                var m = mouse(svg.node());
                                var delta = Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                                vis.attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')rotate(' + (rotate + delta) + ')');
                            }
                        });
                    } else {
                        node.on("click", null);
                        toggleNodeClickCallback(true);
                        chart.on("mousedown", null).on("mouseup", null).on("mousemove", null);
                    }
                }
            }
            // Handle window resize event.
            scope.$on('window-resize', function (event) {
                render({ isNewData: false });
            });

            scope.$watch("value", function () {
                render({ isNewData: true });
            });
        }
    };
}

function spreadNodes(node) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (!node.children || !node.children.length) {
        node._depth = 1;
        return level;
    }
    var max = 1,
        childMax = void 0;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = node.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var child = _step2.value;

            childMax = spreadNodes(child, level + 1);
            if (childMax > max) {
                max = childMax;
            }
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    node._depth = level / max;
    return max;
}

function filterSeries(nodes, activeSeries) {
    var filteredNodes = [],
        nodesDict = {},
        parent = void 0;

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var node = _step3.value;

            nodesDict[node.name] = node;
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _node = _step4.value;

            var currentNode = _node;
            if (!activeSeries.has(currentNode.series)) continue;
            while (parent = currentNode.parent) {
                var parentNode = nodesDict[parent];
                if (activeSeries.has(parentNode.series)) {
                    _node.parent = parent;
                    break;
                }
                currentNode = parentNode;
            }
            if (_node.parent && !activeSeries.has(nodesDict[_node.parent].series)) {
                _node.parent = null;
            }
            filteredNodes.push(_node);
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    return filteredNodes;
}

var layoutTemplate = {
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
        colourScale: [[0, '#008ae5'], [1, 'yellow']],
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

exports.default = _angular2.default.module('ancestry.radial-lineage', ['ancestry.utils']).directive('radialLineagePlot', RadialLineagePlotDirective);