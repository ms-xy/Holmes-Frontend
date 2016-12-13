'use strict';

function SystemInfo(tab) {
    var container = $("<div>").addClass("container");
    tab.append(container);
    // build dom
    // var circles = {
    //     row:    $("<div>").addClass("row"),
    //     cpu:    {
    //                 el:    $("<div>").addClass("col-md-4"),
    //                 chart: donut_chart(100, 100, [0, 100], 15, 1)
    //             },
    //     memory: {
    //                 el:    $("<div>").addClass("col-md-4"),
    //                 chart: donut_chart(100, 100, [0, 100], 15, 1)
    //             },
    //     load:   {
    //                 el:    $("<div>").addClass("col-md-4"),
    //                 chart: donut_chart(100, 100, [0, 1000], 10, 3)
    //             }
    // };
    // container.append(circles.row.append([
    //     circles.cpu.el.append(circles.cpu.chart.el()),
    //     circles.memory.el.append(circles.memory.chart.el()),
    //     circles.load.el.append(circles.load.chart.el())
    // ]));

    // // set some example data
    // circles.cpu.chart.data([40]);
    // circles.memory.chart.data([88]);

    // var load_chart_data = [];
    // for (var i=0; i<3; i++) {
    //     load_chart_data.push((i+1)*100);
    // }
    // circles.load.chart.data(load_chart_data);
    // circles.load.chart.data([3.0*100, 4.0*100, 7.0*100])

    var charts = {
        row:    $("<div>").addClass("row"),
        cpu:    {
                    el:    $("<div>").addClass("col-md-4"),
                    chart: line_chart({
                        title: "CPU",
                        width: 270,
                        height: 170,
                        xDomain:     [300, 0], // 300s = 5min
                        xTickValues: [0, 60, 120, 180, 240, 300],
                        xTickFormat: function(t){return (t/60)+" min";},
                        yDomain:     [0, 100],
                        yTickValues: [0, 25, 50, 75, 100],
                        yTickFormat: function(t){return t+" %";},
                        yTickLines:  [25, 50, 75, 100],
                    })
                },
        memory: {
                    el:    $("<div>").addClass("col-md-4"),
                    chart: line_chart({
                        title: "Memory",
                        width: 270,
                        height: 170,
                        xDomain:     [300, 0], // 300s = 5min
                        xTickValues: [0, 60, 120, 180, 240, 300],
                        xTickFormat: function(t){return (t/60)+" min";},
                        yDomain:     [0, 100],
                        yTickValues: [0, 25, 50, 75, 100],
                        yTickFormat: function(t){return t+" %";},
                        yTickLines:  [25, 50, 75, 100],
                        lines: [
                            {color: "red"}
                        ]
                    })
                },
        load:   {
                    el:    $("<div>").addClass("col-md-4"),
                    chart: line_chart({
                        title: "Systemload",
                        width: 270,
                        height: 170,
                        xDomain:     [300, 0], // 300s = 5min
                        xTickValues: [0, 60, 120, 180, 240, 300],
                        xTickFormat: function(t){return (t/60)+" min";},
                        yDomain:     [0, 2],
                        yTickValues: [0, 0.25, 0.50, 0.75, 1, 1.5, 2],
                        yTickFormat: function(t){return (t*100)+" %";},
                        yTickLines:  [0, 0.25, 0.50, 0.75, 1, 1.5, 2],
                        lines: [
                            {color: "#2196F3"},
                            {color: "#00BCD4"},
                            {color: "#3F51B5"}
                        ]
                    })
                }
    };
    container.append(charts.row.append([
        charts.cpu.el.append(charts.cpu.chart.el()),
        charts.memory.el.append(charts.memory.chart.el()),
        charts.load.el.append(charts.load.chart.el())
    ]));

    // update and interval
    var interval   = false,
        uuid       = false,
        cpuData    = [],
        memoryData = [],
        loads1     = [],
        loads5     = [],
        loads15    = [];
    function update(context) {
        ajax("monitoring", "get_sysinfo", {uuid: uuid}, function(resp){
            // memory update
            memoryData.unshift(resp.result.MemoryUsage/resp.result.MemoryMax*100);
            if (memoryData.length > 300) {
                memoryData.pop()
            }
            charts.memory.chart.data([memoryData]);
            // loads update
            loads1.unshift(resp.result.Loads1);
            loads5.unshift(resp.result.Loads5);
            loads15.unshift(resp.result.Loads15);
            if (loads1.length > 300) {
                loads1.pop()
                loads5.pop()
                loads15.pop()
            }
            charts.load.chart.data([loads1, loads5, loads15])
        }, context);
    }

    // build return object
    var o = {
        show: function(_uuid){
            uuid = _uuid
            if (interval) {
                window.clearInterval(interval);
            }
            update();
            interval = window.setInterval(update, 1000, this);
        },
        stop: function(){
            if (interval) {
                window.clearInterval(interval);
            }
        }
    };
    return o;
}

function NetworkInfo(tab) {

    // build return object
    var o = {
        show: function(uuid){},
        stop: function(){}
    };
    return o;
}

function PlannersInfo(tab) {

    // build return object
    var o = {
        show: function(uuid){},
        stop: function(){}
    };
    return o;
}

