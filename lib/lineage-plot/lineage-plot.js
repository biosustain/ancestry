import './lineage-plot.css'
import angular from 'angular'

let d3 = Object.assign({},
    require('d3-selection'),
    require('d3-selection-multi'),
    require('d3-format'),
    require('d3-xyzoom'),
    require('d3-scale'),
    require('d3-hierarchy'),
    require('d3-array'),
    require('d3-axis'),
    require('d3-brush')
);

d3.getEvent = () => require('d3-selection').event;

import { d3legend, d3tooltip, mergeTemplateLayout, createNodeTypes, LabelCollisionDetection, createTreeLayout,
    spreadGenerations, createDynamicNodeAttr, scaleProperties, drawColorBar, calcColorBarSize, getExtraSpaceForLabel,
    testLabelLength, getTranslation, createPlotControls, attachActionOnResize, getBBox, filterSeries,
    toggleSelectionDisplay, skipProperty, getLinkLabelBBox, getNodeLabelBBox, getDomainLength, almostEq}
    from '../shared-features.js'

class LineagePlotController {
    constructor($element, $window, $scope, $attrs) {
        this._$window = $window;
        this._$element = $element;
        this._$scope = $scope;
        this._$attrs = $attrs;

        attachActionOnResize($window, () => {
            this.initializeData(this.value, {isNewData: false});
            this.render({});
        });
        $element.addClass('ancestry ancestry-lineage-plot');

        this.svg = d3.select($element[0])
            .style('position', 'relative')
            .append('svg');
        this.defaultPalette = d3.scaleOrdinal(d3.schemeCategory10);
        this.maxAllowedDepth = 180;
        this.mouseStart = null;
        this.selectionRect = null;
        this.tooltip = new d3tooltip(d3.select($element[0]));
        this.defaultNode = {
            r: 4,
            'stroke-width': 2
        };
        this.selectedNodesSet = new Set();
        this.activeControls = null;
        this.LCD = null;
        this.LCDUpdateID = null;
        this.heatmapColorScale = null;
        this.heatmapCircle = null;
        this.colorBarOffset = 0;
        this.visibleSeries = new Set();

        this.onZoom = this.onZoom.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);
        this.toggleZoom = this.toggleZoom.bind(this);
        this.toggleSelect = this.toggleSelect.bind(this);
        this.toggleLabels = this.toggleLabels.bind(this);
        this.toggleBrush = this.toggleBrush.bind(this);
    }

    initializeData(value, options = {isNewData: true}) {
        value = angular.copy(value);
        this.layout = mergeTemplateLayout(value.layout, layoutTemplate);

        let elementWidth = this._$element[0].offsetWidth,
            elementHeight = this._$element[0].offsetHeight,
            margin = this.layout.margin;

        this.margin = margin;
        this.width = (this.layout.width || elementWidth);
        this.height = (this.layout.height || elementHeight);
        this.treeWidth = this.width - margin.right - margin.left;
        this.treeHeight = this.height - margin.top - margin.bottom;


        this.heightWithBrush = this.margin.top + this.treeHeight + this.margin.bottom +
            this.layout.brush.margin.bottom + this.layout.brush.margin.top + this.layout.brush.height;


        this.seriesNames = Array.from(new Set(value.data.map(d => d.series)));

        if (options.isNewData) {
            this.visibleSeries = new Set(this.seriesNames);
        }

        if (this.activeControls == null) {
            this.activeControls = new Set(this.layout.controlsEnabledOnStart);
        }
        this.lcdEnabled = this.layout.labelCollisionDetection.enabled != 'never' && this.activeControls.has('label');

        this.colors = (series) => {
            return (series in this.layout.seriesColors) ? this.layout.seriesColors[series] :
                this.defaultPalette(series);
        };

        let types = createNodeTypes(value.data, this.layout.nodeTypes, this.defaultNode);
        this.nodeAttr = createDynamicNodeAttr(types, Object.keys(this.defaultNode));
        let data = filterSeries(value.data, this.visibleSeries);
        this.lastData = angular.copy(data);

        this.isTimePlot = this.layout.axis.valueProperty === 'date';
        this.descendants = this.prepareNodes(data, this.treeWidth, this.treeHeight);

        this.nodeLabelData = this.descendants.map(d => {
            return {node: d, currentLabelPos: this.layout.nodeLabelPositions[0], dy: this.layout.nodeLabel.dy};
        });
        this.linkLabelData = this.descendants
            .filter(d => d.parent.data.name != 'virtualRoot' && d.data.inLinkLabel != null)
            .map(d => {
                return {nodeTo: d, dy: this.layout.linkLabel.dy};
            });

        this.generationExtent = d3.extent(this.descendants, node =>
            this.isTimePlot ? new Date(node.data.date * 1000) : node.depth);

        this.xScale = (this.isTimePlot ? d3.scaleTime() : d3.scaleLinear())
            .domain(this.generationExtent)
            .range([0, this.treeWidth]);

        this.yScale = d3.scaleLinear()
            .domain([0, this.treeHeight])
            .range([0, this.treeHeight]);

        this.adjustScale();

        this._xScale = this.xScale.copy();
        this._yScale = this.yScale.copy();

        this.heatmapColorScale = this.createHeatmapColorScale(data);

        this.updatePositions();
    }

    adjustScale() {
        let longestNodeName = this.descendants.length ? this.descendants.reduce((a, b) =>
                a.data.name.length > b.data.name.length ? a : b).data.name : '',
            maxLabelLength = testLabelLength(this.svg, longestNodeName, this.layout.nodeLabel),
            maxLabelOffset = d3.max(this.layout.nodeLabelPositions, (pos) => Math.abs(pos.x)),
            labelExtraSpace = getExtraSpaceForLabel(this.xScale, maxLabelLength + maxLabelOffset + 5),
            newDomain = this.xScale.domain().slice();

        newDomain[0] = this.isTimePlot ? new Date(newDomain[0].getTime() - labelExtraSpace) :
        newDomain[0] - labelExtraSpace;

        newDomain[1] = this.isTimePlot ? new Date(newDomain[1].getTime() + labelExtraSpace) :
        newDomain[1] + labelExtraSpace;

        this.xScale.domain(newDomain);

        let widestNode = Math.max.apply(null, Object.values(this.layout.nodeTypes).map(d => d.r));
        if (!isFinite(widestNode)) widestNode = 10;

        let yDomain = this.yScale.domain();
        yDomain[0] -= widestNode;
        yDomain[1] += widestNode;
        this.yScale.domain(yDomain);
    }

    $onChanges(changes) {
        if (changes.value && changes.value.currentValue) {
            this.initializeData(changes.value.currentValue);
            this.render({isNewData: true});
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

        let clipRectId = `lineage-clip-rect${d3.selectAll('clipPath').size()}`;
        this.defs.append('svg:clipPath')
            .attr('id', clipRectId)
            .append('svg:rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.treeWidth)
            .attr('height', this.treeHeight);

        this.treeFixedContainer = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        this.mouseRect = this.treeFixedContainer.append('rect')
            .attr('id', 'mouse-capture')
            .attr('width', this.treeWidth)
            .attr('height', this.treeHeight)
            .style('fill', 'transparent');

        this.makeZoom();
        this.drawColorBar();
        this.drawLegend();
        this.drawAxis();
        this.drawTitles();

        this.treeContainer = this.treeFixedContainer.append('g')
            .attr('clip-path', `url(${this._$window.location.pathname}#${clipRectId})`);

        this.drawTrees();

        this.makeNodeSelection();
        this.makeLCD();
        this.makeBrush();
        this.makeTooltip();
        this.zoomToMinimumWidth();

        this.makeControlPanel();

        if (this.layout.textColor) { // set global text color
            this.svg.selectAll('text').attr('fill', this.layout.textColor);
        }
    }

    prepareNodes(data, treeWidth, treeHeight) {
        let root = {name: 'virtualRoot', children: [], parent: null};

        let allTrees = createTreeLayout(data);

        root.children = allTrees.map(node => {
            node.parent = 'virtualRoot';
            return node;
        });

        let hierarchy = d3.hierarchy(root, d => d.children);

        if (this.isTimePlot) {
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

        let treeLayout = d3.tree().size([treeHeight, treeWidth]),
            nodes = treeLayout(hierarchy);

        let descendants = nodes.descendants().filter(n => n.parent !== null);
        // Calculate depth positions.
        descendants.forEach(node => {
            node.selected = this.selectedNodesSet.has(node.data.name);
            node._y = node.x; //yScale(node.x); // + verticalExtraSpace / 2;
            node._x = this.isTimePlot ? new Date(node.data.date * 1000) : node.depth; //xScale(isTimePlot ? new Date(node.data.date * 1000) : node.data.generation) ;
        });

        return descendants;
    }

    drawTrees(redraw = true) {
        if (redraw) {
            this.treeContainer.selectAll('*').remove();
        }
        this.drawLinks(redraw);
        this.drawNodes(redraw);
        this.linkLabelLayer.moveToFront();
    }

    drawNodes(redraw = true) {

        if (this.layout.heatmap.enabled && redraw) {

            this.heatmapCircle = this.treeContainer.append('g')
                .attr('class', 'heatmap-layer')
                .selectAll('circle.heatmap-circle')
                .data(this.descendants.filter(n => !isNaN(parseFloat(n.data.z))))
                .enter()
                .append('circle')
                .attr('class', 'heatmap-circle')
                .style('fill', d => this.heatmapColorScale(d.data.z))
                .style('opacity', this.layout.heatmap.opacity)
                .attrs(this.layout.heatmap.circle);
        }

        if (redraw) {
            this.circle = this.treeContainer.append('g')
                .attr('class', 'node-circle-layer')
                .selectAll('circle.node-circle')
                .data(this.descendants)
                .enter();

            if (this._$attrs.customNode) {
                this.circle = this.customNode({$selection: this.circle, $event: 'draw'});
            } else {
                this.circle = this.circle.append('circle')
                    .attr('class', 'node-circle')
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
                .each(getNodeLabelBBox)
                .attr('text-anchor', d => d.currentLabelPos['text-anchor'])
                .attrs(skipProperty(this.layout.nodeLabel, 'dy'));
        }

        if (this._$attrs.customNode) {
            this.customNode({$selection: this.circle, $event: 'update'});
        } else {
            this.circle.attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }

        this.heatmapCircle.attr('cx', d => d.x)
            .attr('cy', d => d.y);

        this.nodeLabel.attr('x', d => d.x)
            .attr('y', d => d.y);
    }

    drawAxis(redraw = true) {
        if (this.layout.axis.show) {

            this.xAxis = d3.axisBottom()
                .scale(this.xScale)
                .tickSizeInner(-this.treeHeight)
                .tickSizeOuter(0);

            if (!this.isTimePlot) {
                let [start, end] = this.xScale.domain();
                start = Math.max(Math.ceil(start), this.generationExtent[0]);
                end = Math.min(Math.floor(end), this.generationExtent[1]);
                this.xAxis.tickFormat(d3.format('d'))
                    .tickValues(d3.range(start, end + 1));
            }

            if (redraw) {
                this.axisSVG = this.treeFixedContainer.append('g')
                    .attr('transform', `translate(0, ${this.treeHeight})`)
                    .attr('class', 'axis x-axis');
            }
            this.axisSVG.call(this.xAxis);
            LineagePlotController.adjustAxisStyles((this.axisSVG));
        }
    }

    static adjustAxisStyles(axis) {
        axis.selectAll('.tick text').attr('font-size', 12);
        axis.selectAll('.tick line')
            .attr('stroke', '#ccc')
            .style('shape-rendering', 'crispEdges')
    }

    drawLinks(redraw = true) {
        if (redraw) {
            this.link = this.treeContainer.append('g')
                .attr('class', 'link-layer')
                .selectAll('path.link')
                .data(this.descendants.filter(n => n.parent.data.name != 'virtualRoot'))
                .enter()
                .insert('path', 'g')
                .attr('class', 'link')
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
                .each(getLinkLabelBBox)
                .attrs(skipProperty(this.layout.linkLabel, 'dy'));
        }

        this.link.attr('d', LineagePlotController.linkGenerator);
        this.linkLabel.attr('x', d => d.x)
            .attr('y', d => d.y);
    }

    drawLegend() {
        let that = this,
            x = this.layout.legend.x,
            y = this.layout.legend.y,
            anchor = this.layout.legend.anchor,
            orientation = this.layout.legend.orientation,
            splitAfter = orientation === 'horizontal' ? 0 : 1,
            totalWidth = this.treeWidth + this.colorBarOffset;

        function legendClick(/*d, i, all*/) {
            let d = arguments[0],
                all = d3.selectAll(arguments[2]);
            if (that.visibleSeries.has(d.label)) {
                that.visibleSeries.delete(d.label);
                if (!that.visibleSeries.size) {
                    all.each(d => {
                        d.active = true;
                        that.visibleSeries.add(d.label);
                    });
                }
            } else {
                that.visibleSeries.add(d.label);
            }
            all.classed('legend-item-selected', d => that.visibleSeries.has(d.label));
            all.selectAll('rect.shape')
                .attr('fill', d => that.visibleSeries.has(d.label) ? that.colors(d.label) : 'white');
            that.initializeData(that.value, {isNewData: false});
            that.drawAxis(false);
            that.drawTrees();
            that.makeBrush();
            that.treeFixedContainer.call(that.zoom.transform, d3.xyzoomIdentity); // TODO: transitions don't work properly with d3-xyzoom (.transition().duration(750))
            that.makeLCD();
            that.toggleSelect(that.activeControls.has('select'));
            that.makeTooltip();
        }

        let drawLegend = d3legend()
            .splitAfter(splitAfter)
            .anchor(anchor)
            .seriesNames(this.seriesNames)
            .colorScale(this.colors)
            .backgroundColor(this.layout.legend.backgroundColor || this.layout.backgroundColor)
            .maxSize({width: totalWidth, height: this.treeHeight})
            .onClick(legendClick)
            .selectedItems(this.visibleSeries);

        this.svg.append('g')
            .attr('transform',
                `translate(${this.margin.left + x * totalWidth},${this.margin.top + y * this.treeHeight})`)
            .attr('class', 'ancestry-legend')
            .call(drawLegend);
    }

    createHeatmapColorScale(nodes) {
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
        if (this.layout.heatmap.colorBar.show) {
            this.layout.heatmap.colorBar.height = calcColorBarSize(this.layout.heatmap.colorBar.height,
                                                                   this.treeHeight);
            this.layout.heatmap.colorBar.width = calcColorBarSize(this.layout.heatmap.colorBar.width, this.treeWidth);

            let colorBar = this.treeFixedContainer.append('g')
                .attr('class', 'ancestry-colorbar')
                .attr('transform', `translate(${this.treeWidth + this.layout.heatmap.colorBar.padding.left},${
                                                this.treeHeight / 2})`);

            drawColorBar(colorBar, this.heatmapColorScale.domain(), this.layout.heatmap, this.defs,
                         this._$window.location.pathname);

            this.colorBarOffset = colorBar.node().getBBox().width + this.layout.heatmap.colorBar.padding.left +
                this.layout.heatmap.colorBar.padding.right;
        }
    }

    makeTooltip() {
        if (this.layout.tooltip.show) {
            let that = this;

            this.circle.on('mouseover', function (d) {
                let x = 0, y = 0; // split into 2 lines to avoid WebStorm warning
                ({x, y} = d3tooltip.getRelativePosition(this, that._$element[0]));
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
    }

    static linkGenerator(d) {
        let c = Math.abs(d.parent.x - d.x) / 2;

        return 'M' + d.x + ',' + d.y
            + 'C' + (d.parent.x + c) + ',' + d.y
            + ' ' + (d.parent.x + c) + ',' + d.parent.y
            + ' ' + d.parent.x + ',' + d.parent.y;
    }

    updatePositions() {
        for (let node of this.descendants) {
            node.x = this.xScale(this.isTimePlot ? node._x.getTime() : node._x);
            node.y = this.yScale(node._y);
        }

        for (let node of this.nodeLabelData) {
            node.x = node.node.x + node.currentLabelPos.x;
            node.y = node.node.y + node.currentLabelPos.y + node.dy;
        }

        for (let node of this.linkLabelData) {
            node.x = (node.nodeTo.x + node.nodeTo.parent.x) / 2;
            node.y = (node.nodeTo.y + node.nodeTo.parent.y) / 2 + node.dy;
        }
    }

    makeLCD() {
        if (this.layout.labelCollisionDetection.enabled === 'onEveryChange' ||
            this.layout.labelCollisionDetection.enabled === 'onInit' ||
            this.layout.labelCollisionDetection.enabled === 'onDelay') {

            let order = [[], []];

            order[this.layout.labelCollisionDetection.order.nodeLabel - 1].push(this.nodeLabel);
            order[this.layout.labelCollisionDetection.order.linkLabel - 1].push(this.linkLabel);

            this.makeBBox();
            this.LCD = new LabelCollisionDetection([this.circle], order, this.layout.nodeLabelPositions,
                this.treeWidth, this.treeHeight, this.markerBBoxes);

            if (this.activeControls.has('label')) {
                this.LCD.recalculateLabels();
            }
        }
    }

    makeZoom() {
        this.zoom = d3.xyzoom()
            .extent([[0, 0], [this.treeWidth, this.treeHeight]])
            .scaleExtent([[1, Infinity], [1, Infinity]])
            .translateExtent([[0, 0], [this.treeWidth, this.treeHeight]])
            .on('zoom', this.onZoom);
    }

    onDoubleClick() {
        this.xScale = this._xScale.copy();
        this.yScale = this._yScale.copy();
        this.treeFixedContainer.call(this.zoom.transform, d3.xyzoomIdentity);
        this.axisSVG.call(this.xAxis.scale(this.xScale));
        this.updatePositions();
        this.drawLinks(false);
        this.drawNodes(false);
        this.applyLCD();
    }

    onZoom() {
        let event = d3.getEvent(),
            transform = event.transform;

        this.xScale = transform.rescaleX(this._xScale);
        this.yScale = transform.rescaleY(this._yScale);
        this.xAxis.scale(this.xScale);
        this.updatePositions();
        this.drawAxis(false);
        this.drawLinks(false);
        this.drawNodes(false);
        this.applyLCD();

        if (event.sourceEvent && (event.sourceEvent.type === 'brush' || event.sourceEvent.type === 'end')) return;

        let [x1, x2] = this.xScale.domain().map(this.xScaleBrush),
            [y1, y2] = this.yScale.domain().map(this.yScaleBrush);

        this.brushContainer.call(this.brush.move, this.layout.brush.lockY ? [x1, x2] : [[x1, y1], [x2, y2]]);
    }

    applyLCD(transform) {
        if (this.lcdEnabled) {
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
    }

    makeControlPanel() {
        let controls = {
            'download': function () {
            },
            'zoom': this.toggleZoom,
            'brush': this.toggleBrush,
            'select': this.toggleSelect,
            'label': this.toggleLabels
        };

        createPlotControls(this._$element[0], controls, this.activeControls);
    }

    makeNodeSelection() {
        // expose click for toggleSelect
        this.onNodeClick = onNodeClick;

        if (!this.layout.groupSelection.enabled) return;

        this.selectionRect = this.treeFixedContainer.append('rect')
            .attr('class', 'selection-rect')
            .attrs(this.layout.groupSelection.selectionRectangle);

        let that = this,
            mouseStart = null;

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
            let newSelected = new Set(that.circle.filter(d => d.data.selected).data().map(d => d.data.name)),
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
            that.circle.style('pointer-events', 'all');
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
            that.circle.each(d => {
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
                that.circle.partition(d => d.x >= rect_x1 && d.x <= rect_x2 && d.y >= rect_y1 && d.y <= rect_y2);

            inSelection.each(d => {
                d.data.selected = true
            });
            outSelection.each(d => {
                d.data.selected = d._selected
            });
            if (that._$attrs.customNode) {
                that.customNode({$selection: that.circle, $event: 'select'});
            } else {
                that.circle.style('fill', d => d.data.selected ? that.colors(d.data.series) : '#FFF');
            }
        }
    }

    drawTitles() {
        if (this.layout.title) {
            this.treeFixedContainer.append('text')
                .attr('x', (this.treeWidth / 2))
                .attr('y', -10)
                .attr('text-anchor', 'middle')
                .style('font-size', '20px')
                .text(this.layout.title);
        }

        if (this.layout.axis.title) {
            this.treeFixedContainer.append('text')
                .attr('class', 'axis-title')
                .style('text-anchor', 'middle')
                .text(this.layout.axis.title)
                .attr('transform', `translate(${this.treeWidth / 2}, ${this.treeHeight + 30})`);
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

            that.circle.on('click', toggle ? that.onNodeClick : (that._$attrs.nodeClick ? nodeClickCallback : null));
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
            getNodeLabelBBox(d);
        });

        context.font = `${this.layout.linkLabel['font-size']}px ${this.layout.linkLabel['font-family']}`;

        this.linkLabel.each(d => {
            d.width = context.measureText(d.nodeTo.data.inLinkLabel).width;
            d.height = linkLabelHeight;
            getLinkLabelBBox(d);
        });

        let nodeTypes = this.descendants.map(d => d.data.type),
            uniqueNodeTypes = new Set(nodeTypes),
            markerBBoxes = {};

        for (let type of uniqueNodeTypes) {
            let node = this.circle.filter(d => d.data.type == type).node(),
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

        let brushDescendants = this.prepareNodes(this.lastData, this.treeWidth, this.treeHeight),
            brushHeight = this.layout.brush.height,
            fullExtent = [[0, 0], [this.treeWidth, brushHeight]],
            brushMarginTop = this.layout.brush.margin.top,
            lockY = this.layout.brush.lockY,
            that = this;

        this.xScaleBrush = this.xScale.copy();
        this.yScaleBrush = this.yScale.copy().range([0, brushHeight]);

        for (let node of brushDescendants) {
            node.x = this.xScaleBrush(this.isTimePlot ? node._x.getTime() : node._x);
            node.y = this.yScaleBrush(node._y);
        }

        let clipRectId = `lineage-clip-rect${d3.selectAll('clipPath').size()}`;
        this.defs.append('svg:clipPath')
            .attr('class', 'brush-clip')
            .attr('id', clipRectId)
            .append('svg:rect')
            .attr('x', -1)
            .attr('y', -1)
            .attr('width', this.treeWidth + 3)
            .attr('height', brushHeight + 3)
            .attrs(this.layout.brush.boxRectangle);

        this.brushFixedContainer = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.treeHeight + brushMarginTop})`);

        if (this.layout.brush.axis.show) {

            let brushAxis = d3.axisBottom()
                .scale(this.xScaleBrush)
                .tickSizeInner(-brushHeight)
                .tickSizeOuter(0);

            if (!this.isTimePlot) {
                brushAxis.tickFormat(d3.format('d'))
                    .tickValues(d3.range(this.generationExtent[0], this.generationExtent[1] + 1));
            }

            let brushAxisSvg = this.brushFixedContainer.append('g')
                .attr('transform', `translate(0, ${brushHeight})`)
                .attr('class', 'axis x-axis')
                .call(brushAxis);

            brushAxisSvg.select('path.domain').style('display', 'none');
            LineagePlotController.adjustAxisStyles(brushAxisSvg);
        }

        this.brushContainer = this.brushFixedContainer.append('g')
            .attr('clip-path', `url(${this._$window.location.pathname}#${clipRectId})`);

        if (this.layout.brush.drawTrees) {
            this.brushContainer.append('g')
                .attr('class', 'link-layer')
                .selectAll('path.link')
                .data(brushDescendants.filter(n => n.parent.data.name != 'virtualRoot'))
                .enter()
                .insert('path', 'g')
                .attr('class', 'link')
                .attr('d', LineagePlotController.linkGenerator)
                .attrs(this.layout.link);

            let brushCircle = this.brushContainer.append('g')
                .attr('class', 'node-circle-layer')
                .selectAll('circle.node-circle')
                .data(brushDescendants)
                .enter();

            if (that._$attrs.customNode) {
                this.customNode({$selection: brushCircle, $event: 'draw'});
            } else {
                brushCircle.append('circle')
                    .attr('class', 'node-circle')
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
            .attr('width', this.treeWidth + 2)
            .attr('height', brushHeight + 2)
            .attrs(this.layout.brush.boxRectangle);

        this.brush = (lockY ? d3.brushX : d3.brush)()
            .extent(fullExtent)
            .on('brush end', brushed);

        this.brushContainer
            .call(this.brush)
            .call(this.brush.move, null);

        function isFullView(s) {
            return lockY ? almostEq(s[0], 0) && almostEq(s[1], that.treeWidth) :
                (almostEq(s[0][0], 0) && almostEq(s[0][1], 0) && almostEq(s[1][0], that.treeWidth) &&
                almostEq(s[1][1], brushHeight));
        }

        function brushed() {
            let event = d3.getEvent(),
                s = event.selection;

            if ((!s && that.layout.brush.brushRectangleOnFullView)) {
                that.brushContainer
                    .call(that.brush.move, lockY ? [0, that.treeWidth] : fullExtent);
                return;
            } else if (!that.layout.brush.brushRectangleOnFullView && s && isFullView(s)) {
                that.brushContainer
                    .call(that.brush.move, null);
            }

            let sx = s != null ? (lockY ? [s[0], s[1]] : [s[0][0], s[1][0]]) : that.xScaleBrush.range(),
                sy = s != null ? (lockY ? [0, brushHeight] : [s[0][1], s[1][1]]) : that.yScaleBrush.range(),
                dx1 = sx.map(that.xScaleBrush.invert, that.xScaleBrush), dx2 = that._xScale.domain(),
                dy1 = sy.map(that.yScaleBrush.invert, that.yScaleBrush), dy2 = that._yScale.domain(),
                kx = (dx2[1] - dx2[0]) / (dx1[1] - dx1[0]),
                ky = (dy2[1] - dy2[0]) / (dy1[1] - dy1[0]),
                newTransform = d3.xyzoomIdentity
                    .scale(kx, ky)
                    .translate(-sx[0], -that._yScale(that.yScaleBrush.invert(sy[0])));

            if (isFinite(kx) && isFinite(ky)) {
                that.treeFixedContainer.call(that.zoom.transform, newTransform);
            }
        }
    }

    zoomToMinimumWidth() {
        let ratio;
        if (!this.isTimePlot) {
            let generationWidth = this.xScale.range()[1] / getDomainLength(this.xScale);
            ratio = this.layout.minGenerationWidth / generationWidth;
        } else {
            let pixelsPerSecond = this.xScale.range()[1] / getDomainLength(this.xScale) * 1000;
            ratio = this.layout.minTimeWidth.rangeInPixels / this.layout.minTimeWidth.intervalInSeconds /
                pixelsPerSecond;
        }

        if (ratio > 1) {
            this.treeFixedContainer.call(this.zoom.transform, d3.xyzoomIdentity.scale(ratio, 1).translate(0, 0));
        }
    }
}

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        //noinspection JSCheckFunctionSignatures
        this.parentNode.appendChild(this);
    });
};

let layoutTemplate = {
    title: null,
    width: null,
    height: 600,
    backgroundColor: 'none',
    textColor: null,
    margin: {
        right: 10,
        left: 10,
        top: 10,
        bottom: 10
    },
    axis: {
        title: null,
        show: true,
        gridOnly: false,
        valueProperty: 'default'
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
    labelCollisionDetection: {
        enabled: 'never',
        updateDelay: 500,
        order: {
            linkLabel: 1,
            nodeLabel: 1
        }
    },
    link: {
        fill: 'none',
        stroke: '#ccc',
        'stroke-width': 1
    },
    minGenerationWidth: 0,
    minTimeWidth: {
        intervalInSeconds: 3600 * 24 * 30, // month
        rangeInPixels: 0
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
    maxZoom: 10,
    heatmap: {
        enabled: false,
        title: null,
        colorScale: [
            [0, '#008ae5'],
            [1, 'yellow']
        ],
        colorBar: {
            show: true,
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
        axis: {
            show: false,
            gridOnly: false,
            valueProperty: 'default'
        },
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
    controlsEnabledOnStart: ['label']
};


const LineagePlotComponent = {
    template: '',
    controller: LineagePlotController,
    bindings: {
        value: '<',
        nodesSelection: '&',
        nodeClick: '&',
        customNode: '&'
    }
};

LineagePlotController.$$ngIsClass = true; // temporary Firefox fix
export default angular.module('ancestry.lineage', [])
    .component('lineagePlot', LineagePlotComponent);