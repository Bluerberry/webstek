
<script lang="ts">

    import * as Form from '$lib/components/forms';
    const { data } = $props();

</script>

<h1> Login </h1>
<Form.Root action="?/login" form={data.loginForm}>
    <Form.Text label="Email" field="email" />
    <Form.Text label="Password" field="password" />
    <Form.Submit />
</Form.Root>