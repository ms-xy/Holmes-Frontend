'use strict';

function update_navigation(navigation){
    ajax("monitoring", "get_machines", {p:"-"}, function(r){
        navigation.update(r.result);
    }, this);
}

function load_overview(){
    var navigation = UuidNavigation();
    navigation.renderTo($("#monitor-overview"));
    update_navigation(navigation);
    window.setInterval(update_navigation, 15000, navigation);
}

load_overview();
