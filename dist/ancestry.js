!function(e){function r(e,r,o){return 4===arguments.length?t.apply(this,arguments):void n(e,{declarative:!0,deps:r,declare:o})}function t(e,r,t,o){n(e,{declarative:!1,deps:r,executingRequire:t,execute:o})}function n(e,r){r.name=e,e in v||(v[e]=r),r.normalizedDeps=r.deps}function o(e,r){if(r[e.groupIndex]=r[e.groupIndex]||[],-1==g.call(r[e.groupIndex],e)){r[e.groupIndex].push(e);for(var t=0,n=e.normalizedDeps.length;n>t;t++){var a=e.normalizedDeps[t],u=v[a];if(u&&!u.evaluated){var d=e.groupIndex+(u.declarative!=e.declarative);if(void 0===u.groupIndex||u.groupIndex<d){if(void 0!==u.groupIndex&&(r[u.groupIndex].splice(g.call(r[u.groupIndex],u),1),0==r[u.groupIndex].length))throw new TypeError("Mixed dependency cycle detected");u.groupIndex=d}o(u,r)}}}}function a(e){var r=v[e];r.groupIndex=0;var t=[];o(r,t);for(var n=!!r.declarative==t.length%2,a=t.length-1;a>=0;a--){for(var u=t[a],i=0;i<u.length;i++){var s=u[i];n?d(s):l(s)}n=!n}}function u(e){return y[e]||(y[e]={name:e,dependencies:[],exports:{},importers:[]})}function d(r){if(!r.module){var t=r.module=u(r.name),n=r.module.exports,o=r.declare.call(e,function(e,r){if(t.locked=!0,"object"==typeof e)for(var o in e)n[o]=e[o];else n[e]=r;for(var a=0,u=t.importers.length;u>a;a++){var d=t.importers[a];if(!d.locked)for(var i=0;i<d.dependencies.length;++i)d.dependencies[i]===t&&d.setters[i](n)}return t.locked=!1,r},r.name);t.setters=o.setters,t.execute=o.execute;for(var a=0,i=r.normalizedDeps.length;i>a;a++){var l,s=r.normalizedDeps[a],c=v[s],f=y[s];f?l=f.exports:c&&!c.declarative?l=c.esModule:c?(d(c),f=c.module,l=f.exports):l=p(s),f&&f.importers?(f.importers.push(t),t.dependencies.push(f)):t.dependencies.push(null),t.setters[a]&&t.setters[a](l)}}}function i(e){var r,t=v[e];if(t)t.declarative?f(e,[]):t.evaluated||l(t),r=t.module.exports;else if(r=p(e),!r)throw new Error("Unable to load dependency "+e+".");return(!t||t.declarative)&&r&&r.__useDefault?r["default"]:r}function l(r){if(!r.module){var t={},n=r.module={exports:t,id:r.name};if(!r.executingRequire)for(var o=0,a=r.normalizedDeps.length;a>o;o++){var u=r.normalizedDeps[o],d=v[u];d&&l(d)}r.evaluated=!0;var c=r.execute.call(e,function(e){for(var t=0,n=r.deps.length;n>t;t++)if(r.deps[t]==e)return i(r.normalizedDeps[t]);throw new TypeError("Module "+e+" not declared as a dependency.")},t,n);c&&(n.exports=c),t=n.exports,t&&t.__esModule?r.esModule=t:r.esModule=s(t)}}function s(r){var t={};if(("object"==typeof r||"function"==typeof r)&&r!==e)if(m)for(var n in r)"default"!==n&&c(t,r,n);else{var o=r&&r.hasOwnProperty;for(var n in r)"default"===n||o&&!r.hasOwnProperty(n)||(t[n]=r[n])}return t["default"]=r,x(t,"__useDefault",{value:!0}),t}function c(e,r,t){try{var n;(n=Object.getOwnPropertyDescriptor(r,t))&&x(e,t,n)}catch(o){return e[t]=r[t],!1}}function f(r,t){var n=v[r];if(n&&!n.evaluated&&n.declarative){t.push(r);for(var o=0,a=n.normalizedDeps.length;a>o;o++){var u=n.normalizedDeps[o];-1==g.call(t,u)&&(v[u]?f(u,t):p(u))}n.evaluated||(n.evaluated=!0,n.module.execute.call(e))}}function p(e){if(I[e])return I[e];if("@node/"==e.substr(0,6))return D(e.substr(6));var r=v[e];if(!r)throw"Module "+e+" not present.";return a(e),f(e,[]),v[e]=void 0,r.declarative&&x(r.module.exports,"__esModule",{value:!0}),I[e]=r.declarative?r.module.exports:r.esModule}var v={},g=Array.prototype.indexOf||function(e){for(var r=0,t=this.length;t>r;r++)if(this[r]===e)return r;return-1},m=!0;try{Object.getOwnPropertyDescriptor({a:0},"a")}catch(h){m=!1}var x;!function(){try{Object.defineProperty({},"a",{})&&(x=Object.defineProperty)}catch(e){x=function(e,r,t){try{e[r]=t.value||t.get.call(e)}catch(n){}}}}();var y={},D="undefined"!=typeof System&&System._nodeRequire||"undefined"!=typeof require&&require.resolve&&"undefined"!=typeof process&&require,I={"@empty":{}};return function(e,n,o,a){return function(u){u(function(u){for(var d={_nodeRequire:D,register:r,registerDynamic:t,get:p,set:function(e,r){I[e]=r},newModule:function(e){return e}},i=0;i<n.length;i++)(function(e,r){r&&r.__esModule?I[e]=r:I[e]=s(r)})(n[i],arguments[i]);a(d);var l=p(e[0]);if(e.length>1)for(var i=1;i<e.length;i++)p(e[i]);return o?l["default"]:l})}}}("undefined"!=typeof self?self:global)

