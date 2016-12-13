'use strict';

function makeColorPicker(colors, scale) {
    return function(d, i) {
        var pct = scale(d);
        for (var i = 1; i < colors.length - 1; i++) {
            if (pct < colors[i].pct) {
                break;
            }
        }
        var lower = colors[i - 1];
        var upper = colors[i];
        var range = upper.pct - lower.pct;
        var rangePct = (pct - lower.pct) / range;
        var pctLower = 1 - rangePct;
        var pctUpper = rangePct;
        var color = {
            r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
            g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
            b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        };
        return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    };
}
