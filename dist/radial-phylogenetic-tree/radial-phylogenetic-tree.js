'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('./radial-phylogenetic-tree.css!');

require('../utils.js');

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

var _sharedFeatures = require('../shared-features.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function RadialPhylogeneticTreeDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            branchlength: '=',
            nodeClick: '&'
        },
        link: function link(scope, element, attributes) {

            element.addClass("ancestry ancestry-radial-phylogenetic-tree");

            var svg = d3.select(element[0]).style("position", "relative").append("svg").style("width", "100%");

            var hovering = false,
                virtualRoot = null,
                virtualRootName = "virtual_root",
                r = void 0,
                labelOffset = 20,
                defaultNode = {
                r: 4,
                "stroke-width": 2
            },
                link = null,
                node = null,
                linkExtension = null,
                totalTreeLength = void 0,
                multipleTreeOffset = 0,
                visibleSeries = new Set(),
                colours = d3.scaleOrdinal(d3.schemeCategory10);

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                var defs = svg.append("defs");

                // do not continue rendering if there is no data
                if (!scope.value || !scope.value.data.length) return;

                var seriesNames = Array.from(new Set(extractProp(scope.value.data, "series")));

                if (options.isNewData) {
                    colours.domain([]);
                    visibleSeries = new Set(seriesNames);
                }

                var copy = _angular2.default.copy(scope.value),
                    treeData = copy.data,
                    layout = (0, _sharedFeatures.mergeTemplateLayout)(copy.layout, layoutTemplate),
                    pathname = $window.location.pathname;

                var elementWidth = element[0].offsetWidth;

                treeData = treeData.map(function (t) {
                    return collapseSeries(t, visibleSeries);
                }).filter(function (t) {
                    return t !== null;
                });

                var isMultipleTree = treeData.length > 1,
                    longestNodeName = treeData.length ? extractProp(treeData, "name").reduce(function (a, b) {
                    return a.length > b.length ? a : b;
                }) : "",
                    maxLabelLength = (0, _sharedFeatures.testLabelLength)(svg, longestNodeName, layout.outerNodeLabel),
                    colourBarOffset = 20,
                    start = null,
                    rotate = 0,
                    heatmapColourScale = null,
                    heatmapCircle = null,
                    nodeCircle = null,
                    trees = null,
                    legendHeight = 0,
                    legendWidth = 0,
                    colourbarHeight = 0,
                    colourbarWidth = 0,
                    legendOut = { top: false, right: false, bottom: false, left: false },
                    colourBarOrigWidth = layout.heatmap.colourBar.width,
                    colourBarOrigHeight = layout.heatmap.colourBar.height,
                    showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
                    legend = d3.select(),
                    colourbar = d3.select(),
                    titleSVG = d3.select();

                var width = layout.width || elementWidth,
                    height = layout.height;

                svg.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height).attr("fill", layout.background);

                if (layout.legend.show) {
                    if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                    if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                }

                var margin = layout.margin;
                if (layout.title) margin.top += legendOut.top ? 26 : 25;

                var chart = svg.append("g");

                multipleTreeOffset = isMultipleTree ? 30 : 0;

                if (layout.heatmap.enabled) {

                    var domain = d3.extent(extractProp(treeData, "z").filter(function (d) {
                        return !!d;
                    }));

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

                    var drawLegend = (0, _sharedFeatures.d3legend)().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).backgroundColour(layout.legend.background || layout.background).onClick(legendClick).maxSize({ width: width, height: height }).selectedItems(visibleSeries);

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

                var r = Math.min(height, width) / 2;

                totalTreeLength = r - maxLabelLength - labelOffset - multipleTreeOffset;

                chart.attr("transform", 'translate(' + margin.left + ',' + margin.top + ')');

                if (layout.legend.show) {
                    var _pos = layout.legend.position,
                        _anchor = layout.legend.anchor,
                        posX = _pos.x === "left" ? width / 2 - r : _pos.x === "right" ? width / 2 + r + (_anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                        posY = _pos.y === "top" ? height / 2 - r : _pos.y === "bottom" ? height / 2 + r : height / 2;

                    legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                }

                if (isMultipleTree) {
                    virtualRoot = {
                        name: virtualRootName,
                        parent: null,
                        children: [],
                        series: 0,
                        _depth: 0,
                        length: 0,
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

                    trees = virtualRoot;
                } else if (treeData.length) {
                    trees = treeData[0];
                    spreadNodes(trees);
                }

                var types = (0, _sharedFeatures.createNodeTypes)(treeData, layout.nodeTypes, defaultNode),
                    nodeAttr = (0, _sharedFeatures.createDynamicNodeAttr)(types, Object.keys(defaultNode));

                var treeLayout = d3.cluster().size([360, 1]).separation(function () {
                    return 1;
                }),
                    treeRoot = d3.hierarchy(trees, function (d) {
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
                    d.y = d.name === virtualRootName ? 0 : multipleTreeOffset + d.data._depth * totalTreeLength;
                });

                // render chart title
                if (layout.title) {
                    titleSVG = chart.append("text").attr("x", width / 2).attr("y", height / 2 - r - (layout.legend.position.y == "top" && layout.legend.anchor.y == "outside" ? legendHeight : 10)).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                }

                if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                    layout.heatmap.colourBar.height = (0, _sharedFeatures.calcColourBarSize)(colourBarOrigHeight, 2 * r);
                    layout.heatmap.colourBar.width = (0, _sharedFeatures.calcColourBarSize)(colourBarOrigWidth, width);

                    (0, _sharedFeatures.drawColourBar)(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                    colourbar.attr("transform", 'translate(' + (width / 2 + r + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                }

                if (layout.heatmap.enabled) {
                    heatmapCircle = vis.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(descendants.filter(function (n) {
                        return n.data.taxon && n.data.taxon.name !== null && !isNaN(parseFloat(n.data.taxon.z));
                    })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                        return heatmapColourScale(d.data.taxon.z);
                    }).style("opacity", layout.heatmap.opacity).attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                    });

                    _sharedFeatures.multiAttr.call(heatmapCircle, layout.heatmap.circle);
                }

                if (treeData.length) {
                    removeNegativeLengths(trees);
                    setRadius(trees, trees.length = 0, totalTreeLength / maxLength(trees));
                }

                var show = scope.branchlength !== undefined ? scope.branchlength : true;
                linkExtension = vis.append("g").selectAll("path").data(descendants.filter(function (d) {
                    return !d.children;
                })).enter().append("path").attr("stroke", "black").style("opacity", 0.2).attr("class", "link-extension").each(function (d) {
                    d.linkExtensionNode = this;
                }).attr("d", function (d) {
                    return step2(d.x, show ? d.data.radius : d.y, d.x, totalTreeLength + multipleTreeOffset);
                });

                link = vis.append("g").selectAll("path").data(descendants.filter(function (n) {
                    return n.parent.data.name != virtualRootName;
                })).enter().append("path").attr("class", "link").attr("fill", "none").each(function (d) {
                    d.linkNode = this;
                }).attr("d", function (d) {
                    return step2(d.parent.x, show ? d.parent.data.radius : d.parent.y, d.x, show ? d.data.radius : d.y);
                }).style("stroke", "black");

                _sharedFeatures.multiAttr.call(link, layout.link);

                if (isMultipleTree) {
                    link.filter(function (d) {
                        return d.parent.name === virtualRootName;
                    }).style("opacity", 0);
                }

                if (layout.showLeafNodes) {
                    node = vis.selectAll("g.node").data(descendants.filter(function (d) {
                        return !d.children || !d.children.length;
                    })).enter().append("g")
                    //.attr("id", d => d.name)
                    .attr("class", "node").attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                    }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false)).each(function (d) {
                        d.nodeGroupNode = this;
                    });

                    node.filter(function (d) {
                        return !d.data.taxon;
                    }).style("opacity", 0);

                    nodeCircle = node.append("circle").attr("fill", "white").style("stroke", function (d) {
                        return d.data.taxon && d.data.name !== virtualRootName ? colours(d.data.taxon.series) : "none";
                    });

                    toggleNodeClickCallback(true);

                    _sharedFeatures.multiAttr.call(nodeCircle, nodeAttr);
                }

                var maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + labelOffset) / descendants.filter(function (d) {
                    return !d.children || !d.children.length;
                }).length;

                layout.outerNodeLabel["font-size"] = d3.min([layout.outerNodeLabel["font-size"], maxLabelHeight]);

                var label = vis.selectAll("text.outer-label").data(descendants.filter(function (d) {
                    return !!d.data.taxon;
                })).enter().append("text").attr("class", "outer-label").attr("dy", ".31em").attr("text-anchor", function (d) {
                    return d.x < 180 ? "start" : "end";
                }).attr("transform", function (d) {
                    return 'rotate(' + (d.x - 90) + ')\n                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                             rotate(' + (d.x < 180 ? 0 : 180) + ')';
                }).text(function (d) {
                    return d.data.taxon.name;
                }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false));

                _sharedFeatures.multiAttr.call(label, layout.outerNodeLabel);

                legend.each(moveToFront);
                titleSVG.each(moveToFront);

                function mouseovered(active) {
                    return function (d) {
                        d3.select(this).classed("label-active", active);
                        d3.select(d.linkExtensionNode).classed("link-extension-active", active).each(moveToFront);
                        do {
                            d3.select(d.linkNode).classed("link-active", active).each(moveToFront);
                        } while (d = d.parent);
                    };
                }

                function toggleNodeClickCallback(active) {
                    if (scope.nodeClick === undefined || nodeCircle == null) return;

                    function nodeClickCallback(d) {
                        scope.nodeClick({ $event: d3.event, $node: d.data });
                    }

                    nodeCircle.on('click', active ? nodeClickCallback : null);
                }

                var controls = {
                    'download': function download() {},
                    'zoom': toggleMove
                };

                (0, _sharedFeatures.createPlotControls)(element[0], controls);

                function toggleMove(toggle) {
                    if (toggle) {
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
                        chart.on("mousedown", null).on("mouseup", null).on("mousemove", null);
                    }
                }

                function mouse(element) {
                    return d3.mouse(element).map(function (d, i) {
                        return d - visTranslate[i];
                    });
                }

                function moveToFront() {
                    this.parentNode.appendChild(this);
                }

                function cross(a, b) {
                    return a[0] * b[1] - a[1] * b[0];
                }

                function dot(a, b) {
                    return a[0] * b[0] + a[1] * b[1];
                }
            }

            function setRadius(d, y0, k) {
                d.radius = (y0 += d.length) * k + multipleTreeOffset;
                if (d.children && d.children.length > 0) d.children.forEach(function (d) {
                    return setRadius(d, y0, k);
                });
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
                return "M" + startRadius * c0 + "," + startRadius * s0 + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1) + "L" + endRadius * c1 + "," + endRadius * s1;
            }

            function extractProp(trees, prop) {
                var values = [];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = trees[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var tree = _step2.value;

                        extract(tree);
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

                function extract(tree) {
                    if (tree.taxon !== null) values.push(tree.taxon[prop]);else {
                        extract(tree.children[0]);
                        extract(tree.children[1]);
                    }
                }
                return values;
            }

            // Handle window resize event.
            scope.$on('window-resize', function (event) {
                render({ isNewData: false });
            });

            scope.$watch("value", function () {
                render({ isNewData: true });
            });

            scope.$watch("branchlength", function (show) {
                if (!linkExtension || !link || !totalTreeLength) return;
                d3.transition().duration(750).each(function () {
                    linkExtension.transition().attr("d", function (d) {
                        return step2(d.x, show ? d.data.radius : d.y, d.x, totalTreeLength + multipleTreeOffset);
                    });
                    link.transition().attr("d", function (d) {
                        return step2(d.parent.x, show ? d.parent.data.radius : d.parent.y, d.x, show ? d.data.radius : d.y);
                    });
                });
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
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = node.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var child = _step3.value;

            childMax = spreadNodes(child, level + 1);
            if (childMax > max) {
                max = childMax;
            }
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

    node._depth = level / max;
    return max;
}

function collapseSeries(tree, visibleSeries) {

    var leaves = [];
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
    var leavesOut = leaves.filter(function (l) {
        return !visibleSeries.has(l.taxon.series);
    });

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = leavesOut[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var leaf = _step4.value;

            var parent = leaf.parent;
            if (!parent && leaf.taxon) {
                return null;
            }
            var sibling = parent.children[parent.children.indexOf(leaf) ^ 1];
            var parent2 = parent.parent;
            if (!parent2) {
                sibling.parent = null;
                tree = sibling;
                continue;
            }
            parent2.children[parent2.children.indexOf(parent)] = sibling;
            sibling.length += parent.length;
            sibling.parent = parent2;
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

    return !tree.children.length ? null : tree;
}

var layoutTemplate = {
    title: null,
    width: null,
    height: 600,
    background: "none",
    margin: {
        top: 10,
        bottom: 10,
        right: 10,
        left: 10
    },
    nodeTypes: {},
    showLeafNodes: true,
    outerNodeLabel: {
        "font-size": 14,
        "font-family": "Roboto,Helvetica Neue,sans-serif"
    },
    link: {
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
        orientation: "vertical",
        background: null
    }
};

exports.default = _angular2.default.module('ancestry.radial-phylogenetic-tree', ['ancestry.utils']).directive('radialPhylogeneticTree', RadialPhylogeneticTreeDirective);