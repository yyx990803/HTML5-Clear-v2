C.listItem = function (data) {
	this.init(data);
};

C.listItem.prototype = {

	baseH: 212,
	baseS: 93,
	baseL: 53,

	init: function (data) {

		C.Item.init.apply(this, arguments);

		if (data.todos.length === 0) {
			this.noDragRight = true;
		}

	},

	render: function () {

		this.el = $('<div class="item list-item'
			+ (this.data.todos.length ? '' : ' empty')
			+ '">'
				+ '<div class="inner">'
					+ this.data.title
					+ '<div class="count">' + this.data.todos.length + '</div>'
				+ '</div>'
			+ '</div>');

		this.style = this.el[0].style;

	},

	updatePosition: function () {

		this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

	},

	updateColor: function () {

		this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

		var o = this.data.order;
		this.style.backgroundColor = 'hsl('
			+ (this.baseH - o * 2.5) + ','
			+ Math.min(100, (this.baseS + o * 1)) + '%,'
			+ Math.min(100, (this.baseL + o * 2.5)) + '%)';

	},

	onTap: function () {

		C.listView.fade(this.data.order);
		var todoView = new C.TodoView(this.data);
		todoView.load();

	},

	onDragStart: function () {
		C.Item.onDragStart.apply(this);
	},

	onDragMove: function (dx) {
		C.Item.onDragMove.apply(this, arguments);
	},

	onDragEnd: function () {
		C.Item.onDragEnd.apply(this);
	},

	del: function () {
		console.log("delete");
	},

	done: function () {
		console.log("done");
	}

};