(["1"], ["5","6"], false, function($__System) {
var require = this.require, exports = this.exports, module = this.module;
$__System.register("2", [], function() { return { setters: [], execute: function() {} } });

$__System.register('3', ['2', '4', '5', '6', '7', '8', '9', 'a', 'b'], function (_export) {
    var angular, d3, d3tooltip, d3legend, createTreeLayout, mergeTemplateLayout, calcColourBarSize, drawColourBar, createNodeTypes, createDynamicNodeAttr, testLabelLength, _Set, _Array$from, _getIterator, _Object$keys, layoutTemplate;

    function RadialLineagePlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("ancestry ancestry-radial-lineage-plot");

                var svg = d3.select(element[0]).append("svg").style("width", "100%");

                var colours = d3.scale.category10(),
                    tooltip = new d3tooltip(d3.select(element[0])),
                    hovering = false,
                    virtualRoot = null,
                    virtualRootName = "virtual_root",
                    r = undefined,
                    labelOffset = 20,
                    defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                    visibleSeries = new _Set();

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    var defs = svg.append("defs");

                    // do not continue rendering if there is no data
                    if (!scope.value || !scope.value.data.length) return;

                    var seriesNames = _Array$from(new _Set(scope.value.data.map(function (d) {
                        return d.series;
                    })));

                    if (options.isNewData) {
                        colours.domain([]);
                        visibleSeries = new _Set(seriesNames);
                    }

                    var copy = angular.copy(scope.value),
                        layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                        pathname = $window.location.pathname;

                    var treeData = createTreeLayout(filterSeries(copy.data, visibleSeries)),
                        longestNodeName = treeData.length ? treeData.reduce(function (a, b) {
                        return a.name.length > b.name.length ? a : b;
                    }).name : "";

                    var elementWidth = element[0].offsetWidth;

                    var isMultipleTree = treeData.length > 1,
                        multipleTreeOffset = isMultipleTree ? 30 : 0,
                        maxLabelLength = testLabelLength(svg, longestNodeName, layout.outerNodeLabel),
                        colourBarOffset = 20,
                        start = null,
                        rotate = 0,
                        rotateOld = 0,
                        rotationDifference = undefined,
                        transitionScale = d3.scale.log().domain([1, 181]).range([0, 1500]),
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

                        heatmapColourScale = d3.scale.linear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, height);
                            layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, width);

                            colourbar = chart.append("g").attr("class", "ancestry-colourbar").attr("transform", "translate(0,0)");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

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

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).onClick(legendClick).maxSize({ width: width, height: height }).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "ancestry-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;legendWidth = bbox.width;
                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendOut.right ? legendWidth - 10 : legendOut.left ? legendWidth - 11 : legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendOut.bottom ? legendHeight - 11 : legendOut.top ? legendHeight - 11 : legendHeight;
                        }
                    }

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
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
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            posX = pos.x === "left" ? width / 2 - r : pos.x === "right" ? width / 2 + r + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                            posY = pos.y === "top" ? height / 2 - r : pos.y === "bottom" ? height / 2 + r : height / 2;

                        legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                    }

                    if (isMultipleTree) {
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
                            for (var _iterator = _getIterator(treeData), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
                                if (!_iteratorNormalCompletion && _iterator['return']) {
                                    _iterator['return']();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        treeData = virtualRoot;
                    } else if (treeData.length) {
                        treeData = treeData[0];
                        spreadNodes(treeData);
                    }

                    var types = createNodeTypes(copy.data, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    var cluster = d3.layout.cluster().size([360, 1]).sort(null).children(function (d) {
                        return d.children;
                    }).separation(function () {
                        return 1;
                    });

                    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("-webkit-backface-visibility", "hidden");

                    // Catch mouse events in Safari.
                    svg.append("rect").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("fill", "none");

                    var visTranslate = [width / 2, height / 2],
                        vis = chart.append("g").attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')');

                    var nodes = visibleSeries.size ? cluster.nodes(treeData) : [],
                        links = cluster.links(nodes);

                    nodes.forEach(function (d) {
                        d.x0 = d.x; // remember initial position
                        if (d.name === virtualRootName) d.y = 0;else d.y = multipleTreeOffset + d._depth * totalTreeLength;
                    });

                    // render chart title
                    if (layout.title) {
                        titleSVG = chart.append("text").attr("x", width / 2).attr("y", height / 2 - r - (layout.legend.position.y == "top" && layout.legend.anchor.y == "outside" ? legendHeight : 10)).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                    }

                    // TODO: implement equidistant generations
                    //let maxGen = 15;//d3.max(treeData.trees[0].map(d => d.generation));
                    //nodes.forEach(function(d){d.y = d.generation / maxGen * 300});

                    if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                        layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, 2 * r);
                        layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                        colourbar.attr("transform", 'translate(' + (width / 2 + r + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    }

                    if (layout.heatmap.enabled) {
                        heatmapCircle = vis.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(nodes.filter(function (n) {
                            return n.name != virtualRootName && !isNaN(parseFloat(n.z));
                        })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                            return heatmapColourScale(d.z);
                        }).style("opacity", layout.heatmap.opacity).attr(layout.heatmap.circle).attr("transform", function (d) {
                            return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                        });
                    }

                    var link = vis.selectAll("path.link").data(links).enter().append("path").attr("class", "link").attr("d", step).attr(layout.link).each(function (d) {
                        d.target.inLinkNode = this;
                        if (d.source.outLinkNodes) d.source.outLinkNodes.push(this);else d.source.outLinkNodes = [this];
                    });

                    var node = vis.selectAll("g.node").data(nodes.filter(function (n) {
                        return n.x !== undefined;
                    })).enter().append("g").attr("id", function (d) {
                        return d.name;
                    }).attr("class", "node").attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                    }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false)).on("click", clicked).each(function (d) {
                        d.nodeGroupNode = this;
                    });

                    if (isMultipleTree) {
                        var virtualNode = vis.select("g.node#virtual_root");

                        virtualNode.style("visibility", "hidden");
                        virtualNode.data()[0].outLinkNodes.forEach(function (link) {
                            d3.select(link).style("visibility", "hidden");
                        });
                    }

                    node.append("text").attr("class", "mouseover-label").attr("transform", "rotate(90)").attr("dy", ".25em").attr("dx", ".6em").attr(layout.nodeLabel).style("opacity", 1e-6).text(function (d) {
                        return d.name;
                    }).call(getBB);

                    node.insert("rect", "text").attr("x", function (d) {
                        return d.bbox.x - 3;
                    }).attr("y", function (d) {
                        return d.bbox.y;
                    }).attr("width", function (d) {
                        return d.bbox.width + 6;
                    }).attr("height", function (d) {
                        return d.bbox.height + 3;
                    }).attr("transform", "rotate(90)").style("fill", "white").style("opacity", 1e-6);

                    node.append("circle").style("stroke", function (d) {
                        return d.name !== virtualRootName ? colours(d.series) : "none";
                    }).attr(nodeAttr);

                    var maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + labelOffset) / nodes.filter(function (d) {
                        return !d.children || !d.children.length;
                    }).length;

                    layout.outerNodeLabel["font-size"] = d3.min([layout.outerNodeLabel["font-size"], maxLabelHeight]);

                    var label = vis.selectAll("text.outer-label").data(nodes.filter(function (d) {
                        return d.x !== undefined && !d.children;
                    })).enter().append("text").attr(layout.outerNodeLabel).attr("class", "outer-label").attr("dy", ".31em").attr("text-anchor", function (d) {
                        return d.x < 180 ? "start" : "end";
                    }).attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')\n                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                             rotate(' + (d.x < 180 ? 0 : 180) + ')';
                    }).text(function (d) {
                        return d.name;
                    });

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
                        }).transition().duration(duration).attrTween("transform", tweenNodeGroup).each("end", function (d) {
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
                            vis.transition().delay(duration).duration(transitionScale(rotationDifference + 1)).attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')rotate(' + rotate + ')').each("end", function () {
                                d3.select(this).selectAll("text.outer-label").attr("text-anchor", function (d) {
                                    return (d.x + rotate) % 360 < 180 ? "start" : "end";
                                }).attr("transform", function (d) {
                                    return 'rotate(' + (d.x - 90) + ')\n                                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                                             rotate(' + ((d.x + rotate) % 360 < 180 ? 0 : 180) + ')';
                                });
                            });
                        }

                        rotateOld = rotate;
                    }

                    svg.on("mousedown", function () {
                        if (!hovering) {
                            svg.style("cursor", "move");
                            start = mouse(this);
                            d3.event.preventDefault();
                        }
                    });
                    svg.on("mouseup", function () {
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
                        var s = project(d.source),
                            m = project({ x: d.target.x, y: d.source.y }),
                            t = project(d.target),
                            r = d.source.y,
                            sweep = d.target.x > d.source.x ? 1 : 0,
                            largeArc = Math.abs(d.target.x - d.source.x) % 360 > 180 ? 1 : 0;

                        return 'M' + s[0] + ',' + s[1] + 'A' + r + ',' + r + ' 0 ' + largeArc + ',' + sweep + ' ' + m[0] + ',' + m[1] + 'L' + t[0] + ',' + t[1];
                    }

                    function tweenPath(d) {
                        var midSourceX = d.source._x !== undefined ? d3.interpolateNumber(d.source._x, d.source.x) : function () {
                            return d.source.x;
                        },
                            midTargetX = d.target._x !== undefined ? d3.interpolateNumber(d.target._x, d.target.x) : function () {
                            return d.target.x;
                        },
                            midpoints = { target: { x: 0, y: d.target.y }, source: { x: 0, y: d.source.y } };

                        return function (t) {
                            midpoints.source.x = midSourceX(t);
                            midpoints.target.x = midTargetX(t);
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
        var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        if (!node.children || !node.children.length) {
            node._depth = 1;
            return level;
        }
        var max = 1,
            childMax = undefined;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = _getIterator(node.children), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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
                if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                    _iterator2['return']();
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
            parent = undefined;

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = _getIterator(nodes), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var node = _step3.value;

                nodesDict[node.name] = node;
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                    _iterator3['return']();
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
            for (var _iterator4 = _getIterator(nodes), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var node = _step4.value;

                var currentNode = node;
                if (!activeSeries.has(currentNode.series)) continue;
                while (parent = currentNode.parent) {
                    var parentNode = nodesDict[parent];
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
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                    _iterator4['return']();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        return filteredNodes;
    }

    return {
        setters: [function (_3) {}, function (_4) {}, function (_5) {
            angular = _5['default'];
        }, function (_6) {
            d3 = _6['default'];
        }, function (_7) {
            d3tooltip = _7.d3tooltip;
            d3legend = _7.d3legend;
            createTreeLayout = _7.createTreeLayout;
            mergeTemplateLayout = _7.mergeTemplateLayout;
            calcColourBarSize = _7.calcColourBarSize;
            drawColourBar = _7.drawColourBar;
            createNodeTypes = _7.createNodeTypes;
            createDynamicNodeAttr = _7.createDynamicNodeAttr;
            testLabelLength = _7.testLabelLength;
        }, function (_) {
            _Set = _['default'];
        }, function (_2) {
            _Array$from = _2['default'];
        }, function (_a) {
            _getIterator = _a['default'];
        }, function (_b) {
            _Object$keys = _b['default'];
        }],
        execute: function () {
            'use strict';

            layoutTemplate = {
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

            _export('default', angular.module('ancestry.radial-lineage', ['ancestry.utils']).directive('radialLineagePlot', RadialLineagePlotDirective));
        }
    };
});
$__System.register("c", [], function() { return { setters: [], execute: function() {} } });

$__System.register('d', ['4', '5', '6', '7', '8', '9', 'a', 'b', 'c'], function (_export) {
    var angular, d3, d3legend, createTreeLayout, mergeTemplateLayout, calcColourBarSize, drawColourBar, createNodeTypes, createDynamicNodeAttr, testLabelLength, _Set, _Array$from, _getIterator, _Object$keys, layoutTemplate;

    function RadialPhylogeneticTreeDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                branchlength: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("ancestry ancestry-radial-phylogenetic-tree");

                var svg = d3.select(element[0]).append("svg").style("width", "100%");

                var hovering = false,
                    virtualRoot = null,
                    virtualRootName = "virtual_root",
                    r = undefined,
                    labelOffset = 20,
                    defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                    link = null,
                    node = null,
                    linkExtension = null,
                    totalTreeLength = undefined,
                    multipleTreeOffset = 0,
                    visibleSeries = new _Set(),
                    colours = d3.scale.category10();

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    var defs = svg.append("defs");

                    // do not continue rendering if there is no data
                    if (!scope.value || !scope.value.data.length) return;

                    var seriesNames = _Array$from(new _Set(extractProp(scope.value.data, "series")));

                    if (options.isNewData) {
                        colours.domain([]);
                        visibleSeries = new _Set(seriesNames);
                    }

                    var copy = angular.copy(scope.value),
                        treeData = copy.data,
                        layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                        pathname = $window.location.pathname,
                        longestNodeName = treeData.length ? extractProp(treeData, "name").reduce(function (a, b) {
                        return a.length > b.length ? a : b;
                    }) : "";

                    var elementWidth = element[0].offsetWidth;

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = _getIterator(treeData), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var t = _step.value;

                            collapseSeries(t, visibleSeries);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator['return']) {
                                _iterator['return']();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    var isMultipleTree = treeData.length > 1,
                        maxLabelLength = testLabelLength(svg, longestNodeName, layout.outerNodeLabel),
                        colourBarOffset = 20,
                        start = null,
                        rotate = 0,
                        heatmapColourScale = null,
                        heatmapCircle = null,
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

                    if (layout.legend.show) {
                        if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                        if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                    }

                    var margin = layout.margin;
                    if (layout.title) margin.top += legendOut.top ? 26 : 25;

                    var chart = svg.append("g");

                    multipleTreeOffset = isMultipleTree ? 30 : 0;

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

                        heatmapColourScale = d3.scale.linear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(layout.heatmap.colourBar.height, height);
                            layout.heatmap.colourBar.width = calcColourBarSize(layout.heatmap.colourBar.width, width);

                            colourbar = chart.append("g").attr("class", "ancestry-colourbar").attr("transform", "translate(0,0)");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

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

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).onClick(legendClick).maxSize({ width: width, height: height }).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "ancestry-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;legendWidth = bbox.width;
                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendOut.right ? legendWidth - 10 : legendOut.left ? legendWidth - 11 : legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendOut.bottom ? legendHeight - 11 : legendOut.top ? legendHeight - 11 : legendHeight;
                        }
                    }

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
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
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            posX = pos.x === "left" ? width / 2 - r : pos.x === "right" ? width / 2 + r + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                            posY = pos.y === "top" ? height / 2 - r : pos.y === "bottom" ? height / 2 + r : height / 2;

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

                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = _getIterator(treeData), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var tree = _step2.value;

                                spreadNodes(tree);
                                tree.parent = virtualRootName;
                                virtualRoot.children.push(tree);
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                                    _iterator2['return']();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }

                        trees = virtualRoot;
                    } else {
                        trees = treeData[0];
                        spreadNodes(trees);
                    }

                    var types = createNodeTypes(treeData, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    var cluster = d3.layout.cluster().size([360, 1]).sort(function (a, b) {
                        return d3.ascending(a.length, b.length);
                    }).children(function (d) {
                        return d.children;
                    }).separation(function () {
                        return 1;
                    });

                    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("-webkit-backface-visibility", "hidden");

                    // Catch mouse events in Safari.
                    svg.append("rect").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("fill", "none");

                    var visTranslate = [width / 2, height / 2],
                        vis = chart.append("g").attr("transform", 'translate(' + visTranslate[0] + ',' + visTranslate[1] + ')');

                    var nodes = cluster.nodes(trees),
                        links = cluster.links(nodes);

                    nodes.forEach(function (d) {
                        d.y = d.name === virtualRootName ? 0 : multipleTreeOffset + d._depth * totalTreeLength;
                    });

                    // render chart title
                    if (layout.title) {
                        titleSVG = chart.append("text").attr("x", width / 2).attr("y", height / 2 - r - (layout.legend.position.y == "top" && layout.legend.anchor.y == "outside" ? legendHeight : 10)).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                    }

                    if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                        layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, 2 * r);
                        layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                        colourbar.attr("transform", 'translate(' + (width / 2 + r + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    }

                    if (layout.heatmap.enabled) {
                        heatmapCircle = vis.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(nodes.filter(function (n) {
                            return n.taxon && n.taxon.name !== null && !isNaN(parseFloat(n.taxon.z));
                        })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                            return heatmapColourScale(d.taxon.z);
                        }).style("opacity", layout.heatmap.opacity).attr(layout.heatmap.circle).attr("transform", function (d) {
                            return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                        });
                    }

                    removeNegativeLengths(trees);
                    setRadius(trees, trees.length = 0, totalTreeLength / maxLength(trees));

                    var show = scope.branchlength !== undefined ? scope.branchlength : true;
                    linkExtension = vis.append("g").selectAll("path").data(links.filter(function (d) {
                        return !d.target.children;
                    })).enter().append("path").attr("class", "link-extension").each(function (d) {
                        d.target.linkExtensionNode = this;
                    }).attr("d", function (d) {
                        return step2(d.target.x, show ? d.target.radius : d.target.y, d.target.x, totalTreeLength + multipleTreeOffset);
                    });

                    link = vis.append("g").selectAll("path").data(links).enter().append("path").attr("class", "link").attr(layout.link).each(function (d) {
                        d.target.linkNode = this;
                    }).attr("d", function (d) {
                        return step2(d.source.x, show ? d.source.radius : d.source.y, d.target.x, show ? d.target.radius : d.target.y);
                    }).style("stroke", "black");

                    if (isMultipleTree) {
                        link.filter(function (d) {
                            return d.source.name === virtualRootName;
                        }).style("opacity", 0);
                    }

                    if (layout.showLeafNodes) {
                        node = vis.selectAll("g.node").data(nodes).enter().append("g")
                        //.attr("id", d => d.name)
                        .attr("class", "node").attr("transform", function (d) {
                            return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                        }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false)).each(function (d) {
                            d.nodeGroupNode = this;
                        });

                        node.filter(function (d) {
                            return !d.taxon;
                        }).style("opacity", 0);

                        node.append("circle").style("stroke", function (d) {
                            return d.taxon && d.name !== virtualRootName ? colours(d.taxon.series) : "none";
                        }).attr(nodeAttr);
                    }

                    var maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + labelOffset) / nodes.filter(function (d) {
                        return !d.children || !d.children.length;
                    }).length;

                    layout.outerNodeLabel["font-size"] = d3.min([layout.outerNodeLabel["font-size"], maxLabelHeight]);

                    var label = vis.selectAll("text.outer-label").data(nodes.filter(function (d) {
                        return !!d.taxon;
                    })).enter().append("text").attr(layout.outerNodeLabel).attr("class", "outer-label").attr("dy", ".31em").attr("text-anchor", function (d) {
                        return d.x < 180 ? "start" : "end";
                    }).attr("transform", function (d) {
                        return 'rotate(' + (d.x - 90) + ')\n                                             translate(' + (totalTreeLength + labelOffset + multipleTreeOffset) + ')\n                                             rotate(' + (d.x < 180 ? 0 : 180) + ')';
                    }).text(function (d) {
                        return d.taxon.name;
                    }).on("mouseover", mouseovered(true)).on("mouseout", mouseovered(false));

                    legend.each(moveToFront);
                    titleSVG.each(moveToFront);

                    function mouseovered(active) {
                        return function (d) {
                            d3.select(this).classed("label-active", active);
                            d3.select(d.linkExtensionNode).classed("link-extension-active", active).each(moveToFront);
                            do d3.select(d.linkNode).classed("link-active", active).each(moveToFront); while (d = d.parent);
                        };
                    }

                    svg.on("mousedown", function () {
                        if (!hovering) {
                            svg.style("cursor", "move");
                            start = mouse(this);
                            d3.event.preventDefault();
                        }
                    });
                    svg.on("mouseup", function () {
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
                    var names = [];
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = _getIterator(trees), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var tree = _step3.value;

                            extract(tree);
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                                _iterator3['return']();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }

                    function extract(tree) {
                        if (tree.taxon !== null) names.push(tree.taxon[prop]);else {
                            extract(tree.children[0]);
                            extract(tree.children[1]);
                        }
                    }
                    return names;
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
                            return step2(d.target.x, show ? d.target.radius : d.target.y, d.target.x, totalTreeLength + multipleTreeOffset);
                        });
                        link.transition().attr("d", function (d) {
                            return step2(d.source.x, show ? d.source.radius : d.source.y, d.target.x, show ? d.target.radius : d.target.y);
                        });
                    });
                });
            }
        };
    }

    function spreadNodes(node) {
        var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        if (!node.children || !node.children.length) {
            node._depth = 1;
            return level;
        }
        var max = 1,
            childMax = undefined;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = _getIterator(node.children), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var child = _step4.value;

                childMax = spreadNodes(child, level + 1);
                if (childMax > max) {
                    max = childMax;
                }
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                    _iterator4['return']();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
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

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = _getIterator(leavesOut), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var leaf = _step5.value;

                var _parent = leaf.parent;
                if (!_parent && leaf.taxon) {
                    return null;
                }
                var sibling = _parent.children[_parent.children.indexOf(leaf) ^ 1];
                var parent2 = _parent.parent;
                if (!parent2) {
                    return sibling;
                }
                parent2.children[parent2.children.indexOf(_parent)] = sibling;
                sibling.length += _parent.length;
                sibling.parent = parent2;
            }
        } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                    _iterator5['return']();
                }
            } finally {
                if (_didIteratorError5) {
                    throw _iteratorError5;
                }
            }
        }
    }

    return {
        setters: [function (_3) {}, function (_4) {
            angular = _4['default'];
        }, function (_5) {
            d3 = _5['default'];
        }, function (_6) {
            d3legend = _6.d3legend;
            createTreeLayout = _6.createTreeLayout;
            mergeTemplateLayout = _6.mergeTemplateLayout;
            calcColourBarSize = _6.calcColourBarSize;
            drawColourBar = _6.drawColourBar;
            createNodeTypes = _6.createNodeTypes;
            createDynamicNodeAttr = _6.createDynamicNodeAttr;
            testLabelLength = _6.testLabelLength;
        }, function (_) {
            _Set = _['default'];
        }, function (_2) {
            _Array$from = _2['default'];
        }, function (_a) {
            _getIterator = _a['default'];
        }, function (_b) {
            _Object$keys = _b['default'];
        }, function (_c) {}],
        execute: function () {
            'use strict';

            layoutTemplate = {
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
                    "stroke-width": 1.5
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

            _export('default', angular.module('ancestry.radial-phylogenetic-tree', ['ancestry.utils']).directive('radialPhylogeneticTree', RadialPhylogeneticTreeDirective));
        }
    };
});
$__System.register("e", [], function() { return { setters: [], execute: function() {} } });

