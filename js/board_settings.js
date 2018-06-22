var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var currTimeout = null;
var messageTimeout = null;

t.render(onRender);

/** inputs **/
jQuery('.billing-code').on('keyup change',onCodeChange);
jQuery('.groups').on('change',onGroupChange);

/** helpers **/
function onCodeChange() {
    var val = jQuery('.billing-code').val();

    window.clearTimeout(currTimeout);
    currTimeout = setTimeout(function(){
        t.set('board', 'shared', 'code', val)
            .then(function(){
                showMessage();
            });
    },250);
}
function onGroupChange() {
    var val = jQuery('.groups').val();
    t.set('member', 'shared', 'group', val)
        .then(function(){
            showMessage();
        });
}
function showMessage() {
    jQuery('.message').removeClass('hide');
    window.clearTimeout(messageTimeout);

    messageTimeout = setTimeout(function(){
        jQuery('.message').addClass('hide');
    }, 2000);
}
function onRender() {
    return Promise.all([
            t.get('board', 'shared', 'code'),
            t.get('member', 'shared', 'group')
        ])
        .spread(function(code, group) {
            jQuery('.billing-code').val(code);
            jQuery('.groups').val(group);
        })
        .then(function() {
            t.sizeTo('#content').done();
        });
}
