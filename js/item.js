C.Item = (function () {

	var leftBound = -64,
		rightBound = 64;

	return {

		init: function (data) {

			this.x = 0;
			this.y = data.order * 64;
			this.data = data;

			this.render();

			// cache references to elements and styles

			this.style = this.el[0].style;
			this.slider = this.el.find('.slider');
			this.sliderStyle = this.slider[0].style;

			// init cross and check

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

		updatePosition: function (top) {
			
			this.y = this.data.order * 64;

			if (top) this.style.zIndex = 1; // make sure the item acted upon moves on top

			this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

			if (top) {
				var t = this;
				setTimeout(function () {
					t.style.zIndex = 0;		
				}, 300);
			}

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

					var o = tx / rightBound;
					this.checkO = this.data.done ? 1 - o : o;
					this.checkStyle.opacity = this.checkO;

					if (this.checkX != 0) {
						this.checkX = 0;
						this.checkStyle.webkitTransform = 'translate3d(0, 0, 0)';
					}

				} else { // over bound

					dx /= 3;
					this.checkX = Math.max(0, (this.x + dx) - rightBound);
					this.checkStyle.webkitTransform = 'translate3d(' + this.checkX + 'px, 0, 0)';

					var targetO = this.data.done ? 0 : 1;
					if (this.checkO != targetO) {
						this.checkO = targetO;
						this.checkStyle.opacity = targetO;
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
				done = false;

			if (item.x < leftBound) {
				this.del();
				return;
			} else if (item.x > rightBound) {
				done = true;
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

					if (done) item.done();

				}

			}

		},

		del: function () {

			var t = this;
			t.style.webkitTransform = 'translate3d(' + (-C.client.width - 64) + 'px,' + this.y + 'px, 0)';
			setTimeout(function () {
				if (!t.data.done) t.collection.count--;
				t.el.remove();
				t.collection.collapseAt(t.data.order, t, true);
			}, 300);

		},

		onSortStart: function () {
			this.el
				.addClass('sorting-trans')
				.addClass('sorting');
		},

		onSortMove: function (dy) {

			this.y += dy;
			this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

			var c = this.collection,
				cy = c.y,
				ay = this.y + cy; // the actual on screen y

			if (cy < 0 && ay < 92) {
				// upper move trigger is 1.5x line height = 96px
				if (!c.sortMoving) c.sortMove(1, this);
			} else if (cy > this.collection.upperBound && ay > C.client.height - 156) {
				// the lower move trigger needs to count in the extra one line of space, thus an extra 64px
				if (!c.sortMoving) c.sortMove(-1, this);
			} else {
				c.sortMoving = false;
				this.checkSwap();
			}

		},

		checkSwap: function () {

			var currentAt = Math.min(this.collection.items.length - 1, ~~((this.y + 32) / 64));
			if (currentAt != this.data.order) {
				var target = this.collection.getItemByOrder(currentAt);
				target.data.order = this.data.order;
				this.data.order = currentAt;
				target.updatePosition();
			}

		},

		onSortEnd: function () {

			this.collection.sortMoving = false;
			this.updatePosition();
			this.el.removeClass('sorting');
			this.collection.updateColor();

			var t = this;
			setTimeout(function () {
				t.el.removeClass('sorting-trans');
			}, 150);

			C.db.save();

		}

	};

}());