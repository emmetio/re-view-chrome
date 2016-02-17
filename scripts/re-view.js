'use strict';
import {default as reView, dispatch, subscribe, findBreakpoints, getStateValue, UI, APP, DONATION} from 'livestyle-re-view';
import {throttle} from './lib/utils';
import * as donation from './lib/donation';

const storage = chrome.storage.sync;
const storageKey = 're-view2';
const donatedKey = 'donated';
const proxyUrl = chrome.runtime.getURL('proxy');
const featureAliases = {
    minWidth: 'min',
    maxWidth: 'max'
};

const saveDataToStorage = throttle(state => {
    storage.set({
        [storageKey]: {
            ui: {mode: state.ui.mode},
            deviceWallPicker: {display: state.deviceWallPicker.display},
            options: state.options,
            user: state.user
        }
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('Unable to save Re:view state', chrome.runtime.lastError);
        }
    });

    // force selected breakpoints list to be stored in local storage
    var origin = window.location.origin;
    var selectedBP = getStateValue('breakpoints.selected', state) || [];
    chrome.storage.local.set({
        [origin]: {selectedBP},
        [donatedKey]: !!getStateValue('donation.made', state)
    });
}, 3000);


startApp();


function startApp() {
    var destroyed = false;

    // if `destroy` message was sent before Re:view was generated, mark current
    // state as destroyed
    chrome.runtime.onMessage.addListener(message => {
        if (message.action === 'destroy-re:view') {
            destroyed = true;
        }
    });

    Promise.all([
        findBreakpoints(document),
        getGlobalState(),
        getLocalState(),
        donation.checkDonated()
    ])
    .then(values => {
        if (destroyed) {
            // Re:view was destroyed right before data was loaded
            return;
        }

        var scrollWidth = measureScrollWidth();
        var [breakpoints, initialState, localData, donated] = values;
        if (!initialState) {
            // no initial data, show help popup
            initialState = {
                ui: {popup: UI.POPUP_HELP}
            };
        }

        console.log('got local data', localData);
        console.log('donation state', donated);

        initialState.breakpoints = breakpointsPayload(breakpoints, localData.page.selectedBP);
        initialState.pageUrl = location.href;
        initialState.donation = {
            handler: donation.handler,
            made: donated || localData[donatedKey]
        },

        resetPage();
        var subscriptions = [
            subscribe(mode => trackEvent('Mode', mode), state => getStateValue('ui.mode', state)),
            subscribe(wall => trackEvent('Wall display', wall), state => getStateValue('deviceWallPicker.display.type', state))
        ];
        var rw = reView(document.body, {initialState, urlForView, scrollWidth});
        subscriptions.push(subscribe(saveDataToStorage));
        if (donated === null) {
            setDonationMade();
        }

        if (!donated) {
            setDonationProduct();
        }

        chrome.runtime.onMessage.addListener(message => {
            switch (message.action) {
                case 'destroy-re:view':
                    if (rw) {
                        rw.destroy();
                        subscriptions.forEach(fn => fn());
                        rw = subscriptions = null;
                        location.reload();
                    }
                    break;
                case 'donate-success':
                    return dispatch({type: DONATION.MADE});
            }
        });
    });
}

function urlForView(url, type, spec) {
    if (type === 'device-wall') {
        url = proxyUrl + `?url=${encodeURIComponent(url)}&userAgent=${encodeURIComponent(spec['user-agent'] || '')}`;
    }

    return url;
}

/**
 * Hides all contents on current page to free some resources for Re:view
 */
function resetPage() {
    var elem = document.body.firstChild;
    while (elem) {
        if (elem.nodeType === 1) {
            elem.style.display = 'none';
        }
        elem = elem.nextElementSibling;
    }

    for (var i = 0; i < document.styleSheets.length; i++) {
        document.styleSheets[i].disabled = true;
    }
}

function measureScrollWidth() {
    var outer = document.createElement('div');
    var inner = document.createElement('div');

    outer.style.cssText = 'position:absolute;top:0;left:0;width:100px;height:100px;overflow:auto;padding:0;margin:0;display:block;z-index:200';
    inner.style.cssText = 'height:200px;display:block;padding:0;margin:0;';
    outer.appendChild(inner);
    document.body.appendChild(outer);
    var scrollerWidth = Math.max(0, 100 - inner.offsetWidth);
    document.body.removeChild(outer);

	return scrollerWidth;
}

function trackEvent(category, action, label) {
    chrome.runtime.sendMessage({
        action: 'track-event',
        data: {category, action, label}
    });
}

function breakpointsPayload(breakpoints, selected) {
    breakpoints = breakpoints.map(bp => ({
        id: bp.id,
        query: bp.query,
        width: bp.smallest || 200,
        label: bp.features.map(f => `${featureAliases[f] || f}: ${bp[f]}`)
    }));

    if (!breakpoints.length) {
        breakpoints.push({
            id: 'default',
            query: '<no query>',
            width: 1024,
            label: 'Default view (no breakpoints)'
        });
    }

    var items = breakpoints.reduce((out, bp) => {
        out[bp.id] = bp;
        return out;
    }, {});

    var optimized = optimalBreakpointsList(breakpoints);
    if (Array.isArray(selected) && selected.length) {
        // there are previously selected items, make sure they all match existing
        // breakpoints. If any of selected items does not exists, reset selection
        if (selected.some(id => !items[id])) {
            selected = null;
        }
    }

    if (!selected || !selected.length) {
        selected = optimized.length ? optimized : breakpoints.map(bp => bp.id);
    }

    return {items, selected, optimized};
}

function getGlobalState() {
    return new Promise(resolve => {
        storage.get(storageKey, data => resolve(data[storageKey]));
    })
    .catch(err => ({}));
}

function getLocalState() {
    return new Promise(resolve => {
        var origin = window.location.origin;
        chrome.storage.local.get([origin, donatedKey], data => resolve({
            page: data[origin] || {},
            [donatedKey]: !!data.donated
        }));
    })
    .catch(err => ({}));
}

function optimalBreakpointsList(breakpoints) {
    if (!breakpoints || breakpoints.length < 6) {
        return [];
    }

    var groups = [], group = [];
    var threshold = 50;
    var maxInGroup = 5;
    var maxItems = 5;

    breakpoints.forEach(bp => {
        if (!group.length) {
            return group.push(bp);
        }

        if (bp.width - group[group.length - 1].width <= threshold && group.length < maxInGroup) {
            return group.push(bp);
        }

        groups.push(group);
        group = [bp];
    });

    groups.push(group);

    var optimized = groups.filter(group => group.length)
    .map(group => group[(group.length / 2)|0].id);

    // keep up to `maxItems` items in optimized list
    if (optimized.length > maxItems) {
        let step = (optimized.length - 1) / maxItems;
        let reduced = [];
        for (let i = 0; i < maxItems; i++) {
            reduced.push(optimized[(i * step)|0]);
        }
        optimized = reduced.filter(Boolean);
    }

    return optimized.length !== breakpoints.length ? optimized : [];
}

function setDonationProduct() {
    donation.getProduct().then(product => {
        console.log('set product', product);
        dispatch({type: DONATION.SET_PRODUCT, product});
    });
}

function setDonationMade() {
    donation.isDonated().then(made => {
        console.log('set donation made', made);
        if (made) {
            dispatch({type: DONATION.MADE});
        }
    });
}
