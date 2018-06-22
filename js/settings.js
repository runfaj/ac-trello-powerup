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
function updateProjectList() {
    var select = jQuery('.projects');

    projectList.sort(function(a,b){
        return a.id - b.id;
    });

    select.empty();
    select.append("<option value='-1'></option>");
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
    // t.organization('id').then(function(organization){
    //     console.log('org',organization)
    // });

    return Promise.all([
            t.get('organization', 'shared', 'projects'),
            t.get('member', 'private', 'user_token')
        ])
        .spread(function(projects, user_token) {
            if(projects) projectList = projects;
            updateProjectList();

            console.log('token', user_token)
        })
        .then(function() {
            resetView();
        });
}
