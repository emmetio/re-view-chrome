/**
 * Base list component
 */
'use strict';

import tr from 'tiny-react';
import {cl} from './utils';

export default tr.component({
    render(props) {
        var items = props.items || [];
        return <ul className={cl('list', props.hidden && 'list_hidden')} data-mode={props.mode}>
            {items.map(item => {
                let controls = item.editable && (<span className={cl('list-item-controls')}>
                    <i className={cl('list-item-control', 'list-item-control_edit')} data-action={'edit:' + item.id} onclick={props.onItemEdit}></i>
                    <i className={cl('list-item-control', 'list-item-control_remove')} data-action={'remove:' + item.id} onclick={props.onItemEdit}></i>
                </span>);

                return <li id={item.id} className={cl('list-item', controls && 'list-item_with-controls', item.userDefined && 'list-item_user-defined')} onclick={props.onItemClick}>
                    <input type="checkbox" name={props.name}
                        id={'fld-' + item.id}
                        className={cl('list-item-input')}
                        value={item.id} checked={item.selected} />
                    <label htmlFor={'fld-' + item.id} className={cl('list-item-label')}>
                        <span className={cl('list-item-label-inner')}>{item.title}</span>
                        {item.info && <span className={cl('list-item-info')}>{item.info}</span>}
                    </label>
                    {controls || undefined}
                </li>}
            )}
        </ul>;
    }
});
