C.listCollection = {

	y: 0,
	upperBound: 0,

	init: function () {

		C.log('ListCollection: init');

		this.data = C.db.data;
		this.items = [];
		this.render();
		this.populateItems();
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

	populateItems: function () {

		var lists = this.data.items,
			i = lists.length,
			li;

		this.count = i; // total number of lists
		this.hash = {}; // hash for accessing list item based on ID

		while (i--) {
			li = new C.ListItem(lists[i]);
			li.collection = this;
			li.el
				.data('id', i)
				.appendTo(this.el);
			this.items.push(li);
			this.hash[i] = li; // assign pointer in hash
		}

		this.updateBounds();

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
		t.el.addClass('fade');

		// hide
		setTimeout(function () {
			t.el.css('display', 'none');
		}, 300);

	},

	onPullDown: function () {
		// do nothing, menu not implemented
	},

	onPullUp: function () {
		// goes to the last opened list
	},

	createNewItem: function () {
		C.Collection.createNewItem.apply(this);
	}

};

// inherit shared methods
C.listCollection.__proto__ = C.Collection;