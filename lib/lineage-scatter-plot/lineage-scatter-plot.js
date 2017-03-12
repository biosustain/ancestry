import './lineage-scatter-plot.css'
import angular from 'angular'
import * as d3 from 'd3'
import {  d3legend, d3tooltip, mergeTemplateLayout, createNodeTypes, createDynamicNodeAttr, roundOffFix, LabelCollisionDetection,
    scaleProperties, getNodeLabelBBox, calcColourBarSize, drawColourBar, testLabelLength, getExtraSpaceForLabel,
    multiAttr, getTranslation, createPlotControls, attachActionOnResize} from '../shared-features.js'


class LineageScatterPlotController {
    constructor($element, $window) {
        attachActionOnResize($window, () => this.render({}));
        $element.addClass("ancestry ancestry-lineage-scatter-plot");

        this.svg = d3.select($element[0])
            .style("position", "relative")
            .append("svg");

        this.mouseStart = null;
        this.colours = d3.scaleOrdinal(d3.schemeCategory10);
        this.selectionRect = null;
        this.tooltip = new d3tooltip(d3.select($element[0]));
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

        let copy = angular.copy(this.value),
            {nodesData, links} = createLinks(copy.data, this.visibleSeries),
            longestNodeName = nodesData.length ? nodesData.reduce((a, b) => a.name.length > b.name.length ? a : b).name : "",
            layout = mergeTemplateLayout(copy.layout, layoutTemplate),
            pathname = this.window.location.pathname,
            maxLabelLength = testLabelLength(this.svg, longestNodeName, layout.nodeLabel),
            maxLabelOffset = d3.max(labelPositions, (pos) => Math.abs(pos.x)),
            legendHeight = 0, legendWidth = 0, colourbarHeight = 0, colourbarWidth = 0,
            colourBarOffset = layout.heatmap.enabled && layout.heatmap.colourBar.show ? 15 : 0,
            legendOut = {top:false, right: false, bottom:false, left:false},
            lcdEnabled = layout.labelCollisionDetection.enabled != "never",
            lastTransform = d3.zoomIdentity,
            showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
            colourBarOrigWidth = layout.heatmap.colourBar.width, colourBarOrigHeight = layout.heatmap.colourBar.height,
            colourbar = d3.select(),
            legend = d3.select(),
            xAxisLabelSVG = d3.select(),
            yAxisLabelSVG = d3.select(),
            titleSVG = d3.select();

        if (layout.legend.show) {
            if (layout.legend.anchor.x == "outside") legendOut[layout.legend.position.x] = true;
            if (layout.legend.anchor.y == "outside") legendOut[layout.legend.position.y] = true;
        }

        if (maxLabelLength < 40) maxLabelLength = 40;

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

            let domain = d3.extent(nodesData, node => node.z);

            if (domain[0] == domain[1]) {
                if (domain[0] === undefined) {
                    domain[0] = domain[1] = 0;
                }
                domain[0] -= 0.5;
                domain[1] += 0.5;
            }

            this.heatmapColourScale = d3.scaleLinear()
                .domain(domain)
                .range(layout.heatmap.colourScale.map(v => v[1]));

            if (layout.heatmap.colourBar.show) {
                layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
                layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

                colourbar = chart.append("g")
                    .attr("class", "ancestry-colourbar");

                drawColourBar(colourbar, this.heatmapColourScale.domain(), layout.heatmap, defs, pathname);

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

            let drawLegend = d3legend()
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
            let clicked = d3.select(this);
            if (that.visibleSeries.has(label))
                that.visibleSeries.delete(label);
            else
                that.visibleSeries.add(label);
            clicked.classed("legend-item-selected", that.visibleSeries.has(label));
            clicked.select("rect.shape").attr("fill", that.visibleSeries.has(label) ? that.colours(label) : "white");
            that.render({isNewData: false})
        }

        let initialLabelPosition = labelPositions[0];

        let types = createNodeTypes(nodesData, layout.nodeTypes, this.defaultNode),
            nodeAttr = createDynamicNodeAttr(types, Object.keys(this.defaultNode));

        // check if x axis data is time data
        //let isTimePlot = nodesData[0].x instanceof Date;
        let isTimePlot = false;

        // define x and y axes formats
        let xAxisFormat = isTimePlot ? d3.time.format(layout.xAxis.format || this.defaultTimeFormat) :
                d3.format(layout.xAxis.format || this.defaultScalarFormat),
            yAxisFormat = d3.format(layout.yAxis.format || this.defaultScalarFormat);

        // find extent of input data and calculate margins
        let xExtent = d3.extent(nodesData, node => node.x),
            yExtent = d3.extent(nodesData, node => node.y);

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
        let xScale = d3.scaleLinear() //(isTimePlot ? d3.time.scale() : d3.scaleLinear())
            .domain(xExtent)
            .range([0, width]);

        // define x axis
        let xAxis = d3.axisBottom()
            .scale(xScale)
            .tickSizeInner(0)
            .tickSizeOuter(0)
            .tickFormat(xAxisFormat);

        // define y scale
        let yScale = d3.scaleLinear()
            .domain(yExtent)
            .range([height, 0]);

        // define y axis
        let yAxis = d3.axisLeft()
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
        let nodeLink = d3.line()
            .x(node => xScale(node.x))
            .y(node => yScale(node.y));

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

        let labelExtraSpace = getExtraSpaceForLabel(xScale, maxLabelLength + maxLabelOffset + 5),
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
            layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
            layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

            drawColourBar(colourbar, this.heatmapColourScale.domain(), layout.heatmap, defs, pathname);
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

        multiAttr.call(marker, markerAttrs);

        marker.append("path")
            .attr("d", "M0,-4L10,0L0,4")
            .attr("fill", layout.link.stroke)
            .attr("class","arrowHead");

        let clipRectId = `lineage-scatter-clip-rect${d3.selectAll("clipPath").size()}`;

        defs.append("svg:clipPath")
            .attr("id", clipRectId)
            .append("svg:rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);

        // render links
        let plotArea = chart.append("g")
            .attr("id", "scatter-plot-area")
            .attr("clip-path", `url(${pathname}#${clipRectId})`)
            .append("g");

        if (layout.heatmap.enabled) {
            heatmapCircle = plotArea.append("g")
                .attr("class", "heatmap-layer")
                .selectAll("circle.heatmap-circle")
                .data(nodesData.filter(n => !isNaN(parseFloat(n.z))))
                .enter()
                .append("circle")
                .attr("class", "heatmap-circle")
                .style("fill", d => this.heatmapColourScale(d.z))
                .style("opacity", layout.heatmap.opacity)
                .attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`);

            multiAttr.call(this.heatmapCircle, layout.heatmap.circle);
        }

        let link = plotArea.selectAll(".link")
            .data(links)
            .enter()
            .append("svg:path")
            .attr("stroke-dasharray", ("3, 3"))
            .attr("d", conn => {
                return nodeLink(conn);
            })
            .attr("class", "link")
            .attr("marker-end", `url(${pathname}#marker-arrowhead)`);

        multiAttr.call(link, layout.link);

        // create node groups
        let node = plotArea.selectAll("g.node")
            .data(nodesData.map(d => {return {data: d};}))
            .enter()
            .append("g")
            .attr("class", "node")
            .each(d => {
                d.x = xScale(d.data.x);
                d.y = yScale(d.data.y);
            })
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
                let {x: xPos, y: yPos} = d3tooltip.getRelativePosition(this, that.element[0]),
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

        multiAttr.call(circle, nodeAttr);

        // render node labels
        let label = node.append("text")
            .attr("dy", ".35em")
            .attr("class", "node-label")
            .text(node => node.data.name)
            .style("opacity", 1)
            .each(getNodeLabelBBox)
            .each(d => d.labelPos = initialLabelPosition);

        multiAttr.call(label, layout.nodeLabel);
        multiAttr.call(label, initialLabelPosition);

        this.svg.selectAll("text").attr("fill", layout.textColour);

        let maxNodeLabelLength = d3.max(label.data().map(d => d.bboxLabel.width)),
            maxNodeLabelHeight = d3.max(label.data().map(d => d.bboxLabel.height)),
            searchRadius = {x: 2 * maxNodeLabelLength + 10, y: 2 * maxNodeLabelHeight};

        if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" ||
            layout.labelCollisionDetection.enabled === "onDelay") {
            this.LCD = new LabelCollisionDetection(node, labelPositions, layout.nodeLabel, width, height, searchRadius);
            this.LCD.recalculateLabelPositions(label, d3.zoomIdentity);
        }

        legend.each(function() { this.parentNode.appendChild(this);});
        titleSVG.each(function() { this.parentNode.appendChild(this);});

        if (layout.groupSelection.enabled) {
            this.selectionRect = mouseCaptureGroup.append("rect")
                .attr("class", "selection-rect");

            multiAttr.call(this.selectionRect, layout.groupSelection.selectionRectangle);
        }

        function mouseDown() {
            d3.event.preventDefault();
            that.mouseStart = d3.mouse(mouseRect.node());
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
            d3.event.preventDefault();
            let n = d3.select(this.parentNode);
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
            let p = d3.mouse(mouseRect.node());
            let d = {
                x: (p[0] < that.mouseStart[0] ? p[0] : that.mouseStart[0]),
                y: (p[1] < that.mouseStart[1] ? p[1] : that.mouseStart[1]),
                height: Math.abs(p[1] - that.mouseStart[1]),
                width: Math.abs(p[0] - that.mouseStart[0])
            };
            multiAttr.call(that.selectionRect, d);
            selectPoints(that.selectionRect);
        }

        function selectPoints(rect) {
            let rect_x1 = +rect.attr("x"),
                rect_y1 = +rect.attr("y"),
                rect_x2 = +rect.attr("width") + rect_x1,
                rect_y2 = +rect.attr("height") + rect_y1,
                any = false;

            node.each(function(d, i, j) {
                let n = d3.select(this);
                let [tx, ty] = getTranslation(n.attr("transform"));

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
                that.nodeClick({ $event: d3.event, $node: d.data});
            }

            circle.on('click', active ? nodeClickCallback : null);
        }

        let zoom = d3.zoom()
            .scaleExtent([1, layout.maxZoom])
            .extent([[0, 0],[width, height]])
            .translateExtent([[0, 0],[width, height]])
            .on("zoom", onZoom);

        function onZoom() {
            applyZoom(d3.event.transform);
            if (lcdEnabled) {
                applyLCD(d3.event.transform);
            }
            lastTransform = d3.event.transform;
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

            multiAttr.call(circle, scaleProperties(nodeAttr, scale, true));

            circle.attr("stroke", d => that.colours(d.data.series))
                .each(function (d) {
                    d.bboxCircle = this.getBoundingClientRect();
                });

            if (layout.heatmap.enabled) {
                multiAttr.call(that.heatmapCircle, scaleProperties(layout.heatmap.circle, scale));
            }
            multiAttr.call(that.svg.selectAll("path.link"), scaleProperties(layout.link, scale));
            label.each(function (d) {
                let self = d3.select(this);
                multiAttr.call(self, scaleProperties(layout.nodeLabel, scale));
                multiAttr.call(self, scaleProperties(d.labelPos, scale));
            });

            if (layout.groupSelection.enabled) {
                multiAttr.call(that.selectionRect, scaleProperties(layout.groupSelection.selectionRectangle, scale));
            }
        }

        function onDoubleClick() {
            let I = d3.zoomIdentity;
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
            }
            else if (layout.labelCollisionDetection.enabled === "onDelay") {
                that.window.clearTimeout(that.LCDUpdateID);
                that.LCDUpdateID = that.window.setTimeout(() => {
                    that.LCD.recalculateLabelPositions(label, transform);
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

        createPlotControls(this.element[0], controls, activeControls);

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
            label.style("opacity", d => toggle && !d.isColliding ? 1 : 1e-6);
            if (layout.labelCollisionDetection.enabled != "never" && layout.labelCollisionDetection.enabled != "onInit") {
                lcdEnabled = !lcdEnabled;
                if (lcdEnabled) {
                    that.LCD.recalculateLabelPositions(label, lastTransform);
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
    showLabel: true,
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
    }
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
export default angular.module('ancestry.lineage-scatter', [])
    //.directive('lineagePlot', LineagePlotDirective);
    .component('lineageScatterPlot', LineageScatterPlotComponent);