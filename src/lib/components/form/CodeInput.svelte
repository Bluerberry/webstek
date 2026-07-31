<script lang="ts" generics="T extends Record<string, any>">

	import { getContext } from 'svelte'
	import { formFieldProxy } from 'sveltekit-superforms'

	import type { SuperForm, FormPathLeaves, FormPathType } from 'sveltekit-superforms'

	type Props = { field: FormPathLeaves<T> }
	let { field }: Props = $props()
	
	const superform: SuperForm<T> = getContext('superform')
	const fieldId = crypto.randomUUID()
	const formId = superform.formId

	// svelte-ignore state_referenced_locally
	const { value } = formFieldProxy(superform, field)

	let digits = $state(['', '', '', '', '', ''])
	let inputs: HTMLInputElement[] = []

	$effect(() => {
		value.set(digits.join('') as FormPathType<T, FormPathLeaves<T>>)
		if (digits.every(d => d !== '')) superform.submit()
	})

	function onBeforeInput(i: number, event: InputEvent) {
		if (event.data && !/^\d$/.test(event.data)) event.preventDefault()
	}

	function onKeydown(i: number, event: KeyboardEvent) {
		if (event.key === 'Backspace') {
			event.preventDefault()
			if (digits[i]) {
				digits[i] = ''
			} else if (i > 0) {
				digits[i - 1] = ''
				inputs[i - 1].focus()
			}
		} else if (event.key === 'ArrowLeft' && i > 0) {
			inputs[i - 1].focus()
		} else if (event.key === 'ArrowRight' && i < 5) {
			inputs[i + 1].focus()
		}
	}

	function onInput(i: number, event: Event) {
		const input = event.target as HTMLInputElement
		const value = input.value.replace(/\D/g, '').slice(-1)

		digits[i] = value
		input.value = value
		if (value && i < 5) inputs[i + 1].focus()
	}

	function onPaste(event: ClipboardEvent) {
		const text = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? ''
		if (!text) return

		event.preventDefault()
		digits = [...text.split(''), ...Array(6 - text.length).fill('')]
		inputs[Math.min(text.length, 5)].focus()
	}

</script>

<div class="code-input">
	<input 
		type="hidden"
		id={fieldId}
		name={field} 
		form={$formId}
		value={digits.join('')} 
	/>

	<fieldset>
		{#each digits as digit, i (i)}
			<input
				type="text"
				value={digit}
				maxlength="1"
				inputmode="numeric"
				autocomplete="off"
				onbeforeinput={event => onBeforeInput(i, event)}
				onkeydown={event => onKeydown(i, event)}
				oninput={event => onInput(i, event)}
				onpaste={event => onPaste(event)}
				bind:this={inputs[i]}
			/>
		{/each}
	</fieldset>
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;

	.code-input {
		fieldset {
			display: flex;
			flex-flow: row nowrap;
			gap: 0.5rem;
		}

		input {
			width: 3rem;
			height: 3.5rem;
			
			padding: $thin-field-padding $thick-field-padding;			
			border: 2px solid var(--foreground);
			border-radius: $border-radius;
			
			font-size: $l-font;
			text-align: center;
			color: var(--foreground);
		}
	}

</style>