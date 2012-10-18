C.Collection = (function () {

	var friction = .95,
		interval = 16,
		speedMultiplier = 10,
		maxSpeed = 25,
		diff = 0.5;

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

			var col = this;
			speed = Math.max(-maxSpeed, Math.min(maxSpeed, speed * speedMultiplier));

			col.inMomentum = true;
			loop();

			function loop () {

				if (C.touch.data.dragging || C.touch.data.draggingItem) return;

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

		}

	};

}());