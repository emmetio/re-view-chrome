/**
 * Utility functions
 */
'use strict';

/**
 * Generates prefixed class names
 * @param  {Array|String} ...names
 * @return {String}
 */
export function cl(...names) {
    return names.filter(Boolean).map(n => `emmet-re-view__${n}`).join(' ');
}
