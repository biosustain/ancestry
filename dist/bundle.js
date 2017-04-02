/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 14);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = angular;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = d3;

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_d3__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_d3___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_d3__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__SVG2Bitmap_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__icons_sprite_css__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__icons_sprite_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__icons_sprite_css__);
/* harmony export (immutable) */ __webpack_exports__["i"] = d3legend;
/* harmony export (immutable) */ __webpack_exports__["r"] = createPlotControls;
/* harmony export (immutable) */ __webpack_exports__["d"] = mergeTemplateLayout;
/* harmony export (immutable) */ __webpack_exports__["j"] = createNodeTypes;
/* harmony export (immutable) */ __webpack_exports__["k"] = createDynamicNodeAttr;
/* harmony export (immutable) */ __webpack_exports__["q"] = scaleProperties;
/* harmony export (immutable) */ __webpack_exports__["f"] = createTreeLayout;
/* unused harmony export copyNodesArray */
/* harmony export (immutable) */ __webpack_exports__["s"] = spreadGenerations;
/* unused harmony export roundOffFix */
/* unused harmony export getNodeLabelBBox */
/* harmony export (immutable) */ __webpack_exports__["n"] = getBBox;
/* unused harmony export getLinkLabelBBox */
/* unused harmony export resetNodeLabelBBox */
/* unused harmony export resetBBox */
/* harmony export (immutable) */ __webpack_exports__["h"] = drawColourBar;
/* harmony export (immutable) */ __webpack_exports__["g"] = calcColourBarSize;
/* harmony export (immutable) */ __webpack_exports__["e"] = testLabelLength;
/* harmony export (immutable) */ __webpack_exports__["l"] = getExtraSpaceForLabel;
/* harmony export (immutable) */ __webpack_exports__["m"] = multiAttr;
/* harmony export (immutable) */ __webpack_exports__["p"] = getTranslation;
/* harmony export (immutable) */ __webpack_exports__["a"] = attachActionOnResize;
/* harmony export (immutable) */ __webpack_exports__["c"] = filterSeries;




