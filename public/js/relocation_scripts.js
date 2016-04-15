var solidWorks = solidWorks || {};

(function(){

    'use strict';

    solidWorks.relocation = {

        modelPath: '/models/',

        reloadWithToken: function(newLocation, reloadWindow) {
            alert('>>> token is: ' + newLocation);
            if (localStorage && 'token' in localStorage) {
                newLocation += ('?token=' + localStorage['token']);
            }
            if (reloadWindow) {
                window.location.assign(newLocation);
            }
            return newLocation;
        },


        stlDownload: function() {
            var action = solidWorks.relocation.modelPath;
            var paramDict = getUrlVars(window.location.href);
            if ('stl' in paramDict) {
                action += paramDict['stl'];
            }
            solidWorks.relocation.reloadWithToken(action, true);
        },


        addTokenToAction: function(form) {
            form.action = solidWorks.relocation.reloadWithToken(form.action, false);
        },


        saveTokenAndReload: function() {
            alert('save token and reload');
            var paramDict = getUrlVars(window.location.href);
            if ('token' in paramDict) {
                localStorage['token'] = paramDict['token'];
            }
            solidWorks.relocation.reloadWithToken('/static/html/index.html', true);
        }
    };
})()
