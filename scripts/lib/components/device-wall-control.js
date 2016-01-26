/**
 * Toggles Device Wall popup display
 */
'use strict';

import tr from 'tiny-react';
import {cl} from '../utils';

export default tr.component({
    render(props) {
        return <div className={cl('picker')} onclick={props.togglePopup}>
            <span className={cl('switcher-label')}>{props.selectedDeviceWallItem.title}</span>
        </div>;
    }
});