function d3legend() {
    let splitAfter = 0,
        anchor = {x: "outside", y: "inside"},
        position = {x: "right", y: "center"},
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
        maxSize = {width: -1, height: -1},
        background = "white";

    function legend(g) {
        splitAfter = splitAfter.clamp(0, seriesNames.length);
        if (splitAfter === 0) splitAfter = seriesNames.length;
        let longestName = seriesNames.reduce((a, b) => a.length > b.length ? a : b);

        let lengthTestString = g.append("text").attr("visibility", false).text(longestName);
        let box = lengthTestString.node().getBBox();
        box.height = parseInt(window.getComputedStyle(lengthTestString.node()).fontSize, 10);
        lengthTestString.remove();

        let columnWidth = box.width + shapeSize + 5,
            rowHeight = box.height;

        if (padding + splitAfter * (columnWidth + horizontalItemSpacing) > maxSize.width)
            splitAfter = Math.floor((maxSize.width - padding) / (columnWidth + horizontalItemSpacing));

        if (padding + Math.floor(seriesNames.length / splitAfter) * (rowHeight + verticalItemSpacing) > maxSize.height)
            splitAfter = Math.ceil(1.0 / ((maxSize.height - padding) / (rowHeight + verticalItemSpacing) / seriesNames.length));

        let rows = splitAfter > 0 ? Math.ceil(seriesNames.length / splitAfter) : 1,
            cols = splitAfter > 0 ? splitAfter : seriesNames.length,
            w = cols * columnWidth + (cols - 1) * horizontalItemSpacing + 2 * padding,
            h = rows * rowHeight + (rows - 1) * verticalItemSpacing + 2 * padding,
            shapeVerticalOffset = (rowHeight - shapeSize) / 2,
            textVerticalOffset = (rowHeight + box.height) / 2 - 2,
            legendHorizontalOffset = 0,
            legendVerticalOffset = 0;


        if ((position.y === "top" && anchor.y === "inside") || (position.y === "bottom" && anchor.y === "outside"))
            legendVerticalOffset = 0;
        else if ((position.y === "top" && anchor.y === "outside") || (position.y === "bottom" && anchor.y === "inside"))
            legendVerticalOffset = -h;
        else if (position.y === "center" && (position.x === "right" ||  position.x === "left"))
            legendVerticalOffset = -h / 2;

        if ((position.x === "left" && anchor.x === "inside") || (position.x === "right" && anchor.x === "outside"))
            legendHorizontalOffset = 0;
        else if ((position.x === "left" && anchor.x === "outside") || (position.x === "right" && anchor.x === "inside"))
            legendHorizontalOffset = -w;
        else if (position.x === "center" && (position.y === "top" ||  position.y === "bottom"))
            legendHorizontalOffset = -w / 2;

        g.append("rect")
            .attr("x", legendHorizontalOffset)
            .attr("y", legendVerticalOffset)
            .attr("width", w)
            .attr("height", h)
            .attr("fill", background)
            .style("opacity", 0.75);

        let item = g.selectAll("g.legend-item").data(seriesNames);

        let itemEnter = item.enter()
            .append("g")
            .attr("class", "legend-item");

        itemEnter.attr("transform", (d, i) => `translate(${legendHorizontalOffset + padding + (i % splitAfter) * (columnWidth + horizontalItemSpacing)},
                                            ${legendVerticalOffset + padding + Math.floor(i / splitAfter) * (rowHeight + verticalItemSpacing)})`);

        itemEnter.each(function (d, i) {
            let sel = __WEBPACK_IMPORTED_MODULE_0_d3__["select"](this);

            sel.append("rect")
                .attr("class", "shape")
                .attr("x", 2)
                .attr("y", shapeVerticalOffset)
                .attr("width", shapeSize)
                .attr("height", shapeSize)
                .attr("fill", selectedItems.has(d) ? colourScale(d) : "white")
                .attr("stroke", colourScale(d));

            sel.append("text")
                .attr("x", shapeSize + 5)
                .attr("y", textVerticalOffset)
                .attr("fill", "black")
                .attr("font-size", 13)
                .text(d);

            sel.append("rect")
                .attr("class", "legend-item-mouse-capture")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", columnWidth)
                .attr("height", rowHeight)
                .attr("fill", "white")
                .attr("opacity", 0);
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
            anchor = {x: "inside", y: "inside"};
        }
        else anchor = x;
        return this;
    };

    legend.maxSize = function (x) {
        if (!arguments.length) return maxSize;
        if (x.width !== undefined && x.height !== undefined)
            maxSize = x;
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

function createPlotControls(root, controls, activeControls = []) {
    const ICONS = {
        'download': 'svg-ic_photo_camera_black_24px',
        'select': 'svg-ic_radio_button_checked_black_24px',
        'zoom': 'svg-ic_open_with_black_24px',
        'label': 'svg-ic_label_black_24px'
    };
    let plotRoot = __WEBPACK_IMPORTED_MODULE_0_d3__["select"](root),
        ctrls = Object.keys(controls),
        timeoutId = null,
        isVisible = false;

    plotRoot.selectAll("div.plot-control-panel").remove();

    let controlPanel = plotRoot.append("div")
        .attr("class", "plot-control-panel")
        .style("visibility", "hidden");

    controlPanel.selectAll("div")
        .data(ctrls)
        .enter()
        .append("div")
        .attr("class", action => `${ICONS[action]} svg-icon action-${action}`);

    plotRoot.select("svg").on("mousemove", function() {
        if (!isVisible) {
            controlPanel.style("visibility", "visible").transition().style("opacity", 1);
            isVisible = true;
        }
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
            controlPanel.style("opacity", 0).style("visibility", "hidden");
            isVisible = false;
        }, 2500);
    });

    plotRoot.select("div.action-zoom")
        .classed("active", activeControls.includes("zoom"))
        .on('click', function() {
            let self = __WEBPACK_IMPORTED_MODULE_0_d3__["select"](this);
            let active = self.classed("active");
            (controls['zoom'])(!active);
            self.classed("active", !active);
            let selectMode = plotRoot.select("div.action-select");
            if (!selectMode.empty() && selectMode.classed("active") && !active) {
                selectMode.classed("active", false);
                (controls['select'])(false);
            }
        });

    plotRoot.select("div.action-select")
        .classed("active", activeControls.includes("select"))
        .on('click', function() {
            let self = __WEBPACK_IMPORTED_MODULE_0_d3__["select"](this);
            let active = self.classed("active");
            (controls['select'])(!active);
            self.classed("active", !active);
            let zoomMode = plotRoot.select("div.action-zoom");
            if (!zoomMode.empty() && zoomMode.classed("active") && !active) {
                zoomMode.classed("active", false);
                (controls['zoom'])(false);
            }
        });

    plotRoot.select("div.action-label")
        .classed("active", activeControls.includes("label"))
        .on('click', function() {
            let self = __WEBPACK_IMPORTED_MODULE_0_d3__["select"](this);
            let active = self.classed("active");
            (controls['label'])(!active);
            self.classed("active", !active);
        });

    plotRoot.select("div.action-download")
        .on('click', function(){
            let canvas = plotRoot.append("canvas")
                .style("position", "absolute")
                .style("display", "none");

            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__SVG2Bitmap_js__["a" /* default */])(plotRoot.select("svg").node(), canvas.node());

            function sleep (time) {
                return new Promise((resolve) => setTimeout(resolve, time));
            }

            sleep(100).then(() => {
                var imgURI = canvas.node()
                    .toDataURL('image/png')
                    .replace('image/png', 'image/octet-stream');
                triggerDownload(imgURI);
                canvas.remove();
            });
        });

    function triggerDownload (imgURI) {
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

class d3tooltip {
    constructor(g) {
        this.tip = g.append("div").attr("class", "ancestry-tooltip");
        this.pos = [0, 0];
        this.hide();
    }

    position(pos) {
        if (!arguments.length) return this.pos;
        this.pos = pos;
        this.tip.style("left", `${pos[0]}px`)
            .style("top", `${pos[1]}px`);
        return this;
    }

    move(pos, duration) {
        this.pos = pos;
        this.tip.transition().duration(duration).style("left", `${pos[0]}px`)
            .style("top", `${pos[1]}px`);
        return this;
    }

    hide() {
        this.tip.transition().delay(100).style("opacity", 0);
        return this;
    }

    show() {
        this.tip.transition().duration(0).style("opacity", 1);
        return this;
    }

    html(content) {
        this.tip.html(content);
        return this;
    }

    static getRelativePosition(el, parent) {
        let elPos = el.getBoundingClientRect(),
            parentPos = parent.getBoundingClientRect();

        return {x: (elPos.right + elPos.left) / 2 - parentPos.left, y: elPos.top - parentPos.top};
    }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = d3tooltip;


function mergeTemplateLayout(layout, templateLayout) {
    for (let p in templateLayout) {
        if (layout.hasOwnProperty(p)) {
            if (typeof templateLayout[p] == 'object' && !Array.isArray(templateLayout[p]) && templateLayout[p] != null) {
                layout[p] = mergeTemplateLayout(layout[p], templateLayout[p]);
            }
        }
        else {
            if (typeof templateLayout[p] == 'object' && !Array.isArray(templateLayout[p]) && templateLayout[p] != null) {
                layout[p] = mergeTemplateLayout({}, templateLayout[p]);
            }
            else {
                layout[p] = templateLayout[p];
            }
        }
    }
    return layout;
}

function createNodeTypes(nodesArray, definedTypes, defaultType) {
    let typesFromLayout = Object.keys(definedTypes),
        typeNames = Array.from(new Set(nodesArray.map(node => node.type))),
        types = {};
    typeNames.forEach(type => {
        types[type] = typesFromLayout.includes(type) ? mergeTemplateLayout(definedTypes[type], defaultType) : defaultType;
    });
    types[undefined] = defaultType;
    return types;
}

function createDynamicNodeAttr(types, attrNames) {
    let typeAttr = {};
    for (let attr of attrNames) {
        typeAttr[attr] = (d) => types[d.hasOwnProperty("data") ? d.data.type : d.type][attr];
    }
    return typeAttr;
}


function scaleProperties(props, scale, dynamic = false) {
    let scaledProps = {};
    for (let key in props) {
        if (!props.hasOwnProperty(key)) continue;
        let test = dynamic ? props[key]({type: undefined}) : props[key];
        scaledProps[key] = !isNaN(test) && typeof test != 'string' ?
            (dynamic ? d=> props[key](d) / scale : props[key] / scale) : props[key];
    }
    return scaledProps;
}

function createTreeLayout(nodes) {
    //let nodes = copyNodesArray(nodesArray);
    return nodes.map(node => {
        node.children = nodes.filter(n => n.parent == node.name);
        return node;
    }).filter(n => !n.parent);
}

function copyNodesArray(nodesArray) {
    return nodesArray.map(node => JSON.parse(JSON.stringify(node)));
}

function spreadGenerations(tree, gen = 0) {
    tree.generation = gen;
    for (let child of tree.children) {
        spreadGenerations(child, gen + 1);
    }
}

function roundOffFix(format, zeroThreshold=1e-10) {
    return d => {
        let str = d.toString();
        if (d < zeroThreshold && d > -zeroThreshold) d = 0;
        return format(str.length > 10 ? d.toPrecision(4) : d);
    }
}

function getNodeLabelBBox(d) {
    let {top, bottom, right, left, width, height} = this.getBoundingClientRect();
    d.bboxLabel = {top, bottom, right, left, width, height};
    d.bboxLabel.top += d.bboxLabel.height * 0.16;
    d.bboxLabel.bottom -= d.bboxLabel.height * 0.16;

    let xs = [d.bboxCircle.left, d.bboxCircle.right, d.bboxLabel.left, d.bboxLabel.right],
        ys = [d.bboxCircle.top, d.bboxCircle.bottom, d.bboxLabel.top, d.bboxLabel.bottom];
    left = Math.min(...xs); right = Math.max(...xs); top = Math.min(...ys); bottom = Math.max(...ys);
    height = bottom - top; width = right - left;
    d.bbox = {left, right, top, bottom, width, height};
}

function getBBox(d) {
    let {top, bottom, right, left, width, height} = this.getBoundingClientRect();
    d.bbox = {top, bottom, right, left, width, height};
}

function getLinkLabelBBox(d) {
    let {top, bottom, right, left, width, height} = this.getBoundingClientRect();
    d.bboxLinkLabel = {top, bottom, right, left, width, height};
    d.bboxLinkLabel.top += d.bboxLinkLabel.height * 0.16;
    d.bboxLinkLabel.bottom -= d.bboxLinkLabel.height * 0.16;
}

function resetNodeLabelBBox(d) {
    d.bboxLabel = d.bboxCircle;
    d.bbox = d.bboxCircle;
}

function resetBBox(d) {
    d.bbox = {
        top: -100,
        bottom: -100,
        right: -100,
        left: -100,
        width: 0,
        height: 0
    };
}

class LabelCollisionDetection {
    constructor(levelFixed, levels, nodeLabelPositions, labelLayout, width, height, nodeSearchRadius, linkSearchRadius) {
        this.width = width;
        this.height = height;
        this.levels = levels;
        this.levelFixed = levelFixed;
        this.nodeLabelPositions = nodeLabelPositions;
        this.nodeSearchRadius = nodeSearchRadius;
        this.linkSearchRadius = linkSearchRadius;
        this.quadtree = null;
    }

    quadtreeSearchWithTransform(point, searchRadius, {x: tx, y: ty, k: k} = {x: 0, y: 0, k: 1}) {
        let foundNodes = [],
            rx = searchRadius.x, ry = searchRadius.y,
            px = point.x * k + tx, py = point.y * k + ty,
            x0 = px - rx, y0 = py - ry, x3 = px + rx, y3 = py + ry;
        this.quadtree.visit((node, x1, y1, x2, y2) => {
            let outside = x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
            if (outside) return true;
            let p = node.data;
            if (p) {
                if((this.dist(px, py, p.x * k + tx, py) <= rx || this.dist(px, py, px, p.y * k + ty) <= ry) && p != point) {
                    do {
                        foundNodes.push(node.data)
                    } while (node = node.next);
                }
            }
            return false;
        });

        return foundNodes.sort((a, b) => b.x - a.x);
    }

    dist(x1, y1, x2, y2) {
        let dx = x2 - x1,
            dy = y2 - y1;
        return Math.pow(dx * dx + dy * dy, 0.5);
    }

    recalculateLabels(transform = {x: 0, y: 0, k: 1}) {
        let that = this;
        this.quadtree = __WEBPACK_IMPORTED_MODULE_0_d3__["quadtree"]().extent([[-1, -1], [this.width + 1, this.height + 1]])
            .x(d => d.x * transform.k + transform.x)
            .y(d => d.y * transform.k + transform.y);
        let filterVisible = d => {
            let dx = d.x * transform.k + transform.x, dy = d.y * transform.k + transform.y;
            return dx >= -10 && dx <= this.width + 10 && dy >= -10 && dy <= this.height + 10;
        };
        for (let fixedSelection of this.levelFixed) {
            let filteredSelection = fixedSelection.filter(filterVisible);
            filteredSelection.each(getBBox);
            this.quadtree.addAll(filteredSelection.data());
        }
        for (let level of this.levels) {
            if (!level.length) {
                continue;
            }
            let mergedSelection = level.length > 1 ? __WEBPACK_IMPORTED_MODULE_0_d3__["selectAll"]([].concat.apply([], level.map(d => d.nodes()))) : level[0];
            let filteredSelection = mergedSelection.filter(filterVisible);
            filteredSelection.each(resetBBox);
            this.quadtree.addAll(filteredSelection.data());
            recalculateCollisions(filteredSelection);
        }

        function recalculateCollisions(selection) {
            selection
                .sort((a, b) => (b.x - a.x) + 0.01 * (b.y - a.y))
                .each(function(d) {
                let i = 0,
                    collision = false,
                    sel = __WEBPACK_IMPORTED_MODULE_0_d3__["select"](this),
                    label_type = sel.attr("class");

                if (label_type == 'node-label') {
                    let neighbours = that.quadtreeSearchWithTransform(d, that.nodeSearchRadius, transform);
                    do {
                        // set next position from the position's list
                        d.currentLabelPos = that.nodeLabelPositions[i++];
                        d.scaledLabelPos = scaleProperties(d.currentLabelPos, transform.k);
                        // apply the new position to DOM element
                        //let scaledProps = scaleProperties(d.labelPos, transform.k);

                        sel.each(d => {
                                d.x = d.node.x + d.scaledLabelPos.x;
                                d.y = d.node.y + d.scaledLabelPos.y;
                            })
                            .attr("x", d => d.x)
                            .attr("y", d => d.y)
                            .attr("text-anchor", d => d.scaledLabelPos['text-anchor']);
                        // recalculate label and node's new bounding boxes
                        sel.each(getBBox);
                        // check if the label collides with its neighbours
                        collision = that.isColliding(d, neighbours);
                    } while (collision && i < that.nodeLabelPositions.length);
                }
                else { /* label_type == 'link-label' */
                    let neighbours = that.quadtreeSearchWithTransform(d, that.linkSearchRadius, transform);
                    sel.each(getBBox);
                    collision = that.isColliding(d, neighbours);
                }
                if(collision) { // reset bounding boxes if no non-colliding postions were found
                    resetBBox(d);
                }
                // hide label if it collides
                sel.style("opacity", collision ? 1e-6 : 1);
            })
        }
    }

    checkCollision(rect1, rect2) {
        return (rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.bottom > rect2.top &&
            rect1.top < rect2.bottom);
    }

    isColliding(object1, objects) {
        for(let object2 of objects) {
            if (this.checkCollision(object1.bbox, object2.bbox)) return true;
        }
        return false;
    }
}
/* harmony export (immutable) */ __webpack_exports__["o"] = LabelCollisionDetection;


let colourBarID = 0;
function drawColourBar(selection, domain, heatmapOptions, defs, defsRoutePath) {

    selection.selectAll("*").remove();

    let width = heatmapOptions.colourBar.width,
        height = heatmapOptions.colourBar.height,
        colourScale = heatmapOptions.colourScale,
        opacity = heatmapOptions.opacity,
        title = heatmapOptions.title,
        titleOffset = title ? 22 : 0;

    let gradient =  defs.append("svg:linearGradient")
        .attr("id",  `gradient${colourBarID}`)
        .attr("x1", "0%")
        .attr("y1", height > width ? "100%" : "0%")
        .attr("x2", height > width ? "0%" : "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");

    gradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", colourScale[0][1])
        .attr("stop-opacity", 1);

    gradient.append("svg:stop")
        .attr("offset", "100%")
        .attr("stop-color", colourScale[1][1])
        .attr("stop-opacity", 1);

    selection.append("rect")
        .attr("x", titleOffset)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", `url(${defsRoutePath}#gradient${colourBarID++})`)
        .attr("stroke-width", 2)
        .attr("stroke", "grey")
        .style("opacity", opacity);

    if (title) {
        selection.append("text")
            .attr("class", "axis-title")
            .attr("transform", "rotate(-90)")
            .attr("dy", 12)
            .attr("x",-(height / 2))
            .style("text-anchor", "middle")
            .text(title);
    }

    // Define x axis and grid
    let colourAxis = __WEBPACK_IMPORTED_MODULE_0_d3__["axisRight"]()
        .scale(__WEBPACK_IMPORTED_MODULE_0_d3__["scaleLinear"]().domain(domain).range([height, 0]));

    selection.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${width + titleOffset}, 0)`)
        .call(colourAxis);
}

function calcColourBarSize(size, relativeSize) {
    if (typeof size === 'string' || size instanceof String) {
        if (size === "auto") return relativeSize;
        else if (size[size.length - 1] === "%") return relativeSize * parseInt(size) / 100;
        else return relativeSize;
    }
    else return size;
}

function testLabelLength(svg, name, _attrs) {
    let label = svg.append("text").text(name);
    multiAttr.call(label, _attrs);
    let length = label.node().getBoundingClientRect().width;
    label.remove();
    return length;
}

function getExtraSpaceForLabel(scale, labelLength) {
    let d = scale.domain(), dd = d[1] - d[0],
        r = scale.range(), dr = r[1] - r[0];
    return labelLength * dd / (dr - 2 * labelLength);
}

function multiAttr(attrs) {
    for (let [attr, value] of Object.entries(attrs)) {
        this.attr(attr, value);
    }
    return this;
}

function getTranslation(transform) {
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttributeNS(null, "transform", transform);
    var matrix = g.transform.baseVal.consolidate().matrix;
    return [matrix.e, matrix.f];
}

function attachActionOnResize(window, action) {
    window = angular.element(window);
    let width = window[0].innerWidth;
    //let height = window[0].innerHeight;

    window.on('resize', (event) => {
        let newWidth = window[0].innerWidth;
        //let newHeight = window[0].innerHeight;
        if (width != newWidth /*|| height != newHeight*/) {
            width = newWidth;
            action();
        }
    });
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
        while (parent = currentNode.parent) {
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

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lineage_plot_css__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lineage_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__lineage_plot_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_d3__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_d3___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_d3__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shared_features_js__ = __webpack_require__(2);






class LineagePlotController {
    constructor($element, $window) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["a" /* attachActionOnResize */])($window, () => this.render({}));
        $element.addClass("ancestry ancestry-lineage-plot");

        this.svg = __WEBPACK_IMPORTED_MODULE_2_d3__["select"]($element[0])
            .style("position", "relative")
            .append("svg");

        this.maxAllowedDepth = 180;
        this.mouseStart = null;
        this.colours = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleOrdinal"](__WEBPACK_IMPORTED_MODULE_2_d3__["schemeCategory10"]);
        this.selectionRect = null;
        this.tooltip = new __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["b" /* d3tooltip */](__WEBPACK_IMPORTED_MODULE_2_d3__["select"]($element[0]));
        this.defaultNode = {
            r: 4,
            "stroke-width": 2
        };
        this.selectedNodesSet = null;
        this.LCD = null; // label collision detection
        this.lastLCDUpdateTime = 0;
        this.LCDUpdateID = null;
        this.heatmapColourScale = null;
        this.heatmapCircle = null;
        this.visibleSeries = new Set();
        this.window = $window;
        this.element = $element;
    }

    $onChanges(changes) {
        if (changes.value && changes.value.currentValue) {
            this.render({isNewData: true});
        }
    }

    render(options) {

        let that = this;
        // clean svg before rendering plot
        this.svg.selectAll('*').remove();

        let defs = this.svg.append("defs");

        this.selectedNodesSet = new Set();

        if (!this.value || !this.value.data.length) return;

        let seriesNames = Array.from(new Set(this.value.data.map(d => d.series)));

        if (options.isNewData) {
            this.colours.domain([]);
            this.visibleSeries = new Set(seriesNames);
        }

        let copy = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.copy(this.value),
            treeData = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["c" /* filterSeries */])(copy.data, this.visibleSeries),
            longestNodeName = treeData.length ? treeData.reduce((a, b) => a.name.length > b.name.length ? a : b).name : "",
            longestLinkLabel = treeData.length ? treeData.reduce((a, b) => a.inLinkLabel.length > b.inLinkLabel.length ? a : b).inLinkLabel : "",
            verticalExtraSpace = 40,
            layout = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["d" /* mergeTemplateLayout */])(copy.layout, layoutTemplate),
            pathname = this.window.location.pathname,
            maxLabelLength = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["e" /* testLabelLength */])(this.svg, longestNodeName, layout.nodeLabel),
            maxLabelOffset = __WEBPACK_IMPORTED_MODULE_2_d3__["max"](layout.nodeLabelPositions, (pos) => Math.abs(pos.x)),
            legendHeight = 0, legendWidth = 0, colourbarHeight = 0, colourbarWidth = 0,
            legendOut = {top: false, right: false, bottom: false, left: false},
            lcdEnabled = layout.labelCollisionDetection.enabled != "never",
            lastTransform = __WEBPACK_IMPORTED_MODULE_2_d3__["zoomIdentity"],
            showAxisTitle = layout.axis.show && !layout.axis.gridOnly && layout.axis.title,
            showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
            colourBarOrigWidth = layout.heatmap.colourBar.width, colourBarOrigHeight = layout.heatmap.colourBar.height,
            colourBarOffset = layout.heatmap.enabled && layout.heatmap.colourBar.show ? 15 : 0,
            colourbar = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            legend = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            xAxisOffset = 0,
            titleSVG = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            axisSVG = __WEBPACK_IMPORTED_MODULE_2_d3__["select"]();

        if (layout.legend.show) {
            if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
            if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
        }

        if (maxLabelLength < 40) maxLabelLength = 40;

        let initialLabelPosition = layout.nodeLabelPositions[0];

        let virtualRootNode = {name: "virtualRoot", children: [], parent: null};

        let allTrees = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["f" /* createTreeLayout */])(treeData),
            root = virtualRootNode;

        virtualRootNode.children = allTrees.map(node => {
            node.parent = "virtualRoot";
            return node;
        });

        if (layout.axis.valueProperty === "default") {
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["s" /* spreadGenerations */])(root);
        }

        let types = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["j" /* createNodeTypes */])(treeData, layout.nodeTypes, this.defaultNode),
            nodeAttr = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["k" /* createDynamicNodeAttr */])(types, Object.keys(this.defaultNode));

        // FIXME: time plotting not implemented / checked yet
        let isTimePlot = false;//trees[0].generation instanceof Date;

        let elementWidth = this.element[0].offsetWidth,
            elementHeight = this.element[0].offsetHeight;


        let margin = layout.margin;

        if (layout.title) margin.top += legendOut.top ? 26 : 25;
        //if (!(layout.legend.position.y == "top" && layout.legend.anchor.y == "outside")) margin.top += 10;
        if (showAxisTitle) margin.bottom += legendOut.bottom ? 16 : 18;

        let width = layout.width || elementWidth,
            height = layout.height || elementHeight;

        // render chart area
        this.svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        this.svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", layout.backgroundColour);

        let chart = this.svg.append("g");

        if (layout.heatmap.enabled) {

            let domain = __WEBPACK_IMPORTED_MODULE_2_d3__["extent"](treeData, node => node.z);

            if (domain[0] == domain[1]) {
                if (domain[0] === undefined) {
                    domain[0] = domain[1] = 0;
                }
                domain[0] -= 0.5;
                domain[1] += 0.5;
            }

            this.heatmapColourScale = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleLinear"]()
                .domain(domain)
                .range(layout.heatmap.colourScale.map(v => v[1]));

            if (layout.heatmap.colourBar.show) {
                layout.heatmap.colourBar.height = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigHeight, height);
                layout.heatmap.colourBar.width = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigWidth, width);

                colourbar = chart.append("g")
                    .attr("class", "ancestry-colourbar");

                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["h" /* drawColourBar */])(colourbar, this.heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                let bbox = colourbar.node().getBoundingClientRect(),
                    pos = layout.heatmap.colourBar.position;
                colourbarWidth = bbox.width;
                colourbarHeight = bbox.height;
                if (pos === "right" || pos === "left")
                    margin.right += colourbarWidth - (showHeatmapTitle ? 1 : 0) + colourBarOffset;
                //else if (pos === "top" || pos === "bottom")
                //    margin.top += colourbarHeight;
            }
        }

        if (layout.legend.show) {
            let pos = layout.legend.position,
                anchor = layout.legend.anchor,
                orientation = layout.legend.orientation;

            let splitAfter = orientation === "horizontal" ? 0 : 1;

            let drawLegend = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["i" /* d3legend */])()
                .splitAfter(splitAfter)
                .position(pos)
                .anchor(anchor)
                .seriesNames(seriesNames)
                .colourScale(this.colours)
                .backgroundColour(layout.legend.backgroundColour || layout.backgroundColour)
                .maxSize({width, height})
                .onClick(legendClick)
                .selectedItems(this.visibleSeries);

            legend = chart.append("g")
                .attr("class", "ancestry-legend")
                .call(drawLegend);

            let bbox = legend.node().getBoundingClientRect();
            legendHeight = bbox.height;
            legendWidth = bbox.width;

            if (anchor.x === "outside" && pos.x !== "center") {
                margin[pos.x] += legendOut.right ? legendWidth - 10 : (legendOut.left ? legendWidth - 11 : legendWidth);
            }
            else if (anchor.y === "outside" && pos.y !== "center") {
                margin[pos.y] += legendOut.bottom ? (layout.axis.show && !layout.axis.gridOnly ? legendHeight - 9 : legendHeight - 12) :
                    (legendOut.top ? legendHeight - 11 : legendHeight);
            }
        }

        width = (layout.width || elementWidth) - margin.right - margin.left;

        function legendClick(label) {
            let clicked = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](this);
            if (that.visibleSeries.has(label))
                that.visibleSeries.delete(label);
            else
                that.visibleSeries.add(label);
            clicked.classed("legend-item-selected", that.visibleSeries.has(label));
            clicked.select("rect.shape").attr("fill", that.visibleSeries.has(label) ? that.colours(label) : "white");
            that.render({isNewData: false});
        }

        // diagonal generator
        function diagonal(d) {
            let c = Math.abs(d.parent.x - d.x) / 2;

            return "M" + d.x + "," + d.y
                + "C" + (d.parent.x + c) + "," + d.y
                + " " + (d.parent.x + c) + "," + d.parent.y
                + " " + d.parent.x + "," + d.parent.y;
        }

        let generationExtent = __WEBPACK_IMPORTED_MODULE_2_d3__["extent"](treeData, node => node.generation),
            originalExtent = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.copy(generationExtent);

        generationExtent[1] += 1;
        generationExtent[0] -= 1;
        let depth = width / (generationExtent[1] - generationExtent[0]);
        let spaceRight = 1;
        //trim depth if exceeds maximum allowed depth
        if (depth > this.maxAllowedDepth) {
            depth = this.maxAllowedDepth;
            spaceRight = (width / depth) - originalExtent[1];
            generationExtent[1] = width / depth;
        }

        // define x scale
        let xScale = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleLinear"]()
            .domain(generationExtent)
            .range([0, width]);


        let labelExtraSpace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["l" /* getExtraSpaceForLabel */])(xScale, maxLabelLength + maxLabelOffset + 5),
            newDomain = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.copy(xScale.domain());

        if (labelExtraSpace > 1) {
            newDomain[0] = originalExtent[0] - labelExtraSpace;
        }
        if (labelExtraSpace > spaceRight) {
            newDomain[1] = originalExtent[1] + labelExtraSpace;
        }

        xScale.domain(newDomain);

        // Define x axis and grid
        let xAxis = __WEBPACK_IMPORTED_MODULE_2_d3__["axisBottom"]()
            .scale(xScale)
            .tickSizeInner(0)
            .tickSizeOuter(0);

        //render x axis
        if (layout.axis.show) {
            axisSVG = chart.append("g")
                .attr("class", "axis x-axis")
                .call(xAxis);

            if (!layout.axis.gridOnly) {
                xAxisOffset = axisSVG.node().getBBox().height;
                margin.bottom += xAxisOffset - 3;
            }

            xAxis.ticks(Math.ceil(xScale.domain().reduce((a, b) => b - a)));
        }

        height = (layout.height || elementHeight) - margin.top - margin.bottom;
        xAxis.tickSizeInner(-height);
        axisSVG.attr("transform", `translate(0, ${height})`).call(xAxis);
        axisSVG.selectAll(".tick line").attr("opacity", 0.2).style("shape-rendering", "crispEdges");
        axisSVG.selectAll("path.domain").style("shape-rendering", "crispEdges");
        this.svg.selectAll(".axis path, .axis line").attr("stroke", layout.axis.colour);

        chart.attr("transform", `translate(${margin.left}, ${margin.top})`);

        let treeLayout = __WEBPACK_IMPORTED_MODULE_2_d3__["tree"]().size([height - verticalExtraSpace, width]),
            nodes = treeLayout(__WEBPACK_IMPORTED_MODULE_2_d3__["hierarchy"](root, d => d.children));

        let descendants = nodes.descendants().filter(n => n.parent !== null);
        // Calculate depth positions.
        descendants.forEach(node => {
            node.y = node.x + verticalExtraSpace / 2;
            node.x = xScale(node.data.generation);
        });

        let clipRectId = `lineage-scatter-clip-rect${__WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("clipPath").size()}`;

        let clip = defs.append("svg:clipPath")
            .attr("id", clipRectId)
            .append("svg:rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);

        this.svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        // render chart title
        if (layout.title) {
            titleSVG = chart.append("text")
                .attr("x", (width / 2))
                .attr("y", legendOut.top ? -legendHeight : -10)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text(layout.title);
        }

        // render x axis label if exists
        if (showAxisTitle) {
            chart.append("text")             // text label for the x axis
                .attr("class", "axis-title")
                .style("text-anchor", "middle")
                .text(layout.axis.title)
                .attr("transform", `translate(${width / 2}, ${height + xAxisOffset + 15})`);
        }

        if (layout.axis.gridOnly) {
            chart.selectAll("g.x-axis path.domain, g.x-axis g.tick text").style("opacity", 1e-6);
        }

        if (layout.legend.show) {
            let pos = layout.legend.position,
                anchor = layout.legend.anchor,
                titleOffset = showAxisTitle ? 16 : 0,
                posX = pos.x === "left" ? 0 : (pos.x === "right" ? width + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2),
                posY = pos.y === "top" ? 0 : (pos.y === "bottom" ? height - 1 + (anchor.y === "outside" ? xAxisOffset + titleOffset : 0) : height / 2);

            legend.attr("transform", `translate(${posX},${posY})`);
        }

        if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
            layout.heatmap.colourBar.height = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigHeight, height);
            layout.heatmap.colourBar.width = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigWidth, width);

            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["h" /* drawColourBar */])(colourbar, this.heatmapColourScale.domain(), layout.heatmap, defs, pathname);
            colourbar.attr("transform", `translate(${width + colourBarOffset},${(height - layout.heatmap.colourBar.height)/2})`);
        }
        // for nicer png downloads
        this.svg.selectAll(".tick text").attr("font-size", 12);

        let mouseCaptureGroup = chart.append("g");

        let mouseRect = mouseCaptureGroup.append("rect")
            .attr("id", "mouse-capture")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "transparent");

        let treesContainer = chart.append("g")
            .attr("clip-path", `url(${pathname}#${clipRectId})`)
            .append("g")
            .attr("id", "trees-containter");

        if (layout.heatmap.enabled) {
            this.heatmapCircle = treesContainer.append("g")
                .attr("class", "heatmap-layer")
                .selectAll("circle.heatmap-circle")
                .data(descendants.filter(n => !isNaN(parseFloat(n.data.z))))
                .enter()
                .append("circle")
                .attr("class", "heatmap-circle")
                .style("fill", d => this.heatmapColourScale(d.data.z))
                .style("opacity", layout.heatmap.opacity)
                .attr("transform", d => `translate(${d.x},${d.y})`);

            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(this.heatmapCircle, layout.heatmap.circle);
        }


        // Declare the links
        let link = treesContainer.append("g")
            .attr("class", "link-layer")
            .selectAll("path.link")
            //.data(links.filter(l => l.source.name != "virtualRoot"));
            .data(descendants.filter(n => n.parent.data.name != "virtualRoot"))
            .enter()
            .insert("path", "g")
            .attr("class", "link")
            .attr("d", diagonal);

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(link, layout.link);
        // Declare the nodes
        let node = treesContainer.append("g")
            .attr("class", "node-circle-layer")
            .selectAll("g.node")
            .data(descendants)
            .enter().append("g")
            .attr("class", "node")
            .classed("selected", (d) => this.selectedNodesSet.has(d.data.name))
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // Add node circles
        let circle = node.append("circle")
            .attr("class", "node-circle")
            .style("fill", d => !this.selectedNodesSet.has(d.data.name) ? '#FFF' : this.colours(d.data.series))
            .style("stroke", d => this.colours(d.data.series));

        if (layout.tooltip.show) {
            circle.on("mouseover", function (d, i) {
                let {x: xPos, y: yPos} = __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["b" /* d3tooltip */].getRelativePosition(this, that.element[0]),
                    seriesBar = layout.tooltip.showSeriesBar ?
                        `<div class="tooltip-colour-box" style=\"background-color: ${that.colours(d.data.series)}\"></div>` : "",
                    text = d.data.tooltip ? d.data.tooltip.map((line) => `<span align="${layout.tooltip.align}" class="tooltip-text">${line}</span>`).join("") :
                        `<span class="tooltip-text">${d.data.name}</span>`;
                that.tooltip.html(seriesBar + text).position([xPos, yPos]).show();
            })
                .on("mouseout", (d) => {
                    this.tooltip.hide();
                });
        }

        toggleNodeClickCallback(true);

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(circle, nodeAttr);

        // Add node labels
        let nodeLabel = treesContainer.append("g")
            .attr("class", "node-label-layer")
            .selectAll("text.node-label")
            .data(descendants.map(d => {
                return {node: d};
            }))
            .enter()
            .append("text")
            .attr("class", "node-label")
            .attr("dy", ".35em")
            .text(d => d.node.data.name)
            .style("opacity", 1)
            .each(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["n" /* getBBox */])
            .each(d => {
                d.currentLabelPos = initialLabelPosition;
                d.scaledLabelPos = initialLabelPosition;
                d.x = d.node.x + d.scaledLabelPos.x;
                d.y = d.node.y + d.scaledLabelPos.y;
            })
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("text-anchor", d => d.scaledLabelPos['text-anchor']);

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(nodeLabel, layout.nodeLabel);
        this.svg.selectAll("text").attr("fill", layout.textColour);

        let linkLabel = treesContainer.append("g")
            .attr("class", "link-label-layer")
            .selectAll("text")
            .data(descendants
                .filter(d => d.parent.data.name != "virtualRoot")
                .map(d => {
                return {nodeTo: d};
            }))
            .enter()
            .append("text")
            .attr("class", "link-label")
            .attr("text-anchor", "middle")
            .each(d => {
                d.x = (d.nodeTo.x + d.nodeTo.parent.x) / 2;
                d.y = (d.nodeTo.y + d.nodeTo.parent.y) / 2;
            })
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("dy", ".35em")
            .text(d => d.nodeTo.data.inLinkLabel)
            .style("opacity", 1)
            .each(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["n" /* getBBox */]);

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(linkLabel, layout.linkLabel);

        let maxNodeLabelLength = __WEBPACK_IMPORTED_MODULE_2_d3__["max"](nodeLabel.data().map(d => d.bbox.width)),
            maxNodeLabelHeight = __WEBPACK_IMPORTED_MODULE_2_d3__["max"](nodeLabel.data().map(d => d.bbox.height)),
            maxLinkLabelHeight = __WEBPACK_IMPORTED_MODULE_2_d3__["max"](linkLabel.data().map(d => d.bbox.height)),
            maxLinkLabelLength = __WEBPACK_IMPORTED_MODULE_2_d3__["max"](linkLabel.data().map(d => d.bbox.width)),
            nodeSearchRadius = {x: 2 * maxNodeLabelLength + 10, y: 2 * maxNodeLabelHeight},
            linkSearchRadius = {x: maxLinkLabelLength + 10, y: 2 * maxLinkLabelHeight};

        if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" ||
            layout.labelCollisionDetection.enabled === "onDelay") {
            let order = [[],[]];
            order[layout.labelCollisionDetection.order.nodeLabel - 1].push(nodeLabel);
            order[layout.labelCollisionDetection.order.linkLabel - 1].push(linkLabel);
            this.LCD = new __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["o" /* LabelCollisionDetection */]([circle], order, layout.nodeLabelPositions, layout.nodeLabel, width, height, nodeSearchRadius, linkSearchRadius);
            this.LCD.recalculateLabels(__WEBPACK_IMPORTED_MODULE_2_d3__["zoomIdentity"]);
        }

        legend.each(function () {
            this.parentNode.appendChild(this);
        });
        titleSVG.each(function () {
            this.parentNode.appendChild(this);
        });

        if (layout.groupSelection.enabled) {
            this.selectionRect = mouseCaptureGroup.append("rect")
                .attr("class", "selection-rect");

            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(this.selectionRect, layout.groupSelection.selectionRectangle);
        }

        function click() {
            __WEBPACK_IMPORTED_MODULE_2_d3__["event"].preventDefault();
            let n = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](this.parentNode);
            if (!n.classed("selected")) {
                n.classed("selected", true);
                n.select("circle.node-circle").style("fill", d => that.colours(d.data.series));
            }
            else {
                n.classed("selected", false);
                n.select("circle.node-circle").style("fill", "#FFF");
            }
            updateSelection();
        }
        function mouseDown() {
            __WEBPACK_IMPORTED_MODULE_2_d3__["event"].preventDefault();
            that.mouseStart = __WEBPACK_IMPORTED_MODULE_2_d3__["mouse"](mouseRect.node());
            mouseRect.on("mousemove", mouseMove)
                .on("mouseup", finalizeSelection)
                .on("mouseout", finalizeSelection);
            circle.style("pointer-events", "none");
        }

        function finalizeSelection() {
            that.selectionRect.attr("width", 0);
            updateSelection();
            circle.style("pointer-events", "all");
            mouseRect.on("mousemove", null)
                .on("mouseup", null)
                .on("mouseout", null);
        }

        function mouseMove() {
            let p = __WEBPACK_IMPORTED_MODULE_2_d3__["mouse"](mouseRect.node());
            let d = {
                x: (p[0] < that.mouseStart[0] ? p[0] : that.mouseStart[0]),
                y: (p[1] < that.mouseStart[1] ? p[1] : that.mouseStart[1]),
                height: Math.abs(p[1] - that.mouseStart[1]),
                width: Math.abs(p[0] - that.mouseStart[0])
            };
            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(that.selectionRect, d);
            selectPoints(that.selectionRect);
        }

        function selectPoints(rect) {
            let rect_x1 = +rect.attr("x"),
                rect_y1 = +rect.attr("y"),
                rect_x2 = +rect.attr("width") + rect_x1,
                rect_y2 = +rect.attr("height") + rect_y1,
                any = false;

            node.each(function (d, i) {
                let n = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](this);
                let [tx, ty] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["p" /* getTranslation */])(n.attr("transform"));

                if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                    n.classed("selected", true);
                    n.select("circle.node-circle").style("fill", d => that.colours(d.data.series));
                    any = true;
                }
                else if (!that.selectedNodesSet.has(d.data.name)) {
                    n.classed("selected", false);
                    n.select("circle.node-circle").style("fill", "#FFF");
                }
            });

            return any;
        }

        function updateSelection() {
            let wasChange = false;

            that.svg.selectAll("g.node.selected").each(d => {
                if (!that.selectedNodesSet.has(d.data.name)) {
                    that.selectedNodesSet.add(d.data.name);
                    wasChange = true;
                }
            });

            that.svg.selectAll("g.node:not(.selected)").each(d => {
                if (that.selectedNodesSet.has(d.data.name)) {
                    that.selectedNodesSet.delete(d.data.name);
                    wasChange = true;
                }
            });

            if (wasChange && that.selectedNodes) {
                that.selectedNodes({ $nodes: Array.from(that.selectedNodesSet)});
            }
        }

        function toggleNodeClickCallback(active) {
            if (that.nodeClick === undefined) return;

            function nodeClickCallback(d) {
                that.nodeClick({ $event: __WEBPACK_IMPORTED_MODULE_2_d3__["event"], $node: d.data});
            }

            circle.on('click', active ? nodeClickCallback : null);
        }

        let zoom = __WEBPACK_IMPORTED_MODULE_2_d3__["zoom"]()
            .scaleExtent([1, layout.maxZoom])
            .extent([[0, 0],[width, height]])
            .translateExtent([[0, 0],[width, height]])
            .on("zoom", onZoom);

        function onZoom() {
            applyZoom(__WEBPACK_IMPORTED_MODULE_2_d3__["event"].transform);
            if (lcdEnabled) {
                applyLCD(__WEBPACK_IMPORTED_MODULE_2_d3__["event"].transform);
            }
            lastTransform = __WEBPACK_IMPORTED_MODULE_2_d3__["event"].transform;
        }

        function applyZoom(zoomTransform) {
            let scale = zoomTransform.k;
            treesContainer.attr("transform", zoomTransform);
            mouseCaptureGroup.attr("transform", zoomTransform);
            xAxis.ticks(Math.ceil(xScale.domain().reduce((a, b) => b - a) / scale));
            axisSVG.call(xAxis.scale(zoomTransform.rescaleX(xScale)));
            axisSVG.selectAll(".tick line").style("shape-rendering", "crispEdges").attr("opacity", 0.2).attr("stroke", layout.axis.colour);
            that.svg.selectAll(".tick text").attr("font-size", 12).attr("fill", layout.textColour);
            if (layout.axis.gridOnly) {
                chart.selectAll("g.x-axis g.tick text").style("opacity", 1e-6);
            }

            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(circle, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(nodeAttr, scale, true));

            circle.attr("stroke", d => that.colours(d.data.series));

            if (layout.heatmap.enabled) {
                __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(that.heatmapCircle, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(layout.heatmap.circle, scale));
            }
            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(that.svg.selectAll("path.link"), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(layout.link, scale));
            nodeLabel.each(d => {
                    d.scaledLabelPos = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(d.currentLabelPos, scale);
                    d.x = d.node.x + d.scaledLabelPos.x;
                    d.y = d.node.y + d.scaledLabelPos.y;
                })
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .attr("text-anchor", d => d.scaledLabelPos['text-anchor']);
            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(nodeLabel, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(layout.nodeLabel, scale));

            linkLabel.each(d => {
                    d.x = (d.nodeTo.x + d.nodeTo.parent.x) / 2;
                    d.y = (d.nodeTo.y + d.nodeTo.parent.y) / 2;
                })
                .attr("x", d => d.x)
                .attr("y", d => d.y);
            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(linkLabel, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(layout.linkLabel, scale));

            if (layout.groupSelection.enabled) {
                __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(that.selectionRect, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(layout.groupSelection.selectionRectangle, scale));
            }
        }

        function onDoubleClick() {
            let I = __WEBPACK_IMPORTED_MODULE_2_d3__["zoomIdentity"];
            chart.call(zoom.transform, I);
            applyZoom(I);
            if (lcdEnabled) {
                applyLCD(I);
            }
            lastTransform = I;
        }

        function applyLCD(transform) {
            if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                that.LCD.recalculateLabels(transform);
            }
            else if (layout.labelCollisionDetection.enabled === "onDelay") {
                window.clearTimeout(that.LCDUpdateID);
                that.LCDUpdateID = window.setTimeout(() => {
                    that.LCD.recalculateLabels(transform);
                }, layout.labelCollisionDetection.updateDelay);
                that.lastLCDUpdateTime = performance.now();
            }
        }

        let controls = {
            'download': function() {},
            'zoom': toggleZoom,
            'select': toggleSelect,
            'label': toggleLabels
        };
        let activeControls = [];
        if (layout.showLabel) activeControls.push("label");

        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["r" /* createPlotControls */])(this.element[0], controls, activeControls);

        function toggleZoom(toggle) {
            if (toggle) {
                chart.call(zoom)
                    .on('dblclick.zoom', onDoubleClick);
            }
            else {
                chart.on("wheel.zoom", null)
                    .on("mousedown.zoom", null)
                    .on("dblclick.zoom", null)
                    .on("touchstart.zoom", null)
                    .on("touchmove.zoom", null)
                    .on("touchend.zoom", null)
                    .on("touchcancel.zoom", null);
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
            nodeLabel.style("opacity", d => toggle && !d.isColliding ? 1 : 1e-6);
            linkLabel.style("opacity", d => toggle && !d.isColliding ? 1 : 1e-6);
            if (layout.labelCollisionDetection.enabled != "never" && layout.labelCollisionDetection.enabled != "onInit") {
                lcdEnabled = !lcdEnabled;
                if (lcdEnabled) {
                    that.LCD.recalculateLabels(lastTransform);
                }
            }
        }
    }
}

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};

