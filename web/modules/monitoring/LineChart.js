'use strict';

function LineChart(cfg) {
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

    var svg_text_title = false;
    function setTitle(title) {
        if (!svg_text_title) {
            svg_text_title = chart.append("svg:text");
        }
        svg_text_title.html(title);
        window.setTimeout(function(){
            var w = svg_text_title._groups[0][0].clientWidth,
                h = svg_text_title._groups[0][0].clientHeight;
            svg_text_title
                .translate(config.width/2-w/2, h+(margin.top-h)/2)
                .style("font-size", "smaller");
        },1)
    }

    // draw title
    if (config.title) {
        setTitle(config.title);
    }

    // draw axes
    chart.append("g")
        .translate(margin.left, margin.top+height)
        .call(xAxis);
    chart.append("g")
        .translate(margin.left, margin.top)
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
            // Calling .data() gives us the changed (updated) nodes,
            // .enter() only new indexes, .exit() only abandoned array indexes.
            // For updating the charts, we need to merge .data() and .enter().
            var paths = drawboard.selectAll("path").data(datasets)

            // redraw existing and new graphs
            paths.enter().append("path").merge(paths)
                .style("stroke", function(d, i){
                    return (config.lines[i] && config.lines[i].color) ?
                        config.lines[i].color : "black";
                })
                .style("fill", "none")
                .attr("d", function(d){return line(d);});

            // remove old, now non-existant, graphs
            paths.exit().remove();

            return this;
        },
        setTitle: function(title){
            setTitle(title);
            return this;
        }
    };
    return o;
}
