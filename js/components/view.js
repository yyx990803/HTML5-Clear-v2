C.View = (function () {

	return {

		onDragStart: function () {

		},

		onDragMove: function (dy) {

			if (this.y + dy < this.upperBound || this.y + dy > 0) {
				dy /= 3;
			}

			this.y += dy;

			this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

		},

		onDragEnd: function () {

			var view = this;
			loop();

			function loop () {

				if (view.y < view.upperBound) {
					view.y += (view.upperBound - view.y) / 5;	
				} else if (view.y > 0) {
					view.y += (0 - view.y) / 5;
				}

				view.style.webkitTransform = 'translate3d(0,' + view.y + 'px, 0)';

				if (Math.abs(view.y - view.upperBound) < 0.1) {
					view.y = view.upperBound;
					view.style.webkitTransform = 'translate3d(0,' + view.y + 'px, 0)';
				} else if (Math.abs(view.y) < 0.1) {
					view.y = view.lowerBound;
					view.style.webkitTransform = 'translate3d(0,' + view.y + 'px, 0)';
				} else if (!C.touch.data.dragging) {
					setTimeout(loop, 16);
				}

			}

		}

	};

}());