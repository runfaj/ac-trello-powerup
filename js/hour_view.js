/**** todo:
    Batch requests (max group of 10 together)
****/

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

/** args from parent **/
var scopeFilter = t.arg('scope');

/** state variables **/
var token, organizationId;

/** data variables **/
var boards = [];

/************ data getters *************/
function initialize(callback) {
    /** initialize by getting user token and org id, returns bluebird promise **/

    return Promise.all([
        t.get('member', 'private', 'user_token'),
        t.organization('id')
    ])
    .spread(function(user_token, organization) {
        token = user_token;
        organizationId = organization.id;

        if(callback) callback();
    });
}
function getBoards(callback) {
    /** get all boards for organization, returns jquery promise **/

    return Trello.get(
        'organizations/' + organizationId + '/boards',
        {
            key: 'ad42f1ee6ea8f3fe9e31018b5f861536',
            token: token,
            filter: 'open',
            fields: 'name,id'
        },
        function success(data, responseText, xhr) {
            if(callback) callback(data);
        },
        function error() {}
    );
}
function getListsInBoard(boardId, callback, includeArchived) {
    /** for a board, get all lists, returns jquery promise **/

    return Trello.get(
        'boards/' + boardId + '/lists',
        {
            key: 'ad42f1ee6ea8f3fe9e31018b5f861536',
            token: token,
            cards: includeArchived ? 'all' : 'visible',
            card_fields: 'all',
            filter: includeArchived ? 'all' : 'open',
            fields: 'all'
        },
        function success(data, responseText, xhr) {
            if(callback) callback(data);
        },
        function error() {}
    );
}
function getCardPluginData(cardId) {
    /** gets plugin data for a specific card, returns jquery promise **/

    return Trello.get(
        'cards/' + cardId + '/pluginData',
        {
            key: 'ad42f1ee6ea8f3fe9e31018b5f861536',
            token: token
        },
        function success(data, responseText, xhr) {
            if(callback) callback(data);
        },
        function error() {}
    );
}

/*************** utils ****************/
function getLists() {
    console.log('load lists')
    /** initializes getting lists for each board, returns collection of promises **/

    var promises = [];

    boards.forEach(function(board, i){
        promises.push(getListsInBoard(board.id, function(data){
            boards[i].lists = data;
            console.log('list loaded:', boards[i].name)
        }));
    });

    return promises;
}
function getCardDatas() {
    /** gets plugin data for all cards, returns collection of promises **/
    /** NOTE! This should be called after the lists and cards have been filtered to help save request amounts **/

    var promises = [];

    boards.forEach(function(board, i){
        board.lists.forEach(function(list, l){
            list.cards.forEach(function(card, c){
                promises.push(getCardPluginData(card.id, function(data){
                    boards[i].lists[l].cards[c].customData = data;
                    console.log('card loaded:', boards[i].name)
                }));
            });
        });
    });

    return promises;
}
function getOpenLists(includeVerify) {
    /** gets open lists across all boards **/

    var nameList = [
        'new',
        'bugs',
        'pm',
        'project manager',
        'program manager',
        'design',
        'writer',
        'qc',
        'quality control',
        'art',
        'programming',
        'tech lead',
        'tl',
        'programmer',
    ];
    if(includeVerify) {
        nameList.push('verify');
        nameList.push('verification');
    }

    //filter out any non-open lists
    //loop through boards
    return boards.map(function(board, b){
        var out = {
            id: board.id,
            name: board.name,
            lists: []
        };

        //for each board, loop through lists
        (board.lists || []).forEach(function(list, i){
            var name = list.name.toLowerCase();

            //loop through all valid names above
            for(var j=0;j<nameList.length;j++) {
                var f = nameList[j];

                if(name.indexOf(f) > -1) {
                    //if list name in valid name, add list to output
                    out.lists.push(list);
                    break;
                }
            }
        });

        return out;
    });
}

// start getting data
t.render(function(){
    return initialize(function(){
        console.log('start loading');
        var doneLoading = false;

        //compile list of boards (either 1 or many)
        if(scopeFilter != 'board') {
            getBoards(function(data){
                boards = data;

                //after we have the boards, get the list/card data
                jQuery.when.apply(jQuery, getLists()).then(onListsFinished);
            });
        } else {
            t.board('id','name')
                .then(function(board){
                    boards.push(board);

                    //after we have the boards, get the list/card data
                    jQuery.when.apply(jQuery, getLists()).then(onListsFinished);
                });
        }

        function onListsFinished() {
            boards = getOpenLists(true);

            // after we have the lists, get all the card custom data
            jQuery.when.apply(jQuery, getCardDatas()).then(function(){
                doneLoading = true;
            });
        }

        //wait for all the data to be retrived before continuing
        (function waitForData(timeLeft) {
            if(doneLoading || timeLeft <= 0) {
                console.log('done loading');
                getInitialView();
            } else {
                setTimeout(waitForData.bind(null, timeLeft - 100), 100);
            }
        })(15000);
    });
});

function getInitialView() {
    if(scopeFilter === 'me') {

    } else {

    }
}
