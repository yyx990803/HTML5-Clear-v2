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

	C.ListItem = function (data) {
		this.init(data);
	};

	C.ListItem.prototype = {

		init: function (data) {

			this.count = 0;

			var i = data.items.length,
				item;

			while (i--) {
				item = data.items[i];
				if (!item.done) this.count++;
			}

			if (this.count === 0) {
				this.noDragRight = true;
			}

			C.Item.init.apply(this, arguments);

		},

		render: function () {

			this.el = $('<div class="item list-item'
				+ (this.count ? '' : ' empty')
				+ '">'
					+ '<div class="slider">'
						+ '<div class="inner">'
							+ '<span class="title"><span class="text">' + this.data.title + '</span></span>'
							+ '<div class="count">' + this.count + '</div>'
							+ '<input class="field" type="text" value="' + this.data.title + '">'
						+ '</div>'
					+ '</div>'
				+ '</div>');

			this.countEl =this.el.find('.count');

		},

		updateColor: function () {

			var o = this.data.order,
				n = this.collection.count,
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

		open: function () {

			if (this.collection.inMomentum) return;

			this.el.addClass('fade');
			C.listCollection.fadeOut(this.data.order);

			var todoCollection = new C.TodoCollection(this.data);
			todoCollection.load(this.data.order);

			C.db.data.state = {
				view: C.states.TODOS,
				order: this.data.order
			};

			C.db.save();

		},

		done: function () {

			if (!confirm('Are you sure you want to complete all your items in this list?')) return;
			
			var i = this.data.items.length;
			while (i--) {
				this.data.items[i].done = true;
			}
			this.count = 0;
			this.updateCount();

			C.log('Completed entire list:' + this.data.title);
			C.db.save();

		},

		del: function (loopWithCallback) {

			if (this.count === 0) {
				C.Item.del.apply(this);
			} else {
				var t = this;
				loopWithCallback(function () {
					if (confirm('Are you sure you want to delete the entire list?')) {
						C.Item.del.apply(t);
					}
				});
			}
		},

		updateCount: function () {

			this.countEl.text(this.count);
			if (this.count === 0) {
				this.el.addClass('empty');
				this.noDragRight = true;
			} else {
				this.noDragRight = false;
			}

		}

	};

	C.utils.extend(C.ListItem.prototype, C.Item, [
		'updatePosition',
		'onTap',
		'onEditStart',
		'onEditDone',
		'onDragStart',
		'onDragMove',
		'onDragEnd',
		'onSortStart',
		'onSortMove',
		'onSortEnd',
		'checkSwap'
	]);

}());