let layoutTemplate = {
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
    linkLabel: {
        "font-size": 12,
        "font-family": "Roboto,Helvetica Neue,sans-serif"
    },
    labelCollisionDetection: {
        enabled: "never",
        updateDelay: 500,
        order: {
            linkLabel: 1,
            nodeLabel: 1
        }
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
        colourScale: [
            [0, '#008ae5'],
            [1, 'yellow']
        ],
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
    },
    nodeLabelPositions: [
        {
            x: 10,
            y: 0,
            "text-anchor": "start"
        },
        {
            x: -10,
            y: 0,
            "text-anchor": "end"
        }
    ]
};


const LineagePlotComponent = {
    template: '',
    controller: LineagePlotController,
    bindings: {
        value: '<',
        selectedNodes: '&',
        nodeClick: '&'
    }
};

LineagePlotController.$$ngIsClass = true; // temporary Firefox fix
/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.module('ancestry.lineage', [])
    //.directive('lineagePlot', LineagePlotDirective);
    .component('lineagePlot', LineagePlotComponent);

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lineage_scatter_plot_css__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lineage_scatter_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__lineage_scatter_plot_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_d3__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_d3___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_d3__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shared_features_js__ = __webpack_require__(2);






class LineageScatterPlotController {
    constructor($element, $window) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["a" /* attachActionOnResize */])($window, () => this.render({}));
        $element.addClass("ancestry ancestry-lineage-scatter-plot");

        this.svg = __WEBPACK_IMPORTED_MODULE_2_d3__["select"]($element[0])
            .style("position", "relative")
            .append("svg");

        this.mouseStart = null;
        this.colours = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleOrdinal"](__WEBPACK_IMPORTED_MODULE_2_d3__["schemeCategory10"]);
        this.selectionRect = null;
        this.tooltip = new __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["b" /* d3tooltip */](__WEBPACK_IMPORTED_MODULE_2_d3__["select"]($element[0]));
        this.defaultNode = {
            r: 4,
            "stroke-width": 2
        };
        this.selectedNodesSet = null;
        this.LCD = null; // label collision detection
        this.lastLCDUpdateTime = 0;
        this.LCDUpdateID = null;
        this.heatmapColourScale = null;
        this.heatmapCircle = null;
        this.visibleSeries = new Set();
        this.window = $window;
        this.element = $element;
        this.defaultTimeFormat = "%d %b %y";
        this.defaultScalarFormat = "g";
        //this.isDrag = false;
        //this.scale = 1;
        //this.translate = [0, 0];
    }

    $onChanges(changes) {
        if (changes.value && changes.value.currentValue) {
            this.render({isNewData: true});
        }
    }

    render(options) {

        let that = this;
        // clean svg before rendering plot
        this.svg.selectAll('*').remove();

        let elementWidth = this.element[0].offsetWidth,
            elementHeight = this.element[0].offsetHeight;

        let marginRatio = {axisX: 0.15, axisY: 0.1};

        // don't continue rendering if there is no data
        if (!this.value || !this.value.data.length) return;

        this.selectedNodesSet = new Set();

        let seriesNames = Array.from(new Set(this.value.data.map(d => d.series)));

        if (options.isNewData) {
            this.colours.domain([]);
            this.visibleSeries = new Set(seriesNames);
        }

        let copy = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.copy(this.value),
            treeData = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["c" /* filterSeries */])(copy.data, this.visibleSeries),
            longestNodeName = treeData.length ? treeData.reduce((a, b) => a.name.length > b.name.length ? a : b).name : "",
            layout = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["d" /* mergeTemplateLayout */])(copy.layout, layoutTemplate),
            pathname = this.window.location.pathname,
            maxLabelLength = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["e" /* testLabelLength */])(this.svg, longestNodeName, layout.nodeLabel),
            maxLabelOffset = __WEBPACK_IMPORTED_MODULE_2_d3__["max"](labelPositions, (pos) => Math.abs(pos.x)),
            legendHeight = 0, legendWidth = 0, colourbarHeight = 0, colourbarWidth = 0,
            colourBarOffset = layout.heatmap.enabled && layout.heatmap.colourBar.show ? 15 : 0,
            legendOut = {top:false, right: false, bottom:false, left:false},
            lcdEnabled = layout.labelCollisionDetection.enabled != "never",
            lastTransform = __WEBPACK_IMPORTED_MODULE_2_d3__["zoomIdentity"],
            showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
            colourBarOrigWidth = layout.heatmap.colourBar.width, colourBarOrigHeight = layout.heatmap.colourBar.height,
            colourbar = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            legend = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            xAxisLabelSVG = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            yAxisLabelSVG = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            titleSVG = __WEBPACK_IMPORTED_MODULE_2_d3__["select"]();

        if (layout.legend.show) {
            if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
            if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
        }

        if (maxLabelLength < 40) maxLabelLength = 40;

        let virtualRootNode = {name: "virtualRoot", children: [], parent: null};

        let allTrees = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["f" /* createTreeLayout */])(treeData),
            root = virtualRootNode;

        virtualRootNode.children = allTrees.map(node => {
            node.parent = "virtualRoot";
            return node;
        });

        let margin = layout.margin,
            width =  layout.width || elementWidth,
            height = layout.height || elementHeight;

        this.svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", layout.backgroundColour);

        if (layout.title) margin.top += legendOut.top ? 26 : 25;
        if (layout.xAxis.title) margin.bottom += legendOut.bottom ? 15 : 18;
        if (layout.yAxis.title) margin.left += 21;

        let chart = this.svg.append("g");
        let defs = chart.append("svg:defs");

        if (layout.heatmap.enabled) {

            let domain = __WEBPACK_IMPORTED_MODULE_2_d3__["extent"](treeData, node => node.z);

            if (domain[0] == domain[1]) {
                if (domain[0] === undefined) {
                    domain[0] = domain[1] = 0;
                }
                domain[0] -= 0.5;
                domain[1] += 0.5;
            }

            this.heatmapColourScale = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleLinear"]()
                .domain(domain)
                .range(layout.heatmap.colourScale.map(v => v[1]));

            if (layout.heatmap.colourBar.show) {
                layout.heatmap.colourBar.height = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigHeight, height);
                layout.heatmap.colourBar.width = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigWidth, width);

                colourbar = chart.append("g")
                    .attr("class", "ancestry-colourbar");

                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["h" /* drawColourBar */])(colourbar, this.heatmapColourScale.domain(), layout.heatmap, defs, pathname);

                let bbox = colourbar.node().getBoundingClientRect(),
                    pos = layout.heatmap.colourBar.position;
                colourbarWidth = bbox.width;
                colourbarHeight = bbox.height;
                if (pos === "right" || pos === "left")
                    margin.right += colourbarWidth - (showHeatmapTitle ? 1 : 0) + colourBarOffset;
                //else if (pos === "top" || pos === "bottom")
                //    margin.top += colourbarHeight;
            }
        }

        if (layout.legend.show) {
            let pos = layout.legend.position,
                anchor = layout.legend.anchor,
                orientation = layout.legend.orientation;

            let splitAfter = orientation === "horizontal" ? 0 : 1;

            let drawLegend = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["i" /* d3legend */])()
                .splitAfter(splitAfter)
                .position(pos)
                .anchor(anchor)
                .seriesNames(seriesNames)
                .colourScale(this.colours)
                .backgroundColour(layout.legend.backgroundColour || layout.backgroundColour)
                .maxSize({width, height})
                .onClick(legendClick)
                .selectedItems(this.visibleSeries);

            legend = chart.append("g")
                .attr("class", "ancestry-legend")
                .call(drawLegend);

            let bbox = legend.node().getBoundingClientRect();
            legendHeight = bbox.height; legendWidth = bbox.width;
            if (anchor.x === "outside" && pos.x !== "center") {
                margin[pos.x] += legendOut.right ? legendWidth - 10 : (legendOut.left ? legendWidth - 11 : legendWidth);
            }
            else if(anchor.y === "outside" && pos.y !== "center") {
                margin[pos.y] += legendOut.bottom ? legendHeight - 8 : (legendOut.top ? legendHeight - 11 : legendHeight);
            }
        }

        function legendClick(label) {
            let clicked = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](this);
            if (that.visibleSeries.has(label))
                that.visibleSeries.delete(label);
            else
                that.visibleSeries.add(label);
            clicked.classed("legend-item-selected", that.visibleSeries.has(label));
            clicked.select("rect.shape").attr("fill", that.visibleSeries.has(label) ? that.colours(label) : "white");
            that.render({isNewData: false})
        }

        let initialLabelPosition = labelPositions[0];

        let types = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["j" /* createNodeTypes */])(treeData, layout.nodeTypes, this.defaultNode),
            nodeAttr = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["k" /* createDynamicNodeAttr */])(types, Object.keys(this.defaultNode));

        // check if x axis data is time data
        //let isTimePlot = nodesData[0].x instanceof Date;
        let isTimePlot = false;

        // define x and y axes formats
        let xAxisFormat = isTimePlot ? __WEBPACK_IMPORTED_MODULE_2_d3__["time"].format(layout.xAxis.format || this.defaultTimeFormat) :
                __WEBPACK_IMPORTED_MODULE_2_d3__["format"](layout.xAxis.format || this.defaultScalarFormat),
            yAxisFormat = __WEBPACK_IMPORTED_MODULE_2_d3__["format"](layout.yAxis.format || this.defaultScalarFormat);

        // find extent of input data and calculate margins
        let xExtent = __WEBPACK_IMPORTED_MODULE_2_d3__["extent"](treeData, node => node.x),
            yExtent = __WEBPACK_IMPORTED_MODULE_2_d3__["extent"](treeData, node => node.y);

        if (xExtent[0] === undefined || yExtent[0] === undefined) {
            xExtent[0] = xExtent[1] = 0;
            yExtent[0] = yExtent[1] = 0;
        }

        let xMargin = xExtent[1] != xExtent[0] ? marginRatio.axisX * (xExtent[1] - xExtent[0]) / 2 : 0.5,
            yMargin = yExtent[1] != yExtent[0] ? marginRatio.axisY * (yExtent[1] - yExtent[0]) / 2 : 0.5;

        // add margins to vertical axis data
        yExtent[0] -= yMargin; yExtent[1] += yMargin;
        // and horizontal
        xExtent[0] -= xMargin;xExtent[1] += xMargin;

        height = (layout.height || elementHeight) - margin.top - margin.bottom;

        // define x scale
        let xScale = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleLinear"]() //(isTimePlot ? d3.time.scale() : d3.scaleLinear())
            .domain(xExtent)
            .range([0, width]);

        // define x axis
        let xAxis = __WEBPACK_IMPORTED_MODULE_2_d3__["axisBottom"]()
            .scale(xScale)
            .tickSizeInner(0)
            .tickSizeOuter(0)
            .tickFormat(xAxisFormat);

        // define y scale
        let yScale = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleLinear"]()
            .domain(yExtent)
            .range([height, 0]);

        // define y axis
        let yAxis = __WEBPACK_IMPORTED_MODULE_2_d3__["axisLeft"]()
            .scale(yScale)
            .tickSizeInner(0)
            .tickSizeOuter(0)
            .tickFormat(yAxisFormat);

        // read x and y axes labels
        let xAxisLabel = layout.xAxis.title;
        let yAxisLabel = layout.yAxis.title;

        let mouseCaptureGroup = chart.append("g");

        // render x axis
        let xAxisSVG = chart.append("g")
            .attr("class", "axis x-axis")
            .call(xAxis);

        // rotate tick labels if time plot
        if (isTimePlot) {
            xAxisSVG.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");
        }

        // render x axis label if exists
        let xAxisOffset = chart.selectAll("g.x-axis").node().getBBox().height;
        margin.bottom += xAxisOffset - 3;
        height = layout.height - margin.top - margin.bottom;

        if (xAxisLabel) {
            xAxisLabelSVG = chart.append("text")             // text label for the x axis
                .attr("class", "axis-title")
                .style("text-anchor", "middle")
                .text(xAxisLabel);
        }


        // render y axis
        let yAxisSVG = chart.append("g")
            .attr("class", "axis y-axis")
            .call(yAxis);

        let yAxisOffset = chart.selectAll("g.y-axis").node().getBBox().width;
        margin.left += yAxisOffset;
        width = (layout.width || elementWidth) - margin.right - margin.left;
        //yAxisLabelSVG.attr("y", yAxisOffset - 25);
        xAxisLabelSVG.attr("transform", `translate(${width/2}, ${height + xAxisOffset + 15})`);

        // define node link function
        let nodeLink = function(d) {
            return `M ${d.parent.x} ${d.parent.y} L ${d.x} ${d.y}`;
        };

        colourbar.attr("transform", `translate(${width + colourBarOffset},${(height - layout.heatmap.colourBar.height)/2})`);
        if (layout.legend.show) {
            let pos = layout.legend.position,
                anchor = layout.legend.anchor,
                xOffset = anchor.x === "outside" ? -yAxisOffset - (layout.yAxis.title ? 25 : 0) : 1,
                yOffset = 15 + (layout.xAxis.title ? 15 : 0),
                posX = pos.x === "left" ? xOffset : (pos.x === "right" ? width + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2),
                posY = pos.y === "top" ? 0 : (pos.y === "bottom" ? height - 1 + (anchor.y === "outside" ? yOffset : 0): height / 2);

            legend.attr("transform", `translate(${posX},${posY})`);
        }

        // render chart title
        if (layout.title) {
            titleSVG = chart.append("text")
                .attr("x", (width / 2))
                .attr("y", legendOut.top ? -legendHeight : -10)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text(layout.title);
        }

        this.svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        yScale.range([height, 0]);
        xScale.range([0, width]);

        let labelExtraSpace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["l" /* getExtraSpaceForLabel */])(xScale, maxLabelLength + maxLabelOffset + 5),
            currentDomain = xScale.domain();

        if (labelExtraSpace > 0) {
            xScale.domain([currentDomain[0] - labelExtraSpace, currentDomain[1] + labelExtraSpace]);
        }

        let xScale0 = xScale.copy(),
            yScale0 = yScale.copy();

        xAxis.tickSizeInner(-height);
        yAxis.tickSizeInner(-width);

        xAxisSVG.attr("transform", `translate(0, ${height})`).call(xAxis);
        yAxisSVG.call(yAxis);

        // render y axis label if exists
        if (yAxisLabel) {
            yAxisLabelSVG = chart.append("text")            // text label for the y axis
                .attr("class", "axis-title")
                .attr("transform", "rotate(-90)")
                .attr("y", -yAxisOffset - 10)
                .attr("x",-(height / 2))
                .style("text-anchor", "middle")
                .text(yAxisLabel);
        }


        if (layout.heatmap.enabled && layout.heatmap.colourBar.show) {
            layout.heatmap.colourBar.height = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigHeight, height);
            layout.heatmap.colourBar.width = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigWidth, width);

            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["h" /* drawColourBar */])(colourbar, this.heatmapColourScale.domain(), layout.heatmap, defs, pathname);
            colourbar.attr("transform", `translate(${width + colourBarOffset},${(height - layout.heatmap.colourBar.height)/2})`);
        }

        // apply styles and attributes for png download purposes
        this.svg.selectAll(".tick line").attr("opacity", 0.2).style("shape-rendering", "crispEdges");
        this.svg.selectAll(".tick text").attr("font-size", 12);
        this.svg.selectAll("path.domain").style("shape-rendering", "crispEdges");
        this.svg.selectAll(".axis path, .axis line").attr("stroke", layout.axisColour);

        let mouseRect = mouseCaptureGroup.append("rect")
            .attr("id", "mouse-capture")
            .attr("x", -margin.left)
            .attr("y", -margin.top)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("fill", "transparent");

        // render chart area
        chart.attr("transform", `translate(${margin.left}, ${margin.top})`);

        // define arrowhead
        let marker = defs.append("marker"),
            markerAttrs = {
                "id":"marker-arrowhead",
                "viewBox":"0 -5 10 10",
                "refX":15,
                "refY":0,
                "markerWidth":8,
                "markerHeight":8,
                "orient":"auto"
            };

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(marker, markerAttrs);

        marker.append("path")
            .attr("d", "M0,-4L10,0L0,4")
            .attr("fill", layout.link.stroke)
            .attr("class","arrowHead");

        let clipRectId = `lineage-scatter-clip-rect${__WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("clipPath").size()}`;

        defs.append("svg:clipPath")
            .attr("id", clipRectId)
            .append("svg:rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);

        let nodes = __WEBPACK_IMPORTED_MODULE_2_d3__["tree"]()(__WEBPACK_IMPORTED_MODULE_2_d3__["hierarchy"](root, d => d.children));

        let descendants = nodes.descendants().filter(n => n.parent !== null);
        // Calculate depth positions.
        descendants.forEach(node => {
            node.y = yScale(node.data.y);
            node.x = xScale(node.data.x);
        });

        // render links
        let plotArea = chart.append("g")
            .attr("id", "scatter-plot-area")
            .attr("clip-path", `url(${pathname}#${clipRectId})`)
            .append("g");

        if (layout.heatmap.enabled) {
            this.heatmapCircle = plotArea.append("g")
                .attr("class", "heatmap-layer")
                .selectAll("circle.heatmap-circle")
                .data(descendants.filter(n => !isNaN(parseFloat(n.data.z))))
                .enter()
                .append("circle")
                .attr("class", "heatmap-circle")
                .style("fill", d => this.heatmapColourScale(d.z))
                .style("opacity", layout.heatmap.opacity)
                .attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`);

            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(this.heatmapCircle, layout.heatmap.circle);
        }

        let link = plotArea.append("g")
            .attr("class", "link-layer")
            .selectAll(".link")
            .data(descendants.filter(n => n.parent.data.name != "virtualRoot"))
            .enter()
            .append("svg:path")
            .attr("stroke-dasharray", ("3, 3"))
            .attr("d", conn => {
                return nodeLink(conn);
            })
            .attr("class", "link")
            .attr("marker-end", `url(${pathname}#marker-arrowhead)`);

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(link, layout.link);

        let nodeSvgData = treeData.map(d => {return {data: d};});
        // create node groups
        let node = plotArea.append("g")
            .attr("class", "node-circle-layer")
            .selectAll("g.node")
            .data(descendants)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", node => `translate(${node.x}, ${node.y})`);

        //render node circles
        let circle = node.append("circle")
            .style("stroke", d => this.colours(d.data.series))
            .style("fill", d => !this.selectedNodesSet.has(d.data.name) ? '#FFF' : this.colours(d.data.series))
            .each(function(d) {
                d.bboxCircle = this.getBoundingClientRect();
            });

        if (layout.tooltip.show) {
            circle.on("mouseover", function (d, i) {
                let {x: xPos, y: yPos} = __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["b" /* d3tooltip */].getRelativePosition(this, that.element[0]),
                    seriesBar = layout.tooltip.showSeriesBar ?
                        `<div class="tooltip-colour-box" style=\"background-color: ${that.colours(d.data.series)}\"></div>` : "",
                    text = d.data.tooltip ? d.data.tooltip.map((line) => `<span align="${layout.tooltip.align}" class="tooltip-text">${line}</span>`).join("") :
                        `<span class="tooltip-text">${d.data.name}</span>`;
                that.tooltip.html(seriesBar + text).position([xPos, yPos]).show();
            })
                .on("mouseout", (d) => {
                    this.tooltip.hide();
                });
        }

        toggleNodeClickCallback(true);

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(circle, nodeAttr);

        // render node labels
        let nodeLabel = plotArea.append("g")
            .attr("class", "node-label-layer")
            .selectAll("text.node-label")
            .data(descendants.map(d => {
                return {node: d};
            }))
            .enter()
            .append("text")
            .attr("dy", ".35em")
            .attr("class", "node-label")
            .text(d => d.node.data.name)
            .style("opacity", 1)
            .each(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["n" /* getBBox */])
            .each(d => {
                d.currentLabelPos = initialLabelPosition;
                d.scaledLabelPos = initialLabelPosition;
                d.x = d.node.x + d.scaledLabelPos.x;
                d.y = d.node.y + d.scaledLabelPos.y;
            })
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("text-anchor", d => d.scaledLabelPos['text-anchor']);

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(nodeLabel, layout.nodeLabel);
        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(nodeLabel, initialLabelPosition);

        let linkLabel = plotArea.append("g")
            .attr("class", "link-label-layer")
            .selectAll("text")
            .data(descendants
                .filter(d => d.parent.data.name != "virtualRoot")
                .map(d => {
                return {nodeTo: d};
            }))
            .enter()
            .append("text")
            .attr("class", "link-label")
            .attr("text-anchor", "middle")
            .each(d => {
                d.x = (d.nodeTo.x + d.nodeTo.parent.x) / 2;
                d.y = (d.nodeTo.y + d.nodeTo.parent.y) / 2;
            })
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("dy", ".35em")
            .text(d => d.nodeTo.data.inLinkLabel)
            .style("opacity", 1)
            .each(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["n" /* getBBox */]);

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(linkLabel, layout.linkLabel);

        this.svg.selectAll("text").attr("fill", layout.textColour);

        let maxNodeLabelLength = __WEBPACK_IMPORTED_MODULE_2_d3__["max"](nodeLabel.data().map(d => d.bbox.width)),
            maxNodeLabelHeight = __WEBPACK_IMPORTED_MODULE_2_d3__["max"](nodeLabel.data().map(d => d.bbox.height)),
            maxLinkLabelHeight = __WEBPACK_IMPORTED_MODULE_2_d3__["max"](linkLabel.data().map(d => d.bbox.height)),
            maxLinkLabelLength = __WEBPACK_IMPORTED_MODULE_2_d3__["max"](linkLabel.data().map(d => d.bbox.width)),
            nodeSearchRadius = {x: 2 * maxNodeLabelLength + 10, y: 2 * maxNodeLabelHeight},
            linkSearchRadius = {x: maxLinkLabelLength + 10, y: 2 * maxLinkLabelHeight};

        if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" ||
            layout.labelCollisionDetection.enabled === "onDelay") {
            let order = [[], []];
            order[layout.labelCollisionDetection.order.nodeLabel - 1].push(nodeLabel);
            order[layout.labelCollisionDetection.order.linkLabel - 1].push(linkLabel);
            this.LCD = new __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["o" /* LabelCollisionDetection */]([circle], order, layout.nodeLabelPositions, layout.nodeLabel, width, height, nodeSearchRadius, linkSearchRadius);
            this.LCD.recalculateLabels(__WEBPACK_IMPORTED_MODULE_2_d3__["zoomIdentity"]);
        }

        legend.each(function() { this.parentNode.appendChild(this);});
        titleSVG.each(function() { this.parentNode.appendChild(this);});

        if (layout.groupSelection.enabled) {
            this.selectionRect = mouseCaptureGroup.append("rect")
                .attr("class", "selection-rect");

            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(this.selectionRect, layout.groupSelection.selectionRectangle);
        }

        function mouseDown() {
            __WEBPACK_IMPORTED_MODULE_2_d3__["event"].preventDefault();
            that.mouseStart = __WEBPACK_IMPORTED_MODULE_2_d3__["mouse"](mouseRect.node());
            mouseRect.on("mousemove", mouseMove)
                .on("mouseup", finalizeSelection)
                .on("mouseout", finalizeSelection);
            circle.style("pointer-events", "none");
        }

        function finalizeSelection() {
            that.selectionRect.attr("width", 0);
            updateSelection();
            circle.style("pointer-events", "all");
            mouseRect.on("mousemove", null)
                .on("mouseup", null)
                .on("mouseout", null);
        }

        function click(d) {
            __WEBPACK_IMPORTED_MODULE_2_d3__["event"].preventDefault();
            let n = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](this.parentNode);
            if (!n.classed("selected")) {
                n.classed("selected", true);
                n.select("circle").style("fill", d => that.colours(d.data.series));
            }
            else {
                n.classed("selected", false);
                n.select("circle").style("fill", "#FFF");
            }
            updateSelection();
        }

        function mouseMove() {
            let p = __WEBPACK_IMPORTED_MODULE_2_d3__["mouse"](mouseRect.node());
            let d = {
                x: (p[0] < that.mouseStart[0] ? p[0] : that.mouseStart[0]),
                y: (p[1] < that.mouseStart[1] ? p[1] : that.mouseStart[1]),
                height: Math.abs(p[1] - that.mouseStart[1]),
                width: Math.abs(p[0] - that.mouseStart[0])
            };
            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(that.selectionRect, d);
            selectPoints(that.selectionRect);
        }

        function selectPoints(rect) {
            let rect_x1 = +rect.attr("x"),
                rect_y1 = +rect.attr("y"),
                rect_x2 = +rect.attr("width") + rect_x1,
                rect_y2 = +rect.attr("height") + rect_y1,
                any = false;

            node.each(function(d, i, j) {
                let n = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](this);
                let [tx, ty] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["p" /* getTranslation */])(n.attr("transform"));

                if (tx >= rect_x1 && tx <= rect_x2 && ty >= rect_y1 && ty <= rect_y2) {
                    n.classed("selected", true);
                    n.select("circle").style("fill", d => that.colours(d.data.series));
                    any = true;
                }
                else if(!that.selectedNodesSet.has(d.data.name)) {
                    n.classed("selected", false);
                    n.select("circle").style("fill", "#FFF");
                }
            });

            return any;
        }

        function updateSelection() {
            let wasChange = false;

            that.svg.selectAll("g.node.selected").each(d => {
                if(!that.selectedNodesSet.has(d.data.name)) {
                    that.selectedNodesSet.add(d.data.name);
                    wasChange = true;
                }
            });

            that.svg.selectAll("g.node:not(.selected)").each(d => {
                if(that.selectedNodesSet.has(d.data.name)) {
                    that.selectedNodesSet.delete(d.data.name);
                    wasChange = true;
                }
            });

            if (wasChange && that.selectedNodes) {
                that.selectedNodes({ $nodes: Array.from(that.selectedNodesSet)});
            }
        }

        function toggleNodeClickCallback(active) {
            if (that.nodeClick === undefined) return;

            function nodeClickCallback(d) {
                that.nodeClick({ $event: __WEBPACK_IMPORTED_MODULE_2_d3__["event"], $node: d.data});
            }

            circle.on('click', active ? nodeClickCallback : null);
        }

        let zoom = __WEBPACK_IMPORTED_MODULE_2_d3__["zoom"]()
            .scaleExtent([1, layout.maxZoom])
            .extent([[0, 0],[width, height]])
            .translateExtent([[0, 0],[width, height]])
            .on("zoom", onZoom);

        function onZoom() {
            applyZoom(__WEBPACK_IMPORTED_MODULE_2_d3__["event"].transform);
            if (lcdEnabled) {
                applyLCD(__WEBPACK_IMPORTED_MODULE_2_d3__["event"].transform);
            }
            lastTransform = __WEBPACK_IMPORTED_MODULE_2_d3__["event"].transform;
        }

        function applyZoom(zoomTransform) {
            let scale = zoomTransform.k;
            plotArea.attr("transform", zoomTransform);
            mouseCaptureGroup.attr("transform", zoomTransform);
            xAxisSVG.call(xAxis.scale(zoomTransform.rescaleX(xScale)));
            yAxisSVG.call(yAxis.scale(zoomTransform.rescaleY(yScale)));

            that.svg.selectAll(".tick line").attr("opacity", 0.2).style("shape-rendering", "crispEdges");
            that.svg.selectAll(".tick text").attr("font-size", 12).attr("fill", layout.textColour);
            that.svg.selectAll("path.domain").style("shape-rendering", "crispEdges");
            that.svg.selectAll(".axis line").attr("stroke", layout.axisColour);

            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(circle, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(nodeAttr, scale, true));

            circle.attr("stroke", d => that.colours(d.data.series))
                .each(function (d) {
                    d.bboxCircle = this.getBoundingClientRect();
                });

            if (layout.heatmap.enabled) {
                __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(that.heatmapCircle, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(layout.heatmap.circle, scale));
            }
            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(that.svg.selectAll("path.link"), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(layout.link, scale));
            nodeLabel.each(d => {
                d.scaledLabelPos = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(d.currentLabelPos, scale);
                d.x = d.node.x + d.scaledLabelPos.x;
                d.y = d.node.y + d.scaledLabelPos.y;
            })
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .attr("text-anchor", d => d.scaledLabelPos['text-anchor']);
            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(nodeLabel, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(layout.nodeLabel, scale));

            linkLabel.each(d => {
                d.x = (d.nodeTo.x + d.nodeTo.parent.x) / 2;
                d.y = (d.nodeTo.y + d.nodeTo.parent.y) / 2;
            })
                .attr("x", d => d.x)
                .attr("y", d => d.y);
            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(linkLabel, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(layout.linkLabel, scale));

            if (layout.groupSelection.enabled) {
                __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(that.selectionRect, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* scaleProperties */])(layout.groupSelection.selectionRectangle, scale));
            }
        }

        function onDoubleClick() {
            let I = __WEBPACK_IMPORTED_MODULE_2_d3__["zoomIdentity"];
            chart.call(zoom.transform, I);
            applyZoom(I);
            if (lcdEnabled) {
                applyLCD(I);
            }
            lastTransform = I;
        }

        function applyLCD(transform) {
            if (layout.labelCollisionDetection.enabled === "onEveryChange") {
                that.LCD.recalculateLabels(transform);
            }
            else if (layout.labelCollisionDetection.enabled === "onDelay") {
                that.window.clearTimeout(that.LCDUpdateID);
                that.LCDUpdateID = that.window.setTimeout(() => {
                    that.LCD.recalculateLabels(transform);
                }, layout.labelCollisionDetection.updateDelay);
                that.lastLCDUpdateTime = performance.now();
            }
        }

        let controls = {
            'download': function() {},
            'zoom': toggleZoom,
            'select': toggleSelect,
            'label': toggleLabels
        };
        let activeControls = [];
        if (layout.showLabel) activeControls.push("label");

        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["r" /* createPlotControls */])(this.element[0], controls, activeControls);

        function toggleZoom(toggle) {
            if (toggle) {
                chart.call(zoom)
                    .on('dblclick.zoom', onDoubleClick);
            }
            else {
                chart.on("wheel.zoom", null)
                    .on("mousedown.zoom", null)
                    .on("dblclick.zoom", null)
                    .on("touchstart.zoom", null)
                    .on("touchmove.zoom", null)
                    .on("touchend.zoom", null)
                    .on("touchcancel.zoom", null);
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
            nodeLabel.style("opacity", d => toggle && !d.isColliding ? 1 : 1e-6);
            linkLabel.style("opacity", d => toggle && !d.isColliding ? 1 : 1e-6);
            if (layout.labelCollisionDetection.enabled != "never" && layout.labelCollisionDetection.enabled != "onInit") {
                lcdEnabled = !lcdEnabled;
                if (lcdEnabled) {
                    that.LCD.recalculateLabels(lastTransform);
                }
            }
        }

    }
}

