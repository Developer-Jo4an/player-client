  #ifdef GL_ES
precision mediump float;
#define GLSLIFY 1
#endif

uniform vec4 resolution;
uniform vec2 mouse;

uniform float time;
uniform float point;
uniform float pixelRatio;

uniform vec2 offset;
uniform vec2 threshold;
uniform sampler2D texture;
uniform sampler2D textureDepth;

uniform vec2 offsetBg;
uniform vec2 thresholdBg;
uniform sampler2D textureBg;
uniform sampler2D textureBgDepth;

uniform float doubleTexures;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.);
  return mix(m, 2.0 - m, step(1.0, m));
}

vec4 fake3dColor(sampler2D texture, sampler2D textureDepth, vec2 vUv, vec2 threshold, vec2 offset){
  vec4 tex1 = texture2D(textureDepth, mirrored(vUv));
  float red = offset.x + tex1.r * offset.y;
  vec2 fake3d = vec2(vUv.x + (red - point)*mouse.x/threshold.x, vUv.y + (red - point)*mouse.y/threshold.y);
  return texture2D(texture, mirrored(fake3d));
}

void main() {
  vec2 uv = pixelRatio*gl_FragCoord.xy / resolution.xy;
  vec2 vUv = (uv - vec2(0.5))*resolution.zw + vec2(0.5);
  vUv.y = 1. - vUv.y;

  vec4 tex0 = fake3dColor(texture, textureDepth, vUv, threshold, offset);

  if (doubleTexures > 0.0){
    if (tex0.a == 1.0){
      gl_FragColor = tex0;
    } else if (tex0.a == 0.0){
      gl_FragColor = fake3dColor(textureBg, textureBgDepth, vUv, thresholdBg, offsetBg);
    } else {
      vec4 tex1 = fake3dColor(textureBg, textureBgDepth, vUv, thresholdBg, offsetBg);
      gl_FragColor= tex0 * tex0.a + tex1 * (1.0 -tex0.a);
    }
  } else {
    gl_FragColor = tex0;
  }
}
