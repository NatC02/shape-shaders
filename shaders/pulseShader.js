import * as THREE from "three";

// Pulse Shader
export const pulseShader = {
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
            vec2 uv = (vUv * 2.0 - 1.0) * vec2(iResolution.x/iResolution.y, 1.0);
            vec3 col = vec3(0.0);
            
            uv = fract(uv * 1.5) - 0.5;
            
            float d = length(uv);
            d = sin(d * 2.0 + iTime) / 18.0;
            d = abs(d);
            d = 0.02 / d;
            
            if(mod(iTime, 0.003) > 0.0)
                col = vec3(0.0, sin(vUv.x * iResolution.x) / 3.0, 0.0);
            else
                col = vec3(0.0, cos(vUv.x * iResolution.x) / 2.75, 0.0);
            
            col *= d;
            gl_FragColor = vec4(col, 1.0);
        }
    `
};