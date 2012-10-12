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

			// init some components
			C.client.init();
			C.db.init();
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

			if (this.debug) console.log(msg);

		}

	};

	function initAtMenu () {

	}

	function initAtList () {

	}

	function initAtTodos (listID) {
		
	}

}());

$(function () {
	C.init();
});