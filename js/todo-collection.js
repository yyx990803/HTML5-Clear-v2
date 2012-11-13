C.TodoCollection = function (data, listItem) {
	
	C.log('TodoCollection: init <' + data.title + '>');

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
			+ '</div>');
		this.style = this.el[0].style;
		this.topSwitch = this.el.find('.top-switch');
		this.topArrow = this.topSwitch.find('.arrow');
		this.topText = this.topSwitch.find('.text');

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
				lc.moveY(-lc.height - C.ITEM_HEIGHT * 2);
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

		C.currentCollection = lc;
		C.lastTodoCollection = this;

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