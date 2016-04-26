var solidWorks = solidWorks || {};

(function(){

    'use strict';

    solidWorks.relocation = {

        modelPath: '/api/models',
        xhttp: null,

        reloadWithToken: function(newLocation, reloadWindow) {
            alert('>>> token is: ' + newLocation);
            if (localStorage && 'token' in localStorage) {
                if (newLocation.indexOf('?') >= 0) {
                    newLocation += ('&token=' + localStorage['token']);
                } else {
                    newLocation += ('?token=' + localStorage['token']);
                }
            }
            if (reloadWindow) {
                window.location.assign(newLocation);
            }
            return newLocation;
        },


        stlDownload: function() {
            var action = solidWorks.relocation.modelPath;
            var paramDict = solidWorks.urlParams.getUrlVars(window.location.href);
            if ('stl' in paramDict) {
                action += ('?stl=' + paramDict['stl']);
            }
            solidWorks.relocation.reloadWithToken(action, true);
        },


        addTokenToAction: function(form) {
            form.action = solidWorks.relocation.reloadWithToken(form.action, false);
        },


        saveTokenAndReload: function() {
            alert('save token and reload');
            var paramDict = solidWorks.urlParams.getUrlVars(window.location.href);
            if ('token' in paramDict) {
                localStorage['token'] = paramDict['token'];
            }
            solidWorks.relocation.reloadWithToken('/static/html/index.html', true);
        },


        xhttpStateChanged: function() {
            var xhttp = solidWorks.relocation.xhttp;
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                var models = xhttp.responseText.split(':');
                var select = document.getElementById('models_list');
                if (models.length > 0 && select) {                            
                    for (var i = 0; i < models.length; i++) {
                        var opt = document.createElement('option');
                        opt.text = models[i];
                        select.add(opt);
                    }
                }
            }
        },


        extendSelect: function() {
            if (solidWorks.relocation.xhttp == null) {
                solidWorks.relocation.xhttp = new XMLHttpRequest();
                solidWorks.relocation.xhttp.onreadystatechange = function () {
                    solidWorks.relocation.xhttpStateChanged();
                }
            };
            var xhttp = solidWorks.relocation.xhttp;
            var token = '';
            if (localStorage && 'token' in localStorage) {
                token = localStorage['token'];
            }
            alert(solidWorks.relocation.modelPath+'?token='+token);
            xhttp.open('GET', solidWorks.relocation.modelPath+'?token='+token, true);
            //xhttp.open('GET', 'http://127.0.0.1:8124/api/models/?token='+token, true);
            xhttp.send();
        },

        
        reloadModel: function(modelName) {
            //alert('index = ' + index);
            var urlPath = solidWorks.urlParams.getUrlPath(window.location.href);
            urlPath += ('?stl='+modelName);
            solidWorks.relocation.reloadWithToken(urlPath, true);
        }

    };
})()
