/**
 * Display mode toggler
 */
'use strict';

import tr from 'tiny-react';
import {cl} from '../utils';

const modes = [
    {id: 'breakpoints', title: 'Breakpoints View'},
    {id: 'device-wall', title: 'Device Wall'},
];

export default tr.component({
    render(props) {
        return <ul className={cl('switcher')}>
            {modes.map(item => <li className={cl('switcher-item', (props.mode === mode.id) && 'switcher-item_selected')} onclick={props.toggleMode}>
                <span className={cl('switcher-label')}>{mode.title}</span>
            </li>)}
        </ul>;
    }
});
