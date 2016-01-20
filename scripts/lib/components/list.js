/**
 * Base list component
 */
'use strict';

import tr from 'tiny-react';

export default tr.component({
    render(props) {
        var items = props.items || [];
        var inputType = 'checkbox';
        return <ul className="emmet-re-view__list" data-mode={props.mode}>
            {items.map(item => {
                let selected = item.selected;
                return <li className="emmet-re-view__list-item">
                    <input type={inputType} name={props.name} id={item.id} className="emmet-re-view__list-item-input" value={item.id} checked={selected} />
                    <label htmlFor={item.id} className="emmet-re-view__list-item-label">
                        <span className="emmet-re-view__list-item-label-inner">{item.content}</span>
                    </label>
                </li>}
            )}
        </ul>;
    }
});
