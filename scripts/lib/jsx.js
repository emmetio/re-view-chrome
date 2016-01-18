/**
 * Babel JSX element wrapper for virtual-dom hyperscript
 */
'use strict';
import h from 'virtual-dom/h';

export default function(name, props, ...children) {
    if (children.length === 1 && Array.isArray(children[0])) {
        children = children[0];
    }

    var attributes = {};
    var reData = /^data\-/;
    props = Object.keys(props).reduce((r, key) => {
        if (reData.test(key)) {
            attributes[key] = props[key];
        } else {
            r[key] = props[key];
        }
        return r;
    }, {});
    props.attributes = attributes;

    return h(name, props, children);
};