let layoutTemplate = {
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
    xAxis: {
        title: null,
        format: null
    },
    yAxis: {
        title: null,
        format: null
    },
    axisColour: "gray",
    nodeTypes: {},
    nodeLabel: {
        "font-size": 12,
        "font-family": "Roboto,Helvetica Neue,sans-serif"
    },
    linkLabel: {
        "font-size": 12,
        "font-family": "Roboto,Helvetica Neue,sans-serif"
    },
    showLabel: true,
    labelCollisionDetection: {
        enabled: "never",
        updateDelay: 500,
        order: {
            linkLabel: 1,
            nodeLabel: 1
        }
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
        colourScale: [
            [0, '#008ae5'],
            [1, 'yellow']
        ],
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
    },
    nodeLabelPositions: [
        {
            x: 10,
            y: 0,
            "text-anchor": "start"
        },
        {
            x: -10,
            y: 0,
            "text-anchor": "end"
        }
    ]
};

let labelPositions = [
    {
        x: 13,
        y: 0,
        "text-anchor": "start"
    },
    {
        x: -13,
        y: 0,
        "text-anchor": "end"
    }
];

function createLinks(nodes, activeSeries) {
    let filteredNodes = [],
        nodesDict = {},
        parent,
        links = [];

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

    return {nodesData: filteredNodes, links: links};
}

