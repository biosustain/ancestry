(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("d3-selection"), require("angular"), require("d3-array"), require("d3-scale"), require("d3-hierarchy"), require("d3-zoom"), require("d3-axis"), require("d3-brush"), require("d3-format"), require("d3-quadtree"), require("d3-selection-multi"), require("d3-xyzoom"), require("save-svg-as-png"));
	else if(typeof define === 'function' && define.amd)
		define(["d3-selection", "angular", "d3-array", "d3-scale", "d3-hierarchy", "d3-zoom", "d3-axis", "d3-brush", "d3-format", "d3-quadtree", "d3-selection-multi", "d3-xyzoom", "save-svg-as-png"], factory);
	else if(typeof exports === 'object')
		exports["ancestry"] = factory(require("d3-selection"), require("angular"), require("d3-array"), require("d3-scale"), require("d3-hierarchy"), require("d3-zoom"), require("d3-axis"), require("d3-brush"), require("d3-format"), require("d3-quadtree"), require("d3-selection-multi"), require("d3-xyzoom"), require("save-svg-as-png"));
	else
		root["ancestry"] = factory(root["d3-selection"], root["angular"], root["d3-array"], root["d3-scale"], root["d3-hierarchy"], root["d3-zoom"], root["d3-axis"], root["d3-brush"], root["d3-format"], root["d3-quadtree"], root["d3-selection-multi"], root["d3-xyzoom"], root["save-svg-as-png"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_10__, __WEBPACK_EXTERNAL_MODULE_23__, __WEBPACK_EXTERNAL_MODULE_24__, __WEBPACK_EXTERNAL_MODULE_25__, __WEBPACK_EXTERNAL_MODULE_26__, __WEBPACK_EXTERNAL_MODULE_27__, __WEBPACK_EXTERNAL_MODULE_28__) {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 29);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__icons_sprite_css__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__icons_sprite_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__icons_sprite_css__);
/* harmony export (immutable) */ __webpack_exports__["u"] = almostEq;
/* harmony export (immutable) */ __webpack_exports__["f"] = getClipUniqueId;
/* harmony export (immutable) */ __webpack_exports__["p"] = d3legend;
/* harmony export (immutable) */ __webpack_exports__["t"] = createPlotControls;
/* harmony export (immutable) */ __webpack_exports__["a"] = mergeTemplateLayout;
/* harmony export (immutable) */ __webpack_exports__["h"] = createNodeTypes;
/* harmony export (immutable) */ __webpack_exports__["i"] = createDynamicNodeAttr;
/* unused harmony export scaleProperties */
/* harmony export (immutable) */ __webpack_exports__["v"] = createTreeLayout;
/* harmony export (immutable) */ __webpack_exports__["g"] = flattifyTrees;
/* harmony export (immutable) */ __webpack_exports__["b"] = spreadNodes;
/* unused harmony export spreadGenerations */
/* harmony export (immutable) */ __webpack_exports__["c"] = project;
/* harmony export (immutable) */ __webpack_exports__["m"] = skipProperties;
/* harmony export (immutable) */ __webpack_exports__["n"] = getDomainLength;
/* unused harmony export getBBox */
/* harmony export (immutable) */ __webpack_exports__["l"] = getNodeLabelBBox;
/* harmony export (immutable) */ __webpack_exports__["o"] = getLinkLabelBBox;
/* unused harmony export resetBBox */
/* harmony export (immutable) */ __webpack_exports__["r"] = drawColorBar;
/* harmony export (immutable) */ __webpack_exports__["q"] = calcColorBarSize;
/* harmony export (immutable) */ __webpack_exports__["j"] = testLabelLength;
/* harmony export (immutable) */ __webpack_exports__["k"] = allocatePaddingInScale;
/* unused harmony export getTranslation */
/* harmony export (immutable) */ __webpack_exports__["d"] = attachActionOnResize;
/* unused harmony export toggleSelectionDisplay */


let d3 = Object.assign({},
    __webpack_require__(0),
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(10),
    __webpack_require__(25)
);

d3.selection.prototype.sortNoInsert = function(compare) {
    function compareNode(a, b) {
        return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
            if (node = group[i]) {
                sortgroup[i] = node;
            }
        }
        sortgroup.sort(compareNode);
    }

    return d3.selectAll(sortgroups[0]);
};

d3.selection.prototype.partition = function(filterCallback) {
    let matched = [], unmatched = [];
    this.each(function(d) {
        (filterCallback(d) ? matched : unmatched).push(this);
    });
    return [d3.selectAll(matched), d3.selectAll(unmatched)];
};

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};

function almostEq(x, y, eps=1e-6) {
    return Math.abs(x - y) < eps;
}

function getClipUniqueId() {
    return (d3.max(d3.selectAll('clipPath').data()) || 0) + 1;
}

