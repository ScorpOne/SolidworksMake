// main 3D scene script with .stl loader
// script has used threJs library

var solidWorks = solidWorks || {};

(function(){

    'use strict';
 
    solidWorks.windowEventWrapper = {
        startOver: false,
        prevCoordinates: {'x': 0, 'y': 0},
        cameraOffsetMutiplier: 50,
        
        onPanClick: function(button) {
            var sceneModes = solidWorks.stlLoader.sceneModes;

            if (solidWorks.stlLoader.currentMode == sceneModes.PAN) {
                solidWorks.stlLoader.currentMode = sceneModes.INIT;
                button.value = 'PAN mode off';
            } else if (solidWorks.stlLoader.currentMode == sceneModes.INIT) {
                solidWorks.stlLoader.currentMode = sceneModes.PAN;
                button.value = 'PAN mode on';
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

            if (startOver && currentMode == sceneModes.PAN) {
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
                    divEvent.innerText = Math.floor(event.clientX) + '-' + Math.floor(event.clientY);
                    
                }
            }

        } 

    };

    solidWorks.stlLoader = {

        sceneModes: {INIT: 0, PAN: 1},
        modelPath: '/models/',
        cameraPosOffset: {'x': 0, 'y': 0},
        //currentMode: solidWorks.stlLoader.sceneModes.INIT,
	currentMode: 0,

        init: function() {
            var addShadowedLight = solidWorks.stlLoader.addShadowedLight;
            var onWindowResize = solidWorks.stlLoader.onWindowResize;
            var stlFileName = '';
            var paramDict = solidWorks.urlParams.getUrlVars(window.location.href);
            if (! ('stl' in paramDict)) {
                alert('no mandatory [stl] url param');
            } else {
                stlFileName = paramDict['stl'];
            }
            stlFileName = solidWorks.stlLoader.modelPath + stlFileName;
            stlFileName = solidWorks.relocation.reloadWithToken(stlFileName, false);
            alert('Load ' + stlFileName + ' model');

            container = document.createElement( 'div' );
            document.body.appendChild( container );

            camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
            camera.position.set( 0, 1, 3 );

            cameraTarget = new THREE.Vector3( 0, 0, 0 );

            scene = new THREE.Scene();
            scene.fog = new THREE.Fog( 0x72645b, 2, 15 );


            // Ground

            var plane = new THREE.Mesh(
                new THREE.PlaneBufferGeometry( 40, 40 ),
                new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
            );
            plane.rotation.x = -Math.PI/2;
            plane.position.y = -0.5;
            scene.add( plane );

            plane.receiveShadow = true;

            var loader = new THREE.STLLoader();
            THREE.Cache.clear();

            loader.load(stlFileName, function ( geometry ) {

                var material = new THREE.MeshPhongMaterial( { color: 0xff5533, 
                                                            specular: 0x111111, shininess: 200 } );
                var mesh = new THREE.Mesh( geometry, material );

                mesh.position.set( 0.0, 0 , 0 );
                mesh.rotation.set( 0, 0, 0 );
                mesh.scale.set( 0.1, 0.1, 0.1 );

                mesh.castShadow = true;
                mesh.receiveShadow = true;

                scene.add( mesh );

            });

            // Lights
				
            scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
				
            addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
            addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );
            // renderer

            renderer = new THREE.WebGLRenderer( { antialias: true } );
            renderer.setClearColor( scene.fog.color );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );

            renderer.gammaInput = true;
            renderer.gammaOutput = true;

            renderer.shadowMap.enabled = true;
            renderer.shadowMap.cullFace = THREE.CullFaceBack;

            container.appendChild( renderer.domElement );

            // stats

            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            container.appendChild( stats.domElement );

            window.addEventListener( 'resize', onWindowResize, false );

        },

        addShadowedLight: function(x, y, z, color, intensity ) {

            var directionalLight = new THREE.DirectionalLight( color, intensity );
            directionalLight.position.set( x, y, z );
            scene.add( directionalLight );

            directionalLight.castShadow = true;
            // directionalLight.shadowCameraVisible = true;

            var d = 1;
            directionalLight.shadowCameraLeft = -d;
            directionalLight.shadowCameraRight = d;
            directionalLight.shadowCameraTop = d;
            directionalLight.shadowCameraBottom = -d;

            directionalLight.shadowCameraNear = 1;
            directionalLight.shadowCameraFar = 12;

            directionalLight.shadowMapWidth = 1024;
            directionalLight.shadowMapHeight = 1024;

            directionalLight.shadowBias = -0.005;

        },
			

        onWindowResize: function() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize( window.innerWidth, window.innerHeight );
        },


        animate: function() {
            var render = solidWorks.stlLoader.render;
            window.requestAnimationFrame( solidWorks.stlLoader.animate );

            render();
            stats.update();

        },


        render: function() {

            var cameraPosOffset = solidWorks.stlLoader.cameraPosOffset;
            var timer = Date.now() * 0.0005;

            camera.position.x = camera.position.x + cameraPosOffset['x'];
            camera.position.y = camera.position.y + cameraPosOffset['y'];
            cameraTarget.x = cameraTarget.x + cameraPosOffset['x'];
            cameraTarget.y = cameraTarget.y + cameraPosOffset['y'];
            cameraPosOffset['x'] = 0;
            cameraPosOffset['y'] = 0;
            /*

            camera.position.x = 2;
            camera.position.y = 1;
            camera.position.z = 0;// + Math.sin( timer );
            cameraTarget.z = camera.position.z
            */
             
            camera.lookAt( cameraTarget );

            renderer.render( scene, camera );

        }
    };

    document.onmousemove = solidWorks.windowEventWrapper.onMouseOverEvent;
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    var container, stats;

    var camera, cameraTarget, scene, renderer;

    solidWorks.stlLoader.init();
    solidWorks.stlLoader.animate();

})()
