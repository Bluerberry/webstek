
<script lang="ts">

    	let { children } = $props()

</script>

<div class="wrapper">
    <header>
        <h1> Underworld Cookbook </h1>
        <h3><i>Asmoranomardicadaistinaculdacar's</i> creations</h3>

        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
    </header>

    {@render children()}
</div>

<style lang="scss">

    @use '$styles/variables' as *;
	@use '$styles/themes' as *;

    .wrapper {
		display: flex;
		flex-flow: column nowrap;
		gap: 5rem;

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

                & ~ p {
                    margin-top: 0.5rem;
                }
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
        }
    }

</style>