(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("d3-selection"), require("angular"), require("d3-array"), require("d3-scale"), require("d3-hierarchy"), require("d3-zoom"), require("d3-axis"), require("d3-brush"), require("d3-format"), require("d3-quadtree"), require("d3-selection-multi"), require("d3-xyzoom"), require("save-svg-as-png"));
	else if(typeof define === 'function' && define.amd)
		define(["d3-selection", "angular", "d3-array", "d3-scale", "d3-hierarchy", "d3-zoom", "d3-axis", "d3-brush", "d3-format", "d3-quadtree", "d3-selection-multi", "d3-xyzoom", "save-svg-as-png"], factory);
	else if(typeof exports === 'object')
		exports["ancestry"] = factory(require("d3-selection"), require("angular"), require("d3-array"), require("d3-scale"), require("d3-hierarchy"), require("d3-zoom"), require("d3-axis"), require("d3-brush"), require("d3-format"), require("d3-quadtree"), require("d3-selection-multi"), require("d3-xyzoom"), require("save-svg-as-png"));
	else
		root["ancestry"] = factory(root["d3-selection"], root["angular"], root["d3-array"], root["d3-scale"], root["d3-hierarchy"], root["d3-zoom"], root["d3-axis"], root["d3-brush"], root["d3-format"], root["d3-quadtree"], root["d3-selection-multi"], root["d3-xyzoom"], root["save-svg-as-png"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_12__, __WEBPACK_EXTERNAL_MODULE_36__, __WEBPACK_EXTERNAL_MODULE_37__, __WEBPACK_EXTERNAL_MODULE_38__, __WEBPACK_EXTERNAL_MODULE_39__, __WEBPACK_EXTERNAL_MODULE_40__, __WEBPACK_EXTERNAL_MODULE_41__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 42);
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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_element_resize_detector__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_element_resize_detector___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_element_resize_detector__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__icons_sprite_css__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__icons_sprite_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__icons_sprite_css__);
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
/* harmony export (immutable) */ __webpack_exports__["w"] = adjustExtent;
/* harmony export (immutable) */ __webpack_exports__["k"] = allocatePaddingInScale;
/* unused harmony export getTranslation */
/* harmony export (immutable) */ __webpack_exports__["d"] = attachActionOnResize;
/* unused harmony export toggleSelectionDisplay */



let d3 = Object.assign({},
    __webpack_require__(0),
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(12),
    __webpack_require__(38)
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
        node.depth = node.data.parent == 'virtualRoot' ? 0 : 1;
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

// if extent is [x, x], change to [x - 0.5, x + 0.5] (analogically for time extent, but use a day)
function adjustExtent(extent, isTimeExtent=false) {
    let offset = isTimeExtent ? 86400 : 0.5;

    if (isTimeExtent) {
        extent = extent.map(d => d.getTime() / 1000);
    }

    if (extent[0] == extent[1]) {
        extent = [extent[0] - offset, extent[0] + offset];
    }
    return isTimeExtent ? extent.map(d => new Date(d * 1000)) : extent;
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

function attachActionOnResize(element, action) {
    let lastUpdate = performance.now(),
        scheduleId = null;

    __WEBPACK_IMPORTED_MODULE_0_element_resize_detector___default()({
        strategy: "scroll"
    }).listenTo(element, function () {
        let now = performance.now();

        if (now - lastUpdate < 500) {
            clearTimeout(scheduleId);
        }
        lastUpdate = now;
        scheduleId = setTimeout(action, 500);
    });
}

function toggleSelectionDisplay(selectionInViewport, selectionNotInViewport) {
    selectionInViewport.style('display', 'inline');
    selectionNotInViewport.style('display', 'none');
}

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_css__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_save_svg_as_png__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_save_svg_as_png___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_save_svg_as_png__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shared_features_js__ = __webpack_require__(4);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return defaultBindings; });




let d3 = Object.assign({},
    __webpack_require__(0),
    __webpack_require__(39),
    __webpack_require__(37),
    __webpack_require__(40),
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(12),
    __webpack_require__(36)
);

d3.getEvent = () => __webpack_require__(0).event;



class BaseLineagePlotController {
    constructor($element, $window, $scope, $attrs) {
        this._$window = $window;
        this._$element = $element;
        this._$scope = $scope;
        this._$attrs = $attrs;

        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["d" /* attachActionOnResize */])($element[0], () => {
            if (this.plotData === undefined || this.plotLayout === undefined) return;
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
            if (this.plotData === undefined || this.plotLayout === undefined) return;
            if (this._$attrs.customLink) {
                let that = this;
                this.linkGenerator = (function (d) {
                    return that.customLink({$linkObject: d});
                }).bind(this);
            }
            this.axisSvgs = {};
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
                orient: 'auto',
                markerUnits: 'userSpaceOnUse'
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
        this.attachNodeLinkCallbacks();
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

        this.linkData = [];
        this.nodeLabelData = [];
        this.linkLabelData = [];

        for (let node of this.nodes) {
            let linkDatum = null;
            if (node.parent) {
                let linkLabelDatum = null;
                if (node.data.inLinkLabel != null) {
                    linkLabelDatum = {
                        text: node.data.inLinkLabel,
                        dy: this.layout.linkLabel.dy
                    };
                    this.linkLabelData.push(linkLabelDatum);
                }
                linkDatum = {
                    sourceNode: node.parent,
                    targetNode: node,
                    label: linkLabelDatum
                };
                if (linkLabelDatum !== null) linkLabelDatum.link = linkDatum;
                this.linkData.push(linkDatum);
            }
            let nodeLabelDatum = {
                text: node.data.name,
                currentLabelPos: this.layout.nodeLabelPositions[0],
                dy: this.layout.nodeLabel.dy,
                node: node
            };
            this.nodeLabelData.push(nodeLabelDatum);
            node.inLink = linkDatum;
            node.label = nodeLabelDatum;
        }

        this.nodes.filter(d => d.parent).map(d => {
            return {
                sourceNode: d.parent,
                targetNode: d
            }
        });

        this.setupScales();
        this.adjustScales();

        this._xScale = this.xScale.copy();
        this._yScale = this.yScale.copy();

        this.colorBarOffset = 0;
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

            this.marker.each(function(d) {d.DOMElement = this;});

            this.nodeLabel = this.treeContainer.append('g')
                .attr('class', 'node-label-layer')
                .selectAll('text.node-label')
                .data(this.nodeLabelData)
                .enter()
                .append('text')
                .attr('class', 'node-label')
                .text(d => d.text)
                .style('opacity', this.activeControls.has('label') ? 1 : 1e-6)
                .each(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["l" /* getNodeLabelBBox */])
                .attr('text-anchor', d => d.currentLabelPos['text-anchor'])
                .attrs(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* skipProperties */])(this.layout.nodeLabel, 'dy'))
                .each(function(d) {d.DOMElement = this;});
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
                .data(this.linkData)
                .enter()
                .insert('path', 'g')
                .attr('class', 'link')
                .attr('marker-end', this.layout.showLinkArrowhead ?
                    `url(#marker-arrowhead)` : '')
                .attrs(this.layout.link)
                .each(function(d) {d.DOMElement = this;});

            this.linkCapture = this.treeContainer.append('g')
                .attr('class', 'link-capture-layer')
                .selectAll('path.link')
                .data(this.linkData)
                .enter()
                .insert('path', 'g')
                .attr('class', 'link-capture')
                .attr('marker-end', this.layout.showLinkArrowhead ?
                    `url(#marker-arrowhead)` : '')
                .attrs(this.layout.link)
                .attr('stroke', 'transparent')
                .attr('stroke-width', this.layout.linkCaptureWidth)

            this.linkLabelLayer = this.treeContainer.append('g')
                .attr('class', 'link-label-layer');

