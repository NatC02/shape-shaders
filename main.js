import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { everflowShader } from './shaders/everflowShader.js';
import { pulseShader } from './shaders/pulseShader.js';
import { randomShader } from './shaders/randomShader.js';
import { fallenRoseShader } from './shaders/fallenRoseShader.js';
import { mazeShader } from './shaders/mazeShader.js';
import { rainShader } from './shaders/rainShader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#394648');

const camera = new THREE.PerspectiveCamera(30, innerWidth/innerHeight);
camera.position.set(0, 0, 7);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// Commit 3: Resize and Controls Setup
window.addEventListener("resize", (event) => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    
    // Update shader uniforms with new resolution
    updateShaderUniforms();
});

window.addEventListener("resize", (event) => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    
    // Update shader uniforms with new resolution
    updateShaderUniforms();
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

const light = new THREE.DirectionalLight('white', 3);
light.position.set(1, 1, 1);
scene.add(light);

// Create shader materials
const shaderMaterials = {
    front: createShaderMaterial(everflowShader),
    back: createShaderMaterial(pulseShader),
    right: createShaderMaterial(randomShader),
    left: createShaderMaterial(fallenRoseShader),
    bottom: createShaderMaterial(mazeShader),
    top: createShaderMaterial(rainShader)
};

function updateShaderUniforms() {
    const resolution = new THREE.Vector3(
        window.innerWidth, window.innerHeight, 1.0
    );
    
    for (const key in shaderMaterials) {
        if (shaderMaterials[key].uniforms.iResolution) {
            shaderMaterials[key].uniforms.iResolution.value = resolution;
        }
    }
}

// Call once to initialize
updateShaderUniforms();

// Function to create shader material from shader definition
function createShaderMaterial(shader) {
    return new THREE.ShaderMaterial({
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
    });
}

const baseCubeGeometry = new THREE.BoxGeometry(1, 1, 1);

const cube = new THREE.Mesh(
    baseCubeGeometry, 
    new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFC914'),
        metalness: 0.47,
        roughness: 0.53,
        flatShading: true
    })
);
cube.scale.setScalar(0.75);
scene.add(cube);

// Wall geometries
const geometry = new THREE.BoxGeometry(1.8, 1.8, 0.1);

// Configurable wall material
const wallColor = '#E0F2E9';
const wallShadeColor = '#FFC914';
const baseMaterial = new THREE.MeshLambertMaterial({ 
    color: wallColor, 
    transparent: true,
    emissive: wallShadeColor,
    emissiveIntensity: 0.2
});

const wall1 = new THREE.Mesh(geometry, baseMaterial.clone());
wall1.position.z = 1;
wall1.name = 'front';

const wall2 = new THREE.Mesh(geometry, baseMaterial.clone());
wall2.rotation.y = Math.PI;		
wall2.position.z = -1;
wall2.name = 'back';

const wall3 = new THREE.Mesh(geometry, baseMaterial.clone());
wall3.rotation.y = Math.PI/2;		
wall3.position.x = 1;
wall3.name = 'right';

const wall4 = new THREE.Mesh(geometry, baseMaterial.clone());
wall4.rotation.y = -Math.PI/2;		
wall4.position.x = -1;
wall4.name = 'left';

const wall5 = new THREE.Mesh(geometry, baseMaterial.clone());
wall5.rotation.x = Math.PI/2;		
wall5.position.y = -1;
wall5.name = 'bottom';

const wall6 = new THREE.Mesh(geometry, baseMaterial.clone());
wall6.rotation.x = -Math.PI/2;		
wall6.position.y = 1;
wall6.name = 'top';

const walls = [wall1, wall2, wall3, wall4, wall5, wall6];

scene.add(...walls);

const v = new THREE.Vector3();
const u = new THREE.Vector3();

const shapeTransformations = {
    'front': () => {
        // Hexagonal prism with everflowShader
        cube.geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 6);
        cube.material = shaderMaterials.front;
    },
    'back': () => {
        // Sphere with pulseShader
        cube.geometry = new THREE.SphereGeometry(0.5, 16, 16);
        cube.material = shaderMaterials.back;
    },
    'right': () => {
        // Cone with randomShader
        cube.geometry = new THREE.ConeGeometry(0.5, 1, 6);
        cube.material = shaderMaterials.right;
    },
    'left': () => {
        // Tetrahedron with fallenRoseShader
        cube.geometry = new THREE.TetrahedronGeometry(0.5);
        cube.material = shaderMaterials.left;
    },
    'top': () => {
        // Torus with secondEverflowShader
        cube.geometry = new THREE.TorusGeometry(0.3, 0.2, 16, 100);
        cube.material = shaderMaterials.top;
    },
    'bottom': () => {
        // Octahedron with mazeShader
        cube.geometry = new THREE.OctahedronGeometry(0.5);
        cube.material = shaderMaterials.bottom;
    }
};

