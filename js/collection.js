C.Collection = (function () {

	var dragElasticity 		= 2.8,
		friction 			= .95,
		interval 			= 16,
		speedMultiplier 	= 16,
		maxSpeed 			= 32,
		diff 				= 0.5,
		sortMoveSpeed 		= 4.5;

	var beforeEditPosition 	= 0; // used to record position before edit focus

	return {

		getItemById: function (id) {
			return this.hash[id];
		},

		getItemByOrder: function (order) {

			var i = this.items.length,
				item;
			while (i--) {
				item = this.items[i];
				if (item.data.order === order) {
					return item;
				}
			}
		},

		getItemsBetween: function (origin, target) {

			var i = this.items.length,
				item,
				order,
				result = [];

			while (i--) {
				item = this.items[i];
				order = item.data.order;
				if ((order > origin && order <= target) || (order < origin && order >= target)) {
					result.push(item);
				}
			}

			return result;

		},

		updateColor: function () {

			var i = this.items.length;
			while (i--) {
				this.items[i].updateColor();
			}

		},

		updatePosition: function () {

			var i = this.items.length;
			while (i--) {
				this.items[i].updatePosition();
			}

		},

		countIncomplete: function () {

			console.log("!");

			var i = this.items.length,
				count = 0;

			while (i--) {
				if (!this.items[i].data.done) count++;
			}

			this.count = count;
			return count;

		},

		collapseAt: function (at, target, del) {

			var items = this.items,
				i = items.length,
				item,
				delIndex;

			while (i--) {
				item = items[i];
				if (item === target) {
					if (del) delIndex = i;
					continue;
				} else if (item.data.order > at && (!item.data.done || del)) {
					item.data.order--;
					item.updateColor();
					item.updatePosition();
				} else {
					item.updateColor();
				}
			}

			if (delIndex || delIndex === 0) { // if this item is deleted

				//remove its view object
				items.splice(delIndex, 1);
				this.updateBounds();

				//update db data
				C.db.deleteItem(target.data, this.data);
				
			}

		},

		updateBounds: function () {

			this.upperBound = Math.min(0, C.client.height - (this.items.length + 1) * 62);

		},

		onDragStart: function () {

			this.el.addClass('drag');

		},

		onDragMove: function (dy) {

			if (this.y + dy < this.upperBound || this.y + dy > 0) {
				dy /= dragElasticity;
			}

			this.y += dy;

			//using plain stuff here to avoid extra function invocations for performance
			this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

		},

		onDragEnd: function (speed) {

			if (this.y > 120) {
				this.onPullDown();
			} else if (this.y > 64) {
				this.createNewItem(0);
			} else if (this.y < this.upperBound - 64) {
				this.onPullUp();
			}

			var col = this;
			speed = Math.max(-maxSpeed, Math.min(maxSpeed, speed * speedMultiplier));

			col.inMomentum = true;
			loop();

			function loop () {

				if (C.touch.data.isDown) {
					endLoop();
					return;
				}

				col.y += speed;
				speed *= friction;
				col.style.webkitTransform = 'translate3d(0,' + col.y + 'px, 0)';

				if (col.y < col.upperBound - diff) {
					col.y += (col.upperBound - col.y) / 5;
					speed *= .85;
					if (col.y < col.upperBound - diff) {
						setTimeout(loop, interval);
					} else {
						col.y = col.upperBound;
						endLoop();
					}
				} else if (col.y > diff) {
					col.y *= .8;
					speed *= .85;
					if (col.y > diff) {
						setTimeout(loop, interval);
					} else {
						col.y = 0;
						endLoop();
					}
				} else if (Math.abs(speed) > 0.1 && !C.touch.data.isDown) {
					setTimeout(loop, interval);
				} else {
					endLoop();
				}

			}

			function endLoop () {
				col.style.webkitTransform = 'translate3d(0,' + col.y + 'px, 0)';
				col.el.removeClass('drag');
				col.inMomentum = false;
			}

		},

		sortMove: function (dir, target) {
			
			var col = this,
				dy  = dir * sortMoveSpeed;

			col.sortMoving = true;
			col.el.addClass('drag');
			loop();

			function loop () {

				if (!col.sortMoving) {
					col.el.removeClass('drag');
					return;
				}

				var cty = Math.max(col.upperBound, Math.min(0, col.y + dy));

				target.y -= cty - col.y;
				target.style.webkitTransform = 'translate3d(0,' + target.y + 'px, 0)';
				target.checkSwap();

				col.y = cty;
				col.style.webkitTransform = 'translate3d(0,' + col.y + 'px, 0)';

				setTimeout(loop, interval);

			}

		},

		onEditStart: function (at) {

			beforeEditPosition = this.y;

			// Reason for using a setTimeout here: (or at least what I think is the case)
			// It seems in iOS browsers when you trigger the keyboard for the first time,
			// there's some heavy initialization work going on. This function is called
			// from the function that was initially triggered by the input focus event,
			// so the css transitions triggered here will be blocked. I'm avoiding that
			// by putting the class changes into a new call stack.

			var t = this;
			setTimeout(function () {
				if (!C.client.isTouch) {
					var ty = -at * 62;
					t.style.webkitTransform = 'translate3d(0,' + ty + 'px, 0)';
				}
				t.el.addClass('shade');
			}, 1);

		},

		onEditDone: function () {

			if (!C.client.isTouch) {
				this.style.webkitTransform = 'translate3d(0,' + beforeEditPosition + 'px, 0)';
			}
			this.el.removeClass('shade');

		},

		createNewItem: function () {
			
		}

	};

}());