function d3legend() {
    let splitAfter = 0,
        anchor = {x: 'outside', y: 'inside'},
        seriesNames = null,
        colorScale = null,
        onMouseOver = null,
        onMouseOut = null,
        onClick = null,
        selectedItems = new Set(),
        verticalItemSpacing = 10,
        horizontalItemSpacing = 20,
        padding = 10,
        shapeSize = 10,
        maxSize = {width: -1, height: -1},
        background = 'white';

    function legend(g) {
        splitAfter = splitAfter.clamp(0, seriesNames.length);
        if (splitAfter === 0) splitAfter = seriesNames.length;
        let longestName = seriesNames.reduce((a, b) => a.length > b.length ? a : b);

        let lengthTestString = g.append('text').attr('visibility', false).text(longestName);
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
            legendHorizontalOffset = anchor.x === 'left' ? 0 : (anchor.x === 'right' ? -w : -w / 2),
            legendVerticalOffset = anchor.y === 'top' ? 0 : (anchor.y === 'bottom' ? -h : -h / 2);

        g.append('rect')
            .attr('x', legendHorizontalOffset)
            .attr('y', legendVerticalOffset)
            .attr('width', w)
            .attr('height', h)
            .attr('fill', background)
            .style('opacity', 0.75);

        let item = g.selectAll('g.legend-item').data(seriesNames.map(label => {
            return {
                label,
                active: true
            }
        }));

        let itemEnter = item.enter()
            .append('g')
            .attr('class', 'legend-item');

        itemEnter.attr('transform', (d, i) => `translate(${legendHorizontalOffset + padding + (i % splitAfter) * (columnWidth + horizontalItemSpacing)},
                                            ${legendVerticalOffset + padding + Math.floor(i / splitAfter) * (rowHeight + verticalItemSpacing)})`);

        itemEnter.each(function (d) {
            let sel = d3.select(this);

            sel.append('rect')
                .attr('class', 'shape')
                .attr('x', 2)
                .attr('y', shapeVerticalOffset)
                .attr('width', shapeSize)
                .attr('height', shapeSize)
                .attr('fill', selectedItems.has(d.label) ? colorScale(d.label) : 'white')
                .attr('stroke', colorScale(d.label));

            sel.append('text')
                .attr('x', shapeSize + 5)
                .attr('y', textVerticalOffset)
                .attr('fill', 'black')
                .attr('font-size', 13)
                .text(d.label);

            sel.append('rect')
                .attr('class', 'legend-item-mouse-capture')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', columnWidth)
                .attr('height', rowHeight)
                .attr('fill', 'white')
                .attr('opacity', 0);
        });

        if (onMouseOver) itemEnter.on('mouseover', onMouseOver);
        if (onMouseOut) itemEnter.on('mouseout', onMouseOut);
        if (onClick) itemEnter.on('click', onClick);
    }

    legend.splitAfter = function (x) {
        if (!arguments.length) return splitAfter;
        splitAfter = x;
        return legend;
    };

    legend.anchor = function (x) {
        if (!arguments.length) return anchor;
        anchor = x;
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

    legend.colorScale = function (x) {
        if (!arguments.length) return colorScale;
        colorScale = x;
        return legend;
    };

    legend.backgroundColor = function (x) {
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

function createPlotControls(root, controls, order, activeControls=new Set()) {
    const config = {
        download: {
            icon: 'svg-ic_photo_camera_black_24px',
            switchable: false
        },
        select: {
            icon: 'svg-ic_radio_button_checked_black_24px',
            switchable: true,
            disables: ['zoom', 'rotate']
        },
        zoom: {
            icon: 'svg-ic_open_with_black_24px',
            switchable: true,
            disables: ['select', 'rotate']
        },
        rotate: {
            icon: 'svg-ic_rotate_right_black_24px',
            switchable: true,
            disables: ['zoom', 'select']
        },
        label: {
            icon: 'svg-ic_label_black_24px',
            switchable: true
        },
        brush: {
            icon: 'svg-ic_crop_black_24px',
            switchable: true
        }
    };
    let plotRoot = d3.select(root),
        ctrls = Object.keys(controls),
        timeoutId = null,
        isVisible = false;

    plotRoot.selectAll('div.plot-control-panel').remove();

    let controlPanel = plotRoot.append('div')
        .attr('class', 'plot-control-panel')
        .style('visibility', 'hidden');

    controlPanel.selectAll('div')
        .data(order)
        .enter()
        .append('div')
        .attr('class', action => `${config[action].icon} svg-icon action-${action}`)
        .classed('active', action => activeControls.has(action) && config[action].switchable)
        .on('click', function(action) {
            let self = d3.select(this);
            let active = self.classed('active');
            if (config[action].switchable) {
                self.classed('active', !active);
                if (config[action].disables) {
                    for (let actionToDisable of config[action].disables) {
                        let selectMode = plotRoot.select(`div.action-${actionToDisable}`);
                        if (!selectMode.empty() && selectMode.classed('active') && !active) {
                            selectMode.classed('active', false);
                            (controls[actionToDisable])(false);
                        }
                    }
                }
                setActiveControl();
            }
            (controls[action])(!active);
        });

    plotRoot.select('svg').on('mousemove', function() {
        if (!isVisible) {
            controlPanel.style('visibility', 'visible').transition().style('opacity', 1);
            isVisible = true;
        }
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
            controlPanel.style('opacity', 0).style('visibility', 'hidden');
            isVisible = false;
        }, 2500);
    });

    for (let ctrl of ctrls) {
        if (config[ctrl].switchable) controls[ctrl](activeControls.has(ctrl));
    }


    function setActiveControl() {
        activeControls.clear();
        for (let activeCtrl of plotRoot.selectAll('.active').data()) {
            activeControls.add(activeCtrl);
        }
    }
}

class d3tooltip {
    constructor(g) {
        this.tip = g.append('div').attr('class', 'ancestry-tooltip');
        this.pos = [0, 0];
        this.hide();
    }

    position(pos) {
        if (!arguments.length) return this.pos;
        this.pos = pos;
        this.tip.style('left', `${pos[0]}px`)
            .style('top', `${pos[1]}px`);
        return this;
    }

    hide() {
        this.tip.transition().delay(100).style('opacity', 0);
        return this;
    }

    show() {
        this.tip.transition().duration(0).style('opacity', 1);
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
/* harmony export (immutable) */ __webpack_exports__["e"] = d3tooltip;


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
        typeAttr[attr] = (d) => types[d.hasOwnProperty('data') ? d.data.type : d.type][attr];
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

function flattifyTrees(trees) {
    let flat = [];

    function addToArray(node) {
        if (node.taxon) {
            flat.push(node.taxon);
            return;
        }
        for (let child of node.children) {
            addToArray(child);
        }
    }

    if  (Object.prototype.toString.call(trees) !== '[object Array]') {
        trees = [trees]
    }
    for (let tree of trees) {
        addToArray(tree);
    }

    return flat;
}

function spreadNodes(node, level=0) {
    if (!node.children || !node.children.length) {
        node.depth = 1;
        return level;
    }
    let max = 1, childMax;
    for (let child of node.children) {
        childMax = spreadNodes(child, level + 1);
        if (childMax > max) {
            max = childMax;
        }
    }
    node.depth = level / max;
    return max;
}

function spreadGenerations(tree, gen = 0) {
    tree.generation = gen;
    for (let child of tree.children) {
        spreadGenerations(child, gen + 1);
    }
}

function project(d) {
    let a = (d._theta - 90) / 180 * Math.PI;
    return [d._r * Math.cos(a), d._r * Math.sin(a)];
}

function skipProperties(obj, props) {
    let clone = Object.assign({}, obj);
    for (let prop of [].concat(props)) {
        delete clone[prop];
    }
    return clone;
}

function getDomainLength(scale) {
    let domain = scale.domain();
    return Math.abs(domain[1] - domain[0]);
}

function getBBox(d) {
    let {top, bottom, right, left, width, height} = this.getBoundingClientRect();
    d.bbox = {top, bottom, right, left};
}

function getNodeLabelBBox(d) {
    d.bbox = {
        left: d.x + (d.currentLabelPos['text-anchor'] == 'start' ? 0 : -d.width),
        right: d.x + (d.currentLabelPos['text-anchor'] == 'start' ? d.width : 0),
        top: d.y - d.height + d.dy,
        bottom: d.y + d.dy
    };
}

function getLinkLabelBBox(d) {
    d.bbox = {
        left: d.x - d.width / 2,
        right: d.x + d.width / 2,
        top: d.y - d.height + d.dy,
        bottom: d.y + d.dy
    };
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
    constructor(levelFixed, levels, nodeLabelPositions, viewport, markerBBox) {
        let extraBorder = 10;
        this.left = viewport[0][0] + extraBorder;
        this.right = viewport[1][0] + extraBorder;
        this.top = viewport[0][1] + extraBorder;
        this.bottom = viewport[1][1] + extraBorder;
        this.width = viewport[0][0] - viewport[1][0];
        this.height = viewport[1][1] - viewport[0][1];
        this.levels = levels;
        this.levelFixed = levelFixed;
        this.nodeLabelPositions = nodeLabelPositions;
        this.quadtree = null;
        this.markerBBox = markerBBox;
        this.maxMarkerSize = {
            width: Math.max.apply(Math, Object.values(markerBBox).map(d => d.width)),
            height: Math.max.apply(Math, Object.values(markerBBox).map(d => d.height))
        };
        this.getMarkerBBox = this.getMarkerBBox.bind(this);
    }

    quadtreeSearch(d, searchRadius) {
        let foundNodes = [],
            point = {
                x: (d.bbox.left + d.bbox.right) / 2,
                y: (d.bbox.top + d.bbox.bottom) / 2
            },
            rx = searchRadius.x, ry = searchRadius.y,
            px = point.x, py = point.y,
            x0 = px - rx, y0 = py - ry, x3 = px + rx, y3 = py + ry;
        this.quadtree.visit((node, x1, y1, x2, y2) => {
            let outside = x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
            if (outside) return true;
            let p = node.data;
            if (p) {
                if((Math.abs(px - p.x) <= rx || Math.abs(py - p.y) <= ry) && p != point) {
                    do {
                        foundNodes.push(node.data)
                    } while (node = node.next);
                }
            }
            return false;
        });

        return foundNodes;
    }

    recalculateLabels() {
        let that = this;
        this.quadtree = d3.quadtree().extent([[-1, -1], [this.width + 1, this.height + 1]])
            .x(d => d.x)
            .y(d => d.y);

        let isVisible = d => {
            return d.x >= this.left && d.x <= this.right && d.y >= this.top && d.y <= this.bottom;
        };
        for (let fixedSelection of this.levelFixed) {
            let filteredSelection = fixedSelection.filter(isVisible);
            filteredSelection.each(this.getMarkerBBox);
            this.quadtree.addAll(filteredSelection.data());
        }
        for (let level of this.levels) {
            if (!level.length) {
                continue;
            }
            let mergedSelection = level.length > 1 ? d3.selectAll([].concat.apply([], level.map(d => d.nodes()))) : level[0];
            let [matchedSelection, unmatchedSelection] = mergedSelection.partition(isVisible);
            unmatchedSelection.style('opacity', '1e-6');
            recalculateCollisions(matchedSelection);
        }

        function recalculateCollisions(selection) {
            selection
                .sortNoInsert((a, b) => (b.x - a.x) - 0.01 * (b.y - a.y))
                .each(function(d) {
                let i = 0,
                    searchRadius = {
                        x: (d.width + that.maxMarkerSize.width) / 2,
                        y: (d.height + that.maxMarkerSize.height) / 2
                    },
                    collision = false,
                    sel = d3.select(this),
                    label_type = sel.attr('class');

                if (label_type == 'node-label') {
                    do {
                        // set next position from the position's list
                        d.currentLabelPos = that.nodeLabelPositions[i++];
                        // apply the new position to DOM element
                        sel.each(d => {
                            d.x = d.node.x + d.currentLabelPos.x;
                            d.y = d.node.y + d.currentLabelPos.y + d.dy;
                        });
                        // recalculate label and node's new bounding boxes
                        sel.each(getNodeLabelBBox);

                        let neighbours = that.quadtreeSearch(d, searchRadius);
                        // check if the label collides with its neighbours
                        collision = LabelCollisionDetection.isColliding(d, neighbours);
                    } while (collision && i < that.nodeLabelPositions.length);
                }
                else { /* label_type == 'link-label' */
                    sel.each(getLinkLabelBBox);
                    let neighbours = that.quadtreeSearch(d, searchRadius);
                    collision = LabelCollisionDetection.isColliding(d, neighbours);
                }
                if(collision) { // reset bounding boxes if no non-colliding positions were found
                    resetBBox(d);
                } else {
                    that.addToQuadtree(d);
                    if (label_type == 'node-label') {
                        sel.attr('x', d => d.x)
                            .attr('y', d => d.y)
                            .attr('text-anchor', d => d.currentLabelPos['text-anchor']);
                    }
                }
                // hide label if it collides
                d.isColliding = collision;
                sel.style('opacity', collision ? 1e-6 : 1);
            });
        }
    }

    addToQuadtree(d) {
        let x = (d.bbox.left + d.bbox.right) / 2,
            y = (d.bbox.bottom + d.bbox.top) / 2;
        // add left border of label
        this.quadtree.add({
            x: d.bbox.left,
            y,
            bbox: d.bbox
        });
        // add right border of label
        this.quadtree.add({
            x: d.bbox.right,
            y,
            bbox: d.bbox
        });
        // add top border of label
        this.quadtree.add({
            x,
            y: d.bbox.top,
            bbox: d.bbox
        });
        // add bottom border of label
        this.quadtree.add({
            x,
            y: d.bbox.bottom,
            bbox: d.bbox
        });
    }

    getMarkerBBox(d) {
        let sizes = this.markerBBox[d.data.type];
        d.bbox = {
            top: d.y - sizes.height / 2,
            bottom: d.y + sizes.height / 2,
            right: d.x + sizes.width / 2,
            left:  d.x - sizes.width / 2
        };
    }

    static checkCollision(rect1, rect2) {
        return (rect1.left <= rect2.right &&
            rect1.right >= rect2.left &&
            rect1.bottom >= rect2.top &&
            rect1.top <= rect2.bottom);
    }

    static isColliding(object1, objects) {
        for(let object2 of objects) {
            if (LabelCollisionDetection.checkCollision(object1.bbox, object2.bbox)) return true;
        }
        return false;
    }
}
/* harmony export (immutable) */ __webpack_exports__["s"] = LabelCollisionDetection;


let colorBarID = 0;
function drawColorBar(selection, domain, heatmapOptions, defs) {

    selection.selectAll('*').remove();

    let width = heatmapOptions.colorBar.width,
        height = heatmapOptions.colorBar.height,
        colorScale = heatmapOptions.colorScale,
        opacity = heatmapOptions.opacity,
        title = heatmapOptions.title,
        titleOffset = title ? 22 : 0;

    let gradient =  defs.append('svg:linearGradient')
        .attr('id',  `gradient${colorBarID}`)
        .attr('x1', '0%')
        .attr('y1', height > width ? '100%' : '0%')
        .attr('x2', height > width ? '0%' : '100%')
        .attr('y2', '0%')
        .attr('spreadMethod', 'pad');

    gradient.append('svg:stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale[0][1])
        .attr('stop-opacity', 1);

    gradient.append('svg:stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale[1][1])
        .attr('stop-opacity', 1);

    selection.append('rect')
        .attr('x', titleOffset)
        .attr('y', -height / 2)
        .attr('width', width)
        .attr('height', height)
        .style('fill', `url(#gradient${colorBarID++})`)
        .attr('stroke-width', 2)
        .attr('stroke', 'grey')
        .style('opacity', opacity);

    if (title) {
        selection.append('text')
            .attr('class', 'axis-title')
            .attr('transform', 'rotate(-90)')
            .attr('dy', 12)
            .attr('x', 0)
            .style('text-anchor', 'middle')
            .text(title);
    }

    // Define x axis and grid
    let colorAxis = d3.axisRight()
        .scale(d3.scaleLinear().domain(domain).range([height, 0]));

    let axis = selection.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(${width + titleOffset}, ${-height / 2})`)
        .call(colorAxis);

    axis.selectAll('.tick text').attr('font-size', 12);
}

function calcColorBarSize(size, relativeSize) {
    if (typeof size === 'string' || size instanceof String) {
        if (size === 'auto') return relativeSize;
        else if (size[size.length - 1] === '%') return relativeSize * parseInt(size) / 100;
        else return relativeSize;
    }
    else return size;
}

function testLabelLength(svg, name, _attrs) {
    let label = svg.append('text').text(name).attrs(_attrs),
        rect = label.node().getBoundingClientRect();
    label.remove();
    return {
        width: rect.width,
        height: rect.height
    };
}

function allocatePaddingInScale(scale, padding) {
    let d = scale.domain()[0] instanceof Date ? scale.domain().map(x => x.getTime()) : scale.domain(),
        r = scale.range(),
        tmp1 = padding * (d[0] + d[1]),
        tmp2 = r[0] - r[1] + 2 * padding,
        d0p = (d[0] * (r[0] - r[1]) + tmp1) / tmp2,
        d1p = (r[0] * d[0] - r[1] * d[1] + tmp1) / tmp2;

    return scale.copy().domain([d0p, d1p]);
}

function getTranslation(transform) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttributeNS(null, 'transform', transform);
    var matrix = g.transform.baseVal.consolidate().matrix;
    return [matrix.e, matrix.f];
}

function attachActionOnResize(window, action) {
    window = angular.element(window);
    let width = window[0].innerWidth;
    let lastUpdate = performance.now();
    let scheduleId = null;
    //let height = window[0].innerHeight;

    window.on('resize', (event) => {
        let newWidth = window[0].innerWidth,
            now = performance.now();
        //let newHeight = window[0].innerHeight;
        if (width != newWidth /*|| height != newHeight*/) {
            width = newWidth;
            if (now - lastUpdate < 500) {
                clearTimeout(scheduleId);
            }
            lastUpdate = now;
            scheduleId = setTimeout(action, 500);
        }
    });
}

function toggleSelectionDisplay(selectionInViewport, selectionNotInViewport) {
    selectionInViewport.style('display', 'inline');
    selectionNotInViewport.style('display', 'none');
}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
let baseLayoutTemplate = {
    title: null,
    width: null,
    height: 600,
    backgroundColor: 'none',
    textColor: 'black',
    margin: {
        right: 10,
        left: 10,
        top: 10,
        bottom: 10
    },
    axis: undefined, /* defined on child level */
    plotPadding: {
        x: null,
        y: null
    },
    nodeTypes: {},
    seriesColors: {},
    nodeLabel: {
        'font-size': 12,
        dy: 4, // usually 1/3 of font-size works fine
        'font-family': 'Roboto,Helvetica Neue,sans-serif'
    },
    linkLabel: {
        'font-size': 12,
        dy: 4,
        'font-family': 'Roboto,Helvetica Neue,sans-serif'
    },
    link: {
        fill: 'none',
        stroke: '#ccc',
        'stroke-width': 1
    },
    showLinkArrowhead: false,
    labelCollisionDetection: {
        enabled: 'never',
        updateDelay: 500,
        order: {
            linkLabel: 1,
            nodeLabel: 1
        }
    },
    minViewportWidth: {
        generationWidth: 0,
        timeIntervalInSeconds: 3600 * 24 * 30, // month
        timeIntervalInPixels: 0
    },
    groupSelection: {
        enabled: false,
        selectionRectangle: {
            'stroke-width': 1,
            'stroke-dasharray': 4,
            rx: 3,
            ry: 3,
            stroke: 'steelblue'
        }
    },
    heatmap: {
        enabled: true,
        title: null,
        colorScale: [
            [0, '#008ae5'],
            [1, 'yellow']
        ],
        colorBar: {
            show: false,
            height: '90%',
            width: 30,
            padding: {
                left: 10,
                right: 0
            }
        },
        circle: {
            r: 16
        },
        opacity: 0.4
    },
    legend: {
        show: false,
        x: 1.,
        y: 0.5,
        anchor: {
            x: 'left',
            y: 'center'
        },
        orientation: 'vertical',
        backgroundColor: null
    },
    tooltip: {
        show: true,
        showSeriesBar: false,
        align: 'left'
    },
    brush: {
        margin: {
            top: 20,
            bottom: 0
        },
        height: 200,
        lockY: false,
        boxRectangle: {
            'stroke-width': 1,
            'stroke': '#aaa'
        },
        drawTrees: true,
        axis:  undefined, /* defined on child level */
        brushRectangleOnFullView: true
    },
    nodeLabelPositions: [
        {
            x: 10,
            y: 0,
            'text-anchor': 'start'
        },
        {
            x: -10,
            y: 0,
            'text-anchor': 'end'
        }
    ],
    controls: {
        download: {
            show: true,
            format: 'png',
            position: 0
        },
        zoom: {
            show: true,
            active: false,
            position: 2
        },
        brush: {
            show: true,
            active: false,
            position: 3
        },
        select: {
            show: true,
            active: false,
            position: 4
        },
        label: {
            show: true,
            active: true,
            position: 5
        }
    }
};

/* harmony default export */ __webpack_exports__["a"] = baseLayoutTemplate;

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_css__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_save_svg_as_png__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_save_svg_as_png___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_save_svg_as_png__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shared_features_js__ = __webpack_require__(4);




let d3 = Object.assign({},
    __webpack_require__(0),
    __webpack_require__(26),
    __webpack_require__(24),
    __webpack_require__(27),
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(10),
    __webpack_require__(23)
);

d3.getEvent = () => __webpack_require__(0).event;



class BaseLineagePlotController {
    constructor($element, $window, $scope, $attrs) {
        this._$window = $window;
        this._$element = $element;
        this._$scope = $scope;
        this._$attrs = $attrs;

        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["d" /* attachActionOnResize */])($window, () => {
            this.axisSvgs = {};
            this.initializeData({isNewData: false});
            this.render({});
        });
        $element.addClass('ancestry ancestry-base-lineage-plot');

        this.svg = d3.select($element[0])
            .style('position', 'relative')
            .append('svg');
        this.defaultPalette = d3.scaleOrdinal(d3.schemeCategory10);
        this.maxAllowedDepth = 180;
        this.mouseStart = null;
        this.selectionRect = null;
        this.tooltip = new __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["e" /* d3tooltip */](d3.select($element[0]));
        this.defaultNode = {
            r: 4,
            'stroke-width': 2
        };
        this.selectedNodesSet = new Set();
        this.activeControls = null;
        this.LCD = null;
        this.LCDUpdateID = null;
        this.heatmapColorScale = null;
        this.heatmapCircle = d3.select();
        this.colorBarOffset = 0;
        this.activeSeries = new Set();
        this.axisSvgs = {};
        this.transform = d3.xyzoomIdentity;

        this.onZoom = this.onZoom.bind(this);
        this.linkGenerator = this.linkGenerator.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);

        this.controlMappings = {
            'download': this.download.bind(this),
            'zoom': this.toggleZoom.bind(this),
            'brush': this.toggleBrush.bind(this),
            'select': this.toggleSelect.bind(this),
            'label': this.toggleLabels.bind(this)
        };

        this.originAtCenter = false;
        this.isCartesian = true;
        this.flatInput = true;
    }

    $onChanges(changes) {
        if ((changes.plotData && changes.plotData.currentValue) ||
            (changes.plotLayout && changes.plotLayout.currentValue)) {
            this.initializeData();
            this.render();
        }
    }

    render() {
        this.svg.selectAll('*').remove();
        this.svg.attr('width', this.width)
            .attr('height', this.height);

        this.svg.append('rect')
            .attrs({
                x: 0,
                y: 0,
                width: this.width,
                height: this.heightWithBrush,
                'stroke-width': 0,
                fill: this.layout.backgroundColor
            });

        this.defs = this.svg.append('defs');

        let clipRectId = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["f" /* getClipUniqueId */])();
        this.defs.append('svg:clipPath')
            .datum(clipRectId)
            .attr('id', `clip-rect${clipRectId}`)
            .append('svg:rect')
            .attr('x', this.viewport[0][0])
            .attr('y', this.viewport[0][1])
            .attr('width', this.plotWidth)
            .attr('height', this.plotHeight);

        this.defs.append('marker')
            .attrs({
                id: 'marker-arrowhead',
                viewBox: '0 -5 10 10',
                refX: 15,
                refY: 0,
                markerWidth: 8,
                markerHeight: 8,
                orient: 'auto'
            })
            .append('path')
            .attr('d', 'M0,-4L10,0L0,4')
            .attr('fill', this.layout.link.stroke)
            .attr('class','arrowHead');

        this.treeFixedContainer = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        this.mouseRect = this.treeFixedContainer.append('rect')
            .attr('id', 'mouse-capture')
            .attr('x', this.viewport[0][0])
            .attr('y', this.viewport[0][1])
            .attr('width', this.plotWidth)
            .attr('height', this.plotHeight)
            .style('fill', 'transparent');

        this.makeZoom();
        this.drawColorBar();
        this.drawLegend();
        this.drawMainAxes();
        this.drawTitle();

        this.treeContainer = this.treeFixedContainer.append('g')
            .attr('clip-path', `url(#clip-rect${clipRectId})`);

        this.drawTrees();

        this.makeNodeSelection();
        this.makeLCD();
        this.makeBrush();
        this.makeTooltip();

        this.makeControlPanel();
        this.zoomToMinimumWidth();

        if (this.layout.textColor) { // set global text color
            this.svg.selectAll('text').attr('fill', this.layout.textColor);
        }
    }

    initializeData(options = {isNewData: true}) {
        this.data = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.copy(this.flatInput ? this.plotData : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["g" /* flattifyTrees */])(this.plotData));
        this.originalData = this.flatInput ? this.data : __WEBPACK_IMPORTED_MODULE_1_angular___default.a.copy(this.plotData);

        this.layout = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["a" /* mergeTemplateLayout */])(this.plotLayout, this.constructor.getLayoutTemplate());

        let elementWidth = this._$element[0].offsetWidth,
            elementHeight = this._$element[0].offsetHeight,
            margin = this.layout.margin;

        this.margin = margin;
        this.width = (this.layout.width || elementWidth);
        this.height = (this.layout.height || elementHeight);
        this.plotWidth = this.width - margin.right - margin.left;
        this.plotHeight = this.height - margin.top - margin.bottom;
        this.plotOrigin = this.originAtCenter ? [this.plotWidth / 2, this.plotHeight / 2] : [0, 0];
        this.viewport = [[0, 0], [this.plotWidth, this.plotHeight]];

        this.heightWithBrush = this.margin.top + this.plotHeight + this.margin.bottom +
            this.layout.brush.margin.bottom + this.layout.brush.margin.top + this.layout.brush.height;

        this.seriesNames = Array.from(new Set(this.data.map(d => d.series)));

        if (options.isNewData) {
            this.activeSeries = new Set(this.seriesNames);
        }

        if (this.activeControls == null) {
            this.hiddenControls = new Set(Object.entries(this.layout.controls)
                .filter(([name, config]) => !config.show).map(([name, config]) => name));
            this.activeControls = new Set(Object.entries(this.layout.controls)
                .filter(([name, config]) => config.show && config.active).map(([name, config]) => name));
        }
        this.lcdEnabled = this.layout.labelCollisionDetection.enabled != 'never' && this.activeControls.has('label');

        this.colors = (series) => {
            return (series in this.layout.seriesColors) ? this.layout.seriesColors[series] :
                this.defaultPalette(series);
        };

        let types = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["h" /* createNodeTypes */])(this.data, this.layout.nodeTypes, this.defaultNode);
        this.nodeAttr = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["i" /* createDynamicNodeAttr */])(types, Object.keys(this.defaultNode));
        let filteredData = this.constructor.filterSeries(this.originalData, this.activeSeries);
        this.lastData = __WEBPACK_IMPORTED_MODULE_1_angular___default.a.copy(filteredData);

        this.isTimePlot = filteredData[0].date != undefined;

        this.nodes = this.prepareNodes(filteredData, this);

        if (!options.isNewData) {
            this.nodes.forEach(d => {
                d.data.selected = this.selectedNodesSet.has(d.data.name);
            })
        } else {
            this.selectedNodesSet = new Set();
            this.nodes.filter(d => d.data.selected).forEach(d => {
                this.selectedNodesSet.add(d.data.name);
            })
        }

        this.nodeLabelData = this.nodes.map(d => {
            return {node: d, currentLabelPos: this.layout.nodeLabelPositions[0], dy: this.layout.nodeLabel.dy};
        });
        this.linkLabelData = this.nodes
            .filter(d => d.parent && d.data.inLinkLabel != null)
            .map(d => {
                return {nodeTo: d, dy: this.layout.linkLabel.dy};
            });

        this.setupScales();
        this.adjustScales();

        this._xScale = this.xScale.copy();
        this._yScale = this.yScale.copy();

        this.heatmapColorScale = this.makeHeatmapColorScale(filteredData);

        this.updatePositions(this);
    }

    static getLayoutTemplate() {
        return new Error('Improper use of abstract class!');
    }

    adjustScales() {
        let paddingX = this.layout.plotPadding.x,
            paddingY = this.layout.plotPadding.y;

        if (paddingX == null || paddingY == null) {
            let longestNodeName = this.data.length ? this.data.reduce((a, b) =>
                a.name.length > b.name.length ? a : b).name : '';
            this.maxLabelSize = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["j" /* testLabelLength */])(this.svg, longestNodeName, this.layout.nodeLabel);
            this.maxLabelOffset = {
                x: d3.max(this.layout.nodeLabelPositions, (pos) => Math.abs(pos.x)),
                y: d3.max(this.layout.nodeLabelPositions, (pos) => Math.abs(pos.y))
            };

            if (paddingX == null) {
                paddingX = this.maxLabelSize.width + this.maxLabelOffset.x + 5;
            }
            if (paddingY == null) {
                paddingY = this.maxLabelSize.height + this.maxLabelOffset.y + 5;
            }
        }

        if (paddingX > 0) {
            this.xScale = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["k" /* allocatePaddingInScale */])(this.xScale, paddingX);
        }

        if (paddingY > 0) {
            this.yScale = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["k" /* allocatePaddingInScale */])(this.yScale, paddingY);
        }
    }

    static filterSeries(nodes, activeSeries) {
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

    //noinspection JSMethodCanBeStatic
    linkGenerator() {
        return new Error('Improper use of abstract class!');
    }

    // overridden method should define class members: xScale, yScale and xExtent
    //noinspection JSMethodCanBeStatic
    setupScales() {
        return new Error('Improper use of abstract class!');
    }

    //noinspection JSMethodCanBeStatic
    prepareNodes(/* data, context */) {
        return new Error('Improper use of abstract class!');
    }

    updateAndRedraw() {
        this.updatePositions(this);
        this.drawMainAxes();
        this.drawLinks(false);
        this.drawNodes(false);
        this.applyLCD();
    }

    drawTrees(redraw = true) {
        if (redraw) {
            this.treeContainer.selectAll('*').remove();
        }
        this.drawLinks(redraw);
        this.drawNodes(redraw);
        this.linkLabelLayer.moveToFront();
    }

    drawNodes(redraw=true) {

        if (this.layout.heatmap.enabled && redraw) {

            this.heatmapCircle = this.treeContainer.append('g')
                .attr('class', 'heatmap-layer')
                .selectAll('circle.heatmap-circle')
                .data(this.nodes.filter(n => !isNaN(parseFloat(n.data.z))))
                .enter()
                .append('circle')
                .attr('class', 'heatmap-circle')
                .style('fill', d => this.heatmapColorScale(d.data.z))
                .style('opacity', this.layout.heatmap.opacity)
                .attrs(this.layout.heatmap.circle);
        }

        if (redraw) {
            this.marker = this.treeContainer.append('g')
                .attr('class', 'node-marker-layer')
                .selectAll('circle.node-marker')
                .data(this.nodes.filter(d => !d.data.hide))
                .enter();

            if (this._$attrs.customNode) {
                this.marker = this.customNode({$selection: this.marker, $event: 'draw'});
            } else {
                this.marker = this.marker.append('circle')
                    .attr('class', 'node-marker')
                    .style('fill', d => d.data.selected ? this.colors(d.data.series) : '#FFF')
                    .style('stroke', d => this.colors(d.data.series))
                    .attrs(this.nodeAttr);
            }

            this.nodeLabel = this.treeContainer.append('g')
                .attr('class', 'node-label-layer')
                .selectAll('text.node-label')
                .data(this.nodeLabelData)
                .enter()
                .append('text')
                .attr('class', 'node-label')
                .text(d => d.node.data.name)
                .style('opacity', this.activeControls.has('label') ? 1 : 1e-6)
                .each(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["l" /* getNodeLabelBBox */])
                .attr('text-anchor', d => d.currentLabelPos['text-anchor'])
                .attrs(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* skipProperties */])(this.layout.nodeLabel, 'dy'));
        }

        if (this._$attrs.customNode) {
            this.customNode({$selection: this.marker, $event: 'update'});
        } else {
            this.marker.attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }

        this.heatmapCircle.attr('cx', d => d.x)
            .attr('cy', d => d.y);

        this.nodeLabel.attr('x', d => d.x)
            .attr('y', d => d.y);
    }

    //noinspection JSMethodCanBeStatic
    drawMainAxes() {
        return new Error('Improper use of abstract class!');
    }

    //noinspection JSMethodCanBeStatic
    drawBrushAxes() {
        return new Error('Improper use of abstract class!');
    }

    drawAxis(container, type, scale, tickLength, isTimeAxis=false, fixTicks=false) {
        let axisType = null, isMain = null,
            axisSvg = `axis-${type}-svg`;

        [axisType, isMain] = type.split('-');
        isMain = isMain == 'main';

        let layout = (isMain ? this.layout.axis : this.layout.brush.axis)[axisType],
            axis = (axisType == 'x' ? d3.axisBottom : d3.axisLeft)()
                .scale(scale)
                .tickSizeInner(0)
                .tickSizeOuter(0);

        if (axisType == 'x' && !isTimeAxis && fixTicks) {
            let [start, end] = this.xScale.domain();
            start = Math.max(Math.ceil(start), this.xExtent[0]);
            end = Math.min(Math.floor(end), this.xExtent[1]);
            axis.tickFormat(d3.format('d'))
                .tickValues(d3.range(start, end + 1));
        }

        if (!this.axisSvgs[axisSvg]) {
            this.axisSvgs[axisSvg] = container.append('g')
                .attr('transform', `translate(0, ${axisType == 'x' ? tickLength : 0})`)
                .attr('class', `axis ${type}`);

            this.axisSvgs[axisSvg].call(axis);
            let offset = this.axisSvgs[axisSvg].node().getBBox()[axisType == 'x' ? 'height' : 'width'];

            if (layout.title) {
                let range = Math.abs(scale.range()[1] - scale.range()[0]),
                    width = axisType == 'x' ? range : tickLength,
                    height = axisType == 'x' ? tickLength : range;

                container.append('text')
                    .attr('class', 'axis-title')
                    .style('text-anchor', 'middle')
                    .attr('transform', axisType == 'x' ? '' : 'rotate(-90)')
                    .text(layout.title)
                    .attrs({
                        x: axisType == 'x' ? width / 2 : -height / 2,
                        y: axisType == 'x' ? height + offset + 15 : -offset - 10
                    });
            }
        }

        axis.tickSizeInner(layout.showGrid ? -tickLength : 0);
        this.axisSvgs[axisSvg].call(axis);
        BaseLineagePlotController.adjustAxisStyles(this.axisSvgs[axisSvg], layout);
    }

    static adjustAxisStyles(axis, layout) {
        axis.selectAll('.domain').style('opacity', layout.showAxisLine ? 1 : 1e-6);

        if (layout.showGrid) {
            axis.selectAll('.tick line')
                .attr('stroke', '#ccc')
                .style('shape-rendering', 'crispEdges');
        } else {
            axis.selectAll('.tick line').style('opacity', 1e-6);
        }

        if (layout.showTickText) {
            axis.selectAll('.tick text').attr('font-size', 12);
        } else {
            axis.selectAll('.tick text').style('opacity', 1e-6);
        }
    }

    zoomToMinimumWidth() {
        if (!this.layout.minViewportWidth) return;
        let ratio;
        if (!this.isTimePlot) {
            let generationWidth = this.xScale.range()[1] / __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["n" /* getDomainLength */])(this.xScale);
            ratio = this.layout.minViewportWidth.generationWidth / generationWidth;
        } else {
            let pixelsPerSecond = this.xScale.range()[1] / __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["n" /* getDomainLength */])(this.xScale) * 1000;
            ratio = this.layout.minViewportWidth.timeIntervalInPixels /
                this.layout.minViewportWidth.timeIntervalInSeconds / pixelsPerSecond;
        }

        if (ratio > 1) {
            this.treeFixedContainer.call(this.zoom.transform, d3.xyzoomIdentity.scale(ratio, 1).translate(0, 0));
        }
    }

    drawLinks(redraw = true) {
        if (redraw) {
            this.link = this.treeContainer.append('g')
                .attr('class', 'link-layer')
                .selectAll('path.link')
                .data(this.nodes.filter(n => n.parent))
                .enter()
                .insert('path', 'g')
                .attr('class', 'link')
                .attr('marker-end', this.layout.showLinkArrowhead ?
                    `url(#marker-arrowhead)` : '')
                .attrs(this.layout.link);

            this.linkLabelLayer = this.treeContainer.append('g')
                .attr('class', 'link-label-layer');

            this.linkLabel = this.linkLabelLayer
                .selectAll('text.link-label')
                .data(this.linkLabelData)
                .enter()
                .append('text')
                .attr('class', 'link-label')
                .attr('text-anchor', 'middle')
                .text(d => d.nodeTo.data.inLinkLabel)
                .style('opacity', this.activeControls.has('label') ? 1 : 1e-6)
                .each(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["o" /* getLinkLabelBBox */])
                .attrs(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* skipProperties */])(this.layout.linkLabel, 'dy'));
        }

        this.link.attr('d', this.linkGenerator);
        this.linkLabel.attr('x', d => d.x)
            .attr('y', d => d.y);
    }

    drawLegend() {
        if (!this.layout.legend.show) return;

        let that = this,
            x = this.layout.legend.x,
            y = this.layout.legend.y,
            anchor = this.layout.legend.anchor,
            orientation = this.layout.legend.orientation,
            splitAfter = orientation === 'horizontal' ? 0 : 1,
            totalWidth = this.plotWidth + this.colorBarOffset;

        function legendClick(/*d, i, all*/) {
            let d = arguments[0],
                all = d3.selectAll(arguments[2]);
            if (that.activeSeries.has(d.label)) {
                that.activeSeries.delete(d.label);
                if (!that.activeSeries.size) {
                    all.each(d => {
                        d.active = true;
                        that.activeSeries.add(d.label);
                    });
                }
            } else {
                that.activeSeries.add(d.label);
            }
            all.classed('legend-item-selected', d => that.activeSeries.has(d.label));
            all.selectAll('rect.shape')
                .attr('fill', d => that.activeSeries.has(d.label) ? that.colors(d.label) : 'white');
            that.initializeData({isNewData: false});
            that.drawMainAxes();
            that.drawTrees();
            that.makeBrush();
            that.treeFixedContainer.call(that.zoom.transform, d3.xyzoomIdentity);
            that.makeLCD();
            that.makeTooltip();
        }

        let drawLegend = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["p" /* d3legend */])()
            .splitAfter(splitAfter)
            .anchor(anchor)
            .seriesNames(this.seriesNames)
            .colorScale(this.colors)
            .backgroundColor(this.layout.legend.backgroundColor || this.layout.backgroundColor)
            .maxSize({width: totalWidth, height: this.plotHeight})
            .onClick(legendClick)
            .selectedItems(this.activeSeries);

        this.svg.append('g')
            .attr('transform',
            `translate(${this.margin.left + x * totalWidth},${this.margin.top + y * this.plotHeight})`)
            .attr('class', 'ancestry-legend')
            .call(drawLegend);
    }

    makeHeatmapColorScale(nodes) {
        let domain = d3.extent(nodes, node => node.z);

        if (domain[0] == domain[1]) {
            if (domain[0] === undefined) {
                domain[0] = domain[1] = 0;
            }
            domain[0] -= 0.5;
            domain[1] += 0.5;
        }

        return d3.scaleLinear()
            .domain(domain)
            .range(this.layout.heatmap.colorScale.map(v => v[1]));
    }

    drawColorBar() {
        if (!this.layout.heatmap.enabled || !this.layout.heatmap.colorBar.show) return;

        this.layout.heatmap.colorBar.height = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* calcColorBarSize */])(this.layout.heatmap.colorBar.height,
            this.plotHeight);
        this.layout.heatmap.colorBar.width = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["q" /* calcColorBarSize */])(this.layout.heatmap.colorBar.width, this.plotWidth);

        let colorBar = this.treeFixedContainer.append('g')
            .attr('class', 'ancestry-colorbar')
            .attr('transform', `translate(${this.plotWidth + this.layout.heatmap.colorBar.padding.left},${
            this.plotHeight / 2})`);

        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["r" /* drawColorBar */])(colorBar, this.heatmapColorScale.domain(), this.layout.heatmap, this.defs);

        this.colorBarOffset = colorBar.node().getBBox().width + this.layout.heatmap.colorBar.padding.left +
            this.layout.heatmap.colorBar.padding.right;
    }

    makeTooltip() {
        if (!this.layout.tooltip.show) return;
        let that = this;

        this.marker.on('mouseover', function (d) {
            let x = 0, y = 0; // split into 2 lines to avoid WebStorm warning
            ({x, y} = __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["e" /* d3tooltip */].getRelativePosition(this, that._$element[0]));
            let seriesBar = that.layout.tooltip.showSeriesBar ?
                `<div class='tooltip-color-box' style=\'background-color: ${that.colors(d.data.series)}\'>` +
                '</div>' : '',
                text = d.data.tooltip ? d.data.tooltip.map((line) => {
                        return `<span align='${that.layout.tooltip.align}' class='tooltip-text'>${line}</span>`;
                    }).join('') : `<span class='tooltip-text'>${d.data.name}</span>`;

            that.tooltip.html(seriesBar + text).position([x, y]).show();
        })
        .on('mouseout', () => {
            this.tooltip.hide();
        });
    }

    //noinspection JSMethodCanBeStatic
    updatePositions(context) {
        for (let node of context.nodes) {
            node.x = context.xScale(context.plotOrigin[0] + (context.isTimePlot ? node._x.getTime() : node._x));
            node.y = context.yScale(context.plotOrigin[1] + node._y);
        }

        if (context.nodeLabelData) {
            for (let node of context.nodeLabelData) {
                node.x = node.node.x + node.currentLabelPos.x;
                node.y = node.node.y + node.currentLabelPos.y + node.dy;
            }
        }

        if (context.linkLabelData) {
            for (let node of context.linkLabelData) {
                node.x = (node.nodeTo.x + node.nodeTo.parent.x) / 2;
                node.y = (node.nodeTo.y + node.nodeTo.parent.y) / 2 + node.dy;
            }
        }
    }

    makeLCD() {
        if (this.layout.labelCollisionDetection.enabled === 'never') return;

        let order = [[], []];

        order[this.layout.labelCollisionDetection.order.nodeLabel - 1].push(this.nodeLabel);
        order[this.layout.labelCollisionDetection.order.linkLabel - 1].push(this.linkLabel);

        this.makeBBox();
        this.LCD = new __WEBPACK_IMPORTED_MODULE_3__shared_features_js__["s" /* LabelCollisionDetection */]([this.marker], order, this.layout.nodeLabelPositions,
            this.viewport, this.markerBBoxes);

        if (this.activeControls.has('label')) {
            this.LCD.recalculateLabels();
        }
    }

    makeZoom() {
        this.zoom = d3.xyzoom()
            .extent(this.viewport)
            .scaleExtent([[1, Infinity], [1, Infinity]])
            .translateExtent(this.viewport)
            .on('zoom', this.onZoom);
    }

    onDoubleClick() {
        this.xScale = this._xScale.copy();
        this.yScale = this._yScale.copy();
        this.treeFixedContainer.call(this.zoom.transform, d3.xyzoomIdentity);
        this.updateAndRedraw();
    }

    onZoom() {
        let event = d3.getEvent();

        this.transform = event.transform;
        this.xScale = this.transform.rescaleX(this._xScale);
        this.yScale = this.transform.rescaleY(this._yScale);
        this.updateAndRedraw();

        if (event.sourceEvent && (event.sourceEvent.type === 'brush' || event.sourceEvent.type === 'end')) return;

        let [x1, x2] = this.xScale.domain().map(this.brushContext.xScale),
            [y1, y2] = this.yScale.domain().map(this.brushContext.yScale);

        this.brushFixedContainer.call(this.brush.move, this.layout.brush.lockY ? [x1, x2] : [[x1, y1], [x2, y2]]);
    }

    applyLCD(transform) {
        if (!this.lcdEnabled) return;

        if (this.layout.labelCollisionDetection.enabled === 'onEveryChange') {
            this.LCD.recalculateLabels(transform);
        }
        else if (this.layout.labelCollisionDetection.enabled === 'onDelay') {
            window.clearTimeout(this.LCDUpdateID);
            this.LCDUpdateID = window.setTimeout(() => {
                this.LCD.recalculateLabels(transform);
            }, this.layout.labelCollisionDetection.updateDelay);
        }
    }

    makeControlPanel() {
        let controls = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* skipProperties */])(this.controlMappings, Array.from(this.hiddenControls)),
            controlOrder = Object.entries(this.layout.controls)
                .filter(([control, config]) => !this.hiddenControls.has(control))
                .sort(([control, config], [control2, config2]) => config.position - config2.position)
                .map(([control, config]) => control);

        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["t" /* createPlotControls */])(this._$element[0], controls, controlOrder, this.activeControls);
    }

    makeNodeSelection() {
        let that = this,
            mouseStart = null;

        // expose click for toggleSelect
        this.onNodeClick = onNodeClick;

        if (!this.layout.groupSelection.enabled) return;

        this.selectionRect = this.treeFixedContainer.append('rect')
            .attr('class', 'selection-rect')
            .attrs(this.layout.groupSelection.selectionRectangle);

        // expose mouse down for toggleSelect
        this.mouseDown = mouseDown;

        function onNodeClick(d) {
            d.data.selected = !d.data.selected;
            let node = d3.select(this);
            if (that._$attrs.customNode) {
                that.customNode({$selection: node, $event: 'select'});
            } else {
                node.style('fill', d => d.data.selected ? that.colors(d.data.series) : '#FFF');
            }
            updateSelection();
        }

        function updateSelection() {
            let newSelected = new Set(that.marker.filter(d => d.data.selected).data().map(d => d.data.name)),
                wasChange = newSelected.size != that.selectedNodesSet.size ||
                    (new Set([...that.selectedNodesSet].filter(x => !newSelected.has(x))).size != 0);

            if (wasChange) {
                that.selectedNodesSet = newSelected;
                if (that._$attrs.nodesSelection) {
                    that._$scope.$apply(() => {
                        that.nodesSelection({$nodes: Array.from(that.selectedNodesSet)});
                    });
                }
            }
        }

        function finalizeSelection() {
            that.selectionRect.attr('width', 0);
            updateSelection();
            that.marker.style('pointer-events', 'all');
            that.mouseRect.on('mousemove', null)
                .on('mouseup', null)
                .on('mouseout', null);
        }

        function mouseDown() {
            d3.getEvent().preventDefault();
            mouseStart = d3.mouse(that.mouseRect.node());
            that.mouseRect.on('mousemove', mouseMove)
                .on('mouseup', finalizeSelection)
                .on('mouseout', finalizeSelection);
            that.marker.each(d => {
                d._selected = d.data.selected;
            }).style('pointer-events', 'none');
        }

        function mouseMove() {
            let p = d3.mouse(that.mouseRect.node());
            let d = {
                x: (p[0] < mouseStart[0] ? p[0] : mouseStart[0]),
                y: (p[1] < mouseStart[1] ? p[1] : mouseStart[1]),
                height: Math.abs(p[1] - mouseStart[1]),
                width: Math.abs(p[0] - mouseStart[0])
            };
            that.selectionRect.attrs(d);
            selectPoints(that.selectionRect);
        }

        function selectPoints(rect) {
            let rect_x1 = +rect.attr('x'), rect_y1 = +rect.attr('y'),
                rect_x2 = +rect.attr('width') + rect_x1, rect_y2 = +rect.attr('height') + rect_y1;

            let [inSelection, outSelection] =
                that.marker.partition(d => d.x >= rect_x1 && d.x <= rect_x2 && d.y >= rect_y1 && d.y <= rect_y2);

            inSelection.each(d => {
                d.data.selected = true
            });
            outSelection.each(d => {
                d.data.selected = d._selected
            });
            if (that._$attrs.customNode) {
                that.customNode({$selection: that.marker, $event: 'select'});
            } else {
                that.marker.style('fill', d => d.data.selected ? that.colors(d.data.series) : '#FFF');
            }
        }
    }

    drawTitle() {
        if (this.layout.title) {
            this.treeFixedContainer.append('text')
                .attr('x', this.plotWidth / 2)
                .attr('y', -10)
                .attr('text-anchor', 'middle')
                .style('font-size', '20px')
                .text(this.layout.title);
        }
    }

    toggleZoom(toggle) {
        if (toggle) {
            this.treeFixedContainer.call(this.zoom)
                .on('dblclick.zoom', this.onDoubleClick);
        }
        else {
            this.treeFixedContainer.on('wheel.zoom', null)
                .on('mousedown.zoom', null)
                .on('dblclick.zoom', null)
                .on('touchstart.zoom', null)
                .on('touchmove.zoom', null)
                .on('touchend.zoom', null)
                .on('touchcancel.zoom', null);
        }
    }

    toggleSelect(toggle) {
        let that = this;

        if (this.layout.groupSelection.enabled) {
            this.mouseRect.on('mousedown', toggle ? this.mouseDown : null);
        }

        toggleNodeClickCallback();

        function toggleNodeClickCallback() {
            function nodeClickCallback(d) {
                that._$scope.$apply(() => {
                    that.nodeClick({$event: d3.getEvent(), $node: d.data});
                });
            }

            that.marker.on('click', toggle ? that.onNodeClick : (that._$attrs.nodeClick ? nodeClickCallback : null));
        }
    }

    toggleLabels(toggle) {
        if (this.layout.labelCollisionDetection.enabled != 'never' &&
            this.layout.labelCollisionDetection.enabled != 'onInit') {
            this.lcdEnabled = toggle;
            if (this.lcdEnabled) {
                this.LCD.recalculateLabels();
            }
        }
        this.nodeLabel.style('opacity', d => toggle && !d.isColliding ? 1 : 1e-6);
        this.linkLabel.style('opacity', d => toggle && !d.isColliding ? 1 : 1e-6);
    }

    download(){
        let format = this.layout.controls.download.format,
            saveFunc = format == 'png' ? __WEBPACK_IMPORTED_MODULE_2_save_svg_as_png__["saveSvgAsPng"] : __WEBPACK_IMPORTED_MODULE_2_save_svg_as_png__["saveSvg"];

        saveFunc(this.svg.node(), `plot.${format}`);
    }

    makeBBox() {

        let testNodeLabel = this.svg.append('text').text('yT'),
            testLinkLabel = this.svg.append('text').text('yT');

        testNodeLabel.attrs(this.layout.nodeLabel);
        testLinkLabel.attrs(this.layout.linkLabel);

        let nodeLabelHeight = testNodeLabel.node().getBBox().height,
            linkLabelHeight = testLinkLabel.node().getBBox().height;

        testNodeLabel.remove();
        testLinkLabel.remove();

        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');

        context.font = `${this.layout.nodeLabel['font-size']}px ${this.layout.nodeLabel['font-family']}`;

        this.nodeLabel.each(d => {
            d.width = context.measureText(d.node.data.name).width;
            d.height = nodeLabelHeight;
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["l" /* getNodeLabelBBox */])(d);
        });

        context.font = `${this.layout.linkLabel['font-size']}px ${this.layout.linkLabel['font-family']}`;

        this.linkLabel.each(d => {
            d.width = context.measureText(d.nodeTo.data.inLinkLabel).width;
            d.height = linkLabelHeight;
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["o" /* getLinkLabelBBox */])(d);
        });

        let nodeTypes = this.marker.data().map(d => d.data.type),
            uniqueNodeTypes = new Set(nodeTypes),
            markerBBoxes = {};

        for (let type of uniqueNodeTypes) {
            let node = this.marker.filter(d => d.data.type == type).node(),
                bbox = node.getBBox();

            markerBBoxes[type] = {width: bbox.width, height: bbox.height}
        }

        this.markerBBoxes = markerBBoxes;
    }

    toggleBrush(active) {
        this.svg.attr('height', active ? this.heightWithBrush : this.height);
        this.brushFixedContainer.style('display', active ? 'inline' : 'none')
    }

    makeBrush() {
        if (this.brushFixedContainer) { // remove brush if already exists
            this.brushFixedContainer.remove();
            this.svg.select('.brush-clip').remove();
        }
        let brushHeight = this.layout.brush.height,
            brushWidth = this.isCartesian ? this.plotWidth : this.plotWidth / (this.plotHeight /
                this.layout.brush.height);
        this.brushContext = {
            plotHeight: this.plotHeight,
            plotWidth: this.plotWidth,
            xScale: this.xScale.copy().range([0, brushWidth]),
            yScale: this.yScale.copy().range([0, brushHeight]),
            layout: this.layout,
            plotOrigin: this.plotOrigin,
            isTimePlot: this.isTimePlot
        };
        this.brushContext.nodes = this.prepareNodes(this.lastData, this.brushContext);
        this.brushContext.plotHeight = brushHeight;
        this.brushContext.plotWidth = brushWidth;
        this.updatePositions(this.brushContext);
        this.brushContext.plotOrigin = this.originAtCenter ? [brushWidth / 2, brushHeight / 2] : [0, 0];

        let fullExtent = [[0, 0], [brushWidth, brushHeight]],
            brushMarginTop = this.layout.brush.margin.top,
            lockY = this.layout.brush.lockY,
            clipRectId = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["f" /* getClipUniqueId */])(),
            that = this;

        this.defs.append('svg:clipPath')
            .attr('class', 'brush-clip')
            .datum(clipRectId)
            .attr('id', `clip-rect${clipRectId}`)
            .append('svg:rect')
            .attrs({
                x: -1,
                y: -1,
                width: brushWidth + 3,
                height: brushHeight + 3
            })
            .attrs(this.layout.brush.boxRectangle);

        this.brushFixedContainer = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left + (this.isCartesian ? 0 : this.plotWidth / 2 -
                brushWidth / 2)}, ${this.margin.top + this.plotHeight + brushMarginTop})`);

        this.drawBrushAxes();

        this.brushContainer = this.brushFixedContainer.append('g')
            .attr('clip-path', `url(#clip-rect${clipRectId})`);

        if (this.layout.brush.drawTrees) {
            this.brushContainer.append('g')
                .attr('class', 'link-layer')
                .selectAll('path.link')
                .data(this.brushContext.nodes.filter(n => n.parent))
                .enter()
                .insert('path', 'g')
                .attr('class', 'link')
                .attr('marker-end', this.layout.showLinkArrowhead ?
                    `url(#marker-arrowhead)` : '')
                .attr('d', this.linkGenerator)
                .attrs(this.layout.link);

            let brushMarker = this.brushContainer.append('g')
                .attr('class', 'node-marker-layer')
                .selectAll('circle.node-marker')
                .data(this.brushContext.nodes.filter(d => !d.data.hide))
                .enter();

            if (that._$attrs.customNode) {
                this.customNode({$selection: brushMarker, $event: 'draw'});
            } else {
                brushMarker.append('circle')
                    .attr('class', 'node-marker')
                    .style('fill', 'white')
                    //.style('fill', d => d.data.selected ? this.colors(d.data.series) : '#FFF')
                    .style('stroke', d => this.colors(d.data.series))
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y)
                    .attrs(this.nodeAttr);
            }
        }

        this.brushFixedContainer.append('rect')
            .attr('fill', 'none')
            .style('shape-rendering', 'crispEdges')
            .attr('x', -1)
            .attr('y', -1)
            .attr('width', brushWidth + 2)
            .attr('height', brushHeight + 2)
            .attrs(this.layout.brush.boxRectangle);

        this.brush = (lockY ? d3.brushX : d3.brush)()
            .extent(fullExtent)
            .on('brush end', brushed);

        this.brushFixedContainer
            .call(this.brush)
            .call(this.brush.move, null);

        this.toggleBrush(that.activeControls.has('brush'));

        function isFullView(s) {
            return lockY ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["u" /* almostEq */])(s[0], 0) && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["u" /* almostEq */])(s[1], that.brushContext.plotWidth) :
                (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["u" /* almostEq */])(s[0][0], 0) && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["u" /* almostEq */])(s[0][1], 0) && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["u" /* almostEq */])(s[1][0], that.brushContext.plotWidth) &&
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["u" /* almostEq */])(s[1][1], that.brushContext.plotHeight));
        }

        function brushed() {
            let event = d3.getEvent(),
                s = event.selection;

            if ((!s && that.layout.brush.brushRectangleOnFullView)) {
                that.brushFixedContainer
                    .call(that.brush.move, lockY ? [0, that.brushContext.plotWidth] : fullExtent);
                return;
            } else if (!that.layout.brush.brushRectangleOnFullView && s && isFullView(s)) {
                that.brushFixedContainer
                    .call(that.brush.move, null);
                return;
            }

            let sx = s != null ? (lockY ? [s[0], s[1]] : [s[0][0], s[1][0]]) : that.brushContext.xScale.range(),
                sy = s != null ? (lockY ? [0, that.brushContext.plotHeight] : [s[0][1], s[1][1]])
                    : that.brushContext.yScale.range(),
                dx1 = sx.map(that.brushContext.xScale.invert, that.brushContext.xScale), dx2 = that._xScale.domain(),
                dy1 = sy.map(that.brushContext.yScale.invert, that.brushContext.yScale), dy2 = that._yScale.domain(),
                kx = (dx2[1] - dx2[0]) / (dx1[1] - dx1[0]),
                ky = (dy2[1] - dy2[0]) / (dy1[1] - dy1[0]),
                newTransform = d3.xyzoomIdentity
                    .scale(kx, ky)
                    .translate(-that._xScale(that.brushContext.xScale.invert(sx[0])),
                        -that._yScale(that.brushContext.yScale.invert(sy[0])));

            if (isFinite(kx) && isFinite(ky)) {
                that.treeFixedContainer.call(that.zoom.transform, newTransform);
            }
        }
    }
}

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        //noinspection JSCheckFunctionSignatures
        this.parentNode.appendChild(this);
    });
};

