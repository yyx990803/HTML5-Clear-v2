C.Item = (function () {

	var leftBound = -64,
		rightBound = 64;

	return {

		onDragStart: function () {

		},

		onDragMove: function (dx) {

			if (this.x + dx < leftBound || this.x + dx > rightBound) {
				dx /= 3;
			}

			this.x += dx;
			this.style.webkitTransform = 'translate3d(' + this.x + 'px,' + this.y + 'px, 0)';

		},

		onDragEnd: function () {

			var item = this;

			loop();

			function loop () {

				item.x *= .6;
				item.style.webkitTransform = 'translate3d(' + item.x + 'px,' + item.y + 'px, 0)';

				if (Math.abs(item.x) > 0.1) {
					setTimeout(loop, 16);
				} else {
					item.x = 0;
					item.style.webkitTransform = 'translate3d(' + item.x + 'px,' + item.y + 'px, 0)';
				}

			}

		}

	};

}());