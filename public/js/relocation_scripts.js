// Set's of relocated functions (used in the client's scripts)

var SolidWorks = SolidWorks || {}

SolidWorks.relocation = {

    modelPath: '/models/',

    reloadWithToken: function(newLocation, reloadWindow) {
        alert(">>> token is: " + newLocation);
        if (localStorage && "token" in localStorage) {
            newLocation += ("?token=" + localStorage["token"]);
        }
        if (reloadWindow) {
            window.location.assign(newLocation);
        }
        return newLocation;
    },


    stlDownload: function() {
        var action = modelPath;
        var paramDict = getUrlVars(window.location.href);
        if ("stl" in paramDict) {
            action += paramDict["stl"];
        }
        reloadWithToken(action, true);
    },


    addTokenToAction: function(form) {
        alert(">>> addTokentoAction");
        form.action = reloadWithToken(form.action, false);
    },


    saveTokenAndReload: function() {
        alert(">>> saveTokenAndReload");
        var paramDict = getUrlVars(window.location.href);
        if ("token" in paramDict) {
            localStorage["token"] = paramDict["token"];
        }
        reloadWithToken("/static/html/index.html", true);
    }
}

