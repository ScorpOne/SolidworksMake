var solidWorks = solidWorks || {};

(function(){

    'use strict';

    solidWorks.urlParams = {
        //getUrlVars fetchs incoming href and returns params dict
        getUrlVars: function(href) {
            var vars = {};
            var parts = href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
            function(m, key, value) {
                vars[key] = value;
            });
            return vars;
        },
        

        //getUrlVars fetchs incoming href and returns url's path part
        getUrlPath: function(href) {
            return href.split('?')[0];
        }
    }
})()