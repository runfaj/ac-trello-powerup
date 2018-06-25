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

function getListsInBoard(boardId, callback, includeArchived) {
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

// https://api.trello.com/1/boards/5b0d6fe552a76d056b9bf3b1/lists
// ?key=ad42f1ee6ea8f3fe9e31018b5f861536
// &token=c23b664d731e406dbab0c3ee41546587d48e1f3de80763e06841f54e84d14851
// &filter=open
// &cards=open
// &card_fields=all
// &fields=all

function getLists() {
    function waitForAllLists(timeLeft) {
        if(boardLists.length === boards.length || timeLeft <= 0)
            doneLoading = true;
        else
            setTimeout(waitForAllLists.bind(null, timeLeft-100), 100);
    }

    for(var i=0;i<boards.length;i++) {
        var board = boards[i];

        getListsInBoard(board.id, function(data){
            boardLists[i] = data;
        });
    }

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
    var filtered = [];

    //filter out any non-open lists
    for(var b=0;b<boardLists.length;b++) {
        var board = boardLists[b];
        var out = [];

        for(var i=0;i<board.length;i++) {
            var list = board[i];
            var name = list.name.toLowerCase();

            for(var j=0;j<nameList.length;j++) {
                var f = nameList[i];

                if(name.indexOf(f) > -1) {
                    out.push(data[i]);
                    continue;
                }
            }
        }

        filtered.push(out);
    }

    return filtered;
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
        if(doneLoading || timeLeft <= 0) {
            console.log('boards', boards);
            console.log('lists', boardLists);
            console.log('open lists', getOpenLists());
        } else {
            setTimeout(waitForData.bind(null, timeLeft - 100));
        }
    })(12000);
});
