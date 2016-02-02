'use strict';
if (window.frameElement) {
    var src = window.frameElement.src;
    var params = parseQuery(src) || {};
    if (params.userAgent) {
        var script = document.createElement('script');
        script.text = `navigator.__defineGetter__('userAgent', function() {return "${params.userAgent.replace(/"/g, '\\"')}";});`;
        document.documentElement.appendChild(script);
    }
}

function parseQuery(url) {
    var query = url.split('?')[1];
    if (!query) {
        return;
    }

    return query.split('&').reduce((out, pair) => {
        pair = pair.split('=');
        out[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        return out;
    }, {});
}
