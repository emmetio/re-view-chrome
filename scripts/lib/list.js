/**
 * Simple list manager and renderer
 */
'use strict';

import vdom from 'virtual-dom';
import main from './main-loop';
import jsx from './jsx';

export default function(state) {
    return main(state || {}, render, vdom);
};

function render(state={}) {
    var items = state.items || [];
    // var inputType = state.mode === 'pick-many' ? 'checkbox' : 'radio';
    var inputType = 'checkbox';
    console.log('mode', state.mode);
    return <ul className="emmet-re-view__list" data-mode={state.mode}>
        {items.map(item => {
            let itemId = state.name + item.id;
            return <li className="emmet-re-view__list-item">
                <input type={inputType} name={state.name} id={itemId} className="emmet-re-view__list-item-input" value={item.id} />
                <label htmlFor={itemId} className="emmet-re-view__list-item-label">
                    <span className="emmet-re-view__list-item-label-inner">{item.content}</span>
                </label>
            </li>}
        )}
    </ul>;
}
