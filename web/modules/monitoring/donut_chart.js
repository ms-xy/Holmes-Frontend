'use strict';

function donut_chart(width, height, domain, depth, datasetcount) {
    var el = $(document.createElementNS("http://www.w3.org/2000/svg", "svg"))
            .attr({"width":  width, "height": height})
            .css({ "width":  width, "height": height}),
        chart        = d3.select(el[0]).append("svg:g"),
        scale        = d3.scaleLinear().domain(domain).range([0, 2*Math.PI]),
        scalePercent = d3.scaleLinear().domain(domain).range([0, 100]),
        outer_radius = width/2 - 1,
        inner_radius = 0;

    // move drawing center to svg center
    chart.attr("transform", "translate("+width/2+","+height/2+")");

    // print outer border
    chart.append("svg:circle")
            .attr("r", outer_radius)
            .attr("fill", "none")
            .attr("stroke", "#ddd")
            .attr("stroke-width", 1);

    var arc = d3.arc()
        .startAngle(0)
        .endAngle(function(d, i){return scale(d);})
        .innerRadius(function(d, i){return outer_radius - (i+1)*(depth+1) + 0.5;})
        .outerRadius(function(d, i){return outer_radius - i*(depth+1) - 0.5;})
        .cornerRadius(Math.min(depth/2,4));

    for (var i=0; i<datasetcount; i++) {
        inner_radius = outer_radius - (i+1)*(depth+1);
        // print inner border
        chart.append("svg:circle")
                .attr("r", inner_radius)
                .attr("fill", "none")
                .attr("stroke", "#ddd")
                .attr("stroke-width", 1);
    }

    // This solution for colorizing the bar has been copied from:
    // http://stackoverflow.com/a/7128796
    var colors = [
        { pct: 33, color: { r: 0x00, g: 0xff, b: 0 } },
        { pct: 66, color: { r: 0xff, g: 0xff, b: 0 } },
        { pct: 100, color: { r: 0xff, g: 0x00, b: 0 } } ];

    var getColor = makeColorPicker(colors, scalePercent);

    // build return object
    var o = {
        el: function(){return el;},
        data: function(data){
            var path = chart.selectAll("path")
                .data(data);

            path.enter().append("svg:path")
                    .style("fill", getColor)
                .merge(path).attr("d", arc);
        }
    };
    return o;
}
