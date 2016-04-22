var solidWorks = solidWorks || {};

(function(){

    'use strict';

    solidWorks.relocation = {

        modelPath: '/models/',
        xhttp: null,
        modelsFList: [],

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
                action += paramDict['stl'];
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
                if (models.length > 0) {
                    var select = document.getElementById('models_list');
                    for (var i = 0; i < (models.length/2); i++) {
                        var opt = document.createElement('option');
                        opt.text = models[i*2];
                        select.add(opt);
                        if ((i*2+1) < models.length) {
                          solidWorks.relocation.modelsFList.push(models[i*2+1]);
                        }
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
            xhttp.open('GET', '/api/modelsList?token='+token, true);
            xhttp.send();
        },

        
        reloadModel: function(index) {
            //alert('index = ' + index);
            var modelsFList = solidWorks.relocation.modelsFList;
            if (index < modelsFList.length) {
                var urlPath = solidWorks.urlParams.getUrlPath(window.location.href);
                urlPath += ('?stl='+modelsFList[index]);
                solidWorks.relocation.reloadWithToken(urlPath, true);
            }
        }

    };
})()