BaseLineagePlotController.$$ngIsClass = true; // temporary Firefox fix

/* harmony default export */ __webpack_exports__["a"] = BaseLineagePlotController;


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_8__;

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_default_layout_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shared_features_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__base_radial_lineage_plot_css__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__base_radial_lineage_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__base_radial_lineage_plot_css__);







let d3 = Object.assign({},
    __webpack_require__(0),
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(5),
    __webpack_require__(8)
);

d3.getEvent = () => __webpack_require__(0).event;

let baseRadialLineageLayout = {
    plotPadding: {
        x: 0,
        y: 20
    },
    controls: {
        rotate: {
            show: true,
            enabled: false,
            position: 2.5
        }
    }
};

class BaseRadialLineagePlotController extends __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__["a" /* default */] {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        this.originAtCenter = true;
        this.isCartesian = false;
        this.totalRotation = 0;
        this.controlMappings.rotate = this.toggleRotate.bind(this);
    }

    static getLayoutTemplate() {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["a" /* mergeTemplateLayout */])(baseRadialLineageLayout, __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_default_layout_js__["a" /* default */]);
    }

    linkGenerator(d) {
        let s = [d.parent.x, d.parent.y],
            t = [d.x, d.y],
            rx = d.parent._r2 * this.transform.kx,
            ry = d.parent._r2 * this.transform.ky,
            sweep = d._theta > d.parent._theta ? 1 : 0,
            largeArc = Math.abs(d._theta - d.parent._theta) % 360 > 180 ? 1 : 0;

        return `M${s[0]},${s[1]}A${rx},${ry} 0 ${largeArc},${sweep} ${d.m[0]},${d.m[1]}L${t[0]},${t[1]}`;
    }

    setupScales() {
        this.xExtent = d3.extent(this.nodes, node => this.isTimePlot ? new Date(node.data.date * 1000) : node.depth);

        this.xScale = d3.scaleLinear()
            .domain([0, this.plotWidth])
            .range([0, this.plotWidth]);

        this.yScale = d3.scaleLinear()
            .domain([0, this.plotHeight])
            .range([0, this.plotHeight]);
    }

    updatePositions(context) {
        for (let node of context.nodes) {
            node.x = context.xScale(context.plotOrigin[0] + node._x);
            node.y = context.yScale(context.plotOrigin[1] + node._y);
            node.m = [context.xScale(context.plotOrigin[0] + node._m[0]),
                context.yScale(context.plotOrigin[1] + node._m[1])];
        }

        if (context.nodeLabelData) {
            for (let node of context.nodeLabelData) {
                node.x = node.node.x + node.currentLabelPos.x;
                node.y = node.node.y + node.currentLabelPos.y + node.dy;
            }
        }

        if (context.linkLabelData) {
            for (let node of this.linkLabelData) {
                node.x = (node.nodeTo.x + node.nodeTo.m[0]) / 2;
                node.y = (node.nodeTo.y + node.nodeTo.m[1]) / 2 + node.dy;
            }
        }
    }

    adjustScales() {}

    drawMainAxes() {}

    drawBrushAxes() {}

    toggleRotate(toggle) {
        let that = this,
            start = null,
            delta;
        if (toggle) {
            this.treeFixedContainer
                .on('dblclick', this.onDoubleClick)
                .on("mousedown", function () {
                    d3.getEvent().preventDefault();
                    that.svg.style("cursor", "move");
                    that.marker.style('pointer-events', 'none');
                    start = that.transform.invert(d3.mouse(that.treeContainer.node()))
                        .map((d, i) => d - that.plotOrigin[i]);
                })
                .on("mouseup", mouseOutUp)
                .on("mouseout", mouseOutUp)
                .on("mousemove", function () {
                    if (!start) return;
                    d3.getEvent().preventDefault();

                    let m = that.transform.invert(d3.mouse(that.treeContainer.node()))
                        .map((d, i) => d - that.plotOrigin[i]);

                    delta = Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;

                    for (let node of that.nodes) {
                        node._theta = node._lastTheta + delta;
                        [node._x, node._y] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["c" /* project */])(node);
                        node._m = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["c" /* project */])({_theta: node._theta, _r: node.parent ? node.parent._r : 0});
                    }
                    that.updateAndRedraw();
                });
        }
        else {
            this.treeFixedContainer.on('dblclick', null)
                .on('mousedown', null)
                .on('mouseup', null)
                .on('mousemove', null)
                .on('mouseout', null);
        }

        function mouseOutUp() {
            if (!start) return;
            that.totalRotation += delta;
            start = null;
            delta = 0;
            for (let node of that.nodes) {
                node._lastTheta = node._theta;
            }
            if (that.totalRotation !== null) {
                that.brushContainer.attr('transform', `rotate(${that.totalRotation},${that.brushContext.plotOrigin[0]
                    },${that.brushContext.plotOrigin[1]})`);
            }
            that.svg.style("cursor", "auto");
            that.marker.style('pointer-events', 'all');
        }
    }
}