            this.linkLabel = this.linkLabelLayer
                .selectAll('text.link-label')
                .data(this.linkLabelData)
                .enter()
                .append('text')
                .attr('class', 'link-label')
                .attr('text-anchor', 'middle')
                .text(d => d.text)
                .style('opacity', this.activeControls.has('label') ? 1 : 1e-6)
                .each(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["o" /* getLinkLabelBBox */])
                .attrs(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_features_js__["m" /* skipProperties */])(this.layout.linkLabel, 'dy'))
                .each(function(d) {d.DOMElement = this;});
        }

        this.link.attr('d', this.linkGenerator);
        this.linkCapture.attr('d', this.linkGenerator);
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
            that.attachNodeLinkCallbacks();
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
            for (let label of context.nodeLabelData) {
                label.x = label.node.x + label.currentLabelPos.x;
                label.y = label.node.y + label.currentLabelPos.y + label.dy;
            }
        }

        if (context.linkLabelData) {
            for (let label of context.linkLabelData) {
                label.x = (label.link.sourceNode.x + label.link.targetNode.x) / 2;
                label.y = (label.link.sourceNode.y + label.link.targetNode.y) / 2 + label.dy;
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
        this.nodeClickSelect = onNodeClick;

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
            that.link.style('pointer-events', 'all');
            that.linkCapture.style('pointer-events', 'all');
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
            that.link.style('pointer-events', 'none');
            that.linkCapture.style('pointer-events', 'none');
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

        that.marker.on('click', toggle ? this.nodeClickSelect : (that._$attrs.nodeClick ?
            this.generateCallback('nodeClick') : null));
    }

    generateCallback(action) {
        let that = this;
        return function(d) {
            that._$scope.$apply(() => {
                that[action]({$event: d3.getEvent(), $object: d});
            });
        }
    }

    attachNodeLinkCallbacks() {
        let that = this;

        for (let action of ['click', 'mouseOver', 'mouseOut']) {
            let suffix = action.charAt(0).toUpperCase() + action.slice(1),
                nodeFunc = 'node' + suffix,
                linkFunc = 'link' + suffix;

            that.marker.on(action.toLowerCase(), that._$attrs[nodeFunc] ? this.generateCallback(nodeFunc) : null);
            that.linkCapture.on(action.toLowerCase(), that._$attrs[linkFunc] ? this.generateCallback(linkFunc) : null);
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
            d.width = context.measureText(d.text).width;
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
                .data(this.brushContext.nodes.filter(n => n.parent).map(d => {
                    return {
                        sourceNode: d.parent,
                        targetNode: d
                    }
                }))
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

let defaultBindings = {
    plotData: '<',
    plotLayout: '<',
    nodesSelection: '&',
    nodeClick: '&',
    nodeMouseOver: '&',
    nodeMouseOut: '&',
    linkClick: '&',
    linkMouseOver: '&',
    linkMouseOut: '&',
    customNode: '&',
    customLink: '&'
};

/* harmony default export */ __webpack_exports__["b"] = BaseLineagePlotController;





/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = {
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
    linkCaptureWidth: 10,
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
        show: false,
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

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_8__;

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_default_layout_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shared_features_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__base_radial_lineage_plot_css__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__base_radial_lineage_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__base_radial_lineage_plot_css__);







let d3 = Object.assign({},
    __webpack_require__(0),
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(6),
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

class BaseRadialLineagePlotController extends __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__["b" /* default */] {
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
        let s = [d.sourceNode.x, d.sourceNode.y],
            t = [d.targetNode.x, d.targetNode.y],
            rx = d.sourceNode._r2 * this.transform.kx,
            ry = d.sourceNode._r2 * this.transform.ky,
            sweep = d.targetNode._theta > d.sourceNode._theta ? 1 : 0,
            largeArc = Math.abs(d.targetNode._theta - d.sourceNode._theta) % 360 > 180 ? 1 : 0;

        return `M${s[0]},${s[1]}A${rx},${ry} 0 ${largeArc},${sweep} ${d.targetNode.m[0]},${d.targetNode.m[1]
            }L${t[0]},${t[1]}`;
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
            for (let label of context.nodeLabelData) {
                label.x = label.node.x + label.currentLabelPos.x;
                label.y = label.node.y + label.currentLabelPos.y + this.layout.nodeLabel.dy;
            }
        }

        if (context.linkLabelData) {
            for (let label of this.linkLabelData) {
                label.x = (label.link.sourceNode.x + label.link.targetNode.m[0]) / 2;
                label.y = (label.link.sourceNode.y + label.link.targetNode.m[1]) / 2 + this.layout.linkLabel.dy;
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
                    that.link.style('pointer-events', 'none');
                    that.linkCapture.style('pointer-events', 'none');
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
            that.link.style('pointer-events', 'all');
            that.linkCapture.style('pointer-events', 'all');
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
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var detector = module.exports = {};

detector.isIE = function(version) {
    function isAnyIeVersion() {
        var agent = navigator.userAgent.toLowerCase();
        return agent.indexOf("msie") !== -1 || agent.indexOf("trident") !== -1 || agent.indexOf(" edge/") !== -1;
    }

    if(!isAnyIeVersion()) {
        return false;
    }

    if(!version) {
        return true;
    }

    //Shamelessly stolen from https://gist.github.com/padolsey/527683
    var ieVersion = (function(){
        var undef,
            v = 3,
            div = document.createElement("div"),
            all = div.getElementsByTagName("i");

        do {
            div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->";
        }
        while (all[0]);

        return v > 4 ? v : undef;
    }());

    return version === ieVersion;
};

detector.isLegacyOpera = function() {
    return !!window.opera;
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = module.exports = {};

/**
 * Loops through the collection and calls the callback for each element. if the callback returns truthy, the loop is broken and returns the same value.
 * @public
 * @param {*} collection The collection to loop through. Needs to have a length property set and have indices set from 0 to length - 1.
 * @param {function} callback The callback to be called for each element. The element will be given as a parameter to the callback. If this callback returns truthy, the loop is broken and the same value is returned.
 * @returns {*} The value that a callback has returned (if truthy). Otherwise nothing.
 */
utils.forEach = function(collection, callback) {
    for(var i = 0; i < collection.length; i++) {
        var result = callback(collection[i]);
        if(result) {
            return result;
        }
    }
};


/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_12__;

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_default_layout_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shared_features_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__lineage_plot_css__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__lineage_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__lineage_plot_css__);







let d3 = Object.assign({},
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(6)
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


class LineagePlotController extends __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__["b" /* default */] {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-lineage-plot');
    }

    static getLayoutTemplate() {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["a" /* mergeTemplateLayout */])(lineageLayout, __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_default_layout_js__["a" /* default */]);
    }

    linkGenerator(d) {
        let c = Math.abs(d.sourceNode.x - d.targetNode.x) / 2;

        return 'M' + d.targetNode.x + ',' + d.targetNode.y
            + 'C' + (d.sourceNode.x + c) + ',' + d.targetNode.y
            + ' ' + (d.sourceNode.x + c) + ',' + d.sourceNode.y
            + ' ' + d.sourceNode.x + ',' + d.sourceNode.y;
    }

    setupScales() {
        this.xExtent = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["w" /* adjustExtent */])(d3.extent(this.nodes, node => this.isTimePlot ? new Date(node.data.date * 1000)
            : node.depth), this.isTimePlot);

        this.xScale = (this.isTimePlot ? d3.scaleTime() : d3.scaleLinear())
            .domain(this.xExtent)
            .range([0, this.plotWidth]);

        this.yScale = d3.scaleLinear()
            .domain([0, this.plotHeight])
            .range([0, this.plotHeight]);
    }

    drawMainAxes() {
        this.drawAxis(this.treeFixedContainer, 'x-main', this.xScale, this.plotHeight, this.isTimePlot, true);
    }

    drawBrushAxes() {
        this.drawAxis(this.brushFixedContainer, 'x-brush', this.brushContext.xScale, this.brushContext.plotHeight,
            this.isTimePlot, true);
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
    bindings: __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__["a" /* defaultBindings */]
};

/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_3_angular___default.a.module('ancestry.lineage', [])
    .component('lineagePlot', LineagePlotComponent);


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_default_layout_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shared_features_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__lineage_scatter_plot_css__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__lineage_scatter_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__lineage_scatter_plot_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_angular__);







let d3 = Object.assign({},
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(6)
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


class LineageScatterPlotController extends __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__["b" /* default */] {
    constructor ($element, $window, $scope, $attrs) {
        super($element, $window, $scope, $attrs);
        $element.addClass('ancestry-lineage-scatter-plot');
    }

    static getLayoutTemplate() {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["a" /* mergeTemplateLayout */])(lineageScatterLayout, __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_default_layout_js__["a" /* default */]);
    }

    linkGenerator(d) {
        return `M ${d.sourceNode.x} ${d.sourceNode.y} L ${d.targetNode.x} ${d.targetNode.y}`;
    }

    setupScales() {
        this.xExtent = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["w" /* adjustExtent */])(d3.extent(this.nodes, node => node._x));

        this.xScale = (this.isTimePlot ? d3.scaleTime() : d3.scaleLinear())
            .domain(this.xExtent)
            .range([0, this.plotWidth]);

        this.yScale = d3.scaleLinear()
            .domain(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["w" /* adjustExtent */])(d3.extent(this.nodes, node => node._y)).reverse())
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
    bindings: __WEBPACK_IMPORTED_MODULE_0__base_lineage_plot_base_lineage_plot_js__["a" /* defaultBindings */]
};

/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_4_angular___default.a.module('ancestry.lineage-scatter', [])
    .component('lineageScatterPlot', LineageScatterPlotComponent);







/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_radial_lineage_plot_base_radial_lineage_plot_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shared_features_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__radial_lineage_plot_css__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__radial_lineage_plot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__radial_lineage_plot_css__);







let d3 = Object.assign({},
    __webpack_require__(0),
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(6),
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
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["a" /* mergeTemplateLayout */])(radialLineageLayout, __WEBPACK_IMPORTED_MODULE_0__base_radial_lineage_plot_base_radial_lineage_plot_js__["a" /* default */].getLayoutTemplate());
    }

    prepareNodes(data, context) {
        let root = {name: 'virtualRoot', children: [], parent: null};

        let allTrees = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["v" /* createTreeLayout */])(data),
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
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["b" /* spreadNodes */])(child);
        }

        for (let node of nodes) {
            node._theta = node.x;
            node._lastTheta = node.x;
            node._r = multipleTreeOffset + (context.layout.sameLevel == 'both' ? node.depth : node.y) * totalTreeLength;
            [node._x, node._y] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["c" /* project */])(node);
            // below is hack to calculate curvature of brush links correctly
            node._r2 = context.xScale ? Math.sqrt(Math.pow(context.xScale(context.plotOrigin[0] + node._x) -
                    context.xScale(context.plotOrigin[0]), 2) + Math.pow(context.yScale(context.plotOrigin[1] + node._y)
                    - context.yScale(context.plotOrigin[1]), 2)) : node._r;
            node._m = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["c" /* project */])({_theta: node._theta, _r: node.parent._r});
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
    bindings: __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_js__["a" /* defaultBindings */]
};

