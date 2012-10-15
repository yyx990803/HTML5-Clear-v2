;(function () {

	var baseH = 354,
		baseS = 100,
		baseL = 46,

		stepH = 7,
		stepL = 2.5,

		maxColorSpan = 7,

		spanH = stepH * maxColorSpan,
		spanL = stepL * maxColorSpan;

	var leftBound = -64,
		rightBound = 64;

	C.TodoItem = function (data) {
		C.Item.init.apply(this, arguments);
	};


	C.TodoItem.prototype = {

		render: function () {

			this.el = $('<div class="item todo-item' + (this.data.done ? ' done' : '') + '">'
					+ '<div class="slider">'
						+ '<div class="inner">'
							+ '<span class="title">' + this.data.title + '</span>'
							+ '<div class="line"></div>'
						+ '</div>'
					+ '</div>'
				+ '</div>');

			this.lineStyle = this.el.find('.line')[0].style;

		},

		updatePosition: function () {
			C.Item.updatePosition.apply(this, arguments);
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

			this.sliderStyle.backgroundColor = 'hsl('
				+ (baseH + o * sH) + ','
				+ (o ? (baseS - 10) : baseS)  + '%,'
				+ (baseL + o * sL) + '%)';

		},

		onTap: function () {
			console.log(this.data.title);
		},

		onDragStart: function () {
			C.Item.onDragStart.apply(this);
			this.contentWidth = this.el.find('.title').width() + 7;
		},

		onDragMove: function (dx) {

			this.lineStyle.width = Math.min(this.contentWidth, Math.max(0, ~~(this.x / 64 * this.contentWidth))) + 'px';
			if (this.x >= rightBound) {
				if (!this.green) {
					this.green = true;
					this.el.addClass('green');
				}
			} else {
				if (this.green) {
					this.green = false;
					this.el.removeClass('green');
				}
			}

			C.Item.onDragMove.apply(this, arguments);

		},

		onDragEnd: function () {

			if (this.x < rightBound) {
				this.lineStyle.width = 0;
			}

			C.Item.onDragEnd.apply(this);

		},

		del: function () {
			console.log("delete");
		},

		done: function () {

			//TODO: data manipulation

			this.data.done = true;

			this.el
				.removeClass('green')
				.addClass('done');

			this.list.onDone(this);

		},

		cancel: function () {

		}

	};

}());