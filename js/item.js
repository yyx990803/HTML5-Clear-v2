// Common methods shared by both C.ListItem and C.TodoItem

C.Item = (function () {

	var leftBound = -62,
		rightBound = 62;

	return {

		init: function (data) {

			this.x = 0;
			this.y = data.order * 62;
			this.data = data;

			this.render();

			// cache references to elements and styles

			this.style = this.el[0].style;
			this.slider = this.el.find('.slider');
			this.sliderStyle = this.slider[0].style;

			// cross and check

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

			// editing related

			this.title = this.el.find('.title');
			this.field = this.el.find('.field');
			var t = this;
			this.field
				.on('blur', function () {
					t.onEditDone();
				})
				.on('keyup', function (e) {
					if (e.keyCode === 13) {
						$(this).blur();
					}
				});

		},

		updatePosition: function (top) {
			
			this.y = this.data.order * 62;

			if (top) this.el.addClass('top'); // make sure the item acted upon moves on top

			this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

			if (top) {
				var t = this;
				setTimeout(function () {
					t.el.removeClass('top');
				}, 300);
			}

		},

		onTap: function (e) {

			if (C.state === C.states.EDITING) return;

			// check to see if tap is on the text or the item itself

			if (this.open) {
				if (e.target.className === 'text') {
					this.onEditStart();
				} else {
					this.open();
				}
			} else {
				if (!this.data.done) this.onEditStart();
			}

		},

		onDragStart: function () {

			this.slider.addClass('drag');
			this.checkX = this.crossX = 0;
			this.checkStyle.webkitTransform = this.crossStyle.webkitTransform = 'translate3d(0,0,0)';

		},

		onDragMove: function (dx) {

			if (C.state === C.states.EDITING) return;

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
				doneCallback = null;

			if (item.x < leftBound) {
				// passing in a loop starter with callback to be used after confirmation
				this.del(loopWithCallback);
				return;
			} else if (item.x > rightBound) {
				doneCallback = function () {
					item.done();
				}
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

					if (doneCallback) doneCallback();

				}

			}

			function loopWithCallback (callback) {
				doneCallback = callback;
				loop();
			}

		},

		del: function () {

			var t = this;
			t.style.webkitTransform = 'translate3d(' + (-C.client.width - 62) + 'px,' + this.y + 'px, 0)';
			setTimeout(function () {
				if (!t.data.done) t.collection.count--;
				t.deleted = true;
				t.el.remove();
				t.collection.collapseAt(t.data.order, t);
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

			if (cy < 0 && ay < 93 && dy < 3) {
				// upper move trigger is 1.5x line height = 93px
				// dy < 3 : makes sure upmove only triggers when user moves the dragged item upwards.
				// the 3px gives a small buffer for incidental downward movements
				if (!c.sortMoving) c.sortMove(1, this);
			} else if (cy > this.collection.upperBound && ay > C.client.height - 155 && dy > -3) {
				// the lower move trigger needs to count in the extra one line of space, thus an extra 62px
				if (!c.sortMoving) c.sortMove(-1, this);
			} else {
				c.sortMoving = false;
				this.checkSwap();
			}

		},

		checkSwap: function () {

			var currentAt = Math.min(this.collection.items.length - 1, ~~((this.y + 31) / 62)),
				origin = this.data.order;

			if (currentAt != origin) {

				var targets = this.collection.getItemsBetween(origin, currentAt),
					i = targets.length,
					target,
					increment = currentAt > origin ? -1 : 1;

				while (i--) {
					target = targets[i];
					target.data.order += increment;
					target.updatePosition();
				}

				this.data.order = currentAt;
				
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

		},

		onEditStart: function () {

			C.state = C.states.EDITING;

			this.title.hide();
			this.field.show().focus();
			this.el.addClass('edit');

			this.collection.onEditStart(this.data.order);

		},

		onEditDone: function () {
			
			var t= this,
				val = t.field.hide().val();

			t.collection.onEditDone();

			if (!val) {

				setTimeout(function () {
					t.el.removeClass('edit');
					C.state = C.states.TODOS;
					t.del();
				}, 300);

			} else {

				t.title
					.show()
					.find('.text')
					.text(val);

				setTimeout(function () {
					t.el.removeClass('edit');
					C.state = C.states.TODOS;
					t.data.title = val;
					C.db.save();
				}, 300);

			}
	
		}

	};

}());