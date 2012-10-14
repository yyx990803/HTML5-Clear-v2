C.client = (function () {

	var client = {

		isTouch: ('ontouchstart' in window),

		init: function () {

			C.log('Client: init');

			this.update();

			if (!this.isTouch) {
				$(document.body).addClass('desktop');
			} else {
				$(window).resize(function () {
					C.client.update();
				});
			}

		},

		update: function () {

			this.width = window.innerWidth,
			this.height = window.innerHeight;
			if (C.currentView) {
				C.currentView.updateBounds();
			}

		}

	};

	return client;

}());