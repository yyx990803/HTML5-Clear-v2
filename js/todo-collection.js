C.TodoCollection = function (data) {
	this.init(data);
};

C.TodoCollection.prototype = {

	init: function (data) {

		C.log('TodoCollection: init <' + data.title + '>');

		this.y = 0;
		this.upperBound = 0;

		this.data = data;
		this.items = [];
		this.render();
		this.populateItems();

		// find the corresponding list item
		var listItems = C.listCollection.items,
			i = listItems.length,
			item;

		while (i--) {
			item = listItems[i];
			if (item.data.order === this.data.order) {
				this.itemEl = item;
				break;
			}
		}

	},

	render: function () {

		this.el = $('<div class="collection"></div>');
		this.style = this.el[0].style;

	},

	populateItems: function () {

		var todos = this.data.items,
			i = todos.length,
			li;

		this.count = 0; // number of items not done
		this.hash = {}; // hash for getting items based on ID
		this.newIdFrom = i; // newly created item ID start from this


		while (i--) {
			li = new C.TodoItem(todos[i]);
			li.collection = this;

			li.el
				.data('id', i)
				.appendTo(this.el);

			this.items.push(li);
			this.hash[i] = li;
			if (!li.data.done) this.count++;
		}
		
		C.Collection.updateBounds.apply(this);

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

	unload: function () {

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

	}

};

// Inherit methods
C.utils.extend(C.TodoCollection.prototype, C.Collection, [
	'getItemById',
	'getItemByOrder',
	'getItemsBetween',
	'collapseAt',
	'countIncomplete',
	'updateBounds',
	'updateColor',
	'updatePosition',
	'onDragStart',
	'onDragMove',
	'onDragEnd',
	'sortMove',
	'onEditStart',
	'onEditDone'
]);