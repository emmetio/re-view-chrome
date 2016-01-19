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
    var inputType = 'checkbox';
    return <ul className="emmet-re-view__list" data-mode={state.mode}>
        {items.map(item => {
            let selected = item.selected;
            return <li className="emmet-re-view__list-item">
                <input type={inputType} name={state.name} id={item.id} className="emmet-re-view__list-item-input" value={item.id} checked={selected} />
                <label htmlFor={item.id} className="emmet-re-view__list-item-label">
                    <span className="emmet-re-view__list-item-label-inner">{item.content}</span>
                </label>
            </li>}
        )}
    </ul>;
}
