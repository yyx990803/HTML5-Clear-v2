var C = {

    debug: window.location.hash.replace('#','') === 'debug',

    // dom elements
    $wrapper: $('#wrapper'),
    $log: $('#log'),

    // view states
    states: {
        LIST_COLLECTION_VIEW: 'lists',
        TODO_COLLECTION_VIEW: 'todos'
    },

    isEditing: false,

    ITEM_HEIGHT: 62,

    init: function () {

        C.start = Date.now();

        // init some components
        C.client.init();
        C.db.init(C.debug);
        C.touch.init();
        C.listCollection.init();

        // restore state
        var data = C.db.data,
            state = data.state,
            lists = data.items,
            i = lists.length;

        switch (state.view) {

            case C.states.LIST_COLLECTION_VIEW:
                C.log('App: init at ListCollection.');
                C.currentCollection = C.listCollection;
                break;

            case C.states.TODO_COLLECTION_VIEW:
                C.log('App: init at TodoCollection with order: ' + state.order);
                while (i--) {
                    if (lists[i].order === state.order) {
                        C.currentCollection = new C.TodoCollection(lists[i]);
                        break;
                    }
                }
                break;

            default:
                C.log('App: init at ListCollection.');
                C.currentCollection = C.listCollection;
                break;

        }

        C.currentCollection.load(0, true); // passing in (position:0) and (noAnimation:true)

        if (!C.listCollection.initiated) {
            // If we started with a TodoCollection, load ListCollection and position it for pulldown
            C.listCollection.positionForPulldown();
            C.listCollection.load();
        } else {
            // otherwise, load the last used todoCollection
            C.lastTodoCollection = new C.TodoCollection(lists[state.lastTodoCollection || 0]);
            C.lastTodoCollection.load(C.client.height + C.ITEM_HEIGHT, true);
            C.lastTodoCollection.positionForPullUp();
        }

    },

    setCurrentCollection: function (col) {

        var msg = 'Current collection set to: '
        C.log(msg + (col.data.title ? 'TodoCollection <' + col.data.title + '>' : 'ListCollection'));

        C.currentCollection = col;
        var state = C.db.data.state;
        state.view = col.stateType;
        state.order = col.data.order;
        C.db.save();

    },

    setLastTodoCollection: function (col) {

        C.lastTodoCollection = col;
        C.db.data.state.lastTodoCollection = col.data.order;
        C.db.save();

    },

    log: function (msg) {

        if (!this.debug) return;

        //$('#log').text(msg);

        var time = Date.now() - C.start;
        if (time < 1000) {
            time = '[' + time + 'ms] ';
        } else {
            time = '[' + (time / 1000).toFixed(2) + 's] ';
        }
        msg = time + msg;
        console.log(msg);

    },

    raf: window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 16);
        }

};

// boot up on page load
$(function () {
    C.init();
});