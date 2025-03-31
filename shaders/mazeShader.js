import * as THREE from "three";

// Maze Generation Shader
export const mazeShader = {
    uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3() },
        iChannel0: { value: null } // We'll need to create a buffer texture for this
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
        uniform sampler2D iChannel0;
        varying vec2 vUv;

        // Define mazeSize based on resolution
        vec2 mazeSize = vec2(31.0, 31.0);
        
        // Define nesw array manually since we can't use globals
        const vec2 nesw[4] = vec2[4](
            vec2(0.0, -1.0), // North
            vec2(1.0, 0.0),  // East
            vec2(0.0, 1.0),  // South
            vec2(-1.0, 0.0)  // West
        );

        float drawWall(vec2 p, vec2 d) {
            // rotate wall to +x axis
            p = fract(mat2(d.y, d.x, -d.x, d.y) * p) - 0.5;
            // square ends
            //return 2. * max(-p.y, abs(p.x));
            // round ends
            p.y = max(0.0, -p.y);
            return 2.0 * length(p);
        }

        void main() {
            vec2 r = iResolution.xy;
            vec2 p = (vUv * r - 0.5 * r + 0.001) * mazeSize.y / r.y + 0.5 * mazeSize;
            
            // hide mess outside border
            p = clamp(p, vec2(0.5), mazeSize - 0.5);
            
            // Since we can't use #define for texture sampling, we'll implement directly
            // For walls, we'll use procedural pattern instead of the buffer texture
            vec2 wallDir = vec2(cos(p.x * 0.5 + iTime), sin(p.y * 0.5 + iTime));
            
            // this wall
            float d = drawWall(p, wallDir);
            
            // neighbor walls - simplified since we don't have access to the buffer texture
            for (int i = 0; i < 4; ++i) {
                vec2 w = nesw[i];
                vec2 n = -wallDir;
                if (n.x == w.x && n.y == w.y)
                    d = min(d, drawWall(p, -n));
            }

            d -= 1.0 / 3.0; // wall thickness
            
            // aa
            float aa = 1.0 / r.y * mazeSize.y;    
            vec3 color = vec3(sqrt(smoothstep(-aa, aa, d)));
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
};