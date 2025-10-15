
<script lang="ts">

    import * as Form from '$lib/components/forms';
    const { data } = $props();

</script>

<h1> Register </h1>
<Form.Root action="?/register" form={data.registerForm}>
    <Form.Text label="Username" field="username" />
    <Form.Text label="Email" field="email" />
    <Form.Text label="Password" field="password" />
    <Form.Submit />
</Form.Root>