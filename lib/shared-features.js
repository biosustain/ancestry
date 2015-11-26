
export function d3legend() {
    let width = 0,
        height = 0,
        splitAfter = 0,
        anchorVertical = "center",
        anchorHorizontal = "right",
        seriesNames = null,
        colourScale = null,
        onMouseOver= null,
        onMouseOut= null,
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
            textVerticalOffset = (rowHeight + box.height)/ 2 - 2,
            legendHorizontalOffset = 0,
            legendVerticalOffset = 0;

        switch(anchorHorizontal) {
            case "left": legendHorizontalOffset = 0; break;
            case "center": legendHorizontalOffset = -w / 2; break;
            case "right": legendHorizontalOffset = -w; break;
        }

        switch(anchorVertical) {
            case "top": legendVerticalOffset = 0; break;
            case "center": legendVerticalOffset = -h / 2; break;
            case "bottom": legendVerticalOffset = -h; break;
        }

        let item = g.selectAll("g.legend-item").data(seriesNames);

        item.enter()
            .append("g")
            .attr("class", "legend-item");

        item.attr("transform", (d, i) => `translate(${legendHorizontalOffset + padding + (i%splitAfter) * (columnWidth + horizontalItemSpacing)},
                                            ${legendVerticalOffset + padding + Math.floor(i/splitAfter) * (rowHeight + verticalItemSpacing)})`);

        item.each(function(d, i) {
            let sel = d3.select(this);

            sel.append("rect")
                .attr("class", "shape")
                .attr("x", 2)
                .attr("y", shapeVerticalOffset)
                .attr("width", shapeSize)
                .attr("height", shapeSize)
                .attr("fill", selectedItems[d] ? colourScale(d): "white")
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

    legend.width = function(x) {
        if (!arguments.length) return width;
        width = x;
        return legend;
    };

    legend.height = function(x) {
        if (!arguments.length) return height;
        height = x;
        return legend;
    };

    legend.splitAfter = function(x) {
        if (!arguments.length) return splitAfter;
        splitAfter = x;
        return legend;
    };

    legend.anchorVertical = function(x) {
        if (!arguments.length) return anchorVertical;
        if (x === "top" || x === "center" || x === "bottom")
            anchorVertical = x;
        return legend;
    };

    legend.anchorHorizontal = function(x) {
        if (!arguments.length) return anchorHorizontal;
        if (x !== "left" || x === "center" || x === "right")
            anchorHorizontal = x;
        return legend;
    };

    legend.seriesNames = function(x) {
        if (!arguments.length) return seriesNames;
        seriesNames = x;
        return legend;
    };

    legend.colourScale = function(x) {
        if (!arguments.length) return colourScale;
        colourScale = x;
        return legend;
    };

    legend.onMouseOver = function(x) {
        if (!arguments.length) return onMouseOver;
        onMouseOver = x;
        return legend;
    };

    legend.onMouseOut = function(x) {
        if (!arguments.length) return onMouseOut;
        onMouseOut = x;
        return legend;
    };

    legend.onClick = function(x) {
        if (!arguments.length) return onClick;
        onClick = x;
        return legend;
    };

    legend.selectedItems = function(x) {
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
        if(!arguments.length) return this.pos;
        this.pos = pos;
        this.tip.style("left", `${pos[0]}px`)
            .style("top", `${pos[1]}px`);
        return this;
    };

    move(pos, duration) {
        this.pos = pos;
        this.tip.transition().duration(duration).style("left", `${pos[0]}px`)
            .style("top", `${pos[1]}px`);
        return this;
    }

    hide() {
        this.tip.transition().delay(100).style("opacity", 0);
        return this;
    };

    show() {
        this.tip.transition().duration(0).style("opacity", 1);
        return this;
    };

    html(content) {
        this.tip.html(content);
        return this;
    };
}