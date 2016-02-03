'use strict';
import {default as reView, subscribe, findBreakpoints, UI, APP} from 'livestyle-re-view';
import {throttle} from './lib/utils';

const storage = chrome.storage.sync;
const storageKey = 're-view2';
const destroyMesageName = 'destroy-re:view';
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
}, 5000);


startApp();


function startApp() {
    var destroyed = false;

    // if `destroy` message was sent before Re:view was generated, mark current
    // state as destroyed
    chrome.runtime.onMessage.addListener(message => {
        if (message === destroyMesageName) {
            destroyed = true;
        }
    });

    findBreakpoints(document)
    .then(breakpoints => {
        console.log('got breakpoints', breakpoints);
        storage.get(storageKey, data => {
            console.log('loaded data', data);
            if (destroyed) {
                // Re:view was destroyed right before data was loaded
                return;
            }

            var initialState = data[storageKey];
            if (!initialState) {
                // no initial data, show help popup
                initialState = {
                    ui: {popup: UI.POPUP_HELP}
                };
            }

            initialState.breakpoints = breakpoints.map(bp => ({
                width: bp.smallest || 200,
                label: bp.features.map(f => `${featureAliases[f] || f}: ${bp[f]}`)
            }));

            if (!initialState.breakpoints.length) {
                initialState.breakpoints.push({
                    width: 1024,
                    label: 'Default view (no breakpoints)'
                });
            }

            initialState.pageUrl = location.href;

            var rw = reView(document.body, {initialState, urlForView});
            var unsubscribeSave = subscribe(saveDataToStorage);

            chrome.runtime.onMessage.addListener(message => {
                if (message === destroyMesageName && rw) {
                    rw.destroy();
                    unsubscribeSave();
                    rw = unsubscribeSave = null;
                    location.reload();
                }
            });
        });
    });
}

function urlForView(url, type, spec) {
    if (type === 'device-wall') {
        url = proxyUrl + `?url=${encodeURIComponent(url)}&userAgent=${encodeURIComponent(spec['user-agent'] || '')}`;
    }

    return url;
}