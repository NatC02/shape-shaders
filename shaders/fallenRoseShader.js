import * as THREE from "three";

// Fallen Rose Shader
export const fallenRoseShader = {
    uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3() },
        iMouse: { value: new THREE.Vector4() }
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
        uniform vec4 iMouse;
        varying vec2 vUv;

        #define TAU 6.2831853
        
        // Placeholder for texture sampling since we don't have iChannel0
        vec4 T(vec2 U) {
            vec2 uv = U / iResolution.xy;
            return vec4(sin(uv.x * 10.0 + iTime), cos(uv.y * 10.0 + iTime), 
                        sin(uv.x * uv.y * 5.0 + iTime), 1.0);
        }
        
        void main() {
            vec2 U = vUv * iResolution.xy;
            vec4 O = T(U);
            
            vec2 R = iResolution.xy;
            vec2 u = U / R.y;
            vec2 k = R / R.y;
            vec2 f = k / vec2(4.0, 3.0);
            vec2 g;
                 
            g = u - round(u / f) * f;
            g = abs(g);
            float d = min(g.x, g.y);
            
            if(length(g) < f.y * 0.2) {
                O = clamp(O, 0.0, 1.0);
                O += 5.0 * clamp(exp(-880.0 * d), 0.0, 1.0);
                O.xy += 0.5 * clamp(exp(-880.0 * abs(g.y)), 0.0, 1.0);
            }
            
            gl_FragColor = O;
        }
    `
};