/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_3_angular___default.a.module('ancestry.radial-lineage', [])
    .component('radialLineagePlot', RadialLineagePlotComponent);

/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base_radial_lineage_plot_base_radial_lineage_plot_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shared_features_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__radial_phylogenetic_tree_css__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__radial_phylogenetic_tree_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__radial_phylogenetic_tree_css__);







let d3 = Object.assign({},
    __webpack_require__(0),
    __webpack_require__(3),
    __webpack_require__(2),
    __webpack_require__(6),
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
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["a" /* mergeTemplateLayout */])(radialPhylogeneticTreeLayout, __WEBPACK_IMPORTED_MODULE_0__base_radial_lineage_plot_base_radial_lineage_plot_js__["a" /* default */].getLayoutTemplate());
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
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["b" /* spreadNodes */])(child);
        }

        for (let node of nodes) {
            node._r = this.layout.showBranchLength ? node.data.radius
                : multipleTreeOffset + node.depth * totalTreeLength;
            node.data = node.data.taxon || {hide: true};
            node._theta = node.x;
            node._lastTheta = node.x;
            [node._x, node._y] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["c" /* project */])(node);
            // below is hack to calculate curvature of brush links correctly
            node._r2 = context.xScale ? Math.sqrt(Math.pow(context.xScale(context.plotOrigin[0] + node._x) -
                context.xScale(context.plotOrigin[0]), 2) + Math.pow(context.yScale(context.plotOrigin[1] + node._y)
                - context.yScale(context.plotOrigin[1]), 2)) : node._r;
            node._m = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_features_js__["c" /* project */])({_theta: node._theta, _r: node.parent._r});
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
    bindings: __WEBPACK_IMPORTED_MODULE_1__base_lineage_plot_base_lineage_plot_js__["a" /* defaultBindings */]
};

/* unused harmony default export */ var _unused_webpack_default_export = __WEBPACK_IMPORTED_MODULE_3_angular___default.a.module('ancestry.radial-phylogenetic-tree', [])
    .component('radialPhylogeneticTree', RadialPhylogeneticTreeComponent);


/***/ }),
/* 17 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(19);

module.exports = function batchProcessorMaker(options) {
    options             = options || {};
    var reporter        = options.reporter;
    var asyncProcess    = utils.getOption(options, "async", true);
    var autoProcess     = utils.getOption(options, "auto", true);

    if(autoProcess && !asyncProcess) {
        reporter && reporter.warn("Invalid options combination. auto=true and async=false is invalid. Setting async=true.");
        asyncProcess = true;
    }

    var batch = Batch();
    var asyncFrameHandler;
    var isProcessing = false;

    function addFunction(level, fn) {
        if(!isProcessing && autoProcess && asyncProcess && batch.size() === 0) {
            // Since this is async, it is guaranteed to be executed after that the fn is added to the batch.
            // This needs to be done before, since we're checking the size of the batch to be 0.
            processBatchAsync();
        }

        batch.add(level, fn);
    }

    function processBatch() {
        // Save the current batch, and create a new batch so that incoming functions are not added into the currently processing batch.
        // Continue processing until the top-level batch is empty (functions may be added to the new batch while processing, and so on).
        isProcessing = true;
        while (batch.size()) {
            var processingBatch = batch;
            batch = Batch();
            processingBatch.process();
        }
        isProcessing = false;
    }

    function forceProcessBatch(localAsyncProcess) {
        if (isProcessing) {
            return;
        }

        if(localAsyncProcess === undefined) {
            localAsyncProcess = asyncProcess;
        }

        if(asyncFrameHandler) {
            cancelFrame(asyncFrameHandler);
            asyncFrameHandler = null;
        }

        if(localAsyncProcess) {
            processBatchAsync();
        } else {
            processBatch();
        }
    }

    function processBatchAsync() {
        asyncFrameHandler = requestFrame(processBatch);
    }

    function clearBatch() {
        batch           = {};
        batchSize       = 0;
        topLevel        = 0;
        bottomLevel     = 0;
    }

    function cancelFrame(listener) {
        // var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;
        var cancel = clearTimeout;
        return cancel(listener);
    }

    function requestFrame(callback) {
        // var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(fn) { return window.setTimeout(fn, 20); };
        var raf = function(fn) { return setTimeout(fn, 0); };
        return raf(callback);
    }

    return {
        add: addFunction,
        force: forceProcessBatch
    };
};

function Batch() {
    var batch       = {};
    var size        = 0;
    var topLevel    = 0;
    var bottomLevel = 0;

    function add(level, fn) {
        if(!fn) {
            fn = level;
            level = 0;
        }

        if(level > topLevel) {
            topLevel = level;
        } else if(level < bottomLevel) {
            bottomLevel = level;
        }

        if(!batch[level]) {
            batch[level] = [];
        }

        batch[level].push(fn);
        size++;
    }

    function process() {
        for(var level = bottomLevel; level <= topLevel; level++) {
            var fns = batch[level];

            for(var i = 0; i < fns.length; i++) {
                var fn = fns[i];
                fn();
            }
        }
    }

    function getSize() {
        return size;
    }

    return {
        add: add,
        process: process,
        size: getSize
    };
}


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = module.exports = {};

utils.getOption = getOption;

function getOption(options, name, defaultValue) {
    var value = options[name];

    if((value === undefined || value === null) && defaultValue !== undefined) {
        return defaultValue;
    }

    return value;
}


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Resize detection strategy that injects objects to elements in order to detect resize events.
 * Heavily inspired by: http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
 */



var browserDetector = __webpack_require__(10);

