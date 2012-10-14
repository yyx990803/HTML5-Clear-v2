C.TodoItem = function (data) {
	C.Item.init.apply(this, arguments);
};

C.TodoItem.prototype = {

	baseH: 354,
	baseS: 100,
	baseL: 46,

	render: function () {

		this.el = $('<div class="item todo-item">'
				+ '<div class="inner">'
					+ this.data.title
				+ '</div>'
			+ '</div>');

		this.style = this.el[0].style;

	},

	updatePosition: function () {

		this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

	},

	updateColor: function () {

		var o = this.data.order;
		this.style.backgroundColor = 'hsl('
			+ (this.baseH + o * 7) + ','
			+ (o ? (this.baseS - 10 - o * .4) : this.baseS)  + '%,'
			+ (this.baseL + o * 3) + '%)';

	},

	onTap: function () {
		console.log(this.data.title);
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