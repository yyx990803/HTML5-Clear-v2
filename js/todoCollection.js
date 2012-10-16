C.TodoCollection = function (data) {
	this.init(data);
}

C.TodoCollection.prototype = {

	init: function (data) {

		C.log('TodoCollection: init (title:' + data.title + ')');

		this.y = 0;
		this.upperBound = 0;

		this.data = data;
		this.items = [];
		this.render();
		this.populateItems();

	},

	render: function () {

		this.el = $('<div class="collection"></div>');
		this.style = this.el[0].style;

	},

	populateItems: function () {

		this.count = 0;

		var todos = this.data.todos,
			i = todos.length,
			li;

		while (i--) {
			li = new C.TodoItem(todos[i]);
			li.collection = this;
			li.id = this.items.length;
			li.el
				.data('id', li.id)
				.appendTo(this.el);
			this.items.push(li);
			if (!li.data.done) this.count++;
		}

		this.newIdFrom = this.items.length; // newly created item id start from this
		C.Collection.updateBounds.apply(this);

	},

	load: function () {

		var t = this;
		C.currentCollection = t;
		t.updateColor();
		t.el.appendTo(C.$wrapper);
		setTimeout(function () {
			t.updatePosition();
		}, 1);

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

	getItem: function () {
		return C.Collection.getItem.apply(this, arguments);
	},

	collapseAt: function () {
		C.Collection.collapseAt.apply(this, arguments);
	},

	countIncomplete: function () {
		C.Collection.countIncomplete.apply(this, arguments);
	},

	updateBounds: function () {
		C.Collection.updateBounds.apply(this, arguments);
	},

	updateColor: function () {
		C.Collection.updateColor.apply(this, arguments);
	},

	updatePosition: function () {
		C.Collection.updatePosition.apply(this, arguments);
	},

	onDragStart: function () {
		C.Collection.onDragStart.apply(this, arguments);
	},

	onDragMove: function () {
		C.Collection.onDragMove.apply(this, arguments);
	},

	onDragEnd: function () {
		C.Collection.onDragEnd.apply(this, arguments);
	}

}