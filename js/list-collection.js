C.listCollection = {

	__proto__: C.Collection,

	init: function () {

		C.log('ListCollection: init');

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

	onPullDown: function () {
		// there's no menu, so just skip
		this.createNewItem();
	},

	onPullUp: function () {
		// should go to the last opened list
		return false;
	},

	createNewItem: function () {
		this.base.createNewItem.apply(this, arguments);
	}

};