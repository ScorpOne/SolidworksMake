// main 3D scene script with .stl loader
// script has used threJs library

//var tmpHost = 'http://127.0.0.1:8124/'
var modelPath = '/models/'
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, cameraTarget, scene, renderer;


init();
animate();


function init() {
  var stlFileName = ""
  var paramDict = getUrlVars(window.location.href);
  if (! ("stl" in paramDict)) {
    alert("no mandatory [stl] url param");
  }
  else {
    stlFileName = paramDict["stl"];
  }
  stlFileName = modelPath + stlFileName;
  stlFileName = reloadWithToken(stlFileName, false);
  alert("Load " + stlFileName + " model");

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
  camera.position.set( 3, 0.15, 3 );

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


    var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
    var mesh = new THREE.Mesh( geometry, material );

    mesh.position.set( 0.7, -0.3 , -0.5 );
    mesh.rotation.set( 0, - Math.PI / 2, 0 );
    mesh.scale.set( 0.1, 0.1, 0.1 );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add( mesh );

  } );

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

}

function addShadowedLight( x, y, z, color, intensity ) {

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

}
			

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();

}

function render() {

  var timer = Date.now() * 0.0005;

  camera.position.x = 3;
  camera.position.y = 2;
  camera.position.z = 0 + Math.sin( timer );
  cameraTarget.z = camera.position.z

  camera.lookAt( cameraTarget );

  renderer.render( scene, camera );

}