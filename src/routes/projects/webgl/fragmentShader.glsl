
precision mediump float;

varying vec4 v_color;

void main() {
    float d = 50.4 - gl_FragCoord.z * 50.0;
    gl_FragColor = v_color * vec4(1.0, 1.0, 1.0, d);
}