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

			C.Item.init.apply(this, arguments);

			if (data.items.length === 0) {
				this.noDragRight = true;
			}

		},

		render: function () {

			this.el = $('<div class="item list-item'
				+ (this.data.items.length ? '' : ' empty')
				+ '">'
					+ '<div class="slider">'
						+ '<div class="inner">'
							+ this.data.title
							+ '<div class="count">' + this.data.items.length + '</div>'
						+ '</div>'
					+ '</div>'
				+ '</div>');

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
			todoCollection.load();

		},

		del: function () {
			C.Item.del.apply(this);
		},

		done: function () {
			console.log("done");
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
		'checkSwap'
	]);

}());