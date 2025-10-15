
<script lang="ts">

    const { children, data } = $props();

</script>

{#if data.user}
    <p> Hello {data.user.username}! </p>
    <button onclick={ async () => await fetch('/auth/logout', { method: 'POST' }) }> Logout </button>
{:else}
    <a href="/auth/login"> login </a>
    <a href="/auth/register"> register </a>
{/if}

{@render children()}