$__System.register('f', ['4', '5', '6', '7', '8', '9', 'b', 'a', 'e'], function (_export) {
    var angular, d3, d3legend, d3tooltip, mergeTemplateLayout, createNodeTypes, labelCollisionDetection, createTreeLayout, spreadGenerations, createDynamicNodeAttr, scaleProperties, getNodeLabelBBox, drawColourBar, calcColourBarSize, getExtraSpaceForLabel, testLabelLength, _Set, _Array$from, _Object$keys, _getIterator, layoutTemplate, labelPositions;

    function LineagePlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                selectedNodes: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("ancestry ancestry-lineage-plot");

                var svg = d3.select(element[0]).append("svg").style('width', '100%');

                var maxAllowedDepth = 180,
                    mouseStart = null,
                    colours = d3.scale.category10(),
                    isDrag = false,
                    selectionRect = null,
                    tooltip = new d3tooltip(d3.select(element[0])),
                    defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                    scale = 1,
                    translate = [0, 0],
                    selectedNodes = null,
                    LCD = null,
                    // label collision detection
                lastLCDUpdateTime = 0,
                    LCDUpdateID = undefined,
                    heatmapColourScale = null,
                    heatmapCircle = null,
                    visibleSeries = new _Set();

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();
                    var defs = svg.append("defs");

                    selectedNodes = new _Set();

                    if (!scope.value || !scope.value.data.length) return;

                    var seriesNames = _Array$from(new _Set(scope.value.data.map(function (d) {
                        return d.series;
                    })));

                    if (options.isNewData) {
                        colours.domain([]);
                        visibleSeries = new _Set(seriesNames);
                    }

                    var copy = angular.copy(scope.value),
                        treeData = filterSeries(copy.data, visibleSeries),
                        longestNodeName = treeData.length ? treeData.reduce(function (a, b) {
                        return a.name.length > b.name.length ? a : b;
                    }).name : "",
                        layout = mergeTemplateLayout(copy.layout, layoutTemplate),
                        pathname = $window.location.pathname,
                        maxLabelLength = testLabelLength(svg, longestNodeName, { "font-size": 12 }),
                        maxLabelOffset = d3.max(labelPositions, function (pos) {
                        return Math.abs(pos.x);
                    }),
                        legendHeight = 0,
                        legendWidth = 0,
                        colourbarHeight = 0,
                        colourbarWidth = 0,
                        legendOut = { top: false, right: false, bottom: false, left: false },
                        showAxisTitle = layout.axis.show && !layout.axis.gridOnly && layout.axis.title,
                        showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
                        colourBarOrigWidth = layout.heatmap.colourBar.width,
                        colourBarOrigHeight = layout.heatmap.colourBar.height,
                        colourBarOffset = layout.heatmap.colourBar.show ? 15 : 0,
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

                    var allTrees = createTreeLayout(treeData),
                        root = virtualRootNode;

                    virtualRootNode.children = allTrees.map(function (node) {
                        node.parent = "virtualRoot";
                        return node;
                    });

                    if (layout.axis.valueProperty === "default") {
                        spreadGenerations(root);
                    }

                    var types = createNodeTypes(treeData, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    // FIXME: time plotting not implemented / checked yet
                    var isTimePlot = false; //trees[0].generation instanceof Date;

                    var elementWidth = d3.select(element[0]).node().offsetWidth;

                    var margin = layout.margin;

                    if (layout.title) margin.top += legendOut.top ? 26 : 25;
                    //if (!(layout.legend.position.y == "top" && layout.legend.anchor.y == "outside")) margin.top += 10;
                    if (showAxisTitle) margin.bottom += legendOut.bottom ? 16 : 18;

                    var width = layout.width || elementWidth,
                        height = layout.height;

                    // render chart area
                    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

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

                        heatmapColourScale = d3.scale.linear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
                            layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                            colourbar = chart.append("g").attr("class", "ancestry-colourbar");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

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
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            orientation = layout.legend.orientation;

                        var splitAfter = orientation === "horizontal" ? 0 : 1;

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).maxSize({ width: width, height: height }).onClick(legendClick).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "ancestry-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;
                        legendWidth = bbox.width;

                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendOut.right ? legendWidth - 10 : legendOut.left ? legendWidth - 11 : legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendOut.bottom ? layout.axis.show && !layout.axis.gridOnly ? legendHeight - 9 : legendHeight - 12 : legendOut.top ? legendHeight - 11 : legendHeight;
                        }
                    }

                    width = (layout.width || elementWidth) - margin.right - margin.left;

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
                        clicked.classed("legend-item-selected", visibleSeries.has(label));
                        clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                        render({ isNewData: false });
                    }

                    // diagonal generator
                    var diagonal = d3.svg.diagonal().target(function (d) {
                        return { x: d.target.y, y: d.target.x };
                    }).source(function (d) {
                        return { x: d.source.y, y: d.source.x };
                    }).projection(function (d) {
                        return [d.y, d.x];
                    });

                    var generationExtent = d3.extent(treeData, function (node) {
                        return node.generation;
                    }),
                        originalExtent = angular.copy(generationExtent);

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
                    var xScale = (isTimePlot ? d3.time.scale() : d3.scale.linear()).domain(generationExtent).range([0, width]);

                    var labelExtraSpace = getExtraSpaceForLabel(xScale, maxLabelLength + maxLabelOffset + 5),
                        newDomain = angular.copy(xScale.domain());

                    if (labelExtraSpace > 1) {
                        newDomain[0] = originalExtent[0] - labelExtraSpace;
                    }
                    if (labelExtraSpace > spaceRight) {
                        newDomain[1] = originalExtent[1] + labelExtraSpace;
                    }

                    xScale.domain(newDomain);

                    var xScale0 = xScale.copy();

                    var zoom = d3.behavior.zoom().scaleExtent([1, layout.maxZoom])
                    //.x(xScale) // TODO: can be reworked when xExtent is implemented in d3.js
                    .on("zoom", zoomed);

                    chart.attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')').call(zoom).on("dblclick.zoom", onDoubleClick);

                    // Define x axis and grid
                    var xAxis = d3.svg.axis().scale(xScale).innerTickSize(0).outerTickSize(0).orient("bottom");

                    //render x axis
                    if (layout.axis.show) {
                        axisSVG = chart.append("g").attr("class", "axis x-axis").call(xAxis);

                        if (!layout.axis.gridOnly) {
                            xAxisOffset = axisSVG.node().getBBox().height;
                            margin.bottom += xAxisOffset - 3;
                        }
                    }

                    height = layout.height - margin.top - margin.bottom;
                    xAxis.innerTickSize(-height);
                    axisSVG.attr("transform", 'translate(0, ' + height + ')').call(xAxis);

                    var treeLayout = d3.layout.tree().size([height, width]),
                        nodes = treeLayout.nodes(root).reverse(),
                        links = treeLayout.links(nodes);

                    // Calculate depth positions.
                    nodes.forEach(function (node) {
                        node.y = node.x;
                        node.x = xScale(node.generation);
                    });

                    var clip = defs.append("svg:clipPath").attr("id", "lineage-clip-rect").append("svg:rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height);

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
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            titleOffset = showAxisTitle ? 16 : 0,
                            posX = pos.x === "left" ? 0 : pos.x === "right" ? width + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                            posY = pos.y === "top" ? 0 : pos.y === "bottom" ? height - 1 + (anchor.y === "outside" ? xAxisOffset + titleOffset : 0) : height / 2;

                        legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                    }

                    if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                        layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
                        layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                        colourbar.attr("transform", 'translate(' + (width + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    }

                    var mouseCaptureGroup = chart.append("g");

                    var mouseRect = mouseCaptureGroup.append("rect").attr("id", "mouse-capture").attr("x", -margin.left).attr("y", -margin.top).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("fill", "transparent");

                    var treesContainer = chart.append("g").attr("clip-path", 'url(' + pathname + '#lineage-clip-rect)').append("g").attr("id", "trees-containter");
                    //.call(zoom)

                    if (layout.heatmap.enabled) {
                        heatmapCircle = treesContainer.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(nodes.filter(function (n) {
                            return n.name != "virtualRoot" && !isNaN(parseFloat(n.z));
                        })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                            return heatmapColourScale(d.z);
                        }).style("opacity", layout.heatmap.opacity).attr(layout.heatmap.circle).attr("transform", function (d) {
                            return 'translate(' + d.x + ',' + d.y + ')';
                        });
                    }

                    // Declare the nodes
                    var node = treesContainer.selectAll("g.node").data(nodes.filter(function (n) {
                        return n.name != "virtualRoot";
                    }));

                    // Enter the nodes.
                    var nodeEnter = node.enter().append("g").attr("class", "node").classed("selected", function (d) {
                        return selectedNodes.has(d.name);
                    }).attr("transform", function (d) {
                        return 'translate(' + d.x + ',' + d.y + ')';
                    });

                    // Add node circles
                    var circle = nodeEnter.append("circle").attr("class", "node-circle").attr(nodeAttr).style("fill", function (d) {
                        return !selectedNodes.has(d.name) ? '#FFF' : colours(d.series);
                    }).style("stroke", function (d) {
                        return colours(d.series);
                    }).each(function (d) {
                        d.bboxCircle = this.getBoundingClientRect();
                    }).on("click", click).on("mouseup", mouseUp).on("mouseover", function (d, i) {
                        var groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = '<div class="tooltip-colour-box" style="background-color: ' + colours(d.series) + '"></div>' + ('<span class="tooltip-text">' + d.name + '</span>');
                        tooltip.html(text).position([xPos, yPos]).show();
                    }).on("mouseout", function (d) {
                        tooltip.hide();
                    });

                    // Add node labels
                    var label = nodeEnter.append("text").attr("class", "node-label").attr("dy", ".35em").attr(layout.nodeLabel).attr(initialLabelPosition).text(function (d) {
                        return d.name;
                    }).style("opacity", 1).each(getNodeLabelBBox).each(function (d) {
                        return d.labelPos = initialLabelPosition;
                    });

                    var maxNodeLabelLength = d3.max(label.data().map(function (d) {
                        return d.bboxLabel.width;
                    })),
                        searchRadius = 2 * maxNodeLabelLength + 10;

                    if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay") {
                        LCD = new labelCollisionDetection(nodes.slice(0, -1), labelPositions, layout.nodeLabel, function (x) {
                            return x;
                        }, function (y) {
                            return y;
                        }, width, height, searchRadius);
                        LCD.initializeLabelPositions(label);
                    }

                    // Declare the links
                    var link = treesContainer.selectAll("path.link").data(links.filter(function (l) {
                        return l.source.name != "virtualRoot";
                    }));

                    // Enter the links.
                    link.enter().insert("path", "g").attr("class", "link").attr("d", diagonal).attr(layout.link);

                    legend.each(function () {
                        this.parentNode.appendChild(this);
                    });
                    titleSVG.each(function () {
                        this.parentNode.appendChild(this);
                    });

                    if (layout.groupSelection.enabled) {
                        mouseRect.on("mousedown", mouseDown).on("mousemove", mouseMove).on("mouseup", mouseUp).on("mouseout", mouseOut);

                        selectionRect = mouseCaptureGroup.append("rect").attr(layout.groupSelection.selectionRectangle).attr("class", "selection-rect");
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
                        var n = d3.select(this.parentNode);
                        if (!n.classed("selected")) {
                            n.classed("selected", true);
                            n.select("circle.node-circle").style("fill", function (d) {
                                return colours(d.series);
                            });
                        } else {
                            n.classed("selected", false);
                            n.select("circle.node-circle").style("fill", "#FFF");
                        }
                        updateSelection();
                    }

                    function mouseUp(pos) {
                        if (!isDrag || !mouseStart) return;

                        var p = arguments.length == 1 ? pos : d3.mouse(this);
                        if (!selectPoints(selectionRect) && mouseStart[0] != p[0] && mouseStart[1] != p[1]) {
                            node.classed("selected", false).selectAll("circle.node-circle").style("fill", "#FFF");
                        }
                        selectionRect.attr("width", 0);
                        updateSelection();
                        mouseStart = null;
                        isDrag = false;
                        circle.style("pointer-events", "all");
                    }

                    function mouseOut() {
                        if (!isDrag) return;
                        selectionRect.attr("width", 0);
                        updateSelection();
                        mouseStart = null;
                        isDrag = false;
                        circle.style("pointer-events", "all");
                    }

                    function mouseMove() {
                        if (!isDrag) return;
                        var p = d3.mouse(this);
                        if (!d3.event.ctrlKey) {
                            mouseUp(p);
                            return;
                        }
                        var d = {
                            x: p[0] < mouseStart[0] ? p[0] : mouseStart[0],
                            y: p[1] < mouseStart[1] ? p[1] : mouseStart[1],
                            height: Math.abs(p[1] - mouseStart[1]),
                            width: Math.abs(p[0] - mouseStart[0])
                        };
                        selectionRect.attr(d);
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
                            var t = d3.transform(n.attr("transform")),
                                tx = t.translate[0],
                                ty = t.translate[1];

                            if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                                n.classed("selected", true);
                                n.select("circle.node-circle").style("fill", function (d) {
                                    return colours(d.series);
                                });
                                any = true;
                            } else if (!selectedNodes.has(d.name)) {
                                n.classed("selected", false);
                                n.select("circle.node-circle").style("fill", "#FFF");
                            }
                        });

                        return any;
                    }

                    function updateSelection() {
                        var wasChange = false;

                        svg.selectAll("g.node.selected").each(function (d) {
                            if (!selectedNodes.has(d.name)) {
                                selectedNodes.add(d.name);
                                wasChange = true;
                            }
                        });

                        svg.selectAll("g.node:not(.selected)").each(function (d) {
                            if (selectedNodes.has(d.name)) {
                                selectedNodes['delete'](d.name);
                                wasChange = true;
                            }
                        });

                        if (wasChange && scope.selectedNodes) {
                            scope.selectedNodes = _Array$from(selectedNodes);
                            scope.$apply();
                        }
                    }

                    function zoomed() {
                        if (d3.event.sourceEvent.ctrlKey) {
                            zoom.translate(translate);
                            zoom.scale(scale);
                            return;
                        }

                        var t = zoom.translate(),
                            s = zoom.scale(),
                            now = performance.now();
                        if (s == scale && t[0] == translate[0] && t[1] == translate[1]) return;
                        scale = s;
                        translate = t;
                        translate[0] = translate[0].clamp((1 - scale) * width, 0);
                        translate[1] = translate[1].clamp((1 - scale) * height, 0);
                        zoom.translate(translate);
                        xScale.domain(xScale0.range().map(function (x) {
                            return (x - translate[0]) / scale;
                        }).map(xScale0.invert));
                        applyZoom();
                        if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                            LCD.recalculateLabelPositions(label, scale);
                        } else if (layout.labelCollisionDetection.enabled === "onDelay") {
                            window.clearTimeout(LCDUpdateID);
                            LCDUpdateID = window.setTimeout(function () {
                                LCD.recalculateLabelPositions(label, scale);
                            }, layout.labelCollisionDetection.updateDelay);
                            lastLCDUpdateTime = now;
                        }
                    }

                    function applyZoom() {
                        treesContainer.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                        mouseCaptureGroup.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                        xAxis.ticks(xScale.domain().reduce(function (a, b) {
                            return b - a;
                        }));
                        svg.select(".x-axis.axis").call(xAxis);
                        if (layout.axis.gridOnly) {
                            chart.selectAll("g.x-axis g.tick text").style("opacity", 1e-6);
                        }
                        svg.selectAll(".node circle.node-circle").attr(scaleProperties(nodeAttr, scale, true)).attr("stroke", function (d) {
                            return colours(d.series);
                        }).each(function (d) {
                            d.bboxCircle = this.getBoundingClientRect();
                        });
                        if (layout.heatmap.enabled) {
                            heatmapCircle.attr(scaleProperties(layout.heatmap.circle, scale));
                        }
                        svg.selectAll("path.link").attr(scaleProperties(layout.link, scale));
                        if (layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay" || layout.labelCollisionDetection.enabled === "never") {
                            label.each(function (d) {
                                var self = d3.select(this);
                                self.attr(scaleProperties(layout.nodeLabel, scale)).attr(scaleProperties(d.labelPos, scale));
                            });
                        }

                        if (layout.groupSelection.enabled) {
                            selectionRect.attr(scaleProperties(layout.groupSelection.selectionRectangle, scale));
                        }
                    }

                    function onDoubleClick() {
                        var now = performance.now();
                        scale = 1;
                        translate = [0, 0];
                        zoom.scale(1);
                        xScale.domain(xScale0.domain());
                        applyZoom();
                        if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                            LCD.recalculateLabelPositions(label, scale);
                        } else if (layout.labelCollisionDetection.enabled === "onDelay") {
                            window.clearTimeout(LCDUpdateID);
                            LCDUpdateID = window.setTimeout(function () {
                                LCD.recalculateLabelPositions(label, scale);
                            }, layout.labelCollisionDetection.updateDelay);
                            lastLCDUpdateTime = now;
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

    function filterSeries(nodes, activeSeries) {
        var filteredNodes = [],
            nodesDict = {},
            parent = undefined;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = _getIterator(nodes), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var node = _step.value;

                nodesDict[node.name] = node;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator['return']) {
                    _iterator['return']();
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
            for (var _iterator2 = _getIterator(nodes), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var node = _step2.value;

                var currentNode = node;
                if (!activeSeries.has(currentNode.series)) continue;
                while (parent = currentNode.parent) {
                    var parentNode = nodesDict[parent];
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
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                    _iterator2['return']();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        return filteredNodes;
    }

    return {
        setters: [function (_3) {}, function (_4) {
            angular = _4['default'];
        }, function (_5) {
            d3 = _5['default'];
        }, function (_6) {
            d3legend = _6.d3legend;
            d3tooltip = _6.d3tooltip;
            mergeTemplateLayout = _6.mergeTemplateLayout;
            createNodeTypes = _6.createNodeTypes;
            labelCollisionDetection = _6.labelCollisionDetection;
            createTreeLayout = _6.createTreeLayout;
            spreadGenerations = _6.spreadGenerations;
            createDynamicNodeAttr = _6.createDynamicNodeAttr;
            scaleProperties = _6.scaleProperties;
            getNodeLabelBBox = _6.getNodeLabelBBox;
            drawColourBar = _6.drawColourBar;
            calcColourBarSize = _6.calcColourBarSize;
            getExtraSpaceForLabel = _6.getExtraSpaceForLabel;
            testLabelLength = _6.testLabelLength;
        }, function (_) {
            _Set = _['default'];
        }, function (_2) {
            _Array$from = _2['default'];
        }, function (_b) {
            _Object$keys = _b['default'];
        }, function (_a) {
            _getIterator = _a['default'];
        }, function (_e) {}],
        execute: function () {
            'use strict';

            Number.prototype.clamp = function (min, max) {
                return Math.min(Math.max(this, min), max);
            };

            layoutTemplate = {
                title: null,
                width: null,
                height: 600,
                margin: {
                    right: 10,
                    left: 10,
                    top: 10,
                    bottom: 10
                },
                axis: {
                    title: "",
                    show: true,
                    gridOnly: false,
                    valueProperty: "default"
                },
                nodeTypes: {},
                nodeLabel: {
                    "font-size": 12
                },
                labelCollisionDetection: {
                    enabled: "never",
                    updateDelay: 500
                },
                link: {
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
                    orientation: "vertical"
                }
            };
            labelPositions = [{
                x: 10,
                y: 0,
                "text-anchor": "start"
            }, {
                x: -10,
                y: 0,
                "text-anchor": "end"
            }];

            _export('default', angular.module('ancestry.lineage', ['ancestry.utils']).directive('lineagePlot', LineagePlotDirective));
        }
    };
});
$__System.register("10", [], function() { return { setters: [], execute: function() {} } });

$__System.register('4', ['5'], function (_export) {
    'use strict';

    var angular;

    function WindowResize($window, $rootScope) {
        var window = angular.element($window);
        var width = window[0].innerWidth;

        angular.element($window).on('resize', function (event) {
            var newWidth = window[0].innerWidth;
            if (width != newWidth) {
                $rootScope.$broadcast('window-resize', width = newWidth);
            }
        });
    }

    return {
        setters: [function (_) {
            angular = _['default'];
        }],
        execute: function () {
            _export('default', angular.module('ancestry.utils', []).service("WindowResize", WindowResize));
        }
    };
});
$__System.registerDynamic("11", ["12"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('12');
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  return module.exports;
});

$__System.registerDynamic("13", ["11"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('11'),
    __esModule: true
  };
  return module.exports;
});