/* harmony default export */ __webpack_exports__["a"] = BaseRadialLineagePlotController;

function spreadNodes(node, level=0) {
    if (!node.children || !node.children.length) {
        node.depth = 1;
        return level;
    }
    let max = 1, childMax;
    for (let child of node.children) {
        childMax = spreadNodes(child, level + 1);
        if (childMax > max) {
            max = childMax;
        }
    }
    node.depth = level / max;
    return max;
}

function cross(a, b) { return a[0] * b[1] - a[1] * b[0]; }

function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_10__;

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_default_layout_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shared_features_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__lineage_plot_css__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__lineage_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__lineage_plot_css__);







let d3 = Object.assign({},
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(5)
);

let lineageLayout = {
    axis: {
        x: {
            title: null,
            showAxisLine: false,
            showGrid: true,
            showTickText: true
        }
    },
    brush: {
        axis: {
            x: {
                title: null,
                showAxisLine: false,
                showGrid: true,
                showTickText: true
            }
        }
    }
};


class LineagePlotController extends __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__["a" /* default */] {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-lineage-plot');
    }

    static getLayoutTemplate() {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["a" /* mergeTemplateLayout */])(lineageLayout, __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_default_layout_js__["a" /* default */]);
    }

    linkGenerator(d) {
        let c = Math.abs(d.parent.x - d.x) / 2;

        return 'M' + d.x + ',' + d.y
            + 'C' + (d.parent.x + c) + ',' + d.y
            + ' ' + (d.parent.x + c) + ',' + d.parent.y
            + ' ' + d.parent.x + ',' + d.parent.y;
    }

    setupScales() {
        this.xExtent = d3.extent(this.nodes, node => this.isTimePlot ? new Date(node.data.date * 1000) : node.depth);

        this.xScale = (this.isTimePlot ? d3.scaleTime() : d3.scaleLinear())
            .domain(this.xExtent)
            .range([0, this.plotWidth]);

        this.yScale = d3.scaleLinear()
            .domain([0, this.plotHeight])
            .range([0, this.plotHeight]);
    }

    drawMainAxes() {
        this.drawAxis(this.treeFixedContainer, 'x-main', this.xScale, this.plotHeight, true, this.isTimePlot);
    }

    drawBrushAxes() {
        this.drawAxis(this.brushFixedContainer, 'x-brush', this.brushContext.xScale, this.brushContext.plotHeight, true,
            this.isTimePlot);
    }

    prepareNodes(data, context) {
        let root = {name: 'virtualRoot', children: [], parent: null};

        let allTrees = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["v" /* createTreeLayout */])(data);

        root.children = allTrees.map(node => {
            node.parent = 'virtualRoot';
            return node;
        });

        let hierarchy = d3.hierarchy(root, d => d.children);

        if (context.isTimePlot) {
            (function calcTotalChildren(node) {
                node.totalChildren = 0;
                if (!node.children || node.children.length == 0) {
                    return 1;
                }
                for (let child of node.children) {
                    node.totalChildren += calcTotalChildren(child);
                }
                return node.totalChildren;
            })(hierarchy);

            hierarchy.each(node => {
                let oldChildren = node.children;
                if (!oldChildren || oldChildren.length == 0) {
                    return;
                }
                let newChildren = [];
                oldChildren.sort((a, b) => (a.totalChildren - b.totalChildren) || (b.data.date - a.data.date));
                while (oldChildren.length) {
                    newChildren[oldChildren.length % 2 === 0 ? 'push' : 'unshift'](oldChildren.shift());
                }
                node.children = newChildren;
            });
        }

        let treeLayout = d3.tree().size([context.plotHeight, context.plotWidth]),
            nodes = treeLayout(hierarchy).descendants().filter(n => n.parent !== null);

        for (let node of nodes) {
            node._y = node.x;
            node._x = context.isTimePlot ? new Date(node.data.date * 1000) : node.depth;
            if (node.parent.data.name === 'virtualRoot') {
                node.parent = null;
            }
        }

        return nodes.filter(node => node.data.name !== 'virtualRoot');
    }
}

