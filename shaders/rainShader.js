import * as THREE from "three";

// Rain Shader
export const rainShader = {
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

        const int LAYERS = 6;             // number of layers of drops

        const float SCALE = 128.0;        // overall scale of the drops
        const float LENGTH = 16.0;        // length of the drops
        const float LENGTH_SCALE = 0.8;   // how much the drop length changes every layer
        const float FADE = 0.6;           // how much the drops fade every layer

        const float SPEED = 8.0;          // how fast the drops fall

        const vec3 DROP_COLOR = vec3(0.54, 0.8, 0.94);
        const vec3 BG_COLOR = vec3(0.23, 0.38, 0.6);

        highp float rand(vec2 co)
        {
            highp float a = 12.9898;
            highp float b = 78.233;
            highp float c = 43758.5453;
            highp float dt = dot(co.xy, vec2(a, b));
            highp float sn = mod(dt, 3.14);

            return fract(sin(sn) * c);
        }

        float rainFactor(vec2 uv, float scale, float dripLength, vec2 offset, float cutoff)
        {
            vec2 pos = uv * vec2(scale, scale / dripLength) + offset;
            vec2 dripOffset = vec2(0.0, floor(rand(floor(pos * vec2(1.0, 0.0))) * (dripLength - 0.0001)) / dripLength);
            float f = rand(floor(pos + dripOffset));
            
            return step(cutoff, f);
        }

        vec4 over(vec4 a, vec4 b)
        {
            return vec4(mix(b.rgb, a.rgb, a.a), max(a.a, b.a));
        }

        void main()
        {
            vec2 uv = vUv;
            float aspect = iResolution.x / iResolution.y;
            uv.x *= aspect;
            
            vec4 finalColor = vec4(0.0);
            
            float dropLength = LENGTH;
            float alpha = 1.0;
            
            for (int i = 0; i < LAYERS; i++)
            {
                float f = rainFactor(uv, SCALE, dropLength, vec2(SCALE * float(i), iTime * SPEED), 0.95);
                
                vec4 color = vec4(DROP_COLOR, f * alpha);
                
                finalColor = over(color, finalColor);
                
                dropLength *= LENGTH_SCALE;
                alpha *= FADE;
            }
            
            finalColor = over(vec4(BG_COLOR, 1.0), finalColor);
            
            gl_FragColor = finalColor;
        }
    `
};