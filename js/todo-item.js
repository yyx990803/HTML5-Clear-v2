;(function () {

	var baseH = 354,
		baseS = 100,
		baseL = 46,

		stepH = 7,
		stepL = 2,

		maxColorSpan = 7,

		spanH = stepH * maxColorSpan,
		spanL = stepL * maxColorSpan;

	var leftBound = -62,
		rightBound = 62;

	C.TodoItem = function (data) {

		this.base = C.Item;
		this.h = baseH;
		this.s = baseS;
		this.l = baseL;
		
		this.base.init.apply(this, arguments);

	};

	C.TodoItem.prototype = {

		render: function () {

			this.el = $('<div class="item todo-item' + (this.data.done ? ' done' : '') + '" style="z-index:' + this.data.order + '">'
					+ '<div class="slider">'
						+ '<div class="inner">'
							+ '<span class="title">'
								+ '<span class="text">' + this.data.title + '</span>'
								+ '<span class="line"></span>'
							+ '</span>'
							+ '<input class="field" type="text" value="' + this.data.title + '">'
						+ '</div>'
					+ '</div>'
				+ '</div>');

			this.lineStyle = this.el.find('.line')[0].style;
			if (this.data.done) this.lineStyle.width = '100%';

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

		onDragMove: function (dx) {

			var w = (Math.min(1, Math.max(0, this.x / 62)) * 100).toFixed(2);
			this.lineStyle.width = (this.data.done ? 100 - w : w) + '%';

			if (this.x >= rightBound) {
				if (!this.activated) {
					this.activated = true;
					if (this.data.done) {
						this.updateColor(Math.min(this.data.order, maxColorSpan));
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

			this.base.onDragMove.apply(this, arguments);

		},

		onDragEnd: function () {

			if (this.x < rightBound) {
				if (this.data.done) {
					this.lineStyle.width = '100%';
				} else {
					this.lineStyle.width = '0%';
				}
			}

			this.base.onDragEnd.apply(this);

		},

		onSortEnd: function () {

			if (!this.data.done) {
				if (this.data.order >= this.collection.count) { // dragged into done zone
					this.beDone();
				}
			} else {
				if (this.data.order < this.collection.count) { // dragged back into undone zone!
					this.unDone();
				}
			}

			this.base.onSortEnd.apply(this);
		},

		done: function () {  // this is todoItem specific

			if (!this.data.done) {
				
				//modify state
				this.el.removeClass('green');
				this.beDone();

				//move myself
				var at = this.data.order;
				this.data.order = this.collection.count;
				this.updatePosition(true);

				//move others
				this.collection.collapseAt(at, this);

			} else {

				this.unDone();

				//float this one up from done ones, this is a todoCollection only method.
				this.collection.floatUp(this);

			}

			C.db.save();

		},

		beDone: function () {

			this.data.done = true;
			this.lineStyle.width = '100%';
			this.el.addClass('done');
			this.collection.count--;
			this.collection.updateCount();

		},

		unDone: function () {

			this.data.done = false;
			this.lineStyle.width = '0%';
			this.el.removeClass('done');
			this.collection.count++;
			this.collection.updateCount();

		}

	};

	// Inherit methods
	C.TodoItem.prototype.__proto__ = C.Item;

}());