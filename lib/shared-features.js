export function d3legend() {
    let width = 0,
        height = 0,
        splitAfter = 0,
        anchorVertical = "center",
        anchorHorizontal = "right",
        seriesNames = null,
        colourScale = null,
        onMouseOver = null,
        onMouseOut = null,
        onClick = null,
        selectedItems = null,
        verticalItemSpacing = 10,
        horizontalItemSpacing = 20,
        padding = 10,
        shapeSize = 10;

    // For each small multiple…
    function legend(g) {
        splitAfter = splitAfter.clamp(0, seriesNames.length);
        if (splitAfter === 0) splitAfter = seriesNames.length;
        let longestName = seriesNames.reduce((a, b) => a.length > b.length ? a : b);

        let lengthTestString = g.append("text").attr("visibility", false).text(longestName);
        let box = lengthTestString[0][0].getBBox();
        box.height = parseInt(window.getComputedStyle(lengthTestString[0][0]).fontSize, 10)
        lengthTestString.remove();

        let columnWidth = box.width + shapeSize + 5,
            rowHeight = box.height,
            rows = splitAfter > 0 ? Math.ceil(seriesNames.length / splitAfter) : 1,
            cols = splitAfter > 0 ? splitAfter : seriesNames.length,
            w = cols * columnWidth + (cols - 1) * horizontalItemSpacing + 2 * padding,
            h = rows * rowHeight + (rows - 1) * verticalItemSpacing + 2 * padding,
            shapeVerticalOffset = (rowHeight - shapeSize) / 2,
            textVerticalOffset = (rowHeight + box.height) / 2 - 2,
            legendHorizontalOffset = 0,
            legendVerticalOffset = 0;

        switch (anchorHorizontal) {
            case "left":
                legendHorizontalOffset = 0;
                break;
            case "center":
                legendHorizontalOffset = -w / 2;
                break;
            case "right":
                legendHorizontalOffset = -w;
                break;
        }

        switch (anchorVertical) {
            case "top":
                legendVerticalOffset = 0;
                break;
            case "center":
                legendVerticalOffset = -h / 2;
                break;
            case "bottom":
                legendVerticalOffset = -h;
                break;
        }

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
                .attr("fill", selectedItems[d] ? colourScale(d) : "white")
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

    legend.width = function (x) {
        if (!arguments.length) return width;
        width = x;
        return legend;
    };

    legend.height = function (x) {
        if (!arguments.length) return height;
        height = x;
        return legend;
    };

    legend.splitAfter = function (x) {
        if (!arguments.length) return splitAfter;
        splitAfter = x;
        return legend;
    };

    legend.anchorVertical = function (x) {
        if (!arguments.length) return anchorVertical;
        if (x === "top" || x === "center" || x === "bottom")
            anchorVertical = x;
        return legend;
    };

    legend.anchorHorizontal = function (x) {
        if (!arguments.length) return anchorHorizontal;
        if (x !== "left" || x === "center" || x === "right")
            anchorHorizontal = x;
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

export function mergeTemplateLayout(layout, templateLayout) {
    for (let p in templateLayout) {
        if (layout.hasOwnProperty(p)) {
            if (typeof templateLayout[p] == 'object' && templateLayout[p] != null) {
                layout[p] = mergeTemplateLayout(layout[p], templateLayout[p]);
            }
        }
        else {
            if (typeof templateLayout[p] == 'object' && templateLayout[p] != null) {
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

export function roundOffFix(format) {
    return d => {
        let str = d.toString(),
            last = str.slice(-9, -1);
        return str.length > 10 && (last == "00000000" || last == "99999999") ?
            format(Number(str.slice(0, -1))) : format(d);
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
