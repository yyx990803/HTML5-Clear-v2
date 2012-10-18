C.db = (function () {

	var supported = ('localStorage' in window) && ('JSON' in window);

	var db = {

		init: function (force) {

			C.log('DB: init');

			if (supported && !force) {
				var raw = localStorage.getItem('html5clear');
				if (raw) {
					this.data = JSON.parse(raw);
					if (!this.data) {
						this.useDefaultData();
					} else {
						 C.log('DB: using stored data.');
					}
				} else {
					this.useDefaultData();
				}
			} else {
				this.useDefaultData();
			}
			
		},

		save: function () {

			if (!supported) return;
			var raw = JSON.stringify(this.data);
			localStorage.setItem('html5clear', raw);

			C.log('DB: saved.');

		},

		deleteItem: function (target, list) {

			var i = list.items.length,
				item;

			while (i--) {
				item = list.items[i];
				if (item === target) {
					list.items.splice(i, 1);
					C.log('DB: deleted item <' + item.title + '> from collection <' + (list.title || 'Lists')+ '>');
					break;
				}
			}

			C.db.save();

		},

		useDefaultData: function () {

			C.log('DB: using default data.');

			this.data = {

				state: {
					view: C.states.LISTS
				},

				items: [
					{

						title: 'Hello',
						order: 0,
						items: [
							{
								order: 0,
								title: 'Test1'
							},
							{
								order: 1,
								title: 'Test2'
							},
							{
								order: 2,
								title: 'Test3'
							},
							{
								order: 3,
								title: 'Test4'
							},
							{
								order: 4,
								title: 'Test4'
							},
							{
								order: 5,
								title: 'Wanna fork?'
							},
							{
								order: 6,
								title: 'Fork me yo'
							},
							{
								order: 7,
								title: 'Yeah'
							},
							{
								order: 8,
								title: 'Goooooogle this shit'
							},
							{
								order: 9,
								title: 'Come on come on'
							},
							{
								order: 10,
								title: 'dued dueduedueduedu'
							},
							{
								order: 11,
								title: 'HAHAHAHAHAH'
							},
							{
								order: 12,
								title: 'Test4'
							},
							{
								order: 13,
								title: 'Test4'
							}
						]
					},
					{
						title: 'This is a demo',
						order: 1,
						items: [
							{
								order: 0,
								title: 'Test'
							},
							{
								order: 1,
								title: 'Test'
							},
							{
								order: 2,
								title: 'Test'
							}
						]
					},
					{
						title: 'By Evan You',
						order: 2,
						items: [
							{
								order: 0,
								title: 'Test'
							}
						]
					},
					{
						title: 'This is a demo',
						order: 3,
						items: [
							{
								order: 0,
								title: 'Test'
							}
						]
					},
					{
						title: 'This is a demo',
						order: 4,
						items: [
							{
								order: 0,
								title: 'Test'
							}
						]
					},
					{
						title: 'This is a demo',
						order: 5,
						items: []
					},
					{
						title: 'This is a demo',
						order: 6,
						items: []
					},
					{
						title: 'This is a demo',
						order: 7,
						items: []
					},
					{
						title: 'This is a demo',
						order: 8,
						items: []
					},{
						title: 'This is a demo',
						order: 9,
						items: []
					},{
						title: 'This is a demo',
						order: 10,
						items: [
							{
								order: 0,
								title: 'Test'
							}
						]
					}
				]

			};

			this.save();

		}

	};

	return db;

}());