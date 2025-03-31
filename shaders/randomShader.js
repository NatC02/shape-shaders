import * as THREE from "three";

// Random Pattern Shader
export const randomShader = {
    uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3() }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float iTime;
        uniform vec3 iResolution;
        varying vec2 vUv;

        void main() {
            vec2 uv = vUv * 10.0;
            vec3 col = vec3(0.0);
            uv += iTime;
            
            // Essentially just writing random stuff
            float d = (tan(uv.x) * tan(uv.y) * sin(uv.x) * sin(uv.y) / 
                      tan(uv.x + uv.y) / sin(uv.y + uv.x) * 
                      tan(iTime) / cos(iTime)) / 
                      log(iTime * (uv.x + uv.y));
                      
            col += abs(d + tan(iTime));
            
            gl_FragColor = vec4(col, 1.0);
        }
    `
};