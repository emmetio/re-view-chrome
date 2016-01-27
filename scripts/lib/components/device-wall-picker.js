/**
 * A Device Wall picker component
 */
'use strict';
import tr from 'tiny-react';
import DeviceList from './device-list';
import DeviceForm from './device-form';
import PresetList from './preset-list';
import PresetForm from './preset-form';
import {cl} from './utils';
import {getItems, deviceWallFSM as fsm} from '../app';

const EMPTY_OBJECT = {};

export default tr.component({
    render(props={}) {
        var state = props.deviceWallPicker;
        var stateName = state.state;
        var deviceEditMode = stateName === 'editDevice';
        var presetEditMode = stateName === 'editPreset';
        var deviceData = EMPTY_OBJECT, presetData = EMPTY_OBJECT;
        var deviceList = getDeviceList(props);
        var presetList = getPresetList(props);

        if (presetEditMode) {
            let lookup = itemsLookup(deviceList.items);
            presetData = {
                ...state.stateData,
                devices: (state.stateData.devices || []).map(id => lookup[id])
            };
        } else if (deviceEditMode) {
            deviceData = state.stateData;
        }

        return <div className={cl('popup', 'devices')}>
            <section className={cl('section')}>
                <h2 className={cl('section-title')}>Devices <i className={cl('icon-add', deviceEditMode && 'icon-add_active')}  onclick={addDevice}></i></h2>
                <div className={cl('section-content')}>
                    <DeviceList {...deviceList} hidden={deviceEditMode} />
                    <DeviceForm {...deviceData} visible={deviceEditMode} />
                </div>
            </section>
            <section className={cl('section')}>
                <h2 className={cl('section-title')}>Presets <i className={cl('icon-add', presetEditMode && 'icon-add_active')} onclick={addPreset}></i></h2>
                <div className={cl('section-content')}>
                    <PresetList {...presetList} hidden={presetEditMode} />
                    <PresetForm {...presetData} visible={presetEditMode} />
                </div>
            </section>
        </div>
    }
});

function addDevice() {
    fsm.addDevice();
}

function addPreset() {
    fsm.addPreset();
}

/**
 * Returns props for DeviceList component.
 * @param  {Object} state
 * @return {Object}
 */
function getDeviceList(state) {
    var fsmData = state.deviceWallPicker || {};
    var mode = 'pick-one';
    var items = getItems('devices', state).map(item => ({
        ...item,
        info: `${item.width}×${item.height}`
    }));

    var selected;
    if (fsmData.state === 'editPreset') {
        mode = 'pick-many';
        selected = fsmData.stateData && fsmData.stateData.devices;
    } else {
        selected = fsmData.display && fsmData.display.type === 'device' && fsmData.display.id;
    }

    return {
        mode,
        items: markSelected(items, selected)
    };
}

/**
 * Returns props for PresetList component
 * @param {Object} state
 */
function getPresetList(state) {
    var fsmData = state.deviceWallPicker || {};
    var selected = fsmData.display && fsmData.display.type === 'preset' && fsmData.display.id;
    return {
        items: markSelected(getItems('presets', state), selected)
    };
}

function markSelected(items, selected) {
    if (!selected) {
        return items;
    }

    selected = Array.isArray(selected) ? selected : [selected];
    return items.map(item => (selected.indexOf(item.id) === -1 ? item : {...item, selected: true}));
}

function itemsLookup(items) {
    return (items || []).reduce((lookup, item) => {
        lookup[item.id] = item;
        return lookup;
    }, {});
}
