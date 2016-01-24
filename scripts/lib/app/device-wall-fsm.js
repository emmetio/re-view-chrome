/**
 * A state machine for Device Wall picker popup
 */
'use strict';

'use strict';
import FSM from 'state-machine';
import uuid from 'uuid';
import {dispatch, subscribe, getStateValue} from './';
import {DEVICE_WALL, USER} from './action-names';

const fsm = new FSM({
    initial: {
        // Devices
        pickDevice(id) {
            dispatch({
                type: DEVICE_WALL.SET_SELECTED,
                item: {id, type: 'device'}
            });
        },
        addDevice() {
            dispatch({
                type: DEVICE_WALL.SET_STATE,
                state: 'editDevice',
                data: {id: uuid.v1()}
            });
        },
        editDevice(id) {
            var device = findUserDevice(id);
            if (device) {
                dispatch({
                    type: DEVICE_WALL.SET_STATE,
                    state: 'editDevice',
                    data: device
                });
            }
        },
        removeDevice(id) {
            dispatch({
                type: USER.REMOVE_DEVICE,
                id
            });
        },

        // Presets
        pickPreset(id) {
            dispatch({
                type: DEVICE_WALL.SET_SELECTED,
                item: {id, type: 'preset'}
            });
        },
        addPreset() {
            dispatch({
                type: DEVICE_WALL.SET_STATE,
                state: 'editPreset',
                data: {id: uuid.v1()}
            });
        },
        editPreset(id) {
            var preset = findUserPreset(id);
            if (preset) {
                dispatch({
                    type: DEVICE_WALL.SET_STATE,
                    state: 'editPreset',
                    data: preset
                });
            }
        },
        removePreset(id) {
            dispatch({
                type: USER.REMOVE_PRESET,
                id
            });
        },
    },
    editDevice: {
        update: updateCurrentStateData,
        submit() {
            // TODO validate device data here?
            dispatch({
                type: USER.SAVE_DEVICE,
                device: getStateValue('deviceWallPicker.stateData')
            });
            goToInitialState();
        },
        cancel: goToInitialState
    },
    editPreset: {
        pickDevice(id) {
            var preset = getStateValue('deviceWallPicker.stateData');
            var devices = preset.devices ? preset.devices.slice(0) : [];
            var ix = devices.indexOf(id);
            ix === -1 ? devices.push(id) : devices.splice(ix, 1);
            this.handle('update', {devices});
        },
        update: updateCurrentStateData,
        submit(preset) {
            // TODO validate input here?
            dispatch({
                type: USER.SAVE_PRESET,
                preset
            });
            goToInitialState();
        },
        cancel: goToInitialState
    }
}, {
    pickDevice(id) {
        this.handle('pickDevice', id);
    },
    addDevice() {
        this.handle('addDevice');
    },
    editDevice(id) {
        this.handle('editDevice', id);
    },
    removeDevice(id) {
        this.handle('removeDevice', id);
    },
    submitDevice(device) {
        this.handle('submit', device);
    },
    cancelDeviceEdit() {
        this.handle('cancel');
    },

    pickPreset(id) {
        this.handle('pickPreset', id);
    },
    addPreset() {
        this.handle('addPreset');
    },
    editPreset(id) {
        this.handle('editPreset', id);
    },
    removePreset(id) {
        this.handle('removePreset', id);
    },
    submitPreset(preset) {
        this.handle('submit', preset);
    },
    cancelPresetEdit() {
        this.handle('cancel');
    },
});

subscribe(() => fsm.transition(getStateValue('deviceWallPicker.state')));

export default fsm;

function goToInitialState() {
    dispatch({
        type: DEVICE_WALL.SET_STATE,
        state: 'initial'
    });
}

function updateCurrentStateData(data={}) {
    var curData = getStateValue('deviceWallPicker.stateData') || {};
    dispatch({
        type: DEVICE_WALL.SET_STATE,
        state: this.current,
        data: {...curData, ...data}
    });
}

function findUserDevice(id) {
    var items = getStateValue('user.devices') || [];
    return items.filter(item => item.id === id)[0];
}

function findUserPreset(id) {
    var items = getStateValue('user.presets') || [];
    return items.filter(item => item.id === id)[0];
}
