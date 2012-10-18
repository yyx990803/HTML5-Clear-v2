C.listCollection = {

	y: 0,
	upperBound: 0,

	init: function () {

		C.log('ListCollection: init');

		this.data = C.db.data;
		this.items = [];
		this.render();
		this.populateItems();
		this.updateColor();
		this.updatePosition();

	},

	render: function () {

		this.el = $('<div id="list-collection" class="collection"></div>');
		this.style = this.el[0].style;

	},

	populateItems: function () {

		var lists = this.data.items,
			i = lists.length,
			li;

		this.count = i; // total number of lists
		this.hash = {}; // hash for accessing list item based on ID

		while (i--) {
			li = new C.ListItem(lists[i]);
			li.collection = this;
			li.el
				.data('id', i)
				.appendTo(this.el);
			this.items.push(li);
			this.hash[i] = li; // assign pointer in hash
		}

		this.updateBounds();

	},

	fade: function (at) {

		var t = this;
		t.el.addClass('fade');
		setTimeout(function () {
			t.el.css('display', 'none');
		}, 300);

	}

};

// Inherit methods
C.utils.extend(C.listCollection, C.Collection, [
	'getItemById',
	'getItemByOrder',
	'collapseAt',
	'countIncomplete',
	'updateBounds',
	'updateColor',
	'updatePosition',
	'onDragStart',
	'onDragMove',
	'onDragEnd',
	'sortMove'
]);