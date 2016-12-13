'use strict';

function ajax(module, action, params, success_fn, context) {
    $.ajax({
        type: 'POST',
        url: current_env.get('api_url'),
        processData: false,
        contentType: 'application/json',
        data: JSON.stringify({
            module: module,
            action: action,
            parameters: params
        }),
        success: function(r) {
            if(r.error != ""){
                $.growl.warning({ title: "An error occured!", message: r.error, size: 'large' });
            } else {
                success_fn.call(context, r);
            }
        },
    });
}
