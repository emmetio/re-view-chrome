/**
 * Preset add/edit form
 */
'use strict';
import tr from 'tiny-react';
import {cl} from './utils';
import {getStateValue, deviceWallFSM as fsm} from '../app';

const fid = name => `preset-form.${name}`;

export default tr.component({
    render(props) {
        props = props || {};
        let devicesElem;
        if (!props.devices || !props.devices.length) {
            devicesElem = <span className={cl('form-no-devices')}>No selected devices</span>;
        } else {
            devicesElem = <ul className={cl('form-device-list')}>
                {props.devices.map(d => <li className={cl('form-device-list-item')}>{d.title} 3234</li>)}
            </ul>
        }

        return <form className={cl('form', props.visible && 'form_visible')}
            onsubmit={onSubmit} onreset={onReset}  oninput={onInput}>
            <input type="hidden" name="id" value={props.id} />
            <div className={cl('form-row')}>
                <label htmlFor={fid('title')} className={cl('form-label')}>Preset title</label>
                <input type="text" name="title" id={fid('title')} value={props.title} required />
            </div>

            <div className={cl('form-row')}>
                <label className={cl('form-label')}>Pick devices on the left</label>
                {devicesElem}
            </div>

            <div className={cl('form-controls')}>
                <input type="submit" value="Save" className={cl('button')} />
                <input type="reset" value="Cancel" className={cl('button')} />
            </div>
        </form>
    }
});

function onSubmit(evt) {
    evt.preventDefault();
    fsm.submitPresetEdit(getStateValue('deviceWallPicker.stateData'));
}

function onReset(evt) {
    evt.preventDefault();
    fsm.cancelPresetEdit();
}

function onInput(evt) {
    var elem = evt.target;
    fsm.updatePresetEditData({[elem.name]: elem.value});
}
