import './lineage-plot.css'
import angular from 'angular'
import * as d3 from 'd3'

import { d3legend, d3tooltip, mergeTemplateLayout, createNodeTypes, LabelCollisionDetection, createTreeLayout,
    spreadGenerations, createDynamicNodeAttr, scaleProperties, drawColourBar, calcColourBarSize, getExtraSpaceForLabel,
    testLabelLength, multiAttr, getTranslation, createPlotControls, attachActionOnResize, getBBox, filterSeries,
    toggleSelectionDisplay} from '../shared-features.js'

class LineagePlotController {
    constructor($element, $window, $scope) {
        attachActionOnResize($window, () => this.render({}));
        $element.addClass("ancestry ancestry-lineage-plot");

        this.svg = d3.select($element[0])
            .style("position", "relative")
            .append("svg");

        this.maxAllowedDepth = 180;
        this.mouseStart = null;
        this.colours = d3.scaleOrdinal(d3.schemeCategory10);
        this.selectionRect = null;
        this.tooltip = new d3tooltip(d3.select($element[0]));
        this.defaultNode = {
            r: 4,
            "stroke-width": 2
        };
        this.selectedNodesSet = new Set();
        this.activeControls = null;
        this.LCD = null; // label collision detection
        this.lastLCDUpdateTime = 0;
        this.LCDUpdateID = null;
        this.heatmapColourScale = null;
        this.heatmapCircle = null;
        this.visibleSeries = new Set();
        this._$window = $window;
        this._$element = $element;
        this._$scope = $scope;
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

        if (!this.value || !this.value.data.length) return;

        let copy = angular.copy(this.value),
            layout = mergeTemplateLayout(copy.layout, layoutTemplate),
            seriesNames = Array.from(new Set(copy.data.map(d => d.series)));

        if (options.isNewData) {
            if (layout.seriesColours == null) {
                this.colours.domain([]);
            }
            this.visibleSeries = new Set(seriesNames);
            this.selectedNodesSet.clear();
            for (let node of this.value.data.filter(d => d.selected === true)) {
                this.selectedNodesSet.add(node.name);
            }
        }

        let treeData = filterSeries(copy.data, this.visibleSeries),
            longestNodeName = treeData.length ? treeData.reduce((a, b) => a.name.length > b.name.length ? a : b).name : "",
            verticalExtraSpace = 40,
            pathname = this._$window.location.pathname,
            maxLabelLength = testLabelLength(this.svg, longestNodeName, layout.nodeLabel),
            maxLabelOffset = d3.max(layout.nodeLabelPositions, (pos) => Math.abs(pos.x)),
            legendHeight = 0, legendWidth = 0, colourbarHeight = 0, colourbarWidth = 0,
            legendOut = {top: false, right: false, bottom: false, left: false},
            lcdEnabled = layout.labelCollisionDetection.enabled != "never",
            lastTransform = d3.zoomIdentity,
            showAxisTitle = layout.axis.show && !layout.axis.gridOnly && layout.axis.title,
            showHeatmapTitle = layout.heatmap.enabled && layout.heatmap.title !== null,
            colourBarOrigWidth = layout.heatmap.colourBar.width, colourBarOrigHeight = layout.heatmap.colourBar.height,
            colourBarOffset = layout.heatmap.enabled && layout.heatmap.colourBar.show ? 15 : 0,
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

        let initialLabelPosition = layout.nodeLabelPositions[0];

        let virtualRootNode = {name: "virtualRoot", children: [], parent: null};

        let allTrees = createTreeLayout(treeData),
            root = virtualRootNode;

        virtualRootNode.children = allTrees.map(node => {
            node.parent = "virtualRoot";
            return node;
        });

        if (layout.axis.valueProperty === "default") {
            spreadGenerations(root);
        }

        let types = createNodeTypes(treeData, layout.nodeTypes, this.defaultNode),
            nodeAttr = createDynamicNodeAttr(types, Object.keys(this.defaultNode));

        // FIXME: time plotting not implemented / checked yet
        let isTimePlot = false;//trees[0].generation instanceof Date;

        let elementWidth = this._$element[0].offsetWidth,
            elementHeight = this._$element[0].offsetHeight;


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

        if (layout.seriesColours != null) {
            this.colours = (series) => layout.seriesColours[series];
        }

        if (layout.heatmap.enabled) {

            let domain = d3.extent(treeData, node => node.z);

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
            let clicked = d3.select(this);
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

        let generationExtent = d3.extent(treeData, node => node.generation),
            originalExtent = angular.copy(generationExtent);

        generationExtent[1] += 1;
        generationExtent[0] -= 1;
        let depth = width / (generationExtent[1] - generationExtent[0]);

        let spaceRight = 1,
            treeWidth = width;
        //trim depth if exceeds maximum allowed depth
        if (depth > this.maxAllowedDepth) {
            depth = this.maxAllowedDepth;
            spaceRight = (width / depth) - originalExtent[1];
            generationExtent[1] = width / depth;
        } else if (depth < layout.minGenerationWidth) {
            depth = layout.minGenerationWidth;
            treeWidth = (generationExtent[1] - generationExtent[0]) * depth;
        }

        // define x scale
        let xScale = d3.scaleLinear()
            .domain(generationExtent)
            .range([0, treeWidth]);


        let labelExtraSpace = getExtraSpaceForLabel(xScale, maxLabelLength + maxLabelOffset + 5),
            newDomain = angular.copy(xScale.domain());

        if (labelExtraSpace > 1) {
            newDomain[0] = originalExtent[0] - labelExtraSpace;
        }
        if (labelExtraSpace > spaceRight) {
            newDomain[1] = originalExtent[1] + labelExtraSpace;
        }

        xScale.domain(newDomain);

        let clipRectId = `lineage-clip-rect${d3.selectAll("clipPath").size()}`,
            treesClipRect = defs.append("svg:clipPath")
                .attr("id", clipRectId)
                .append("svg:rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", height);

        let axisClipRectId = `lineage-clip-rect${d3.selectAll("clipPath").size()}`,
            axisClipRect = defs.append("svg:clipPath")
                .attr("id", axisClipRectId)
                .append("svg:rect")
                .attr("x", 0)
                .attr("y", -100)
                .attr("width", width)
                .attr("height", height + 100);

        // Define x axis and grid
        let xAxis = d3.axisBottom()
            .scale(xScale)
            .tickSizeInner(0)
            .tickSizeOuter(0);

        //render x axis
        if (layout.axis.show) {
            axisSVG = chart.append("g")
                .attr("clip-path", `url(${pathname}#${axisClipRectId})`)
                .append("g")
                .attr("class", "axis x-axis")
                .call(xAxis);

            if (!layout.axis.gridOnly) {
                xAxisOffset = axisSVG.node().getBBox().height;
                margin.bottom += xAxisOffset - 3;
            }

            xAxis.ticks(Math.ceil(xScale.domain().reduce((a, b) => b - a)));
        }

        height = (layout.height || elementHeight) - margin.top - margin.bottom;

        treesClipRect.attr("height", height);
        treesClipRect.attr("height", height + 100);

        xAxis.tickSizeInner(-height);
        axisSVG.attr("transform", `translate(0, ${height})`).call(xAxis);
        axisSVG.selectAll(".tick line").attr("opacity", 0.2).style("shape-rendering", "crispEdges");
        axisSVG.selectAll("path.domain").style("shape-rendering", "crispEdges");
        this.svg.selectAll(".axis path, .axis line").attr("stroke", layout.axis.colour);

        chart.attr("transform", `translate(${margin.left}, ${margin.top})`);

        let treeLayout = d3.tree().size([height - verticalExtraSpace, treeWidth]),
            nodes = treeLayout(d3.hierarchy(root, d => d.children));

        let descendants = nodes.descendants().filter(n => n.parent !== null);
        // Calculate depth positions.
        descendants.forEach(node => {
            node.y = node.x + verticalExtraSpace / 2;
            node.x = xScale(node.data.generation);
        });

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
            layout.heatmap.colourBar.height = calcColourBarSize(colourBarOrigHeight, height);
            layout.heatmap.colourBar.width = calcColourBarSize(colourBarOrigWidth, width);

            drawColourBar(colourbar, this.heatmapColourScale.domain(), layout.heatmap, defs, pathname);
            colourbar.attr("transform", `translate(${width + colourBarOffset},${(height - layout.heatmap.colourBar.height)/2})`);
        }
        // for nicer png downloads
        this.svg.selectAll(".tick text").attr("font-size", 12);

        let mouseCaptureGroup = chart.append("g");

        let mouseRect = mouseCaptureGroup.append("rect")
            .attr("id", "mouse-capture")
            .attr("width", treeWidth)
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

            multiAttr.call(this.heatmapCircle, layout.heatmap.circle);
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

        multiAttr.call(link, layout.link);
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
                let {x: xPos, y: yPos} = d3tooltip.getRelativePosition(this, that._$element[0]),
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
            .each(getBBox)
            .each(d => {
                d.currentLabelPos = initialLabelPosition;
                d.scaledLabelPos = initialLabelPosition;
                d.x = d.node.x + d.scaledLabelPos.x;
                d.y = d.node.y + d.scaledLabelPos.y;
            })
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("text-anchor", d => d.scaledLabelPos['text-anchor']);

        multiAttr.call(nodeLabel, layout.nodeLabel);
        this.svg.selectAll("text").attr("fill", layout.textColour);

        let linkLabel = treesContainer.append("g")
            .attr("class", "link-label-layer")
            .selectAll("text")
            .data(descendants
                .filter(d => d.parent.data.name != "virtualRoot" && d.data.inLinkLabel != null)
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
            .each(getBBox);

        multiAttr.call(linkLabel, layout.linkLabel);

        let maxNodeLabelLength = d3.max(nodeLabel.data().map(d => d.bbox.width)),
            maxNodeLabelHeight = d3.max(nodeLabel.data().map(d => d.bbox.height)),
            maxLinkLabelHeight = d3.max(linkLabel.data().map(d => d.bbox.height)),
            maxLinkLabelLength = d3.max(linkLabel.data().map(d => d.bbox.width)),
            nodeSearchRadius = {x: 2 * maxNodeLabelLength + 10, y: 2 * maxNodeLabelHeight},
            linkSearchRadius = {x: maxLinkLabelLength + 10, y: 2 * maxLinkLabelHeight};

        if (layout.labelCollisionDetection.enabled === "onEveryChange" || layout.labelCollisionDetection.enabled === "onInit" ||
            layout.labelCollisionDetection.enabled === "onDelay") {
            let order = [[],[]];
            order[layout.labelCollisionDetection.order.nodeLabel - 1].push(nodeLabel);
            order[layout.labelCollisionDetection.order.linkLabel - 1].push(linkLabel);
            this.LCD = new LabelCollisionDetection([circle], order, layout.nodeLabelPositions, layout.nodeLabel, width, height, nodeSearchRadius, linkSearchRadius);
            this.LCD.recalculateLabels(d3.zoomIdentity);
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

            multiAttr.call(this.selectionRect, layout.groupSelection.selectionRectangle);
        }

        function click() {
            d3.event.preventDefault();
            let n = d3.select(this.parentNode);
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

            node.each(function (d, i) {
                let n = d3.select(this);
                let [tx, ty] = getTranslation(n.attr("transform"));

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
                that._$scope.$apply(() => {
                    that.selectedNodes({ $nodes: Array.from(that.selectedNodesSet)});
                });
            }
        }

        function toggleNodeClickCallback(active) {
            if (that.nodeClick === undefined) return;

            function nodeClickCallback(d) {
                that._$scope.$apply(() => {
                    that.nodeClick({ $event: d3.event, $node: d.data});
                });
            }

            circle.on('click', active ? nodeClickCallback : null);
        }

        let zoom = d3.zoom()
            .scaleExtent([1, layout.maxZoom])
            .extent([[0, 0],[width, height]])
            .translateExtent([[0, 0],[treeWidth, height]])
            .on("zoom", onZoom);

        function onZoom() {
            applyZoom(d3.event.transform);
            lastTransform = d3.event.transform;
            if (lcdEnabled) {
                applyLCD(d3.event.transform);
            }
        }


        function linkVisible(d) {
            let dx = d.x * lastTransform.k + lastTransform.x, dy = d.y * lastTransform.k + lastTransform.y,
                dxParent = d.parent.x * lastTransform.k + lastTransform.x;
            return dx >= 0 && dxParent <= width && dy >= 0 && dy <= height;
        }

        function isVisible(d) {
            let dx = d.x * lastTransform.k + lastTransform.x, dy = d.y * lastTransform.k + lastTransform.y;
            return dx >= 0 && dx <= width && dy >= 0 && dy <= height;
        }

        function applyZoom(zoomTransform) {
            let [nodeLabelInViewport, nodeLabelNotInViewport] = nodeLabel.partition(isVisible),
                [linkLabelInViewport, linkLabelNotInViewport] = linkLabel.partition(isVisible),
                [linkInViewport, linkNotInViewport] = link.partition(linkVisible),
                [circleInViewport, circleNotInViewport] = circle.partition(isVisible);
            toggleSelectionDisplay(nodeLabelInViewport, nodeLabelNotInViewport);
            toggleSelectionDisplay(linkLabelInViewport, linkLabelNotInViewport);
            toggleSelectionDisplay(linkInViewport, linkNotInViewport);
            toggleSelectionDisplay(circleInViewport, circleNotInViewport);

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

            multiAttr.call(circleInViewport, scaleProperties(nodeAttr, scale, true));

            if (layout.heatmap.enabled) {
                let [heatmapCircleInViewport, heatmapCircleNotInViewport] = that.heatmapCircle.partition(isVisible);
                toggleSelectionDisplay(heatmapCircleInViewport, heatmapCircleNotInViewport);
                multiAttr.call(heatmapCircleInViewport, scaleProperties(layout.heatmap.circle, scale));
            }
            multiAttr.call(linkInViewport, scaleProperties(layout.link, scale));
            nodeLabelInViewport.each(d => {
                    d.scaledLabelPos = scaleProperties(d.currentLabelPos, scale);
                    d.x = d.node.x + d.scaledLabelPos.x;
                    d.y = d.node.y + d.scaledLabelPos.y;
                })
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .attr("text-anchor", d => d.scaledLabelPos['text-anchor']);
            multiAttr.call(nodeLabelInViewport, scaleProperties(layout.nodeLabel, scale));

            linkLabelInViewport.each(d => {
                    d.x = (d.nodeTo.x + d.nodeTo.parent.x) / 2;
                    d.y = (d.nodeTo.y + d.nodeTo.parent.y) / 2;
                })
                .attr("x", d => d.x)
                .attr("y", d => d.y);
            multiAttr.call(linkLabelInViewport, scaleProperties(layout.linkLabel, scale));

            if (layout.groupSelection.enabled) {
                multiAttr.call(that.selectionRect, scaleProperties(layout.groupSelection.selectionRectangle, scale));
            }
        }

        function onDoubleClick() {
            zoom.scaleTo(chart, 1);
            lastTransform = d3.zoomTransform(chart.node());
            applyZoom(lastTransform);
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
        if (this.activeControls == null) {
            this.activeControls = new Set(layout.controlsEnabledOnStart);
        }

        createPlotControls(this._$element[0], controls, this.activeControls);

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
            if (layout.labelCollisionDetection.enabled != "never" && layout.labelCollisionDetection.enabled != "onInit") {
                lcdEnabled = toggle;
                if (lcdEnabled) {
                    that.LCD.recalculateLabels(lastTransform);
                }
            }
            nodeLabel.style("opacity", d => toggle && !d.isColliding ? 1 : 1e-6);
            linkLabel.style("opacity", d => toggle && !d.isColliding ? 1 : 1e-6);
        }
    }
}

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
    nodeTypes: {},
    seriesColours: null,
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
    minGenerationWidth: 50,
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
    ],
    controlsEnabledOnStart: ['label']
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
export default angular.module('ancestry.lineage', [])
    //.directive('lineagePlot', LineagePlotDirective);
    .component('lineagePlot', LineagePlotComponent);