'use strict';

import tr from 'tiny-react';
import UI from './lib/components/ui';
import {store, subscribe} from './lib/app';

const mainView = tr.render(UI, store.getState());
subscribe(state => mainView.update(state));
document.querySelector('.emmet-re-view').appendChild(mainView.target);
