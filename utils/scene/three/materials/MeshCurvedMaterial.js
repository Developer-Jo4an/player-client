import MaterialHelper from "../MaterialHelper";

/**
 * Использован для закругления земли на "линии горизонта"
 */
export default class MeshCurvedMaterial extends THREE.MeshBasicMaterial {


  constructor(params = {}) {
    const _uniforms = MaterialHelper.setUniforms(params || {}, [
      //x-axis data
      ['xDirections', params.xDirections ?? [0.0], 'vec3'], //[-1.0, 1.0, 0.0]
      ['xDirection', 0.0, 'float'], //turnProgress

      //x-axis transform
      ['radius', params.radius, 'float'],
      ['angleX', params.angleX, 'float'],
      ['cameraOffset', params.cameraOffset ?? new THREE.Vector3(), 'vec3'],

      //z-axis transform
      ['angleY', params.angleY, 'float'],
      ['yRadius', params.yRadius, 'float'],
    ]);

    super(params);
    this.onBeforeCompile = this.onBeforeCompile.bind(this);
    this.subType = 'MeshCurvedMaterial';
    this._uniforms = _uniforms;
    MaterialHelper.initUniforms(this);
  }


  onBeforeCompile(shader) {
    this.shader = shader;

    MaterialHelper.addUniformsToShader(this, shader);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>', [
          `vec2 rotateV2(vec2 vector, float angle) {
              float x1 = vector.x * cos(angle) - vector.y * sin(angle);
              float y1 = vector.x * sin(angle) + vector.y * cos(angle);
              return vec2(x1, y1);
            }
            `,
          '#include <common>',
          MaterialHelper.getUniformsShaderDefenition(this),
        ].join('\n'))
      .replace(
        '#include <project_vertex>',
        `
            vec4 mvPosition = vec4( transformed, 1.0 );

            #ifdef USE_INSTANCING

              mvPosition = instanceMatrix * mvPosition;

            #endif

            mvPosition = modelViewMatrix * mvPosition;

// apply transform to x-axis: curved right/left

             float offsetZ = cameraPosition.z - mvPosition.z- cameraOffset.z;
             float deltaZ = abs(offsetZ);
             float arcLength = angleX * radius;
             float progressZ = clamp(deltaZ/arcLength, 0.0, 1.0);
             float angle = angleX * progressZ * sign(offsetZ);
             vec2 offset = vec2(radius, 0.0);

             vec2 rotated = rotateV2(offset, angle );
             vec2 resultOffset = vec2(rotated.x - offset.x, rotated.y - offset.y);

             if (deltaZ > arcLength){

                float deltaD = deltaZ - arcLength;

                vec2 offset = vec2(
                  cos(PI/2.0 - angleX) * deltaD,
                  sin(PI/2.0 - angleX) * deltaD
                );
                resultOffset.x -= offset.x;
                resultOffset.y += offset.y;

             }

             //mvPosition.x -= xDirection * resultOffset.x;
             //mvPosition.z -= resultOffset.y;

// apply transform to z-axis: curved down

              float arcLengthY = yRadius * angleY;
              float progressY = clamp(deltaZ/arcLengthY, 0.0, 1.0);
              float resultAngle = angleY * progressY * sign(offsetZ);
              vec2 offsetY = vec2(0, yRadius);
              vec2 rotatedY = rotateV2(offsetY, resultAngle);
              vec2 resultOffsetY = vec2(rotatedY.x - offsetY.x, rotatedY.y - offsetY.y);

             if (deltaZ > arcLengthY){
                 float deltaD = deltaZ - arcLengthY;

                 vec2 offset = vec2(
                   cos(PI/2.0 - angleY) * deltaD,
                   sin(PI/2.0 - angleY) * deltaD
                 );
                 resultOffsetY.x -= offset.x;
                 resultOffsetY.y -= offset.y;
             }

             mvPosition.y += resultOffsetY.y;
             mvPosition.z += resultOffsetY.x;

             gl_Position = projectionMatrix * mvPosition;
        `);
  }

}
