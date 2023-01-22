import * as THREE from './bundles/libs/three.module.js';
import { OrbitControls } from './bundles/controls/OrbitControls.js';
import { GLTFLoader } from './bundles/loaders/GLTFLoader.js';
import { DRACOLoader } from './bundles/loaders/DRACOLoader.js';

// THREE Objects
let scene, camera, pointLight, stats, renderer, mixer, controls;

// Clock
let clock = new THREE.Clock();

// Container assignation
let container = document.getElementById('animation-container');

////////////////////////////////////////////////////////////////////////////////////////////// Renderer

renderer = new THREE.WebGLRenderer( { antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight );
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

////////////////////////////////////////////////////////////////////////////////////////////// Scene

scene = new THREE.Scene();
scene.background = new THREE.Color(0xD2B4DE);

////////////////////////////////////////////////////////////////////////////////////////////// Camera

camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(5, 8, 10);

////////////////////////////////////////////////////////////////////////////////////////////// Controls

controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enablePan = false;

////////////////////////////////////////////////////////////////////////////////////////////// Light

pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.copy(camera.position);

scene.add(new THREE.AmbientLight(0x404040));
scene.add(pointLight);

////////////////////////////////////////////////////////////////////////////////////////////// EnvMap (Cube)

let path = 'assets/textures/cube/Park2/';

const format = '.jpg';
let envMap = new THREE.CubeTextureLoader().load([
  path + 'posx' + format, path + 'negx' + format,
  path + 'posy' + format, path + 'negy' + format,
  path + 'posz' + format, path + 'negz' + format
]); 

////////////////////////////////////////////////////////////////////////////////////////////// DRACO Loader && GLTF SCENE LOAD

let dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('bundles/libs/draco/gltf/');

let loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load('assets/glb/LittlestTokyo.glb', function(gltf){
  let model = gltf.scene;
  model.position.set(0.5, 2, 0);
  model.scale.set(0.006, 0.006, 0.006);
  model.traverse ( function(child){
    if (child.isMesh) child.material.envMap = envMap;
  });

  scene.add(model);

  mixer = new THREE.AnimationMixer(model);
  mixer.clipAction(gltf.animations[0]).play();

  animate();
}, undefined, function(e){
  console.error('UPS, hubo un error... ' + e);
});

////////////////////////////////////////////////////////////////////////////////////////////// Animate Function

function animate() {
  requestAnimationFrame( animate );

  var delta = clock.getDelta();
  mixer.update( delta );
  controls.update( delta );

  renderer.render( scene, camera );
}

////////////////////////////////////////////////////////////////////////////////////////////// On Resize of window handling

window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
};
