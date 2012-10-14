C.listItem = function (data) {
	this.init(data);
};

C.listItem.prototype = {

	baseH: 212,
	baseS: 93,
	baseL: 53,

	init: function (data) {

		this.x = 0;
		this.y = data.order * 64;
		this.data = data;

		this.render();
		this.update();

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

	update: function () {

		this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

		var o = this.data.order;
		this.style.backgroundColor = 'hsl('
			+ (this.baseH - o * 2.5) + ','
			+ Math.min(100, (this.baseS + o * 1)) + '%,'
			+ Math.min(100, (this.baseL + o * 2.5)) + '%)';

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

	}

};