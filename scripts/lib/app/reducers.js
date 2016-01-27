'use strict';

import {combineReducers} from 'redux';
import {DEVICE_WALL, USER, UI} from './action-names';

export default combineReducers({devices, presets, deviceWallPicker, ui, user});

function devices(state={}) {
    return state;
}

function presets(state={}) {
    return state;
}

function deviceWallPicker(state={}, action) {
    switch (action.type) {
        case DEVICE_WALL.SET_SELECTED:
            if (!state.display || state.display.id !== action.item.id) {
                state = {...state, display: action.item};
            }
            return state;

        case DEVICE_WALL.SET_STATE:
            return {
                ...state,
                state: action.state,
                stateData: action.data
            };

        case DEVICE_WALL.TOGGLE_VISIBILITY:
            let data = state.stateData || {};
            return {
                ...state,
                stateData: {...data, visible: !data.visible}
            };
    }

    return state;
}

function user(state={}, action) {
    switch (action.type) {
        case USER.SAVE_DEVICE:
            let devices = removeItem(state.devices || [], action.device.id);
            devices.push(action.device);
            return {...state, devices};

        case USER.REMOVE_DEVICE:
            return {
                ...state,
                devices: removeItem(state.devices || [], action.id)
            };

        case USER.SAVE_PRESET:
            let presets = removeItem(state.presets || [], action.preset.id);
            presets.push(action.preset);
            return {...state, presets};

        case USER.REMOVE_PRESET:
            return {
                ...state,
                presets: removeItem(state.presets || [], action.id)
            };
    }

    return state;
}

function ui(state={}, action) {
    switch (action.type) {
        case UI.SET_MODE:
            if (action.mode && action.mode !== state.mode) {
                state = {...state, mode: action.mode};
            }
            return state;
    }

    return state;
}

function removeItem(items, id) {
    return items.filter(item => item.id !== id);
}
