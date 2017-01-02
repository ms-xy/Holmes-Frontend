'use strict';

function Table(cfg) {
    var _ = $.extend({
        /*
        Each column is defined by an object describing its properties.
        Example see contents below.
        "i" is mandatory, whilst "th" and "fn" are not. "th" specifies
        the column header text, if none given it is left empty. The access
        function "data_fn" can be used to alter values before using them.
        It is passed 2 values, the "data" retrieved using the key (as defined
        in the properties) and the object "obj" containing the data.
        */
        columns: [
            // {
            //     i: "column_1",
            //     th: "My Column",
            //     fn: function(data, obj) {return d3.format("-,.3s")(data)},
            // }
        ],
        /*
        Each row can be colored using bootstraps contextual classes.
        (See http://getbootstrap.com/css/#tables-contextual-classes)
        If the function supplied returns true, then the corresponding context
        class is set.
        The function receives the parameters "row-data", "row-index", "rows",
        and "this" is set to the current DOM element.
        All available classes are listed below:
        */
        cls: [
            // { name: "active",  fn: false },
            // { name: "success", fn: false },
            // { name: "warning", fn: false },
            // { name: "danger",  fn: false },
            // { name: "info",    fn: false }
        ],
        /*
        Set debug to true to receive additional console output.
        */
        debug: false
    }, cfg);

    var debug = $.noop;
    if (_.debug) {
        debug = function() {
            console.log.apply(this, arguments);
        }
    }

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

        rows.enter().append("tr")
                .classed("table-header-row", true)
                .style("background-color", "#e5e5ff")
            .merge(rows)
            .selectAll(".table-header").data(titles);

        headers.enter().append("th").classed("table-header", true)
            .merge(headers)
            .html(function(d){return d});

        rows.exit().remove();
        headers.exit().remove();
    }
    draw_title();

    function apply_row_cls(o, i, trs, tr) {
        $.each(_.cls, function(i, cls){
            if (cls.name && cls.fn) {
                d3.select(tr).classed(cls.name, cls.fn(o, i, trs));
            }
        });
    }

    // build return object
    var o = {
        el: function(){return table;},
        setData: function(_rows){
            debug("TABLE :: _rows:",_rows);
            var rows = d3.select(tbody[0]).selectAll(".table-row").data(_rows);
            debug("TABLE :: rows:", rows);

            rows.enter().append("tr").classed("table-row", true)
                .merge(rows)
                    .select(function(o,i,trs){
                        debug("TABLE :: o,i,trs:", o,i,trs);

                        apply_row_cls(o, i, trs, this);

                        var tds        = d3.select(trs[i]).selectAll("td").data(_.columns),
                            tds_merged =

                        tds.enter().append("td")
                            .merge(tds)
                                .html(function(col){
                                    return (col.fn) ? col.fn(o[col.i]) : o[col.i];
                                });

                        for (var jj=0; jj<_.columns.length; jj++) {
                            if (_.columns[jj].td_cls) {

                            }
                            if (_.columns[jj].tr_cls) {
                                var cls, apply=false;
                                for (var j=0; !apply && j<_.columns[jj].tr_cls.length; j++) {
                                    cls = _.columns[jj].tr_cls[j];
                                    apply = cls.fn(o);

                                }
                            }
                        }

                        tds.exit().remove();

                        return trs[i];
                    })

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
