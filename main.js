import * as THREE from "three";

import {OrbitControls} from "three/addons/controls/OrbitControls.js";

import ShapeGenerator from "./ShapeGenerator.js";

import ProceduralCityGenerator from "./proceduralCityGenerator.js";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera,renderer.domElement );
controls.enableZoom = true; 
controls.minDistance = 1; 
controls.maxDistance = 1000; 
controls.zoomSpeed = 1; 
controls.enablePan = true; 
controls.enableDamping = false; 
controls.DampingFactor= 0;

scene.background = new THREE.CubeTextureLoader()
	.setPath( 'textures/' )
	.load( [
        'px.png',
        'nx.png',
        'py.png',
        'ny.png',
        'pz.png',
        'nz.png'
	]);

let buildingTextures = new Array(6);

for(let i = 0; i < buildingTextures.length; i++){
    buildingTextures[i] = {map: createTexture(`buildingAssets/texture${i+1}/albedo.jpg`), normalMap: createTexture(`buildingAssets/texture${i+1}/normals.jpg`)};
}

let roadTextures = {map: createTexture(`roadAssets/texture1/albedo.jpg`), normalMap: createTexture(`roadAssets/texture1/normals.jpg`)}

let citySize = {width: 200, depth: 200, height: 10};
let buildingsSize = {width: 5, depth:5, height: citySize.height};

let city = new ProceduralCityGenerator(scene, citySize, buildingsSize, buildingTextures, roadTextures);
city.setRoads(50);
city.create();


let light = createLight(0xFFFFFF, 1, {x: 0, y: 50, z: 0});
scene.add(light);

camera.position.y = 150;

let t = 0;
function animate() {
	requestAnimationFrame( animate );

    t += 0.01;

    renderer.render( scene, camera );
    controls.update();
}
animate();

function createTexture(rute, height = 1, width = 1){
    let texture = new THREE.TextureLoader().load(rute);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(height, width); 

    return texture;
}

function createLight(color, intensity, position = {x: 0, y: 0, z: 0}){
    let light = new THREE.PointLight(color, intensity);
    light.position.set(position.x, position.y, position.z);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024; // default
    light.shadow.mapSize.height = 1024; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default
    light.shadow.focus = 1; // default
    return light;
}
