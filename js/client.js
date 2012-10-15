C.client = (function () {

	var client = {

		isTouch: ('ontouchstart' in window),

		init: function () {

			C.log('Client: init');

			if (!this.isTouch) {

				this.width = 320;
				this.height = 548;
				$(document.body).addClass('desktop');

			}

			this.update();
			$(window).resize(function () {
				C.client.update();
			});

		},

		update: function () {

			if (this.isTouch) {

				this.width = window.innerWidth,
				this.height = window.innerHeight;
				if (C.currentView) {
					C.currentView.updateBounds();
				}

			} else {

				var wrapper = C.$wrapper[0];
				this.top = wrapper.offsetTop;
				this.left = wrapper.offsetLeft;
				this.right = this.left + this.width;
				this.bottom = this.top + this.height;
				
			}

		}

	};

	return client;

}());