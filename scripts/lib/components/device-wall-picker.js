/**
 * A Device Wall picker component
 */
'use strict';
import tr from 'tiny-react';
import DeviceList from './device-list';
import DeviceForm from './device-form';
import PresetList from './preset-list';
import PresetForm from './preset-form';
import {cl} from '../utils';

const EMPTY_OBJECT = {};

export default tr.component({
    render(props={}) {
        var state = props.pickerState;
        var stateName = state.state;
        var deviceEditMode = stateName === 'editDevice';
        var presetEditMode = stateName === 'editPreset';
        var deviceData = EMPTY_OBJECT, presetData = EMPTY_OBJECT;

        if (presetEditMode) {
            let lookup = itemsLookup(props.deviceList.items);
            presetData = {
                ...state.stateData,
                devices: (state.stateData.devices || []).map(id => lookup[id])
            };
        } else if (deviceEditMode) {
            deviceData = state.stateData;
        }

        return <div className={cl('popup', 'devices')}>
            <section className={cl('section')}>
                <h2 className={cl('section-title')}>Devices <i className={cl('icon-add', deviceEditMode && 'icon-add_active')} onclick={props.addDevice}></i></h2>
                <div className={cl('section-content')}>
                    <DeviceList {...props.deviceList} hidden={deviceEditMode} />
                    <DeviceForm {...deviceData} visible={deviceEditMode} onsubmit={props.onDeviceFormSubmit} onreset={props.onDeviceFormReset} oninput={props.onDeviceFormInput} />
                </div>
            </section>
            <section className={cl('section')}>
                <h2 className={cl('section-title')}>Presets <i className={cl('icon-add', presetEditMode && 'icon-add_active')} onclick={props.addPreset}></i></h2>
                <div className={cl('section-content')}>
                    <PresetList {...props.presetList} hidden={presetEditMode} />
                    <PresetForm {...presetData} visible={presetEditMode} onsubmit={props.onPresetFormSubmit} onreset={props.onPresetFormReset} oninput={props.onPresetFormInput} />
                </div>
            </section>
        </div>
    }
});

function itemsLookup(items) {
    return (items || []).reduce((lookup, item) => {
        lookup[item.id] = item;
        return lookup;
    }, {});
}
