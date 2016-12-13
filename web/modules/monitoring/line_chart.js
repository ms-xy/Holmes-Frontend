'use strict';

d3.selection.prototype.removeDOM = function() {
    $(this.nodes()).remove();
}

function line_chart(cfg) {
    var config = $.extend({
        title:  false,
        width:  100,
        height: 100,
        xDomain:     [0, 100],
        xTickValues: false,
        xTickFormat: false,
        xTickLines:  false,
        yDomain:     [0, 100],
        yTickValues: false,
        yTickFormat: false,
        yTickLines:  false,
        lines:       []
    }, cfg);

    var margin  = {top: 20, right: 30, bottom: 30, left: 40};
    if (config.title) margin.top = 40;

    var el = $(document.createElementNS("http://www.w3.org/2000/svg", "svg"))
            .attr({"width":  config.width, "height": config.height})
            .css({ "width":  config.width, "height": config.height}),

        width   = config.width - margin.left - margin.right,
        height  = config.height - margin.top - margin.bottom,

        chart = d3.select(el[0]),
        drawboard = chart.append("g")
            .attr("transform", "translate("+margin.left+","+margin.top+")"),

        xScale  = d3.scaleLinear().domain(config.xDomain).range([0, width]),
        yScale  = d3.scaleLinear().domain(config.yDomain).range([height, 0]),

        xAxis   = d3.axisBottom(xScale),
        yAxis   = d3.axisLeft(yScale);

    // adjust tick values if provided
    if (config.xTickValues) {
        xAxis.tickValues(config.xTickValues);
    }
    if (config.yTickValues) {
        yAxis.tickValues(config.yTickValues);
    }
    if (config.xTickFormat) {
        xAxis.tickFormat(config.xTickFormat);
    }
    if (config.yTickFormat) {
        yAxis.tickFormat(config.yTickFormat);
    }

    // draw title
    if (config.title) {
        var x = chart.append("svg:text").text(config.title);
        window.setTimeout(function(){
            var w = x._groups[0][0].clientWidth,
                h = x._groups[0][0].clientHeight;
            x.attr("transform", "translate("+(config.width/2-w/2)+","+(h+(margin.top-h)/2)+")")
             .style("font-size", "smaller");
        },1)
    }

    // draw axes
    chart.append("g")
        .attr("transform", "translate("+margin.left+","+(margin.top+height)+")")
        .call(xAxis);
    chart.append("g")
        .attr("transform", "translate("+margin.left+","+margin.top+")")
        .call(yAxis);

    // draw tick lines across the graph board if requested
    if (config.yTickLines) {
        var yScaleLines = d3.scaleLinear().domain(config.yDomain).range([0, height]),
            yBase = margin.top+height-1,
            xBase = margin.left+1,
            xEnd  = margin.left+width;
        $.each(config.yTickLines, function(i,t){
            var y = yBase - yScaleLines(t) + 1.6;
            chart.append("svg:line")
                .attr("x1",xBase)
                .attr("x2",xEnd)
                .attr("y1",y)
                .attr("y2",y)
                .style("stroke","black")
                .style("stroke-width",0.1);
        });
    }

    // line(s) drawing
    var line = d3.line()
        .x(function(d, i){return xScale(i);})
        .y(function(d, i){return yScale(d);});

    // build return object
    var o = {
        el: function(){return el;},
        data: function(datasets){
            drawboard.selectAll("path").removeDOM();
            drawboard.selectAll("path")
                .data(datasets)
                .enter().append("path")
                    .style("stroke", function(d, i){
                        if (!config.lines[i] || !config.lines[i].color) {
                            return "black";
                        }
                        return config.lines[i].color;
                    })
                    .style("fill", "none")
                    .attr("d", function(d){return line(d);});
        }
    };
    return o;
}
