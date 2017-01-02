'use strict';

function update_navigation(navigation){
    ajax("monitoring", "get_machines", {p:"-"}, function(r){
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
