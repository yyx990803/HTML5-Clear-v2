var C = {

	debug: window.location.hash.replace('#','') === 'debug',

	// dom elements
	$wrapper: 		$('#wrapper'),
	$log: 			$('#log'),

	// states
	states: {
		MENU: 		0,
		LISTS: 		1,
		TODOS: 		2,
		EDITING: 	3
	},

	ITEM_HEIGHT: 62,

	init: function () {

		C.start = Date.now();

		// init some components
		C.client.init();
		C.db.init(C.debug);
		C.touch.init();
		C.listCollection.init();

		// restore state
		var data = C.db.data,
			state = data.state,
			lists = data.items,
			i = lists.length;

		switch (state.view) {

			case C.states.MENU:
				C.log('App: init at menu.');
				C.currentCollection = C.menu;
				break;

			case C.states.LISTS:
				C.log('App: init at lists.');
				C.currentCollection = C.listCollection;
				break;

			case C.states.TODOS:
				C.log('App: init at list with order: ' + state.order);
				while (i--) {
					if (lists[i].order === state.order) {
						C.currentCollection = new C.TodoCollection(lists[i]);
						break;
					}
				}
				break;

			default:
				C.log('App: init at lists.');
				C.currentCollection = C.listCollection;
				break;

		}

		C.currentCollection.load(0, true); // passing in (position:0) and (noAnimation:true)

		if (!C.listCollection.initiated) {
			// If we started with a TodoCollection, load ListCollection and position it for pulldown
			C.listCollection.positionForPulldown();
			C.listCollection.load();
		} else {
			// otherwise, load the last used todoCollection
			C.lastTodoCollection = new C.TodoCollection(lists[state.lastTodoCollection]);
			C.lastTodoCollection.load(C.client.height + C.ITEM_HEIGHT, true);
			C.lastTodoCollection.positionForPullUp();
		}

	},

	log: function (msg) {

		if (!this.debug) return;

		//$('#log').text(msg);

		var time = Date.now() - C.start;
		if (time < 1000) {
			time = '[' + time + 'ms] ';
		} else {
			time = '[' + (time / 1000).toFixed(2) + 's] ';
		}
		msg = time + msg;
		console.log(msg);

	},

	raf: window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 16);
		}

};

// boot up on page load
$(function () {
	C.init();
});