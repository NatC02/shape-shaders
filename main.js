import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { everflowShader } from './shaders/everflowShader.js';
import { pulseShader } from './shaders/pulseShader.js';
import { randomShader } from './shaders/randomShader.js';
import { fallenRoseShader } from './shaders/fallenRoseShader.js';
import { mazeShader } from './shaders/mazeShader.js';
import { rainShader } from './shaders/rainShader.js';

// Cache for geometries and materials
const geometryCache = {};
const materialCache = {};
const shaderMaterialCache = {};

// Preload all geometries
function preloadGeometries() {
    geometryCache.box = new THREE.BoxGeometry(1, 1, 1);
    geometryCache.cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 6);
    geometryCache.sphere = new THREE.SphereGeometry(0.5, 16, 16);
    geometryCache.cone = new THREE.ConeGeometry(0.5, 1, 6);
    geometryCache.tetrahedron = new THREE.TetrahedronGeometry(0.5);
    geometryCache.torus = new THREE.TorusGeometry(0.3, 0.2, 16, 100);
    geometryCache.octahedron = new THREE.OctahedronGeometry(0.5);
    geometryCache.wall = new THREE.BoxGeometry(1.8, 1.8, 0.1);
}

// Create and cache shader materials
function preloadShaderMaterials() {
    const shaders = {
        everflow: everflowShader,
        pulse: pulseShader,
        random: randomShader,
        fallenRose: fallenRoseShader,
        maze: mazeShader,
        rain: rainShader
    };

    // Create resolution uniform that will be shared
    const resolution = new THREE.Vector3(
        window.innerWidth, window.innerHeight, 1.0
    );

    // Initialize all shader materials
    for (const [key, shader] of Object.entries(shaders)) {
        const material = new THREE.ShaderMaterial({
            uniforms: { ...shader.uniforms },
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });

        // Add resolution uniform if needed
        if (material.uniforms.iResolution) {
            material.uniforms.iResolution.value = resolution;
        }

        // Add time uniform if needed
        if (material.uniforms.iTime) {
            material.uniforms.iTime.value = 0;
        }

        shaderMaterialCache[key] = material;
    }
}

// Preload standard materials
function preloadStandardMaterials() {
    // Base cube material
    materialCache.cube = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFC914'),
        metalness: 0.47,
        roughness: 0.53,
        flatShading: true
    });

    // Wall material template
    const wallColor = '#E0F2E9';
    const wallShadeColor = '#FFC914';

    materialCache.wall = new THREE.MeshLambertMaterial({
        color: wallColor,
        transparent: true,
        emissive: wallShadeColor,
        emissiveIntensity: 0.2
    });
}

// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#394648');

const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight);
camera.position.set(0, 0, 7);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

// Initialize light
const light = new THREE.DirectionalLight('white', 3);
light.position.set(1, 1, 1);
scene.add(light);

// Preload all assets
preloadGeometries();
preloadStandardMaterials();
preloadShaderMaterials();

// Create cube with initial geometry and material
const cube = new THREE.Mesh(
    geometryCache.box,
    materialCache.cube
);
cube.scale.setScalar(0.75);
scene.add(cube);

// Create walls with cloned materials for individual opacity control
const wallPositions = [
    { name: 'front', position: [0, 0, 1], rotation: [0, 0, 0] },
    { name: 'back', position: [0, 0, -1], rotation: [0, Math.PI, 0] },
    { name: 'right', position: [1, 0, 0], rotation: [0, Math.PI / 2, 0] },
    { name: 'left', position: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0] },
    { name: 'bottom', position: [0, -1, 0], rotation: [Math.PI / 2, 0, 0] },
    { name: 'top', position: [0, 1, 0], rotation: [-Math.PI / 2, 0, 0] }
];

const walls = wallPositions.map(({ name, position, rotation }) => {
    const wall = new THREE.Mesh(
        geometryCache.wall,
        materialCache.wall.clone() // Clone for individual opacity control
    );

    wall.position.set(...position);
    wall.rotation.set(...rotation);
    wall.name = name;

    return wall;
});

scene.add(...walls);

// Map wall names to transformation functions
const shapeTransformations = {
    'front': () => {
        cube.geometry = geometryCache.cylinder;
        cube.material = shaderMaterialCache.everflow;
    },
    'back': () => {
        cube.geometry = geometryCache.sphere;
        cube.material = shaderMaterialCache.pulse;
    },
    'right': () => {
        cube.geometry = geometryCache.cone;
        cube.material = shaderMaterialCache.random;
    },
    'left': () => {
        cube.geometry = geometryCache.tetrahedron;
        cube.material = shaderMaterialCache.fallenRose;
    },
    'top': () => {
        cube.geometry = geometryCache.torus;
        cube.material = shaderMaterialCache.rain;
    },
    'bottom': () => {
        cube.geometry = geometryCache.octahedron;
        cube.material = shaderMaterialCache.maze;
    }
};

// Handle window resize
function updateShaderUniforms() {
    const resolution = new THREE.Vector3(
        window.innerWidth, window.innerHeight, 1.0
    );

    // Update resolution for all shader materials
    for (const material of Object.values(shaderMaterialCache)) {
        if (material.uniforms.iResolution) {
            material.uniforms.iResolution.value = resolution;
        }
    }
}

window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    updateShaderUniforms();
});

// Reusable vectors for direction calculations
const v = new THREE.Vector3();
const u = new THREE.Vector3();

let currentWallFacing = null;

function animationLoop(t) {
    const timeInSeconds = t * 0.001;

    // Update time uniformly for all shader materials
    for (const material of Object.values(shaderMaterialCache)) {
        if (material.uniforms.iTime) {
            material.uniforms.iTime.value = timeInSeconds;
        }
    }

    // Rotate cube
    cube.rotation.set(t / 600, t / 700, t / 800);

    // Update controls
    controls.update();

    // Determine which wall the camera is facing
    for (const wall of walls) {
        wall.getWorldDirection(v);
        camera.getWorldDirection(u);

        // Adjust wall opacity
        wall.material.opacity = 2 * v.dot(u);

        // Check if this wall is prominently facing the camera
        if (v.dot(u) > 0.9) {
            // If we've changed walls, update the cube's shape and material
            if (wall.name !== currentWallFacing) {
                currentWallFacing = wall.name;

                // Apply the specific shape transformation and shader
                if (shapeTransformations[wall.name]) {
                    shapeTransformations[wall.name]();
                }
            }
            break;
        }
    }

    // Update light position to follow camera
    light.position.copy(camera.position);

    // Render scene
    renderer.render(scene, camera);
}

// Start the animation loop
renderer.setAnimationLoop(animationLoop);