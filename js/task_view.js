var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

this.boards = null;
this.getBoards();

console.log("boards", this.boards);

function getLists(board){
	return Promise.all([
            t.get('member', 'private', 'user_token'),
            t.organization('id')
        ])
        .spread(function(user_token, organization) {
            Trello.get(
                'organizations/' + organization.id + '/boards' + board.id + '/lists',
                {
                    key: 'ad42f1ee6ea8f3fe9e31018b5f861536',
                    token: user_token,
                    filter: 'open',
                    fields: 'name,id'
                },
                function success(data, responseText, xhr) {
                    console.log('json data:', data)
                },
                function error() {}
            );
        });
}

function getBoards() {
    return Promise.all([
            t.get('member', 'private', 'user_token'),
            t.organization('id')
        ])
        .spread(function(user_token, organization) {
            Trello.get(
                'organizations/' + organization.id + '/boards',
                {
                    key: 'ad42f1ee6ea8f3fe9e31018b5f861536',
                    token: user_token,
                    filter: 'open',
                    fields: 'name,id'
                },
                function success(data, responseText, xhr) {
                    console.log('json data:', data)
                    this.boards = data;
                     for(var i = 0; i < data.length; i++)
					{
						this.getLists(data[i]);
						console.log('list ' + i);
					}
                },
                function error() {}
            );
        });
}

