var C = {

	//states
	states: {
		MENU: 		0,
		LIST: 		1,
		TODO: 		2,
		EDITING: 	3
	},

	init: function () {

		this.client.init();
		this.data.init();
		this.menu.init();

	}

};

$(function () {
	C.init();
});