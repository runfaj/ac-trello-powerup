var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

this.getBoards();

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
                },
                function error() {}
            );
        });
}
