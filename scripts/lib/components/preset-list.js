/**
 * Preset list component
 */
import tr from 'tiny-react';
import List from './list';

export default tr.component({
    render(props) {
        var items = (props.items || []).map(item => ({
            ...item,
            content: item.title
        }));

        return <List mode={props.mode} items={items} onItemClick={props.onItemClick} />;
    }
});
