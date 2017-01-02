'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

require('./lineage-plot.css!');

require('../utils.js');

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _d2 = require('d3');

var d3 = _interopRequireWildcard(_d2);

var _sharedFeatures = require('../shared-features.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function LineagePlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            selectedNodes: '=',
            nodeClick: '&'
        },
        link: function link(scope, element, attributes) {

            element.addClass("ancestry ancestry-lineage-plot");

            var svg = d3.select(element[0]).style("position", "relative").append("svg");

            var maxAllowedDepth = 180,
                mouseStart = null,
                colours = d3.scaleOrdinal(d3.schemeCategory10),
                selectionRect = null,
                tooltip = new _sharedFeatures.d3tooltip(d3.select(element[0])),
                defaultNode = {
                r: 4,
                "stroke-width": 2
            },
                selectedNodes = null,
                LCD = null,
                // label collision detection
            lastLCDUpdateTime = 0,
                LCDUpdateID = void 0,
                heatmapColourScale = null,
                heatmapCircle = null,
                visibleSeries = new Set();

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                var defs = svg.append("defs");

                selectedNodes = new Set();

                if (!scope.value || !scope.value.data.length) return;

                var seriesNames = Array.from(new Set(scope.value.data.map(function (d) {
                    return d.series;
                })));

                if (options.isNewData) {
                    colours.domain([]);
                    visibleSeries = new Set(seriesNames);
                }

                var copy = _angular2.default.copy(scope.value),
                    treeData = filterSeries(copy.data, visibleSeries),
                    longestNodeName = treeData.length ? treeData.reduce(function (a, b) {
                    return a.name.length > b.name.length ? a : b;
                }).name : "",
                    verticalExtraSpace = 40,
                    layout = (0, _sharedFeatures.mergeTemplateLayout)(copy.layout, layoutTemplate),
                    pathname = $window.location.pathname,
                    maxLabelLength = (0, _sharedFeatures.testLabelLength)(svg, longestNodeName, layout.nodeLabel),
                    maxLabelOffset = d3.max(labelPositions, function (pos) {
                    return Math.abs(pos.x);
                }),
                    legendHeight = 0,
                    legendWidth = 0,
                    colourbarHeight = 0,
                    colourbarWidth = 0,
                    legendOut = { top: false, right: false, bottom: false, left: false },
                    lcdEnabled = layout.labelCollisionDetection.enabled != "never",
                    lastTransform = d3.zoomIdentity,
                    showAxisTitle = layout.axis.show && !layout.axis.gridOnly && layout.axis.title,
                    showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
                    colourBarOrigWidth = layout.heatmap.colourBar.width,
                    colourBarOrigHeight = layout.heatmap.colourBar.height,
                    colourBarOffset = layout.heatmap.enabled && layout.heatmap.colourBar.show ? 15 : 0,
                    colourbar = d3.select(),
                    legend = d3.select(),
                    xAxisOffset = 0,
                    titleSVG = d3.select(),
                    axisSVG = d3.select();

                if (layout.legend.show) {
                    if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                    if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                }

                if (maxLabelLength < 40) maxLabelLength = 40;

                var initialLabelPosition = labelPositions[0];

                var virtualRootNode = { name: "virtualRoot", children: [], parent: null };

                var allTrees = (0, _sharedFeatures.createTreeLayout)(treeData),
                    root = virtualRootNode;

                virtualRootNode.children = allTrees.map(function (node) {
                    node.parent = "virtualRoot";
                    return node;
                });

                if (layout.axis.valueProperty === "default") {
                    (0, _sharedFeatures.spreadGenerations)(root);
                }

                var types = (0, _sharedFeatures.createNodeTypes)(treeData, layout.nodeTypes, defaultNode),
                    nodeAttr = (0, _sharedFeatures.createDynamicNodeAttr)(types, Object.keys(defaultNode));

                // FIXME: time plotting not implemented / checked yet
                var isTimePlot = false; //trees[0].generation instanceof Date;


                var elementWidth = element[0].offsetWidth,
                    elementHeight = element[0].offsetHeight;

                var margin = layout.margin;

                if (layout.title) margin.top += legendOut.top ? 26 : 25;
                //if (!(layout.legend.position.y == "top" && layout.legend.anchor.y == "outside")) margin.top += 10;
                if (showAxisTitle) margin.bottom += legendOut.bottom ? 16 : 18;

                var width = layout.width || elementWidth,
                    height = layout.height || elementHeight;

                // render chart area
                svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

                svg.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height).attr("fill", layout.backgroundColour);

                var chart = svg.append("g");

                if (layout.heatmap.enabled) {

                    var domain = d3.extent(treeData, function (node) {
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
                        layout.heatmap.colourBar.height = (0, _sharedFeatures.calcColourBarSize)(colourBarOrigHeight, height);
                        layout.heatmap.colourBar.width = (0, _sharedFeatures.calcColourBarSize)(colourBarOrigWidth, width);

                        colourbar = chart.append("g").attr("class", "ancestry-colourbar");

                        (0, _sharedFeatures.drawColourBar)(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                        var bbox = colourbar.node().getBoundingClientRect(),
                            pos = layout.heatmap.colourBar.position;
                        colourbarWidth = bbox.width;
                        colourbarHeight = bbox.height;
                        if (pos === "right" || pos === "left") margin.right += colourbarWidth - (showHeatmapTitle ? 1 : 0) + colourBarOffset;
                        //else if (pos === "top" || pos === "bottom")
                        //    margin.top += colourbarHeight;
                    }
                }

                if (layout.legend.show) {
                    var _pos = layout.legend.position,
                        anchor = layout.legend.anchor,
                        orientation = layout.legend.orientation;

                    var splitAfter = orientation === "horizontal" ? 0 : 1;

                    var drawLegend = (0, _sharedFeatures.d3legend)().splitAfter(splitAfter).position(_pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).backgroundColour(layout.legend.backgroundColour || layout.backgroundColour).maxSize({ width: width, height: height }).onClick(legendClick).selectedItems(visibleSeries);

                    legend = chart.append("g").attr("class", "ancestry-legend").call(drawLegend);

                    var _bbox = legend.node().getBoundingClientRect();
                    legendHeight = _bbox.height;
                    legendWidth = _bbox.width;

                    if (anchor.x === "outside" && _pos.x !== "center") {
                        margin[_pos.x] += legendOut.right ? legendWidth - 10 : legendOut.left ? legendWidth - 11 : legendWidth;
                    } else if (anchor.y === "outside" && _pos.y !== "center") {
                        margin[_pos.y] += legendOut.bottom ? layout.axis.show && !layout.axis.gridOnly ? legendHeight - 9 : legendHeight - 12 : legendOut.top ? legendHeight - 11 : legendHeight;
                    }
                }

                width = (layout.width || elementWidth) - margin.right - margin.left;

                function legendClick(label) {
                    var clicked = d3.select(this);
                    if (visibleSeries.has(label)) visibleSeries.delete(label);else visibleSeries.add(label);
                    clicked.classed("legend-item-selected", visibleSeries.has(label));
                    clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                    render({ isNewData: false });
                }

                // diagonal generator
                function diagonal(d) {
                    var c = Math.abs(d.parent.x - d.x) / 2;

                    return "M" + d.x + "," + d.y + "C" + (d.parent.x + c) + "," + d.y + " " + (d.parent.x + c) + "," + d.parent.y + " " + d.parent.x + "," + d.parent.y;
                }

                var generationExtent = d3.extent(treeData, function (node) {
                    return node.generation;
                }),
                    originalExtent = _angular2.default.copy(generationExtent);

                generationExtent[1] += 1;
                generationExtent[0] -= 1;
                var depth = width / (generationExtent[1] - generationExtent[0]);
                var spaceRight = 1;
                //trim depth if exceeds maximum allowed depth
                if (depth > maxAllowedDepth) {
                    depth = maxAllowedDepth;
                    spaceRight = width / depth - originalExtent[1];
                    generationExtent[1] = width / depth;
                }

                // define x scale
                var xScale = d3.scaleLinear().domain(generationExtent).range([0, width]);

                var labelExtraSpace = (0, _sharedFeatures.getExtraSpaceForLabel)(xScale, maxLabelLength + maxLabelOffset + 5),
                    newDomain = _angular2.default.copy(xScale.domain());

                if (labelExtraSpace > 1) {
                    newDomain[0] = originalExtent[0] - labelExtraSpace;
                }
                if (labelExtraSpace > spaceRight) {
                    newDomain[1] = originalExtent[1] + labelExtraSpace;
                }

                xScale.domain(newDomain);

                // Define x axis and grid
                var xAxis = d3.axisBottom().scale(xScale).tickSizeInner(0).tickSizeOuter(0);

                //render x axis
                if (layout.axis.show) {
                    axisSVG = chart.append("g").attr("class", "axis x-axis").call(xAxis);

                    if (!layout.axis.gridOnly) {
                        xAxisOffset = axisSVG.node().getBBox().height;
                        margin.bottom += xAxisOffset - 3;
                    }

                    xAxis.ticks(Math.ceil(xScale.domain().reduce(function (a, b) {
                        return b - a;
                    })));
                }

                height = (layout.height || elementHeight) - margin.top - margin.bottom;
                xAxis.tickSizeInner(-height);
                axisSVG.attr("transform", 'translate(0, ' + height + ')').call(xAxis);
                axisSVG.selectAll(".tick line").attr("opacity", 0.2).style("shape-rendering", "crispEdges");
                axisSVG.selectAll("path.domain").style("shape-rendering", "crispEdges");
                svg.selectAll(".axis path, .axis line").attr("stroke", layout.axis.colour);

                chart.attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')');

                var treeLayout = d3.tree().size([height - verticalExtraSpace, width]),
                    nodes = treeLayout(d3.hierarchy(root, function (d) {
                    return d.children;
                }));

                var descendants = nodes.descendants().filter(function (n) {
                    return n.parent !== null;
                });
                // Calculate depth positions.
                descendants.forEach(function (node) {
                    node.y = node.x + verticalExtraSpace / 2;
                    node.x = xScale(node.data.generation);
                });

                var clipRectId = 'lineage-scatter-clip-rect' + d3.selectAll("clipPath").size();

                var clip = defs.append("svg:clipPath").attr("id", clipRectId).append("svg:rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height);

                svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

                // render chart title
                if (layout.title) {
                    titleSVG = chart.append("text").attr("x", width / 2).attr("y", legendOut.top ? -legendHeight : -10).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                }

                // render x axis label if exists
                if (showAxisTitle) {
                    chart.append("text") // text label for the x axis
                    .attr("class", "axis-title").style("text-anchor", "middle").text(layout.axis.title).attr("transform", 'translate(' + width / 2 + ', ' + (height + xAxisOffset + 15) + ')');
                }

                if (layout.axis.gridOnly) {
                    chart.selectAll("g.x-axis path.domain, g.x-axis g.tick text").style("opacity", 1e-6);
                }

                if (layout.legend.show) {
                    var _pos2 = layout.legend.position,
                        _anchor = layout.legend.anchor,
                        titleOffset = showAxisTitle ? 16 : 0,
                        posX = _pos2.x === "left" ? 0 : _pos2.x === "right" ? width + (_anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                        posY = _pos2.y === "top" ? 0 : _pos2.y === "bottom" ? height - 1 + (_anchor.y === "outside" ? xAxisOffset + titleOffset : 0) : height / 2;

                    legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                }

                if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                    layout.heatmap.colourBar.height = (0, _sharedFeatures.calcColourBarSize)(colourBarOrigHeight, height);
                    layout.heatmap.colourBar.width = (0, _sharedFeatures.calcColourBarSize)(colourBarOrigWidth, width);

                    (0, _sharedFeatures.drawColourBar)(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                    colourbar.attr("transform", 'translate(' + (width + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                }
                // for nicer png downloads
                svg.selectAll(".tick text").attr("font-size", 12);

                var mouseCaptureGroup = chart.append("g");

                var mouseRect = mouseCaptureGroup.append("rect").attr("id", "mouse-capture").attr("width", width).attr("height", height).style("fill", "transparent");

                var treesContainer = chart.append("g").attr("clip-path", 'url(' + pathname + '#' + clipRectId + ')').append("g").attr("id", "trees-containter");

                if (layout.heatmap.enabled) {
                    heatmapCircle = treesContainer.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(descendants.filter(function (n) {
                        return !isNaN(parseFloat(n.data.z));
                    })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                        return heatmapColourScale(d.data.z);
                    }).style("opacity", layout.heatmap.opacity).attr("transform", function (d) {
                        return 'translate(' + d.x + ',' + d.y + ')';
                    });

                    _sharedFeatures.multiAttr.call(heatmapCircle, layout.heatmap.circle);
                }

                // Declare the nodes
                var node = treesContainer.selectAll("g.node").data(descendants).enter().append("g").attr("class", "node").classed("selected", function (d) {
                    return selectedNodes.has(d.data.name);
                }).attr("transform", function (d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                });

                // Add node circles
                var circle = node.append("circle").attr("class", "node-circle").style("fill", function (d) {
                    return !selectedNodes.has(d.data.name) ? '#FFF' : colours(d.data.series);
                }).style("stroke", function (d) {
                    return colours(d.data.series);
                });

                if (layout.tooltip.show) {
                    circle.on("mouseover", function (d, i) {
                        var _d3tooltip$getRelativ = _sharedFeatures.d3tooltip.getRelativePosition(this, element[0]);

                        var xPos = _d3tooltip$getRelativ.x;
                        var yPos = _d3tooltip$getRelativ.y;
                        var seriesBar = layout.tooltip.showSeriesBar ? '<div class="tooltip-colour-box" style="background-color: ' + colours(d.data.series) + '"></div>' : "";
                        var text = d.data.tooltip ? d.data.tooltip.map(function (line) {
                            return '<span align="' + layout.tooltip.align + '" class="tooltip-text">' + line + '</span>';
                        }).join("") : '<span class="tooltip-text">' + d.data.name + '</span>';
                        tooltip.html(seriesBar + text).position([xPos, yPos]).show();
                    }).on("mouseout", function (d) {
                        tooltip.hide();
                    });
                }

                toggleNodeClickCallback(true);

                _sharedFeatures.multiAttr.call(circle, nodeAttr);
                circle.each(function (d) {
                    d.bboxCircle = this.getBoundingClientRect();
                    d.bbox = d.bboxCircle;
                });

                // Add node labels
                var label = node.append("text").attr("class", "node-label").attr("dy", ".35em").text(function (d) {
                    return d.data.name;
                }).style("opacity", 1).each(_sharedFeatures.getNodeLabelBBox).each(function (d) {
                    return d.labelPos = initialLabelPosition;
                });

                _sharedFeatures.multiAttr.call(label, layout.nodeLabel);
                _sharedFeatures.multiAttr.call(label, initialLabelPosition);

                svg.selectAll("text").attr("fill", layout.textColour);

                var maxNodeLabelLength = d3.max(label.data().map(function (d) {
                    return d.bboxLabel.width;
                })),
                    maxNodeLabelHeight = d3.max(label.data().map(function (d) {
                    return d.bboxLabel.height;
                })),
                    searchRadius = { x: 2 * maxNodeLabelLength + 10, y: 2 * maxNodeLabelHeight };

                if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay") {
                    LCD = new _sharedFeatures.LabelCollisionDetection(node, labelPositions, layout.nodeLabel, width, height, searchRadius);
                    LCD.recalculateLabelPositions(label, d3.zoomIdentity);
                }

                // Declare the links
                var link = treesContainer.selectAll("path.link")
                //.data(links.filter(l => l.source.name != "virtualRoot"));
                .data(descendants.filter(function (n) {
                    return n.parent.data.name != "virtualRoot";
                })).enter().insert("path", "g").attr("class", "link").attr("d", diagonal);

                _sharedFeatures.multiAttr.call(link, layout.link);

                legend.each(function () {
                    this.parentNode.appendChild(this);
                });
                titleSVG.each(function () {
                    this.parentNode.appendChild(this);
                });

                if (layout.groupSelection.enabled) {
                    selectionRect = mouseCaptureGroup.append("rect").attr("class", "selection-rect");

                    _sharedFeatures.multiAttr.call(selectionRect, layout.groupSelection.selectionRectangle);
                }

                function click() {
                    d3.event.preventDefault();
                    var n = d3.select(this.parentNode);
                    if (!n.classed("selected")) {
                        n.classed("selected", true);
                        n.select("circle.node-circle").style("fill", function (d) {
                            return colours(d.data.series);
                        });
                    } else {
                        n.classed("selected", false);
                        n.select("circle.node-circle").style("fill", "#FFF");
                    }
                    updateSelection();
                }
                function mouseDown() {
                    d3.event.preventDefault();
                    mouseStart = d3.mouse(mouseRect.node());
                    mouseRect.on("mousemove", mouseMove).on("mouseup", finalizeSelection).on("mouseout", finalizeSelection);
                    circle.style("pointer-events", "none");
                }

                function finalizeSelection() {
                    selectionRect.attr("width", 0);
                    updateSelection();
                    circle.style("pointer-events", "all");
                    mouseRect.on("mousemove", null).on("mouseup", null).on("mouseout", null);
                }

                function mouseMove() {
                    var p = d3.mouse(mouseRect.node());
                    var d = {
                        x: p[0] < mouseStart[0] ? p[0] : mouseStart[0],
                        y: p[1] < mouseStart[1] ? p[1] : mouseStart[1],
                        height: Math.abs(p[1] - mouseStart[1]),
                        width: Math.abs(p[0] - mouseStart[0])
                    };
                    _sharedFeatures.multiAttr.call(selectionRect, d);
                    selectPoints(selectionRect);
                }

                function selectPoints(rect) {
                    var rect_x1 = +rect.attr("x"),
                        rect_y1 = +rect.attr("y"),
                        rect_x2 = +rect.attr("width") + rect_x1,
                        rect_y2 = +rect.attr("height") + rect_y1,
                        any = false;

                    node.each(function (d, i) {
                        var n = d3.select(this);

                        var _getTranslation = (0, _sharedFeatures.getTranslation)(n.attr("transform"));

                        var _getTranslation2 = _slicedToArray(_getTranslation, 2);

                        var tx = _getTranslation2[0];
                        var ty = _getTranslation2[1];


                        if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                            n.classed("selected", true);
                            n.select("circle.node-circle").style("fill", function (d) {
                                return colours(d.data.series);
                            });
                            any = true;
                        } else if (!selectedNodes.has(d.data.name)) {
                            n.classed("selected", false);
                            n.select("circle.node-circle").style("fill", "#FFF");
                        }
                    });

                    return any;
                }

                function updateSelection() {
                    var wasChange = false;

                    svg.selectAll("g.node.selected").each(function (d) {
                        if (!selectedNodes.has(d.data.name)) {
                            selectedNodes.add(d.data.name);
                            wasChange = true;
                        }
                    });

                    svg.selectAll("g.node:not(.selected)").each(function (d) {
                        if (selectedNodes.has(d.data.name)) {
                            selectedNodes.delete(d.data.name);
                            wasChange = true;
                        }
                    });

                    if (wasChange && scope.selectedNodes) {
                        scope.selectedNodes = Array.from(selectedNodes);
                        scope.$apply();
                    }
                }

                function toggleNodeClickCallback(active) {
                    if (scope.nodeClick === undefined) return;

                    function nodeClickCallback(d) {
                        scope.nodeClick({ $event: d3.event, $node: d.data });
                    }

                    circle.on('click', active ? nodeClickCallback : null);
                }

                var zoom = d3.zoom().scaleExtent([1, layout.maxZoom]).extent([[0, 0], [width, height]]).translateExtent([[0, 0], [width, height]]).on("zoom", onZoom);

                function onZoom() {
                    applyZoom(d3.event.transform);
                    if (lcdEnabled) {
                        applyLCD(d3.event.transform);
                    }
                    lastTransform = d3.event.transform;
                }

                function applyZoom(zoomTransform) {
                    var scale = zoomTransform.k;
                    treesContainer.attr("transform", zoomTransform);
                    mouseCaptureGroup.attr("transform", zoomTransform);
                    xAxis.ticks(Math.ceil(xScale.domain().reduce(function (a, b) {
                        return b - a;
                    }) / scale));
                    axisSVG.call(xAxis.scale(zoomTransform.rescaleX(xScale)));
                    axisSVG.selectAll(".tick line").style("shape-rendering", "crispEdges").attr("opacity", 0.2);
                    svg.selectAll(".tick text").attr("font-size", 12).attr("fill", layout.textColour);
                    if (layout.axis.gridOnly) {
                        chart.selectAll("g.x-axis g.tick text").style("opacity", 1e-6);
                    }

                    _sharedFeatures.multiAttr.call(circle, (0, _sharedFeatures.scaleProperties)(nodeAttr, scale, true));

                    circle.attr("stroke", function (d) {
                        return colours(d.data.series);
                    }).each(function (d) {
                        d.bboxCircle = this.getBoundingClientRect();
                    });

                    if (layout.heatmap.enabled) {
                        _sharedFeatures.multiAttr.call(heatmapCircle, (0, _sharedFeatures.scaleProperties)(layout.heatmap.circle, scale));
                    }
                    _sharedFeatures.multiAttr.call(svg.selectAll("path.link"), (0, _sharedFeatures.scaleProperties)(layout.link, scale));
                    label.each(function (d) {
                        var self = d3.select(this);
                        _sharedFeatures.multiAttr.call(self, (0, _sharedFeatures.scaleProperties)(layout.nodeLabel, scale));
                        _sharedFeatures.multiAttr.call(self, (0, _sharedFeatures.scaleProperties)(d.labelPos, scale));
                    });

                    if (layout.groupSelection.enabled) {
                        _sharedFeatures.multiAttr.call(selectionRect, (0, _sharedFeatures.scaleProperties)(layout.groupSelection.selectionRectangle, scale));
                    }
                }

                function onDoubleClick() {
                    var I = d3.zoomIdentity;
                    chart.call(zoom.transform, I);
                    applyZoom(I);
                    if (lcdEnabled) {
                        applyLCD(I);
                    }
                    lastTransform = I;
                }

                function applyLCD(transform) {
                    if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                        LCD.recalculateLabelPositions(label, transform);
                    } else if (layout.labelCollisionDetection.enabled === "onDelay") {
                        window.clearTimeout(LCDUpdateID);
                        LCDUpdateID = window.setTimeout(function () {
                            LCD.recalculateLabelPositions(label, transform);
                        }, layout.labelCollisionDetection.updateDelay);
                        lastLCDUpdateTime = performance.now();
                    }
                }

                var controls = {
                    'download': function download() {},
                    'zoom': toggleZoom,
                    'select': toggleSelect,
                    'label': toggleLabels
                };
                var activeControls = [];
                if (layout.showLabel) activeControls.push("label");

                (0, _sharedFeatures.createPlotControls)(element[0], controls, activeControls);

                function toggleZoom(toggle) {
                    if (toggle) {
                        chart.call(zoom).on('dblclick.zoom', onDoubleClick);
                    } else {
                        chart.on("wheel.zoom", null).on("mousedown.zoom", null).on("dblclick.zoom", null).on("touchstart.zoom", null).on("touchmove.zoom", null).on("touchend.zoom", null).on("touchcancel.zoom", null);
                    }
                }

                function toggleSelect(toggle) {
                    if (layout.groupSelection.enabled) {
                        mouseRect.on("mousedown", toggle ? mouseDown : null);
                    }
                    circle.on("click", toggle ? click : null);
                    if (!toggle) {
                        toggleNodeClickCallback(true);
                    }
                }

                function toggleLabels(toggle) {
                    label.style("opacity", function (d) {
                        return toggle && !d.isColliding ? 1 : 1e-6;
                    });
                    if (layout.labelCollisionDetection.enabled != "never" && layout.labelCollisionDetection.enabled != "onInit") {
                        lcdEnabled = !lcdEnabled;
                        if (lcdEnabled) {
                            LCD.recalculateLabelPositions(label, lastTransform);
                        }
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

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};

var layoutTemplate = {
    title: null,
    width: null,
    height: 600,
    backgroundColour: "none",
    textColour: "black",
    margin: {
        right: 10,
        left: 10,
        top: 10,
        bottom: 10
    },
    axis: {
        title: "",
        colour: "gray",
        show: true,
        gridOnly: false,
        valueProperty: "default"
    },
    showLabel: true,
    nodeTypes: {},
    nodeLabel: {
        "font-size": 12,
        "font-family": "Roboto,Helvetica Neue,sans-serif"
    },
    labelCollisionDetection: {
        enabled: "never",
        updateDelay: 500
    },
    link: {
        fill: "none",
        stroke: "#ccc",
        "stroke-width": 1
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
        title: null,
        colourScale: [[0, '#008ae5'], [1, 'yellow']],
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
            x: "right",
            y: "center"
        },
        anchor: {
            x: "outside",
            y: "inside"
        },
        orientation: "vertical",
        backgroundColour: null
    },
    tooltip: {
        show: true,
        showSeriesBar: false,
        align: "left"
    }
};

var labelPositions = [{
    x: 10,
    y: 0,
    "text-anchor": "start"
}, {
    x: -10,
    y: 0,
    "text-anchor": "end"
}];

function filterSeries(nodes, activeSeries) {
    var filteredNodes = [],
        nodesDict = {},
        parent = void 0;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var node = _step.value;

            nodesDict[node.name] = node;
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

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _node = _step2.value;

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

    return filteredNodes;
}

exports.default = _angular2.default.module('ancestry.lineage', ['ancestry.utils']).directive('lineagePlot', LineagePlotDirective);