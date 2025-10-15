
<script lang="ts" generics="T extends Record<string, unknown>">

    import { setContext } from 'svelte';
    import { superForm } from 'sveltekit-superforms';

    import type { Snippet } from 'svelte';
    import type { SuperValidated } from 'sveltekit-superforms';

    type Props = {
        children: Snippet;
        action: string;
        form: SuperValidated<T>;
    };

    let {
        children,
        action,
        form
    }: Props = $props();

    const superform = superForm(form);
    setContext('superform', superform)

</script>

<form
    method="POST"
    action={action}
    use:superform.enhance
>
    {@render children()}
</form>
