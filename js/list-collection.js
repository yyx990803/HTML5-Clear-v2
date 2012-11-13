C.listCollection = {

	__proto__: C.Collection,

	init: function () {

		C.log('ListCollection: init');

		this.stateType = C.states.LISTS;
		this.base = C.Collection;
		this.itemType = C.ListItem;

		// apply shared init
		this.base.init.apply(this, arguments);

		// private init jobs
		this.updateColor();
		this.updatePosition();

		this.openedAt = -1; // used to record currently opened list

	},

	render: function () {

		this.el = $('<div id="list-collection" class="collection">'
					+ '<div class="credit">Made by Evan You <br> Original iOS app by Realmac</div>'
					+ '</div>');
		this.style = this.el[0].style;

	},

	load: function () {

		this.initiated = true;
		this.el.appendTo(C.$wrapper);

	},

	// fade out when a ListItem is tapped.
	fadeOut: function (at) {

		this.openedAt = at;

		var t = this;

		// move current and up to top, drop anything below
		var i = t.items.length,
			item,
			ty;
		while (i--) {
			item = t.items[i];
			if (item.data.order <= at) {
				ty = (item.data.order - at) * C.ITEM_HEIGHT - t.y;
			} else {
				ty = C.client.height + (item.data.order - at) * C.ITEM_HEIGHT - t.y;
			}
			item.moveY(ty);
		}

		// listen for transition end on the last item
		item.el.on('webkitTransitionEnd', function (e) {
			if (e.target !== this) return;
			item.el.off('webkitTransitionEnd');

			// do the expensive re-position right here to avoid jank during pull down animation.
			t.positionForPulldown();

		});

	},

	// position the collection for pulldown from a TodoCollection.
	positionForPulldown: function () {

		var t = this;
		t.el.css('display', 'none');
		t.updatePosition();
		t.moveY(-t.height);

		setTimeout(function () {
			t.el
				.css('display', 'block')
				.addClass('drag');
		}, 1);

	},

	// position the collection for pinch in from a TodoCollection.
	positionForPinchIn: function () {

	},

	onDragMove: function () {

		this.base.onDragMove.apply(this, arguments);

		var ltc = C.lastTodoCollection;

		// long pull down
		if (this.y <= this.upperBound) {
			if (!this.longPullingUp) {
				this.longPullingUp = true;
				ltc.el.addClass('drag');
			}
			ltc.moveY(this.y + Math.max(this.height + C.ITEM_HEIGHT * 2, C.client.height + C.ITEM_HEIGHT));

			if (this.y < this.upperBound - C.ITEM_HEIGHT) {
				if (!this.pastLongPullDownThreshold) {
					this.pastLongPullDownThreshold = true;
					ltc.topArrow.addClass('down');
				}
			} else {
				if (this.pastLongPullDownThreshold) {
					this.pastLongPullDownThreshold = false;
					ltc.topArrow.removeClass('down');
				}
			}

		} else {
			if (this.longPullingUp) {
				this.longPullingUp = false;
				ltc.moveY(C.client.height + C.ITEM_HEIGHT);
			}
		}

	},

	onDragEnd: function () {

		this.longPullingUp = false;
		this.pastLongPullDownThreshold = false;

		if (this.y >= C.ITEM_HEIGHT) {

			this.createNewItem(0);

		} else if (this.y <= this.upperBound - C.ITEM_HEIGHT) {

			this.onPullUp();
			return; // cancel default bounce back

		} else if (this.y <= this.upperBound) {

			// pull up cancelled

			var ltc = C.lastTodoCollection;
			ltc.el.removeClass('drag').addClass('ease-out');
			ltc.moveY(C.client.height + C.ITEM_HEIGHT);
			ltc.onMoveEnd(function () {
				ltc.el.removeClass('ease-out');
			});
		}

		this.base.onDragEnd.apply(this, arguments);

	},

	onPullUp: function () {
		
		var ltc = C.lastTodoCollection;

		ltc.el.removeClass('drag');
		ltc.moveY(0);

		this.el.removeClass('drag');
		this.moveY(Math.min(-this.height, -C.client.height) - C.ITEM_HEIGHT * 2);

		C.setCurrentCollection(ltc);

		ltc.onMoveEnd(function () {
			ltc.resetTopSwitch();
		});

		var t = this;
		t.onMoveEnd(function () {
			t.positionForPulldown();
		});

	},

	createNewItem: function () {
		this.base.createNewItem.apply(this, arguments);
	}

};