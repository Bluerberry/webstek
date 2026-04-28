
precision mediump float;
varying vec4 v_color;

void main() {
    gl_FragColor = vec4(
        v_color.x * 0.5 + 0.5,
        v_color.y * 0.5 + 0.5,
        v_color.z * 0.5 + 0.5,
        1
    );
}