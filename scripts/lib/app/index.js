'use strict';

import {createStore, applyMiddleware} from 'redux';
import createLogger from 'redux-logger';
import reducers from './reducers';
import * as actions from './action-names';
import devices from './devices';
import presets from './presets';

const logger = createLogger();
const createStoreWithMiddleware = applyMiddleware(logger)(createStore);

export const store = createStoreWithMiddleware(reducers, {
    devices: devices.sort(sortByTitle),
    presets: presets.sort(sortByTitle),
    deviceWallPicker: {
        state: 'initial',
        stateData: {},
        display: {
            type: 'preset',
            id: 'apple-phones'
        }
    },
    user: {
        devices: [],
        presets: []
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

function sortByTitle(a, b) {
    return a.title === b.title ? 0 : (a.title > b.title ? 1 : -1);
}
