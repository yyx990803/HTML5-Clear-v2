C.listCollection = {

	y: 0,
	upperBound: 0,

	init: function () {

		C.log('ListCollection: init');

		this.items = [];
		this.render();
		this.populateItems();
		this.updateColor();
		this.updatePosition();

	},

	render: function () {

		this.el = $('<div id="list-collection" class="collection"></div>');
		this.style = this.el[0].style;

	},

	populateItems: function () {

		var lists = C.db.data.lists,
			i = lists.length,
			li;

		this.count = i; // total number of lists
		this.hash = {}; // hash for accessing list item based on ID

		while (i--) {
			li = new C.listItem(lists[i]);
			li.collection = this;
			//li.id = this.items.length;
			li.el
				.data('id', i)
				.appendTo(this.el);
			this.items.push(li);
			this.hash[i] = li;
		}

		C.Collection.updateBounds.apply(this);

	},

	fade: function (at) {

		var t = this;
		t.el.addClass('fade');
		setTimeout(function () {
			t.el.css('display', 'none');
		}, 300);

	},

	getItemById: function () {
		return C.Collection.getItemById.apply(this, arguments);
	},

	getItemByOrder: function () {
		return C.Collection.getItemByOrder.apply(this, arguments);
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

};