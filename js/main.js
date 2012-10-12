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

		this.client.init();
		this.db.init();
		this.menu.init();

	},

	log: function (msg) {

		if (this.debug) console.log(msg);

	}

};

$(function () {
	C.init();
});