'use strict';
if (window.frameElement && window.frameElement.dataset && window.frameElement.dataset.userAgent) {
    var script = document.createElement('script');
    script.text = `navigator.__defineGetter__('userAgent', function() {return window.frameElement.dataset.userAgent;});`;
    document.documentElement.appendChild(script);
}
