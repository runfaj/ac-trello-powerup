var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var projectList = [];
var userList = [];

t.render(checkAuth);

/** buttons **/
jQuery('.auth-btn').on('click',checkAuth);
jQuery('.add-project').on('click',onAddProject);
jQuery('.project-save').on('click',onSaveProject);
jQuery('.project-delete').on('click',onDeleteProject);
jQuery('.project-cancel').on('click',resetView);

/** inputs **/
jQuery('.project-name').on('keyup change',setSaveDisabledState);
jQuery('.billing-code').on('keyup change',setSaveDisabledState);
jQuery('.projects').on('change',onProjectChange);

/** helpers **/
function checkProjectValid() {
    var projectName = jQuery('.project-name').val();
    var billingCode = jQuery('.billing-code').val();
    var isAdding = jQuery('.selected-project').prop('adding');
    var editingIdx = jQuery('.selected-project').attr('editing');

    var nameExists = false;
    if(projectName) {
        for(var i=0;i<projectList.length;i++) {
            if(!isAdding && editingIdx == i) continue;
            if(projectName.toLowerCase() == projectList[i].name.toLowerCase())
                nameExists = true;
        }
    }

    var codeExists = false;
    if(projectName) {
        for(var i=0;i<projectList.length;i++) {
            if(!isAdding && editingIdx == i) continue;
            if(billingCode.toLowerCase() == projectList[i].code.toLowerCase())
                codeExists = true;
        }
    }

    return !nameExists && projectName.length >= 6 && !codeExists && billingCode.length >= 6;
}
function setSaveDisabledState() {
    var btn = jQuery('.project-save');
    btn.prop('disabled', !checkProjectValid());
}
function updateUserList() {
    var select = jQuery('.users');
    select.empty();
    select.append("<option value='-1'></option>");

    userList.sort(function(a,b){
        return a.fullName - b.fullName;
    });

    for(var i=0;i<userList.length;i++) {
        var fullName = userList[i].fullName;
        var group = userList[i].group || 'none';
        select.append("<option value='"+i+"'>"+fullName+" ("+group+")</option>");
    }

    console.log('user list:',userList);
}
function updateProjectList() {
    var select = jQuery('.projects');
    select.empty();
    select.append("<option value='-1'></option>");

    projectList.sort(function(a,b){
        return a.id - b.id;
    });

    for(var i=0;i<projectList.length;i++) {
        var projectName = projectList[i].name;
        var billingCode = projectList[i].code;
        select.append("<option value='"+i+"'>"+projectName+" ("+billingCode+")</option>");
    }

    console.log('project list:',projectList);
}
function saveProjectList() {
    t.set('organization', 'shared', 'projects', projectList)
        .then(function(){
            updateProjectList();
            resetView();
        });
}
function showProjectEditSection(isAdding, editingIdx) {
    jQuery('.projects').prop('disabled', true);
    jQuery('.add-project').prop('disabled', true);
    jQuery('.selected-project').addClass('show');
    if(isAdding) {
        jQuery('.selected-project').prop('adding', true);
    } else {
        jQuery('.selected-project').attr('editing', editingIdx);
    }
    setTimeout(function(){
        if(isAdding)
            jQuery('.project-delete').addClass('hide');
        else {
            jQuery('.project-delete').removeClass('hide');
            jQuery('.project-name').val(projectList[editingIdx].name);
            jQuery('.billing-code').val(projectList[editingIdx].code);
        }

        t.sizeTo('#content').done();
    });
}
function resetView() {
    jQuery('.regular-view').removeClass('hide');
    jQuery('.auth-view').addClass('hide');
    jQuery('.projects').prop('disabled', false);
    jQuery('.add-project').prop('disabled', false);
    jQuery('.selected-project')
        .removeClass('show')
        .prop('adding', false)
        .attr('editing', '');
    jQuery('.project-name').val('');
    jQuery('.billing-code').val('');

    setTimeout(function(){
        t.sizeTo('#content').done();
    });
}
function checkAuth() {
    return t.get('member', 'private', 'user_token')
        .then(function(token){
            if(!token) {
                Trello.authorize({
                    type: 'popup',
                    name: 'Allencomm Trello power-up',
                    expiration: 'never',
                    success: function() {
                        return t.set('member', 'private', 'user_token', localStorage.trello_token)
                            .then(onRender);
                    },
                    error: function() {
                        alert('Authorization failed. Please try again.')
                    }
                });
            } else {
                onRender();
            }
        });
};

/** handlers **/
function onSaveProject() {
    var isAdding = jQuery('.selected-project').prop('adding');
    var projectName = jQuery('.project-name').val();
    var billingCode = jQuery('.billing-code').val();
    var editingIdx = jQuery('.selected-project').attr('editing');

    if(isAdding) {
        var prevProj = projectList[projectList.length - 1];
        projectList.push({
            'id': prevProj ? prevProj.id + 1 : 1,
            'name': projectName,
            'code': billingCode
        });
    } else {
        projectList[editingIdx].name = projectName;
        projectList[editingIdx].code = billingCode;
    }

    saveProjectList();
}
function onAddProject() {
    showProjectEditSection(true, -1);
}
function onDeleteProject() {
    var editingIdx = jQuery('.selected-project').attr('editing');
    projectList.splice(editingIdx, 1);
    saveProjectList();
}
function onProjectChange() {
    var idx = jQuery('.projects').val();
    showProjectEditSection(false, idx);
}
function onRender() {
    return Promise.all([
            t.get('organization', 'shared', 'projects'),
            t.get('organization', 'shared', 'memberGroups'),
            t.get('member', 'private', 'user_token'),
            t.organization('id')
        ])
        .spread(function(projects, memberGroups, user_token, organization) {
            if(projects) projectList = projects;
            updateProjectList();

            if(memberGroups) userList = memberGroups;

            // get all the users of the organization and update member groups as needed
            Trello.get(
                'organizations/' + organization.id + '/members',
                {
                    key: 'ad42f1ee6ea8f3fe9e31018b5f861536',
                    token: user_token
                },
                function success(data, status, xhr) {
                    //add all new members
                    for(var i=0;i<data.length;i++) {
                        var memberExists = -1;
                        for(var j=0;j<memberGroups.length;j++) {
                            if(data[i].id == memberGroups[j].id) {
                                memberExists = j;
                                break;
                            }
                        }
                        if(memberExists == -1) {
                            memberGroups.push(data[i]);
                        }
                    }
                    //remove all stale members
                    for(var j=memberGroups.length - 1;j>=0;j--) {
                        var memberExists = -1;
                        for(var i=0;i<data.length;i++) {
                            if(data[i].id == memberGroups[j].id) {
                                memberExists = j;
                                break;
                            }
                        }
                        if(memberExists == -1) {
                            memberGroups.splice(j, 1);
                        }
                    }

                    updateUserList();
                },
                function error() {}
            );
        })
        .then(function() {
            resetView();
        });
}
