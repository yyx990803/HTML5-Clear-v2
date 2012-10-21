var C = {

	debug: true,

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

	init: function () {

		C.start = Date.now();

		// init some components
		C.client.init();
		C.db.init(true);
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

	}

};

$(function () {
	C.init();
});