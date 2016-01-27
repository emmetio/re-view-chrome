/**
 * Display mode toggler
 */
'use strict';

import tr from 'tiny-react';
import {cl} from '../utils';
import {dispatch} from '../app';
import {UI} from '../app/action-names';

const modes = [
    {id: 'breakpoints', title: 'Breakpoints View'},
    {id: 'device-wall', title: 'Device Wall'},
];

export default tr.component({
    render(props) {
        return <ul className={cl('switcher')}>
            {modes.map(mode => <li className={cl('switcher-item', (props.mode === mode.id) && 'switcher-item_selected')} data-mode={mode.id} onclick={onClick}>
                <span className={cl('switcher-label')}>{mode.title}</span>
            </li>)}
        </ul>;
    }
});

function onClick(evt) {
    var mode = this.getAttribute('data-mode');
    if (mode) {
        dispatch({type: UI.SET_MODE, mode});
    }
}
