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

		useDefaultData: function () {

			C.log('DB: using default data.');

			this.data = {

				state: {
					view: C.states.LISTS
				},

				lists: [
					{

						title: 'Hello',
						order: 0,
						todos: [
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
								title: 'Test4'
							},
							{
								order: 6,
								title: 'Test4'
							},
							{
								order: 7,
								title: 'Test4'
							},
							{
								order: 8,
								title: 'Test4'
							},
							{
								order: 9,
								title: 'Test4'
							},
							{
								order: 10,
								title: 'Test4'
							},
							{
								order: 11,
								title: 'Test4'
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
						todos: []
					},
					{
						title: 'By Evan You',
						order: 2,
						todos: [
							{
								order: 0,
								title: 'Test'
							}
						]
					},
					{
						title: 'This is a demo',
						order: 3,
						todos: [
							{
								order: 0,
								title: 'Test'
							}
						]
					},
					{
						title: 'This is a demo',
						order: 4,
						todos: [
							{
								order: 0,
								title: 'Test'
							}
						]
					},
					{
						title: 'This is a demo',
						order: 5,
						todos: []
					},
					{
						title: 'This is a demo',
						order: 6,
						todos: []
					},
					{
						title: 'This is a demo',
						order: 7,
						todos: []
					},
					{
						title: 'This is a demo',
						order: 8,
						todos: []
					},{
						title: 'This is a demo',
						order: 9,
						todos: []
					},{
						title: 'This is a demo',
						order: 10,
						todos: [
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