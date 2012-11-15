C.TodoCollection = function (data, listItem) {
	
	C.log('TodoCollection: init <' + data.title + '>');

	this.stateType = C.states.TODOS;
	this.base = C.Collection;
	this.itemType = C.TodoItem;

	this.listItem = listItem || C.listCollection.getItemByOrder(data.order);

	// apply shared init
	this.base.init.apply(this, arguments);

};

C.TodoCollection.prototype = {

	__proto__: C.Collection,

	render: function () {

		this.el = $('<div class="collection">'
				+ '<div class="top-switch">'
					+ '<img class="arrow" src="img/arrow.png"> <span class="text">Switch To Lists</span>'
				+ '</div>'
				+ '<div class="bottom-switch">'
					+ '<div class="drawer"><img class="arrow-small" src="img/arrow-small.png"></div>'
					+ '<span class="text">Pull to Clear</span>'
				+ '</div>'
			+ '</div>');

		this.style = this.el[0].style;

		this.topSwitch = this.el.find('.top-switch');
		this.topArrow = this.topSwitch.find('.arrow');
		this.topText = this.topSwitch.find('.text');

		this.bottomSwitch = this.el.find('.bottom-switch');
		this.drawer = this.bottomSwitch.find('.drawer');
		this.smallArrowStyle = this.bottomSwitch.find('.arrow-small')[0].style;

	},

	load: function (at, noAnimation) {

		this.initiated = true;

		var t = this;

		t.updateColor();
		t.resetTopSwitch();

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
		this.hasDoneItems = this.items.length > this.count;

	},

	onDragMove: function () {

		this.base.onDragMove.apply(this, arguments);

		var lc = C.listCollection;

		// long pull down
		if (this.y >= C.ITEM_HEIGHT * 2) {
			if (!this.longPullingDown) {
				this.longPullingDown = true;
			}
			lc.moveY(this.y - lc.height - C.ITEM_HEIGHT * 2);
		} else {
			if (this.longPullingDown) {
				this.longPullingDown = false;
				lc.moveY(-lc.height - C.ITEM_HEIGHT * 2);
			}
		}

		// long pull up
		if (this.y < this.upperBound) {

			if (!this.longPullingUp) {
				this.longPullingUp = true;
				if (this.hasDoneItems) {
					this.bottomSwitch.removeClass('empty');
				} else {
					this.bottomSwitch.addClass('empty');
				}
			}

			// move the small arrow
			if (this.hasDoneItems) {
				var offset = (this.upperBound - this.y) / 2;
				this.smallArrowStyle.webkitTransform = 'translate3d(0,' + offset + 'px, 0)';
			}

			// check threshold
			if (this.y < this.upperBound - C.ITEM_HEIGHT * 2) {
				if (!this.pastLongPullUpThreshold) {
					this.pastLongPullUpThreshold = true;
					this.drawer.addClass('full');
				}
			} else {
				if (this.pastLongPullUpThreshold) {
					this.pastLongPullUpThreshold = false;
					this.drawer.removeClass('full');
				}
			}

		} else {
			if (this.longPullingUp) {
				this.longPullingUp = false;
			}
		}

	},

	onDragEnd: function () {

		this.longPullingDown = false;
		this.longPullingUp = false;

		if (this.y >= C.ITEM_HEIGHT * 2) {
			this.onPullDown();
			return; // cancel default bounce back
		} else if (this.y >= C.ITEM_HEIGHT) {
			this.createNewItem(0);
		} else if (this.y <= this.upperBound - C.ITEM_HEIGHT * 2) {
			this.onPullUp();
		}

		this.base.onDragEnd.apply(this, arguments);

	},

	onPullDown: function () {

		var lc = C.listCollection;

		// show the faded item
		var fadedItem = lc.getItemByOrder(lc.openedAt);
		if (fadedItem) fadedItem.el.removeClass('fade');

		lc.el.removeClass('drag');
		lc.moveY(0);

		this.el.removeClass('drag');
		this.moveY(Math.max(lc.height, C.client.height) + C.ITEM_HEIGHT * 2);

		C.setCurrentCollection(lc);
		C.setLastTodoCollection(this);

		var t = this;
		t.onMoveEnd(function () {
			t.positionForPullUp();
		});

	},

	onPullUp: function () {

		

	},

	createNewItem: function () {
		this.base.createNewItem.apply(this, arguments);
	},

	positionForPullUp: function () {

		this.el.addClass('drag');
		this.moveY(C.client.height + C.ITEM_HEIGHT);
		this.topText.text(this.data.title);
		this.topArrow.removeClass('down');

	},

	resetTopSwitch: function () {

		this.topText.text('Switch to Lists');
		this.topArrow.removeClass('down');

	}

};