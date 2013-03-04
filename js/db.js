C.db = (function () {

    var supported = ('localStorage' in window) && ('JSON' in window),
        localStorageKey = C.client.isChromeApp ? 'html5-clear' : 'html5-clear-chrome',
        chromeStorage = C.client.isChromeApp ? chrome.storage.sync : null;

    var db = {

        init: function (force, callback) {

            C.log('DB: init');

            if (chromeStorage) {
                // Chrome package app
                chromeStorage.get(localStorageKey, function (data) {
                    db.parseRaw(data[localStorageKey], callback);
                });
            } else if (supported && !force) {
                // normal browser / webview
                db.parseRaw(localStorage.getItem(localStorageKey), callback);
            } else {
                db.useDefaultData(callback);
            }
            
        },

        parseRaw: function (raw, callback) {
            if (raw) {
                this.data = JSON.parse(raw);
                if (this.data) {
                    C.log('DB: using stored data.');
                    callback();
                } else {
                    this.useDefaultData(callback);
                }
            } else {
                this.useDefaultData(callback);
            }
        },

        save: function () {

            var start = Date.now();

            if (chromeStorage) {
                var saveOptions = {};
                saveOptions[localStorageKey] = JSON.stringify(this.data);
                chromeStorage.set(saveOptions, done);
            } else if (supported) {
                localStorage.setItem(localStorageKey, JSON.stringify(this.data));
                done();
            } else {
                return;
            }
            
            function done () {
                var used = Date.now() - start;
                C.log('DB: saved in ' + used + 'ms');
            }

        },

        deleteItem: function (target, list) {

            var i = list.items.length,
                item;

            while (i--) {
                item = list.items[i];
                if (item === target) {
                    list.items.splice(i, 1);
                    C.log('DB: deleted item <' + item.title + '> from collection <' + (list.title || 'Lists') + '>');
                    break;
                }
            }

        },

        addItem: function (item, list) {

            list.items.push(item);
            C.log('DB: added new item to collection <' + (list.title || 'Lists') + '>');

        },

        useDefaultData: function (callback) {

            C.log('DB: using default data.');

            this.data = {

                state: {
                    view: C.states.LIST_COLLECTION_VIEW,
                    lastTodoCollection: 0
                },

                items: [
                    {

                        title: 'How to Use',
                        order: 0,
                        items: [
                            {
                                order: 0,
                                title: 'Swipe right to complete'
                            },
                            {
                                order: 1,
                                title: 'Swipe left to delete'
                            },
                            {
                                order: 2,
                                title: 'Tap to edit'
                            },
                            {
                                order: 3,
                                title: 'Long tap to reorder'
                            },
                            {
                                order: 4,
                                title: 'Pull down to create new item'
                            },
                            {
                                order: 5,
                                title: 'Or tap in empty space below'
                            },
                            {
                                order: 6,
                                title: 'Pull down more to go back'
                            },
                            {
                                order: 7,
                                title: 'Pull up to clear'
                            },
                            {
                                order: 8,
                                title: 'Pinch is still WIP.'
                            }
                        ]
                    },
                    {
                        title: 'This is a demo',
                        order: 1,
                        items: [
                            {
                                order: 0,
                                title: 'About HTML5'
                            },
                            {
                                order: 1,
                                title: 'Walk the dog'
                            },
                            {
                                order: 2,
                                title: 'Read Node.js book'
                            },
                            {
                                order: 3,
                                title: 'Make a game'
                            },
                            {
                                order: 4,
                                title: 'Make a CMS'
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
                                title: 'I\'ve run out of stuff'
                            },
                            {
                                order: 9,
                                title: 'OK Test'
                            },
                            {
                                order: 10,
                                title: 'Moar test'
                            },
                            {
                                order: 11,
                                title: 'Moar test'
                            },
                            {
                                order: 12,
                                title: 'Moar test'
                            },
                            {
                                order: 13,
                                title: 'Moar test'
                            }
                        ]
                    },
                    {
                        title: 'By Evan You',
                        order: 2,
                        items: [
                            {
                                order: 0,
                                title: '@youyuxi'
                            }
                        ]
                    },
                    {
                        title: 'Test',
                        order: 3,
                        items: [
                            {
                                order: 0,
                                title: 'Test'
                            }
                        ]
                    },
                    {
                        title: 'Test',
                        order: 4,
                        items: [
                            {
                                order: 0,
                                title: 'Test'
                            }
                        ]
                    },
                    {
                        title: 'Test',
                        order: 5,
                        items: []
                    },
                    {
                        title: 'Test',
                        order: 6,
                        items: []
                    },
                    {
                        title: 'Test',
                        order: 7,
                        items: []
                    },
                    {
                        title: 'Test',
                        order: 8,
                        items: []
                    },{
                        title: 'Test',
                        order: 9,
                        items: []
                    },{
                        title: 'Test',
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
            callback();

        }

    };

    return db;

}());