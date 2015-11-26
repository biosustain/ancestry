import './violin-plot.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import { d3tooltip } from '../shared-features.js'

function ViolinPlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            selected: '='
        },
        link(scope, element, attributes) {
            element.addClass("plotify plotify-violin-plot");

            let svg = d3.select(element[0])
                .append("svg")
                .style('width', '100%');

            let margin = {top: 40, right: 40, bottom: 120, left: 80};

            let width,
                height;

            let violinGroupMinWidth = 12,
                violinGroupMaxWidth = 100,
                violinGroupSpacing = 10,
                violinGroupWidth,
                chartWidth,
                resolution = 8;

            let chart,
                violinPlot,
                tooltip = new d3tooltip(d3.select(element[0]));

            let violinGroupArea,
                updated = true,
                colours = null,
                dotScale = d3.scale.linear().domain([violinGroupMinWidth, violinGroupMaxWidth]).range([1.2, 2]);


            d3.violin = function() {
                let width = 1,
                    height = 1,
                    domain = null,
                    value = Number,
                    tickFormat = null,
                    dotRadius;

                // For each small multiple…
                function violin(g) {
                    g.each(function(d, i) {

                        let name = d.name,
                            colour = colours(d.seriesName);

                        d = d.data.map(value).sort(d3.ascending);

                        let g = d3.select(this),
                            n = d.length,
                            min = d[0],
                            max = d[n - 1];

                        dotRadius = width / 10;

                        let vDomain = domain && domain.call(this, d, i) || [min, max];

                        let yScale = d3.scale.linear()
                            .domain(vDomain)
                            .range([height, 0]);

                        let diff = vDomain[1] - vDomain[0];
                        let binHalfSize = (max - min) / (resolution + 2) / 2;
                        let hist = (d3.layout.histogram()
                            .bins(resolution + 2)
                            .range([vDomain[0] - 0.01 * diff, vDomain[1] + 0.01 * diff]) // .range([min - binSize - 1, max + binSize + 1])
                            .frequency(1))(d);

                        let histScale = d3.scale.linear()
                            .domain(d3.extent(hist, d => d.y))
                            .range([0, width/2]);

                        let area = d3.svg.area()
                            .interpolate("basis")
                            .x0( d => width / 2 - histScale(d.y))
                            .x1( d => width / 2 + histScale(d.y))
                            .y( d => yScale(d.x + binHalfSize));

                        let dist = g.selectAll("path.area").data([hist]);

                        dist.enter().append("path")
                            .attr("class", "area");

                        dist.attr("d", area);

                        let dotGroup = g.selectAll("g.dot-group").data(hist.slice(1, hist.length - 1));

                        dotGroup.enter()
                            .append("g")
                            .attr("class", "dot-group");

                        dotGroup.attr("transform", d => `translate(${(width - histScale(d.length)) / 2},0)`);

                        let dot = dotGroup.selectAll("circle.dot")
                            .data(d => d.map(el => {
                                return {y: el, x: Math.random() * histScale(d.length)}
                            }));

                        dot.enter().append("circle")
                            .attr("class", "dot");

                        dot.attr("r", dotScale(width))
                            .attr("cx", d => d.x)
                            .attr("cy", d => yScale(d.y))
                            .style("fill", colour);

                        let label = g.selectAll("text.violin-name").data([name]);

                        label.enter()
                            .append("text")
                            .attr("class", "violin-name");

                        label.attr("dy", "5px")
                            .attr("text-anchor", "end")
                            .attr("transform", `translate(${width/2},${height + 5}) rotate(-90)`)
                            .style("fill", colour)
                            .text(d => d);

                        label.each(function(d) {
                            let rect = this.getBoundingClientRect();
                            if(rect.height > margin.bottom) {
                                d3.select(this).text(d.slice(0, margin.bottom / rect.height * d.length - 3) + "...")
                            }
                        });

                        let clickRect = g.selectAll("rect.click-capture").data([1]);

                        clickRect.enter().append('rect')
                            .attr('class', 'click-capture')
                            .style('visibility', 'hidden');

                        clickRect.attr('x', 0)
                            .attr('y', 0)
                            .attr('width', width)
                            .attr('height', height);

                        clickRect.on("mouseover", () => {
                            let groupPos = this.getBoundingClientRect(),
                                xPos = (groupPos.right + groupPos.left) / 2,
                                yPos = groupPos.top,
                                text = `<div class="tooltip-colour-box" style=\"background-color: ${colour}\"></div>` +
                                    `<span class="tooltip-text">${name}</span>`;
                            tooltip.html(text).position([xPos, yPos]).show();
                        })
                        .on("mouseout", (d) => {
                            tooltip.hide();
                        });
                    });
                    d3.timer.flush();
                }

                violin.width = function(x) {
                    if (!arguments.length) return width;
                    width = x;
                    return violin;
                };

                violin.height = function(x) {
                    if (!arguments.length) return height;
                    height = x;
                    return violin;
                };

                violin.tickFormat = function(x) {
                    if (!arguments.length) return tickFormat;
                    tickFormat = x;
                    return violin;
                };

                violin.domain = function(x) {
                    if (!arguments.length) return domain;
                    domain = x == null ? x : d3.functor(x);
                    return violin;
                };

                violin.value = function(x) {
                    if (!arguments.length) return value;
                    value = x;
                    return violin;
                };

                return violin;
            };

            function update(target, transitions) {

                let violinContainers = target.selectAll("g.violin-container");

                let data = scope.value.data;

                if(scope.selected.length) {
                    data = data.filter((d) => {
                        return scope.selected.indexOf(d.name) !== -1;
                    });
                }

                let extents = [];
                // calculate extents of values of every node
                data.forEach(series => {extents = extents.concat(d3.extent(series.values))});
                let extent = d3.extent(extents),
                    min = extent[0],
                    max = extent[1],
                    diff = max - min,
                    scaleMargin = diff / resolution;

                // calculate optimal width of a violin plot
                violinGroupWidth = ((width - (violinGroupSpacing * (data.length - 1)))  / data.length)
                    .clamp(violinGroupMinWidth, violinGroupMaxWidth);

                // calculate the total width of the whole chart
                chartWidth = data.length * (violinGroupWidth + violinGroupSpacing) - violinGroupSpacing;

                // define function for plotting violin plots

                let domain = [min - scaleMargin, max + scaleMargin];

                violinPlot = d3.violin()
                    .width(violinGroupWidth)
                    .height(height)
                    .domain(domain);

                // calculate offset for the left margin to align the plot to the center
                let leftMargin = ((width + margin.right + margin.left) / 2 - chartWidth / 2).clamp(margin.left, Infinity);

                let yScale = d3.scale.linear()
                    .domain(domain)
                    .range([height, 0]);

                let yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .innerTickSize(-width);

                chart.attr("transform", `translate(0, ${margin.top})`);

                svg.select("g.axis")
                    .attr("transform", `translate(${margin.left - 10},0)`)
                    .call(yAxis);

                data = data.map((d, i) => {
                    return {
                        name: d.name,
                        data: d.values,
                        seriesName: d.seriesName,
                        i: i
                    }
                });

                // bind data
                violinContainers = violinContainers.data(data, d => d.name);

                // add new containers for new data
                violinContainers.enter()
                    .append("g")
                    .attr("class", "violin-container");

                violinContainers.call(violinPlot);

                // remove unbound containers
                let violinExit = violinContainers.exit();

                violinExit.remove();

                // update translation
                violinContainers.each((d, i) => {
                    d.x = leftMargin + d.i * (violinGroupWidth + violinGroupSpacing);
                });

                if (width >= Math.floor(chartWidth)) {
                    updated = true;
                    d3.select("g.scrollable-violin-container")
                        .attr("transform", `translate(0,0)`);
                }

                if (transitions)
                    violinContainers = violinContainers.transition().duration(200);

                violinContainers.attr("transform", d => `translate(${d.x}, 0)`);
            }

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                let elementWidth = d3.select(element[0]).node().offsetWidth;

                height = 500 - margin.top - margin.bottom;
                width =  elementWidth - margin.left - margin.right;

                // don't continue rendering if there is no data
                if (!scope.value)
                    console.warn("No data to render.");


                colours = d3.scale.category10().domain(scope.value.data.map(d => d.seriesName));

                // set up svg and bind scroll behaviour on drag
                svg.data([{ x: 0, y: 0 }])
                    .attr("width", "100%")
                    .attr("height", height + margin.top + margin.bottom)
                    .call(scroll(dragmove, dragEnd));


                // define a clip path to clip the violin plots outside the scroll area
                let clip = svg.append("defs").append("svg:clipPath")
                    .attr("id", "clip")
                    .append("svg:rect")
                    .attr("id", "clip-rect")
                    .attr("x", margin.left - 5)
                    .attr("y", "-20")
                    .attr("width", width + 10)
                    .attr("height", height * 2);

                chart = svg.append("g");

                chart.append("g")
                    .attr("class", "axis");

                let clipBox = chart.append("g")
                    .attr("id", "scroll-clip-violin")
                    .attr("clip-path", "url(#clip)");

                violinGroupArea = clipBox.append("g").attr("class", "scrollable-violin-container");

                update(violinGroupArea, options.transitions);
            }

            function dragEnd() {
                d3.event.sourceEvent.stopPropagation();
            }

            function dragmove(d) {
                if (updated) {
                    d.x = 0;
                    updated = false;
                }
                d.x = (d.x + d3.event.dx).clamp(width - chartWidth, 0);

                d3.select("g.scrollable-violin-container")
                    .attr("transform", `translate(${d.x},${d.y})`);
            }

            // Handle window resize event.
            scope.$on('window-resize', (event) => {
                render({transitions: false});
            });

            scope.$watch("value", () => {
                render({transitions: true});
            });

            scope.$watch("selected", (selected) => {
                update(violinGroupArea, true, true);
            });
        }
    }
}

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

function scroll(dragHandler, dragStopHandler) {
    let drag = d3.behavior.drag();
    drag.on("drag", dragHandler)
        .on("dragend", dragStopHandler);
    return drag;
}

export default angular.module('plotify.violin', ['plotify.utils'])
    .directive('violinPlot', ViolinPlotDirective);