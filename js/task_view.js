var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var data = null;

var xhr = new XMLHttpRequest();

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === this.DONE) {
    console.log(this.responseText);
  }
});

xhr.open("GET", t.organization('id'));

xhr.send(data);

console.log('scope:', t.arg('scope'));

console.log('Data', data);

this.getBoards();

function getBoards() {
    return Promise.all(
            t.get('member', 'private', 'user_token')
            t.organization('id')
        )
        .spread(function(user_token, organizations) {
            Trello.get(
                'organizations/' + organizations[0].id + '/boards',
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
