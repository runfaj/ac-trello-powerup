var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

/** args from parent **/
var scope = t.arg('scope');

/** state variables **/
var token, organizationId;
var doneLoading = false;
var boardListsLoaded = [];

/** data variables **/
var boards = [];
var filteredBoards = [];

/*************** utils ****************/
function initialize(callback) {
    /** initialize by getting user token and org id **/

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
    /** get all boards for organization **/

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
function getListsInBoard(boardId, callback, includeArchived) {
    /** for a board, get all lists **/

    Trello.get(
        'boards/' + boardId + '/lists',
        {
            key: 'ad42f1ee6ea8f3fe9e31018b5f861536',
            token: token,
            cards: includeArchived ? 'all' : 'open',
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
function getLists() {
    /** initializes getting lists for each board
        also tracks when done loading **/

    doneLoading = false;

    function waitForAllLists(timeLeft) {
        if(boardListsLoaded.every(function(b){return b;}) || timeLeft <= 0)
            doneLoading = true;
        else
            setTimeout(waitForAllLists.bind(null, timeLeft-100), 100);
    }

    boards.forEach(function(board, i){
        boardListsLoaded.push(false);
        getListsInBoard(board.id, function(data){
            boards[i].lists = data;
            boardListsLoaded[i] = true;
        });
    });

    waitForAllLists(10000);
}
function getOpenLists(includeVerify) {
    /** gets open lists across all boards **/

    var nameList = [
        'new',
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

        if(board.name === 'PGA')
            debugger;

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
        //compile list of boards (either 1 or many)
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

        //wait for all the list data to be retrived before continuing
        (function waitForData(timeLeft) {
            if(doneLoading || timeLeft <= 0) {
                console.log('boards', boards);
                filteredBoards = getOpenLists();
                console.log('open lists', filteredBoards);
            } else {
                setTimeout(waitForData.bind(null, timeLeft - 100));
            }
        })(12000);
    });
});
