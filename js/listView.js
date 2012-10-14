C.listView = {

	y: 0,
	upperBound: 0,

	init: function () {

		C.log('ListView: init');

		this.items = [];
		this.render();
		this.populateItems();

	},

	render: function () {

		this.el = $('<div id="list-view" class="list"></div>');
		this.style = this.el[0].style;

	},

	populateItems: function () {

		var lists = C.db.data.lists,
			i = lists.length,
			li;

		while (i--) {
			li = new C.listItem(lists[i]);
			li.el
				.data('id', this.items.length)
				.appendTo(this.el);
			this.items.push(li);
		}

		C.View.updateBounds.apply(this);

	},

	update: function () {
		C.View.update.apply(this);
	},

	onDragStart: function () {
		C.View.onDragStart.apply(this);
	},

	onDragMove: function (dy) {
		C.View.onDragMove.apply(this, arguments);
	},

	onDragEnd: function () {
		C.View.onDragEnd.apply(this);
	},

	fade: function (at) {
		//TODO implement this
		var t = this;
		t.el.addClass('fade');
		setTimeout(function () {
			t.el.css('display', 'none');
		}, 300);
	}

};