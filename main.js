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