const LineageScatterPlotComponent = {
    template: '',
    controller: LineageScatterPlotController,
    bindings: {
        value: '<',
        selectedNodes: '&',
        nodeClick: '&'
    }
};

LineageScatterPlotController.$$ngIsClass = true; // temporary Firefox fix
/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.module('ancestry.lineage-scatter', [])
    //.directive('lineagePlot', LineagePlotDirective);
    .component('lineageScatterPlot', LineageScatterPlotComponent);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__radial_lineage_plot_css__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__radial_lineage_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__radial_lineage_plot_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_d3__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_d3___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_d3__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shared_features_js__ = __webpack_require__(2);





class RadialLineagePlotController {
    constructor($element, $window) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["a" /* attachActionOnResize */])($window, () => this.render({}));
        $element.addClass("ancestry ancestry-radial-lineage-plot");

        this.svg = __WEBPACK_IMPORTED_MODULE_2_d3__["select"]($element[0])
            .style("position", "relative")
            .append("svg");

        this.colours = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleOrdinal"](__WEBPACK_IMPORTED_MODULE_2_d3__["schemeCategory10"]);
        this.defaultNode = {
            r: 4,
            "stroke-width": 2
        };
        this.labelOffset = 20;
        this.hovering = false;
        this.visibleSeries = new Set();
        this.virtualRoot = null;
        this.virtualRootName = "virtual_root";
        this.element = $element;
        this.window = $window;
    }

    $onChanges(changes) {
        if (changes.value && changes.value.currentValue) {
            this.render({isNewData: true});
        }
    }

    render(options) {
        let that = this;
        // clean svg before rendering plot
        this.svg.selectAll('*').remove();

        let defs = this.svg.append("defs");

        // do not continue rendering if there is no data
        if (!this.value || !this.value.data.length) return;

        let seriesNames = Array.from(new Set(this.value.data.map(d => d.series)));

        if (options.isNewData) {
            this.colours.domain([]);
            this.visibleSeries = new Set(seriesNames);
        }

        let copy = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.copy(this.value),
            layout = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["d" /* mergeTemplateLayout */])(copy.layout, layoutTemplate),
            pathname = this.window.location.pathname;

        let treeData = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["f" /* createTreeLayout */])(filterSeries(copy.data, this.visibleSeries)),
            longestNodeName = copy.data.length ? copy.data.reduce((a, b) => a.name.length > b.name.length ? a : b).name : "";

        let elementWidth = this.element[0].offsetWidth,
            elementHeight = this.element[0].offsetHeight;

        let isMultipleTree = treeData.length > 1,
            multipleTreeOffset = isMultipleTree ? 30 : 0,
            maxLabelLength = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["e" /* testLabelLength */])(this.svg, longestNodeName, layout.outerNodeLabel),
            colourBarOffset = 20,
            start = null,
            rotate = 0,
            rotateOld = 0,
            rotationDifference,
            transitionScale = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleLog"]().domain([1, 181]).range([0, 1500]),
            reorgDuration = 1000,
            prevX = 0,
            heatmapColourScale = null,
            heatmapCircle = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            legendHeight = 0, legendWidth = 0, colourbarHeight = 0, colourbarWidth = 0,
            legendOut = {top:false, right: false, bottom:false, left:false},
            showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
            colourBarOrigWidth = layout.heatmap.colourBar.width, colourBarOrigHeight = layout.heatmap.colourBar.height,
            legend = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            colourbar = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            titleSVG = __WEBPACK_IMPORTED_MODULE_2_d3__["select"]();

        let width = layout.width || elementWidth,
            height = layout.height || elementHeight;

        this.svg.append("rect")
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

        let chart = this.svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        if (layout.heatmap.enabled) {

            let domain = __WEBPACK_IMPORTED_MODULE_2_d3__["extent"](copy.data, node => node.z);

            if (domain[0] == domain[1]) {
                if (domain[0] === undefined) {
                    domain[0] = domain[1] = 0;
                }
                domain[0] -= 0.5;
                domain[1] += 0.5;
            }

            heatmapColourScale = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleLinear"]()
                .domain(domain)
                .range(layout.heatmap.colourScale.map(v => v[1]));

            if (layout.heatmap.colourBar.show) {
                layout.heatmap.colourBar.height = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(layout.heatmap.colourBar.height, height);
                layout.heatmap.colourBar.width = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(layout.heatmap.colourBar.width, width);

                colourbar = chart.append("g")
                    .attr("class", "ancestry-colourbar").attr("transform", "translate(0,0)");

                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["h" /* drawColourBar */])(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

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

            let drawLegend = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["i" /* d3legend */])()
                .splitAfter(splitAfter)
                .position(pos)
                .anchor(anchor)
                .seriesNames(seriesNames)
                .colourScale(this.colours)
                .backgroundColour(layout.legend.backgroundColour || layout.backgroundColour)
                .onClick(legendClick)
                .maxSize({width, height})
                .selectedItems(this.visibleSeries);

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
            let clicked = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](this);
            if (that.visibleSeries.has(label))
                that.visibleSeries.delete(label);
            else
                that.visibleSeries.add(label);
            clicked.classed("legend-item-selected", that.visibleSeries.has(label));
            clicked.select("rect.shape").attr("fill", that.visibleSeries.has(label) ? that.colours(label) : "white");
            that.render({isNewData: false})
        }

        width = (layout.width || elementWidth) - margin.right - margin.left;
        height = (layout.height || elementHeight) - margin.top - margin.bottom;

        let r = Math.min(height, width) / 2,
            totalTreeLength = r - maxLabelLength - this.labelOffset - multipleTreeOffset;

        chart.attr("transform", `translate(${margin.left},${margin.top})`);

        if (layout.legend.show) {
            let pos = layout.legend.position,
                anchor = layout.legend.anchor,
                posX = pos.x === "left" ? width / 2 - r : (pos.x === "right" ? width / 2 + r + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2),
                posY = pos.y === "top" ? height / 2 - r : (pos.y === "bottom" ? height / 2 + r: height / 2);

            legend.attr("transform", `translate(${posX},${posY})`);
        }


        this.virtualRoot = {
            name: that.virtualRootName,
            parent: null,
            children: [],
            treeId: 0,
            _depth: 0,
            type: undefined
        };

        for(let tree of treeData) {
            spreadNodes(tree);
            tree.parent = this.virtualRootName;
            this.virtualRoot.children.push(tree);
        }
        treeData = this.virtualRoot;

        let types = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["j" /* createNodeTypes */])(copy.data, layout.nodeTypes, this.defaultNode),
            nodeAttr = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["k" /* createDynamicNodeAttr */])(types, Object.keys(this.defaultNode));


        let treeLayout = __WEBPACK_IMPORTED_MODULE_2_d3__["cluster"]().size([360, 1]).separation(() => 1),
            treeRoot = __WEBPACK_IMPORTED_MODULE_2_d3__["hierarchy"](treeData, d => d.children).sort((a,b) => b.depth - a.depth),
            nodes = treeLayout(treeRoot),
            descendants = nodes.descendants().filter(n => n.parent != null );

        this.svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("-webkit-backface-visibility", "hidden");

        // Catch mouse events in Safari.
        this.svg.append("rect")
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
            d.y = d.name === that.virtualRootName ? 0 :multipleTreeOffset + d.data._depth * (totalTreeLength);
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
            layout.heatmap.colourBar.height = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigHeight, 2 * r);
            layout.heatmap.colourBar.width = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigWidth, width);

            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["h" /* drawColourBar */])(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
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

            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(heatmapCircle, layout.heatmap.circle);
        }

        let link = vis.selectAll("path.link")
            .data(descendants.filter(n => n.parent.data.name != that.virtualRootName))
            .enter().append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("d", step)
            .each(function(d) {
                d.inLinkNode = this;
                if(d.parent.outLinkNodes) d.parent.outLinkNodes.push(this);
                else d.parent.outLinkNodes = [this];
            });

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(link, layout.link);

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

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(nodeLabel, layout.nodeLabel);
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
            .style("stroke",  d => this.colours(d.data.series));


        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(circle, nodeAttr);
        toggleNodeClickCallback(true);

        let maxLabelHeight = 2 * Math.PI * (multipleTreeOffset + totalTreeLength + this.labelOffset) /
            descendants.filter(d => !d.children || !d.children.length).length;

        layout.outerNodeLabel["font-size"] = __WEBPACK_IMPORTED_MODULE_2_d3__["min"]([layout.outerNodeLabel["font-size"], maxLabelHeight]);

        let label = vis.selectAll("text.outer-label")
            .data(descendants.filter(d => d.x !== undefined && !d.children))
            .enter().append("text")
            .attr("class", "outer-label")
            .attr("dy", ".31em")
            .attr("text-anchor", d => d.x < 180 ? "start" : "end")
            .attr("transform", d => `rotate(${d.x - 90})
                                             translate(${totalTreeLength + this.labelOffset + multipleTreeOffset})
                                             rotate(${d.x < 180 ? 0 : 180})`)
            .text(d => d.data.name);

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(label, layout.outerNodeLabel);

        this.svg.selectAll("text").attr("fill", layout.textColour);

        legend.each(moveToFront);
        titleSVG.each(moveToFront);


        function mouseovered(active) {
            return function(d) {

                that.hovering = active;
                let hoveredNode = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](d.nodeGroupNode);

                hoveredNode.select("text.mouseover-label")
                    .style("opacity", active ? 1 : 1e-6)
                    .attr("transform", active ? `rotate(${-rotate -d.x + 90})` : "rotate(90)");
                hoveredNode.select("rect")
                    .style("opacity", active ? 0.9 : 1e-6)
                    .attr("transform", active ? `rotate(${-rotate -d.x + 90})` : "rotate(90)");

                do {
                    __WEBPACK_IMPORTED_MODULE_2_d3__["select"](d.inLinkNode)
                        .classed("link-active", active)
                        .each(moveToFront);
                    if (d.outLinkNodes) {
                        d.outLinkNodes.forEach(node => __WEBPACK_IMPORTED_MODULE_2_d3__["select"](node).classed("link-affected", active));
                    }
                    __WEBPACK_IMPORTED_MODULE_2_d3__["select"](d.nodeGroupNode)
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
                    __WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("g.node-aligned text.mouseover-label").style("opacity", active ? 1 : 1e-6);
                    __WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("g.node-aligned rect").style("opacity", active ? 0.9 : 1e-6);
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

            __WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("g.node text.mouseover-label").attr("transform", "rotate(90)").style("opacity", 1e-6);
            __WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("g.node rect").attr("transform", "rotate(90)").style("opacity", 1e-6);

            let alignedNotActive = __WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("g.node-aligned:not(.node-active)"),
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

            __WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("g.node-active")
                .classed("node-aligned", true)
                .each((d) => {
                    d._x = d.x;
                    d.x = selectedNode.x;
                })
                .transition()
                .duration(duration)
                .attrTween("transform", tweenNodeGroup);

            __WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("path.link-affected, path.link-displaced")
                .classed("link-displaced", true)
                .transition()
                .duration(duration)
                .attrTween("d", tweenPath);

            __WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("path.link-displaced:not(.link-affected)")
                .classed("link-displaced", false);

            __WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("g.node-aligned text.mouseover-label")
                .transition().style("opacity", 1);

            __WEBPACK_IMPORTED_MODULE_2_d3__["selectAll"]("g.node-aligned rect").style("opacity", 0.9);

            if(rotationDifference > 0) {
                vis.transition()
                    .delay(duration)
                    .duration(transitionScale(rotationDifference + 1))
                    .attr("transform", `translate(${visTranslate[0]},${visTranslate[1]})rotate(${rotate})`)
                    .on("end", function () {
                        __WEBPACK_IMPORTED_MODULE_2_d3__["select"](this).selectAll("text.outer-label")
                            .attr("text-anchor", d => (d.x + rotate) % 360 < 180 ? "start" : "end")
                            .attr("transform", d => `rotate(${d.x - 90})
                                                             translate(${totalTreeLength + that.labelOffset + multipleTreeOffset})
                                                             rotate(${(d.x + rotate) % 360 < 180 ? 0 : 180})`);
                    });
            }

            rotateOld = rotate;
        }

        function toggleNodeClickCallback(active) {
            if (that.nodeClick === undefined) return;

            function nodeClickCallback(d) {
                that.nodeClick({ $event: __WEBPACK_IMPORTED_MODULE_2_d3__["event"], $node: d.data});
            }

            node.on('click', active ? nodeClickCallback : null);
        }

        function mouse(element) { return __WEBPACK_IMPORTED_MODULE_2_d3__["mouse"](element).map((d, i) => d - visTranslate[i]); }

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
            let midSourceX = d.parent._x !== undefined ? __WEBPACK_IMPORTED_MODULE_2_d3__["interpolateNumber"](d.parent._x, d.parent.x) : () => d.parent.x,
                midTargetX = d._x !== undefined ? __WEBPACK_IMPORTED_MODULE_2_d3__["interpolateNumber"](d._x, d.x) : () => d.x,
                midpoints = {x: 0, y: d.y, parent: {x: 0, y:  d.parent.y}};

            return function(t) {
                midpoints.parent.x = midSourceX(t);
                midpoints.x = midTargetX(t);
                return step(midpoints);
            };
        }

        function tweenNodeGroup(d) {
            let midpointX = d._x !== undefined ? __WEBPACK_IMPORTED_MODULE_2_d3__["interpolateNumber"](d._x, d.x) : () => d.x;

            return function(t) {
                let x = midpointX(t);
                return `rotate(${(x - 90)})translate(${d.y})`;
            }
        }

        let controls = {
            'download': function() {},
            'zoom': toggleMove
        };

        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["r" /* createPlotControls */])(this.element[0], controls);

        function toggleMove(toggle) {
            if (toggle) {
                node.on("click", clicked);
                chart.on("mousedown", function () {
                    if (!that.hovering) {
                        that.svg.style("cursor", "move");
                        start = mouse(that.svg.node());
                        __WEBPACK_IMPORTED_MODULE_2_d3__["event"].preventDefault();
                    }
                })
                    .on("mouseup", function () {
                        if (start && !that.hovering) {
                            that.svg.style("cursor", "auto");
                            let m = mouse(that.svg.node());
                            rotate += Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                            if (rotate > 360) rotate %= 360;
                            else if (rotate < 0) rotate = (360 + rotate) % 360;
                            start = null;
                            vis.attr("transform", `translate(${visTranslate[0]},${visTranslate[1]})rotate(${rotate})`)
                                .selectAll("text.outer-label")
                                .attr("text-anchor", d=> (d.x + rotate) % 360 < 180 ? "start" : "end")
                                .attr("transform", d => `rotate(${d.x - 90})
                                                             translate(${totalTreeLength + that.labelOffset + multipleTreeOffset})
                                                             rotate(${(d.x + rotate) % 360 < 180 ? 0 : 180})`);
                        }
                    })
                    .on("mousemove", function () {
                        if (start) {
                            let m = mouse(that.svg.node());
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


const RadialLineagePlotComponent = {
    template: '',
    controller: RadialLineagePlotController,
    bindings: {
        value: '<',
        nodeClick: '&'
    }
};

RadialLineagePlotController.$$ngIsClass = true; // temporary Firefox fix
/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.module('ancestry.radial-lineage', [])
    .component('radialLineagePlot', RadialLineagePlotComponent);


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__radial_phylogenetic_tree_css__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__radial_phylogenetic_tree_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__radial_phylogenetic_tree_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_d3__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_d3___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_d3__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shared_features_js__ = __webpack_require__(2);






class RadialPhylogeneticTreeController {
    constructor($element, $window) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["a" /* attachActionOnResize */])($window, () => this.render({}));
        $element.addClass("ancestry ancestry-radial-phylogenetic-tree");

        this.svg = __WEBPACK_IMPORTED_MODULE_2_d3__["select"]($element[0])
            .style("position", "relative")
            .append("svg");

        this.colours = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleOrdinal"](__WEBPACK_IMPORTED_MODULE_2_d3__["schemeCategory10"]);
        this.defaultNode = {
            r: 4,
            "stroke-width": 2
        };
        this.labelOffset = 20;
        this.hovering = false;
        this.visibleSeries = new Set();
        this.virtualRoot = null;
        this.virtualRootName = "virtual_root";
        this.link = null;
        this.node = null;
        this.linkExtension = null;
        this.totalTreeLength = null;
        this.multipleTreeOffset = 0;
        this.element = $element;
        this.window = $window;
    }

    $onChanges(changes) {
        if (changes.value && changes.value.currentValue) {
            this.render({isNewData: true});
        }
        if (changes.branchlength) {
            let that = this;
            let show = changes.branchlength.currentValue;
            if (!this.linkExtension || !this.link || !this.totalTreeLength) return;
            __WEBPACK_IMPORTED_MODULE_2_d3__["transition"]().duration(750).each(function() {
                that.linkExtension.transition().attr("d", d => step2(d.x, show ? d.data.radius : d.y, d.x, that.totalTreeLength + that.multipleTreeOffset));
                that.link.transition().attr("d", d =>  step2(d.parent.x, show ? d.parent.data.radius : d.parent.y, d.x, show ? d.data.radius : d.y));
            });
        }
    }

    render(options) {
        let that = this;
        // clean svg before rendering plot
        this.svg.selectAll('*').remove();

        let defs = this.svg.append("defs");

        // do not continue rendering if there is no data
        if (!this.value || !this.value.data.length) return;

        let seriesNames = Array.from(new Set(extractProp(this.value.data, "series")));

        if (options.isNewData) {
            this.colours.domain([]);
            this.visibleSeries = new Set(seriesNames);
        }

        let copy = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.copy(this.value),
            treeData = copy.data,
            layout = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["d" /* mergeTemplateLayout */])(copy.layout, layoutTemplate),
            pathname = this.window.location.pathname;

        let elementWidth = this.element[0].offsetWidth,
            elementHeight = this.element[0].offsetHeight;

        treeData = treeData.map(t => collapseSeries(t, this.visibleSeries)).filter(t => t !== null);

        let isMultipleTree = treeData.length > 1,
            longestNodeName = treeData.length ? extractProp(treeData, "name")
                .reduce((a, b) => a.length > b.length ? a : b) : "",
            maxLabelLength = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["e" /* testLabelLength */])(this.svg, longestNodeName, layout.outerNodeLabel),
            colourBarOffset = 20,
            start = null,
            rotate = 0,
            heatmapColourScale = null,
            heatmapCircle = null,
            nodeCircle = null,
            trees = null,
            legendHeight = 0, legendWidth = 0, colourbarHeight = 0, colourbarWidth = 0,
            legendOut = {top: false, right: false, bottom: false, left: false},
            colourBarOrigWidth = layout.heatmap.colourBar.width, colourBarOrigHeight = layout.heatmap.colourBar.height,
            showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
            legend = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            colourbar = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](),
            titleSVG = __WEBPACK_IMPORTED_MODULE_2_d3__["select"]();

        let width = layout.width || elementWidth,
            height = layout.height || elementHeight;

        this.svg.append("rect")
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

        let chart = this.svg.append("g");

        this.multipleTreeOffset = isMultipleTree ? 30 : 0;

        if (layout.heatmap.enabled) {

            let domain = __WEBPACK_IMPORTED_MODULE_2_d3__["extent"](extractProp(treeData, "z").filter(d => !!d));

            if (domain[0] == domain[1]) {
                if (domain[0] === undefined) {
                    domain[0] = domain[1] = 0;
                }
                domain[0] -= 0.5;
                domain[1] += 0.5;
            }

            heatmapColourScale = __WEBPACK_IMPORTED_MODULE_2_d3__["scaleLinear"]()
                .domain(domain)
                .range(layout.heatmap.colourScale.map(v => v[1]));

            if (layout.heatmap.colourBar.show) {
                layout.heatmap.colourBar.height = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(layout.heatmap.colourBar.height, height);
                layout.heatmap.colourBar.width = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(layout.heatmap.colourBar.width, width);

                colourbar = chart.append("g")
                    .attr("class", "ancestry-colourbar").attr("transform", "translate(0,0)");

                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["h" /* drawColourBar */])(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);

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

            let drawLegend = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["i" /* d3legend */])()
                .splitAfter(splitAfter)
                .position(pos)
                .anchor(anchor)
                .seriesNames(seriesNames)
                .colourScale(this.colours)
                .backgroundColour(layout.legend.backgroundColour || layout.backgroundColour)
                .onClick(legendClick)
                .maxSize({width, height})
                .selectedItems(this.visibleSeries);

            legend = chart.append("g")
                .attr("class", "ancestry-legend")
                .call(drawLegend);

            let bbox = legend.node().getBoundingClientRect();
            legendHeight = bbox.height;
            legendWidth = bbox.width;
            if (anchor.x === "outside" && pos.x !== "center") {
                margin[pos.x] += legendOut.right ? legendWidth - 10 : (legendOut.left ? legendWidth - 11 : legendWidth);
            }
            else if (anchor.y === "outside" && pos.y !== "center") {
                margin[pos.y] += legendOut.bottom ? legendHeight - 11 : (legendOut.top ? legendHeight - 11 : legendHeight);
            }
        }

        function legendClick(label) {
            let clicked = __WEBPACK_IMPORTED_MODULE_2_d3__["select"](this);
            if (that.visibleSeries.has(label))
                that.visibleSeries.delete(label);
            else
                that.visibleSeries.add(label);
            clicked.classed("legend-item-selected", that.visibleSeries.has(label));
            clicked.select("rect.shape").attr("fill", that.visibleSeries.has(label) ? that.colours(label) : "white");
            that.render({isNewData: false})
        }

        width = (layout.width || elementWidth) - margin.right - margin.left;
        height = (layout.height || elementHeight) - margin.top - margin.bottom;

        let r = Math.min(height, width) / 2;

        this.totalTreeLength = r - maxLabelLength - this.labelOffset - this.multipleTreeOffset;

        chart.attr("transform", `translate(${margin.left},${margin.top})`);

        if (layout.legend.show) {
            let pos = layout.legend.position,
                anchor = layout.legend.anchor,
                posX = pos.x === "left" ? width / 2 - r : (pos.x === "right" ? width / 2 + r + (anchor.x === "outside" ? colourBarOffset + colourbarWidth : 0) : width / 2),
                posY = pos.y === "top" ? height / 2 - r : (pos.y === "bottom" ? height / 2 + r : height / 2);

            legend.attr("transform", `translate(${posX},${posY})`);
        }

        if (isMultipleTree) {
            this.virtualRoot = {
                name: that.virtualRootName,
                parent: null,
                children: [],
                series: 0,
                _depth: 0,
                length: 0,
                type: undefined
            };

            for (let tree of treeData) {
                spreadNodes(tree);
                tree.parent = this.virtualRootName;
                this.virtualRoot.children.push(tree);
            }
            trees = this.virtualRoot;
        }
        else if (treeData.length) {
            trees = treeData[0];
            spreadNodes(trees);
        }

        let types = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["j" /* createNodeTypes */])(treeData, layout.nodeTypes, this.defaultNode),
            nodeAttr = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["k" /* createDynamicNodeAttr */])(types, Object.keys(this.defaultNode));


        let treeLayout = __WEBPACK_IMPORTED_MODULE_2_d3__["cluster"]().size([360, 1]).separation(() => 1),
            treeRoot = __WEBPACK_IMPORTED_MODULE_2_d3__["hierarchy"](trees, d => d.children).sort((a, b) => b.depth - a.depth),
            nodes = treeLayout(treeRoot),
            descendants = nodes.descendants().filter(n => n.parent != null);

        this.svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("-webkit-backface-visibility", "hidden");

        // Catch mouse events in Safari.
        this.svg.append("rect")
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
            d.y = d.name === that.virtualRootName ? 0 : that.multipleTreeOffset + d.data._depth * (that.totalTreeLength);
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
            layout.heatmap.colourBar.height = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigHeight, 2 * r);
            layout.heatmap.colourBar.width = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* calcColourBarSize */])(colourBarOrigWidth, width);

            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["h" /* drawColourBar */])(colourbar, heatmapColourScale.domain(), layout.heatmap, defs, pathname);
            colourbar.attr("transform", `translate(${width / 2 + r + colourBarOffset},${(height - layout.heatmap.colourBar.height) / 2})`);
        }

        if (layout.heatmap.enabled) {
            heatmapCircle = vis.append("g")
                .attr("class", "heatmap-layer")
                .selectAll("circle.heatmap-circle")
                .data(descendants.filter(n => n.data.taxon && n.data.taxon.name !== null && !isNaN(parseFloat(n.data.taxon.z))))
                .enter()
                .append("circle")
                .attr("class", "heatmap-circle")
                .style("fill", d => heatmapColourScale(d.data.taxon.z))
                .style("opacity", layout.heatmap.opacity)
                .attr("transform", d => `rotate(${d.x - 90})translate(${d.y})`);

            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(heatmapCircle, layout.heatmap.circle);
        }

        if (treeData.length) {
            removeNegativeLengths(trees);
            setRadius(trees, trees.length = 0, this.totalTreeLength / maxLength(trees));
        }

        let show = this.branchlength !== undefined ? this.branchlength : true;
        this.linkExtension = vis.append("g")
            .selectAll("path")
            .data(descendants.filter(d => !d.children))
            .enter().append("path")
            .attr("stroke", "black")
            .style("opacity", 0.2)
            .attr("class", "link-extension")
            .each(function (d) {
                d.linkExtensionNode = this;
            })
            .attr("d", d => step2(d.x, show ? d.data.radius : d.y, d.x, this.totalTreeLength + this.multipleTreeOffset));

        this.link = vis.append("g")
            .selectAll("path")
            .data(descendants.filter(n => n.parent.data.name != this.virtualRootName))
            .enter().append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .each(function (d) {
                d.linkNode = this;
            })
            .attr("d", d =>  step2(d.parent.x, show ? d.parent.data.radius : d.parent.y, d.x, show ? d.data.radius : d.y))
            .style("stroke", "black");

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(this.link, layout.link);

        if (isMultipleTree) {
            this.link.filter(d => d.parent.name === this.virtualRootName).style("opacity", 0);
        }

        if (layout.showLeafNodes) {
            this.node = vis.selectAll("g.node")
                .data(descendants.filter(d => !d.children || !d.children.length))
                .enter().append("g")
                //.attr("id", d => d.name)
                .attr("class", "node")
                .attr("transform", d => `rotate(${d.x - 90})translate(${d.y})`)
                .on("mouseover", mouseovered(true))
                .on("mouseout", mouseovered(false))
                .each(function (d) {
                    d.nodeGroupNode = this;
                });

            this.node.filter(d => !d.data.taxon)
                .style("opacity", 0);

            nodeCircle = this.node.append("circle")
                .attr("fill", "white")
                .style("stroke", d => d.data.taxon && d.data.name !== this.virtualRootName ? this.colours(d.data.taxon.series) : "none");

            toggleNodeClickCallback(true);

            __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(nodeCircle, nodeAttr);
        }

        let maxLabelHeight = 2 * Math.PI * (this.multipleTreeOffset + this.totalTreeLength + this.labelOffset) /
            descendants.filter(d => !d.children || !d.children.length).length;

        layout.outerNodeLabel["font-size"] = __WEBPACK_IMPORTED_MODULE_2_d3__["min"]([layout.outerNodeLabel["font-size"], maxLabelHeight]);

        let label = vis.selectAll("text.outer-label")
            .data(descendants.filter(d => !!d.data.taxon))
            .enter().append("text")
            .attr("class", "outer-label")
            .attr("dy", ".31em")
            .attr("text-anchor", d => d.x < 180 ? "start" : "end")
            .attr("transform", d => `rotate(${d.x - 90})
                                             translate(${this.totalTreeLength + this.labelOffset + this.multipleTreeOffset})
                                             rotate(${d.x < 180 ? 0 : 180})`)
            .text(d => d.data.taxon.name)
            .on("mouseover", mouseovered(true))
            .on("mouseout", mouseovered(false));

        __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* multiAttr */].call(label, layout.outerNodeLabel);

        this.svg.selectAll("text").attr("fill", layout.textColour);

        legend.each(moveToFront);
        titleSVG.each(moveToFront);

        function mouseovered(active) {
            return function (d) {
                __WEBPACK_IMPORTED_MODULE_2_d3__["select"](this).classed("label-active", active);
                __WEBPACK_IMPORTED_MODULE_2_d3__["select"](d.linkExtensionNode).classed("link-extension-active", active).each(moveToFront);
                do __WEBPACK_IMPORTED_MODULE_2_d3__["select"](d.linkNode).classed("link-active", active).each(moveToFront); while (d = d.parent);
            };
        }

        function toggleNodeClickCallback(active) {
            if (that.nodeClick === undefined || nodeCircle == null) return;

            function nodeClickCallback(d) {
                that.nodeClick({$event: __WEBPACK_IMPORTED_MODULE_2_d3__["event"], $node: d.data});
            }

            nodeCircle.on('click', active ? nodeClickCallback : null);
        }

        let controls = {
            'download': function () {
            },
            'zoom': toggleMove
        };

        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["r" /* createPlotControls */])(this.element[0], controls);

        function toggleMove(toggle) {
            if (toggle) {
                chart.on("mousedown", function () {
                    if (!that.hovering) {
                        that.svg.style("cursor", "move");
                        start = mouse(that.svg.node());
                        __WEBPACK_IMPORTED_MODULE_2_d3__["event"].preventDefault();
                    }
                })
                    .on("mouseup", function () {
                        if (start && !that.hovering) {
                            that.svg.style("cursor", "auto");
                            let m = mouse(that.svg.node());
                            rotate += Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
                            if (rotate > 360) rotate %= 360;
                            else if (rotate < 0) rotate = (360 + rotate) % 360;
                            start = null;
                            vis.attr("transform", `translate(${visTranslate[0]},${visTranslate[1]})rotate(${rotate})`)
                                .selectAll("text.outer-label")
                                .attr("text-anchor", d=> (d.x + rotate) % 360 < 180 ? "start" : "end")
                                .attr("transform", d => `rotate(${d.x - 90})
                                                             translate(${that.totalTreeLength + that.labelOffset + that.multipleTreeOffset})
                                                             rotate(${(d.x + rotate) % 360 < 180 ? 0 : 180})`);
                        }
                    })
                    .on("mousemove", function () {
                        if (start) {
                            let m = mouse(that.svg.node());
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

        function mouse(element) {
            return __WEBPACK_IMPORTED_MODULE_2_d3__["mouse"](element).map((d, i) => d - visTranslate[i]);
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

        function setRadius(d, y0, k) {
            d.radius = (y0 += d.length) * k + that.multipleTreeOffset;
            if (d.children && d.children.length > 0) d.children.forEach(d => setRadius(d, y0, k));
        }

        function removeNegativeLengths(d) {
            if (d.length < 0) d.length = 0;
            if (d.children && d.children.length > 0) d.children.forEach(removeNegativeLengths);
        }

        function maxLength(d) {
            return d.length + (d.children && d.children.length > 0 ? __WEBPACK_IMPORTED_MODULE_2_d3__["max"](d.children, maxLength) : 0);
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
    }
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
    backgroundColour: "none",
    textColour: "black",
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


const RadialPhylogeneticTreeComponent = {
    template: '',
    controller: RadialPhylogeneticTreeController,
    bindings: {
        branchlength: '<',
        value: '<',
        nodeClick: '&'
    }
};

RadialPhylogeneticTreeController.$$ngIsClass = true; // temporary Firefox fix
/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.module('ancestry.radial-phylogenetic-tree', [])
    .component('radialPhylogeneticTree', RadialPhylogeneticTreeComponent);



/***/ }),
/* 7 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = SVG2Bitmap;
/*
SVG2Bitmap
The MIT License (MIT)

Copyright (c) 2016 Kaiido

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
function SVG2Bitmap(svg, receiver, params) {

    "use strict";

    // check-in
    if (!params) {
        params = {};
    }
    if (!params.scale || params.scale < 0) {
        params.scale = 1;
    }

    if (!svg || !svg.nodeName) {
        console.error('Wrong arguments : should be \n SVG2Bitmap(SVGElement, function([canvasElement],[dataURL]) || IMGElement || CanvasElement [, {parameters})');
        return;
    }

    // in case user passed a framed svg
    var frame;
    // for both <iframe> and <embed>, we can try to wait for the load event
    var loadHandler = function() {
        // remove our handler
        this.removeEventListener('load', loadHandler);
        // recall the function
        SVG2Bitmap(this, receiver, params);
    };

    if (svg.nodeName === "OBJECT" || svg.nodeName === "IFRAME") {
        if (!svg.contentDocument || (svg.contentDocument.readyState === 'complete' && !svg.contentDocument.documentElement)) {
            console.error('Unable to access the svg node : make sure it comes from the same domain or that the container has finished loading');
            return;
        }
        // we can add a loadHandler to iframe elements, so we do it
        if (svg.contentDocument.readyState !== 'complete') {
            svg.addEventListener('load', loadHandler);
            return;
        }
        // keep it somewhere so we can replace it further
        frame = svg;
        svg = svg.contentDocument.documentElement;

    } else if (svg.nodeName === 'EMBED' && svg.getSVGDocument) {
        frame = svg;
        svg = svg.getSVGDocument();
        if (!svg) {
            frame.addEventListener('load', loadHandler);
            frame.onerror = function() {
                console.error('Unable to access the svg node : make sure it comes from the same domain or that the container has finished loading');
            };
            frame.src = frame.src;
            return;
        }
    }

    // the element passed is not an svg element
    if (svg.nodeName !== 'svg') {
        // get the first one in its content
        var target = svg.querySelector('svg');
        if (!target) {
            var qS = '[src*=".svg"]';
            var obj = svg.querySelector('iframe'+qS+', embed'+qS) || svg.querySelector('object[data*=".svg"]');
            if(obj){
                SVG2Bitmap(obj, receiver, params);
                return;
            }
            console.error('unable to access the svg node, make sure it has been appended to the document');
            return;
        }else{
            svg = target;
        }
    }


    var xlinkNS = "http://www.w3.org/1999/xlink",
        svgNS = 'http://www.w3.org/2000/svg';

    // avoid modifying the original one
    var clone = svg.cloneNode(true);

    var defs;
    var getDef = function() {
        // Do we have a `<defs>` element already ?
        defs = clone.querySelector('defs') || document.createElementNS(svgNS, 'defs');
        if (!defs.parentNode) {
            clone.insertBefore(defs, clone.firstElementChild);
        }
    };

    // an object to do some various tests
    var tester = (function() {
        // check if the canvas is tainted
        var tCanvas = document.createElement('canvas');
        var tCtx = tCanvas.getContext('2d');
        tCanvas.width = tCanvas.height = 1;
        var isTainted = function(canvas) {
            var tainted = false;
            tCtx.drawImage(canvas, 0, 0);
            try {
                tCanvas.toDataURL();
            } catch (e) {
                tainted = true;
                tCanvas = tCanvas.cloneNode(true);
                tCtx = tCanvas.getContext('2d');
            }
            return tainted;
        };
        var doc = document.implementation.createHTMLDocument('test');
        var base = document.createElement('base');
        doc.head.appendChild(base);
        var anchor = document.createElement('a');
        doc.body.appendChild(anchor);
        var URL = function(url, baseIRI) {
            base.href = baseIRI;
            anchor.href = url;
            return anchor;
        };
        return {
            isTainted: isTainted,
            URL: URL
        };
    })();

    // a simple flag used for some edge cases with dirty nameSpace declarations
    var cleanedNS = false;
    // The final function that will export our svgNode to our receiver

    var exportDoc = function() {
        // check if our svgNode has width and height properties set to absolute values
        // otherwise, canvas won't be able to draw it
        var bbox = frame ? frame.getBoundingClientRect() : svg.getBoundingClientRect();

        if (svg.width.baseVal.unitType !== 1) {
            clone.setAttribute('width', bbox.width);
        }

        if (svg.height.baseVal.unitType !== 1) {
            clone.setAttribute('height', bbox.height);
        }

        // serialize our node
        var svgData;
        // detect IE, that's dirty...
        if(typeof ActiveXObject !== 'undefined'){
            // IE's XMLSerializer mess around with non-default namespaces,
            // no way to catch it ; we make the removal default then...
            var cleanNS = function(el) {
                var attr = Array.prototype.slice.call(el.attributes);

                for (var i = 0; i < attr.length; i++) {
                    var name = attr[i].name;
                    if (name.indexOf(':') > -1 && name.indexOf('xlink') < 0){
                        el.removeAttribute(name);
                    }
                }
            };
            cleanNS(clone);
            var children = clone.querySelectorAll('*');
            for (var i = 0; i < children.length; i++) {
                cleanNS(children[i]);
            }
        }

        // we don't need the style attribute of the clone since we'll use the one from the original node
        // Thus, it can create bad things with absolutely positioned elements.
        clone.removeAttribute('style');

        svgData = (new XMLSerializer()).serializeToString(clone);

        var svgURL = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgData);

        var svgImg = new Image();

        var load_handler = function() {

            // if we set a canvas as receiver, then use it
            // otherwise create a new one
            var canvas = (receiver && receiver.nodeName === 'CANVAS') ? receiver : document.createElement('canvas');

            // keep a reference of the original node into our canvas
            canvas.originalSVG = frame || svg;

            // IE11 doesn't set a width on svg images...
            canvas.width = bbox.width * params.scale;
            canvas.height = bbox.height * params.scale;

            if (!canvas.width || !canvas.height) {
                console.error('The document is not visible and can not be rendered');
                return;
            }
            var ctx = canvas.getContext('2d');
            if (params.backgroundColor) {
                ctx.fillStyle = params.backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            var s = params.scale;
            var innerRect = frame ? svg.getBoundingClientRect() : {top: 0,left: 0};

            // strange bug in IE11 where it seems the image isn't loaded the first time...
            try{
                ctx.drawImage(this, innerRect.left, innerRect.top, this.width * s || canvas.width, this.height * s || canvas.height);
            }catch(e){
                setTimeout(load_handler.bind(this), 200);
            }
            // a default function to replace the svg element with the bitmap version
            if (!receiver) {
                receiver = function(c) {
                    var original = frame || svg;
                    original.parentNode.replaceChild(c, original);
                };
            }

            if (tester.isTainted(canvas)) {
                console.warn("Your browser has tainted the canvas.");
                if (receiver.nodeName === 'IMG') {
                    receiver.parentNode.replaceChild(canvas, receiver);
                } else {
                    // make the canvas looks like the svg
                    canvas.setAttribute('style', getSVGStyles(canvas));
                    // a container element
                    if (receiver !== canvas && receiver.appendChild) {
                        receiver.appendChild(canvas);
                    }
                    // if we did set a function
                    else if (typeof receiver === 'function') {
                        receiver(canvas, null);
                    }
                }
                return;
            }

            if (receiver.nodeName === 'IMG') {
                // make the img looks like the svg
                receiver.setAttribute('style', getSVGStyles(receiver));
                receiver.src = canvas.toDataURL(params.type, params.quality);
            } else {
                // make the canvas looks like the svg
                canvas.setAttribute('style', getSVGStyles(canvas));
                // a container element
                if (receiver !== canvas && receiver.appendChild) {
                    receiver.appendChild(canvas);
                }
                // if we did set a function
                else if (typeof receiver === 'function') {
                    receiver(canvas, canvas.toDataURL(params.type, params.quality));
                }
            }
        };

        var error_handler = function(e) {
            console.error("Couldn't export svg, please check that the svgElement passed is a valid svg document.");
            return;
        };

        svgImg.onload = load_handler;
        svgImg.onerror = error_handler;

        svgImg.src = svgURL;

    };
    // get all the rules applied to our svg elements 
    var parseStyles = function() {
        var cssIRIs = [],
            styleSheets = [];
        var i;
        // get the stylesheets of the document (ownerDocument in case svg is in <iframe> or <object>)
        var docStyles = svg.ownerDocument.styleSheets;

        // transform the live StyleSheetList to an array to avoid endless loop
        for (i = 0; i < docStyles.length; i++) {
            styleSheets.push(docStyles[i]);
        }

        if (styleSheets.length) {
            getDef();
            svg.matches = svg.matches || svg.webkitMatchesSelector || svg.mozMatchesSelector || svg.msMatchesSelector || svg.oMatchesSelector;
        }

        // iterate through all document's stylesheets
        for (i = 0; i < styleSheets.length; i++) {
            var currentStyle = styleSheets[i]

            var rules;
            try {
                rules = currentStyle.cssRules;
            } catch (e) {
                continue;
            }
            // create a new style element
            var style = document.createElement('style');
            // some stylesheets can't be accessed and will throw a security error
            var l = rules && rules.length;
            // iterate through each cssRules of this stylesheet
            for (var j = 0; j < l; j++) {
                // get the selector of this cssRules
                var selector = rules[j].selectorText;
                // probably an external stylesheet we can't access
                if(!selector){
                    continue;
                }
                selector = selector.replace(/:/g,'\\:');
                // is it our svg node or one of its children ?
                var matchesTest;
                try {
                    matchesTest = svg.querySelector(selector);
                } catch (e) {
                    continue;
                }
                if ((svg.matches && svg.matches(selector)) || matchesTest) {

                    var cssText = rules[j].cssText;

                    var reg = new RegExp(/url\((.*?)\)/g);
                    var matched = [];
                    while ((matched = reg.exec(cssText)) !== null) {
                        var ext = matched[1].replace(/\"/g, '');
                        var href = currentStyle.href || location.href;
                        cssIRIs.push([ext, href]);
                        var a = tester.URL(ext, href);
                        var iri = (href===location.href && ext.indexOf('.svg')<0)? a.hash : a.href.substring(a.href.lastIndexOf('/') + 1);
                        var newId = '#' + iri.replace(/\//g, '_').replace(/\./g, '_').replace('#', '_');
                        cssText = cssText.replace(ext, newId);
                    }
                    // append it to our <style> node
                    style.innerHTML += cssText + '\n';
                }
            }
            // if we got some rules
            if (style.innerHTML) {
                // append the style node to the clone's defs
                defs.appendChild(style);
            }
        }
        // small hack to avoid border and margins being applied inside the <img>
        var s = clone.style;
        s.border = s.padding = s.margin = 0;
        s.transform = 'initial';

        parseXlinks(cssIRIs);
    };

    var getSVGStyles = function(node) {

        // create a testing element
        var dest = node.cloneNode(true);

        // insert the clone in the document if the parentNode is not a Document.
        if (!svg.parentNode.documentElement) {
            svg.parentNode.insertBefore(dest, svg);
        } else {
            svg.parentNode.documentElement.appendChild(dest);
        }

        // get the destination's computed styles
        var dest_comp = getComputedStyle(dest);
        // get the iframe or svg's computed styles
        var svg_comp = getComputedStyle(frame || svg);
        var mods = "";
        for (var i = 0; i < svg_comp.length; i++) {
            // the witdh and height are set from bbox so we should not need this
            // also, this allows us to scale the export
            if (svg_comp[i] === 'width' || svg_comp[i] === 'height') {
                continue;
            }
            // different styles
            if (svg_comp[svg_comp[i]] !== dest_comp[svg_comp[i]]) {
                // append it
                mods += svg_comp[i] + ':' + svg_comp[svg_comp[i]] + ';';
            }
        }
        // remove our testing element
        dest.parentNode.removeChild(dest);
        return mods;
    };

    var parseImages = function() {

        var images = clone.querySelectorAll('image'),
            total = images.length,
            encoded = 0,
            i;

        // if there is no <image> element
        if (total === 0) {
            exportDoc();
            return;
        }
        // get the already appended images bounding rect
        var originalImages = [];
        var oImg = svg.querySelectorAll('image');
        for (i = 0; i < images.length; i++) {
            // that should be the same ones but better to check
            if (oImg[i] && oImg[i].isEqualNode(images[i])) {
                originalImages.push(oImg[i]);
                continue;
            } else {
                var found = null;
                for (var j = 0; j < oImg.length; j++) {
                    if (oImg[j].isEqualNode(images[i])) {
                        found = oImg[j];
                        break;
                    }
                }
                originalImages.push(found);
            }
        }

        // that's quite a bit of lines, but it saves a lot of computations if we do treat large images
        var preserveAspectRatio = function(source, destination, userString) {

            var srcWidth = source.width,
                srcHeight = source.height,
                destinationW = destination.width,
                destinationH = destination.height;

            // we should keep the whole source
            var aRMeet = function(args) {

                var srcRatio = (srcHeight / srcWidth),
                    destRatio = (destinationH / destinationW),

                    resultWidth = destRatio > srcRatio ? destinationW : destinationH / srcRatio,
                    resultHeight = destRatio > srcRatio ? destinationW * srcRatio : destinationH;

                var getPos = function(arg, res, dest) {

                    var max = Math.max(res, dest),
                        min = Math.min(res, dest);

                    switch (arg) {
                        case 'Min': return 0;
                        case 'Mid': return (max - min) / 2;
                        case 'Max': return max - min;
                        default:    return 'invalid';
                    }
                };

                var obj = [
                    returnedImg,
                    0,
                    0,
                    srcWidth,
                    srcHeight,
                    getPos(args[0], resultWidth, destinationW),
                    getPos(args[1], resultHeight, destinationH),
                    resultWidth,
                    resultHeight
                ];

                if (obj[5] === 'invalid' || obj[6] === 'invalid') {
                    return default_obj;
                }

                return obj;
            };

            // we should slice the larger part
            var aRSlice = function(args) {

                var resultWidth, resultHeight;

                var a = function() {
                    resultWidth = destinationW;
                    resultHeight = srcHeight * destinationW / srcWidth;
                };

                var b = function() {
                    resultWidth = srcWidth * destinationH / srcHeight;
                    resultHeight = destinationH;
                };

                if (destinationW > destinationH) {
                    a();
                    if (destinationH > resultHeight) {
                        b();
                    }
                } else if (destinationW === destinationH) {
                    if (srcWidth > srcHeight) {
                        b();
                    } else {
                        a();
                    }
                } else {
                    b();
                    if (destinationW > resultWidth) {
                        a();
                    }
                }

                var getPos = function(arg, res, dest, src) {
                    switch (arg) {
                        case 'Min': return 0;
                        case 'Mid': return (res - dest) / 2 * src / res;
                        case 'Max': return (res - dest) * src / res;
                        default:    return 'invalid';
                    }
                };

                var x = getPos(args[0], resultWidth, destinationW, srcWidth);
                var y = getPos(args[1], resultHeight, destinationH, srcHeight);

                var obj = [
                    returnedImg,
                    x,
                    y,
                    srcWidth - x,
                    srcHeight - y,
                    0,
                    0,
                    resultWidth - (x * (resultWidth / srcWidth)),
                    resultHeight - (y * (resultHeight / srcHeight)),
                ];

                if (obj[1] === 'invalid' || obj[2] === 'invalid') {
                    return default_obj;
                }

                return obj;
            };

            // check if the object passed was drawable over a canvas
            var returnedImg = source.nodeName === 'IMG' || source.nodeName === 'VIDEO' || source.nodeName === 'CANVAS' ? source : null;

            // if an invalid string or none is set as the preserveAspectRatio, this should be considered as "xMidYMid meet"
            var default_obj = aRMeet(['Mid', 'Mid']);

            if (!userString) {
                return default_obj;
            } else {

                var args = userString.trim().split(' '),
                    minMidMax = args[0].replace('x', '').split('Y');

                switch (args[args.length - 1]) {
                    case "meet":  return aRMeet(minMidMax);
                    case "slice": return aRSlice(minMidMax);
                    default:      return default_obj;
                }

            }
        };

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        // some UAs don't fire a load event on <image> element
        var loader = function(url) {
            var img = new Image();
            img.onload = function() {
                // that was the last one
                if (++encoded === total) {
                    exportDoc();
                }
            };
            img.src = url;
        };


        // convert an external bitmap image to a dataURL
        var toDataURL = function(image, original) {

            var img = new Image();

            var error_handler = function() {

                console.warn('failed to load an image at : ', img.src);
                if (!params.keepImageHolder) {
                    image.parentNode.removeChild(image);
                }
                if (--total === encoded) {
                    exportDoc();
                }

            };

            if (!params.noCORS) {
                img.crossOrigin = 'Anonymous';
            }

            img.onload = function() {
                var attr, rect;
                if (original) {
                    attr = image.getAttribute('preserveAspectRatio');
                    rect = original.getBoundingClientRect();
                }
                // if the image is scaled down in the image
                if (original && rect && (rect.width * params.scale < this.width || rect.height * params.scale < this.height)) {
                    // set the canvas size to the <image>'s one
                    canvas.width = rect.width * params.scale;
                    canvas.height = rect.height * params.scale;
                    // draw only what is needed (About 3000ms saved on 5M images !)
                    var ar = preserveAspectRatio(this, canvas, attr);
                    ctx.drawImage.apply(ctx, ar);

                } else {

                    canvas.width = this.width;
                    canvas.height = this.height;
                    ctx.drawImage(this, 0, 0);

                }

                if (tester.isTainted(canvas)) {
                    error_handler();
                    return;
                }

                var dataURL = canvas.toDataURL();
                image.setAttributeNS(xlinkNS, 'href', dataURL);
                loader(dataURL);

            };

            // No CORS set in the response		
            img.onerror = function() {
                // save the src
                var oldSrc = this.src;
                // there is an other problem
                this.onerror = error_handler;
                // remove the crossorigin attribute
                this.removeAttribute('crossorigin');
                // retry
                this.src = '';
                this.src = oldSrc;
            };

            // load our external image into our img
            img.src = image.getAttributeNS(xlinkNS, 'href');
        };

        // get an external svg doc to data String
        var parseFromUrl = function(url, element) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {

                if (this.status === 200) {

                    var response = this.responseText || this.response;
                    var dataUrl = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent('<svg' + response.split('<svg')[1]);
                    element.setAttributeNS(xlinkNS, 'href', dataUrl);
                    loader(dataUrl);

                }
                // request failed with xhr, try as an <img>
                else {
                    toDataURL(element);
                }

            };
            xhr.onerror = function() {
                toDataURL(element);
            };
            // IE will throw an error if we try to get a file from an other domain
            try {
                xhr.open('GET', url);
            } catch (e) {
                toDataURL(element);
                return;
            }
            xhr.send();
        };

        // loop through all our <images> elements
        for (i = 0; i < images.length; i++) {

            var href = images[i].getAttributeNS(xlinkNS, 'href');
            // check if the image is external
            if (href && href.indexOf('data:image') < 0) {
                // if it points to another svg element
                if (href.indexOf('.svg') > 0) {
                    parseFromUrl(href, images[i]);
                } else {
                    // a pixel image
                    toDataURL(images[i], originalImages[i]);
                }
            }
            // else increment our counter
            else if (++encoded === total) {
                exportDoc();
                return;
            }
        }
    };

    var parseXlinks = function(css) {

        var i;
        var elemToParse = 0;
        var docsToFetch = 0;
        // our actual doc
        var current_doc = {
            href: location.href.replace(location.hash, '').replace(/#/g, ''),
            pathname: location.pathname,
            filename: '',
            innerElements: [],
            parsedElements: [],
            doc: svg.ownerDocument,
            base : location.href.replace(location.hash, '').replace(/#/g, '')
        };
        // an array for our external documents		
        var documents = [current_doc];

        var nsSelector_support = (function() {
            // create a test element
            var test = document.createElementNS(svgNS, 'use');
            // set its href attribute to something that should be found
            test.setAttributeNS(xlinkNS, 'href', '#__#');
            // append it to our document
            clone.appendChild(test);
            // if querySelector returns null then the selector is not supported
            var supported = !!clone.querySelector('[*|href*="#"]');
            // the test is done, remove the element
            clone.removeChild(test);
            return supported;
        })();

        var queryXlinks = function(el) {
            return nsSelector_support ? el.querySelectorAll('[*|href*="#"]') :
                // if the selector is not supported
                (function() {
                    var arr = [];
                    var children = el.querySelectorAll('*');
                    for (i = 0; i < children.length; i++) {
                        // search the xlink:href attribute
                        var xl_attr = children[i].getAttributeNS(xlinkNS, 'href');
                        // we only want the ones that refer to elements
                        if (xl_attr && xl_attr.indexOf('#') > -1) {
                            arr.push(children[i]);
                        }
                    }
                    return arr;
                })();
        };

        var getURLs = function(el) {
            // the list of all attributes that can have a <funciri> (url()) as value
            var url_attrs = ["style", "clip-path", "src", "cursor", "fill", "filter", "marker", "marker-start", "marker-mid", "marker-end", "mask", "stroke"];
            // build our selector string
            var urlSelector = '[*|' + url_attrs.join('*="url"], *[*|') + '*="url"]';

            var list = el.querySelectorAll(urlSelector);
            return list;
        };

        var getXternalAttributes = function(el, doc) {

            var externals = [];

            var ext_attr = function(ele, type) {
                var that = {};
                that.element = ele;
                that.type = type;
                that.attributes = [];
                that.requestedElements = [];
                that.parentDoc = doc;
                var att;
                if (type === 'xl') {

                    att = ele.attributes['xlink:href'];
                    if(!att){
                        var href = ele.attributes.href;

                        if(href && href.namespaceURI && href.namespaceURI.indexOf('xlink')>-1){
                            att = href;
                        }else{
                            return false;
                        }
                    }
                    that.attributes.push(att);
                    that.requestedElements.push(att.value);

                } else {

                    att = ele.attributes;
                    for (var j = 0; j < att.length; j++) {
                        var reg = new RegExp(/url\((.*?)\)/g);
                        var matched = [];
                        while ((matched = reg.exec(att[j].value)) !== null) {
                            that.attributes.push(att[j]);
                            that.requestedElements.push(matched[1].replace(/"/g, ''));
                        }
                    }
                }
                return that;

            };

            var xl = queryXlinks(el);

            var url = getURLs(el);

            var i;

            var att;

            for (i = 0; i < xl.length; i++) {
                att = ext_attr(xl[i], 'xl');
                if(!att){
                    continue;
                }
                externals.push(att);
                att = null;
            }

            for (i = 0; i < url.length; i++) {
                att = ext_attr(url[i], 'url');
                if(!att){
                    continue;
                }
                externals.push(att);
                att = null;
            }

            var self_attrs = el.attributes;

            for (i = 0; i < self_attrs.length; i++) {
                var self_attr = self_attrs[i];
                if (self_attr.name === 'xlink:href') {
                    externals.push(
                        new ext_attr(el, 'xl')
                    );
                } else {
                    var matched = self_attr.value.match(/url\((.*)\)/);
                    if (matched && matched.length > 1) {
                        externals.push(
                            new ext_attr(el, 'url')
                        );
                    }
                }
            }



            return externals;
        };

        var changeImagesHref = function(elem, base) {
            var images = elem.querySelectorAll('image');
            for (var i = 0; i < images.length; i++) {
                var href = images[i].getAttributeNS(xlinkNS, 'href');
                var newHref = tester.URL(href, base).href;
                if (href !== newHref) {
                    images[i].setAttributeNS(xlinkNS, 'href', newHref);
                }
            }
        };

        var getInnerElements = function() {
            var i;
            for (i = 0; i < documents.length; i++) {
                var doc = documents[i];
                if (!doc.doc) {
                    continue;
                }
                var inners = doc.innerElements;
                if (inners.length === doc.parsedElements.length) {
                    continue;
                }
                var j;
                for (j = 0; j < inners.length; j++) {
                    var node = doc.doc.getElementById(inners[j]);
                    if (!node) {
                        console.warn("Couldn't find this element", inners[j]);
                        elemToParse--;
                        continue;
                    }
                    var clone = node.cloneNode(true);
                    clone.id = doc.filename + '_' + inners[j];

                    changeImagesHref(clone, doc.base);

                    defs.appendChild(clone);
                    parse_attributes(getXternalAttributes(clone, doc));
                    doc.parsedElements.push(inners[j]);
                    elemToParse--;
                }
            }

            if (!docsToFetch && !elemToParse) {
                parseImages();
            }
        };

        // fetch the external documents
        var fetchExternalDoc = function(ext_doc) {
            var url = ext_doc.href;
            // create a new request
            var xhr = new XMLHttpRequest();

            xhr.onload = function() {
                // everything went fine
                if (this.status === 200) {
                    var response = this.responseText || this.response;
                    if (!response) {
                        return;
                    }
                    try {
                        ext_doc.doc = new DOMParser().parseFromString(response, 'text/html');
                    } catch (ie) {
                        ext_doc.doc = document.implementation.createHTMLDocument(ext_doc.filename);
                        ext_doc.doc.body.innerHTML = response;
                    }

                    ext_doc.base = url;
                } else {
                    ext_doc.doc = null;
                    elemToParse -= ext_doc.innerElements.length;
                    console.warn('could not load this external document :', url, '\n' +
                        'Those elements are lost : ', ext_doc.innerElements.join(' , '));
                }
                // In case we were the last one
                if (!--docsToFetch) {
                    getInnerElements();
                }
            };
            xhr.onerror = function(e) {
                ext_doc.doc = null;
                elemToParse -= ext_doc.innerElements.length;
                console.warn('could not load this external document', url);
                console.warn('Those elements are lost : ', ext_doc.innerElements.join(' , '));
                if (!--docsToFetch) {
                    getInnerElements();
                }
            };
            xhr.open('GET', url);
            xhr.send();
        };

        var append_doc = function(iri, doc) {
            var a = tester.URL(iri, doc.base);
            var original_filename = a.href.substring(a.href.lastIndexOf('/') + 1).replace(a.hash, '');
            var filename = original_filename.replace(/\./g, '_');
            var hash = a.hash.replace('#', '');
            var href = a.href.replace(a.hash, '');
            var newId = filename + '_' + hash;

            for (var i = 0; i < documents.length; i++) {
                var docI = documents[i];
                // already in the list
                if (docI.href === href) {
                    // not an external doc
                    if (i === 0) {
                        if (clone.getElementById(hash)) {
                            return hash;
                        } else {
                            newId = '_' + hash;
                        }
                    }
                    // but not in the innerElements
                    if (docI.innerElements.indexOf(hash) < 0) {
                        // this would mean we failed to load it
                        if (docI.doc !== null) {
                            elemToParse++;
                        } else {
                            console.warn('this element is also lost ', hash);
                        }
                        docI.innerElements.push(hash);
                        return newId;
                    }
                    // someone else already asked for this element
                    else {
                        return newId;
                    }
                }
            }

            elemToParse++;
            docsToFetch++;

            var that = {
                href: href,
                filename: filename,
                innerElements: [hash],
                parsedElements: [],
            };

            // add it to our array
            documents.push(that);
            fetchExternalDoc(that);
            return newId;

        };

        var parse_attributes = function(external_attributes) {

            if (external_attributes.length && !defs) {
                getDef();
            }

            var i, j;
            for (i = 0; i < external_attributes.length; i++) {

                var ext = external_attributes[i];

                for (j = 0; j < ext.requestedElements.length; j++) {

                    var requested = ext.requestedElements[j];
                    var newId = '#' + append_doc(requested, ext.parentDoc);
                    var attr = ext.attributes[j];
                    var newValue = attr.value.replace(requested, newId);
                    // fixes a strange UpperCase bug in Edge
                    var name = (attr.name.toUpperCase() === attr.name) ? attr.name.toLowerCase() : attr.name;
                    ext.element.setAttribute(name, newValue);

                }

            }
        };

        for (i = 0; i < css.length; i++) {
            append_doc(css[i][0], {
                base: css[i][1]
            });
        }

        parse_attributes(getXternalAttributes(clone, documents[0]));

        if (!docsToFetch) {
            if (!elemToParse) {
                parseImages();
            } else {
                getInnerElements();
            }
        }
    };

    parseStyles();
}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 10 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 11 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 12 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 13 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_angular__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__radial_lineage_plot_radial_lineage_plot_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__radial_phylogenetic_tree_radial_phylogenetic_tree_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__lineage_plot_lineage_plot_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__lineage_scatter_plot_lineage_scatter_plot_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__common_css__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__common_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__common_css__);






/* harmony default export */ __webpack_exports__["default"] = __WEBPACK_IMPORTED_MODULE_0_angular___default.a.module('ancestry', [
    'ancestry.lineage',
    'ancestry.radial-lineage',
    'ancestry.radial-phylogenetic-tree',
    'ancestry.lineage-scatter'
]);

/***/ })
/******/ ]);