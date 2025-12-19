
<script lang="ts">

    import Button from '$components/Button.svelte';
    import { SquarePen } from '@lucide/svelte';

    let { data } = $props();

</script>

<div class="wrapper">
    <h1> Account </h1>
    <p>
        As you probably know, websites these days track a bunch of stuff about us.
        Think browsing habits, device info, location, and probably a lot more you're never told about.
        It's tiring. With Webstek, I intend to collect the bare minimum of personal data. All known
        information about you will be listed below, and can easily be deleted.
    </p>

    <h2> Personalia </h2>
    <div class="table">
        <span> <b>Username</b> </span>
        <span> {data.user?.username} </span>
        <div class="row">
            <Button style='icon'> <SquarePen /> </Button>
        </div>

        <span> <b>Email</b> </span>
        <span> {data.user?.email} </span>
        <div class="row">
            <Button style='icon'> <SquarePen /> </Button>
        </div>

        <span> <b>Password</b> </span>
        <span> ●●●●●●●● </span>
        <div class="row">
            <Button style='icon'> <SquarePen /> </Button>
        </div>
    </div>

    <h2> Sessions </h2>
</div>

<style lang="scss">

    @use '$styles/variables' as *;
    @use '$styles/themes' as *;
    @include themed();

    .wrapper {

        .table {
            display: grid;
            grid-template: "label value buttons" auto / max-content auto max-content;
            align-items: center;
            column-gap: 2rem;

            font-size: $l-font;
        }

        h2 {
            margin-top: 1.5rem;
        }
    }

</style>