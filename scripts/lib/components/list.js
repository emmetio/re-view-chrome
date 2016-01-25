/**
 * Base list component
 */
'use strict';

import tr from 'tiny-react';
import {cl} from '../utils';

export default tr.component({
    render(props) {
        var items = props.items || [];
        var inputType = 'checkbox';
        return <ul className={cl('list', props.hidden && 'list_hidden')} data-mode={props.mode}>
            {items.map(item => {
                return <li id={item.id} className={cl('list-item')} onclick={props.onItemClick}>
                    <input type={inputType} name={props.name}
                        id={'fld-' + item.id}
                        className={cl('list-item-input')}
                        value={item.id} checked={item.selected} />
                    <label htmlFor={'fld-' + item.id} className={cl('list-item-label')}>
                        <span className={cl('list-item-label-inner')}>{item.content}</span>
                    </label>
                </li>}
            )}
        </ul>;
    }
});