$__System.registerDynamic("14", ["13"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var _Object$defineProperty = $__require('13')["default"];
  exports["default"] = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        _Object$defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();
  exports.__esModule = true;
  return module.exports;
});

$__System.registerDynamic("15", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  exports["default"] = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  exports.__esModule = true;
  return module.exports;
});

$__System.registerDynamic("16", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  "format cjs";
  return module.exports;
});

$__System.registerDynamic("17", ["12", "18", "19"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('12'),
      SPECIES = $__require('18')('species');
  module.exports = function(C) {
    if ($__require('19') && !(SPECIES in C))
      $.setDesc(C, SPECIES, {
        configurable: true,
        get: function() {
          return this;
        }
      });
  };
  return module.exports;
});

$__System.registerDynamic("1a", ["12", "1b", "1c", "17", "1d", "1e", "1f", "20", "21", "22", "23", "19", "24", "25", "26"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('12'),
      hide = $__require('1b'),
      ctx = $__require('1c'),
      species = $__require('17'),
      strictNew = $__require('1d'),
      defined = $__require('1e'),
      forOf = $__require('1f'),
      step = $__require('20'),
      ID = $__require('21')('id'),
      $has = $__require('22'),
      isObject = $__require('23'),
      isExtensible = Object.isExtensible || isObject,
      SUPPORT_DESC = $__require('19'),
      SIZE = SUPPORT_DESC ? '_s' : 'size',
      id = 0;
  var fastKey = function(it, create) {
    if (!isObject(it))
      return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
    if (!$has(it, ID)) {
      if (!isExtensible(it))
        return 'F';
      if (!create)
        return 'E';
      hide(it, ID, ++id);
    }
    return 'O' + it[ID];
  };
  var getEntry = function(that, key) {
    var index = fastKey(key),
        entry;
    if (index !== 'F')
      return that._i[index];
    for (entry = that._f; entry; entry = entry.n) {
      if (entry.k == key)
        return entry;
    }
  };
  module.exports = {
    getConstructor: function(wrapper, NAME, IS_MAP, ADDER) {
      var C = wrapper(function(that, iterable) {
        strictNew(that, C, NAME);
        that._i = $.create(null);
        that._f = undefined;
        that._l = undefined;
        that[SIZE] = 0;
        if (iterable != undefined)
          forOf(iterable, IS_MAP, that[ADDER], that);
      });
      $__require('24')(C.prototype, {
        clear: function clear() {
          for (var that = this,
              data = that._i,
              entry = that._f; entry; entry = entry.n) {
            entry.r = true;
            if (entry.p)
              entry.p = entry.p.n = undefined;
            delete data[entry.i];
          }
          that._f = that._l = undefined;
          that[SIZE] = 0;
        },
        'delete': function(key) {
          var that = this,
              entry = getEntry(that, key);
          if (entry) {
            var next = entry.n,
                prev = entry.p;
            delete that._i[entry.i];
            entry.r = true;
            if (prev)
              prev.n = next;
            if (next)
              next.p = prev;
            if (that._f == entry)
              that._f = next;
            if (that._l == entry)
              that._l = prev;
            that[SIZE]--;
          }
          return !!entry;
        },
        forEach: function forEach(callbackfn) {
          var f = ctx(callbackfn, arguments[1], 3),
              entry;
          while (entry = entry ? entry.n : this._f) {
            f(entry.v, entry.k, this);
            while (entry && entry.r)
              entry = entry.p;
          }
        },
        has: function has(key) {
          return !!getEntry(this, key);
        }
      });
      if (SUPPORT_DESC)
        $.setDesc(C.prototype, 'size', {get: function() {
            return defined(this[SIZE]);
          }});
      return C;
    },
    def: function(that, key, value) {
      var entry = getEntry(that, key),
          prev,
          index;
      if (entry) {
        entry.v = value;
      } else {
        that._l = entry = {
          i: index = fastKey(key, true),
          k: key,
          v: value,
          p: prev = that._l,
          n: undefined,
          r: false
        };
        if (!that._f)
          that._f = entry;
        if (prev)
          prev.n = entry;
        that[SIZE]++;
        if (index !== 'F')
          that._i[index] = entry;
      }
      return that;
    },
    getEntry: getEntry,
    setStrong: function(C, NAME, IS_MAP) {
      $__require('25')(C, NAME, function(iterated, kind) {
        this._t = iterated;
        this._k = kind;
        this._l = undefined;
      }, function() {
        var that = this,
            kind = that._k,
            entry = that._l;
        while (entry && entry.r)
          entry = entry.p;
        if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
          that._t = undefined;
          return step(1);
        }
        if (kind == 'keys')
          return step(0, entry.k);
        if (kind == 'values')
          return step(0, entry.v);
        return step(0, [entry.k, entry.v]);
      }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);
      species(C);
      species($__require('26')[NAME]);
    }
  };
  return module.exports;
});

$__System.registerDynamic("1d", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(it, Constructor, name) {
    if (!(it instanceof Constructor))
      throw TypeError(name + ": use the 'new' operator!");
    return it;
  };
  return module.exports;
});

$__System.registerDynamic("24", ["27"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $redef = $__require('27');
  module.exports = function(target, src) {
    for (var key in src)
      $redef(target, key, src[key]);
    return target;
  };
  return module.exports;
});

$__System.registerDynamic("28", ["12", "29", "1b", "1f", "1d", "2a", "19", "2b", "24", "2c"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('12'),
      $def = $__require('29'),
      hide = $__require('1b'),
      forOf = $__require('1f'),
      strictNew = $__require('1d');
  module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
    var Base = $__require('2a')[NAME],
        C = Base,
        ADDER = IS_MAP ? 'set' : 'add',
        proto = C && C.prototype,
        O = {};
    if (!$__require('19') || typeof C != 'function' || !(IS_WEAK || proto.forEach && !$__require('2b')(function() {
      new C().entries().next();
    }))) {
      C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
      $__require('24')(C.prototype, methods);
    } else {
      C = wrapper(function(target, iterable) {
        strictNew(target, C, NAME);
        target._c = new Base;
        if (iterable != undefined)
          forOf(iterable, IS_MAP, target[ADDER], target);
      });
      $.each.call('add,clear,delete,forEach,get,has,set,keys,values,entries'.split(','), function(KEY) {
        var chain = KEY == 'add' || KEY == 'set';
        if (KEY in proto && !(IS_WEAK && KEY == 'clear'))
          hide(C.prototype, KEY, function(a, b) {
            var result = this._c[KEY](a === 0 ? 0 : a, b);
            return chain ? this : result;
          });
      });
      if ('size' in proto)
        $.setDesc(C.prototype, 'size', {get: function() {
            return this._c.size;
          }});
    }
    $__require('2c')(C, NAME);
    O[NAME] = C;
    $def($def.G + $def.W + $def.F, O);
    if (!IS_WEAK)
      common.setStrong(C, NAME, IS_MAP);
    return C;
  };
  return module.exports;
});

$__System.registerDynamic("2d", ["1a", "28"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var strong = $__require('1a');
  $__require('28')('Set', function(get) {
    return function Set() {
      return get(this, arguments[0]);
    };
  }, {add: function add(value) {
      return strong.def(this, value = value === 0 ? 0 : value, value);
    }}, strong);
  return module.exports;
});

$__System.registerDynamic("1f", ["1c", "2e", "2f", "30", "31", "32"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var ctx = $__require('1c'),
      call = $__require('2e'),
      isArrayIter = $__require('2f'),
      anObject = $__require('30'),
      toLength = $__require('31'),
      getIterFn = $__require('32');
  module.exports = function(iterable, entries, fn, that) {
    var iterFn = getIterFn(iterable),
        f = ctx(fn, that, entries ? 2 : 1),
        index = 0,
        length,
        step,
        iterator;
    if (typeof iterFn != 'function')
      throw TypeError(iterable + ' is not iterable!');
    if (isArrayIter(iterFn))
      for (length = toLength(iterable.length); length > index; index++) {
        entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
      }
    else
      for (iterator = iterFn.call(iterable); !(step = iterator.next()).done; ) {
        call(iterator, f, step.value, entries);
      }
  };
  return module.exports;
});

$__System.registerDynamic("33", ["1f", "34"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var forOf = $__require('1f'),
      classof = $__require('34');
  module.exports = function(NAME) {
    return function toJSON() {
      if (classof(this) != NAME)
        throw TypeError(NAME + "#toJSON isn't generic");
      var arr = [];
      forOf(this, false, arr.push, arr);
      return arr;
    };
  };
  return module.exports;
});

$__System.registerDynamic("35", ["29", "33"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $def = $__require('29');
  $def($def.P, 'Set', {toJSON: $__require('33')('Set')});
  return module.exports;
});

$__System.registerDynamic("36", ["16", "37", "38", "2d", "35", "26"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('16');
  $__require('37');
  $__require('38');
  $__require('2d');
  $__require('35');
  module.exports = $__require('26').Set;
  return module.exports;
});

$__System.registerDynamic("8", ["36"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('36'),
    __esModule: true
  };
  return module.exports;
});

$__System.registerDynamic("39", ["29", "26", "2b"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(KEY, exec) {
    var $def = $__require('29'),
        fn = ($__require('26').Object || {})[KEY] || Object[KEY],
        exp = {};
    exp[KEY] = exec(fn);
    $def($def.S + $def.F * $__require('2b')(function() {
      fn(1);
    }), 'Object', exp);
  };
  return module.exports;
});

$__System.registerDynamic("3a", ["3b", "39"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toObject = $__require('3b');
  $__require('39')('keys', function($keys) {
    return function keys(it) {
      return $keys(toObject(it));
    };
  });
  return module.exports;
});

$__System.registerDynamic("3c", ["3a", "26"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('3a');
  module.exports = $__require('26').Object.keys;
  return module.exports;
});

$__System.registerDynamic("b", ["3c"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('3c'),
    __esModule: true
  };
  return module.exports;
});

$__System.registerDynamic("3d", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(it) {
    if (typeof it != 'function')
      throw TypeError(it + ' is not a function!');
    return it;
  };
  return module.exports;
});

$__System.registerDynamic("1c", ["3d"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var aFunction = $__require('3d');
  module.exports = function(fn, that, length) {
    aFunction(fn);
    if (that === undefined)
      return fn;
    switch (length) {
      case 1:
        return function(a) {
          return fn.call(that, a);
        };
      case 2:
        return function(a, b) {
          return fn.call(that, a, b);
        };
      case 3:
        return function(a, b, c) {
          return fn.call(that, a, b, c);
        };
    }
    return function() {
      return fn.apply(that, arguments);
    };
  };
  return module.exports;
});

$__System.registerDynamic("3b", ["1e"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var defined = $__require('1e');
  module.exports = function(it) {
    return Object(defined(it));
  };
  return module.exports;
});

$__System.registerDynamic("2e", ["30"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var anObject = $__require('30');
  module.exports = function(iterator, fn, value, entries) {
    try {
      return entries ? fn(anObject(value)[0], value[1]) : fn(value);
    } catch (e) {
      var ret = iterator['return'];
      if (ret !== undefined)
        anObject(ret.call(iterator));
      throw e;
    }
  };
  return module.exports;
});

$__System.registerDynamic("2f", ["3e", "18"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var Iterators = $__require('3e'),
      ITERATOR = $__require('18')('iterator');
  module.exports = function(it) {
    return (Iterators.Array || Array.prototype[ITERATOR]) === it;
  };
  return module.exports;
});

$__System.registerDynamic("31", ["3f"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toInteger = $__require('3f'),
      min = Math.min;
  module.exports = function(it) {
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;
  };
  return module.exports;
});

