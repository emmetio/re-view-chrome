/**
 * Toggles Device Wall popup display
 */
'use strict';

import tr from 'tiny-react';
import {cl} from '../utils';
import {dispatch} from '../app';
import {DEVICE_WALL} from '../app/action-names';

export default tr.component({
    render(props) {
        return <div className={cl('picker')} onclick={togglePopup}>
            <span className={cl('switcher-label')}>Something</span>
        </div>;
    }
});

function togglePopup() {
    dispatch({type: DEVICE_WALL.TOGGLE_VISIBILITY});
}
