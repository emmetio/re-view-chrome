'use strict';

import {createStore, applyMiddleware} from 'redux';
import createLogger from 'redux-logger';
import reducers from './reducers';
import * as actions from './action-names';
import devices from './devices';

const logger = createLogger();
const createStoreWithMiddleware = applyMiddleware(logger)(createStore);
export const store = createStoreWithMiddleware(reducers, {
    devices: {
        mode: 'pick-single',
        items: devices.sort((a, b) => a.title === b.title ? 0 : (a.title > b.title ? 1 : -1))
    }
});

export function addDevice(device) {
    store.dispatch({
        type: actions.ADD_DEVICE,
        device
    });
}

export function removeDevice(id) {
    store.dispatch({
        type: actions.REMOVE_DEVICE,
        id
    });
}

export function selectDevice(id) {
    store.dispatch({
        type: actions.SELECT_DEVICE,
        id
    });
}

export function toggleDeviceSelection(id) {
    store.dispatch({
        type: actions.TOGGLE_DEVICE_SELECTION,
        id
    });
}

export function clearDeviceSelection() {
    store.dispatch({type: actions.SELECT_DEVICE});
}

export function switchDeviceListMode(mode) {
    store.dispatch({
        type: actions.SWITCH_DEVICE_LIST_MODE,
        mode
    });
}

// TODO load user-defined devices
