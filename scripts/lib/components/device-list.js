/**
 * Device list component
 */
import tr from 'tiny-react';
import List from './list';

export default tr.component({
    render(props) {
        console.log('device list render', props);
        var items = (props.items || []).map(item => ({
            ...item,
            content: item.title,
            info: `${item.width}×${item.height}`
        }));

        return <List mode={props.mode} items={items} />;
    },
    didMount(node) {
        console.log('device list mounted', node);
    }
});
