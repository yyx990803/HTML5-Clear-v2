// The C.Collection base object
// inehrited by C.ListCollection and C.TodoCollection

C.Collection = (function (raf) {

	var dragElasticity 		= .45,
		friction 			= .95,
		speedMultiplier 	= 16,
		maxSpeed 			= 35,
		diff 				= 0.5, // the min distance from target an animation loop chain should reach before ending
		sortMoveSpeed 		= 4.5;

	var beforeEditPosition 	= 0; // used to record position before edit focus

	return {

		init: function (data) {

			this.y = 0;
			this.upperBound = 0;
			this.initiated = false;
			this.longPullingDown = false;
			this.longPullingUp = false;
			this.pastLongPullDownThreshold = false;
			this.pastLongPullUpThreshold = false;

			this.data = data || C.db.data;
			this.items = [];
			this.render();
			this.populateItems();
			this.appendDummyItem();

		},

		populateItems: function () {

			var items = this.data.items,
				i = items.length,
				li;

			this.count = 0;	// number of items (for C.TodoCollection this only counts items not done yet)
			this.hash = {}; // hash for getting items based on ID
			this.newIdFrom = i; // newly created item ID start from this

			while (i--) {
				li = new this.itemType(items[i]);
				li.collection = this;
				li.el
					.data('id', i)
					.appendTo(this.el);
				this.items.push(li);
				this.hash[i] = li; // assign pointer in hash
				if (!li.data.done) this.count++;
			}

			this.hasDoneItems = this.items.length > this.count;

			this.updateBounds();

		},

		appendDummyItem: function () {

			this.dummy = $('<div class="item">');

		},

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

		moveY: function (y) {

			this.y = y;
			this.style[C.client.transformProperty] = 'translate3d(0px,' + y + 'px, 0px)';

		},

		collapseAt: function (at, target) {

			var items = this.items,
				i = items.length,
				item,
				delIndex;

			while (i--) {
				item = items[i];
				if (item === target) {
					if (target.deleted) delIndex = i; // found item to be deleted
				} else if (item.data.order > at && (!item.data.done || target.deleted)) {
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
				C.db.save();

			}

		},

		updateBounds: function (noMove) {

			this.height = this.items.length * C.ITEM_HEIGHT;
			this.upperBound = Math.min(0, C.client.height - (this.height + C.ITEM_HEIGHT));

			// move into bound when items are deleted
			if (this.y < this.upperBound && !noMove) {
				this.moveY(this.upperBound);
			}

		},

		onDragStart: function () {

			this.el.addClass('drag');

		},

		onDragMove: function (dy) {

			if (this.y + dy < this.upperBound || this.y + dy > 0) {
				dy *= dragElasticity;
			}

			this.moveY(this.y + dy);

		},

		onDragEnd: function (speed) {

			var col = this;
			speed = Math.max(-maxSpeed, Math.min(maxSpeed, speed * speedMultiplier));

			col.inMomentum = true;
			loop();

			function loop () {

				if (C.touch.isDown) {
					endLoop();
					return;
				}

				if (col.y < col.upperBound - diff) { // dragged over bottom
					col.y += (col.upperBound - col.y) / 5; // apply elastic bounce back
					speed *= .85; // apply additional friction
					if (col.y < col.upperBound - diff) {
						raf(loop);
						render();
					} else {
						col.moveY(col.upperBound);
						endLoop();
					}
				} else if (col.y > diff) { // dragged over top
					col.y *= .8;
					speed *= .85;
					if (col.y > diff) {
						raf(loop);
						render();
					} else {
						col.moveY(0);
						endLoop();
					}
				} else if (Math.abs(speed) > 0.1) { // normal moving
					raf(loop);
					render();
				} else { // natural stop due to friction
					endLoop();
				}

			}

			function endLoop () {
				col.el.removeClass('drag');
				col.inMomentum = false;
			}

			function render () {
				col.moveY(col.y + speed);
				speed *= friction;
			}

		},

		// need better doc here, target is an Item

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

				raf(loop);

				var cty = Math.max(col.upperBound, Math.min(0, col.y + dy));

				target.y -= cty - col.y;
				target.style[C.client.transformProperty] = 'translate3d(0,' + target.y + 'px, 0)';
				target.checkSwap();

				col.y = cty;
				col.moveY(col.y);

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
					var ty = -at * C.ITEM_HEIGHT;
					t.moveY(ty);
				}
				t.el.addClass('shade');
			}, 1);

		},

		onEditDone: function (callback) {

			if (!C.client.isTouch) {
				this.moveY(beforeEditPosition);
			}

			var t = this;
			t.el.removeClass('shade');
			t.onTransitionEnd(callback, true);
			// passing in {noStrict: true}
			// must avoid (e.target === this) checking here because
			// triggered transition doesn't happen on itself

		},

		createNewItem: function (at) {

		},

		// listen for webkitTransitionEnd
		onTransitionEnd: function (callback, noStrict) {

			var t = this;
			t.el.on(C.client.transitionEndEvent, function (e) {
				if (e.target !== this && !noStrict) return;
				t.el.off(C.client.transitionEndEvent);
				callback();
			});

		}

	};

}(C.raf));