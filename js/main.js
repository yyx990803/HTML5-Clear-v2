;(function () {

	window.C = {

		debug: true,

		// dom elements
		$wrapper: 		$('#wrapper'),

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
			C.db.init();
			C.touch.init();

			C.menu.init();
			C.listView.init();

			// set theme
			C.$wrapper.addClass(C.db.data.theme);

			// restore state
			var state = C.db.data.state;
			switch (state.view) {

				case C.states.MENU:
					C.log('App: init at menu.');
					C.currentView = C.menu;
					break;

				case C.states.LISTS:
					C.log('App: init at lists.');
					C.currentView = C.listView;
					break;

				case C.states.TODOS:
					C.log('App: init at list with ID: ' + state.listID);
					C.currentView = new C.TodoList(C.db.data.lists[state.listID]);
					break;

				default:
					C.log('App: init at lists.');
					C.currentView = C.listView;
					break;

			}

			C.$wrapper.append(C.currentView.el);

		},

		setTheme: function (newTheme) {

			var curTheme = C.db.data.theme;
			if (newTheme == curTheme) return;

			C.$wrapper
				.removeClass(curTheme)
				.addClass(newTheme);

			C.db.data.theme = newTheme;
			C.db.save();

			C.log('App: set theme: ' + newTheme);

		},

		log: function (msg) {

			msg = '[' + (new Date().getTime() - C.start) + 'ms] ' + msg;
			if (this.debug) console.log(msg);

		}

	};

}());

$(function () {
	C.init();
});