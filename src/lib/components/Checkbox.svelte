
<script lang="ts">

    import type { ChangeEventHandler } from 'svelte/elements'

	type Props = {
		onchange?: ChangeEventHandler<HTMLInputElement>
		checked?: boolean
	}

	let {
		onchange,
		checked = $bindable(false)
	}: Props = $props()

</script>

<label class="checkbox">
	<input type="checkbox" bind:checked {onchange} >
</label>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	@use 'sass:math';

	$checkbox-size: 1.5rem;
	$checkbox-h: 0.2rem;
	$checkbox-v: 0.375rem;

	.checkbox {
		position: relative;
		width: $checkbox-size;
		height: $checkbox-size;

		box-sizing: content-box;

		border: 2px solid var(--foreground);
		border-radius: $border-radius;
		background-color: var(--background);

		cursor: pointer;

		&:has(input[type=checkbox]:checked) {
			background-color: var(--foreground);

			&::after {
				content: '';

				box-sizing: border-box;

				position: absolute;
				transform-origin: bottom right;
				transform: translate(-100%, 0) rotate(45deg);
				left: 2*$checkbox-v - $checkbox-h;
				bottom: $checkbox-v;

				width: (2*$checkbox-v - 2*$checkbox-h) * math.sqrt(2);
				height: ($checkbox-size - 2*$checkbox-v) * math.sqrt(2);
				border: 2px solid var(--background);
				border-width: 0 2px 2px 0;
			}
		}
	
		input[type=checkbox] {
			position: absolute;
			inset: 0;
			opacity: 0;
			margin: 0;
			width: 100%;
			height: 100%;
			cursor: pointer;
		}
	}

</style>