module.exports = function(options) {
    options             = options || {};
    var reporter        = options.reporter;
    var batchProcessor  = options.batchProcessor;
    var getState        = options.stateHandler.getState;

    if(!reporter) {
        throw new Error("Missing required dependency: reporter.");
    }

    /**
     * Adds a resize event listener to the element.
     * @public
     * @param {element} element The element that should have the listener added.
     * @param {function} listener The listener callback to be called for each resize event of the element. The element will be given as a parameter to the listener callback.
     */
    function addListener(element, listener) {
        if(!getObject(element)) {
            throw new Error("Element is not detectable by this strategy.");
        }

        function listenerProxy() {
            listener(element);
        }

        if(browserDetector.isIE(8)) {
            //IE 8 does not support object, but supports the resize event directly on elements.
            getState(element).object = {
                proxy: listenerProxy
            };
            element.attachEvent("onresize", listenerProxy);
        } else {
            var object = getObject(element);
            object.contentDocument.defaultView.addEventListener("resize", listenerProxy);
        }
    }

    /**
     * Makes an element detectable and ready to be listened for resize events. Will call the callback when the element is ready to be listened for resize changes.
     * @private
     * @param {object} options Optional options object.
     * @param {element} element The element to make detectable
     * @param {function} callback The callback to be called when the element is ready to be listened for resize changes. Will be called with the element as first parameter.
     */
    function makeDetectable(options, element, callback) {
        if (!callback) {
            callback = element;
            element = options;
            options = null;
        }

        options = options || {};
        var debug = options.debug;

        function injectObject(element, callback) {
            var OBJECT_STYLE = "display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; padding: 0; margin: 0; opacity: 0; z-index: -1000; pointer-events: none;";

            //The target element needs to be positioned (everything except static) so the absolute positioned object will be positioned relative to the target element.

            // Position altering may be performed directly or on object load, depending on if style resolution is possible directly or not.
            var positionCheckPerformed = false;

            // The element may not yet be attached to the DOM, and therefore the style object may be empty in some browsers.
            // Since the style object is a reference, it will be updated as soon as the element is attached to the DOM.
            var style = window.getComputedStyle(element);
            var width = element.offsetWidth;
            var height = element.offsetHeight;

            getState(element).startSize = {
                width: width,
                height: height
            };

            function mutateDom() {
                function alterPositionStyles() {
                    if(style.position === "static") {
                        element.style.position = "relative";

                        var removeRelativeStyles = function(reporter, element, style, property) {
                            function getNumericalValue(value) {
                                return value.replace(/[^-\d\.]/g, "");
                            }

                            var value = style[property];

                            if(value !== "auto" && getNumericalValue(value) !== "0") {
                                reporter.warn("An element that is positioned static has style." + property + "=" + value + " which is ignored due to the static positioning. The element will need to be positioned relative, so the style." + property + " will be set to 0. Element: ", element);
                                element.style[property] = 0;
                            }
                        };

                        //Check so that there are no accidental styles that will make the element styled differently now that is is relative.
                        //If there are any, set them to 0 (this should be okay with the user since the style properties did nothing before [since the element was positioned static] anyway).
                        removeRelativeStyles(reporter, element, style, "top");
                        removeRelativeStyles(reporter, element, style, "right");
                        removeRelativeStyles(reporter, element, style, "bottom");
                        removeRelativeStyles(reporter, element, style, "left");
                    }
                }

                function onObjectLoad() {
                    // The object has been loaded, which means that the element now is guaranteed to be attached to the DOM.
                    if (!positionCheckPerformed) {
                        alterPositionStyles();
                    }

                    /*jshint validthis: true */

                    function getDocument(element, callback) {
                        //Opera 12 seem to call the object.onload before the actual document has been created.
                        //So if it is not present, poll it with an timeout until it is present.
                        //TODO: Could maybe be handled better with object.onreadystatechange or similar.
                        if(!element.contentDocument) {
                            setTimeout(function checkForObjectDocument() {
                                getDocument(element, callback);
                            }, 100);

                            return;
                        }

                        callback(element.contentDocument);
                    }

                    //Mutating the object element here seems to fire another load event.
                    //Mutating the inner document of the object element is fine though.
                    var objectElement = this;

                    //Create the style element to be added to the object.
                    getDocument(objectElement, function onObjectDocumentReady(objectDocument) {
                        //Notify that the element is ready to be listened to.
                        callback(element);
                    });
                }

                // The element may be detached from the DOM, and some browsers does not support style resolving of detached elements.
                // The alterPositionStyles needs to be delayed until we know the element has been attached to the DOM (which we are sure of when the onObjectLoad has been fired), if style resolution is not possible.
                if (style.position !== "") {
                    alterPositionStyles(style);
                    positionCheckPerformed = true;
                }

                //Add an object element as a child to the target element that will be listened to for resize events.
                var object = document.createElement("object");
                object.style.cssText = OBJECT_STYLE;
                object.tabIndex = -1;
                object.type = "text/html";
                object.onload = onObjectLoad;

                //Safari: This must occur before adding the object to the DOM.
                //IE: Does not like that this happens before, even if it is also added after.
                if(!browserDetector.isIE()) {
                    object.data = "about:blank";
                }

                element.appendChild(object);
                getState(element).object = object;

                //IE: This must occur after adding the object to the DOM.
                if(browserDetector.isIE()) {
                    object.data = "about:blank";
                }
            }

            if(batchProcessor) {
                batchProcessor.add(mutateDom);
            } else {
                mutateDom();
            }
        }

        if(browserDetector.isIE(8)) {
            //IE 8 does not support objects properly. Luckily they do support the resize event.
            //So do not inject the object and notify that the element is already ready to be listened to.
            //The event handler for the resize event is attached in the utils.addListener instead.
            callback(element);
        } else {
            injectObject(element, callback);
        }
    }

    /**
     * Returns the child object of the target element.
     * @private
     * @param {element} element The target element.
     * @returns The object element of the target.
     */
    function getObject(element) {
        return getState(element).object;
    }

    function uninstall(element) {
        if(browserDetector.isIE(8)) {
            element.detachEvent("onresize", getState(element).object.proxy);
        } else {
            element.removeChild(getObject(element));
        }
        delete getState(element).object;
    }

    return {
        makeDetectable: makeDetectable,
        addListener: addListener,
        uninstall: uninstall
    };
};


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Resize detection strategy that injects divs to elements in order to detect resize events on scroll events.
 * Heavily inspired by: https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js
 */



var forEach = __webpack_require__(11).forEach;

