
<script lang="ts" generics="T extends Record<string, any>">

    import { getContext } from 'svelte'
	import { formFieldProxy } from 'sveltekit-superforms'

	import type { SuperForm, FormPathLeaves, FormPathType } from 'sveltekit-superforms'

	type Props = { field: FormPathLeaves<T> }
	let { field }: Props = $props()

	const superform: SuperForm<T> = getContext('superform')
	const { value } = formFieldProxy(superform, field)

	let digits = $state(['', '', '', '', '', ''])
	let inputs: HTMLInputElement[] = []

	$effect(() => {
		value.set(digits.join('') as FormPathType<T, FormPathLeaves<T>>)
		if (digits.every(d => d !== '')) superform.submit()
	})

	function onInput(i: number, e: Event) {
		const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1)
		digits[i] = val
		if (val && i < 5) inputs[i + 1].focus()
	}

	function onKeydown(i: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && !digits[i] && i > 0) {
			inputs[i - 1].focus()
		}
	}

	function onPaste(e: ClipboardEvent) {
		const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? ''
		if (!text) return
		e.preventDefault()
		text.split('').forEach((c, i) => { digits[i] = c })
		inputs[Math.min(text.length, 5)].focus()
	}

</script>

<div class="code-input">
	{#each digits as digit, i}
		<input
			type="text"
			inputmode="numeric"
			maxlength="1"
			value={digit}
			name={i === 0 ? field : undefined}
			bind:this={inputs[i]}
			oninput={(e) => onInput(i, e)}
			onkeydown={(e) => onKeydown(i, e)}
			onpaste={onPaste}
		/>
	{/each}
</div>

<style lang="scss">

    @use '$styles/variables' as *;
	@use '$styles/themes' as *;

	.code-input {
		display: flex;
		flex-flow: row nowrap;
		gap: 0.5rem;

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