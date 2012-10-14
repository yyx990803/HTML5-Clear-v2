C.TodoView = function (data) {
	this.init(data);
}

C.TodoView.prototype = {

	init: function (data) {

		C.log('TodoView: init (title:' + data.title + ')');

		this.y = 0;
		this.upperBound = 0;

		this.data = data;
		this.items = [];
		this.render();
		this.populateItems();

	},

	render: function () {

		this.el = $('<div class="list"></div>');
		this.style = this.el[0].style;

	},

	populateItems: function () {

		var todos = this.data.todos,
			i = todos.length,
			li;

		while (i--) {
			li = new C.TodoItem(todos[i]);
			li.el
				.data('id', this.items.length)
				.appendTo(this.el);
			this.items.push(li);
		}

		C.View.updateBounds.apply(this);

	},

	load: function () {

		var t = this;
		C.currentView = t;
		t.el.appendTo(C.$wrapper);
		setTimeout(function () {
			t.update();
		}, 1);

	},

	unload: function () {

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
	}

}