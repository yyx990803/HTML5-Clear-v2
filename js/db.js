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

				theme: 'heatmap',

				lists: [
					{

						title: 'Hello',
						order: 0,
						todos: [
							{
								title: 'Test'
							}
						]
					},
					{
						title: 'This is a demo',
						order: 1,
						todos: [
							{
								title: 'Test'
							}
						]
					},
					{
						title: 'By Evan You',
						order: 2,
						todos: [
							{
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