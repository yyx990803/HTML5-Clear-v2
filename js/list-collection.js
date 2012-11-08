C.listCollection = {

	init: function () {

		C.log('ListCollection: init');

		this.base = C.Collection;
		this.itemType = C.ListItem;

		// apply shared init
		this.base.init.apply(this, arguments);

		// private init jobs
		this.updateColor();
		this.updatePosition();

	},

	render: function () {

		this.el = $('<div id="list-collection" class="collection">'
					+ '<div class="credit">Made by Evan You <br> Original iOS app by Realmac</div>'
					+ '</div>');
		this.style = this.el[0].style;

	},

	load: function () {

		this.el.appendTo(C.$wrapper);

	},

	fadeOut: function (at) {

		var t = this;

		// move current and up to top, drop anything below
		var i = t.items.length,
			item,
			ty;
		while (i--) {
			item = t.items[i];
			if (item.data.order <= at) {
				ty = (item.data.order - at) * 62 - t.y;
			} else {
				ty = C.client.height + (item.data.order - at) * 62 - t.y;
			}
			item.style.webkitTransform = 'translate3d(0,' + ty + 'px, 0)';
		}

		// fade out
		t.el
			.addClass('fade')
			.on('webkitTransitionEnd', function () {
				t.el
					.off('webkitTransitionEnd')
					.css('display', 'none');
			});

	},

	onPullDown: function () {
		// do nothing, menu not implemented
	},

	onPullUp: function () {
		// goes to the last opened list
	},

	createNewItem: function () {
		this.base.createNewItem.apply(this);
	}

};

// inherit shared methods
C.listCollection.__proto__ = C.Collection;