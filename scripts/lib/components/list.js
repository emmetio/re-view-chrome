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
                return <li id={item.id} className="emmet-re-view__list-item" onclick={props.onItemClick}>
                    <input type={inputType} name={props.name}
                        id={'fld-' + item.id}
                        className="emmet-re-view__list-item-input"
                        value={item.id} checked={item.selected} />
                    <label htmlFor={'fld-' + item.id} className="emmet-re-view__list-item-label">
                        <span className="emmet-re-view__list-item-label-inner">{item.content}</span>
                    </label>
                </li>}
            )}
        </ul>;
    }
});
