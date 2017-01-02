'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LabelCollisionDetection = exports.d3tooltip = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.d3legend = d3legend;
exports.createPlotControls = createPlotControls;
exports.mergeTemplateLayout = mergeTemplateLayout;
exports.createNodeTypes = createNodeTypes;
exports.createDynamicNodeAttr = createDynamicNodeAttr;
exports.scaleProperties = scaleProperties;
exports.createTreeLayout = createTreeLayout;
exports.copyNodesArray = copyNodesArray;
exports.spreadGenerations = spreadGenerations;
exports.roundOffFix = roundOffFix;
exports.getNodeLabelBBox = getNodeLabelBBox;
exports.resetNodeLabelBBox = resetNodeLabelBBox;
exports.drawColourBar = drawColourBar;
exports.calcColourBarSize = calcColourBarSize;
exports.testLabelLength = testLabelLength;
exports.getExtraSpaceForLabel = getExtraSpaceForLabel;
exports.multiAttr = multiAttr;
exports.getTranslation = getTranslation;

var _d2 = require('d3');

var d3 = _interopRequireWildcard(_d2);

var _SVG2Bitmap = require('./SVG2Bitmap.js');

var _SVG2Bitmap2 = _interopRequireDefault(_SVG2Bitmap);

require('./icons-sprite.css!');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function d3legend() {
    var splitAfter = 0,
        anchor = { x: "outside", y: "inside" },
        position = { x: "right", y: "center" },
        seriesNames = null,
        colourScale = null,
        onMouseOver = null,
        onMouseOut = null,
        onClick = null,
        selectedItems = new Set(),
        verticalItemSpacing = 10,
        horizontalItemSpacing = 20,
        padding = 10,
        shapeSize = 10,
        maxSize = { width: -1, height: -1 },
        background = "white";

    function legend(g) {
        splitAfter = splitAfter.clamp(0, seriesNames.length);
        if (splitAfter === 0) splitAfter = seriesNames.length;
        var longestName = seriesNames.reduce(function (a, b) {
            return a.length > b.length ? a : b;
        });

        var lengthTestString = g.append("text").attr("visibility", false).text(longestName);
        var box = lengthTestString.node().getBBox();
        box.height = parseInt(window.getComputedStyle(lengthTestString.node()).fontSize, 10);
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

        g.append("rect").attr("x", legendHorizontalOffset).attr("y", legendVerticalOffset).attr("width", w).attr("height", h).attr("fill", background).style("opacity", 0.75);

        var item = g.selectAll("g.legend-item").data(seriesNames);

        var itemEnter = item.enter().append("g").attr("class", "legend-item");

        itemEnter.attr("transform", function (d, i) {
            return 'translate(' + (legendHorizontalOffset + padding + i % splitAfter * (columnWidth + horizontalItemSpacing)) + ',\n                                            ' + (legendVerticalOffset + padding + Math.floor(i / splitAfter) * (rowHeight + verticalItemSpacing)) + ')';
        });

        itemEnter.each(function (d, i) {
            var sel = d3.select(this);

            sel.append("rect").attr("class", "shape").attr("x", 2).attr("y", shapeVerticalOffset).attr("width", shapeSize).attr("height", shapeSize).attr("fill", selectedItems.has(d) ? colourScale(d) : "white").attr("stroke", colourScale(d));

            sel.append("text").attr("x", shapeSize + 5).attr("y", textVerticalOffset).attr("fill", "black").attr("font-size", 13).text(d);

            sel.append("rect").attr("class", "legend-item-mouse-capture").attr("x", 0).attr("y", 0).attr("width", columnWidth).attr("height", rowHeight).attr("fill", "white").attr("opacity", 0);
        });

        if (onMouseOver) itemEnter.on("mouseover", onMouseOver);
        if (onMouseOut) itemEnter.on("mouseout", onMouseOut);
        if (onClick) itemEnter.on("click", onClick);
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

    legend.backgroundColour = function (x) {
        if (!arguments.length) return background;
        background = x;
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

function createPlotControls(root, controls) {
    var activeControls = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var ICONS = {
        'download': 'svg-ic_photo_camera_black_24px',
        'select': 'svg-ic_radio_button_checked_black_24px',
        'zoom': 'svg-ic_open_with_black_24px',
        'label': 'svg-ic_label_black_24px'
    };
    var plotRoot = d3.select(root),
        ctrls = Object.keys(controls),
        timeoutId = null,
        isVisible = false;

    plotRoot.selectAll("div.plot-control-panel").remove();

    var controlPanel = plotRoot.append("div").attr("class", "plot-control-panel").style("visibility", "hidden");

    controlPanel.selectAll("div").data(ctrls).enter().append("div").attr("class", function (action) {
        return ICONS[action] + ' svg-icon action-' + action;
    });
    //.append("use")
    //.attr("xlink:href", action => `../dist/icons.svg#${ICONS[action]}`);

    plotRoot.select("svg").on("mousemove", function () {
        if (!isVisible) {
            controlPanel.style("visibility", "visible").transition().style("opacity", 1);
            isVisible = true;
        }
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
            controlPanel.style("opacity", 0).style("visibility", "hidden");
            isVisible = false;
        }, 2500);
    });

    plotRoot.select("div.action-zoom").classed("active", activeControls.includes("zoom")).on('click', function () {
        var self = d3.select(this);
        var active = self.classed("active");
        controls['zoom'](!active);
        self.classed("active", !active);
        var selectMode = plotRoot.select("div.action-select");
        if (!selectMode.empty() && selectMode.classed("active") && !active) {
            selectMode.classed("active", false);
            controls['select'](false);
        }
    });

    plotRoot.select("div.action-select").classed("active", activeControls.includes("select")).on('click', function () {
        var self = d3.select(this);
        var active = self.classed("active");
        controls['select'](!active);
        self.classed("active", !active);
        var zoomMode = plotRoot.select("div.action-zoom");
        if (!zoomMode.empty() && zoomMode.classed("active") && !active) {
            zoomMode.classed("active", false);
            controls['zoom'](false);
        }
    });

    plotRoot.select("div.action-label").classed("active", activeControls.includes("label")).on('click', function () {
        var self = d3.select(this);
        var active = self.classed("active");
        controls['label'](!active);
        self.classed("active", !active);
    });

    plotRoot.select("div.action-download").on('click', function () {
        var canvas = plotRoot.append("canvas").style("position", "absolute").style("display", "none");

        (0, _SVG2Bitmap2.default)(plotRoot.select("svg").node(), canvas.node());

        function sleep(time) {
            return new Promise(function (resolve) {
                return setTimeout(resolve, time);
            });
        }

        sleep(100).then(function () {
            var imgURI = canvas.node().toDataURL('image/png').replace('image/png', 'image/octet-stream');
            triggerDownload(imgURI);
            canvas.remove();
        });
    });

    function triggerDownload(imgURI) {
        var evt = new MouseEvent('click', {
            view: window,
            bubbles: false,
            cancelable: true
        });

        var a = document.createElement('a');
        a.setAttribute('download', 'plot.png');
        a.setAttribute('href', imgURI);
        a.setAttribute('target', '_blank');

        a.dispatchEvent(evt);
    }
}

var d3tooltip = exports.d3tooltip = function () {
    function d3tooltip(g) {
        _classCallCheck(this, d3tooltip);

        this.tip = g.append("div").attr("class", "ancestry-tooltip");
        this.pos = [0, 0];
        this.hide();
    }

    _createClass(d3tooltip, [{
        key: 'position',
        value: function position(pos) {
            if (!arguments.length) return this.pos;
            this.pos = pos;
            this.tip.style("left", pos[0] + 'px').style("top", pos[1] + 'px');
            return this;
        }
    }, {
        key: 'move',
        value: function move(pos, duration) {
            this.pos = pos;
            this.tip.transition().duration(duration).style("left", pos[0] + 'px').style("top", pos[1] + 'px');
            return this;
        }
    }, {
        key: 'hide',
        value: function hide() {
            this.tip.transition().delay(100).style("opacity", 0);
            return this;
        }
    }, {
        key: 'show',
        value: function show() {
            this.tip.transition().duration(0).style("opacity", 1);
            return this;
        }
    }, {
        key: 'html',
        value: function html(content) {
            this.tip.html(content);
            return this;
        }
    }], [{
        key: 'getRelativePosition',
        value: function getRelativePosition(el, parent) {
            var elPos = el.getBoundingClientRect(),
                parentPos = parent.getBoundingClientRect();

            return { x: (elPos.right + elPos.left) / 2 - parentPos.left, y: elPos.top - parentPos.top };
        }
    }]);

    return d3tooltip;
}();

function mergeTemplateLayout(layout, templateLayout) {
    for (var p in templateLayout) {
        if (layout.hasOwnProperty(p)) {
            if (_typeof(templateLayout[p]) == 'object' && !Array.isArray(templateLayout[p]) && templateLayout[p] != null) {
                layout[p] = mergeTemplateLayout(layout[p], templateLayout[p]);
            }
        } else {
            if (_typeof(templateLayout[p]) == 'object' && !Array.isArray(templateLayout[p]) && templateLayout[p] != null) {
                layout[p] = mergeTemplateLayout({}, templateLayout[p]);
            } else {
                layout[p] = templateLayout[p];
            }
        }
    }
    return layout;
}

function createNodeTypes(nodesArray, definedTypes, defaultType) {
    var typesFromLayout = Object.keys(definedTypes),
        typeNames = Array.from(new Set(nodesArray.map(function (node) {
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
        var _loop = function _loop() {
            var attr = _step.value;

            typeAttr[attr] = function (d) {
                return types[d.hasOwnProperty("data") ? d.data.type : d.type][attr];
            };
        };

        for (var _iterator = attrNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            _loop();
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

    return typeAttr;
}

function scaleProperties(props, scale) {
    var dynamic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var scaledProps = {};

    var _loop2 = function _loop2(key) {
        if (!props.hasOwnProperty(key)) return 'continue';
        var test = dynamic ? props[key]({ type: undefined }) : props[key];
        scaledProps[key] = !isNaN(test) && typeof test != 'string' ? dynamic ? function (d) {
            return props[key](d) / scale;
        } : props[key] / scale : props[key];
    };

    for (var key in props) {
        var _ret2 = _loop2(key);

        if (_ret2 === 'continue') continue;
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
    var gen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    tree.generation = gen;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = tree.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var child = _step2.value;

            spreadGenerations(child, gen + 1);
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
}

function roundOffFix(format) {
    var zeroThreshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1e-10;

    return function (d) {
        var str = d.toString();
        if (d < zeroThreshold && d > -zeroThreshold) d = 0;
        return format(str.length > 10 ? d.toPrecision(4) : d);
    };
}

function getNodeLabelBBox(d) {
    var _getBoundingClientRec = this.getBoundingClientRect();

    var top = _getBoundingClientRec.top;
    var bottom = _getBoundingClientRec.bottom;
    var right = _getBoundingClientRec.right;
    var left = _getBoundingClientRec.left;
    var width = _getBoundingClientRec.width;
    var height = _getBoundingClientRec.height;

    d.bboxLabel = { top: top, bottom: bottom, right: right, left: left, width: width, height: height };
    d.bboxLabel.top += d.bboxLabel.height * 0.16;
    d.bboxLabel.bottom -= d.bboxLabel.height * 0.16;

    var xs = [d.bboxCircle.left, d.bboxCircle.right, d.bboxLabel.left, d.bboxLabel.right],
        ys = [d.bboxCircle.top, d.bboxCircle.bottom, d.bboxLabel.top, d.bboxLabel.bottom];
    left = Math.min.apply(Math, xs);right = Math.max.apply(Math, xs);top = Math.min.apply(Math, ys);bottom = Math.max.apply(Math, ys);
    height = bottom - top;width = right - left;
    d.bbox = { left: left, right: right, top: top, bottom: bottom, width: width, height: height };
}

function resetNodeLabelBBox(d) {
    d.bboxLabel = d.bboxCircle;
    d.bbox = d.bboxCircle;
}

var LabelCollisionDetection = exports.LabelCollisionDetection = function () {
    function LabelCollisionDetection(nodes, labelPositions, labelLayout, width, height, searchRadius) {
        _classCallCheck(this, LabelCollisionDetection);

        this.width = width;
        this.height = height;
        this.nodes = nodes;
        this.nodesData = nodes.data();
        this.labelPositions = labelPositions;
        this.labelLayout = labelLayout;
        this.searchRadius = searchRadius;
        this.quadtree = d3.quadtree().extent([[-1, -1], [this.width + 1, this.height + 1]]);
    }

    _createClass(LabelCollisionDetection, [{
        key: 'createQuadTree',
        value: function createQuadTree(nodes, t /*transform*/) {
            this.quadtree.removeAll(this.nodesData).x(function (d) {
                return d.x * t.k + t.x;
            }).y(function (d) {
                return d.y * t.k + t.y;
            }).addAll(nodes);
        }
    }, {
        key: 'quadtreeSearchWithTransform',
        value: function quadtreeSearchWithTransform(point) {
            var _this = this;

            var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { x: 0, y: 0, k: 1 };

            var tx = _ref.x;
            var ty = _ref.y;
            var k = _ref.k;

            var foundNodes = [],
                rx = this.searchRadius.x,
                ry = this.searchRadius.y,
                r = Math.sqrt(rx * rx + ry * ry),
                px = point.x * k + tx,
                py = point.y * k + ty,
                x0 = px - rx,
                y0 = py - ry,
                x3 = px + rx,
                y3 = py + ry;

            this.quadtree.visit(function (node, x1, y1, x2, y2) {
                var outside = x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
                if (outside) return true;
                var p = node.data;
                if (p) {
                    if (_this.dist(px, py, p.x * k + tx, p.y * k + ty) <= r && p != point) {
                        do {
                            foundNodes.push(node.data);
                        } while (node = node.next);
                    }
                }
                return false;
            });

            return foundNodes.sort(function (a, b) {
                return b.x - a.x;
            });
        }
    }, {
        key: 'dist',
        value: function dist(x1, y1, x2, y2) {
            var dx = x2 - x1,
                dy = y2 - y1;
            return Math.pow(dx * dx + dy * dy, 0.5);
        }
    }, {
        key: 'recalculateLabelPositions',
        value: function recalculateLabelPositions(labels) {
            var _this2 = this;

            var transform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { x: 0, y: 0, k: 1 };

            // remove all labels' bounding boxes
            labels.each(resetNodeLabelBBox);
            // find only the labels that are in the display to reduce computing time and sort them to promote right-size orientation
            var filteredLabels = this.nodes.filter(function (d) {
                var dx = d.x * transform.k + transform.x,
                    dy = d.y * transform.k + transform.y;
                return dx >= -10 && dx <= _this2.width + 10 && dy >= -10 && dy <= _this2.height + 10;
            }).selectAll('text.node-label').sort(function (a, b) {
                return b.x - a.x;
            });
            // generate a new quad tree
            this.createQuadTree(filteredLabels.data(), transform);

            var self = this,
                N = self.labelPositions.length;
            // prevent label overlapping
            filteredLabels.each(function (d) {
                var i = 0,
                    collision = false,
                    sel = d3.select(this);

                var neighbours = self.quadtreeSearchWithTransform(d, transform);

                do {
                    // set next position from the position's list
                    d.labelPos = self.labelPositions[i++];
                    // apply the new position to DOM element
                    multiAttr.call(sel, scaleProperties(d.labelPos, transform.k));
                    // recalculate label and node's new bounding boxes
                    sel.each(getNodeLabelBBox);
                    // check if the label collides with its neighbours
                    collision = self.isColliding(d, neighbours);
                } while (collision && i < N);

                if (collision) {
                    // reset bounding boxes if no non-colliding postions were found
                    resetNodeLabelBBox(d);
                }
                // hide label if it collides
                sel.style("opacity", collision ? 1e-6 : 1);
                d.isColliding = collision;
            });
        }
    }, {
        key: 'checkCollision',
        value: function checkCollision(rect1, rect2) {
            return rect1.left < rect2.right && rect1.right > rect2.left && rect1.bottom > rect2.top && rect1.top < rect2.bottom;
        }
    }, {
        key: 'isColliding',
        value: function isColliding(object1, objects) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = objects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var object2 = _step3.value;

                    if (this.checkCollision(object1.bboxLabel, object2.bbox)) return true;
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

            return false;
        }
    }]);

    return LabelCollisionDetection;
}();

var colourBarID = 0;
function drawColourBar(selection, domain, heatmapOptions, defs, defsRoutePath) {

    selection.selectAll("*").remove();

    var width = heatmapOptions.colourBar.width,
        height = heatmapOptions.colourBar.height,
        colourScale = heatmapOptions.colourScale,
        opacity = heatmapOptions.opacity,
        title = heatmapOptions.title,
        titleOffset = title ? 22 : 0;

    var gradient = defs.append("svg:linearGradient").attr("id", 'gradient' + colourBarID).attr("x1", "0%").attr("y1", height > width ? "100%" : "0%").attr("x2", height > width ? "0%" : "100%").attr("y2", "0%").attr("spreadMethod", "pad");

    gradient.append("svg:stop").attr("offset", "0%").attr("stop-color", colourScale[0][1]).attr("stop-opacity", 1);

    gradient.append("svg:stop").attr("offset", "100%").attr("stop-color", colourScale[1][1]).attr("stop-opacity", 1);

    selection.append("rect").attr("x", titleOffset).attr("y", 0).attr("width", width).attr("height", height).style("fill", 'url(' + defsRoutePath + '#gradient' + colourBarID++ + ')').attr("stroke-width", 2).attr("stroke", "grey").style("opacity", opacity);

    if (title) {
        selection.append("text").attr("class", "axis-title").attr("transform", "rotate(-90)").attr("dy", 12).attr("x", -(height / 2)).style("text-anchor", "middle").text(title);
    }

    // Define x axis and grid
    var colourAxis = d3.axisRight().scale(d3.scaleLinear().domain(domain).range([height, 0]));

    selection.append("g").attr("class", "axis").attr("transform", 'translate(' + (width + titleOffset) + ', 0)').call(colourAxis);
}

function calcColourBarSize(size, relativeSize) {
    if (typeof size === 'string' || size instanceof String) {
        if (size === "auto") return relativeSize;else if (size[size.length - 1] === "%") return relativeSize * parseInt(size) / 100;else return relativeSize;
    } else return size;
}

function testLabelLength(svg, name, _attrs) {
    var label = svg.append("text").text(name);
    multiAttr.call(label, _attrs);
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

function multiAttr(attrs) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = Object.entries(attrs)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _step4$value = _slicedToArray(_step4.value, 2);

            var _attr = _step4$value[0];
            var value = _step4$value[1];

            this.attr(_attr, value);
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

    return this;
}

function getTranslation(transform) {
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttributeNS(null, "transform", transform);
    var matrix = g.transform.baseVal.consolidate().matrix;
    return [matrix.e, matrix.f];
}