$__System.registerDynamic("40", ["18"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var SYMBOL_ITERATOR = $__require('18')('iterator'),
      SAFE_CLOSING = false;
  try {
    var riter = [7][SYMBOL_ITERATOR]();
    riter['return'] = function() {
      SAFE_CLOSING = true;
    };
    Array.from(riter, function() {
      throw 2;
    });
  } catch (e) {}
  module.exports = function(exec) {
    if (!SAFE_CLOSING)
      return false;
    var safe = false;
    try {
      var arr = [7],
          iter = arr[SYMBOL_ITERATOR]();
      iter.next = function() {
        safe = true;
      };
      arr[SYMBOL_ITERATOR] = function() {
        return iter;
      };
      exec(arr);
    } catch (e) {}
    return safe;
  };
  return module.exports;
});

$__System.registerDynamic("41", ["1c", "29", "3b", "2e", "2f", "31", "32", "40"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var ctx = $__require('1c'),
      $def = $__require('29'),
      toObject = $__require('3b'),
      call = $__require('2e'),
      isArrayIter = $__require('2f'),
      toLength = $__require('31'),
      getIterFn = $__require('32');
  $def($def.S + $def.F * !$__require('40')(function(iter) {
    Array.from(iter);
  }), 'Array', {from: function from(arrayLike) {
      var O = toObject(arrayLike),
          C = typeof this == 'function' ? this : Array,
          mapfn = arguments[1],
          mapping = mapfn !== undefined,
          index = 0,
          iterFn = getIterFn(O),
          length,
          result,
          step,
          iterator;
      if (mapping)
        mapfn = ctx(mapfn, arguments[2], 2);
      if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
        for (iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++) {
          result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
        }
      } else {
        for (result = new C(length = toLength(O.length)); length > index; index++) {
          result[index] = mapping ? mapfn(O[index], index) : O[index];
        }
      }
      result.length = index;
      return result;
    }});
  return module.exports;
});

$__System.registerDynamic("42", ["37", "41", "26"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('37');
  $__require('41');
  module.exports = $__require('26').Array.from;
  return module.exports;
});

$__System.registerDynamic("9", ["42"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('42'),
    __esModule: true
  };
  return module.exports;
});

$__System.registerDynamic("43", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function() {};
  return module.exports;
});

$__System.registerDynamic("20", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(done, value) {
    return {
      value: value,
      done: !!done
    };
  };
  return module.exports;
});

$__System.registerDynamic("44", ["45"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var cof = $__require('45');
  module.exports = 0 in Object('z') ? Object : function(it) {
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
  return module.exports;
});

$__System.registerDynamic("46", ["44", "1e"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var IObject = $__require('44'),
      defined = $__require('1e');
  module.exports = function(it) {
    return IObject(defined(it));
  };
  return module.exports;
});

$__System.registerDynamic("47", ["43", "20", "3e", "46", "25"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var setUnscope = $__require('43'),
      step = $__require('20'),
      Iterators = $__require('3e'),
      toIObject = $__require('46');
  $__require('25')(Array, 'Array', function(iterated, kind) {
    this._t = toIObject(iterated);
    this._i = 0;
    this._k = kind;
  }, function() {
    var O = this._t,
        kind = this._k,
        index = this._i++;
    if (!O || index >= O.length) {
      this._t = undefined;
      return step(1);
    }
    if (kind == 'keys')
      return step(0, index);
    if (kind == 'values')
      return step(0, O[index]);
    return step(0, [index, O[index]]);
  }, 'values');
  Iterators.Arguments = Iterators.Array;
  setUnscope('keys');
  setUnscope('values');
  setUnscope('entries');
  return module.exports;
});

$__System.registerDynamic("38", ["47", "3e"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('47');
  var Iterators = $__require('3e');
  Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
  return module.exports;
});

$__System.registerDynamic("3f", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var ceil = Math.ceil,
      floor = Math.floor;
  module.exports = function(it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };
  return module.exports;
});

$__System.registerDynamic("1e", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(it) {
    if (it == undefined)
      throw TypeError("Can't call method on  " + it);
    return it;
  };
  return module.exports;
});

$__System.registerDynamic("48", ["3f", "1e"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toInteger = $__require('3f'),
      defined = $__require('1e');
  module.exports = function(TO_STRING) {
    return function(that, pos) {
      var s = String(defined(that)),
          i = toInteger(pos),
          l = s.length,
          a,
          b;
      if (i < 0 || i >= l)
        return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };
  return module.exports;
});

$__System.registerDynamic("49", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = true;
  return module.exports;
});

$__System.registerDynamic("29", ["2a", "26"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var global = $__require('2a'),
      core = $__require('26'),
      PROTOTYPE = 'prototype';
  var ctx = function(fn, that) {
    return function() {
      return fn.apply(that, arguments);
    };
  };
  var $def = function(type, name, source) {
    var key,
        own,
        out,
        exp,
        isGlobal = type & $def.G,
        isProto = type & $def.P,
        target = isGlobal ? global : type & $def.S ? global[name] : (global[name] || {})[PROTOTYPE],
        exports = isGlobal ? core : core[name] || (core[name] = {});
    if (isGlobal)
      source = name;
    for (key in source) {
      own = !(type & $def.F) && target && key in target;
      if (own && key in exports)
        continue;
      out = own ? target[key] : source[key];
      if (isGlobal && typeof target[key] != 'function')
        exp = source[key];
      else if (type & $def.B && own)
        exp = ctx(out, global);
      else if (type & $def.W && target[key] == out)
        !function(C) {
          exp = function(param) {
            return this instanceof C ? new C(param) : C(param);
          };
          exp[PROTOTYPE] = C[PROTOTYPE];
        }(out);
      else
        exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
      exports[key] = exp;
      if (isProto)
        (exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
    }
  };
  $def.F = 1;
  $def.G = 2;
  $def.S = 4;
  $def.P = 8;
  $def.B = 16;
  $def.W = 32;
  module.exports = $def;
  return module.exports;
});

$__System.registerDynamic("27", ["1b"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('1b');
  return module.exports;
});

$__System.registerDynamic("4a", ["12", "1b", "18", "4b", "2c"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('12'),
      IteratorPrototype = {};
  $__require('1b')(IteratorPrototype, $__require('18')('iterator'), function() {
    return this;
  });
  module.exports = function(Constructor, NAME, next) {
    Constructor.prototype = $.create(IteratorPrototype, {next: $__require('4b')(1, next)});
    $__require('2c')(Constructor, NAME + ' Iterator');
  };
  return module.exports;
});

$__System.registerDynamic("22", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var hasOwnProperty = {}.hasOwnProperty;
  module.exports = function(it, key) {
    return hasOwnProperty.call(it, key);
  };
  return module.exports;
});

$__System.registerDynamic("12", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $Object = Object;
  module.exports = {
    create: $Object.create,
    getProto: $Object.getPrototypeOf,
    isEnum: {}.propertyIsEnumerable,
    getDesc: $Object.getOwnPropertyDescriptor,
    setDesc: $Object.defineProperty,
    setDescs: $Object.defineProperties,
    getKeys: $Object.keys,
    getNames: $Object.getOwnPropertyNames,
    getSymbols: $Object.getOwnPropertySymbols,
    each: [].forEach
  };
  return module.exports;
});

$__System.registerDynamic("4b", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };
  return module.exports;
});

$__System.registerDynamic("2b", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };
  return module.exports;
});

$__System.registerDynamic("19", ["2b"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = !$__require('2b')(function() {
    return Object.defineProperty({}, 'a', {get: function() {
        return 7;
      }}).a != 7;
  });
  return module.exports;
});

$__System.registerDynamic("1b", ["12", "4b", "19"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('12'),
      createDesc = $__require('4b');
  module.exports = $__require('19') ? function(object, key, value) {
    return $.setDesc(object, key, createDesc(1, value));
  } : function(object, key, value) {
    object[key] = value;
    return object;
  };
  return module.exports;
});

$__System.registerDynamic("2c", ["22", "1b", "18"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var has = $__require('22'),
      hide = $__require('1b'),
      TAG = $__require('18')('toStringTag');
  module.exports = function(it, tag, stat) {
    if (it && !has(it = stat ? it : it.prototype, TAG))
      hide(it, TAG, tag);
  };
  return module.exports;
});

$__System.registerDynamic("25", ["49", "29", "27", "1b", "22", "18", "3e", "4a", "12", "2c"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var LIBRARY = $__require('49'),
      $def = $__require('29'),
      $redef = $__require('27'),
      hide = $__require('1b'),
      has = $__require('22'),
      SYMBOL_ITERATOR = $__require('18')('iterator'),
      Iterators = $__require('3e'),
      BUGGY = !([].keys && 'next' in [].keys()),
      FF_ITERATOR = '@@iterator',
      KEYS = 'keys',
      VALUES = 'values';
  var returnThis = function() {
    return this;
  };
  module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE) {
    $__require('4a')(Constructor, NAME, next);
    var createMethod = function(kind) {
      switch (kind) {
        case KEYS:
          return function keys() {
            return new Constructor(this, kind);
          };
        case VALUES:
          return function values() {
            return new Constructor(this, kind);
          };
      }
      return function entries() {
        return new Constructor(this, kind);
      };
    };
    var TAG = NAME + ' Iterator',
        proto = Base.prototype,
        _native = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT],
        _default = _native || createMethod(DEFAULT),
        methods,
        key;
    if (_native) {
      var IteratorPrototype = $__require('12').getProto(_default.call(new Base));
      $__require('2c')(IteratorPrototype, TAG, true);
      if (!LIBRARY && has(proto, FF_ITERATOR))
        hide(IteratorPrototype, SYMBOL_ITERATOR, returnThis);
    }
    if (!LIBRARY || FORCE)
      hide(proto, SYMBOL_ITERATOR, _default);
    Iterators[NAME] = _default;
    Iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        keys: IS_SET ? _default : createMethod(KEYS),
        values: DEFAULT == VALUES ? _default : createMethod(VALUES),
        entries: DEFAULT != VALUES ? _default : createMethod('entries')
      };
      if (FORCE)
        for (key in methods) {
          if (!(key in proto))
            $redef(proto, key, methods[key]);
        }
      else
        $def($def.P + $def.F * BUGGY, NAME, methods);
    }
  };
  return module.exports;
});

$__System.registerDynamic("37", ["48", "25"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $at = $__require('48')(true);
  $__require('25')(String, 'String', function(iterated) {
    this._t = String(iterated);
    this._i = 0;
  }, function() {
    var O = this._t,
        index = this._i,
        point;
    if (index >= O.length)
      return {
        value: undefined,
        done: true
      };
    point = $at(O, index);
    this._i += point.length;
    return {
      value: point,
      done: false
    };
  });
  return module.exports;
});

$__System.registerDynamic("23", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(it) {
    return it !== null && (typeof it == 'object' || typeof it == 'function');
  };
  return module.exports;
});

$__System.registerDynamic("30", ["23"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var isObject = $__require('23');
  module.exports = function(it) {
    if (!isObject(it))
      throw TypeError(it + ' is not an object!');
    return it;
  };
  return module.exports;
});

$__System.registerDynamic("45", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toString = {}.toString;
  module.exports = function(it) {
    return toString.call(it).slice(8, -1);
  };
  return module.exports;
});

$__System.registerDynamic("34", ["45", "18"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var cof = $__require('45'),
      TAG = $__require('18')('toStringTag'),
      ARG = cof(function() {
        return arguments;
      }()) == 'Arguments';
  module.exports = function(it) {
    var O,
        T,
        B;
    return it === undefined ? 'Undefined' : it === null ? 'Null' : typeof(T = (O = Object(it))[TAG]) == 'string' ? T : ARG ? cof(O) : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  };
  return module.exports;
});

$__System.registerDynamic("4c", ["2a"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var global = $__require('2a'),
      SHARED = '__core-js_shared__',
      store = global[SHARED] || (global[SHARED] = {});
  module.exports = function(key) {
    return store[key] || (store[key] = {});
  };
  return module.exports;
});

$__System.registerDynamic("2a", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var UNDEFINED = 'undefined';
  var global = module.exports = typeof window != UNDEFINED && window.Math == Math ? window : typeof self != UNDEFINED && self.Math == Math ? self : Function('return this')();
  if (typeof __g == 'number')
    __g = global;
  return module.exports;
});

$__System.registerDynamic("21", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var id = 0,
      px = Math.random();
  module.exports = function(key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };
  return module.exports;
});

$__System.registerDynamic("18", ["4c", "2a", "21"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var store = $__require('4c')('wks'),
      Symbol = $__require('2a').Symbol;
  module.exports = function(name) {
    return store[name] || (store[name] = Symbol && Symbol[name] || (Symbol || $__require('21'))('Symbol.' + name));
  };
  return module.exports;
});

$__System.registerDynamic("3e", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {};
  return module.exports;
});

$__System.registerDynamic("32", ["34", "18", "3e", "26"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var classof = $__require('34'),
      ITERATOR = $__require('18')('iterator'),
      Iterators = $__require('3e');
  module.exports = $__require('26').getIteratorMethod = function(it) {
    if (it != undefined)
      return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
  };
  return module.exports;
});

$__System.registerDynamic("26", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var core = module.exports = {};
  if (typeof __e == 'number')
    __e = core;
  return module.exports;
});

$__System.registerDynamic("4d", ["30", "32", "26"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var anObject = $__require('30'),
      get = $__require('32');
  module.exports = $__require('26').getIterator = function(it) {
    var iterFn = get(it);
    if (typeof iterFn != 'function')
      throw TypeError(it + ' is not iterable!');
    return anObject(iterFn.call(it));
  };
  return module.exports;
});

$__System.registerDynamic("4e", ["38", "37", "4d"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('38');
  $__require('37');
  module.exports = $__require('4d');
  return module.exports;
});

$__System.registerDynamic("a", ["4e"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('4e'),
    __esModule: true
  };
  return module.exports;
});

