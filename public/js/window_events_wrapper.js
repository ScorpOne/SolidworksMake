// main 3D scene script with .stl loader
// script has used threJs library

var solidWorks = solidWorks || {};

(function(){

    'use strict';
 
    solidWorks.windowEventWrapper = {
        startOver: false,
        prevCoordinates: {'x': 0, 'y': 0},
        cameraOffsetMutiplier: 50,
        sceneModesNames: ['INIT mode', 'PAN mode', 'ZOOM mode', 'ROTATION mode'],
        
        onModeClick: function(button) {
            var sceneModes = solidWorks.stlLoader.sceneModes;
            var sceneModesNames = solidWorks.windowEventWrapper.sceneModesNames;
            if (solidWorks.stlLoader.currentMode == (sceneModes.LEN - 1) ) {
                solidWorks.stlLoader.currentMode = 0;
            } else {
                solidWorks.stlLoader.currentMode++;
            }
            button.value = solidWorks.windowEventWrapper.sceneModesNames[solidWorks.stlLoader.currentMode];

        },


	onMouseEvent: function(event, eventText) {
            var startOver = solidWorks.windowEventWrapper.startOver;
            var prevCoordinates = solidWorks.windowEventWrapper.prevCoordinates;

            if (eventText == 'Down') {
                solidWorks.windowEventWrapper.startOver = true;
                prevCoordinates['x'] = Math.floor(event.clientX);
                prevCoordinates['y'] = Math.floor(event.clientY);
            } else if (eventText == 'Up') {
                solidWorks.windowEventWrapper.startOver = false;
            };

        },

	onMouseOverEvent: function(event) {
            var startOver = solidWorks.windowEventWrapper.startOver;
            var cameraOffsetMutiplier = solidWorks.windowEventWrapper.cameraOffsetMutiplier;
            var prevCoordinates = solidWorks.windowEventWrapper.prevCoordinates;
            var cameraPosOffset = solidWorks.stlLoader.cameraPosOffset; 
            var currentMode = solidWorks.stlLoader.currentMode;
            var sceneModes = solidWorks.stlLoader.sceneModes;

            if (startOver) {
                if (currentMode == sceneModes.PAN || currentMode == sceneModes.ZOOM ||
                    currentMode == sceneModes.ROT) {
                    var divEvent = document.getElementById('mouse_coordinate');
                    if (divEvent) {
                        cameraPosOffset['x'] = 
                        (event.clientX - prevCoordinates['x']) / cameraOffsetMutiplier;
                        // oops!!! scene x-coordinate reverse for window x-coordinate
                        cameraPosOffset['x'] *= -1;
                        cameraPosOffset['y'] = 
                        (event.clientY - prevCoordinates['y']) / cameraOffsetMutiplier;
                      
                        prevCoordinates['x'] = event.clientX;
                        prevCoordinates['y'] = event.clientY;
                        //divEvent.innerText = Math.floor(event.clientX) + '-' + Math.floor(event.clientY);
                    }
                } else if (currentMode == sceneModes.ZOOM) {
                }
            }

        } 

    };

})()
