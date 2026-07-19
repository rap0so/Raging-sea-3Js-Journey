uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform vec3 fogColor;       // Recebido do THREE.UniformsLib['fog']
uniform float fogDensity;   // Recebido do THREE.UniformsLib['fog']

varying float vElevation;
varying float vFogDepth;

void main() {
    vec3 color = mix(uDepthColor, uSurfaceColor, vElevation);

    // A fórmula mágica do FogExp2:
    #define LOG2 1.442695
    float fogFactor = 1.0 - exp2(-fogDensity * fogDensity * vFogDepth * vFogDepth * LOG2);
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    // Mistura a cor da onda (color) com a cor do fog (finalFogColor) baseado na distancia (fogFactor)
    vec3 mixedColor = mix(color, fogColor, fogFactor);

    gl_FragColor = vec4(mixedColor, 1.0);
    #include <colorspace_fragment>
}
