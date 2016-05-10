export function d3legend() {
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
        maxSize = {width: -1, height: -1};

    // For each small multiple…
    function legend(g) {
        splitAfter = splitAfter.clamp(0, seriesNames.length);
        if (splitAfter === 0) splitAfter = seriesNames.length;
        let longestName = seriesNames.reduce((a, b) => a.length > b.length ? a : b);

        let lengthTestString = g.append("text").attr("visibility", false).text(longestName);
        let box = lengthTestString[0][0].getBBox();
        box.height = parseInt(window.getComputedStyle(lengthTestString[0][0]).fontSize, 10);
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

        let item = g.selectAll("g.legend-item").data(seriesNames);

        item.enter()
            .append("g")
            .attr("class", "legend-item");

        item.attr("transform", (d, i) => `translate(${legendHorizontalOffset + padding + (i % splitAfter) * (columnWidth + horizontalItemSpacing)},
                                            ${legendVerticalOffset + padding + Math.floor(i / splitAfter) * (rowHeight + verticalItemSpacing)})`);

        item.each(function (d, i) {
            let sel = d3.select(this);

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
            anchor = {x: "inside", y: "inside"};
        }
        else anchor = x;
        return this;
    };

    legend.anchorHorizontal = function (x) {
        if (!arguments.length) return anchorHorizontal;
        if (x === "left" || x === "center" || x === "right")
            anchorHorizontal = x;
        return legend;
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

export class d3tooltip {
    constructor(g) {
        this.tip = g.append("div").attr("class", "plotify-tooltip");
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

;

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

;

    show() {
        this.tip.transition().duration(0).style("opacity", 1);
        return this;
    }

;

    html(content) {
        this.tip.html(content);
        return this;
    }

;
}

//export class d3legend2 {
//    _splitAfter = 0;
//    _anchor = {x: "outside", y: "inside"};
//    _position = {x: "right", y: "center"};
//    _seriesNames = null;
//    _colourScale = null;
//    _onMouseOver = null;
//    _onMouseOut = null;
//    _onClick = null;
//    _selectedItems = null;
//    _maxSize = {width: -1, height: -1};
//    verticalItemSpacing = 10;
//    horizontalItemSpacing = 20;
//    padding = 10;
//    shapeSize = 10;
//
//    constructor() {
//        return this;
//    }
//    // For each small multiple…
//    draw(g) {
//        this._splitAfter = this._splitAfter.clamp(0, _seriesNames.length);
//        if (this._splitAfter === 0) this._splitAfter = _seriesNames.length;
//        let longestName = _seriesNames.reduce((a, b) => a.length > b.length ? a : b);
//
//        let lengthTestString = g.append("text").attr("visibility", false).text(longestName);
//        let box = lengthTestString[0][0].getBBox();
//        box.height = parseInt(window.getComputedStyle(lengthTestString[0][0]).fontSize, 10);
//        lengthTestString.remove();
//
//        let columnWidth = box.width + shapeSize + 5,
//            rowHeight = box.height;
//
//        if (padding + this._splitAfter * (columnWidth + horizontalItemSpacing) > _maxSize.width)
//            this._splitAfter = Math.floor((_maxSize.width - padding) / (columnWidth + horizontalItemSpacing));
//
//        if (padding + Math.floor(_seriesNames.length / this._splitAfter) * (rowHeight + verticalItemSpacing) > _maxSize.height)
//            this._splitAfter = Math.floor(1.0 / ((_maxSize.height - padding) / (rowHeight + verticalItemSpacing) / _seriesNames.length));
//
//        let rows = this._splitAfter > 0 ? Math.ceil(_seriesNames.length / this._splitAfter) : 1,
//            cols = this._splitAfter > 0 ? this._splitAfter : _seriesNames.length,
//            w = cols * columnWidth + (cols - 1) * horizontalItemSpacing + 2 * padding,
//            h = rows * rowHeight + (rows - 1) * verticalItemSpacing + 2 * padding,
//            shapeVerticalOffset = (rowHeight - shapeSize) / 2,
//            textVerticalOffset = (rowHeight + box.height) / 2 - 2,
//            legendHorizontalOffset = 0,
//            legendVerticalOffset = 0;
//
//        if ((_position.y === "top" && _anchor.y === "inside") || (_position.y === "bottom" && _anchor.y === "outside"))
//            legendVerticalOffset = 0;
//        else if ((_position.y === "top" && _anchor.y === "outside") || (_position.y === "bottom" && _anchor.y === "inside"))
//            legendVerticalOffset = -h;
//        else if (_position.y === "center" && (_position.x === "right" ||  _position.x === "left"))
//            legendVerticalOffset = -h / 2;
//
//        if ((_position.y === "left" && _anchor.x === "inside") || (_position.y === "right" && _anchor.x === "outside"))
//            legendHorizontalOffset = 0;
//        else if ((_position.y === "left" && _anchor.x === "outside") || (_position.y === "right" && _anchor.x === "inside"))
//            legendHorizontalOffset = -w;
//        else if (_position.x === "center" && (_position.y === "top" ||  _position.y === "bottom"))
//            legendHorizontalOffset = -w / 2;
//
//        let item = g.selectAll("g.legend-item").data(_seriesNames);
//
//        item.enter()
//            .append("g")
//            .attr("class", "legend-item");
//
//        item.attr("transform", (d, i) => `translate(${legendHorizontalOffset + padding + (i % this._splitAfter) * (columnWidth + horizontalItemSpacing)},
//                                            ${legendVerticalOffset + padding + Math.floor(i / this._splitAfter) * (rowHeight + verticalItemSpacing)})`);
//
//        item.each(function (d, i) {
//            let sel = d3.select(this);
//
//            sel.append("rect")
//                .attr("class", "shape")
//                .attr("x", 2)
//                .attr("y", shapeVerticalOffset)
//                .attr("width", shapeSize)
//                .attr("height", shapeSize)
//                .attr("fill", _selectedItems[d] ? _colourScale(d) : "white")
//                .attr("stroke", _colourScale(d));
//
//            sel.append("text")
//                .attr("x", shapeSize + 5)
//                .attr("y", textVerticalOffset)
//                .attr("fill", "black")
//                .text(d);
//
//            sel.append("rect")
//                .attr("class", "legend-item-mouse-capture")
//                .attr("x", 0)
//                .attr("y", 0)
//                .attr("width", columnWidth)
//                .attr("height", rowHeight)
//                .attr("fill", "white")
//                .attr("opacity", 0);
//        });
//
//        if (_onMouseOver) item.on("mouseover", _onMouseOver);
//        if (_onMouseOut) item.on("mouseout", _onMouseOut);
//        if (_onClick) item.on("click", _onClick);
//    }
//
//    set splitAfter(splitAfter) { this._splitAfter = splitAfter; return this; };
//    set anchor(anchor) {
//        if (anchor.x == "outside" && anchor.y == "outside") {
//            console.warn('Anchor x and y should not be both set to "outside". Setting both to "inside"');
//            this._anchor = {x: "inside", y: "inside"};
//        }
//        else this._anchor = anchor;
//        return this;
//    };
//    set position(position) { this._position = position; return this; };
//    set maxSize(maxSize) { this._maxSize = maxSize; return this; };
//    set seriesNames(seriesNames) { this._seriesNames = seriesNames; return this; };
//    set colourScale(colourScale) { this._colourScale = colourScale; return this; };
//    set onMouseOver(onMouseOver) { this._onMouseOver = onMouseOver; return this; };
//    set onMouseOut(onMouseOut) { this._onMouseOut = onMouseOut; return this; };
//    set onClick(onClick) { this._onClick = onClick; return this; };
//    set selectedItems(selectedItems) { this._selectedItems = selectedItems; return this; };
//}

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
        typeAttr[attr] = (d) => types[d.type][attr];
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

export function createTreeLayout(nodesArray) {
    let nodes = copyNodesArray(nodesArray);
    return nodes.map(node => {
        node.children = nodes.filter(n => n.parent == node.name);
        return node;
    }).filter(n => !n.parent);
}

export function copyNodesArray(nodesArray) {
    return nodesArray.map(node => JSON.parse(JSON.stringify(node)));
}

export function spreadGenerations(tree, gen = 0) {
    tree.generation = gen;
    for (let child of tree.children) {
        spreadGenerations(child, gen + 1);
    }
}

export function roundOffFix(format, zeroThreshold=1e-10) {
    return d => {
        let str = d.toString();
        if (d < zeroThreshold && d > -zeroThreshold) d = 0;
        return format(str.length > 10 ? d.toPrecision(4) : d);
    }
}

export function getNodeLabelBBox(d) {
    d.bboxLabel = this.getBoundingClientRect();
    d.bboxLabel.top += d.bboxLabel.height * 0.2;
    d.bboxLabel.bottom -= d.bboxLabel.height * 0.2;

    d.bbox = this.parentNode.getBoundingClientRect();
    d.bbox.top = d.bboxLabel.top;
    d.bbox.bottom = d.bboxLabel.bottom;
}

export class labelCollisionDetection {
    constructor(nodes, labelPositions, labelLayout, xScale, yScale, width, height, searchRadius) {
        this.xScale = xScale;
        this.yScale = yScale;
        this.width = width;
        this.height = height;
        this.nodes = nodes;
        this.labelPositions = labelPositions;
        this.labelLayout = labelLayout;
        this.searchRadius = searchRadius;
        this.quadtreeGenerator = d3.geom.quadtree()
            .extent([[-1, -1], [this.width + 1, this.height + 1]])
            .x(d => this.xScale(d.x))
            .y(d => this.yScale(d.y));

        this.quadtree = this.createQuadTree(this.nodes);
    }

    createQuadTree(nodes) {
        return this.quadtreeGenerator(nodes);
    }

    quadtreeSearch(point) {
        let foundNodes = [], r = this.searchRadius,
            px = this.xScale(point.x), py = this.yScale(point.y),
            x0 = px - r, y0 = py - r, x3 = px + r, y3 = py + r;

        this.quadtree.visit((node, x1, y1, x2, y2) => {
            let outside = x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
            var p = node.point;
            if (p && !outside) {
                if(this.dist(px, py, this.xScale(p.x), this.yScale(p.y)) <= r && p != point) foundNodes.push(p);
            }
            return outside;
        });

        return foundNodes;
    }

    dist(x1, y1, x2, y2) {
        let dx = x2 - x1,
            dy = y2 - y1;
        return Math.pow(dx * dx + dy * dy, 0.5);
    }

    initializeLabelPositions(labels) {
        let initialLabelPosition = this.labelPositions[0];
        let self = this;
        labels.each(function (d) {
            let neighbours = self.quadtreeSearch(d),
                sel = d3.select(this),
                i = 1, c;
            d.labelPos = initialLabelPosition;
            while((c = self.isColliding(d, neighbours)) && i < self.labelPositions.length) {
                d.labelPos = self.labelPositions[i++];
                sel.attr(d.labelPos).each(getNodeLabelBBox);
            }
            if(c) {
                sel.style("opacity", 1e-6);
                d.bbox = d.bboxCircle || {left: -1, right: -1, top: -1, bottom: -1, width: 0, height: 0};
            }
            d.isCollidingLabel = c;
            d.neverCollidingLabel = i == 1;
        });
    }

    recalculateLabelPositions(labels, scale) {
        // create new quadtree
        this.quadtree = this.quadtreeGenerator(this.nodes.filter(d => {
            let x = this.xScale(d.x), y = this.yScale(d.y);
            return x >= 0 && x <= this.width && y >= 0 && y <= this.height;
        }));
        // resize label bounding boxes
        labels.attr(scaleProperties(this.labelLayout, scale))
            .each(getNodeLabelBBox);

        let self = this;
        // prevent label overlapping
        labels.each(function (d) {
            let x = self.xScale(d.x), y = self.yScale(d.y), i = 0, c,
                sel = d3.select(this);

            if(x < 0 || x > self.width || y < 0 || y > self.height) {
                d.isCollidingLabel = !d.neverCollidingLabel;
                sel.style("opacity", d.isCollidingLabel ? 1e-6 : 1);
                return;
            }

            sel.attr(scaleProperties(d.labelPos, scale))
                .each(getNodeLabelBBox);

            let neighbours = self.quadtreeSearch(d);
            do {
                d.labelPos = self.labelPositions[i++];
                sel.attr(scaleProperties(d.labelPos, scale))
                    .each(getNodeLabelBBox);
            } while ((c = self.isColliding(d, neighbours)) && i < self.labelPositions.length);

            if(c) {
                d.bbox =  d.bboxCircle || {left: -1, right: -1, top: -1, bottom: -1, width: 0, height: 0};
                d.bboxLabel = d.bbox;
            }
            sel.style("opacity", c ? 1e-6 : 1);
            d.isCollidingLabel = c;
        });
    }

    checkCollision(rect1, rect2) {
        return (rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.bottom > rect2.top &&
        rect1.top < rect2.bottom);
    }

    isColliding(object1, objects) {
        for(let object2 of objects) {
            if (this.checkCollision(object1.bboxLabel, object2.bbox)) return true;
        }
        return false;
    }
}

let colourBarID = 0;
export function drawColourBar(selection, domain, heatmapOptions, defs, defsRoutePath) {

    let width = heatmapOptions.colourBar.width,
        height = heatmapOptions.colourBar.height,
        colourScale = heatmapOptions.colourScale,
        opacity = heatmapOptions.opacity;

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
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", `url(${defsRoutePath}#gradient${colourBarID++})`)
        .attr("stroke-width", 2)
        .attr("stroke", "grey")
        .style("opacity", opacity);

    // Define x axis and grid
    let colourAxis = d3.svg.axis()
        .scale(d3.scale.linear().domain(domain).range([height, 0]))
        .orient("right");

    selection.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${width}, 0)`)
        .call(colourAxis);
}

export function calcColourBarSize(size, relativeSize) {
    if (typeof size === 'string' || size instanceof String) {
        if (size === "auto") return relativeSize;
        else if (size[size.length - 1] === "%") return relativeSize * parseInt(size) / 100;
        else return relativeSize;
    }
    else return size;
}