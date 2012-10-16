;(function () {

	var baseH = 354,
		baseS = 100,
		baseL = 46,

		stepH = 7,
		stepL = 2,

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

		updateColor: function (order) {

			var o = order || this.data.order,
				n = this.collection.count,
				sH = stepH,
				sL = stepL;

			if (n > maxColorSpan && !order) {
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

			var w = Math.min(this.contentWidth, Math.max(0, ~~(this.x / 64 * this.contentWidth)));
			this.lineStyle.width = (this.data.done ? this.contentWidth - w : w) + 'px';

			if (this.x >= rightBound) {
				if (!this.activated) {
					this.activated = true;
					if (this.data.done) {
						this.updateColor(maxColorSpan);
						this.el.removeClass('done');
					} else {
						this.el.addClass('green');
					}
				}
			} else {
				if (this.activated) {
					this.activated = false;
					if (this.data.done) {
						this.el.addClass('done');
					} else {
						this.el.removeClass('green');
					}
				}
			}

			C.Item.onDragMove.apply(this, arguments);

		},

		onDragEnd: function () {

			if (this.x < rightBound) {
				if (this.data.done) {
					this.lineStyle.width = this.contentWidth;
				} else {
					this.lineStyle.width = 0;
				}
			}

			C.Item.onDragEnd.apply(this);

		},

		del: function () {
			
			C.Item.del.apply(this);

		},

		done: function () {

			//TODO: data manipulation

			if (!this.data.done) {

				this.data.done = true;
				this.collection.count--;

				//move myself
				var at = this.data.order;
				this.data.order = this.collection.count;
				this.updatePosition(true);
				this.el
					.removeClass('green')
					.addClass('done');

				//move others
				this.collection.collapseAt(at, this);

			} else {

				this.data.done = false;
				this.el.removeClass('done');
				this.collection.count++;

				//float this one up from done ones, this is a todoCollection only method.
				this.collection.floatUp(this);

			}

		}

	};

}());