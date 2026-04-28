
<script lang="ts">

	import vertexShader from './vertexShader.glsl?raw'
	import fragmentShader from './fragmentShader.glsl?raw'
	import { createProgram, prepareTransform, prepareVertices } from '$scripts/webgl'
    import { Tween } from 'svelte/motion';

	async function loop(tween: Tween<number>) {
		while (true) {
			await tween.set(2 * Math.PI);
			tween.set(0, { duration: 0 });
		}
	}

	let rx = new Tween(0, { duration: 2000 });
	let ry = new Tween(0, { duration: 3000 });
	let rz = new Tween(0, { duration: 4000 });

	loop(rx);
	loop(ry);
	loop(rz);

	let canvas = $state<HTMLCanvasElement>();
	let gl = $state<WebGLRenderingContext>();
	let program = $state<WebGLProgram>();

	$effect(() => {
		if (!canvas) return;
		let result = createProgram(canvas, vertexShader, fragmentShader)
		gl = result.gl; program = result.program;
	})

	$effect(() => {
		if (!gl || !program) return;
		prepareVertices(gl, program);
		prepareTransform(gl, program, rx.current, ry.current, rz.current);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	})

</script>

<canvas bind:this={canvas}></canvas>

<style lang="scss">

	canvas {
		width: 100%;
		height: 100%;
	}

</style>