'use strict';


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
