import * as d3 from 'd3';
import SVG2Bitmap from "./SVG2Bitmap.js";
import './icons-sprite.css';

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

export function createPlotControls(root, controls, activeControls = []) {
    const ICONS = {
        'download': 'svg-ic_photo_camera_black_24px',
        'select': 'svg-ic_radio_button_checked_black_24px',
        'zoom': 'svg-ic_open_with_black_24px',
        'label': 'svg-ic_label_black_24px'
    };
    let plotRoot = d3.select(root),
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
            let self = d3.select(this);
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
            let self = d3.select(this);
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
            let self = d3.select(this);
            let active = self.classed("active");
            (controls['label'])(!active);
            self.classed("active", !active);
        });

    plotRoot.select("div.action-download")
        .on('click', function(){
            let canvas = plotRoot.append("canvas")
                .style("position", "absolute")
                .style("display", "none");

            SVG2Bitmap(plotRoot.select("svg").node(), canvas.node());

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

export class d3tooltip {
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
        typeAttr[attr] = (d) => types[d.hasOwnProperty("data") ? d.data.type : d.type][attr];
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

export function resetNodeLabelBBox(d) {
    d.bboxLabel = d.bboxCircle;
    d.bbox = d.bboxCircle;
}

export class LabelCollisionDetection {
    constructor(nodes, labelPositions, labelLayout, width, height, searchRadius) {
        this.width = width;
        this.height = height;
        this.nodes = nodes;
        this.nodesData = nodes.data();
        this.labelPositions = labelPositions;
        this.labelLayout = labelLayout;
        this.searchRadius = searchRadius;
        this.quadtree = d3.quadtree()
            .extent([[-1, -1], [this.width + 1, this.height + 1]]);
    }

    createQuadTree(nodes, t /*transform*/) {
        this.quadtree.removeAll(this.nodesData)
            .x(d => d.x * t.k + t.x)
            .y(d => d.y * t.k + t.y)
            .addAll(nodes);
    }

    quadtreeSearchWithTransform(point, {x: tx, y: ty, k: k} = {x: 0, y: 0, k: 1}) {
        let foundNodes = [],
            rx = this.searchRadius.x, ry = this.searchRadius.y, r = Math.sqrt(rx * rx + ry * ry),
            px = point.x * k + tx, py = point.y * k + ty,
            x0 = px - rx, y0 = py - ry, x3 = px + rx, y3 = py + ry;

        this.quadtree.visit((node, x1, y1, x2, y2) => {
            let outside = x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
            if (outside) return  true;
            let p = node.data;
            if (p) {
                if(this.dist(px, py, p.x * k + tx, p.y * k + ty) <= r && p != point) {
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

    recalculateLabelPositions(labels, transform = {x: 0, y: 0, k: 1}) {
        // remove all labels' bounding boxes
        labels.each(resetNodeLabelBBox);
        // find only the labels that are in the display to reduce computing time and sort them to promote right-size orientation
        let filteredLabels =  this.nodes.filter(d => {
                    let dx = d.x * transform.k + transform.x, dy = d.y * transform.k + transform.y;
                    return dx >= -10 && dx <= this.width + 10 && dy >= -10 && dy <= this.height + 10;
                })
                .selectAll('text.node-label')
                .sort((a, b) => b.x - a.x);
        // generate a new quad tree
        this.createQuadTree(filteredLabels.data(), transform);

        let self = this,
            N = self.labelPositions.length;
        // prevent label overlapping
        filteredLabels.each(function (d) {
            let i = 0,
                collision = false,
                sel = d3.select(this);

            let neighbours = self.quadtreeSearchWithTransform(d, transform);

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

            if(collision) { // reset bounding boxes if no non-colliding postions were found
                resetNodeLabelBBox(d);
            }
            // hide label if it collides
            sel.style("opacity", collision ? 1e-6 : 1);
            d.isColliding = collision;
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
    let colourAxis = d3.axisRight()
        .scale(d3.scaleLinear().domain(domain).range([height, 0]));

    selection.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${width + titleOffset}, 0)`)
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

export function testLabelLength(svg, name, _attrs) {
    let label = svg.append("text").text(name);
    multiAttr.call(label, _attrs);
    let length = label.node().getBoundingClientRect().width;
    label.remove();
    return length;
}

export function getExtraSpaceForLabel(scale, labelLength) {
    let d = scale.domain(), dd = d[1] - d[0],
        r = scale.range(), dr = r[1] - r[0];
    return labelLength * dd / (dr - 2 * labelLength);
}

export function multiAttr(attrs) {
    for (let [attr, value] of Object.entries(attrs)) {
        this.attr(attr, value);
    }
    return this;
}

export function getTranslation(transform) {
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttributeNS(null, "transform", transform);
    var matrix = g.transform.baseVal.consolidate().matrix;
    return [matrix.e, matrix.f];
}