'use strict';

const userAgentOverride = {};
const activeSessions = []
const cacheTTL = 60 * 60 * 1000;

const defaultIcon = 'icons/browser-action.png';
const activeIcon = 'icons/browser-action-active.png';

chrome.browserAction.onClicked.addListener(function(tab) {
    if (activeSessions.indexOf(tab.id) !== -1) {
        chrome.tabs.sendMessage(tab.id, 'destroy-re:view');
        removeSession(tab.id);
        updateIcon(tab.id, defaultIcon);
    } else {
        console.log('create re:view session');
        activeSessions.push(tab.id);
        chrome.tabs.insertCSS(tab.id, {file: 'style/main.css'});
        chrome.tabs.executeScript(tab.id, {file: 'scripts/re-view.js'});
        updateIcon(tab.id, activeIcon);
    }
});

chrome.tabs.onRemoved.addListener(removeSession);
chrome.tabs.onUpdated.addListener(removeSession);

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

function removeSession(tabId) {
    var ix = activeSessions.indexOf(tabId);
    if (ix !== -1) {
        activeSessions.splice(ix, 1);
    }
}

function updateIcon(tabId, path) {
    chrome.browserAction.setIcon({path, tabId});
}
