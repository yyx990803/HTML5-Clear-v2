(function () {

	window.C = {

		debug: true,

		// dom elements
		$wrapper: 		$('#wrapper'),
		$main: 			$('#main'),

		// states
		states: {
			MENU: 		0,
			LISTS: 		1,
			TODOS: 		2,
			EDITING: 	3
		},

		init: function () {

			C.start = new Date().getTime();

			// init some components
			C.client.init();
			C.db.init(true);
			C.menu.init();

			// set theme
			C.setTheme(C.db.data.theme, true);

			// restore state
			var state = C.db.data.state;

			switch (state.view) {

				case C.states.MENU:
					initAtMenu();
					break;

				case C.states.LISTS:
					initAtLists();
					break;

				case C.states.TODOS:
					initAtTodos(state.listID);
					break;

				default:
					initAtMenu();
					break;

			}

		},

		setTheme: function (newTheme, force) {

			var curTheme = C.db.data.theme;
			if (newTheme == curTheme && !force) return;

			C.$wrapper
				.removeClass(curTheme)
				.addClass(newTheme);

			C.db.data.theme = newTheme;
			C.db.save();

			C.log('Set theme: ' + newTheme);

		},

		log: function (msg) {

			msg = '[' + (new Date().getTime() - C.start) + 'ms] ' + msg;
			if (this.debug) console.log(msg);

		}

	};

	function initAtMenu () {

		C.log('init at menu.');

	}

	function initAtLists () {

		C.log('init at lists.');

	}

	function initAtTodos (listID) {

		C.log('init at todos, list ID: ' + listID);
		
	}

}());

$(function () {
	C.init();
});