C.Item = (function () {

	var leftBound = -64,
		rightBound = 64;

	return {

		init: function (data) {

			this.x = 0;
			this.y = data.order * 64;
			this.data = data;

			this.render();

		},

		onDragStart: function () {

			this.el.addClass('drag');

		},

		onDragMove: function (dx) {

			if (this.noDragRight && this.x + dx > 0) return;
			if (this.noDragLeft && this.x + dx < 0) return;

			if (this.x + dx < leftBound || this.x + dx > rightBound) {
				dx /= 3;
			}

			this.x += dx;
			this.style.webkitTransform = 'translate3d(' + this.x + 'px,' + this.y + 'px, 0)';

		},

		onDragEnd: function () {

			var item = this;

			if (item.x < leftBound) {
				this.del();
			} else if (item.x > rightBound) {
				this.done();
			}

			loop();

			function loop () {

				item.x *= .6;
				item.style.webkitTransform = 'translate3d(' + item.x + 'px,' + item.y + 'px, 0)';

				if (Math.abs(item.x) > 0.1) {
					setTimeout(loop, 16);
				} else {
					item.x = 0;
					item.style.webkitTransform = 'translate3d(' + item.x + 'px,' + item.y + 'px, 0)';
					item.el.removeClass('drag');
				}

			}

		}

	};

}());