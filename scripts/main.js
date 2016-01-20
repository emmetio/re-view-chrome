'use strict';

import tr from 'tiny-react';
import DeviceList from './lib/components/device-list';
import * as app from './lib/app';

const $ = (sel, ctx=document) => ctx.querySelector(sel);
const deviceList = tr.render(DeviceList, app.store.getState().devices);
$('.emmet-re-view__section-content').appendChild(deviceList.target);

// $('.emmet-re-view__button').addEventListener('click', evt => {
//     deviceList.multiple = !deviceList.multiple;
// });
