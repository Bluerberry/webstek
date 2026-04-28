
class Matrix {
	data: number[];
	
	constructor(data: number[]) {
		this.data = data;
	}

	static identity() {
		return new Matrix([
			1,  0,  0,  0,
			0,  1,  0,  0,
			0,  0,  1,  0,
			0,  0,  0,  1
		]);
	}

	static orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number) {
		return new Matrix([
			2 / (right - left), 0, 0, 0,
			0, 2 / (top - bottom), 0, 0,
			0, 0, 2 / (near - far), 0,
 
			(left + right) / (left - right),
			(bottom + top) / (bottom - top),
			(near + far) / (near - far),
			1
  		])	
	}

	static perspective(fov: number, aspect: number, near: number, far: number) {
	    let f = 1 / Math.tan(fov / 2);
    	let nf = 1 / (near - far);

    	return new Matrix([
    	    f / aspect, 0, 0, 0,
    	    0, f, 0, 0,
    	    0, 0, (far + near) * nf, (2 * far * near) * nf,
    	    0, 0, -1, 0
    	]);
	}

	static translate(dx: number, dy: number, dz: number) {
	    return new Matrix([
	        1, 0, 0, dx,
	        0, 1, 0, dy,
	        0, 0, 1, dz,
	        0, 0, 0, 1
	    ]);
	}

	static scale(sx: number, sy: number, sz: number) {
		return new Matrix([
			sx, 0,  0,  0,
			0,  sy, 0,  0,
			0,  0,  sz, 0,
			0,  0,  0,  1
		])
	}

	static rotateX(radians: number) {
		let c = Math.cos(radians);
		let s = Math.sin(radians);
	
		return new Matrix([
			1,  0,  0,  0,
			0,  c,  s,  0,
			0, -s,  c,  0,
			0,  0,  0,  1
		])
	}

	static rotateY(radians: number) {
		let c = Math.cos(radians);
		let s = Math.sin(radians);
	
		return new Matrix([
			c,  0, -s,  0,
			0,  1,  0,  0,
			s,  0,  c,  0,
			0,  0,  0,  1
		])
	}

	static rotateZ(radians: number) {
		let c = Math.cos(radians);
		let s = Math.sin(radians);
	
		return new Matrix([
			c,  s,  0,  0,
		   -s,  c,  0,  0,
			0,  0,  1,  0,
			0,  0,  0,  1
		])
	}

	apply(other: Matrix) {
		let a11 = this.data[0];
		let a21 = this.data[1];
		let a31 = this.data[2];
		let a41 = this.data[3];
		let a12 = this.data[4];
		let a22 = this.data[5];
		let a32 = this.data[6];
		let a42 = this.data[7];
		let a13 = this.data[8];
		let a23 = this.data[9];
		let a33 = this.data[10];
		let a43 = this.data[11];
		let a14 = this.data[12];
		let a24 = this.data[13];
		let a34 = this.data[14];
		let a44 = this.data[15];
		let b11 = other.data[0];
		let b21 = other.data[1];
		let b31 = other.data[2];
		let b41 = other.data[3];
		let b12 = other.data[4];
		let b22 = other.data[5];
		let b32 = other.data[6];
		let b42 = other.data[7];
		let b13 = other.data[8];
		let b23 = other.data[9];
		let b33 = other.data[10];
		let b43 = other.data[11];
		let b14 = other.data[12];
		let b24 = other.data[13];
		let b34 = other.data[14];
		let b44 = other.data[15];

		this.data = [
			a11 * b11 + a21 * b12 + a31 * b13 + a41 * b14,
			a11 * b21 + a21 * b22 + a31 * b23 + a41 * b24,
			a11 * b31 + a21 * b32 + a31 * b33 + a41 * b34,
			a11 * b41 + a21 * b42 + a31 * b43 + a41 * b44,
			a12 * b11 + a22 * b12 + a32 * b13 + a42 * b14,
			a12 * b21 + a22 * b22 + a32 * b23 + a42 * b24,
			a12 * b31 + a22 * b32 + a32 * b33 + a42 * b34,
			a12 * b41 + a22 * b42 + a32 * b43 + a42 * b44,
			a13 * b11 + a23 * b12 + a33 * b13 + a43 * b14,
			a13 * b21 + a23 * b22 + a33 * b23 + a43 * b24,
			a13 * b31 + a23 * b32 + a33 * b33 + a43 * b34,
			a13 * b41 + a23 * b42 + a33 * b43 + a43 * b44,
			a14 * b11 + a24 * b12 + a34 * b13 + a44 * b14,
			a14 * b21 + a24 * b22 + a34 * b23 + a44 * b24,
			a14 * b31 + a24 * b32 + a34 * b33 + a44 * b34,
			a14 * b41 + a24 * b42 + a34 * b43 + a44 * b44
		]

		return this; // For chaining purposes
	}
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
	let shader = gl.createShader(type);
	if (shader === null) throw new Error("Failed to create shader");
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) return shader;
	gl.deleteShader(shader);
	throw new Error("Failed to compile shader");
}

export function createProgram(canvas: HTMLCanvasElement, vertexShaderSource: string, fragmentShaderSource: string) {
	let gl = canvas.getContext("webgl");
	if (!gl) throw new Error("Failed to get WebGL context");
	
	let program = gl.createProgram();
	let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	let success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
		gl.deleteProgram(program);
		throw new Error("Failed to link program");
	}

	const dpr = window.devicePixelRatio || 1;
	canvas.width = canvas.clientWidth * dpr;
	canvas.height = canvas.clientHeight * dpr;

	gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(program);

	return { gl, program };
}

export function prepareVertices(gl: WebGLRenderingContext, program: WebGLProgram) {
	let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
	let positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([
			0,    100, 0,
		   -100, -100, 0,
			100, -100, 0
		]),
		gl.STATIC_DRAW
	);

	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
}

export function prepareTransform(gl: WebGLRenderingContext, program: WebGLProgram, rx: number, ry: number, rz: number) {
	let transformUniformLocation = gl.getUniformLocation(program, "u_transform");
	let matrix = Matrix.perspective(1, gl.canvas.width / gl.canvas.height, 1, 1000)
		.apply(Matrix.translate(gl.canvas.width / 2, gl.canvas.height / 2, -200))
		.apply(Matrix.rotateX(rx))
		.apply(Matrix.rotateY(ry))
		.apply(Matrix.rotateZ(rz))
		//.apply(Matrix.orthographic(0, gl.canvas.width, 0, gl.canvas.height, 1, 1000))

	gl.uniformMatrix4fv(transformUniformLocation, false, matrix.data);
}