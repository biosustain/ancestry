import './box-plot.css!'
import '../utils.js'
import angular from 'angular'
import d3 from 'd3'
import { d3tooltip } from '../shared-features.js'

function BoxPlotDirective($window, WindowResize) {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            selected: '='
        },
        link(scope, element, attributes) {

            element.addClass("plotify plotify-box-plot");

            let svg = d3.select(element[0])
                .append("svg")
                .style('width', '100%');

            let margin = {top: 40, right: 40, bottom: 120, left: 80}

            let width,
                height;

            let boxGroupMinWidth = 8,
                boxGroupMaxWidth = 100,
                boxGroupSpacing = 10,
                boxGroupWidth,
                chartWidth,
                selectionMargin = 30,
                transitionDuration = 200;

            let chart,
                boxPlot,
                tooltip = new d3tooltip(d3.select(element[0]));

            let boxGroupArea,
                selectedBoxes = {},
                updated = true,
                colours = null,
                hoverBoxIndex = -1,
                currentScrollOffset = 0;

            // based on Mike Bostock's code for box plots
            d3.box = function() {
                let width = 1,
                    height = 1,
                    domain = null,
                    value = Number,
                    whiskers = boxWhiskers,
                    quartiles = boxQuartiles,
                    tickFormat = null,
                    maxWhiskerWidth = 30;

                // For each small multiple…
                function box(g) {
                    g.each(function(d, i) {

                        let name = d.name,
                            colour = colours(d.seriesName);
                        d = d.data.map(value).sort(d3.ascending);
                        let g = d3.select(this),
                            n = d.length,
                            min = d[0],
                            max = d[n - 1];

                        // Compute quartiles. Must return exactly 3 elements.
                        let quartileData = d.quartiles = quartiles(d);

                        // Compute whiskers. Must return exactly 2 elements, or null.
                        let whiskerIndices = whiskers && whiskers.call(this, d, i),
                            whiskerData = whiskerIndices && whiskerIndices.map(function(i) { return d[i]; });

                        // Compute outliers. If no whiskers are specified, all data are "outliers".
                        // We compute the outliers as indices, so that we can join across transitions!
                        let outlierIndices = whiskerIndices
                            ? d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n))
                            : d3.range(n);

                        // Compute the new x-scale.
                        let x1 = d3.scale.linear()
                            .domain(domain && domain.call(this, d, i) || [min, max])
                            .range([height, 0]);

                        // Note: the box, median, and box tick elements are fixed in number,
                        // so we only have to handle enter and update. In contrast, the outliers
                        // and other elements are variable, so we need to exit them! Variable
                        // elements also fade in and out.

                        // Update center line: the vertical line spanning the whiskers.
                        let center = g.selectAll("line.center")
                            .data(whiskerData ? [whiskerData] : []);

                        center.enter().insert("line", "rect")
                            .attr("class", "center");

                        center.attr("x1", width / 2)
                            .attr("x2", width / 2)
                            .attr("y1", function(d) { return x1(d[0]); })
                            .attr("y2", function(d) { return x1(d[1]); });

                        // Update innerquartile box.
                        let box = g.selectAll("rect.box")
                            .data([quartileData]);

                        box.enter().append("rect")
                            .attr("class", "box");

                        box.attr("x", 0)
                            .attr("y", function(d) { return x1(d[2]); })
                            .attr("width", width)
                            .attr("height", function(d) { return x1(d[0]) - x1(d[2]); });

                        // Update median line.
                        let medianLine = g.selectAll("line.median")
                            .data([quartileData[1]]);

                        medianLine.enter().append("line")
                            .attr("class", "median");

                        medianLine.attr("x1", 0)
                            .attr("x2", width)
                            .attr("y1", x1)
                            .attr("y2", x1);

                        // Update whiskers.
                        let whisker = g.selectAll("line.whisker")
                            .data(whiskerData || []);

                        whisker.enter().insert("line", "circle, text")
                            .attr("class", "whisker");

                        let whiskerWidth = width.clamp(0, maxWhiskerWidth);

                        whisker.attr("x1", (width - whiskerWidth) / 2)
                            .attr("x2", (width + whiskerWidth) / 2)
                            .attr("y1", x1)
                            .attr("y2", x1);

                        // Update outliers.
                        let outlier = g.selectAll("circle.outlier")
                            .data(outlierIndices, Number);

                        outlier.enter().insert("circle", "text")
                            .attr("class", "outlier");

                        outlier.attr("r", 3)
                            .attr("cx", width / 2)
                            .attr("cy", function(i) { return x1(d[i]); })
                            .style("opacity", 1);


                        // Compute the tick format.
                        let format = tickFormat || x1.tickFormat(100);

                        // Update box ticks.
                        let boxTick = g.selectAll("text.box").data(quartileData);

                        if (selectedBoxes[name]) {
                            boxTick.enter().append("text")
                                .attr("class", "box");

                            boxTick.attr("dy", ".3em")
                                .attr("dx", function(d, i) { return i & 1 ? 6 : -6 })
                                .attr("x", function(d, i) { return i & 1 ? width : 0 })
                                .attr("y", x1)
                                .attr("text-anchor", function(d, i) { return i & 1 ? "start" : "end"; })
                                .text(format);
                        }
                        else {
                            boxTick.remove();
                        }

                        // Update whisker ticks. These are handled separately from the box
                        // ticks because they may or may not exist, and we want don't want
                        // to join box ticks pre-transition with whisker ticks post-.
                        let whiskerTick = g.selectAll("text.whisker").data(whiskerData || []);

                        if (selectedBoxes[name]) {
                            whiskerTick.enter().append("text")
                                .attr("class", "whisker");

                            whiskerTick.attr("dy", ".3em")
                                .attr("dx", 6)
                                .attr("x", (width + whiskerWidth) / 2)
                                .attr("y", (d, i) => i ? x1(d) - 3 : x1(d) + 3)
                                .text(format);
                        }
                        else {
                            whiskerTick.remove();
                        }

                        let label = g.selectAll("text.box-name").data([name]);

                        label.enter()
                            .append("text")
                            .attr("class", "box-name");

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

                        clickRect.attr('x', () => selectedBoxes[name] ? -selectionMargin : 0)
                                .attr('y', 0)
                                .attr('width', () => selectedBoxes[name] ? width + 2 * selectionMargin : width)
                                .attr('height', height);


                        if (selectedBoxes[name]) {
                            selectBox();
                        }

                        clickRect.on("mouseover", () => {
                            hoverBoxIndex = i;
                            if (!selectedBoxes[name])
                                g.call(applyColour);
                                let text = `<div class="tooltip-colour-box" style=\"background-color: ${colour}\"></div>` +
                                        `<span class="tooltip-text">${name}</span>`;
                            tooltip.html(text).show().position(getTooltipPosition(this));
                        })
                        .on("mouseout", (d) => {
                            if (!selectedBoxes[name])
                                g.call(unapplyColour);
                            tooltip.hide();
                        })
                        .on("click", click);

                        function getTooltipPosition(boxElement) {
                            let groupPos = boxElement.getBoundingClientRect();
                            return [(groupPos.right + groupPos.left) / 2, groupPos.top]
                        }

                        function click(d) {
                            if (d3.event.defaultPrevented) return;
                            if (selectedBoxes[name]) {
                                selectedBoxes[name] = false;
                                deselectBox();
                            }
                            else {
                                selectedBoxes[name] = true;
                                selectBox();
                            }
                            update(boxGroupArea, true);
                            //let tooltipPos = tooltip.position();
                            //tooltipPos[0] += selectedBoxes[name] ? selectionMargin : -selectionMargin;
                        }

                        function selectBox() {
                            g.call(applyColour);
                        }

                        function deselectBox() {
                            g.call(unapplyColour);
                        }

                    });
                    d3.timer.flush();
                }

                box.width = function(x) {
                    if (!arguments.length) return width;
                    width = x;
                    return box;
                };

                box.height = function(x) {
                    if (!arguments.length) return height;
                    height = x;
                    return box;
                };

                box.tickFormat = function(x) {
                    if (!arguments.length) return tickFormat;
                    tickFormat = x;
                    return box;
                };

                box.domain = function(x) {
                    if (!arguments.length) return domain;
                    domain = x == null ? x : d3.functor(x);
                    return box;
                };

                box.value = function(x) {
                    if (!arguments.length) return value;
                    value = x;
                    return box;
                };

                box.whiskers = function(x) {
                    if (!arguments.length) return whiskers;
                    whiskers = x;
                    return box;
                };

                box.quartiles = function(x) {
                    if (!arguments.length) return quartiles;
                    quartiles = x;
                    return box;
                };

                return box;
            };

            function update(target, transitions, newData) {
                let selectedCount = 0;

                let boxContainers = target.selectAll("g.box-container");

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
                    marginRatio = 0.05;

                let selectedNum = 0;

                for(let b of data) {
                    selectedNum += selectedBoxes[b.name] ? 1 : 0;
                }

                // calculate optimal width of a box plot
                boxGroupWidth = ((width - (boxGroupSpacing * (data.length - 1)) - (selectedNum * selectionMargin * 2)) / data.length)
                    .clamp(boxGroupMinWidth, boxGroupMaxWidth);

                // calculate the total width of the whole chart
                chartWidth = data.length * (boxGroupWidth + boxGroupSpacing) +
                    selectedNum * selectionMargin * 2 - boxGroupSpacing;

                // define function for plotting box plots
                boxPlot = d3.box()
                    .whiskers(iqr(1.5))
                    .width(boxGroupWidth)
                    .height(height)
                    .domain([(1 - marginRatio) * min, max]);


                // calculate offset for the left margin to align the plot to the center
                let leftMargin = ((width + margin.right + margin.left) / 2 - chartWidth / 2).clamp(margin.left, Infinity);

                if (leftMargin !== margin.left) currentScrollOffset = 0;

                let yScale = d3.scale.linear()
                    .domain([0.95 * min, max])
                    .range([height, 0]);

                let yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .innerTickSize(-width);

                chart.attr("transform", `translate(${0}, ${margin.top})`);

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
                boxContainers = boxContainers.data(data, d => d.name);

                // add new containers for new data
                boxContainers.enter()
                    .append("g")
                    .attr("class", "box-container");

                boxContainers.call(boxPlot);

                // remove unbound containers
                let boxExit = boxContainers.exit();
                boxExit.each((d) => selectedBoxes[d.name] = false);
                boxExit.remove();

                let tooltipPos = -100;
                // update translation
                boxContainers.each(function(d, i)  {
                    let isSelected = selectedBoxes[d.name],
                        selectedOffset = isSelected ? selectionMargin : 0;

                    d.x = leftMargin + d.i * (boxGroupWidth + boxGroupSpacing) + selectedOffset +
                        (isSelected ? selectedCount++ : selectedCount) * 2 * selectionMargin;

                    if(i===hoverBoxIndex)
                        tooltipPos = [d.x + boxGroupWidth / 2 + currentScrollOffset, this.getBoundingClientRect().top];
                });

                //tooltip.position(tooltipPos);console.log(tooltipPos);
                tooltip.move(tooltipPos, transitionDuration);

                if (width >= Math.floor(chartWidth)) {
                    updated = true;
                    d3.select("g.scrollable-box-container")
                        .attr("transform", `translate(0,0)`);
                }

                if (transitions)
                    boxContainers = boxContainers.transition().duration(transitionDuration);

                boxContainers.attr("transform", d => `translate(${d.x}, 0)`);

            }

            function applyColour(g) {
                g.each(function(d, i) {
                    let n = d3.select(this),
                        elems = n.selectAll("line, rect, circle"),
                        circle = n.selectAll("circle"),
                        colour = colours(d.seriesName);

                    elems.style("stroke", colour);
                    elems.style("stroke-width", "2px");
                });
            }

            function unapplyColour(g) {
                g.each(function(d, i) {
                    let n = d3.select(this),
                        elems = n.selectAll("line, rect, circle"),
                        circle = n.selectAll("circle");

                    elems.style("stroke", "#000");
                    circle.style("stroke", "#ccc");
                    elems.style("stroke-width", "1px");
                });
            }

            function render(options) {

                // clean svg before rendering plot
                svg.selectAll('*').remove();

                let elementWidth = d3.select(element[0]).node().offsetWidth;

                height = 400 - margin.top - margin.bottom;
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


                // define a clip path to clip the box plots outside the scroll area
                let clip = svg.append("defs").append("svg:clipPath")
                    .attr("id", "clip-box-plot")
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
                    .attr("id", "scroll-clip-box")
                    .attr("clip-path", "url(#clip-box-plot)");

                boxGroupArea = clipBox.append("g").attr("class", "scrollable-box-container");

                update(boxGroupArea, options.transitions);
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
                currentScrollOffset = d.x;

                d3.select("g.scrollable-box-container")
                    .attr("transform", `translate(${d.x},${d.y})`);
            }

            // Handle window resize event.
            scope.$on('window-resize', (event) => {
                render({transitions: false});
            });

            scope.$watch("value", () => {
                selectedBoxes = {};
                render({transitions: true});
            });

            scope.$watch("selected", (selected) => {
                update(boxGroupArea, true, true);
            });
        }
    }
}

function boxWhiskers(d) {
    return [0, d.length - 1];
}

function boxQuartiles(d) {
    return [
        d3.quantile(d, .25),
        d3.quantile(d, .5),
        d3.quantile(d, .75)
    ];
}

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

// Returns a function to compute the interquartile range.
function iqr(k) {
    return function(d, di) {
        let q1 = d.quartiles[0],
            q3 = d.quartiles[2],
            iqr = (q3 - q1) * k,
            i = -1,
            j = d.length;
        while (d[++i] < q1 - iqr);
        while (d[--j] > q3 + iqr);
        return [i, j];
    };
}

function scroll(dragHandler, dragStopHandler) {
    let drag = d3.behavior.drag();
    drag.on("drag", dragHandler)
        .on("dragend", dragStopHandler);
    return drag;
}


export default angular.module('plotify.box', ['plotify.utils'])
    .directive('boxPlot', BoxPlotDirective);