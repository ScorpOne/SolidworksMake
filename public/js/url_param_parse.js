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
        }
    }
})()