const LineagePlotComponent = {
    template: '',
    controller: LineagePlotController,
    bindings: {
        plotData: '<',
        plotLayout: '<',
        nodesSelection: '&',
        nodeClick: '&',
        customNode: '&'
    }
};

/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_3_angular___default.a.module('ancestry.lineage', [])
    .component('lineagePlot', LineagePlotComponent);


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_default_layout_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shared_features_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__lineage_scatter_plot_css__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__lineage_scatter_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__lineage_scatter_plot_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_angular__);







let d3 = Object.assign({},
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(5)
);

let lineageScatterLayout = {
    showLinkArrowhead: true,
    link: {
        'stroke-dasharray': 4
    },
    axis: {
        x: {
            title: null,
            format: 'g',
            showAxisLine: true,
            showGrid: true,
            showTickText: true
        },
        y: {
            title: null,
            format: 'g',
            showAxisLine: true,
            showGrid: true,
            showTickText: true
        }
    },
    brush: {
        axis: {
            x: {
                title: null,
                format: 'g',
                showAxisLine: false,
                showGrid: true,
                showTickText: true
            },
            y: {
                title: null,
                format: 'g',
                showAxisLine: false,
                showGrid: true,
                showTickText: true
            }
        }
    }
};


class LineageScatterPlotController extends __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__["a" /* default */] {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-lineage-scatter-plot');
    }

    static getLayoutTemplate() {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["a" /* mergeTemplateLayout */])(lineageScatterLayout, __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_default_layout_js__["a" /* default */]);
    }

    linkGenerator(d) {
        return `M ${d.parent.x} ${d.parent.y} L ${d.x} ${d.y}`;
    }

    setupScales() {
        this.xExtent = d3.extent(this.nodes, node => node._x);

        this.xScale = (this.isTimePlot ? d3.scaleTime() : d3.scaleLinear())
            .domain(this.xExtent)
            .range([0, this.plotWidth]);

        this.yScale = d3.scaleLinear()
            .domain(d3.extent(this.nodes, node => node._y).reverse())
            .range([0, this.plotHeight]);
    }

    drawMainAxes() {
        this.drawAxis(this.treeFixedContainer, 'x-main', this.xScale, this.plotHeight);
        this.drawAxis(this.treeFixedContainer, 'y-main', this.yScale, this.plotWidth);
    }

    drawBrushAxes() {
        this.drawAxis(this.brushFixedContainer, 'x-brush', this.brushContext.xScale, this.brushContext.plotHeight);
        this.drawAxis(this.brushFixedContainer, 'y-brush', this.brushContext.yScale, this.brushContext.plotWidth);
    }

    prepareNodes(data) {
        let root = {name: 'virtualRoot', children: [], parent: null};

        let allTrees = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["v" /* createTreeLayout */])(data);

        root.children = allTrees.map(node => {
            node.parent = 'virtualRoot';
            return node;
        });

        let hierarchy = d3.hierarchy(root, d => d.children),
            nodes = hierarchy.descendants().filter(n => n.parent !== null);

        for (let node of nodes) {
            node._y = node.data.y;
            node._x = node.data.x;
            if (node.parent.data.name === 'virtualRoot') {
                node.parent = null;
            }
        }

        return nodes.filter(node => node.data.name !== 'virtualRoot');
    }
}

