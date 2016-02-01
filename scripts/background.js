'use strict';

const userAgentOverride = {};
const cacheTTL = 60 * 60 * 1000;

chrome.webRequest.onBeforeRequest.addListener(details => {
    // initial proxy request: get user agent from params of given request url
    // and assign it for all sub-requests of current sub-frame
    var query = details.url.split('?')[1];
    if (!query) {
        return;
    }

    var params = query.split('&').reduce((out, pair) => {
        pair = pair.split('=');
        out[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        return out;
    }, {});

    if (params.userAgent) {
        userAgentOverride[details.frameId] = {
            userAgent: params.userAgent,
            timeStamp: details.timeStamp
        };
    }

    if (params.url) {
        return {redirectUrl: params.url};
    }
}, {
    urls: [`${chrome.runtime.getURL('proxy')}*`],
    types: ['sub_frame']
}, ['blocking']);


chrome.webRequest.onBeforeSendHeaders.addListener(details => {
    var override = userAgentOverride[details.frameId];
    if (override) {
        return {
            requestHeaders: details.requestHeaders.map(header => {
                if (header.name.toLowerCase() === 'user-agent') {
                    header = {
                        name: header.name,
                        value: override.userAgent
                    };
                }
                return header;
            })
        };
    }
}, {
    urls: ['<all_urls>']
}, ['blocking', 'requestHeaders']);

cleanUp();

function cleanUp() {
    var now = Date.now();
    Object.keys(userAgentOverride).forEach(key => {
        if (userAgentOverride[key].timeStamp + cacheTTL < now) {
            delete userAgentOverride[key];
        }
    });
    setTimeout(cleanUp, cacheTTL);
}
