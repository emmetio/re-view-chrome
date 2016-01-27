/**
 * Device list component
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
    fsm.pickDevice(this.id);
}

function onEdit(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    var data = parseItemAction(evt.target);
    if (data.action === 'edit') {
        fsm.editDevice(data.id);
    } else if (data.action === 'remove') {
        fsm.removeDevice(data.id);
    }
}

function parseItemAction(data) {
    if (typeof data !== 'string' && 'nodeType' in data) {
        data = data.getAttribute('data-action');
    }
    var [action, id] = (data || '').split(':');
    return {action, id};
}
