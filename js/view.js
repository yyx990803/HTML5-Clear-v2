C.View = (function () {

	var friction = .95,
		interval = 16,
		speedMultiplier = 10,
		maxSpeed = 25,
		diff = 0.5;

	return {

		updateColor: function () {

			var i = this.items.length,
				item;

			while (i--) {
				item = this.items[i];
				item.updateColor();
			}

		},

		updatePosition: function () {

			var i = this.items.length,
				item;

			while (i--) {
				item = this.items[i];
				item.updatePosition();
			}

		},

		updateBounds: function () {

			this.upperBound = Math.min(0, C.client.height - (this.items.length + 1) * 64);

		},

		onDragStart: function () {

			this.el.addClass('drag');

		},

		onDragMove: function (dy) {

			if (this.y + dy < this.upperBound || this.y + dy > 0) {
				dy /= 3;
			}

			this.y += dy;

			this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

		},

		onDragEnd: function (speed) {

			if (this.y > 120) {
				console.log("up one level");
			} else if (this.y > 64) {
				console.log("create new item");
			} else if (this.y < this.upperBound - 64) {
				console.log("pulled up");
			}

			var view = this;
			speed = Math.max(-maxSpeed, Math.min(maxSpeed, speed * speedMultiplier));

			view.inMomentum = true;
			loop();

			function loop () {

				if (C.touch.data.dragging) return;

				view.y += speed;
				speed *= friction;
				view.style.webkitTransform = 'translate3d(0,' + view.y + 'px, 0)';

				if (view.y < view.upperBound - diff) {
					view.y += (view.upperBound - view.y) / 5;
					speed *= .85;
					if (view.y < view.upperBound - diff) {
						setTimeout(loop, interval);
					} else {
						view.y = view.upperBound;
						endLoop();
					}
				} else if (view.y > diff) {
					view.y *= .8;
					speed *= .85;
					if (view.y > diff) {
						setTimeout(loop, interval);
					} else {
						view.y = 0;
						endLoop();
					}
				} else if (Math.abs(speed) > 0.1) {
					setTimeout(loop, interval);
				} else {
					endLoop();
				}

			}

			function endLoop () {
				view.style.webkitTransform = 'translate3d(0,' + view.y + 'px, 0)';
				view.el.removeClass('drag');
				view.inMomentum = false;
			}

		}

	};

}());