C.listItem = function (data) {
	this.init(data);
};

C.listItem.prototype = {

	init: function (data) {

		this.x = 0;
		this.y = data.order * 64;
		this.data = data;
		this.render();

	},

	render: function () {

		this.el = $('<div class="item list-item">'
			+ '<div class="inner">'
			+ this.data.title
			+ '</div>'
			+ '</div>');

		this.style = this.el[0].style;
		this.style.webkitTransform = 'translate3d(0,' + this.y + 'px, 0)';

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