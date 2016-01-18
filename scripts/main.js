'use strict';

import list from './lib/list';
import devices from './lib/devices-test';

const $ = (sel, ctx=document) => ctx.querySelector(sel);

var state = {
    name: 'device',
    mode: 'normal',
    items: devices.map((content, id) => ({content, id}))
};

var component = list(state);
$('.emmet-re-view__section-content').appendChild(component.target);
$('.emmet-re-view__button').addEventListener('click', evt => {
    state.mode = state.mode === 'pick-many' ? 'normal' : 'pick-many';
    console.log('click', state);
    component.update(state);
});
