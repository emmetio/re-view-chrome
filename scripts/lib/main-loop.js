/**
 * Dependency-free copy of `main-loop` module:
 * https://www.npmjs.com/package/main-loop
 */
'use strict';

export default function(initialState, view, opts={}) {
	var currentState = null;
	var create = opts.create;
	var diff = opts.diff;
	var patch = opts.patch;
	var redrawScheduled = false;

	var tree = opts.initialTree || view(initialState);
	console.log('rendered', tree);
	var target = opts.target || create(tree, opts);
	var inRenderingTransaction = false;

	function update(state) {
		if (inRenderingTransaction) {
			let err = new Error('Unexpected update occurred in loop.\n We are currently rendering a view, you can’t change state right now.');
			err.code = 'EINVALIDUPDATE';
			err.diff = state._diff;
			throw err;
		}

		if (currentState === null && !redrawScheduled) {
			redrawScheduled = true;
			requestAnimationFrame(redraw);
		}

		currentState = state;
		loop.state = state;
	}

	function redraw() {
		redrawScheduled = false;
		if (currentState === null) {
			return;
		}

		inRenderingTransaction = true;
		var newTree = view(currentState);

		if (opts.createOnly) {
			inRenderingTransaction = false;
			create(newTree, opts);
		} else {
			var patches = diff(tree, newTree, opts);
			inRenderingTransaction = false;
			target = patch(target, patches, opts);
		}

		tree = newTree;
		currentState = null;
	}

	var loop = {state: initialState, target, update};
	return loop;
}
