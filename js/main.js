var C = {

	debug: true,

	// dom elements
	$wrapper: 		$('#wrapper'),
	$main: 			$('#main'),

	// states
	states: {
		MENU: 		0,
		LIST: 		1,
		TODO: 		2,
		EDITING: 	3
	},

	init: function () {

		C.client.init();
		C.db.init();
		C.menu.init();

		C.setTheme(C.db.data.theme, true);

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

$(function () {
	C.init();
});