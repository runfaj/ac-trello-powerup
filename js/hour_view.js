var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var token, organizationId;
var scope = t.arg('scope');
var boards = [];
var boardLists = [];
var doneLoading = false;

function initialize(callback) {
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
    Trello.get(
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

function getListsInBoard(boardId, openOnly, includeArchived) {
    Trello.get(
        'boards/' + boardId + '/lists',
        {
            key: 'ad42f1ee6ea8f3fe9e31018b5f861536',
            token: token,
            filter: includeArchived ? 'all' : 'open,none',
            cards: includeArchived ? 'all' : 'open,none,visible',
            card_fields: 'all',
            fields: 'all'
        },
        function success(data, responseText, xhr) {
            if(callback) callback(data);
        },
        function error() {}
    );
}

function getLists() {
    function waitForAllLists(timeLeft) {
        if(boardLists.length === boards.length || timeLeft <= 0)
            doneLoading = true;
        else
            setTimeout(waitForAllLists.bind(null, timeLeft-100), 100);
    }

    for(var i=0;i<boards.length;i++) {
        getListsInBoard(function(data){
            boardLists[i] = data;
        });
    }

    waitForAllLists(10000);
}

initialize(function(){
    if(scope != 'board') {
        getBoards(function(data){
            boards = data;
            getLists();
        });
    } else {
        t.board('id','name')
            .then(function(board){
                boards.push(board);
                getLists();
            });
    }

    (function waitForData(timeLeft) {
        if(!doneLoading && timeLeft > 0)
            setTimeout(waitForData.bind(null, timeLeft - 100));
        else
            doneLoading = true;

        if(doneLoading) {
            console.log('boards', boards)
            console.log('lists', boardLists);
        }
    })(12000);
});
