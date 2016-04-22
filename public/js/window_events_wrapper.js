// main 3D scene script with .stl loader
// script has used threJs library

var solidWorks = solidWorks || {};

(function(){

    'use strict';
 
    solidWorks.windowEventWrapper = {
        startOver: false,
        prevCoordinates: {'x': 0, 'y': 0},
        cameraOffsetMutiplier: 50,
        buttonsIdList: ['bInit', 'bRot', 'bPan', 'bZin', 'bZout'],
        buttonsIdEvents: {'bInit': 0, 
                          'bPan': 1,
                          'bZin': 2, 
                          'bZout': 3,
                          'bRot': 4},

        
        onModeClick: function(button) {
            var buttonsIdEvents = solidWorks.windowEventWrapper.buttonsIdEvents;
            var buttonsIdList = solidWorks.windowEventWrapper.buttonsIdList;
            for (var i = 0; i < buttonsIdList.length; i++) {
                var buttonElem = document.getElementById(buttonsIdList[i]);
                if (buttonElem) {
                    buttonElem.style.backgroundColor='#FCFCFC';
                }
            }
            button.style.backgroundColor='#93c2e9';
            if (button.id in buttonsIdEvents) {
                solidWorks.stlLoader.currentMode = buttonsIdEvents[button.id];
            }
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
                if (currentMode != sceneModes.INIT) {
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
