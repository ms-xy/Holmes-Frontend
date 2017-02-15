'use strict';


function PlannerInfo(container) {
    var container     = d3.select(container[0]),
        last_selected = "";

    function setData(plannersinfo){
        container.selectAll("div").data(plannersinfo);
        planners.enter().append("div")
            .merge(planners)
                .html(function(p){return p.Name});

        planners.exit().remove();
    }

    return {
        setData: setData
    }
}

function PlannersInfoNavigation() {
    // build dom
    var nav = {
        container: $("<td>").addClass("layer-w"),
        el:        $("<ul>").addClass("nav nav-stacked").attr("role","tab-list")
    };
    nav.container.append(nav.el);
    // one el looks like this:
    // $("<li>").addClass("active")
    //      .attr("role","presentation")
    //      .append($("<a>")
    //          .attr("href","#systeminfo")
    //          .attr("aria-controls","systeminfo")
    //          .attr("role","tab")
    //          .attr("data-toggle","tab")
    //          .text("System")
    //      )

    var content = {
        container:    $("<td>").addClass("layer-b"),
        el:           $("<div>").addClass("tab-content"),
    }
    content.container.append(content.el);
    // one el looks like this:
    // $("<div>").addClass("active")
    //      .addClass("tab-pane")
    //      .attr("role","tabpanel")
    //      .attr("id","systeminfo")

    // build return object
    var o = {
        // properties
        active:         -1,
        planners_list:  [],
        items_map:      {},
        // internal methods
        __d3bisect: d3.bisector(function(planner){return planner}).right,
        __getInsertPosition: function(planner){return this.__d3bisect(this.planners_list, planner)},
        __deactivate_active: function(){
            if (this.active >= 0) {
                var planner = this.planner_list[this.active],
                    item    = this.items_map[planner];
                item.removeClass("active");
                this.active = -1;
                // stop updating
                // TODO
            }
        },
        __activate: function(event){
            var id = this.__getInsertPosition(event.data.planner) - 1;
            if (this.active == id) return; // already active
            if (this.active == -1) {
                detailnav.container.insertAfter(nav.container);
                content.container.insertAfter(detailnav.container);
            }
            this.__deactivate_active();
            var item = this.items_map[event.data.planner];
            item.addClass("active");
            this.active = id;
            // update all the different information tabs
            // TODO
        },
        // public methods
        insert: function(planner){
            // do not insert duplicates
            if (this.items_map[planner]) return;

            // create the nav element
            var item = $("<li>").attr("role","presentation").append($("<a>").attr("role","tab").text(planner));

            // insert planner and item into both lists/obj and dom
            var pos = this.__getInsertPosition(planner);
            if (pos == 0) {
                item.prependTo(nav.el);
            } else {
                item.insertAfter(this.items_map[this.planner_list[pos-1]]);
            }
            this.planner_list.splice(pos, 0, planner);
            this.items_map[planner] = item;

            // attach event handler
            item.on("click", null, {planner: planner}, this.__activate);

            // if it's the first inserted element, auto-activate
            if (this.planner_list.length == 1) {
                item.click();
            }
        },
        remove: function(planner){
            var pos = this.__getInsertPosition(planner) - 1;
            // if the element does not exist, return
            if (pos < 0 || this.planner_list[pos] != planner) return;
            // if the element is the active element, try to activate its
            // predecessor if possible, otherwise try the successor, worst
            // case deactivate completely
            if (this.active == pos) {
                if (this.planner_list.length > 1) {
                    if (pos == 0) {
                        this.items_map[this.planner_list[1]].click();
                    } else {
                        this.items_map[this.planner_list[pos-1]].click();
                    }
                } else {
                    this.__deactivate_active();
                }
            }
            // finish removal by cleansing the item from the map, list, and dom
            this.planner_list.splice(pos, 1);
            this.items_map[planner].off().remove();
            this.items_map[planner] = undefined;
            if (this.planner_list.length == 0) {
                detailnav.container.detach();
                content.container.detach();
            }
        },
        renderTo: function(el){
            el.append(nav.container);
        }
    };
    // bind callback context
    o.__activate = $.proxy(o.__activate, o);
    return o
}

function PlannerInfoTab(tab) {
    var container = $("<div>").addClass("container");
    tab.append(container);

    var PI = new PlannerInfo(container),
        interval = false,
        machineUuid = false;

    function update(context) {
        ajax("monitoring", "get_planners", {machineUuid: machineUuid}, function(response){
            var plannersinfo = response.result;
            PI.setData(plannersinfo);
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
        // update(this);
        // interval = window.setInterval(update, 1000, this);
    }

    // build return object
    var o = {
        show: show,
        stop: stop
    };
    return o;
}