$__System.register("7", ["8", "9", "14", "15", "b", "a"], function (_export) {
    var _Set, _Array$from, _createClass, _classCallCheck, _Object$keys, _getIterator, d3tooltip, labelCollisionDetection, colourBarID;

    function d3legend() {
        var splitAfter = 0,
            anchor = { x: "outside", y: "inside" },
            position = { x: "right", y: "center" },
            seriesNames = null,
            colourScale = null,
            onMouseOver = null,
            onMouseOut = null,
            onClick = null,
            selectedItems = new _Set(),
            verticalItemSpacing = 10,
            horizontalItemSpacing = 20,
            padding = 10,
            shapeSize = 10,
            maxSize = { width: -1, height: -1 };

        // For each small multiple…
        function legend(g) {
            splitAfter = splitAfter.clamp(0, seriesNames.length);
            if (splitAfter === 0) splitAfter = seriesNames.length;
            var longestName = seriesNames.reduce(function (a, b) {
                return a.length > b.length ? a : b;
            });

            var lengthTestString = g.append("text").attr("visibility", false).text(longestName);
            var box = lengthTestString[0][0].getBBox();
            box.height = parseInt(window.getComputedStyle(lengthTestString[0][0]).fontSize, 10);
            lengthTestString.remove();

            var columnWidth = box.width + shapeSize + 5,
                rowHeight = box.height;

            if (padding + splitAfter * (columnWidth + horizontalItemSpacing) > maxSize.width) splitAfter = Math.floor((maxSize.width - padding) / (columnWidth + horizontalItemSpacing));

            if (padding + Math.floor(seriesNames.length / splitAfter) * (rowHeight + verticalItemSpacing) > maxSize.height) splitAfter = Math.ceil(1.0 / ((maxSize.height - padding) / (rowHeight + verticalItemSpacing) / seriesNames.length));

            var rows = splitAfter > 0 ? Math.ceil(seriesNames.length / splitAfter) : 1,
                cols = splitAfter > 0 ? splitAfter : seriesNames.length,
                w = cols * columnWidth + (cols - 1) * horizontalItemSpacing + 2 * padding,
                h = rows * rowHeight + (rows - 1) * verticalItemSpacing + 2 * padding,
                shapeVerticalOffset = (rowHeight - shapeSize) / 2,
                textVerticalOffset = (rowHeight + box.height) / 2 - 2,
                legendHorizontalOffset = 0,
                legendVerticalOffset = 0;

            if (position.y === "top" && anchor.y === "inside" || position.y === "bottom" && anchor.y === "outside") legendVerticalOffset = 0;else if (position.y === "top" && anchor.y === "outside" || position.y === "bottom" && anchor.y === "inside") legendVerticalOffset = -h;else if (position.y === "center" && (position.x === "right" || position.x === "left")) legendVerticalOffset = -h / 2;

            if (position.x === "left" && anchor.x === "inside" || position.x === "right" && anchor.x === "outside") legendHorizontalOffset = 0;else if (position.x === "left" && anchor.x === "outside" || position.x === "right" && anchor.x === "inside") legendHorizontalOffset = -w;else if (position.x === "center" && (position.y === "top" || position.y === "bottom")) legendHorizontalOffset = -w / 2;

            g.append("rect").attr("x", legendHorizontalOffset).attr("y", legendVerticalOffset).attr("width", w).attr("height", h).attr("fill", "white").style("opacity", 0.75);

            var item = g.selectAll("g.legend-item").data(seriesNames);

            item.enter().append("g").attr("class", "legend-item");

            item.attr("transform", function (d, i) {
                return "translate(" + (legendHorizontalOffset + padding + i % splitAfter * (columnWidth + horizontalItemSpacing)) + ",\n                                            " + (legendVerticalOffset + padding + Math.floor(i / splitAfter) * (rowHeight + verticalItemSpacing)) + ")";
            });

            item.each(function (d, i) {
                var sel = d3.select(this);

                sel.append("rect").attr("class", "shape").attr("x", 2).attr("y", shapeVerticalOffset).attr("width", shapeSize).attr("height", shapeSize).attr("fill", selectedItems.has(d) ? colourScale(d) : "white").attr("stroke", colourScale(d));

                sel.append("text").attr("x", shapeSize + 5).attr("y", textVerticalOffset).attr("fill", "black").text(d);

                sel.append("rect").attr("class", "legend-item-mouse-capture").attr("x", 0).attr("y", 0).attr("width", columnWidth).attr("height", rowHeight).attr("fill", "white").attr("opacity", 0);
            });

            if (onMouseOver) item.on("mouseover", onMouseOver);
            if (onMouseOut) item.on("mouseout", onMouseOut);
            if (onClick) item.on("click", onClick);
        }

        legend.splitAfter = function (x) {
            if (!arguments.length) return splitAfter;
            splitAfter = x;
            return legend;
        };

        legend.position = function (x) {
            if (!arguments.length) return position;
            position = x;
            return legend;
        };

        legend.anchor = function (x) {
            if (!arguments.length) return anchor;
            if (x.x == "outside" && x.y == "outside") {
                console.warn('Anchor x and y should not be both set to "outside". Setting both to "inside"');
                anchor = { x: "inside", y: "inside" };
            } else anchor = x;
            return this;
        };

        legend.maxSize = function (x) {
            if (!arguments.length) return maxSize;
            if (x.width !== undefined && x.height !== undefined) maxSize = x;
            return legend;
        };

        legend.seriesNames = function (x) {
            if (!arguments.length) return seriesNames;
            seriesNames = x;
            return legend;
        };

        legend.colourScale = function (x) {
            if (!arguments.length) return colourScale;
            colourScale = x;
            return legend;
        };

        legend.onMouseOver = function (x) {
            if (!arguments.length) return onMouseOver;
            onMouseOver = x;
            return legend;
        };

        legend.onMouseOut = function (x) {
            if (!arguments.length) return onMouseOut;
            onMouseOut = x;
            return legend;
        };

        legend.onClick = function (x) {
            if (!arguments.length) return onClick;
            onClick = x;
            return legend;
        };

        legend.selectedItems = function (x) {
            if (!arguments.length) return selectedItems;
            selectedItems = x;
            return legend;
        };

        return legend;
    }

    function mergeTemplateLayout(layout, templateLayout) {
        for (var p in templateLayout) {
            if (layout.hasOwnProperty(p)) {
                if (typeof templateLayout[p] == 'object' && !Array.isArray(templateLayout[p]) && templateLayout[p] != null) {
                    layout[p] = mergeTemplateLayout(layout[p], templateLayout[p]);
                }
            } else {
                if (typeof templateLayout[p] == 'object' && !Array.isArray(templateLayout[p]) && templateLayout[p] != null) {
                    layout[p] = mergeTemplateLayout({}, templateLayout[p]);
                } else {
                    layout[p] = templateLayout[p];
                }
            }
        }
        return layout;
    }

    function createNodeTypes(nodesArray, definedTypes, defaultType) {
        var typesFromLayout = _Object$keys(definedTypes),
            typeNames = _Array$from(new _Set(nodesArray.map(function (node) {
            return node.type;
        }))),
            types = {};
        typeNames.forEach(function (type) {
            types[type] = typesFromLayout.includes(type) ? mergeTemplateLayout(definedTypes[type], defaultType) : defaultType;
        });
        types[undefined] = defaultType;
        return types;
    }

    function createDynamicNodeAttr(types, attrNames) {
        var typeAttr = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            var _loop = function () {
                var attr = _step.value;

                typeAttr[attr] = function (d) {
                    return types[d.type][attr];
                };
            };

            for (var _iterator = _getIterator(attrNames), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                _loop();
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return typeAttr;
    }

    function scaleProperties(props, scale) {
        var dynamic = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var scaledProps = {};

        var _loop2 = function (key) {
            if (!props.hasOwnProperty(key)) return "continue";
            var test = dynamic ? props[key]({ type: undefined }) : props[key];
            scaledProps[key] = !isNaN(test) && typeof test != 'string' ? dynamic ? function (d) {
                return props[key](d) / scale;
            } : props[key] / scale : props[key];
        };

        for (var key in props) {
            var _ret2 = _loop2(key);

            if (_ret2 === "continue") continue;
        }
        return scaledProps;
    }

    function createTreeLayout(nodes) {
        //let nodes = copyNodesArray(nodesArray);
        return nodes.map(function (node) {
            node.children = nodes.filter(function (n) {
                return n.parent == node.name;
            });
            return node;
        }).filter(function (n) {
            return !n.parent;
        });
    }

    function copyNodesArray(nodesArray) {
        return nodesArray.map(function (node) {
            return JSON.parse(JSON.stringify(node));
        });
    }

    function spreadGenerations(tree) {
        var gen = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        tree.generation = gen;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = _getIterator(tree.children), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var child = _step2.value;

                spreadGenerations(child, gen + 1);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                    _iterator2["return"]();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    }

    function roundOffFix(format) {
        var zeroThreshold = arguments.length <= 1 || arguments[1] === undefined ? 1e-10 : arguments[1];

        return function (d) {
            var str = d.toString();
            if (d < zeroThreshold && d > -zeroThreshold) d = 0;
            return format(str.length > 10 ? d.toPrecision(4) : d);
        };
    }

    function getNodeLabelBBox(d) {
        d.bboxLabel = this.getBoundingClientRect();
        d.bboxLabel.top += d.bboxLabel.height * 0.2;
        d.bboxLabel.bottom -= d.bboxLabel.height * 0.2;

        if (this.parentNode !== null) {
            d.bbox = this.parentNode.getBoundingClientRect();
            d.bbox.top = d.bboxLabel.top;
            d.bbox.bottom = d.bboxLabel.bottom;
        }
    }

    function drawColourBar(selection, domain, heatmapOptions, defs, defsRoutePath) {

        selection.selectAll("*").remove();

        var width = heatmapOptions.colourBar.width,
            height = heatmapOptions.colourBar.height,
            colourScale = heatmapOptions.colourScale,
            opacity = heatmapOptions.opacity,
            title = heatmapOptions.title,
            titleOffset = title ? 22 : 0;

        var gradient = defs.append("svg:linearGradient").attr("id", "gradient" + colourBarID).attr("x1", "0%").attr("y1", height > width ? "100%" : "0%").attr("x2", height > width ? "0%" : "100%").attr("y2", "0%").attr("spreadMethod", "pad");

        gradient.append("svg:stop").attr("offset", "0%").attr("stop-color", colourScale[0][1]).attr("stop-opacity", 1);

        gradient.append("svg:stop").attr("offset", "100%").attr("stop-color", colourScale[1][1]).attr("stop-opacity", 1);

        selection.append("rect").attr("x", titleOffset).attr("y", 0).attr("width", width).attr("height", height).style("fill", "url(" + defsRoutePath + "#gradient" + colourBarID++ + ")").attr("stroke-width", 2).attr("stroke", "grey").style("opacity", opacity);

        if (title) {
            selection.append("text").attr("class", "axis-title").attr("transform", "rotate(-90)").attr("dy", 12).attr("x", -(height / 2)).style("text-anchor", "middle").text(title);
        }

        // Define x axis and grid
        var colourAxis = d3.svg.axis().scale(d3.scale.linear().domain(domain).range([height, 0])).orient("right");

        selection.append("g").attr("class", "axis").attr("transform", "translate(" + (width + titleOffset) + ", 0)").call(colourAxis);
    }

    function calcColourBarSize(size, relativeSize) {
        if (typeof size === 'string' || size instanceof String) {
            if (size === "auto") return relativeSize;else if (size[size.length - 1] === "%") return relativeSize * parseInt(size) / 100;else return relativeSize;
        } else return size;
    }

    function testLabelLength(svg, name, attrs) {
        var label = svg.append("text").attr(attrs).text(name);
        var length = label.node().getBoundingClientRect().width;
        label.remove();
        return length;
    }

    function getExtraSpaceForLabel(scale, labelLength) {
        var d = scale.domain(),
            dd = d[1] - d[0],
            r = scale.range(),
            dr = r[1] - r[0];
        return labelLength * dd / (dr - 2 * labelLength);
    }

    return {
        setters: [function (_3) {
            _Set = _3["default"];
        }, function (_4) {
            _Array$from = _4["default"];
        }, function (_) {
            _createClass = _["default"];
        }, function (_2) {
            _classCallCheck = _2["default"];
        }, function (_b) {
            _Object$keys = _b["default"];
        }, function (_a) {
            _getIterator = _a["default"];
        }],
        execute: function () {
            "use strict";

            _export("d3legend", d3legend);

            _export("mergeTemplateLayout", mergeTemplateLayout);

            _export("createNodeTypes", createNodeTypes);

            _export("createDynamicNodeAttr", createDynamicNodeAttr);

            _export("scaleProperties", scaleProperties);

            _export("createTreeLayout", createTreeLayout);

            _export("copyNodesArray", copyNodesArray);

            _export("spreadGenerations", spreadGenerations);

            _export("roundOffFix", roundOffFix);

            _export("getNodeLabelBBox", getNodeLabelBBox);

            _export("drawColourBar", drawColourBar);

            _export("calcColourBarSize", calcColourBarSize);

            _export("testLabelLength", testLabelLength);

            _export("getExtraSpaceForLabel", getExtraSpaceForLabel);

            d3tooltip = (function () {
                function d3tooltip(g) {
                    _classCallCheck(this, d3tooltip);

                    this.tip = g.append("div").attr("class", "ancestry-tooltip");
                    this.pos = [0, 0];
                    this.hide();
                }

                _createClass(d3tooltip, [{
                    key: "position",
                    value: function position(pos) {
                        if (!arguments.length) return this.pos;
                        this.pos = pos;
                        this.tip.style("left", pos[0] + "px").style("top", pos[1] + "px");
                        return this;
                    }
                }, {
                    key: "move",
                    value: function move(pos, duration) {
                        this.pos = pos;
                        this.tip.transition().duration(duration).style("left", pos[0] + "px").style("top", pos[1] + "px");
                        return this;
                    }
                }, {
                    key: "hide",
                    value: function hide() {
                        this.tip.transition().delay(100).style("opacity", 0);
                        return this;
                    }
                }, {
                    key: "show",
                    value: function show() {
                        this.tip.transition().duration(0).style("opacity", 1);
                        return this;
                    }
                }, {
                    key: "html",
                    value: function html(content) {
                        this.tip.html(content);
                        return this;
                    }
                }]);

                return d3tooltip;
            })();

            _export("d3tooltip", d3tooltip);

            labelCollisionDetection = (function () {
                function labelCollisionDetection(nodes, labelPositions, labelLayout, xScale, yScale, width, height, searchRadius) {
                    var _this = this;

                    _classCallCheck(this, labelCollisionDetection);

                    this.xScale = xScale;
                    this.yScale = yScale;
                    this.width = width;
                    this.height = height;
                    this.nodes = nodes;
                    this.labelPositions = labelPositions;
                    this.labelLayout = labelLayout;
                    this.searchRadius = searchRadius;
                    this.quadtreeGenerator = d3.geom.quadtree().extent([[-1, -1], [this.width + 1, this.height + 1]]).x(function (d) {
                        return _this.xScale(d.x);
                    }).y(function (d) {
                        return _this.yScale(d.y);
                    });

                    this.quadtree = this.createQuadTree(this.nodes);
                }

                _createClass(labelCollisionDetection, [{
                    key: "createQuadTree",
                    value: function createQuadTree(nodes) {
                        return this.quadtreeGenerator(nodes);
                    }
                }, {
                    key: "quadtreeSearch",
                    value: function quadtreeSearch(point) {
                        var _this2 = this;

                        var foundNodes = [],
                            r = this.searchRadius,
                            px = this.xScale(point.x),
                            py = this.yScale(point.y),
                            x0 = px - r,
                            y0 = py - r,
                            x3 = px + r,
                            y3 = py + r;

                        this.quadtree.visit(function (node, x1, y1, x2, y2) {
                            var outside = x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
                            var p = node.point;
                            if (p && !outside) {
                                if (_this2.dist(px, py, _this2.xScale(p.x), _this2.yScale(p.y)) <= r && p != point) foundNodes.push(p);
                            }
                            return outside;
                        });

                        return foundNodes;
                    }
                }, {
                    key: "dist",
                    value: function dist(x1, y1, x2, y2) {
                        var dx = x2 - x1,
                            dy = y2 - y1;
                        return Math.pow(dx * dx + dy * dy, 0.5);
                    }
                }, {
                    key: "initializeLabelPositions",
                    value: function initializeLabelPositions(labels) {
                        var initialLabelPosition = this.labelPositions[0];
                        var self = this;
                        labels.each(function (d) {
                            var neighbours = self.quadtreeSearch(d),
                                sel = d3.select(this),
                                i = 1,
                                c = undefined;
                            d.labelPos = initialLabelPosition;
                            while ((c = self.isColliding(d, neighbours)) && i < self.labelPositions.length) {
                                d.labelPos = self.labelPositions[i++];
                                sel.attr(d.labelPos).each(getNodeLabelBBox);
                            }
                            if (c) {
                                sel.style("opacity", 1e-6);
                                d.bbox = d.bboxCircle || { left: -1, right: -1, top: -1, bottom: -1, width: 0, height: 0 };
                            }
                            d.isCollidingLabel = c;
                            d.neverCollidingLabel = i == 1;
                        });
                    }
                }, {
                    key: "recalculateLabelPositions",
                    value: function recalculateLabelPositions(labels, scale) {
                        var _this3 = this;

                        // create new quadtree
                        this.quadtree = this.quadtreeGenerator(this.nodes.filter(function (d) {
                            var x = _this3.xScale(d.x),
                                y = _this3.yScale(d.y);
                            return x >= 0 && x <= _this3.width && y >= 0 && y <= _this3.height;
                        }));
                        // resize label bounding boxes
                        labels.attr(scaleProperties(this.labelLayout, scale)).each(getNodeLabelBBox);

                        var self = this;
                        // prevent label overlapping
                        labels.each(function (d) {
                            var x = self.xScale(d.x),
                                y = self.yScale(d.y),
                                i = 0,
                                c = undefined,
                                sel = d3.select(this);

                            if (x < 0 || x > self.width || y < 0 || y > self.height) {
                                d.isCollidingLabel = !d.neverCollidingLabel;
                                sel.style("opacity", d.isCollidingLabel ? 1e-6 : 1);
                                return;
                            }

                            sel.attr(scaleProperties(d.labelPos, scale)).each(getNodeLabelBBox);

                            var neighbours = self.quadtreeSearch(d);
                            do {
                                d.labelPos = self.labelPositions[i++];
                                sel.attr(scaleProperties(d.labelPos, scale)).each(getNodeLabelBBox);
                            } while ((c = self.isColliding(d, neighbours)) && i < self.labelPositions.length);

                            if (c) {
                                d.bbox = d.bboxCircle || { left: -1, right: -1, top: -1, bottom: -1, width: 0, height: 0 };
                                d.bboxLabel = d.bbox;
                            }
                            sel.style("opacity", c ? 1e-6 : 1);
                            d.isCollidingLabel = c;
                        });
                    }
                }, {
                    key: "checkCollision",
                    value: function checkCollision(rect1, rect2) {
                        return rect1.left < rect2.right && rect1.right > rect2.left && rect1.bottom > rect2.top && rect1.top < rect2.bottom;
                    }
                }, {
                    key: "isColliding",
                    value: function isColliding(object1, objects) {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = _getIterator(objects), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var object2 = _step3.value;

                                if (this.checkCollision(object1.bboxLabel, object2.bbox)) return true;
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                                    _iterator3["return"]();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }

                        return false;
                    }
                }]);

                return labelCollisionDetection;
            })();

            _export("labelCollisionDetection", labelCollisionDetection);

            colourBarID = 0;
        }
    };
});
$__System.register('4f', ['4', '5', '6', '7', '8', '9', '10', 'b', 'a'], function (_export) {
    var angular, d3, d3legend, d3tooltip, mergeTemplateLayout, createNodeTypes, createDynamicNodeAttr, roundOffFix, labelCollisionDetection, scaleProperties, getNodeLabelBBox, calcColourBarSize, drawColourBar, testLabelLength, getExtraSpaceForLabel, _Set, _Array$from, _Object$keys, _getIterator, layoutTemplate, labelPositions;

    function LineageScatterPlotDirective($window, WindowResize) {
        return {
            restrict: 'EA',
            scope: {
                value: '=',
                selectedNodes: '='
            },
            link: function link(scope, element, attributes) {

                element.addClass("ancestry ancestry-lineage-scatter-plot");

                var defaultTimeFormat = "%d %b %y",
                    defaultScalarFormat = "g";

                var svg = d3.select(element[0]).append("svg").style('width', '100%');

                var //links,
                mouseStart = undefined,
                    colours = d3.scale.category10(),
                    isDrag = false,
                    selectionRect = null,
                    tooltip = new d3tooltip(d3.select(element[0])),
                    defaultNode = {
                    r: 4,
                    "stroke-width": 2
                },
                    scale = 1,
                    translate = [0, 0],
                    selectedNodes = null,
                    LCD = null,
                    //label collision detection
                lastLCDUpdateTime = 0,
                    LCDUpdateID = undefined,
                    heatmapColourScale = null,
                    heatmapCircle = null,
                    visibleSeries = new _Set();

                function render(options) {

                    // clean svg before rendering plot
                    svg.selectAll('*').remove();

                    var elementWidth = d3.select(element[0]).node().offsetWidth;

                    var marginRatio = { axisX: 0.15, axisY: 0.1 };

                    // don't continue rendering if there is no data
                    if (!scope.value || !scope.value.data.length) return;

                    selectedNodes = new _Set();

                    var seriesNames = _Array$from(new _Set(scope.value.data.map(function (d) {
                        return d.series;
                    })));

                    if (options.isNewData) {
                        colours.domain([]);
                        visibleSeries = new _Set(seriesNames);
                    }

                    var copy = angular.copy(scope.value);

                    var _createLinks = createLinks(copy.data, visibleSeries);

                    var nodesData = _createLinks.nodesData;
                    var links = _createLinks.links;
                    var longestNodeName = nodesData.length ? nodesData.reduce(function (a, b) {
                        return a.name.length > b.name.length ? a : b;
                    }).name : "";
                    var layout = mergeTemplateLayout(copy.layout, layoutTemplate);
                    var pathname = $window.location.pathname;
                    var maxLabelLength = testLabelLength(svg, longestNodeName, { "font-size": 12 });
                    var maxLabelOffset = d3.max(labelPositions, function (pos) {
                        return Math.abs(pos.x);
                    });
                    var legendHeight = 0;var legendWidth = 0;var colourbarHeight = 0;var colourbarWidth = 0;
                    var colourBarOffset = layout.heatmap.enabled && layout.heatmap.colourBar.show ? 15 : 0;
                    var legendOut = { top: false, right: false, bottom: false, left: false };
                    var showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null;
                    var colourBarOrigWidth = layout.heatmap.colourBar.width;var colourBarOrigHeight = layout.heatmap.colourBar.height;
                    var colourbar = d3.select();
                    var legend = d3.select();
                    var xAxisLabelSVG = d3.select();
                    var yAxisLabelSVG = d3.select();
                    var titleSVG = d3.select();

                    if (layout.legend.show) {
                        if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
                        if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
                    }

                    if (maxLabelLength < 40) maxLabelLength = 40;

                    var margin = layout.margin,
                        width = layout.width || elementWidth,
                        height = layout.height;

                    if (layout.title) margin.top += legendOut.top ? 26 : 25;
                    if (layout.xAxis.title) margin.bottom += legendOut.bottom ? 15 : 18;
                    if (layout.yAxis.title) margin.left += 21;

                    var chart = svg.append("g");
                    var defs = chart.append("svg:defs");

                    if (layout.heatmap.enabled) {

                        var domain = d3.extent(nodesData, function (node) {
                            return node.z;
                        });

                        if (domain[0] == domain[1]) {
                            if (domain[0] === undefined) {
                                domain[0] = domain[1] = 0;
                            }
                            domain[0] -= 0.5;
                            domain[1] += 0.5;
                        }

                        heatmapColourScale = d3.scale.linear().domain(domain).range(layout.heatmap.colourScale.map(function (v) {
                            return v[1];
                        }));

                        if (layout.heatmap.colourBar.show) {
                            layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
                            layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                            colourbar = chart.append("g").attr("class", "ancestry-colourbar");

                            drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

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
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            orientation = layout.legend.orientation;

                        var splitAfter = orientation === "horizontal" ? 0 : 1;

                        var drawLegend = d3legend().splitAfter(splitAfter).position(pos).anchor(anchor).seriesNames(seriesNames).colourScale(colours).maxSize({ width: width, height: height }).onClick(legendClick).selectedItems(visibleSeries);

                        legend = chart.append("g").attr("class", "ancestry-legend").call(drawLegend);

                        var bbox = legend.node().getBoundingClientRect();
                        legendHeight = bbox.height;legendWidth = bbox.width;
                        if (anchor.x === "outside" && pos.x !== "center") {
                            margin[pos.x] += legendOut.right ? legendWidth - 10 : legendOut.left ? legendWidth - 11 : legendWidth;
                        } else if (anchor.y === "outside" && pos.y !== "center") {
                            margin[pos.y] += legendOut.bottom ? legendHeight - 8 : legendOut.top ? legendHeight - 11 : legendHeight;
                        }
                    }

                    function legendClick(label) {
                        var clicked = d3.select(this);
                        if (visibleSeries.has(label)) visibleSeries['delete'](label);else visibleSeries.add(label);
                        clicked.classed("legend-item-selected", visibleSeries.has(label));
                        clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                        render({ isNewData: false });
                    }

                    var initialLabelPosition = labelPositions[0];

                    var types = createNodeTypes(nodesData, layout.nodeTypes, defaultNode),
                        nodeAttr = createDynamicNodeAttr(types, _Object$keys(defaultNode));

                    // check if x axis data is time data
                    //let isTimePlot = nodesData[0].x instanceof Date;
                    var isTimePlot = false;

                    // define x and y axes formats
                    var xAxisFormat = isTimePlot ? d3.time.format(layout.xAxis.format || defaultTimeFormat) : d3.format(layout.xAxis.format || defaultScalarFormat),
                        yAxisFormat = d3.format(layout.yAxis.format || defaultScalarFormat);

                    // find extent of input data and calculate margins
                    var xExtent = d3.extent(nodesData, function (node) {
                        return node.x;
                    }),
                        yExtent = d3.extent(nodesData, function (node) {
                        return node.y;
                    });

                    if (xExtent[0] === undefined || yExtent[0] === undefined) {
                        xExtent[0] = xExtent[1] = 0;
                        yExtent[0] = yExtent[1] = 0;
                    }

                    var xMargin = marginRatio.axisX * (xExtent[1] - xExtent[0]) / 2,
                        yMargin = marginRatio.axisY * (yExtent[1] - yExtent[0]) / 2;

                    //// add margins to horizontal axis data
                    //if (isTimePlot) {
                    //    xExtent[0] = new Date(xExtent[0].getTime() - xMargin);
                    //    xExtent[1] = new Date(xExtent[1].getTime() + xMargin);
                    //} else {
                    //    if (xMargin == 0) xMargin = 0.5;
                    //    if (yMargin == 0) yMargin = 0.5;
                    //    xExtent[0] -= xMargin; xExtent[1] += xMargin;
                    //}

                    // add margins to vertical axis data
                    yExtent[0] -= yMargin;yExtent[1] += yMargin;

                    height = layout.height - margin.top - margin.bottom;

                    // define x scale
                    var xScale = (isTimePlot ? d3.time.scale() : d3.scale.linear()).domain(xExtent).range([0, width]);

                    var zoom = d3.behavior.zoom().scaleExtent([1, layout.maxZoom])
                    //.x(xScale) // TODO: can be reworked when xExtent is implemented in d3.js
                    .on("zoom", zoomed);

                    // define x axis
                    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").innerTickSize(0).outerTickSize(0).tickFormat(roundOffFix(xAxisFormat));

                    // define y scale
                    var yScale = d3.scale.linear().domain(yExtent).range([height, 0]);

                    // define y axis
                    var yAxis = d3.svg.axis().scale(yScale).orient("left").innerTickSize(0).outerTickSize(0).tickFormat(roundOffFix(yAxisFormat));

                    // read x and y axes labels
                    var xAxisLabel = layout.xAxis.title;
                    var yAxisLabel = layout.yAxis.title;

                    var mouseCaptureGroup = chart.append("g");

                    // render x axis
                    var xAxisSVG = chart.append("g").attr("class", "axis x-axis").call(xAxis);

                    // rotate tick labels if time plot
                    if (isTimePlot) {
                        xAxisSVG.selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");
                    }

                    // render x axis label if exists
                    var xAxisOffset = chart.selectAll("g.x-axis")[0][0].getBBox().height;
                    margin.bottom += xAxisOffset - 3;
                    height = layout.height - margin.top - margin.bottom;

                    if (xAxisLabel) {
                        xAxisLabelSVG = chart.append("text") // text label for the x axis
                        .attr("class", "axis-title").style("text-anchor", "middle").text(xAxisLabel);
                    }

                    // render y axis
                    var yAxisSVG = chart.append("g").attr("class", "axis y-axis").call(yAxis);

                    var yAxisOffset = chart.selectAll("g.y-axis")[0][0].getBBox().width;
                    margin.left += yAxisOffset;
                    width = (layout.width || elementWidth) - margin.right - margin.left;
                    //yAxisLabelSVG.attr("y", yAxisOffset - 25);
                    xAxisLabelSVG.attr("transform", 'translate(' + width / 2 + ', ' + (height + xAxisOffset + 15) + ')');

                    // define node link function
                    var nodeLink = d3.svg.line().x(function (node) {
                        return xScale(node.x);
                    }).y(function (node) {
                        return yScale(node.y);
                    });

                    colourbar.attr("transform", 'translate(' + (width + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    if (layout.legend.show) {
                        var pos = layout.legend.position,
                            anchor = layout.legend.anchor,
                            xOffset = anchor.x === "outside" ? -yAxisOffset - (layout.yAxis.title ? 25 : 0) : 1,
                            yOffset = 15 + (layout.xAxis.title ? 15 : 0),
                            posX = pos.x === "left" ? xOffset : pos.x === "right" ? width + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2,
                            posY = pos.y === "top" ? 0 : pos.y === "bottom" ? height - 1 + (anchor.y === "outside" ? yOffset : 0) : height / 2;

                        legend.attr("transform", 'translate(' + posX + ',' + posY + ')');
                    }

                    // render chart title
                    if (layout.title) {
                        titleSVG = chart.append("text").attr("x", width / 2).attr("y", legendOut.top ? -legendHeight : -10).attr("text-anchor", "middle").style("font-size", "20px").text(layout.title);
                    }

                    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

                    yScale.range([height, 0]);
                    xScale.range([0, width]);

                    var labelExtraSpace = getExtraSpaceForLabel(xScale, maxLabelLength + maxLabelOffset + 5),
                        currentDomain = xScale.domain();

                    if (labelExtraSpace > 0) {
                        xScale.domain([currentDomain[0] - labelExtraSpace, currentDomain[1] + labelExtraSpace]);
                    }

                    var xScale0 = xScale.copy(),
                        yScale0 = yScale.copy();

                    xAxis.innerTickSize(-height);
                    yAxis.innerTickSize(-width);

                    xAxisSVG.attr("transform", 'translate(0, ' + height + ')').call(xAxis);
                    yAxisSVG.call(yAxis);

                    // render y axis label if exists
                    if (yAxisLabel) {
                        yAxisLabelSVG = chart.append("text") // text label for the y axis
                        .attr("class", "axis-title").attr("transform", "rotate(-90)").attr("y", -yAxisOffset - 10).attr("x", -(height / 2)).style("text-anchor", "middle").text(yAxisLabel);
                    }

                    if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
                        layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
                        layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                        drawColourBar(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
                        colourbar.attr("transform", 'translate(' + (width + colourBarOffset) + ',' + (height - layout.heatmap.colourBar.height) / 2 + ')');
                    }

                    var mouseRect = mouseCaptureGroup.append("rect").attr("id", "mouse-capture").attr("x", -margin.left).attr("y", -margin.top).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).style("fill", "transparent");

                    // render chart area
                    chart.attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')').call(zoom).on("dblclick.zoom", onDoubleClick);

                    // define arrowhead

                    defs.append("marker").attr({
                        "id": "marker-arrowhead",
                        "viewBox": "0 -5 10 10",
                        "refX": 15,
                        "refY": 0,
                        "markerWidth": 8,
                        "markerHeight": 8,
                        "orient": "auto"
                    }).append("path").attr("d", "M0,-4L10,0L0,4").attr("fill", layout.link.stroke).attr("class", "arrowHead");

                    defs.append("svg:clipPath").attr("id", "lineage-scatter-clip-rect").append("svg:rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height);

                    // render links
                    var plotArea = chart.append("g").attr("id", "scatter-plot-area").attr("clip-path", 'url(' + pathname + '#lineage-scatter-clip-rect)').append("g");

                    if (layout.heatmap.enabled) {
                        heatmapCircle = plotArea.append("g").attr("class", "heatmap-layer").selectAll("circle.heatmap-circle").data(nodesData.filter(function (n) {
                            return !isNaN(parseFloat(n.z));
                        })).enter().append("circle").attr("class", "heatmap-circle").style("fill", function (d) {
                            return heatmapColourScale(d.z);
                        }).style("opacity", layout.heatmap.opacity).attr(layout.heatmap.circle).attr("transform", function (d) {
                            return 'translate(' + xScale(d.x) + ',' + yScale(d.y) + ')';
                        });
                    }

                    plotArea.selectAll(".link").data(links).enter().append("svg:path").attr("stroke-dasharray", "3, 3").attr("d", function (conn) {
                        return nodeLink(conn);
                    }).attr(layout.link).attr("class", "link").attr("marker-end", 'url(' + pathname + '#marker-arrowhead)');

                    // create node groups
                    var node = plotArea.selectAll("g.node").data(nodesData).enter().append("g").attr("class", "node").attr("transform", function (node) {
                        return 'translate(' + xScale(node.x) + ', ' + yScale(node.y) + ')';
                    });

                    //render node circles
                    var circle = node.append("circle").attr(nodeAttr).style("stroke", function (d) {
                        return colours(d.series);
                    }).style("fill", function (d) {
                        return !selectedNodes.has(d.name) ? '#FFF' : colours(d.series);
                    }).each(function (d) {
                        d.bboxCircle = this.getBoundingClientRect();
                    }).on("click", click).on("mouseup", mouseUp).on("mouseover", function (d) {
                        var groupPos = this.getBoundingClientRect(),
                            xPos = (groupPos.right + groupPos.left) / 2,
                            yPos = groupPos.top,
                            text = '<div class="tooltip-colour-box" style="background-color: ' + colours(d.series) + '"></div>' + ('<span class="tooltip-text">' + d.name + '</span>') + ('<span class="tooltip-text">x: ' + d.x.toPrecision(3) + '</span>') + ('<span class="tooltip-text">y: ' + d.y.toPrecision(3) + '</span>');
                        tooltip.html(text).position([xPos, yPos]).show();
                    }).on("mouseout", function (d) {
                        tooltip.hide();
                    });

                    // render node labels
                    var label = node.append("text").attr("dy", ".35em").attr(layout.nodeLabel).attr(initialLabelPosition).text(function (node) {
                        return node.name;
                    }).style("opacity", 1).each(getNodeLabelBBox).each(function (d) {
                        return d.labelPos = initialLabelPosition;
                    });

                    var maxNodeLabelLength = d3.max(label.data().map(function (d) {
                        return d.bboxLabel.width;
                    })),
                        searchRadius = 2 * maxNodeLabelLength + 13;

                    if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay") {
                        LCD = new labelCollisionDetection(nodesData, labelPositions, layout.nodeLabel, xScale, yScale, width, height, searchRadius);
                        LCD.initializeLabelPositions(label);
                    }

                    legend.each(function () {
                        this.parentNode.appendChild(this);
                    });
                    titleSVG.each(function () {
                        this.parentNode.appendChild(this);
                    });

                    if (layout.groupSelection.enabled) {
                        mouseRect.on("mousedown", mouseDown).on("mousemove", mouseMove).on("mouseup", mouseUp).on("mouseout", mouseOut);

                        selectionRect = mouseCaptureGroup.append("rect").attr(layout.groupSelection.selectionRectangle).attr("class", "selection-rect");
                    }

                    function mouseDown() {
                        if (!d3.event.ctrlKey) return;
                        d3.event.preventDefault();
                        isDrag = true;
                        mouseStart = d3.mouse(this);
                        circle.style("pointer-events", "none");
                    }

                    function click(d) {
                        d3.event.preventDefault();
                        var n = d3.select(this.parentNode);
                        if (!n.classed("selected")) {
                            n.classed("selected", true);
                            n.select("circle").style("fill", function (d) {
                                return colours(d.series);
                            });
                        } else {
                            n.classed("selected", false);
                            n.select("circle").style("fill", "#FFF");
                        }
                        updateSelection();
                    }

                    function mouseUp(pos) {
                        if (!isDrag || !mouseStart) return;

                        var p = arguments.length == 1 ? pos : d3.mouse(this);
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
                        if (!isDrag) return;
                        selectionRect.attr("width", 0);
                        updateSelection();
                        mouseStart = null;
                        isDrag = false;
                        circle.style("pointer-events", "all");
                    }

                    function mouseMove() {
                        if (!isDrag) return;
                        var p = d3.mouse(this);
                        if (!d3.event.ctrlKey) {
                            mouseUp(p);
                            return;
                        }
                        var d = {
                            x: p[0] < mouseStart[0] ? p[0] : mouseStart[0],
                            y: p[1] < mouseStart[1] ? p[1] : mouseStart[1],
                            height: Math.abs(p[1] - mouseStart[1]),
                            width: Math.abs(p[0] - mouseStart[0])
                        };
                        selectionRect.attr(d);
                        selectPoints(selectionRect);
                    }

                    function selectPoints(rect) {
                        var rect_x1 = +rect.attr("x"),
                            rect_y1 = +rect.attr("y"),
                            rect_x2 = +rect.attr("width") + rect_x1,
                            rect_y2 = +rect.attr("height") + rect_y1,
                            any = false;

                        node.each(function (d, i, j) {
                            var n = d3.select(this);
                            var t = d3.transform(n.attr("transform")),
                                tx = t.translate[0],
                                ty = t.translate[1];

                            if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                                n.classed("selected", true);
                                n.select("circle").style("fill", function (d) {
                                    return colours(d.series);
                                });
                                any = true;
                            } else if (!selectedNodes.has(d.name)) {
                                n.classed("selected", false);
                                n.select("circle").style("fill", "#FFF");
                            }
                        });

                        return any;
                    }

                    function updateSelection() {
                        var wasChange = false;

                        svg.selectAll("g.node.selected").each(function (d) {
                            if (!selectedNodes.has(d.name)) {
                                selectedNodes.add(d.name);
                                wasChange = true;
                            }
                        });

                        svg.selectAll("g.node:not(.selected)").each(function (d) {
                            if (selectedNodes.has(d.name)) {
                                selectedNodes['delete'](d.name);
                                wasChange = true;
                            }
                        });

                        if (wasChange && scope.selected) {
                            scope.selectedNodes = _Array$from(selectedNodes);
                            scope.$apply();
                        }
                    }

                    function zoomed() {
                        if (d3.event.sourceEvent.ctrlKey) {
                            zoom.translate(translate);
                            zoom.scale(scale);
                            return;
                        }

                        var t = zoom.translate(),
                            s = zoom.scale(),
                            now = performance.now();
                        if (s == scale && t[0] == translate[0] && t[1] == translate[1]) return;
                        scale = s;
                        translate = t;
                        translate[0] = translate[0].clamp((1 - scale) * width, 0);
                        translate[1] = translate[1].clamp((1 - scale) * height, 0);
                        zoom.translate(translate);
                        xScale.domain(xScale0.range().map(function (x) {
                            return (x - translate[0]) / scale;
                        }).map(xScale0.invert));
                        yScale.domain(yScale0.range().map(function (y) {
                            return (y - translate[1]) / scale;
                        }).map(yScale0.invert));
                        applyZoom();
                        if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                            LCD.recalculateLabelPositions(label, scale);
                        } else if (layout.labelCollisionDetection.enabled === "onDelay") {
                            window.clearTimeout(LCDUpdateID);
                            LCDUpdateID = window.setTimeout(function () {
                                LCD.recalculateLabelPositions(label, scale);
                            }, layout.labelCollisionDetection.updateDelay);
                            lastLCDUpdateTime = now;
                        }
                    }

                    function applyZoom() {
                        plotArea.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                        mouseCaptureGroup.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                        svg.select(".x-axis.axis").call(xAxis);
                        svg.select(".y-axis.axis").call(yAxis);
                        svg.selectAll(".node circle").attr(scaleProperties(nodeAttr, scale, true)).each(function (d) {
                            d.bboxCircle = this.getBoundingClientRect();
                        });
                        svg.selectAll("path.link").attr(scaleProperties(layout.link, scale));
                        if (layout.heatmap.enabled) {
                            heatmapCircle.attr(scaleProperties(layout.heatmap.circle, scale));
                        }
                        if (layout.labelCollisionDetection.enabled === "onInit" || layout.labelCollisionDetection.enabled === "onDelay" || layout.labelCollisionDetection.enabled === false) {
                            label.each(function (d) {
                                var self = d3.select(this);
                                self.attr(scaleProperties(layout.nodeLabel, scale)).attr(scaleProperties(d.labelPos, scale));
                            });
                        }
                        if (layout.groupSelection.enabled) {
                            selectionRect.attr(scaleProperties(layout.groupSelection.selectionRectangle, scale));
                        }
                    }

                    function onDoubleClick() {
                        var now = performance.now();
                        scale = 1;
                        translate = [0, 0];
                        zoom.scale(1);
                        xScale.domain(xScale0.domain());
                        yScale.domain(yScale0.domain());
                        applyZoom();
                        if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                            LCD.recalculateLabelPositions(label, scale);
                        } else if (layout.labelCollisionDetection.enabled === "onDelay") {
                            window.clearTimeout(LCDUpdateID);
                            LCDUpdateID = window.setTimeout(function () {
                                LCD.recalculateLabelPositions(label, scale);
                            }, layout.labelCollisionDetection.enabled.updateDelay);
                            lastLCDUpdateTime = now;
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

    function createLinks(nodes, activeSeries) {
        var filteredNodes = [],
            nodesDict = {},
            parent = undefined,
            links = [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = _getIterator(nodes), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var node = _step.value;

                nodesDict[node.name] = node;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator['return']) {
                    _iterator['return']();
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
            for (var _iterator2 = _getIterator(nodes), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var node = _step2.value;

                var currentNode = node;
                if (!activeSeries.has(currentNode.series)) continue;
                while (parent = currentNode.parent) {
                    var parentNode = nodesDict[parent];
                    if (activeSeries.has(parentNode.series)) {
                        node.parent = parent;
                        links.push([parentNode, node]);
                        break;
                    }
                    currentNode = parentNode;
                }
                if (node.parent && !activeSeries.has(nodesDict[node.parent].series)) {
                    node.parent = null;
                }
                filteredNodes.push(node);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                    _iterator2['return']();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        return { nodesData: filteredNodes, links: links };
    }

    return {
        setters: [function (_4) {}, function (_5) {
            angular = _5['default'];
        }, function (_6) {
            d3 = _6['default'];
        }, function (_7) {
            d3legend = _7.d3legend;
            d3tooltip = _7.d3tooltip;
            mergeTemplateLayout = _7.mergeTemplateLayout;
            createNodeTypes = _7.createNodeTypes;
            createDynamicNodeAttr = _7.createDynamicNodeAttr;
            roundOffFix = _7.roundOffFix;
            labelCollisionDetection = _7.labelCollisionDetection;
            scaleProperties = _7.scaleProperties;
            getNodeLabelBBox = _7.getNodeLabelBBox;
            calcColourBarSize = _7.calcColourBarSize;
            drawColourBar = _7.drawColourBar;
            testLabelLength = _7.testLabelLength;
            getExtraSpaceForLabel = _7.getExtraSpaceForLabel;
        }, function (_) {
            _Set = _['default'];
        }, function (_2) {
            _Array$from = _2['default'];
        }, function (_3) {}, function (_b) {
            _Object$keys = _b['default'];
        }, function (_a) {
            _getIterator = _a['default'];
        }],
        execute: function () {
            'use strict';

            layoutTemplate = {
                title: null,
                width: null,
                height: 600,
                margin: {
                    right: 10,
                    left: 10,
                    top: 10,
                    bottom: 10
                },
                xAxis: {
                    title: null,
                    format: null
                },
                yAxis: {
                    title: null,
                    format: null
                },
                nodeTypes: {},
                nodeLabel: {
                    "font-size": 12
                },
                labelCollisionDetection: {
                    enabled: "never",
                    updateDelay: 500
                },
                link: {
                    stroke: "#838383",
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
                    orientation: "vertical"
                }
            };
            labelPositions = [{
                x: 13,
                y: 0,
                "text-anchor": "start"
            }, {
                x: -13,
                y: 0,
                "text-anchor": "end"
            }];

            _export('default', angular.module('ancestry.lineage-scatter', ['ancestry.utils']).directive('lineageScatterPlot', LineageScatterPlotDirective));
        }
    };
});
$__System.register("50", [], function() { return { setters: [], execute: function() {} } });

$__System.register('1', ['3', '5', '50', 'd', 'f', '4f'], function (_export) {
    'use strict';

    var angular;
    return {
        setters: [function (_2) {}, function (_) {
            angular = _['default'];
        }, function (_3) {}, function (_d) {}, function (_f) {}, function (_f2) {}],
        execute: function () {
            _export('default', angular.module('ancestry', ['ancestry.lineage', 'ancestry.radial-lineage', 'ancestry.radial-phylogenetic-tree', 'ancestry.lineage-scatter']));
        }
    };
});
System.register('lib/radial-lineage-plot/radial-lineage-plot.css!github:systemjs/plugin-css@0.1.16.js', [], false, function() {});
System.register('lib/radial-phylogenetic-tree/radial-phylogenetic-tree.css!github:systemjs/plugin-css@0.1.16.js', [], false, function() {});
System.register('lib/lineage-plot/lineage-plot.css!github:systemjs/plugin-css@0.1.16.js', [], false, function() {});
System.register('lib/lineage-scatter-plot/lineage-scatter-plot.css!github:systemjs/plugin-css@0.1.16.js', [], false, function() {});
System.register('lib/common.css!github:systemjs/plugin-css@0.1.16.js', [], false, function() {});
})
(function(factory) {
  define(["angular","d3"], factory);
});
//# sourceMappingURL=ancestry.js.map