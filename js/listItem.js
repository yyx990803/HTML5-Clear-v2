;(function () {

	var baseH = 212,
		baseS = 93,
		baseL = 53,

		stepH = -2.5,
		stepS = 1,
		stepL = 2.5,

		maxColorSpan = 5,

		spanH = maxColorSpan * stepH,
		spanS = maxColorSpan * stepS,
		spanL = maxColorSpan * stepL;

	C.listItem = function (data) {
		this.init(data);
	};

	C.listItem.prototype = {

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
					+ '<div class="slider">'
						+ '<div class="inner">'
							+ this.data.title
							+ '<div class="count">' + this.data.todos.length + '</div>'
						+ '</div>'
					+ '</div>'
				+ '</div>');

		},

		updatePosition: function () {
			C.Item.updatePosition.apply(this, arguments);
		},

		updateColor: function () {

			var o = this.data.order,
				n = this.list.items.length,
				sH = stepH,
				sS = stepS,
				sL = stepL;

			if (n > maxColorSpan) {
				sH = spanH / n;
				sS = spanS / n;
				sL = spanL / n;
			}

			this.sliderStyle.backgroundColor = 'hsl('
				+ (baseH + o * sH) + ','
				+ Math.min(100, (baseS + o * sS)) + '%,'
				+ Math.min(100, (baseL + o * sL)) + '%)';

		},

		onTap: function () {

			if (this.list.inMomentum) return;

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
		},

		cancel: function () {

		}

	};

}());