const LineageScatterPlotComponent = {
    template: '',
    controller: LineageScatterPlotController,
    bindings: {
        plotData: '<',
        plotLayout: '<',
        nodesSelection: '&',
        nodeClick: '&',
        customNode: '&'
    }
};

/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_4_angular___default.a.module('ancestry.lineage-scatter', [])
    .component('lineageScatterPlot', LineageScatterPlotComponent);







/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_radial_lineage_plot_base_radial_lineage_plot_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shared_features_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__radial_lineage_plot_css__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__radial_lineage_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__radial_lineage_plot_css__);






let d3 = Object.assign({},
    __webpack_require__(0),
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(5),
    __webpack_require__(8)
);

d3.getEvent = () => __webpack_require__(0).event;

let radialLineageLayout = {
    sameLevel: 'both' // 'roots', 'leaves' or 'both'
};


class RadialLineagePlotController extends __WEBPACK_IMPORTED_MODULE_0__base_radial_lineage_plot_base_radial_lineage_plot_js__["a" /* default */] {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-lineage-plot');
    }

    static getLayoutTemplate() {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__shared_features_js__["a" /* mergeTemplateLayout */])(radialLineageLayout, __WEBPACK_IMPORTED_MODULE_0__base_radial_lineage_plot_base_radial_lineage_plot_js__["a" /* default */].getLayoutTemplate());
    }

    prepareNodes(data, context) {
        let root = {name: 'virtualRoot', children: [], parent: null};

        let allTrees = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__shared_features_js__["v" /* createTreeLayout */])(data),
            multipleTreeOffset = allTrees.length == 1 ? 0 : 30;

        root.children = allTrees.map(node => {
            node.parent = 'virtualRoot';
            return node;
        });

        let r = Math.min(context.plotHeight, context.plotWidth) / 2,
            totalTreeLength = r - multipleTreeOffset - Math.max(...Object.values(context.layout.plotPadding));

        let hierarchy = d3.hierarchy(root, d => d.children).sort((a,b) => b.depth - a.depth),
            treeLayout = (context.layout.sameLevel == 'roots' ? d3.tree : d3.cluster)().size([360, 1]),
            nodes = treeLayout(hierarchy).descendants().filter(n => n.parent !== null);

        for (let child of hierarchy.children) {
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__shared_features_js__["b" /* spreadNodes */])(child);
        }

        for (let node of nodes) {
            node._theta = node.x;
            node._lastTheta = node.x;
            node._r = multipleTreeOffset + (context.layout.sameLevel == 'both' ? node.depth : node.y) * totalTreeLength;
            [node._x, node._y] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__shared_features_js__["c" /* project */])(node);
            // below is hack to calculate curvature of brush links correctly
            node._r2 = context.xScale ? Math.sqrt(Math.pow(context.xScale(context.plotOrigin[0] + node._x) -
                    context.xScale(context.plotOrigin[0]), 2) + Math.pow(context.yScale(context.plotOrigin[1] + node._y)
                    - context.yScale(context.plotOrigin[1]), 2)) : node._r;
            node._m = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__shared_features_js__["c" /* project */])({_theta: node._theta, _r: node.parent._r});
            if (node.parent.data.name === 'virtualRoot') {
                node.parent = null;
            }
        }

        return nodes.filter(node => node.data.name !== 'virtualRoot');
    }
}

