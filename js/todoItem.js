;(function () {

	var baseH = 354,
		baseS = 100,
		baseL = 46,

		stepH = 7,
		stepL = 2.5,

		maxColorSpan = 7,

		spanH = stepH * maxColorSpan,
		spanL = stepL * maxColorSpan;


	C.TodoItem = function (data) {
		C.Item.init.apply(this, arguments);
	};


	C.TodoItem.prototype = {

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

			var o = this.data.order,
				n = this.list.items.length,
				sH = stepH,
				sL = stepL;

			if (n > maxColorSpan) {
				sH = spanH / n;
				sL = spanL / n;
			}

			this.style.backgroundColor = 'hsl('
				+ (baseH + o * sH) + ','
				+ (o ? (baseS - 10) : baseS)  + '%,'
				+ (baseL + o * sL) + '%)';

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

}());