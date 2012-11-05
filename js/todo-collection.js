C.TodoCollection = function (data) {
	this.init(data);
};

C.TodoCollection.prototype = {

	init: function (data) {

		C.log('TodoCollection: init <' + data.title + '>');

		this.base = C.Collection;
		this.itemType = C.TodoItem;

		// apply shared init
		this.base.init.apply(this, arguments);

		// custome init jobs
		// find the corresponding list item
		this.itemEl = C.listCollection.getItemByOrder(this.data.order);

	},

	render: function () {

		this.el = $('<div class="collection"></div>');
		this.style = this.el[0].style;

	},

	load: function (at, noAnimation) {

		var t = this;
		C.currentCollection = t;
		t.updateColor();

		if (noAnimation) {
			t.updatePosition();
			t.el.appendTo(C.$wrapper);
		} else {

			t.el
				.addClass('move')
				.appendTo(C.$wrapper);

			t.style.webkitTransform = 'translate3d(0,' + (at * 62 + C.listCollection.y) + 'px, 0)';

			setTimeout(function () {
				t.style.webkitTransform = 'translate3d(0, 0, 0)';
				t.updatePosition();

				setTimeout(function () {
					t.el.removeClass('move');
				}, 300);
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

		this.itemEl.count = this.count;
		this.itemEl.updateCount();

	},

	onPullDown: function () {

	},

	onPullUp: function () {

	},

	createNewItem: function () {
		this.base.createNewItem.apply(this);
	}

};

// Inherit methods
C.TodoCollection.prototype.__proto__ = C.Collection;