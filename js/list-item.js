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
							+ this.data.title
							+ '<div class="count">' + this.count + '</div>'
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

		onTap: function () {

			if (this.collection.inMomentum) return;

			C.listCollection.fade(this.data.order);
			var todoCollection = new C.TodoCollection(this.data);
			todoCollection.itemEl = this;
			todoCollection.load();

		},

		done: function () {
			
			var i = this.data.items.length;
			while (i--) {
				this.data.items[i].done = true;
			}
			this.count = 0;
			this.updateCount();

			C.log('Completed entire list:' + this.data.title);
			C.db.save();

		},

		updateCount: function () {

			console.log(this.count);

			this.countEl.text(this.count);
			if (this.count === 0) this.el.addClass('empty');

		}

	};

	C.utils.extend(C.ListItem.prototype, C.Item, [
		'updatePosition',
		'onDragStart',
		'onDragMove',
		'onDragEnd',
		'onSortStart',
		'onSortMove',
		'onSortEnd',
		'checkSwap',
		'del'
	]);

}());