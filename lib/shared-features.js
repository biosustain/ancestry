import './icons-sprite.css';

let d3 = Object.assign({},
    require('d3-selection'),
    require('d3-scale'),
    require('d3-array'),
    require('d3-axis'),
    require('d3-quadtree')
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

export function almostEq(x, y, eps=1e-6) {
    return Math.abs(x - y) < eps;
}

export function getClipUniqueId() {
    return (d3.max(d3.selectAll('clipPath').data()) || 0) + 1;
}

export function d3legend() {
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

export function createPlotControls(root, controls, order, activeControls=new Set()) {
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

export class d3tooltip {
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

export function mergeTemplateLayout(layout, templateLayout) {
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

export function createNodeTypes(nodesArray, definedTypes, defaultType) {
    let typesFromLayout = Object.keys(definedTypes),
        typeNames = Array.from(new Set(nodesArray.map(node => node.type))),
        types = {};
    typeNames.forEach(type => {
        types[type] = typesFromLayout.includes(type) ? mergeTemplateLayout(definedTypes[type], defaultType) : defaultType;
    });
    types[undefined] = defaultType;
    return types;
}

export function createDynamicNodeAttr(types, attrNames) {
    let typeAttr = {};
    for (let attr of attrNames) {
        typeAttr[attr] = (d) => types[d.hasOwnProperty('data') ? d.data.type : d.type][attr];
    }
    return typeAttr;
}


export function scaleProperties(props, scale, dynamic = false) {
    let scaledProps = {};
    for (let key in props) {
        if (!props.hasOwnProperty(key)) continue;
        let test = dynamic ? props[key]({type: undefined}) : props[key];
        scaledProps[key] = !isNaN(test) && typeof test != 'string' ?
            (dynamic ? d=> props[key](d) / scale : props[key] / scale) : props[key];
    }
    return scaledProps;
}

export function createTreeLayout(nodes) {
    //let nodes = copyNodesArray(nodesArray);
    return nodes.map(node => {
        node.children = nodes.filter(n => n.parent == node.name);
        return node;
    }).filter(n => !n.parent);
}

export function flattifyTrees(trees) {
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

export function spreadNodes(node, level=0) {
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

export function spreadGenerations(tree, gen = 0) {
    tree.generation = gen;
    for (let child of tree.children) {
        spreadGenerations(child, gen + 1);
    }
}

export function project(d) {
    let a = (d._theta - 90) / 180 * Math.PI;
    return [d._r * Math.cos(a), d._r * Math.sin(a)];
}

export function skipProperties(obj, props) {
    let clone = Object.assign({}, obj);
    for (let prop of [].concat(props)) {
        delete clone[prop];
    }
    return clone;
}

export function getDomainLength(scale) {
    let domain = scale.domain();
    return Math.abs(domain[1] - domain[0]);
}

export function getBBox(d) {
    let {top, bottom, right, left, width, height} = this.getBoundingClientRect();
    d.bbox = {top, bottom, right, left};
}

export function getNodeLabelBBox(d) {
    d.bbox = {
        left: d.x + (d.currentLabelPos['text-anchor'] == 'start' ? 0 : -d.width),
        right: d.x + (d.currentLabelPos['text-anchor'] == 'start' ? d.width : 0),
        top: d.y - d.height + d.dy,
        bottom: d.y + d.dy
    };
}

export function getLinkLabelBBox(d) {
    d.bbox = {
        left: d.x - d.width / 2,
        right: d.x + d.width / 2,
        top: d.y - d.height + d.dy,
        bottom: d.y + d.dy
    };
}

export function resetBBox(d) {
    d.bbox = {
        top: -100,
        bottom: -100,
        right: -100,
        left: -100,
        width: 0,
        height: 0
    };
}

export class LabelCollisionDetection {
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

let colorBarID = 0;
export function drawColorBar(selection, domain, heatmapOptions, defs) {

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

export function calcColorBarSize(size, relativeSize) {
    if (typeof size === 'string' || size instanceof String) {
        if (size === 'auto') return relativeSize;
        else if (size[size.length - 1] === '%') return relativeSize * parseInt(size) / 100;
        else return relativeSize;
    }
    else return size;
}

export function testLabelLength(svg, name, _attrs) {
    let label = svg.append('text').text(name).attrs(_attrs),
        rect = label.node().getBoundingClientRect();
    label.remove();
    return {
        width: rect.width,
        height: rect.height
    };
}

export function allocatePaddingInScale(scale, padding) {
    let d = scale.domain()[0] instanceof Date ? scale.domain().map(x => x.getTime()) : scale.domain(),
        r = scale.range(),
        tmp1 = padding * (d[0] + d[1]),
        tmp2 = r[0] - r[1] + 2 * padding,
        d0p = (d[0] * (r[0] - r[1]) + tmp1) / tmp2,
        d1p = (r[0] * d[0] - r[1] * d[1] + tmp1) / tmp2;

    return scale.copy().domain([d0p, d1p]);
}

export function getTranslation(transform) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttributeNS(null, 'transform', transform);
    var matrix = g.transform.baseVal.consolidate().matrix;
    return [matrix.e, matrix.f];
}

export function attachActionOnResize(window, action) {
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

export function toggleSelectionDisplay(selectionInViewport, selectionNotInViewport) {
    selectionInViewport.style('display', 'inline');
    selectionNotInViewport.style('display', 'none');
}