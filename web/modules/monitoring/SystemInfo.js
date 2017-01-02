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
                    chart: new LineChart({
                        title: "<tspan style='fill:#0058ff'>CPU</tspan> / <tspan style='fill:green'>IOWait</tspan>",
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
                            {color: "#0058ff"},
                            {color: "green"}
                        ]
                    })
                },
        memory: {
                    el:    $("<div>").addClass("col-md-4"),
                    chart: new LineChart({
                        title: "<tspan style='fill:red'>Memory</tspan> / <tspan style='fill:#ff9600'>Swap</tspan>",
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
                            {color: "red"},
                            {color: "#ff9600"}
                        ]
                    })
                },
        load:   {
                    el:    $("<div>").addClass("col-md-4"),
                    chart: new LineChart({
                        title: "Systemload (<tspan style='fill:#005'>1</tspan>, <tspan style='fill:#338'>5</tspan>, <tspan style='fill:#88b'>15</tspan> min)",
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
                            {color: "#005"},
                            {color: "#338"},
                            {color: "#88b"}
                        ]
                    })
                }
    };
    var SIFormatBytes = d3.format("-,.3s");
    var tables = {
        harddrives: {
            el: $("<div>").addClass("col-md-12"),
            table: new Table({
                columns: [
                    { i: "FsType",     th: "Filesystem"               },
                    { i: "MountPoint", th: "Mount-Point"              },
                    { i: "Used",       th: "Used",  fn: SIFormatBytes },
                    { i: "Total",      th: "Total", fn: SIFormatBytes },
                    { i: "Free",       th: "Free",  fn: SIFormatBytes },
                ],
                cls: [
                    { name: "danger", fn: function(o,i,trs){return (o.Used/o.Total > 0.7)} }
                ]
            })
        }
    };
    container.append(
        charts.row.append(
            charts.cpu.el.append(charts.cpu.chart.el()),
            charts.memory.el.append(charts.memory.chart.el()),
            charts.load.el.append(charts.load.chart.el())
            ),
        $('<div>')
            // .addClass("well well-sm")
            .addClass("alert alert-info")
            .html(`In order to preserve uniformity and comparability, the above load graph is scaled by the amount of available processing units`),
        tables.harddrives.table.el()
    );

    // update and interval
    var interval    = false,
        machineUuid = false,
        cpuData     = [],
        ioWaitData  = [],
        memoryData  = [],
        swapData    = [],
        loads1      = [],
        loads5      = [],
        loads15     = [];
    function update(context) {
        ajax("monitoring", "get_sysinfo", {machineUuid: machineUuid}, function(response){
            var result = response.result;

            // update cpu data array
            var iowait = result.CpuIOWait,
                idle   = result.CpuIdle,
                busy   = result.CpuBusy,
                total  = result.CpuTotal;
            cpuData.unshift(((total - idle)/total) * 100);
            ioWaitData.unshift((iowait/total) * 100);

            // update memory data array
            memoryData.unshift((result.MemoryUsage / result.MemoryMax) * 100);
            swapData.unshift((result.SwapUsage / result.SwapMax) * 100);

            // update system load data arrays
            loads1.unshift(result.Loads1);
            loads5.unshift(result.Loads5);
            loads15.unshift(result.Loads15);

            // trim oversize
            if (cpuData.length > 300) {
                cpuData.pop();
                ioWaitData.pop();
                memoryData.pop();
                swapData.pop();
                loads1.pop();
                loads5.pop();
                loads15.pop();
            }

            // update graphs
            charts.cpu.chart.data([cpuData, ioWaitData]);
            charts.memory.chart.data([memoryData, swapData]);
            charts.load.chart.data([loads1, loads5, loads15]);

            // update harddrives table
            tables.harddrives.table.setData(result.Harddrives);

        }, context);
    }

    function stop() {
        if (interval) {
            window.clearInterval(interval);
        }
    }

    function show(_machineUuid) {
        machineUuid = _machineUuid
        this.stop()
        update(this);
        interval = window.setInterval(update, 1000, this);
    }

    // build return object
    var o = {
        show: show,
        stop: stop
    };
    return o;
}
