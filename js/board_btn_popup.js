var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var projectList = [];
var userList = [];

t.render(checkAuth);

/** buttons **/
jQuery('.auth-btn').on('click',checkAuth);
jQuery('.item.settings').on('click',onSettingsClick);
jQuery('.item.tasks.mine').on('click',openTaskView.bind(null, 'mine', 'My Tasks'));
jQuery('.item.tasks.projects').on('click',openTaskView.bind(null, 'projects', 'My Projects'));
jQuery('.item.tasks.all').on('click',openTaskView.bind(null, 'all', 'All Projects'));
jQuery('.item.hour.mine').on('click',openHourView.bind(null, 'mine', 'My Tasks'));
jQuery('.item.hour.board').on('click',openHourView.bind(null, 'board', 'Board Tasks'));
jQuery('.item.hour.group').on('click',openHourView.bind(null, 'group', 'Group Tasks'));
jQuery('.info-icon').on('click',onTipClick);

/** helpers **/
function resetView() {
    jQuery('.regular-view').removeClass('hide');
    jQuery('.auth-view').addClass('hide');

    setTimeout(function(){
        t.sizeTo('.item-list').done();
    });
}
function checkAuth() {
    return t.get('member', 'private', 'user_token')
        .then(function(token){
            if(!token) {
                Trello.authorize({
                    type: 'popup',
                    name: 'Allencomm Trello Power-up',
                    expiration: 'never',
                    success: function() {
                        return t.set('member', 'private', 'user_token', localStorage.trello_token)
                            .then(onRender);
                    },
                    error: function() {
                        alert('Authorization failed. Please try again.');
                    }
                });
            } else {
                onRender();
            }
        });
};
function openTaskView(scope, prettyScope) {
    t.modal({
        url: './task_view.html',
        accentColor: '#d46128',
        fullscreen: false,
        height: 820,
        title: 'Task View: ' + prettyScope,
        args: {
            scope: scope
        }
    });
}
function openHourView(scope, prettyScope) {
    t.modal({
        url: './hour_view.html',
        accentColor: '#d46128',
        fullscreen: false,
        height: 820,
        title: 'Hour View: ' + prettyScope,
        args: {
            scope: scope
        }
    });
}

/** handlers **/
function onSettingsClick() {
    return t.popup({title: 'Allencomm Power-up Settings', url: './board_settings.html'});
}

function onRender() {
    // return Promise.all([
    //         t.get('organization', 'shared', 'projects'),
    //         t.get('organization', 'shared', 'memberGroups'),
    //         t.get('member', 'private', 'user_token'),
    //         t.organization('id')
    //     ])
    //     .spread(function(projects, memberGroups, user_token, organization) {
    //         if(projects) projectList = projects;
    //         updateProjectList();
    //
    //         if(memberGroups) userList = memberGroups;
    //
    //         // get all the users of the organization and update member groups as needed
    //         Trello.get(
    //             'organizations/' + organization.id + '/members',
    //             {
    //                 key: 'ad42f1ee6ea8f3fe9e31018b5f861536',
    //                 token: user_token
    //             },
    //             function success(data, status, xhr) {
    //                 //add all new members
    //                 for(var i=0;i<data.length;i++) {
    //                     var memberExists = -1;
    //                     for(var j=0;j<userList.length;j++) {
    //                         if(data[i].id == userList[j].id) {
    //                             memberExists = j;
    //                             break;
    //                         }
    //                     }
    //                     if(memberExists == -1) {
    //                         userList.push(data[i]);
    //                     }
    //                 }
    //                 //remove all stale members
    //                 for(var j=userList.length - 1;j>=0;j--) {
    //                     var memberExists = -1;
    //                     for(var i=0;i<data.length;i++) {
    //                         if(data[i].id == userList[j].id) {
    //                             memberExists = j;
    //                             break;
    //                         }
    //                     }
    //                     if(memberExists == -1) {
    //                         userList.splice(j, 1);
    //                     }
    //                 }
    //
    //                 updateUserList();
    //                 t.set('organization', 'shared', 'memberGroups', userList);
    //             },
    //             function error() {}
    //         );
    //     })
    //     .then(function() {
    //         resetView();
    //     });
    resetView();
}
function onTipClick(e) {
    e.preventDefault();
    e.stopPropagation();

    var tip = jQuery(this);
    alert(tip.attr('text'));
}