module.exports = function(options) {
    options             = options || {};
    var reporter        = options.reporter;
    var batchProcessor  = options.batchProcessor;
    var getState        = options.stateHandler.getState;
    var hasState        = options.stateHandler.hasState;
    var idHandler       = options.idHandler;

    if (!batchProcessor) {
        throw new Error("Missing required dependency: batchProcessor");
    }

    if (!reporter) {
        throw new Error("Missing required dependency: reporter.");
    }

    //TODO: Could this perhaps be done at installation time?
    var scrollbarSizes = getScrollbarSizes();

    // Inject the scrollbar styling that prevents them from appearing sometimes in Chrome.
    // The injected container needs to have a class, so that it may be styled with CSS (pseudo elements).
    var styleId = "erd_scroll_detection_scrollbar_style";
    var detectionContainerClass = "erd_scroll_detection_container";
    injectScrollStyle(styleId, detectionContainerClass);

    function getScrollbarSizes() {
        var width = 500;
        var height = 500;

        var child = document.createElement("div");
        child.style.cssText = "position: absolute; width: " + width*2 + "px; height: " + height*2 + "px; visibility: hidden; margin: 0; padding: 0;";

        var container = document.createElement("div");
        container.style.cssText = "position: absolute; width: " + width + "px; height: " + height + "px; overflow: scroll; visibility: none; top: " + -width*3 + "px; left: " + -height*3 + "px; visibility: hidden; margin: 0; padding: 0;";

        container.appendChild(child);

        document.body.insertBefore(container, document.body.firstChild);

        var widthSize = width - container.clientWidth;
        var heightSize = height - container.clientHeight;

        document.body.removeChild(container);

        return {
            width: widthSize,
            height: heightSize
        };
    }

    function injectScrollStyle(styleId, containerClass) {
        function injectStyle(style, method) {
            method = method || function (element) {
                document.head.appendChild(element);
            };

            var styleElement = document.createElement("style");
            styleElement.innerHTML = style;
            styleElement.id = styleId;
            method(styleElement);
            return styleElement;
        }

        if (!document.getElementById(styleId)) {
            var containerAnimationClass = containerClass + "_animation";
            var containerAnimationActiveClass = containerClass + "_animation_active";
            var style = "/* Created by the element-resize-detector library. */\n";
            style += "." + containerClass + " > div::-webkit-scrollbar { display: none; }\n\n";
            style += "." + containerAnimationActiveClass + " { -webkit-animation-duration: 0.1s; animation-duration: 0.1s; -webkit-animation-name: " + containerAnimationClass + "; animation-name: " + containerAnimationClass + "; }\n";
            style += "@-webkit-keyframes " + containerAnimationClass +  " { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }\n";
            style += "@keyframes " + containerAnimationClass +          " { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }";
            injectStyle(style);
        }
    }

    function addAnimationClass(element) {
        element.className += " " + detectionContainerClass + "_animation_active";
    }

    function addEvent(el, name, cb) {
        if (el.addEventListener) {
            el.addEventListener(name, cb);
        } else if(el.attachEvent) {
            el.attachEvent("on" + name, cb);
        } else {
            return reporter.error("[scroll] Don't know how to add event listeners.");
        }
    }

    function removeEvent(el, name, cb) {
        if (el.removeEventListener) {
            el.removeEventListener(name, cb);
        } else if(el.detachEvent) {
            el.detachEvent("on" + name, cb);
        } else {
            return reporter.error("[scroll] Don't know how to remove event listeners.");
        }
    }

    function getExpandElement(element) {
        return getState(element).container.childNodes[0].childNodes[0].childNodes[0];
    }

    function getShrinkElement(element) {
        return getState(element).container.childNodes[0].childNodes[0].childNodes[1];
    }

    /**
     * Adds a resize event listener to the element.
     * @public
     * @param {element} element The element that should have the listener added.
     * @param {function} listener The listener callback to be called for each resize event of the element. The element will be given as a parameter to the listener callback.
     */
    function addListener(element, listener) {
        var listeners = getState(element).listeners;

        if (!listeners.push) {
            throw new Error("Cannot add listener to an element that is not detectable.");
        }

        getState(element).listeners.push(listener);
    }

    /**
     * Makes an element detectable and ready to be listened for resize events. Will call the callback when the element is ready to be listened for resize changes.
     * @private
     * @param {object} options Optional options object.
     * @param {element} element The element to make detectable
     * @param {function} callback The callback to be called when the element is ready to be listened for resize changes. Will be called with the element as first parameter.
     */
    function makeDetectable(options, element, callback) {
        if (!callback) {
            callback = element;
            element = options;
            options = null;
        }

        options = options || {};

        function debug() {
            if (options.debug) {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(idHandler.get(element), "Scroll: ");
                if (reporter.log.apply) {
                    reporter.log.apply(null, args);
                } else {
                    for (var i = 0; i < args.length; i++) {
                        reporter.log(args[i]);
                    }
                }
            }
        }

        function isDetached(element) {
            function isInDocument(element) {
                return element === element.ownerDocument.body || element.ownerDocument.body.contains(element);
            }

            if (!isInDocument(element)) {
                return true;
            }

            // FireFox returns null style in hidden iframes. See https://github.com/wnr/element-resize-detector/issues/68 and https://bugzilla.mozilla.org/show_bug.cgi?id=795520
            if (getComputedStyle(element) === null) {
                return true;
            }

            return false;
        }

        function isUnrendered(element) {
            // Check the absolute positioned container since the top level container is display: inline.
            var container = getState(element).container.childNodes[0];
            var style = getComputedStyle(container);
            return !style.width || style.width.indexOf("px") === -1; //Can only compute pixel value when rendered.
        }

        function getStyle() {
            // Some browsers only force layouts when actually reading the style properties of the style object, so make sure that they are all read here,
            // so that the user of the function can be sure that it will perform the layout here, instead of later (important for batching).
            var elementStyle            = getComputedStyle(element);
            var style                   = {};
            style.position              = elementStyle.position;
            style.width                 = element.offsetWidth;
            style.height                = element.offsetHeight;
            style.top                   = elementStyle.top;
            style.right                 = elementStyle.right;
            style.bottom                = elementStyle.bottom;
            style.left                  = elementStyle.left;
            style.widthCSS              = elementStyle.width;
            style.heightCSS             = elementStyle.height;
            return style;
        }

        function storeStartSize() {
            var style = getStyle();
            getState(element).startSize = {
                width: style.width,
                height: style.height
            };
            debug("Element start size", getState(element).startSize);
        }

        function initListeners() {
            getState(element).listeners = [];
        }

        function storeStyle() {
            debug("storeStyle invoked.");
            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            var style = getStyle();
            getState(element).style = style;
        }

        function storeCurrentSize(element, width, height) {
            getState(element).lastWidth = width;
            getState(element).lastHeight  = height;
        }

        function getExpandChildElement(element) {
            return getExpandElement(element).childNodes[0];
        }

        function getWidthOffset() {
            return 2 * scrollbarSizes.width + 1;
        }

        function getHeightOffset() {
            return 2 * scrollbarSizes.height + 1;
        }

        function getExpandWidth(width) {
            return width + 10 + getWidthOffset();
        }

        function getExpandHeight(height) {
            return height + 10 + getHeightOffset();
        }

        function getShrinkWidth(width) {
            return width * 2 + getWidthOffset();
        }

        function getShrinkHeight(height) {
            return height * 2 + getHeightOffset();
        }

        function positionScrollbars(element, width, height) {
            var expand          = getExpandElement(element);
            var shrink          = getShrinkElement(element);
            var expandWidth     = getExpandWidth(width);
            var expandHeight    = getExpandHeight(height);
            var shrinkWidth     = getShrinkWidth(width);
            var shrinkHeight    = getShrinkHeight(height);
            expand.scrollLeft   = expandWidth;
            expand.scrollTop    = expandHeight;
            shrink.scrollLeft   = shrinkWidth;
            shrink.scrollTop    = shrinkHeight;
        }

        function injectContainerElement() {
            var container = getState(element).container;

            if (!container) {
                container                   = document.createElement("div");
                container.className         = detectionContainerClass;
                container.style.cssText     = "visibility: hidden; display: inline; width: 0px; height: 0px; z-index: -1; overflow: hidden; margin: 0; padding: 0;";
                getState(element).container = container;
                addAnimationClass(container);
                element.appendChild(container);

                var onAnimationStart = function () {
                    getState(element).onRendered && getState(element).onRendered();
                };

                addEvent(container, "animationstart", onAnimationStart);

                // Store the event handler here so that they may be removed when uninstall is called.
                // See uninstall function for an explanation why it is needed.
                getState(element).onAnimationStart = onAnimationStart;
            }

            return container;
        }

        function injectScrollElements() {
            function alterPositionStyles() {
                var style = getState(element).style;

                if(style.position === "static") {
                    element.style.position = "relative";

                    var removeRelativeStyles = function(reporter, element, style, property) {
                        function getNumericalValue(value) {
                            return value.replace(/[^-\d\.]/g, "");
                        }

                        var value = style[property];

                        if(value !== "auto" && getNumericalValue(value) !== "0") {
                            reporter.warn("An element that is positioned static has style." + property + "=" + value + " which is ignored due to the static positioning. The element will need to be positioned relative, so the style." + property + " will be set to 0. Element: ", element);
                            element.style[property] = 0;
                        }
                    };

                    //Check so that there are no accidental styles that will make the element styled differently now that is is relative.
                    //If there are any, set them to 0 (this should be okay with the user since the style properties did nothing before [since the element was positioned static] anyway).
                    removeRelativeStyles(reporter, element, style, "top");
                    removeRelativeStyles(reporter, element, style, "right");
                    removeRelativeStyles(reporter, element, style, "bottom");
                    removeRelativeStyles(reporter, element, style, "left");
                }
            }

            function getLeftTopBottomRightCssText(left, top, bottom, right) {
                left = (!left ? "0" : (left + "px"));
                top = (!top ? "0" : (top + "px"));
                bottom = (!bottom ? "0" : (bottom + "px"));
                right = (!right ? "0" : (right + "px"));

                return "left: " + left + "; top: " + top + "; right: " + right + "; bottom: " + bottom + ";";
            }

            debug("Injecting elements");

            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            alterPositionStyles();

            var rootContainer = getState(element).container;

            if (!rootContainer) {
                rootContainer = injectContainerElement();
            }

            // Due to this WebKit bug https://bugs.webkit.org/show_bug.cgi?id=80808 (currently fixed in Blink, but still present in WebKit browsers such as Safari),
            // we need to inject two containers, one that is width/height 100% and another that is left/top -1px so that the final container always is 1x1 pixels bigger than
            // the targeted element.
            // When the bug is resolved, "containerContainer" may be removed.

            // The outer container can occasionally be less wide than the targeted when inside inline elements element in WebKit (see https://bugs.webkit.org/show_bug.cgi?id=152980).
            // This should be no problem since the inner container either way makes sure the injected scroll elements are at least 1x1 px.

            var scrollbarWidth          = scrollbarSizes.width;
            var scrollbarHeight         = scrollbarSizes.height;
            var containerContainerStyle = "position: absolute; flex: none; overflow: hidden; z-index: -1; visibility: hidden; width: 100%; height: 100%; left: 0px; top: 0px;";
            var containerStyle          = "position: absolute; flex: none; overflow: hidden; z-index: -1; visibility: hidden; " + getLeftTopBottomRightCssText(-(1 + scrollbarWidth), -(1 + scrollbarHeight), -scrollbarHeight, -scrollbarWidth);
            var expandStyle             = "position: absolute; flex: none; overflow: scroll; z-index: -1; visibility: hidden; width: 100%; height: 100%;";
            var shrinkStyle             = "position: absolute; flex: none; overflow: scroll; z-index: -1; visibility: hidden; width: 100%; height: 100%;";
            var expandChildStyle        = "position: absolute; left: 0; top: 0;";
            var shrinkChildStyle        = "position: absolute; width: 200%; height: 200%;";

            var containerContainer      = document.createElement("div");
            var container               = document.createElement("div");
            var expand                  = document.createElement("div");
            var expandChild             = document.createElement("div");
            var shrink                  = document.createElement("div");
            var shrinkChild             = document.createElement("div");

            // Some browsers choke on the resize system being rtl, so force it to ltr. https://github.com/wnr/element-resize-detector/issues/56
            // However, dir should not be set on the top level container as it alters the dimensions of the target element in some browsers.
            containerContainer.dir              = "ltr";

            containerContainer.style.cssText    = containerContainerStyle;
            containerContainer.className        = detectionContainerClass;
            container.className                 = detectionContainerClass;
            container.style.cssText             = containerStyle;
            expand.style.cssText                = expandStyle;
            expandChild.style.cssText           = expandChildStyle;
            shrink.style.cssText                = shrinkStyle;
            shrinkChild.style.cssText           = shrinkChildStyle;

            expand.appendChild(expandChild);
            shrink.appendChild(shrinkChild);
            container.appendChild(expand);
            container.appendChild(shrink);
            containerContainer.appendChild(container);
            rootContainer.appendChild(containerContainer);

            function onExpandScroll() {
                getState(element).onExpand && getState(element).onExpand();
            }

            function onShrinkScroll() {
                getState(element).onShrink && getState(element).onShrink();
            }

            addEvent(expand, "scroll", onExpandScroll);
            addEvent(shrink, "scroll", onShrinkScroll);

            // Store the event handlers here so that they may be removed when uninstall is called.
            // See uninstall function for an explanation why it is needed.
            getState(element).onExpandScroll = onExpandScroll;
            getState(element).onShrinkScroll = onShrinkScroll;
        }

        function registerListenersAndPositionElements() {
            function updateChildSizes(element, width, height) {
                var expandChild             = getExpandChildElement(element);
                var expandWidth             = getExpandWidth(width);
                var expandHeight            = getExpandHeight(height);
                expandChild.style.width     = expandWidth + "px";
                expandChild.style.height    = expandHeight + "px";
            }

            function updateDetectorElements(done) {
                var width           = element.offsetWidth;
                var height          = element.offsetHeight;

                debug("Storing current size", width, height);

                // Store the size of the element sync here, so that multiple scroll events may be ignored in the event listeners.
                // Otherwise the if-check in handleScroll is useless.
                storeCurrentSize(element, width, height);

                // Since we delay the processing of the batch, there is a risk that uninstall has been called before the batch gets to execute.
                // Since there is no way to cancel the fn executions, we need to add an uninstall guard to all fns of the batch.

                batchProcessor.add(0, function performUpdateChildSizes() {
                    if (!getState(element)) {
                        debug("Aborting because element has been uninstalled");
                        return;
                    }

                    if (!areElementsInjected()) {
                        debug("Aborting because element container has not been initialized");
                        return;
                    }

                    if (options.debug) {
                        var w = element.offsetWidth;
                        var h = element.offsetHeight;

                        if (w !== width || h !== height) {
                            reporter.warn(idHandler.get(element), "Scroll: Size changed before updating detector elements.");
                        }
                    }

                    updateChildSizes(element, width, height);
                });

                batchProcessor.add(1, function updateScrollbars() {
                    if (!getState(element)) {
                        debug("Aborting because element has been uninstalled");
                        return;
                    }

                    if (!areElementsInjected()) {
                        debug("Aborting because element container has not been initialized");
                        return;
                    }

                    positionScrollbars(element, width, height);
                });

                if (done) {
                    batchProcessor.add(2, function () {
                        if (!getState(element)) {
                            debug("Aborting because element has been uninstalled");
                            return;
                        }

                        if (!areElementsInjected()) {
                          debug("Aborting because element container has not been initialized");
                          return;
                        }

                        done();
                    });
                }
            }

            function areElementsInjected() {
                return !!getState(element).container;
            }

            function notifyListenersIfNeeded() {
                function isFirstNotify() {
                    return getState(element).lastNotifiedWidth === undefined;
                }

                debug("notifyListenersIfNeeded invoked");

                var state = getState(element);

                // Don't notify the if the current size is the start size, and this is the first notification.
                if (isFirstNotify() && state.lastWidth === state.startSize.width && state.lastHeight === state.startSize.height) {
                    return debug("Not notifying: Size is the same as the start size, and there has been no notification yet.");
                }

                // Don't notify if the size already has been notified.
                if (state.lastWidth === state.lastNotifiedWidth && state.lastHeight === state.lastNotifiedHeight) {
                    return debug("Not notifying: Size already notified");
                }


                debug("Current size not notified, notifying...");
                state.lastNotifiedWidth = state.lastWidth;
                state.lastNotifiedHeight = state.lastHeight;
                forEach(getState(element).listeners, function (listener) {
                    listener(element);
                });
            }

            function handleRender() {
                debug("startanimation triggered.");

                if (isUnrendered(element)) {
                    debug("Ignoring since element is still unrendered...");
                    return;
                }

                debug("Element rendered.");
                var expand = getExpandElement(element);
                var shrink = getShrinkElement(element);
                if (expand.scrollLeft === 0 || expand.scrollTop === 0 || shrink.scrollLeft === 0 || shrink.scrollTop === 0) {
                    debug("Scrollbars out of sync. Updating detector elements...");
                    updateDetectorElements(notifyListenersIfNeeded);
                }
            }

            function handleScroll() {
                debug("Scroll detected.");

                if (isUnrendered(element)) {
                    // Element is still unrendered. Skip this scroll event.
                    debug("Scroll event fired while unrendered. Ignoring...");
                    return;
                }

                var width = element.offsetWidth;
                var height = element.offsetHeight;

                if (width !== element.lastWidth || height !== element.lastHeight) {
                    debug("Element size changed.");
                    updateDetectorElements(notifyListenersIfNeeded);
                } else {
                    debug("Element size has not changed (" + width + "x" + height + ").");
                }
            }

            debug("registerListenersAndPositionElements invoked.");

            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            getState(element).onRendered = handleRender;
            getState(element).onExpand = handleScroll;
            getState(element).onShrink = handleScroll;

            var style = getState(element).style;
            updateChildSizes(element, style.width, style.height);
        }

        function finalizeDomMutation() {
            debug("finalizeDomMutation invoked.");

            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            var style = getState(element).style;
            storeCurrentSize(element, style.width, style.height);
            positionScrollbars(element, style.width, style.height);
        }

        function ready() {
            callback(element);
        }

        function install() {
            debug("Installing...");
            initListeners();
            storeStartSize();

            batchProcessor.add(0, storeStyle);
            batchProcessor.add(1, injectScrollElements);
            batchProcessor.add(2, registerListenersAndPositionElements);
            batchProcessor.add(3, finalizeDomMutation);
            batchProcessor.add(4, ready);
        }

        debug("Making detectable...");

        if (isDetached(element)) {
            debug("Element is detached");

            injectContainerElement();

            debug("Waiting until element is attached...");

            getState(element).onRendered = function () {
                debug("Element is now attached");
                install();
            };
        } else {
            install();
        }
    }

    function uninstall(element) {
        var state = getState(element);

        if (!state) {
            // Uninstall has been called on a non-erd element.
            return;
        }

        // Uninstall may have been called in the following scenarios:
        // (1) Right between the sync code and async batch (here state.busy = true, but nothing have been registered or injected).
        // (2) In the ready callback of the last level of the batch by another element (here, state.busy = true, but all the stuff has been injected).
        // (3) After the installation process (here, state.busy = false and all the stuff has been injected).
        // So to be on the safe side, let's check for each thing before removing.

        // We need to remove the event listeners, because otherwise the event might fire on an uninstall element which results in an error when trying to get the state of the element.
        state.onExpandScroll && removeEvent(getExpandElement(element), "scroll", state.onExpandScroll);
        state.onShrinkScroll && removeEvent(getShrinkElement(element), "scroll", state.onShrinkScroll);
        state.onAnimationStart && removeEvent(state.container, "animationstart", state.onAnimationStart);

        state.container && element.removeChild(state.container);
    }

    return {
        makeDetectable: makeDetectable,
        addListener: addListener,
        uninstall: uninstall
    };
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var forEach                 = __webpack_require__(11).forEach;
var elementUtilsMaker       = __webpack_require__(23);
var listenerHandlerMaker    = __webpack_require__(26);
var idGeneratorMaker        = __webpack_require__(24);
var idHandlerMaker          = __webpack_require__(25);
var reporterMaker           = __webpack_require__(27);
var browserDetector         = __webpack_require__(10);
var batchProcessorMaker     = __webpack_require__(18);
var stateHandler            = __webpack_require__(28);

//Detection strategies.
var objectStrategyMaker     = __webpack_require__(20);
var scrollStrategyMaker     = __webpack_require__(21);

function isCollection(obj) {
    return Array.isArray(obj) || obj.length !== undefined;
}

function toArray(collection) {
    if (!Array.isArray(collection)) {
        var array = [];
        forEach(collection, function (obj) {
            array.push(obj);
        });
        return array;
    } else {
        return collection;
    }
}

function isElement(obj) {
    return obj && obj.nodeType === 1;
}

/**
 * @typedef idHandler
 * @type {object}
 * @property {function} get Gets the resize detector id of the element.
 * @property {function} set Generate and sets the resize detector id of the element.
 */

/**
 * @typedef Options
 * @type {object}
 * @property {boolean} callOnAdd    Determines if listeners should be called when they are getting added.
                                    Default is true. If true, the listener is guaranteed to be called when it has been added.
                                    If false, the listener will not be guarenteed to be called when it has been added (does not prevent it from being called).
 * @property {idHandler} idHandler  A custom id handler that is responsible for generating, setting and retrieving id's for elements.
                                    If not provided, a default id handler will be used.
 * @property {reporter} reporter    A custom reporter that handles reporting logs, warnings and errors.
                                    If not provided, a default id handler will be used.
                                    If set to false, then nothing will be reported.
 * @property {boolean} debug        If set to true, the the system will report debug messages as default for the listenTo method.
 */

/**
 * Creates an element resize detector instance.
 * @public
 * @param {Options?} options Optional global options object that will decide how this instance will work.
 */
module.exports = function(options) {
    options = options || {};

    //idHandler is currently not an option to the listenTo function, so it should not be added to globalOptions.
    var idHandler;

    if (options.idHandler) {
        // To maintain compatability with idHandler.get(element, readonly), make sure to wrap the given idHandler
        // so that readonly flag always is true when it's used here. This may be removed next major version bump.
        idHandler = {
            get: function (element) { return options.idHandler.get(element, true); },
            set: options.idHandler.set
        };
    } else {
        var idGenerator = idGeneratorMaker();
        var defaultIdHandler = idHandlerMaker({
            idGenerator: idGenerator,
            stateHandler: stateHandler
        });
        idHandler = defaultIdHandler;
    }

    //reporter is currently not an option to the listenTo function, so it should not be added to globalOptions.
    var reporter = options.reporter;

    if(!reporter) {
        //If options.reporter is false, then the reporter should be quiet.
        var quiet = reporter === false;
        reporter = reporterMaker(quiet);
    }

    //batchProcessor is currently not an option to the listenTo function, so it should not be added to globalOptions.
    var batchProcessor = getOption(options, "batchProcessor", batchProcessorMaker({ reporter: reporter }));

    //Options to be used as default for the listenTo function.
    var globalOptions = {};
    globalOptions.callOnAdd     = !!getOption(options, "callOnAdd", true);
    globalOptions.debug         = !!getOption(options, "debug", false);

    var eventListenerHandler    = listenerHandlerMaker(idHandler);
    var elementUtils            = elementUtilsMaker({
        stateHandler: stateHandler
    });

    //The detection strategy to be used.
    var detectionStrategy;
    var desiredStrategy = getOption(options, "strategy", "object");
    var strategyOptions = {
        reporter: reporter,
        batchProcessor: batchProcessor,
        stateHandler: stateHandler,
        idHandler: idHandler
    };

    if(desiredStrategy === "scroll") {
        if (browserDetector.isLegacyOpera()) {
            reporter.warn("Scroll strategy is not supported on legacy Opera. Changing to object strategy.");
            desiredStrategy = "object";
        } else if (browserDetector.isIE(9)) {
            reporter.warn("Scroll strategy is not supported on IE9. Changing to object strategy.");
            desiredStrategy = "object";
        }
    }

    if(desiredStrategy === "scroll") {
        detectionStrategy = scrollStrategyMaker(strategyOptions);
    } else if(desiredStrategy === "object") {
        detectionStrategy = objectStrategyMaker(strategyOptions);
    } else {
        throw new Error("Invalid strategy name: " + desiredStrategy);
    }

    //Calls can be made to listenTo with elements that are still being installed.
    //Also, same elements can occur in the elements list in the listenTo function.
    //With this map, the ready callbacks can be synchronized between the calls
    //so that the ready callback can always be called when an element is ready - even if
    //it wasn't installed from the function itself.
    var onReadyCallbacks = {};

    /**
     * Makes the given elements resize-detectable and starts listening to resize events on the elements. Calls the event callback for each event for each element.
     * @public
     * @param {Options?} options Optional options object. These options will override the global options. Some options may not be overriden, such as idHandler.
     * @param {element[]|element} elements The given array of elements to detect resize events of. Single element is also valid.
     * @param {function} listener The callback to be executed for each resize event for each element.
     */
    function listenTo(options, elements, listener) {
        function onResizeCallback(element) {
            var listeners = eventListenerHandler.get(element);
            forEach(listeners, function callListenerProxy(listener) {
                listener(element);
            });
        }

        function addListener(callOnAdd, element, listener) {
            eventListenerHandler.add(element, listener);

            if(callOnAdd) {
                listener(element);
            }
        }

        //Options object may be omitted.
        if(!listener) {
            listener = elements;
            elements = options;
            options = {};
        }

        if(!elements) {
            throw new Error("At least one element required.");
        }

        if(!listener) {
            throw new Error("Listener required.");
        }

        if (isElement(elements)) {
            // A single element has been passed in.
            elements = [elements];
        } else if (isCollection(elements)) {
            // Convert collection to array for plugins.
            // TODO: May want to check so that all the elements in the collection are valid elements.
            elements = toArray(elements);
        } else {
            return reporter.error("Invalid arguments. Must be a DOM element or a collection of DOM elements.");
        }

        var elementsReady = 0;

        var callOnAdd = getOption(options, "callOnAdd", globalOptions.callOnAdd);
        var onReadyCallback = getOption(options, "onReady", function noop() {});
        var debug = getOption(options, "debug", globalOptions.debug);

        forEach(elements, function attachListenerToElement(element) {
            if (!stateHandler.getState(element)) {
                stateHandler.initState(element);
                idHandler.set(element);
            }

            var id = idHandler.get(element);

            debug && reporter.log("Attaching listener to element", id, element);

            if(!elementUtils.isDetectable(element)) {
                debug && reporter.log(id, "Not detectable.");
                if(elementUtils.isBusy(element)) {
                    debug && reporter.log(id, "System busy making it detectable");

                    //The element is being prepared to be detectable. Do not make it detectable.
                    //Just add the listener, because the element will soon be detectable.
                    addListener(callOnAdd, element, listener);
                    onReadyCallbacks[id] = onReadyCallbacks[id] || [];
                    onReadyCallbacks[id].push(function onReady() {
                        elementsReady++;

                        if(elementsReady === elements.length) {
                            onReadyCallback();
                        }
                    });
                    return;
                }

                debug && reporter.log(id, "Making detectable...");
                //The element is not prepared to be detectable, so do prepare it and add a listener to it.
                elementUtils.markBusy(element, true);
                return detectionStrategy.makeDetectable({ debug: debug }, element, function onElementDetectable(element) {
                    debug && reporter.log(id, "onElementDetectable");

                    if (stateHandler.getState(element)) {
                        elementUtils.markAsDetectable(element);
                        elementUtils.markBusy(element, false);
                        detectionStrategy.addListener(element, onResizeCallback);
                        addListener(callOnAdd, element, listener);

                        // Since the element size might have changed since the call to "listenTo", we need to check for this change,
                        // so that a resize event may be emitted.
                        // Having the startSize object is optional (since it does not make sense in some cases such as unrendered elements), so check for its existance before.
                        // Also, check the state existance before since the element may have been uninstalled in the installation process.
                        var state = stateHandler.getState(element);
                        if (state && state.startSize) {
                            var width = element.offsetWidth;
                            var height = element.offsetHeight;
                            if (state.startSize.width !== width || state.startSize.height !== height) {
                                onResizeCallback(element);
                            }
                        }

                        if(onReadyCallbacks[id]) {
                            forEach(onReadyCallbacks[id], function(callback) {
                                callback();
                            });
                        }
                    } else {
                        // The element has been unisntalled before being detectable.
                        debug && reporter.log(id, "Element uninstalled before being detectable.");
                    }

                    delete onReadyCallbacks[id];

                    elementsReady++;
                    if(elementsReady === elements.length) {
                        onReadyCallback();
                    }
                });
            }

            debug && reporter.log(id, "Already detecable, adding listener.");

            //The element has been prepared to be detectable and is ready to be listened to.
            addListener(callOnAdd, element, listener);
            elementsReady++;
        });

        if(elementsReady === elements.length) {
            onReadyCallback();
        }
    }

    function uninstall(elements) {
        if(!elements) {
            return reporter.error("At least one element is required.");
        }

        if (isElement(elements)) {
            // A single element has been passed in.
            elements = [elements];
        } else if (isCollection(elements)) {
            // Convert collection to array for plugins.
            // TODO: May want to check so that all the elements in the collection are valid elements.
            elements = toArray(elements);
        } else {
            return reporter.error("Invalid arguments. Must be a DOM element or a collection of DOM elements.");
        }

        forEach(elements, function (element) {
            eventListenerHandler.removeAllListeners(element);
            detectionStrategy.uninstall(element);
            stateHandler.cleanState(element);
        });
    }

    return {
        listenTo: listenTo,
        removeListener: eventListenerHandler.removeListener,
        removeAllListeners: eventListenerHandler.removeAllListeners,
        uninstall: uninstall
    };
};

function getOption(options, name, defaultValue) {
    var value = options[name];

    if((value === undefined || value === null) && defaultValue !== undefined) {
        return defaultValue;
    }

    return value;
}


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function(options) {
    var getState = options.stateHandler.getState;

    /**
     * Tells if the element has been made detectable and ready to be listened for resize events.
     * @public
     * @param {element} The element to check.
     * @returns {boolean} True or false depending on if the element is detectable or not.
     */
    function isDetectable(element) {
        var state = getState(element);
        return state && !!state.isDetectable;
    }

    /**
     * Marks the element that it has been made detectable and ready to be listened for resize events.
     * @public
     * @param {element} The element to mark.
     */
    function markAsDetectable(element) {
        getState(element).isDetectable = true;
    }

    /**
     * Tells if the element is busy or not.
     * @public
     * @param {element} The element to check.
     * @returns {boolean} True or false depending on if the element is busy or not.
     */
    function isBusy(element) {
        return !!getState(element).busy;
    }

    /**
     * Marks the object is busy and should not be made detectable.
     * @public
     * @param {element} element The element to mark.
     * @param {boolean} busy If the element is busy or not.
     */
    function markBusy(element, busy) {
        getState(element).busy = !!busy;
    }

    return {
        isDetectable: isDetectable,
        markAsDetectable: markAsDetectable,
        isBusy: isBusy,
        markBusy: markBusy
    };
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function() {
    var idCount = 1;

    /**
     * Generates a new unique id in the context.
     * @public
     * @returns {number} A unique id in the context.
     */
    function generate() {
        return idCount++;
    }

    return {
        generate: generate
    };
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function(options) {
    var idGenerator     = options.idGenerator;
    var getState        = options.stateHandler.getState;

    /**
     * Gets the resize detector id of the element.
     * @public
     * @param {element} element The target element to get the id of.
     * @returns {string|number|null} The id of the element. Null if it has no id.
     */
    function getId(element) {
        var state = getState(element);

        if (state && state.id !== undefined) {
            return state.id;
        }

        return null;
    }

    /**
     * Sets the resize detector id of the element. Requires the element to have a resize detector state initialized.
     * @public
     * @param {element} element The target element to set the id of.
     * @returns {string|number|null} The id of the element.
     */
    function setId(element) {
        var state = getState(element);

        if (!state) {
            throw new Error("setId required the element to have a resize detection state.");
        }

        var id = idGenerator.generate();

        state.id = id;

        return id;
    }

    return {
        get: getId,
        set: setId
    };
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function(idHandler) {
    var eventListeners = {};

    /**
     * Gets all listeners for the given element.
     * @public
     * @param {element} element The element to get all listeners for.
     * @returns All listeners for the given element.
     */
    function getListeners(element) {
        var id = idHandler.get(element);

        if (id === undefined) {
            return [];
        }

        return eventListeners[id] || [];
    }

    /**
     * Stores the given listener for the given element. Will not actually add the listener to the element.
     * @public
     * @param {element} element The element that should have the listener added.
     * @param {function} listener The callback that the element has added.
     */
    function addListener(element, listener) {
        var id = idHandler.get(element);

        if(!eventListeners[id]) {
            eventListeners[id] = [];
        }

        eventListeners[id].push(listener);
    }

    function removeListener(element, listener) {
        var listeners = getListeners(element);
        for (var i = 0, len = listeners.length; i < len; ++i) {
            if (listeners[i] === listener) {
              listeners.splice(i, 1);
              break;
            }
        }
    }

    function removeAllListeners(element) {
      var listeners = getListeners(element);
      if (!listeners) { return; }
      listeners.length = 0;
    }

    return {
        get: getListeners,
        add: addListener,
        removeListener: removeListener,
        removeAllListeners: removeAllListeners
    };
};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* global console: false */

/**
 * Reporter that handles the reporting of logs, warnings and errors.
 * @public
 * @param {boolean} quiet Tells if the reporter should be quiet or not.
 */
module.exports = function(quiet) {
    function noop() {
        //Does nothing.
    }

    var reporter = {
        log: noop,
        warn: noop,
        error: noop
    };

    if(!quiet && window.console) {
        var attachFunction = function(reporter, name) {
            //The proxy is needed to be able to call the method with the console context,
            //since we cannot use bind.
            reporter[name] = function reporterProxy() {
                var f = console[name];
                if (f.apply) { //IE9 does not support console.log.apply :)
                    f.apply(console, arguments);
                } else {
                    for (var i = 0; i < arguments.length; i++) {
                        f(arguments[i]);
                    }
                }
            };
        };

        attachFunction(reporter, "log");
        attachFunction(reporter, "warn");
        attachFunction(reporter, "error");
    }

    return reporter;
};

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var prop = "_erd";

function initState(element) {
    element[prop] = {};
    return getState(element);
}

function getState(element) {
    return element[prop];
}

function cleanState(element) {
    delete element[prop];
}

module.exports = {
    initState: initState,
    getState: getState,
    cleanState: cleanState
};


/***/ }),
/* 29 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 30 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 31 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 32 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 33 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 34 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 35 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_36__;

/***/ }),
/* 37 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_37__;

/***/ }),
/* 38 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_38__;

/***/ }),
/* 39 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_39__;

/***/ }),
/* 40 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_40__;

/***/ }),
/* 41 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_41__;

/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_angular__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_angular___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_angular__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lineage_plot_lineage_plot_js__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lineage_scatter_plot_lineage_scatter_plot_js__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__radial_lineage_plot_radial_lineage_plot_js__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__radial_phylogenetic_tree_radial_phylogenetic_tree_js__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__common_css__ = __webpack_require__(17);
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