'use strict';

import tr from 'tiny-react';
import DeviceWallPicker from './lib/components/device-wall-picker';
import {store, subscribe, getStateValue} from './lib/app';
import fsm from './lib/app/device-wall-fsm';

const $ = (sel, ctx=document) => ctx.querySelector(sel);
const mainView = tr.render(DeviceWallPicker, makeProps(store.getState()));
subscribe(state => mainView.update( makeProps(state) ));
$('.emmet-re-view__popup-placeholder').appendChild(mainView.target);

function makeProps(state) {
    return {
        deviceList: getDeviceList(state),
        presetList: getPresetList(state),
        pickerState: state.deviceWallPicker,
        addDevice,
        addPreset,
        onDeviceFormSubmit,
        onDeviceFormReset,
        onDeviceFormInput,
        onPresetFormSubmit,
        onPresetFormReset,
        onPresetFormInput
    };
}

/**
 * Returns props for DeviceList component.
 * @param  {Object} state
 * @return {Object}
 */
function getDeviceList(state) {
    var fsmData = state.deviceWallPicker || {};
    var mode = 'pick-one', items;
    if (fsmData.state === 'editPreset') {
        let data = fsmData.stateData || [];
        mode = 'pick-many';
        items = getItems(state, 'devices', data.devices || []);
    } else {
        let selected = fsmData.display && fsmData.display.type === 'device' ? fsmData.display.id : [];
        items = getItems(state, 'devices', selected);
    }

    return {
        mode,
        items,
        onItemClick: onDeviceClick
    };
}

/**
 * Returns props for PresetList component
 * @param {Object} state
 */
function getPresetList(state) {
    var fsmData = state.deviceWallPicker || {};
    var selected = fsmData.display && fsmData.display.type === 'preset' ? fsmData.display.id : [];
    return {
        mode: 'pick-one',
        items: getItems(state, 'presets', selected),
        onItemClick: onPresetClick
    };
}

function onDeviceClick(evt) {
    evt.preventDefault();
    fsm.pickDevice(this.id);
}

function onDeviceFormSubmit(evt) {
    evt.preventDefault();
    console.log('will submit', getStateValue('deviceWallPicker.stateData'));
    fsm.submitDeviceEdit(getStateValue('deviceWallPicker.stateData'));
}

function onDeviceFormReset(evt) {
    evt.preventDefault();
    fsm.cancelDeviceEdit();
}

function onDeviceFormInput(evt) {
    var elem = evt.target;
    console.log('device input', {[elem.name]: elem.value});
    fsm.updateDeviceEditData({[elem.name]: elem.value});
}

function onPresetClick(evt) {
    evt.preventDefault();
    fsm.pickPreset(this.id);
}

function onPresetFormSubmit(evt) {
    evt.preventDefault();
    console.log('will submit', getStateValue('deviceWallPicker.stateData'));
    fsm.submitPresetEdit(getStateValue('deviceWallPicker.stateData'));
}

function onPresetFormReset(evt) {
    evt.preventDefault();
    fsm.cancelPresetEdit();
}

function onPresetFormInput(evt) {
    var elem = evt.target;
    console.log('preset input', {[elem.name]: elem.value});
    fsm.updatePresetEditData({[elem.name]: elem.value});
}

function addDevice() {
    fsm.addDevice();
}

function addPreset() {
    fsm.addPreset();
}

/**
 * Returns concatenated list of unique user and default items for given `key`
 * in `state` object, optionally marking items as selected which IDs are
 * in `selected` argument.
 * @param  {Object} state
 * @param  {String} key
 * @param  {Array} selected
 * @return {Array}
 */
function getItems(state, key, selected) {
    var lookup = {};
    var userData = state.user || {};
    if (!Array.isArray(selected)) {
        selected = [selected];
    }

    return [].concat(userData[key] || [], state[key] || [])
    // keep unique items only
    .filter(item => item.id in lookup ? false : lookup[item.id] = true)
    // mark selected items
    .map(item => (selected.indexOf(item.id) === -1 ? item : {...item, selected: true}))
    .sort(sortByTitle);
}

function sortByTitle(a, b) {
    return a.title === b.title ? 0 : (a.title > b.title ? 1 : -1);
}
