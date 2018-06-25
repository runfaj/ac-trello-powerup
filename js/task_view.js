var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var data = null;

var xhr = new XMLHttpRequest();

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === this.DONE) {
    console.log(this.responseText);
  }
});

xhr.open("GET", "https://api.trello.com/1/organizations/id/actions");

xhr.send(data);

console.log('scope');
console.log(t.arg('scope'));
console.log('Data');
console.log(data);


