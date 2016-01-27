/**
 * Preset list component
 */
import tr from 'tiny-react';
import List from './list';
import {getStateValue, deviceWallFSM as fsm} from '../app';

export default tr.component({
    render(props) {
        return <List {...props} onItemEdit={onEdit} onItemClick={onClick} />;
    }
});

function onClick(evt) {
    evt.preventDefault();
    fsm.pickPreset(this.id);
}

function onEdit(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    var data = parseItemAction(evt.target);
    if (data.action === 'edit') {
        fsm.editPreset(data.id);
    } else if (data.action === 'remove') {
        fsm.removePreset(data.id);
    }
}

function parseItemAction(data) {
    if (typeof data !== 'string' && 'nodeType' in data) {
        data = data.getAttribute('data-action');
    }
    var [action, id] = (data || '').split(':');
    return {action, id};
}
