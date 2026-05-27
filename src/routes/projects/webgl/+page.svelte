
<script lang="ts">

	import vertexShader from './vertexShader.glsl?raw'
	import fragmentShader from './fragmentShader.glsl?raw'
	import { Matrix, createProgram, setColors, setVertices } from '$scripts/webgl'
    import { Tween } from 'svelte/motion';

	async function loop(tween: Tween<number>) {
		while (true) {
			await tween.set(2 * Math.PI);
			tween.set(0, { duration: 0 });
		}
	}

	let dx = new Tween(0, { duration: 10000 });
	let dy = new Tween(0, { duration: 8000 });
	let dz = new Tween(0, { duration: 12000 });

	loop(dx);
	loop(dy);
	loop(dz);

	let canvas = $state<HTMLCanvasElement>();
	let gl = $state<WebGLRenderingContext>();
	let program = $state<WebGLProgram>();

	$effect(() => {
		if (!canvas) return
		let result = createProgram(canvas, vertexShader, fragmentShader)
		program = result.program
		gl = result.gl
	})

	$effect(() => {
		if (!canvas || !gl || !program) return;

		// Load positions
		let positionBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
		setVertices(gl)
		
		let positionLocation = gl.getAttribLocation(program, "a_position")
		gl.enableVertexAttribArray(positionLocation)
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
		gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)

		// Load colors
		let colorBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
		setColors(gl)
		
		let colorLocation = gl.getAttribLocation(program, "a_color")
		gl.enableVertexAttribArray(colorLocation)
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
		gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0)

		// Load transform
		let transformLocation = gl.getUniformLocation(program, "u_transform")
	    let transform = Matrix.rotateX(dx.current)
			.apply(Matrix.rotateY(dy.current))
			.apply(Matrix.rotateZ(dz.current))
			.apply(Matrix.scale(5, 5, 5))
			.apply(Matrix.translate(0, 0, -50))
			.apply(Matrix.perspective(Math.PI / 4, gl.canvas.width / gl.canvas.height, 1, 100))

		gl.uniformMatrix4fv(transformLocation, false, transform.data);

		// Set ratio
		const dpr = window.devicePixelRatio || 1;
		canvas.width = canvas.clientWidth * dpr;
		canvas.height = canvas.clientHeight * dpr;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
		
		// Enable culling
		gl.enable(gl.CULL_FACE)
		gl.cullFace(gl.BACK)

		// Enable depth test & clear canvas
		gl.enable(gl.DEPTH_TEST)
		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		// Draw scene
		gl.useProgram(program)
		gl.drawArrays(gl.TRIANGLES, 0, 36)
	})

</script>

<canvas bind:this={canvas}></canvas>

<style lang="scss">

	canvas {
		width: 100%;
		height: 100%;
	}

</style>