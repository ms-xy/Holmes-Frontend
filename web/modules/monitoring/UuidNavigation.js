'use strict';

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

    var systeminfo = SystemInfoTab(content.systeminfo),
        networkinfo = NetworkInfoTab(content.networkinfo),
        plannersinfo = PlannerInfoTab(content.plannersinfo);

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
        update: function(resultset){
            for (var i=0; i<resultset.length; i++) {
                this.insert(resultset[i].machine_uuid);
            }
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
