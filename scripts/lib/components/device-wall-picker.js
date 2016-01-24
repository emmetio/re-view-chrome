/**
 * A Device Wall picker component
 */
'use strict';
import tr from 'tiny-react';
import DeviceList from './device-list';
import PresetList from './preset-list';

export default tr.component({
    render(props) {
        return <div className={cl('popup', 'devices')}>
            <section className={cl('section')}>
                <h2 className={cl('section-title')}>Devices</h2>
                <div className={cl('section-content')}>
                    <DeviceList {...props.deviceList} />
                </div>
                <footer className={cl('section-footer')}>
                    <button className={cl('button')} onclick={props.addDevice}>Add device</button>
                </footer>
            </section>
            <section className={cl('section')}>
                <h2 className={cl('section-title')}>Presets</h2>
                <div className={cl('section-content')}>
                    <PresetList {...props.presetList} />
                </div>
                <footer className={cl('section-footer')}>
                    <button className={cl('button')} onclick={props.addPreset}>Add preset</button>
                </footer>
            </section>
        </div>
    }
});

function cl(...names) {
    return names.filter(Boolean).map(n => `emmet-re-view__${n}`).join(' ');
}
