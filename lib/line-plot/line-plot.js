import './line-plot.css!'
import '../common.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import {d3legend, d3tooltip} from '../shared-features.js'

function LinePlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '='
        },
        link(scope, element, attributes) {

            element.addClass("plotify plotify-line-plot");

            let height = 0,
                width = 0,
                margin = {top: 75, right: 70, bottom: 120, left: 70},
                defaultTimeFormat = "%d %b %y",
                defaultScalarFormat = null,
                xScale = null,
                _xScale = null,
                yScale = null,
                _yScale = null,
                xAxis = null,
                yAxis = null,
                defs,
                tooltip,
                colours = null,
                voronoi = null,
                voronoiGroup = null,
                hoverFocusCircle,
                chart = null,
                chartClipArea = null,
                line = null,
                visibleSeries = new Set(),
                transitionDuration = 300;

            let svg = d3.select(element[0])
                .append("svg")
                .style('width', '100%');

            let marginRatio = {x: 0.1, y: 0.1},
                settings = {
                    "title": "chart title",
                    "xAxis": {
                        "title": "time",
                        "units": "h"
                    },
                    "yAxis": {
                        "title": "yAxis",
                        "units": "yUnits"
                    }
                };

            tooltip = new d3tooltip(d3.select(element[0]));

            function update(data) {

                data = data.filter(d => visibleSeries.has(d.name));

                let [xExtent, yExtent] = calculateExtents(data),
                    voronoiData = [];

                _yScale = yScale.copy();
                _xScale = xScale.copy();

                let lineOld = d3.svg.line()
                    .interpolate("basis")
                    .x(d => _xScale(d[0]))
                    .y(d => _yScale(d[1]));

                if (data.length) {
                    xScale.domain(xExtent);
                    yScale.domain(yExtent);
                    let t = chart.transition().duration(transitionDuration);

                    t.select("g.x-axis").call(xAxis);
                    t.select("g.y-axis").call(yAxis);

                }

                defs.select("g.voronoi-clips").selectAll("clipPath.voronoi-clip").remove();
                voronoiGroup.selectAll("path").remove();

                let series = chartClipArea.selectAll("g.series")
                    .data(data, d => d.name);

                let newSeries = [];

                series.enter()
                    .append("g")
                    .attr("class", "series")
                    .each(d => newSeries.push(d.name));

                series.exit().each(function(d, i) {
                    let sel = d3.select(this);
                    if (d.drawLine) {
                        sel.select("path.series-line")
                            .style("stroke", d => colours(d.name))
                            .transition().duration(transitionDuration)
                            .attr("d", d => line(d.values))
                            .style("opacity", 0)
                            .remove();
                    }
                    if (d.drawDot) {
                        sel.selectAll("circle.series-dot")
                            .transition().duration(transitionDuration)
                            .attr("cx", d => xScale(d[0]))
                            .attr("cy", d => yScale(d[1]))
                            .style("opacity", 0)
                            .remove();
                    }
                    sel.transition().delay(transitionDuration).remove();

                });

                series.each(function(d, i) {
                    let sel = d3.select(this),
                        self = this,
                        isNew = newSeries.indexOf(d.name) !== -1;

                    let seriesLine = sel.selectAll("path.series-line").data([d], d => d.name);

                    seriesLine.enter()
                        .append("path")
                        .attr("class", "series-line");

                    seriesLine.attr("d", d => lineOld(d.values))
                        .style("stroke", d => colours(d.name))
                        .style("opacity", !d.drawLine || isNew ? 0 : 1)
                        .transition().duration(transitionDuration)
                        .attr("d", d => line(d.values))
                        .style("opacity", d.drawLine ? 1 : 0);

                    let seriesDot = sel.selectAll("circle.series-dot")
                        .data(d => d.values);

                    seriesDot.enter()
                        .append("circle")
                        .attr("class", "series-dot");

                    seriesDot.attr("r", 4)
                        .attr("cx", d => _xScale(d[0]))
                        .attr("cy", d => _yScale(d[1]))
                        .attr("fill", colours(d.name))
                        .style("opacity", !d.drawDot || isNew ? 0 : 1)
                        .style("stroke", "white")
                        .transition().duration(transitionDuration)
                        .attr("cx", d => xScale(d[0]))
                        .attr("cy", d => yScale(d[1]))
                        .style("opacity", d.drawDot ? 1 : 0);

                    seriesDot.each(function(d, i) {
                        d.circle = this;
                        d.series = self;
                        d[0] += Math.random() * 10E-4;
                        d[1] += Math.random() * 10E-4;
                        voronoiData.push(d);
                    });
                });

                // define the clipPath
                defs.select("g.voronoi-clips").selectAll("clipPath")
                    .data(voronoiData).enter()
                    .append("clipPath")
                    .attr("id", (d, i) => `lp-voronoi-clip-id${i}`)
                    .attr("class", "voronoi-clip")
                    .append("circle")
                    .attr("cx", d => xScale(d[0]))
                    .attr("cy", d => yScale(d[1]))
                    .attr("r", 25);

                voronoiGroup.selectAll("path")
                    .data(voronoi(voronoiData))
                    .enter().append("path")
                    .attr("d", d => { return "M" + d.join("L") + "Z"})
                    .attr("clip-path", (d, i) => `url(#lp-voronoi-clip-id${i})`)
                    .datum(d => d.point)
                    .on("mouseover", voronoiMouseover)
                    .on("mouseout", voronoiMouseout);

                function voronoiMouseover(d) {
                    hoverFocusCircle.attr("fill", colours(d.series.__data__.name))
                        .attr("r", 5)
                        .attr("transform", `translate(${xScale(d[0])},${yScale(d[1])})`);

                    let groupPos = d.circle.getBoundingClientRect(),
                        xPos = groupPos.left + groupPos.width / 2,
                        yPos = groupPos.top,
                        text = `<div class="tooltip-colour-box" style=\"background-color: ${colours(d.series.__data__.name)}\"></div>` +
                            `<span class="tooltip-text">${d.series.__data__.name}</span>` +
                            `<span>x: ${d[0].toFixed(1)}</span>` +
                            `<span>y: ${d[1].toFixed(1)}</span>`;

                    tooltip.position([xPos, yPos])
                        .html(text)
                        .show();
                }
                function voronoiMouseout(d) {
                    hoverFocusCircle.attr("transform", "translate(-200, -200)");
                    tooltip.hide();
                }
            }

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                // don't continue rendering if there is no data
                if (!scope.value || !scope.value.series.length) return;

                let data = scope.value.series,
                    seriesNames = data.map(d => d.name);

                for(let name of seriesNames) {
                    visibleSeries.add(name);
                }

                data = data.map(d => {
                    d.drawLine = !options.drawLines || options.drawLines.indexOf(d.name) !== -1;
                    d.drawDot = !options.drawDots || !d.drawLine || options.drawDots.indexOf(d.name) !== -1;
                    return d;
                });

                let elementWidth = d3.select(element[0]).node().offsetWidth;

                width = elementWidth - margin.left - margin.right;
                height = 600 - margin.top - margin.bottom;

                colours = d3.scale.category10().domain(data.map(d => d.name));

                // define x and y axes formats
                let xAxisFormat = d3.time.format(defaultTimeFormat),
                    yAxisFormat = d3.format(defaultScalarFormat),
                    xAxisLabel = settings.xAxis.title,
                    yAxisLabel = settings.yAxis.title,
                    xAxisUnits = settings.xAxis.units,
                    yAxisUnits = settings.yAxis.units,
                    chartTitle = settings.title,
                    titleSize = 20;

                let [xExtent, yExtent] = calculateExtents(data);

                // define x scale
                xScale = d3.scale.linear()
                    .domain(xExtent)
                    .range([0, width]);

                // define y scale
                yScale = d3.scale.linear()
                    .domain(yExtent)
                    .range([height, 0]);

                // define x axis
                xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .innerTickSize(-height)
                    .tickPadding(5);
                    //.tickFormat(xAxisFormat);

                // define y axis
                yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .innerTickSize(-width);
                    //.tickFormat(yAxisFormat);

                line = d3.svg.line()
                    .interpolate("basis")
                    .x(d => xScale(d[0]))
                    .y(d=> yScale(d[1]));

                voronoi = d3.geom.voronoi()
                    .x(d => xScale(d[0]) + (Math.random() * 0.001))
                    .y(d => yScale(d[1]) + (Math.random() * 0.001))
                    .clipExtent([[xScale.range()[0], yScale.range()[1]], [xScale.range()[1], yScale.range()[0]]]);

                // render chart area
                chart = svg
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);


                defs = svg.append("defs");

                let clip = defs.append("svg:clipPath")
                    .attr("id", "clip-line-plot")
                    .append("svg:rect")
                    .attr("id", "clip-rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height);

                defs.append("g").attr("class", "voronoi-clips");

                chartClipArea = chart.append("g")
                    .attr("id", "chart-clip-box")
                    .attr("clip-path", "url(#clip-line-plot)");

                hoverFocusCircle = chart.append("circle")
                    .attr("id", "hover-focus-circle")
                    .attr("transform", "translate(-200, -200)");

                voronoiGroup = chart.append("g")
                    .attr("class", "voronoi");

                // render x axis
                chart.append("g")
                    .attr("class", "axis x-axis")
                    .attr("transform", `translate(0, ${height})`)
                    .call(xAxis);

                // render y axis
                chart.append("g")
                    .attr("class", "axis y-axis")
                    .call(yAxis);

                // render chart title
                if (chartTitle) {
                    chart.append("text")
                        .attr("x", (width / 2))
                        .attr("y", -margin.top + titleSize + 10)
                        .attr("text-anchor", "middle")
                        .style("font-size", `${titleSize}px`)
                        .text(chartTitle);
                }

                // render x axis label if exists
                if (xAxisLabel) {
                    let tickHeight = chart.selectAll("g.x-axis g.tick text")[0][0].getBBox().height;
                    xAxisLabel += xAxisUnits ? `, ${xAxisUnits}` : "";
                    chart.append("text")             // text label for the x axis
                        .style("text-anchor", "middle")
                        .text(xAxisLabel)
                        .attr("transform", `translate(${width/2}, ${height + tickHeight + 30})`);
                }

                // render y axis label if exists
                if (yAxisLabel) {
                    yAxisLabel += yAxisUnits ? `, ${yAxisUnits}` : "";
                    chart.append("text")            // text label for the y axis
                        .attr("transform", "rotate(-90)")
                        .attr("y", -margin.left + 10)
                        .attr("x",-(height / 2))
                        .attr("dy", "1em")
                        .style("text-anchor", "middle")
                        .text(yAxisLabel);
                }

                update(data);

                //let drawLegend = d3legend()
                //    .splitAfter(0)
                //    .seriesNames(seriesNames)
                //    .colourScale(colours)
                //    .anchorHorizontal("right")
                //    .anchorVertical("bottom")
                //    .maxSize({width, height})
                //    .onMouseOver(legendMouseOver)
                //    .onMouseOut(legendMouseOut)
                //    .onClick(legendClick)
                //    .selectedItems(visibleSeries);
                //
                //
                //let legend = chart.append("g")
                //    .attr("class", "plotify-legend")
                //    .attr("transform", `translate(${width},${0})`)
                //    .call(drawLegend);

                function legendMouseOver(label) {
                    let focusItem = d3.select(this);
                    legend.selectAll("g.legend-item").classed("legend-item-unfocused", true);
                    focusItem.classed("legend-item-unfocused", false);

                    chart.selectAll("g.series")
                        .classed("series-unfocused-path", d => d.drawLine ? true : false)
                        .classed("series-unfocused-dots", d => d.drawDot ? true : false)
                        .filter(d => d.name === label)
                        .classed("series-unfocused-dots series-unfocused-path", false)
                        .classed("series-focused", true);

                }

                function legendMouseOut(label) {
                    legend.selectAll("g.legend-item").classed("legend-item-unfocused", false);
                    chart.selectAll("g.series")
                        .classed("series-unfocused-dots series-unfocused-path", false)
                        .classed("series-focused", false);
                }

                function legendClick(label) {
                    let clicked = d3.select(this);
                    if (visibleSeries.has(label))
                        visibleSeries.delete(label);
                    else
                        visibleSeries.add(label);
                    clicked.classed("legend-item-selected", visibleSeries.has(label));
                    clicked.select("rect.shape").attr("fill", visibleSeries.has(label) ? colours(label) : "white");
                    update(data);
                }

            }

            function calculateExtents(data) {
                let xExtents = [],
                    yExtents = [];

                data.forEach(series => {
                    let xValues = series.values.map(d => d[0]);
                    let yValues = series.values.map(d => d[1]);
                    xExtents = xExtents.concat(d3.extent(xValues));
                    yExtents = yExtents.concat(d3.extent(yValues));
                });

                let xExtent = d3.extent(xExtents),
                    yExtent = d3.extent(yExtents);

                // find extent of input data and calculate margins
                let xMargin = marginRatio.x * (xExtent[1] - xExtent[0]) / 2,
                    yMargin = marginRatio.y * (yExtent[1] - yExtent[0]) / 2;

                // add margins to horizontal axis data
                xExtent[0] -= xMargin;
                xExtent[1] += xMargin;

                // add margins to vertical axis data
                yExtent[0] -= yMargin;
                yExtent[1] += yMargin;

                return [xExtent, yExtent]
            }

            // Handle window resize event.
            scope.$on('window-resize', (event) => {
                render({drawLines: ["series 2", "series 3"]});
            });

            scope.$watch("value", () => {
                render({drawLines: ["series 1", "series 3", "series 4", "series 5"], drawDots: ["series 1", "series 5", "series 5"]});
            });
        }
    }
}

export default angular.module('plotify.line', ['plotify.utils'])
    .directive('linePlot', LinePlotDirective);
