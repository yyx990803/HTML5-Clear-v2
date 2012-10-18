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
		this.init(data);
	};


	C.TodoItem.prototype = {

		init: function (data) {
			C.Item.init.apply(this, arguments);
		},

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

		updateContentWidth: function () {
			this.contentWidth = this.el.find('.title').width() + 7;
			if (this.data.done) this.lineStyle.width = this.contentWidth + 'px';
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

		onDragMove: function (dx) {

			var w = Math.min(this.contentWidth, Math.max(0, ~~(this.x / 64 * this.contentWidth)));
			this.lineStyle.width = (this.data.done ? this.contentWidth - w : w) + 'px';

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

			C.Item.onSortEnd.apply(this);
		},

		del: function () {
			
			C.Item.del.apply(this);

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
			this.lineStyle.width = this.contentWidth + 'px';
			this.el.addClass('done');
			this.collection.count--;

		},

		unDone: function () {

			this.data.done = false;
			this.lineStyle.width = '0px';
			this.el.removeClass('done');
			this.collection.count++;

		}

	};

	// Inherit methods
	C.utils.extend(C.TodoItem.prototype, C.Item, [
		'updatePosition',
		'onDragStart',
		'onSortStart',
		'onSortMove',
		'checkSwap',
		'del'
	]);

}());