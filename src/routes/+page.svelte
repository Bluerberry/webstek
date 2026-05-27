
<script lang="ts">

    import Button from '$components/Button.svelte'
    import { Plus } from '@lucide/svelte';

    const today = new Date()
    let age = $state(today.getFullYear() - 2002)
    if (today.getMonth() < 5) age--

    let { data } = $props()

</script>


<div class="wrapper">
    <header>
        <h1> Webstek </h1>
        <h3> A collection of projects and passions by <i>Bram Kreulen</i> </h3>

        <p>
            Welcome to Webstek! My name is Bram Kreulen, and I'll be your host for tonight.
            On the menu is a wide variety of successes, failures, trials and tribulations I've encountered
            while exploring the vast and varied world of web development. Enjoy!
        </p>
    </header>

    <section id="quick-menu">     
        <div class="tile">
            <h2> About Webstek </h2>
            <p> This site is a passion project I've created to host a variety of web related projects and tools.  </p>
            <p> &emsp; It's built using modern-day techniques, with the goal to provide an intutive, accessible, and private experience. One could consider this site to be one of the projects on display here! </p>
            <Button href="/about"> More info </Button>
        </div>

        <div class="tile">
            <h2> Portfolio </h2>
            <p> My name is Bram Kreulen. I am a {age} year old developer, and a student of Computer Science & Engineering at the <i>Technical University of Delft</i>. </p>
            <p> &emsp; I love the flexibility and creativity of web development, and UI/UX design. I also enjoy forays into rendering and computer graphics </p>
            <Button href="/portfolio"> View portfolio </Button>
        </div>
    </section>

    <section id="tools">
        <h2> Your Tools </h2>

        {#if data.user === undefined}
            <p> Webstek offers several tools and apps. If you create an account, you can add interactive widgets here! </p>
        {:else}

            <div class="widget-grid">
                <button class="widget" style="--col-span: 2; --row-span: 1"> ... </button>
                <button class="widget" style="--col-span: 2; --row-span: 2"> ... </button>
                <button class="widget" style="--col-span: 1; --row-span: 1"> ... </button>
            </div>

        {/if}
    </section>
</div>

<style lang="scss">

    @use '$styles/variables' as *;
	@use '$styles/themes' as *;

    $widget-size: 10rem;

    .wrapper {
		display: flex;
		flex-flow: column nowrap;
		gap: 4.5rem;

        width: 100%;
		height: 100%;
		max-width: 650px;

        header {
            h3 {
                color: var(--muted)
            }

            p {
                margin-top: 1.75rem;
                text-align: justify;
            }
        }

        section {
            display: flex;
			flex-flow: column nowrap;
			gap: 2rem;

			h2 {
				display: flex;
				align-items: baseline;
                gap: 0.5rem;

                margin-bottom: 0.75rem;

				&::after {
					content: '';
                    
					flex: 1;
					border-bottom: 1px solid var(--foreground);
				}
			}

            p {
                text-align: justify;

                & ~ p {
                    margin-top: 0.5rem;
                }
            }
        }

        #quick-menu {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            column-gap: 3rem;

            width: 100%;

            .tile {
                display: flex;
                flex-flow: column nowrap;

                :global(.button) {
                    margin: 1.5rem auto 0;
                }
            }
        }

        #tools {
            p {
                max-width: 20rem;
                margin: auto;

                color: var(--muted); 
                text-align: center;
            }

            .widget-grid {
                display: grid;
                grid-template-columns: repeat(3, $widget-size);
                grid-auto-rows: $widget-size;
                grid-auto-flow: dense;
                align-items: stretch;
                gap: 1rem;

                margin: auto;

                .widget {
                    display: block;
                    grid-column: span var(--col-span, 1);
                    grid-row: span var(--row-span, 1);
                    border: 2px solid var(--foreground);
                    border-radius: $border-radius;
                }
            }
        }
    }

</style>