const RadialLineagePlotComponent = {
    template: '',
    controller: RadialLineagePlotController,
    bindings: {
        plotData: '<',
        plotLayout: '<',
        nodesSelection: '&',
        nodeClick: '&',
        customNode: '&'
    }
};

/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_2_angular___default.a.module('ancestry.radial-lineage', [])
    .component('radialLineagePlot', RadialLineagePlotComponent);

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_radial_lineage_plot_base_radial_lineage_plot_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shared_features_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__radial_phylogenetic_tree_css__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__radial_phylogenetic_tree_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__radial_phylogenetic_tree_css__);






let d3 = Object.assign({},
    __webpack_require__(0),
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(5),
    __webpack_require__(8)
);

d3.getEvent = () => __webpack_require__(0).event;

let radialPhylogeneticTreeLayout = {
    showBranchLength: true
};

class RadialPhylogeneticTreeController extends __WEBPACK_IMPORTED_MODULE_0__base_radial_lineage_plot_base_radial_lineage_plot_js__["a" /* default */] {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-radial-lineage-plot');
        this.flatInput = false;
    }

    static getLayoutTemplate() {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__shared_features_js__["a" /* mergeTemplateLayout */])(radialPhylogeneticTreeLayout, __WEBPACK_IMPORTED_MODULE_0__base_radial_lineage_plot_base_radial_lineage_plot_js__["a" /* default */].getLayoutTemplate());
    }

    prepareNodes(data, context) {
        let root = {name: 'virtualRoot', parent: null, children: data};

        let multipleTreeOffset = data.length == 1 ? 0 : 30;

        let r = Math.min(context.plotHeight, context.plotWidth) / 2,
            totalTreeLength = r - multipleTreeOffset - Math.max(...Object.values(context.layout.plotPadding));

        removeNegativeLengths(root);
        setRadius(root, root.length = 0, totalTreeLength / maxLength(root));

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

        let hierarchy = d3.hierarchy(root, d => d.children).sort((a,b) => b.depth - a.depth),
            treeLayout = d3.cluster().size([360, 1]).separation(() => 1),
            nodes = treeLayout(hierarchy).descendants().filter(n => n.parent !== null);

        for (let child of hierarchy.children) {
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__shared_features_js__["b" /* spreadNodes */])(child);
        }

        for (let node of nodes) {
            node._r = this.layout.showBranchLength ? node.data.radius
                : multipleTreeOffset + node.depth * totalTreeLength;
            node.data = node.data.taxon || {hide: true};
            node._theta = node.x;
            node._lastTheta = node.x;
            [node._x, node._y] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__shared_features_js__["c" /* project */])(node);
            // below is hack to calculate curvature of brush links correctly
            node._r2 = context.xScale ? Math.sqrt(Math.pow(context.xScale(context.plotOrigin[0] + node._x) -
                context.xScale(context.plotOrigin[0]), 2) + Math.pow(context.yScale(context.plotOrigin[1] + node._y)
                - context.yScale(context.plotOrigin[1]), 2)) : node._r;
            node._m = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__shared_features_js__["c" /* project */])({_theta: node._theta, _r: node.parent._r});
            if (node.parent.data.name === 'virtualRoot') {
                node.parent = null;
            }
        }

        return nodes.filter(node => node.data.name !== 'virtualRoot');
    }

    static filterSeries(trees, activeSeries) {
        let newTrees = [];
        for (let tree of trees) {
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
            let leavesOut = leaves.filter(l => !activeSeries.has(l.taxon.series));

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
            if (tree.children) newTrees.push(tree);
        }
        return newTrees;
    }
}

