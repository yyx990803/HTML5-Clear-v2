C.TodoCollection = function (data, listItem) {
	
	C.log('TodoCollection: init <' + data.title + '>');

	this.base = C.Collection;
	this.itemType = C.TodoItem;

	this.listItem = listItem;

	this.longPullingDown = false;
	this.longPullingUp = false;

	// apply shared init
	this.base.init.apply(this, arguments);

};

C.TodoCollection.prototype = {

	render: function () {

		this.el = $('<div class="collection">'
			+ '<div class="top-switch">'
				+ '<img class="arrow" src="img/arrow.png"> Switch To Lists'
			+ '</div>'
			+ '</div>');
		this.style = this.el[0].style;

	},

	load: function (at, noAnimation) {

		this.initiated = true;

		var t = this;
		C.currentCollection = t;
		t.updateColor();

		if (noAnimation) {

			t.updatePosition();
			t.el.appendTo(C.$wrapper);

		} else {

			if (t.initiated) t.el.remove();

			// move to match the position of the ListItem
			t.moveY(at * C.ITEM_HEIGHT + C.listCollection.y);
			t.el.appendTo(C.$wrapper);

			// wait for repaint
			setTimeout(function () {

				// move to top
				t.moveY(0);

				// expand items to their right positions
				t.updatePosition();

				t.el.on('webkitTransitionEnd', function (e) {
					if (e.target !== this) return;
					t.el
						.off('webkitTransitionEnd')
						.removeClass('move');
				});
			}, 1);

		}

	},

	floatUp: function (target) {

		var i = this.items.length,
			item,
			below = target.data.order;
		target.data.order = this.count - 1;

		while (i--) {
			item = this.items[i];
			if (item === target) {
				item.updateColor();
				item.updatePosition(true);
			} else if (item.data.done && item.data.order < below) {
				item.data.order++;
				item.updatePosition();
			} else {
				item.updateColor();
			}
		}

	},

	updateCount: function () {

		this.listItem.count = this.count;
		this.listItem.updateCount();

	},

	onDragMove: function () {

		this.base.onDragMove.apply(this, arguments);

		var lc = C.listCollection;

		// long pull over top
		if (this.y >= C.ITEM_HEIGHT * 2) {
			if (!this.longPullingDown) {
				this.longPullingDown = true;
			}
			lc.moveY(this.y - lc.height - C.ITEM_HEIGHT * 2);
		} else {
			if (this.longPullingDown) {
				this.longPullingDown = false;
				lc.moveY(-lc.height - C.ITEM_HEIGHT * 2 - 1);
			}
		}

	},

	onPullDown: function () {

		this.longPullingDown = false;

		var lc = C.listCollection;

		// show the faded item
		var fadedItem = lc.getItemByOrder(lc.openedAt);
		if (fadedItem) fadedItem.el.removeClass('fade');

		lc.el.removeClass('drag');
		lc.moveY(0);

		this.el.removeClass('drag');
		this.moveY(lc.height + C.ITEM_HEIGHT * 2);

		C.currentCollection = lc;

		// cancel bounceBack
		return false;

	},

	onPullUp: function () {
		// clear done stuff
		return true;
	},

	createNewItem: function () {
		this.base.createNewItem.apply(this, arguments);
	}

};

// Inherit methods
C.TodoCollection.prototype.__proto__ = C.Collection;