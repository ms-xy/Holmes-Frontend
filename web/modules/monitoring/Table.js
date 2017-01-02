'use strict';

function Table(cfg) {
    var _ = $.extend({
        columns: [],
        /*
        Each column is defined by an object describing its properties.
        Example:
            {
                i: "column_1",
                th: "My Column",
                data_fn: function(data, obj) {return humanReadable(data, "bytes")},
                cssClasses: [
                    {
                        cls: "custom-td-class"
                        fn: function(data, obj) {return (data.do_add_class) ? true : false}
                    }
                ]
            }
        "i" is mandatory, whilst "th" and "fn" are not. "th" specifies
        the column header text, if none given it is left empty. The access
        function "data_fn" can be used to alter values before using them.
        It is passed 2 values, the "data" retrieved using the key (as defined
        in the properties) and the object "obj" containing the data.
        Similarly the function "fn" of each css class receives the same
        parameters, but its return value determines whether or not the css
        classes defined by the key "cls" are set on the resulting <td>.
        All css class definitions in the "cssClasses" array are applied in
        order of definition until one is successfully applied.
        */
    }, cfg);

    var table = $("<table>").addClass("table table-striped table-bordered table-hover"),
        tbody = $("<tbody>");

    table.append(tbody);

    // draw title row if specified
    function draw_title() {
        var l         = 0,
            titles    = _.columns.map(function(d){
                            if (d.th) {
                                l++;
                                return d.th;
                            }
                            return "";
                        }),
            rows      = d3.select(tbody[0]).selectAll(".table-header-row").data(
                            (l>0) ? [1] : []
                        ),
            headers   =

        rows.enter().append("tr").classed("table-header-row", true)
            .merge(rows)
            .selectAll(".table-header").data(titles);

        headers.enter().append("th").classed("table-header", true)
            .merge(headers)
            .html(function(d){return d});

        rows.exit().remove();
        headers.exit().remove();
    }
    draw_title();

    // build return object
    var o = {
        el: function(){return table;},
        setData: function(_rows){
            var rows = d3.select(tbody[0]).selectAll(".table-row").data(_rows);

            rows.enter().append("tr").classed("table-row", true)
                .merge(rows)
                    .select(function(o,i,trs){
                        var tds = d3.select(trs[i]).selectAll("td").data(_.columns),
                            tdsr =

                        tds.enter().append("td")
                            .merge(tds)
                                .html(function(col){
                                    return (col.fn) ? col.fn(o[col.i]) : o[col.i];
                                });

                        for (var jj=0; jj<_.columns.length; jj++) {
                            if (_.columns[jj].cssClasses) {
                                var cls, apply=false;
                                for (var j=0; !apply && j<_.columns[i].cssClasses.length; j++) {
                                    cls = _.colums[jj].cssClasses[j];
                                    apply = cls.fn(o[_columns[jj].i], o);
                                    tdsr.classed(cls.cls, apply)
                                }
                            }
                        }

                        tds.exit().remove();

                        return trs[i];
                    });

            rows.exit().remove();

            return this;
        },
        setTitleRow: function(title_row){
            _.title_row = title_row;
            draw_title();
            return this;
        }
    };
    return o;
}
