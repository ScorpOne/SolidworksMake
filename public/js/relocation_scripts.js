// Set's of relocated functions (used in the client's scripts)

//var tmpHost = 'http://127.0.0.1:8124/';
var modelPath = '/models/';

function reloadWithToken(newLocation, reloadWindow) {
  alert(">>> token is: " + newLocation);
  if (localStorage && "token" in localStorage) {
    newLocation += ("?token=" + localStorage["token"]);
  }
  if (reloadWindow) {
    window.location.assign(newLocation);
  }
  return newLocation;
}


function stlDownload() {
  var action = modelPath;
  var paramDict = getUrlVars(window.location.href);
  if ("stl" in paramDict) {
    action += paramDict["stl"];
  }
  reloadWithToken(action, true);
}


function addTokenToAction(form) {
  form.action = reloadWithToken(form.action, false);
}


function saveTokenAndReload() {
  var paramDict = getUrlVars(window.location.href);
  if ("token" in paramDict) {
    localStorage["token"] = paramDict["token"];
  }
  reloadWithToken("/static/html/index.html", true);
}


