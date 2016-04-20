// main 3D scene script with .stl loader
// script has used threJs library

var solidWorks = solidWorks || {};

(function(){

    'use strict';
 
    solidWorks.stlLoader = {

        sceneModes: {INIT: 0, PAN: 1, ZOOM: 2, ROT:3, LEN: 4},
        modelPath: '/models/',
        cameraPosOffset: {'x': 0, 'y': 0, 'z': 0},
	currentMode: 0,
        defaultCamera: {'x': 0, 'y': 1, 'z': 3},
        defaultCameraTarget: {'x': 0, 'y': 0, 'z': 0},      
        circle: false,
        radian: 0,
        mesh: null,

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
                //var mesh = new THREE.Mesh( geometry, material );
                solidWorks.stlLoader.mesh = new THREE.Mesh(geometry, material);

                solidWorks.stlLoader.mesh.position.set(0, 0, 0);
                solidWorks.stlLoader.mesh.rotation.set(0, 0, 0);
                solidWorks.stlLoader.mesh.scale.set(0.1, 0.1, 0.1);

                solidWorks.stlLoader.mesh.castShadow = true;
                solidWorks.stlLoader.mesh.receiveShadow = true;

                scene.add(solidWorks.stlLoader.mesh);

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


        setCameraToDefault: function () {
            var defaultCamera = solidWorks.stlLoader.defaultCamera;
            var defaultCameraTarget = solidWorks.stlLoader.defaultCameraTarget;
            
            camera.position.x = defaultCamera.x;
            camera.position.y = defaultCamera.y;
            camera.position.z = defaultCamera.z;
            cameraTarget.x = defaultCameraTarget.x;
            cameraTarget.y = defaultCameraTarget.y;
            cameraTarget.z = defaultCameraTarget.z;
            solidWorks.stlLoader.radian = 0;
        },


        animate: function() {
            var render = solidWorks.stlLoader.render;
            window.requestAnimationFrame( solidWorks.stlLoader.animate );

            render();
            stats.update();

        },


        distanceCalc: function(p0, p1) {
            return Math.sqrt(Math.pow(p1.x-p0.x, 2) +  Math.pow(p1.y-p0.y, 2) + Math.pow(p1.z-p0.z, 2));
        },

         
        panning: function(cameraPosOffset) {
            var vN = {x: camera.position.x - cameraTarget.x, y: camera.position.y - cameraTarget.y, 
                      z: camera.position.z - cameraTarget.z};

            var divEvent = document.getElementById('mouse_coordinate');
            if (divEvent) {
                divEvent.innerText = vN.x + ' - ' + vN.y + ' - ' + vN.z;
            }
            if (cameraPosOffset['x'] != 0) {
                var xMulti = vN.z > 0 ? 1: -1;
                var xzCoof = vN.x / (vN.x + vN.z);
                var zxCoof = vN.z / (vN.x + vN.z);
                camera.position.x = camera.position.x + zxCoof * cameraPosOffset['x'] * xMulti;
                camera.position.z = camera.position.z + xzCoof * cameraPosOffset['x'] * xMulti * -1;
                cameraTarget.x = cameraTarget.x + zxCoof * cameraPosOffset['x'] * xMulti;
                cameraTarget.z = cameraTarget.z + xzCoof * cameraPosOffset['x'] * xMulti * -1;

            }
            if (cameraPosOffset['y'] != 0) {
                camera.position.y = camera.position.y + cameraPosOffset['y'];
                cameraTarget.y = cameraTarget.y + cameraPosOffset['y'];

            }

        },
                                                                   

	zooming: function(yOffset) {
            var lP = {x: camera.position.x, y: camera.position.y, z: camera.position.z};
            var vN = {x: lP.x - cameraTarget.x, y: lP.y - cameraTarget.y, z: lP.z - cameraTarget.z};
            if (vN.x != 0 || vN.y != 0 || vN.z != 0) {
                var len = Math.abs(yOffset);
                var K = Math.sqrt(Math.pow(len, 2) / (Math.pow(vN.x, 2) + Math.pow(vN.y, 2) + 
                                                      Math.pow(vN.z, 2)));
                if (yOffset < 0) {
                    K *= -1;
                }
                
                camera.position.x = vN.x * K + lP.x;
                camera.position.y = vN.y * K + lP.y;
                camera.position.z = vN.z * K + lP.z;
            }
        },


        zoomingFit: function() {
            var mesh = solidWorks.stlLoader.mesh;
            var bbox = new THREE.BoundingBoxHelper(mesh, 0xff0000);
            bbox.update();
            //scene.add(bbox);
            var centerPoint = bbox.box.center();
            var pDiff = {x: centerPoint.x - cameraTarget.x, y: centerPoint.y - cameraTarget.y,
                         z: centerPoint.z - cameraTarget.z};
            cameraTarget.x = centerPoint.x;
            cameraTarget.y = centerPoint.y;
            cameraTarget.z = centerPoint.z;
            camera.position.x += pDiff.x;
            camera.position.y += pDiff.y;
            camera.position.z += pDiff.z; 

            var boundaryRadius = solidWorks.stlLoader.distanceCalc(centerPoint, bbox.box.max);
            var fov = camera.fov * (Math.PI/180); 

            // Calculate the camera distance
            var distance = Math.abs(boundaryRadius / Math.sin(fov/2));

            solidWorks.stlLoader.zooming((solidWorks.stlLoader.distanceCalc(cameraTarget, camera.position) - 
                                          distance) * -1);
        },


        rotation: function(xOffset, yOffset) {
            var lP = {x: camera.position.x, y: camera.position.y, z: camera.position.z};
            var radius = Math.sqrt(Math.pow((lP.x - cameraTarget.x), 2) + 
                                   Math.pow((lP.z - cameraTarget.z), 2));
            if (xOffset != 0 && radius > 0) {
                
                
                var cosDiff = (2 * Math.pow(radius, 2) - xOffset * xOffset) / (2 * Math.pow(radius, 2));
                if (xOffset > 0) {
                    solidWorks.stlLoader.radian += Math.acos(cosDiff);
                } else {
                    solidWorks.stlLoader.radian -= Math.acos(cosDiff);
                }

                var cosA = Math.cos(solidWorks.stlLoader.radian);
                var sinA = Math.sin(solidWorks.stlLoader.radian);
                var divEvent = document.getElementById('mouse_coordinate');
                if (divEvent) {
                    divEvent.innerText = solidWorks.stlLoader.radian + ' : ' + Math.acos(cosDiff);
                }
                camera.position.x = (radius * sinA) + cameraTarget.x;
                camera.position.z = (radius * cosA) + cameraTarget.z;

            }

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
            } else if (currentMode == sceneModes.ROT && (cameraPosOffset['x'] != 0 || 
                                                         cameraPosOffset['y'] != 0)) {
                solidWorks.stlLoader.rotation(cameraPosOffset['x'], cameraPosOffset['y']);
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
