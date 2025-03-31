import * as THREE from "three";

// Everflow Shader
export const everflowShader = {
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

        vec3 hsv2rgb(in vec3 c) {
            vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
            rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing	
            return c.z * mix(vec3(1.0), rgb, c.y);
        }

        #define FOV 1.5
        
        float gauss(float x, float r) {
            x/=r;
            return exp(-x*x);
        }

        float sdSegment(in vec2 p, in vec2 a, in vec2 b) {
            vec2 pa = p-a, ba = b-a;
            float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
            return length(pa - ba*h);
        }

        float sdSphere(vec3 p, float s) {
            return length(p)-s;
        }

        float sdBox(vec3 p, vec3 b) {
            vec3 q = abs(p) - b;
            return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
        }

        void main() {
            vec2 pos = vUv * iResolution.xy;
            vec3 col = vec3(0.0);
            
            // Simplified version that doesn't require P() function
            float r = sin(pos.x * 0.1 + iTime) * cos(pos.y * 0.1 + iTime * 0.5);
            col.xyz = 3.0 * sin(0.2 * vec3(1.0, 2.0, 3.0) * r);
            
            gl_FragColor = vec4(col, 1.0);
        }
    `
};