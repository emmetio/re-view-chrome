'use strict';

import {createStore, applyMiddleware} from 'redux';
import createLogger from 'redux-logger';
import reducers from './reducers';
import * as actions from './action-names';
import devices from './devices';
import presets from './presets';
import deviceWallFsmFactory from './device-wall-fsm';

const logger = createLogger();
const createStoreWithMiddleware = applyMiddleware(logger)(createStore);

export const store = createStoreWithMiddleware(reducers, {
    devices: devices.sort(sortByTitle),
    presets: presets.sort(sortByTitle),
    ui: {
        mode: 'breakpoints'
    },
    deviceWallPicker: {
        state: 'initial',
        stateData: {},
        visible: true,
        display: {
            type: 'preset',
            id: 'apple-phones'
        }
    },
    user: {
        devices: [{
            "id": "942ea870-c47d-11e5-b11f-03099e8ba412",
            "title": "AAA my dev",
            "width": "200",
            "height": "300"
        }],
        presets: [{
            "id": "d2ee7d00-c479-11e5-abe8-abdaf6488318",
            "title": "Sample",
            "devices": [
                "apple-ipad",
                "amazon-kindle-fire-hdx-8-9"
            ]
        }]
    }
});

export function dispatch(data) {
    return store.dispatch(data);
}

export function subscribe(onChange, select) {
    let currentState;
    let handler = () => {
        let nextState = store.getState();
        if (typeof select === 'function') {
            nextState = select(nextState);
        }
        if (nextState !== currentState) {
            currentState = nextState;
            onChange(currentState);
        }
    };

    return store.subscribe(handler);
}

export function getStateValue(key='') {
    return key.split('.').reduce((state, part) => {
        return state != null ? state[part] : state;
    }, store.getState());
}

export const deviceWallFSM = deviceWallFsmFactory(dispatch, getStateValue);
subscribe(() => deviceWallFSM.transition(getStateValue('deviceWallPicker.state')));

/**
 * Returns concatenated list of unique user and default items for given `key`
 * in `state` object.
 * @param  {String} key
 * @param  {Object} state
 * @return {Array}
 */
export function getItems(key, state=store.getState()) {
    var lookup = {};
    var userData = state.user || {};
    var userItems = (userData[key] || []).map(item => ({
        ...item,
        userDefined: true,
        editable: true
    }));

    return [].concat(userItems, state[key] || [])
    // keep unique items only
    .filter(item => item.id in lookup ? false : lookup[item.id] = true)
    .sort(sortByTitle);
}

function sortByTitle(a, b) {
    return a.title === b.title ? 0 : (a.title > b.title ? 1 : -1);
}
