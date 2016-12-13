'use strict';

function create_layer_w() {
    return $("<td>").addClass("layer-w");
}

function create_layer_b() {
    return $("<td>").addClass("layer-b");
}

function create_tab_nav() {
    return $("<ul>").addClass("nav nav-stacked").attr("role","tab-list");
}

function create_tab_nav_item(id, name) {
    return $("<li>").attr("role","presentation").append(
        $("<a>")
        .attr("href","#"+id)
        .attr("aria-controls",id)
        .attr("role","tab")
        .attr("data-toggle","tab")
        .text(name)
    );
}

function create_tab_content() {
    return $("<div>").addClass("tab-content");
}

function create_tab_content_item(id) {
    return $("<div>").addClass("tab-pane").attr("role","tabpanel").attr("id",id);
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


function create_sysinfo(v) {
    var session = v.Session,
        info    = v.Info,
        sysinfo = $("<div>"),
        list_a  = create_listing(),
        body_a  = list_a.find("tbody"),
        list_b  = create_listing(),
        body_b  = list_b.find("tbody");

    var cpu       = create_listing_row(["CPU-Usage", info.Status.System.LoadPercent]),
        mem_usage = (info.Status.System.MemoryUsage / 2**30).toFixed(2),
        mem_max   = (info.Status.System.MemoryMax / 2**30).toFixed(2),
        memory    = create_listing_row(["Memory-Usage", mem_usage+" GiB / "+mem_max+" GiB"]),
        loads1    = info.Status.System.Loads1,
        loads5    = info.Status.System.Loads5,
        loads15   = info.Status.System.Loads15,
        loads     = create_listing_row(["System Load",
            parseFloat(loads1).toFixed(2)+", "+
            parseFloat(loads5).toFixed(2)+", "+
            parseFloat(loads15).toFixed(2)]);

    body_a.append([cpu, memory, loads]);

    body_b.append(create_listing_header(["Mount-Point (Device)", "Used / Total"]));

    $.each(info.Status.System.Harddrives, function(i, drive){
        var total = (drive.Total / 2**30).toFixed(2),
            used  = (drive.Used / 2**30).toFixed(2);
        body_b.append(create_listing_row(["<b>"+drive.MountPoint+"</b> ("+drive.FsType+")", used+" GiB / "+total+" GiB"]))
    });

    sysinfo.append([list_a, list_b]);

    return sysinfo;
}

function create_netinfo(v) {
    var session = v.Session,
        info    = v.Info,
        netinfo = create_listing(),
        body    = netinfo.find("tbody");

    $.each(info.Status.Network.Interfaces, function(i, iface){
        body.append(create_listing_row([iface.Name, iface.IP, iface.Scope]));
    });

    return netinfo;
}

function create_planners(v) {
    var session  = v.Session,
        info     = v.Info,
        planners = $("<div>"),
        planner_1 = create_listing(),
        body_1    = planner_1.find("tbody");

    var header = create_listing_header([info.Name, ""]),
        config = create_listing_row(["Configuration", info.Configuration]),
        port   = create_listing_row(["Port", info.Port]),
        services = create_listing_row(["Services", "TODO"]);

    body_1.append([header, config, port, services]);
    planners.append(planner_1);
    return planners
}


function load_overview(){
    $.ajax({
        type: 'POST',
        url: current_env.get('api_url'),
        processData: false,
        contentType: 'application/json',
        data: JSON.stringify({
            module: "monitoring",
            action: "overview",
            parameters: {
                show: "ips"
            }
        }),
        success: function(r) {
            if(r.error != ""){
                $.growl.warning({ title: "An error occured!", message: r.error, size: 'large' });
            } else {
                var overview = $("#monitor-overview"),
                    layer1   = create_layer_w(),
                    layer2   = create_layer_b(),
                    layer3   = create_layer_w(),
                    nav1     = create_tab_nav(),
                    content2 = create_tab_content(),
                    content3 = create_tab_content();

                overview.children().remove();

                $.each(r.result, function(k, v){
                    var id = v.Info.IP.replace(/\.|:/g, "_"),
                        ip = v.Info.IP,
                        sysinfo = create_sysinfo(v),
                        netinfo = create_netinfo(v),
                        planners = create_planners(v);

                    nav1.append(create_tab_nav_item(id,ip));

                    content2.append(create_tab_content_item(id).append(
                        create_tab_nav().append([
                            create_tab_nav_item("systeminfo", "System"),
                            create_tab_nav_item("netinfo", "Network"),
                            create_tab_nav_item("planners", "Planners")
                        ])
                    ));

                    content3.append(create_tab_content().append([
                        create_tab_content_item("systeminfo").append(sysinfo),
                        create_tab_content_item("netinfo").append(netinfo),
                        create_tab_content_item("planners").append(planners)
                    ]))
                });

                layer1.append(nav1);
                layer2.append(content2);
                layer3.append(content3);

                overview.append([layer1, layer2, layer3]);
            }
        },
    });
}

load_overview();
