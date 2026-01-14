
<script lang="ts" generics="T extends Record<string, any>">
	
	import { getContext } from 'svelte'
    import { quadOut } from 'svelte/easing'
    import { fade } from 'svelte/transition'
	import { formFieldProxy } from 'sveltekit-superforms'
    
	import { Eye, EyeOff } from '@lucide/svelte'

	import type { SuperForm, FormPathLeaves } from 'sveltekit-superforms'

	type Props = {
		field: FormPathLeaves<T>
		label?: string
		type?: 'text' | 'password'
	}

	let {
		field,
		label,
		type = 'text'
	}: Props = $props()

	const fieldID = `${field}-${crypto.randomUUID()}`
	let show = $state(type === 'text')

	const superform: SuperForm<T> = getContext('superform')
	const { value, errors } = formFieldProxy(superform, field)

</script>

{#if label}
	<label for={fieldID}> {label} </label>
{/if}

<div class="textfield">
	<input
		type={show ? 'text' : 'password'}
		id={fieldID}
		name={field}
		class:password={type === 'password'}
		aria-invalid={$errors ? 'true' : undefined}
		autocomplete="off"
		bind:value={$value}
	/>

	{#if type === 'password'}
		<button type="button" onclick={() => show = !show}>
			{#if show}
				<EyeOff />
			{:else}
				<Eye />
			{/if}
		</button>
	{/if}

	{#if $errors}
		<span transition:fade={{ duration: 100, easing: quadOut }}> 
			{$errors[0]}
		</span>
	{/if}
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;

	label {
		justify-self: end;
		font-size: $l-font;
		color: var(--foreground);
	}

	.textfield {
		position: relative;

		input {
			width: 100%;
			padding: $thin-field-padding $thick-field-padding;			
			border: 2px solid var(--foreground);
			border-radius: $border-radius;

			font-size: $l-font;
			color: var(--foreground);

			&.password {
				padding-right: 2*$thick-field-padding + $icon-size;
			}
		}

		button {
			display: flex;
			justify-content: center;
			align-items: center;

			position: absolute;
			translate: 0 -50%;
			top: 50%;
			right: $thick-field-padding;	

			cursor: pointer;

			:global(.lucide) {
				width: $icon-size;
				height: $icon-size;
				color: var(--foreground);
			}
		}

		span {
			position: absolute;
			top: 100%;
			left: 0;

			font-size: $s-font;
			color: var(--failure);
		}
	}

</style>