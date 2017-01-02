'use strict';

function PlannersInfo(tab) {
    var container = $("<div>").addClass("container");
    tab.append(container);

    var interval = false,
        machineUuid = false;

    function update(context) {
        // type PlannerInformation struct {
        //     Name          string
        //     PID           uint64
        //     IP            net.IP
        //     Port          int
        //     Configuration string
        //     Logs          *LogBuffer
        //     Services      map[uint16]*ServiceInformation
        // }
        ajax("monitoring", "get_planners", {machineUuid: machineUuid}, function(response){
            var planners = response.result;
            $.each(planners, function(i, o){
                container.append($("<div>").text(o.Name))
            });
        });
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
