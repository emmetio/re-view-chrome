/**
 * Main Re:View UI component
 */
'use strict';

import tr from 'tiny-react';
import DeviceWallControl from './device-wall-control';
import DeviceWallPopup from './device-wall-picker';
import ModeToggler from './mode-toggler';
import {cl} from './utils';

export default tr.component({
    render(props) {
        return <div className={cl('header')}>
            <h1 className={cl('logo')}>Re:view <span className={cl('logo-version')}>2</span></h1>

            <div className={cl('header-content')}>
                <ModeToggler mode={props.ui.mode} />
                <DeviceWallControl {...props} />
                <DeviceWallPopup {...props} />
            </div>

            <div className={cl('header-icons')}>
                <i className={cl('icon', 'icon_settings')}></i>
                <i className={cl('icon', 'icon_help')}></i>
            </div>
        </div>;
    }
});
