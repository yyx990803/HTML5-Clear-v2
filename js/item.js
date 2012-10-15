C.Item = (function () {

	var leftBound = -64,
		rightBound = 64;

	return {

		init: function (data) {

			this.x = 0;
			this.y = data.order * 64;
			this.data = data;

			this.render();

			this.style = this.el[0].style;
			this.slider = this.el.find('.slider');
			this.sliderStyle = this.slider[0].style;

			this.check = $('<img class="check drag" src="img/check.png">');
			this.cross = $('<img class="cross drag" src="img/cross.png">');
			this.el
				.append(this.check)
				.append(this.cross);

			this.checkStyle = this.check[0].style;
			this.crossStyle = this.cross[0].style;

			this.checkX = 0;
			this.crossX = 0;
			this.checkO = 0;
			this.crossO = 0;

		},

		updatePosition: function () {

			this.y = this.data.order * 64;
			this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

		},

		onDragStart: function () {

			this.slider.addClass('drag');
			this.checkX = this.crossX = 0;
			this.checkStyle.webkitTransform = this.crossStyle.webkitTransform = 'translate3d(0,0,0)';

		},

		onDragMove: function (dx) {

			var tx = this.x + dx;

			if (this.noDragRight && tx > 0) return;
			if (this.noDragLeft && tx < 0) return;

			if (tx > 0) { // dragging to right

				if (this.noDragRight) return;
				if (tx <= rightBound) {

					this.checkO = tx / rightBound;
					this.checkStyle.opacity = this.checkO;

					if (this.checkX != 0) {
						this.checkX = 0;
						this.checkStyle.webkitTransform = 'translate3d(0, 0, 0)';
					}

				} else { // over bound

					dx /= 3;
					this.checkX = Math.max(0, (this.x + dx) - rightBound);
					this.checkStyle.webkitTransform = 'translate3d(' + this.checkX + 'px, 0, 0)';

					if (this.checkO != 1) {
						this.checkO = 1;
						this.checkStyle.opacity = 1;
					}

				}

			} else if (tx < 0) { // dragging to left

				if (this.noDragLeft) return;
				if (tx >= leftBound) {

					this.crossO = tx / leftBound;
					this.crossStyle.opacity = this.crossO;

					if (this.crossX != 0) {
						this.crossX = 0;
						this.crossStyle.webkitTransform = 'translate3d(0, 0, 0)';
					}

				} else { // over bound

					dx /= 3;
					this.crossX = Math.min(0, (this.x + dx) - leftBound);
					this.crossStyle.webkitTransform = 'translate3d(' + this.crossX + 'px, 0, 0)';

					if (this.crossO != 1) {
						this.crossO = 1;
						this.crossStyle.opacity = 1;
					}

				}

			}

			this.x += dx;
			this.sliderStyle.webkitTransform = 'translate3d(' + this.x + 'px, 0, 0)';

		},

		onDragEnd: function () {

			var item = this,
				complete;

			if (item.x < leftBound) {
				complete = this.del;
			} else if (item.x > rightBound) {
				complete = this.done;
			} else {
				complete = this.cancel;
			}

			loop();

			function loop () {

				item.x *= .6;
				item.sliderStyle.webkitTransform = 'translate3d(' + item.x + 'px, 0, 0)';

				if (Math.abs(item.x) > 0.1) {
					setTimeout(loop, 16);
				} else {
					item.x = 0;
					item.sliderStyle.webkitTransform = 'translate3d(' + item.x + 'px, 0, 0)';
					item.slider.removeClass('drag');

					complete.call(item);

				}

			}

		},



	};

}());