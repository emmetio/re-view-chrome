'use strict';

import {combineReducers} from 'redux';
import * as actions from './action-names';

const defaultDeviceState = {items: []};

export default combineReducers({
    devices
});

function devices(state=defaultDeviceState, action) {
    switch (action.type) {
        case actions.ADD_DEVICE:
            return addDevice(state, action.device);
        case actions.REMOVE_DEVICE:
            return removeDevice(state, action.id);
        case actions.SELECT_DEVICE:
            return selectDevice(state, action.id);
        case actions.TOGGLE_DEVICE_SELECTION:
            return toggleDeviceSelection(state, action.id);
        case actions.CLEAR_DEVICE_SELECTION:
            return clearDeviceSelection(state);
        case actions.SWITCH_DEVICE_LIST_MODE:
            return switchDeviceListMode(state, action.mode);
    }

    return state;
}

function addDevice(state, device) {
    if (!Array.isArray(device)) {
        device = [device];
    }

    device = device.map(d => ({
        ...d,
        selected: false,
        userDefined: true
    }));

    return {
        ...state,
        items: state.items.concat(device).sort(sortDevices)
    };
}

function removeDevice(state, id) {
    // remove only user-defined devices
    return {
        ...state,
        items: state.items.filter(device => !(device.id === id && device.userDefined))
    };
}

function selectDevice(state, id) {
    let items = state.items;
    if (state.mode !== 'pick-many') {
        items = clearSelection(items);
    }

    items = items.map(item => {
        if (item.id === id) {
            item = {...item, selected: true};
        }
        return item;
    });

    return {...state, items};
}

function switchDeviceListMode(state, mode='pick-single') {
    if (state.mode === mode) {
        return state;
    }

    // reset selection from all items as well
    return {...state, mode, items: clearSelection(state.items)};
}

function toggleDeviceSelection(state, id) {
    let device = state.items.filter(item => item.id === id)[0];
    if (!device) {
        return state;
    }

    // if device is not selected, use existing reducer that will
    // update state according to current edit mode
    if (!device.selected) {
        return selectDevice(state, device.id);
    }

    // otherwise, simply remove selection
    return {
        ...state,
        items: state.items.map(item => {
            if (item.id === id) {
                item = {...item, selected: false}
            }
            return item;
        })
    };
}

function clearDeviceSelection(state) {
    return {...state, items: clearSelection(state.items)};
}

function sortDevices(a, b) {
    if (a.title === b.title) {
        return 0;
    }

    return a.title > b.title ? 1 : -1;
}

function clearSelection(items) {
    return items.map(item => item.selected ? {...item, selected: false} : item);
}