function UuidNavigation() {
    // build dom
    var uuidnav = {
        container: $("<td>").addClass("layer-w"),
        el:        $("<ul>").addClass("nav nav-stacked").attr("role","tab-list")
    };
    uuidnav.container.append(uuidnav.el);

    var detailnav = {
        container:    $("<td>").addClass("layer-b"),
        el:           $("<ul>").addClass("nav nav-stacked").attr("role","tab-list"),
        systeminfo:   $("<li>").addClass("active").attr("role","presentation").append($("<a>").attr("href","#systeminfo").attr("aria-controls","systeminfo").attr("role","tab").attr("data-toggle","tab").text("System")),
        networkinfo:  $("<li>").attr("role","presentation").append($("<a>").attr("href","#networkinfo").attr("aria-controls","networkinfo").attr("role","tab").attr("data-toggle","tab").text("Network")),
        plannersinfo: $("<li>").attr("role","presentation").append($("<a>").attr("href","#plannersinfo").attr("aria-controls","plannersinfo").attr("role","tab").attr("data-toggle","tab").text("Planners"))
    };
    detailnav.container.append(detailnav.el.append([detailnav.systeminfo, detailnav.networkinfo, detailnav.plannersinfo]));

    var content = {
        container:    $("<td>").addClass("layer-w"),
        el:           $("<div>").addClass("tab-content"),
        systeminfo:   $("<div>").addClass("active").addClass("tab-pane").attr("role","tabpanel").attr("id","systeminfo"),
        networkinfo:  $("<div>").addClass("tab-pane").attr("role","tabpanel").attr("id","networkinfo"),
        plannersinfo: $("<div>").addClass("tab-pane").attr("role","tabpanel").attr("id","plannersinfo"),
    }
    content.container.append(content.el.append([content.systeminfo, content.networkinfo, content.plannersinfo]));

    var systeminfo = SystemInfo(content.systeminfo),
        networkinfo = NetworkInfo(content.networkinfo),
        plannersinfo = PlannersInfo(content.plannersinfo);

    // build return object
    var o = {
        // properties
        active:     -1,
        uuid_list:  [],
        items_map:  {},
        // internal methods
        __d3bisect: d3.bisector(function(uuid){return uuid}).right,
        __getInsertPosition: function(uuid){return this.__d3bisect(this.uuid_list, uuid)},
        __deactivate_active: function(){
            if (this.active >= 0) {
                var uuid = this.uuid_list[this.active];
                var item = this.items_map[uuid];
                item.removeClass("active");
                this.active = -1;
                // stop updating
                systeminfo.stop();
                networkinfo.stop();
                plannersinfo.stop();
            }
        },
        __activate: function(event){
            var id = this.__getInsertPosition(event.data.uuid) - 1;
            if (this.active == id) return; // already active
            if (this.active == -1) {
                detailnav.container.insertAfter(uuidnav.container);
                content.container.insertAfter(detailnav.container);
            }
            this.__deactivate_active();
            var item = this.items_map[event.data.uuid];
            item.addClass("active");
            this.active = id;
            // update all the different information tabs
            systeminfo.show(event.data.uuid);
            networkinfo.show(event.data.uuid);
            plannersinfo.show(event.data.uuid);
        },
        // public methods
        insert: function(uuid){
            // do not insert duplicates
            if (this.items_map[uuid]) return;

            // create the nav element
            var item = $("<li>").attr("role","presentation").append($("<a>").attr("role","tab").text(uuid));

            // insert uuid and item into both lists/obj and dom
            var pos = this.__getInsertPosition(uuid);
            if (pos == 0) {
                item.prependTo(uuidnav.el);
            } else {
                item.insertAfter(this.items_map[this.uuid_list[pos-1]]);
            }
            this.uuid_list.splice(pos, 0, uuid);
            this.items_map[uuid] = item;

            // attach event handler
            item.on("click", null, {uuid: uuid}, this.__activate);

            // if it's the first inserted element, auto-activate
            if (this.uuid_list.length == 1) {
                item.click();
            }
        },
        remove: function(uuid){
            var pos = this.__getInsertPosition(uuid) - 1;
            // if the element does not exist, return
            if (pos < 0 || this.uuid_list[pos] != uuid) return;
            // if the element is the active element, try to activate its
            // predecessor if possible, otherwise try the successor, worst
            // case deactivate completely
            if (this.active == pos) {
                if (this.uuid_list.length > 1) {
                    if (pos == 0) {
                        this.items_map[this.uuid_list[1]].click();
                    } else {
                        this.items_map[this.uuid_list[pos-1]].click();
                    }
                } else {
                    this.__deactivate_active();
                }
            }
            // finish removal by cleansing the item from the map, list, and dom
            this.uuid_list.splice(pos, 1);
            this.items_map[uuid].off().remove();
            this.items_map[uuid] = undefined;
            if (this.uuid_list.length == 0) {
                detailnav.container.detach();
                content.container.detach();
            }
        },
        renderTo: function(el){
            el.append(uuidnav.container);
        }
    };
    // bind callback context
    o.__activate = $.proxy(o.__activate, o);
    return o
}




function create_listing() {
    var table = $("<table>"),
        tbody = $("<tbody>");
    table.addClass("table").append(tbody);
    return table;
}

function create_listing_header(values) {
    var tr = $("<tr>").css({
        "background-color": "#e5e5ff"
    });
    $.each(values, function(k, v){
        var th = $("<th>");
        th.html(v);
        tr.append(th);
    });
    return tr;
}

function create_listing_row(values) {
    var tr = $("<tr>");
    $.each(values, function(k, v){
        var td = $("<td>");
        td.html(v);
        tr.append(td);
    });
    return tr;
}




function update_navigation(navigation){
    ajax("monitoring", "get_uuids", {p:"-"}, function(r){
        for (var i=0; i<r.result.length; i++) {
            navigation.insert(r.result[i]);
        }
    }, this);
}

function load_overview(){
    var navigation = UuidNavigation();
    navigation.renderTo($("#monitor-overview"));
    update_navigation(navigation);
    window.setInterval(update_navigation, 5000, navigation);
}

load_overview();
