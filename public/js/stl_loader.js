// main 3D scene script with .stl loader
// script has used threJs library

var solidWorks = solidWorks || {};

(function(){

    'use strict';
 
    solidWorks.stlLoader = {

        sceneModes: {INIT: 0, PAN: 1, ZOOM: 2, LEN: 3},
        modelPath: '/models/',
        cameraPosOffset: {'x': 0, 'y': 0, 'z': 0},
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


        panning: function(cameraPosOffset) {
            camera.position.x = camera.position.x + cameraPosOffset['x'];
            camera.position.y = camera.position.y + cameraPosOffset['y'];
            cameraTarget.x = cameraTarget.x + cameraPosOffset['x'];
            cameraTarget.y = cameraTarget.y + cameraPosOffset['y'];
        },
                                                                   

	zooming: function(yOffset) {
            var lP = {x: camera.position.x, y: camera.position.y, z: camera.position.z};
            var vN = {x: lP.x - cameraTarget.x, y: lP.y - cameraTarget.y, z: lP.z - cameraTarget.z};
            var len = Math.abs(yOffset);
            var K = Math.sqrt(Math.pow(len, 2) / (Math.pow(vN.x, 2) + Math.pow(vN.y, 2) + 
                                                      Math.pow(vN.z, 2)));
            if (yOffset < 0) {
                K *= -1;
            }
                
            camera.position.x = vN.x * K + lP.x;
            camera.position.y = vN.y * K + lP.y;
            camera.position.z = vN.z * K + lP.z;
        },


        render: function() {

            var cameraPosOffset = solidWorks.stlLoader.cameraPosOffset;
            var currentMode = solidWorks.stlLoader.currentMode;
            var sceneModes = solidWorks.stlLoader.sceneModes;
            var timer = Date.now() * 0.0005;

            if (currentMode == sceneModes.PAN) {
                solidWorks.stlLoader.panning(cameraPosOffset);
            } else if (currentMode == sceneModes.ZOOM && cameraPosOffset['y'] != 0) {
                solidWorks.stlLoader.zooming(cameraPosOffset['y']);
            }
            cameraPosOffset['x'] = 0;
            cameraPosOffset['y'] = 0;
            cameraPosOffset['z'] = 0;
             
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