const RadialPhylogeneticTreeComponent = {
    template: '',
    controller: RadialPhylogeneticTreeController,
    bindings: {
        plotData: '<',
        plotLayout: '<',
        nodesSelection: '&',
        nodeClick: '&',
        customNode: '&'
    }
};

/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_2_angular___default.a.module('ancestry.radial-phylogenetic-tree', [])
    .component('radialPhylogeneticTree', RadialPhylogeneticTreeComponent);


/***/ }),
/* 15 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 16 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 17 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 18 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 19 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 20 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 21 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 22 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_23__;

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_24__;

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_25__;

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_26__;

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_27__;

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_28__;

/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lineage_plot_lineage_plot_js__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lineage_scatter_plot_lineage_scatter_plot_js__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__radial_lineage_plot_radial_lineage_plot_js__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__radial_phylogenetic_tree_radial_phylogenetic_tree_js__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__common_css__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__common_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__common_css__);






/* harmony default export */ __webpack_exports__["default"] = __WEBPACK_IMPORTED_MODULE_0_angular___default.a.module('ancestry', [
    'ancestry.lineage',
    'ancestry.lineage-scatter',
    'ancestry.radial-lineage',
    'ancestry.radial-phylogenetic-tree'
]);

/***/ })
/******/ ]);
});