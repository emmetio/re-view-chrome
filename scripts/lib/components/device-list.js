/**
 * Device list component
 */
import tr from 'tiny-react';
import List from './list';

export default tr.component({
    render(props) {
        var items = (props.items || []).map(item => ({
            ...item,
            content: item.title,
            info: `${item.width}×${item.height}`
        }));

        return <List {...props} items={items} />;
    }
});
