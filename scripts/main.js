'use strict';

import list from './lib/list';
import * as app from './lib/app';

const $ = (sel, ctx=document) => ctx.querySelector(sel);

var component = list();
const renderDevices = () => renderDeviceList(app.store.getState(), component);

renderDevices();
app.store.subscribe(renderDevices);

component.target.addEventListener('click', evt => {
    if (evt.target.nodeName === 'INPUT') {
        evt.preventDefault();
        app.selectDevice(evt.target.value);
    }
});

$('.emmet-re-view__section-content').appendChild(component.target);
$('.emmet-re-view__button').addEventListener('click', evt => {
    var state = app.store.getState();
    var mode = state.devices.mode === 'pick-many' ? 'pick-single' : 'pick-many';
    app.switchDeviceListMode(mode);
});

function renderDeviceList(state, component) {
    var devices = {...state.devices};
    devices.items = devices.items.map(item => ({
        ...item,
        content: item.title,
        info: `${item.width}×${item.height}`
    }));
    component.update(devices);
}
