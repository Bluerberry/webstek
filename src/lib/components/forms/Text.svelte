
<script lang="ts" generics="T extends Record<string, unknown>">

	import { getContext } from 'svelte';
    import { formFieldProxy } from 'sveltekit-superforms';

	import type { FormPathLeaves, SuperForm } from 'sveltekit-superforms';

	type Props = {
        label?: string;
		field: FormPathLeaves<T>;
	}

	let {
		label,
		field
	}: Props = $props();

	const fieldID = `${field}-${crypto.randomUUID()}`;
	const superform: SuperForm<T> = getContext('superform');
    const { value, errors } = formFieldProxy(superform, field);

</script>

<div>
	{#if label}
		<label for={fieldID}>
			{label}
		</label>
	{/if}

	<input
		id={fieldID}
		name={field}
		aria-invalid={$errors ? 'true' : undefined}
		bind:value={$value}
	/>

    {#if $errors}
        <span> {$errors} </span>
    {/if}
</div>