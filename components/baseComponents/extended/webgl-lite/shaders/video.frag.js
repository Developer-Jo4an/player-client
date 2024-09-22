const colorFix = getColor();

export default [
  `
  precision mediump float;
  uniform vec2 resolution;
  uniform sampler2D texture;
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    uv.y = 1.0 - uv.y;
    vec4 col = texture2D(texture, vec2(uv.x * 0.5 + 0.5, uv.y));

    vec4 diachromic = texture2D(texture, vec2(uv.x * 0.5, uv.y));
    float alpha = diachromic.x * diachromic.y * diachromic.z;

    if (alpha < 0.01){ discard; }
    `,
    colorFix,
  `}`
].join('\n');



function getColor() {
  return navigator.userAgent.toLowerCase().indexOf('safari/602') === -1 ?
    'gl_FragColor = vec4(col.rgb, alpha);'
    : 'gl_FragColor = vec4(col.zyx, alpha);';
}


function getTintedColor() {
  return navigator.userAgent.toLowerCase().indexOf('safari/602') === -1 ?
    `gl_FragColor = vec4(col.rgb * (rgbColor * alpha + (1. - alpha)), alpha);`
    : `gl_FragColor = vec4(col.zyx * (rgbColor * alpha + (1. - alpha)), alpha);`;
}
