const vertexShader = () => {
  return `
      varying float x;
      varying float y;
      varying float z;
      // varying vec3 vUv;

      uniform float u_time;
      uniform float u_speed; // 0 < u_speed > 2.0 for waves from bow to stern -2.0 < u_speed > 0 for stern to bow
      uniform float u_wavelength; // 0 < u_wavelength > 16.0
      uniform float u_amplitude; // 0 < u_amplitude > 4.0;
      // uniform float[64] u_data_arr;

      void main() {
        // vUv = position;

        x = position.x;
	      y = position.y;

        float floor_x = round(x);
	      float floor_y = round(y);

        float x_multiplier = (32.0 - x) / 8.0;
        float frequency = (32.0 - y) / u_wavelength;

        // z = position.z;
        // z = abs(position.x) + abs(position.y);
        // z = sin(abs(position.x) + abs(position.y));
        // z = sin(position.x + position.y + u_time * .5);
        // z = (int(floor_x) / 50.0 + int(floor_y) / 50.0) * (u_amplitude) * u_time;
        // z = (u_data_arr[int(floor_x)] / 50.0 + u_data_arr[int(floor_y)] / 50.0) * 2.0;

        z = sin(frequency + (u_time * u_speed)) * u_amplitude;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
      }
    `;
};

const fragmentShader = () => {
  return `
    varying float x;
    varying float y;
    // varying float z;
    // varying vec3 vUv;

    // uniform float u_time;
    // uniform vec3 u_black;
    // uniform vec3 u_white;

    void main() {
      // old
      // gl_FragColor = vec4(mix(u_black, u_white, vUv.x), 1.0);

      // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      // if (vUv.x < 0.0) {
      //   gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
      // } else {
      //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      // }
      // gl_FragColor = vec4(abs(sin(u_time * .001)), 0.0, 0.0, 1.0);
      gl_FragColor = vec4((32.0 - abs(x)) / 32.0, (32.0 - abs(y)) / 32.0, (abs(x + y) / 2.0) / 32.0, 1.0);
    }
  `;
};

export { vertexShader, fragmentShader };
