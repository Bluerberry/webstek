<script lang="ts">

    import { Pencil } from '@lucide/svelte'

    import type { PageData } from './$types'
    import Button from '$components/Button.svelte';
    import { tick } from 'svelte';

    type Props = { data: PageData }
	let { data }: Props = $props()

    let isAuthor = $derived(data.recipe.authorId === data.user?.id)

    let editingTitle = $state(false)
    let draftTitle = $state(data.recipe.title)
    let editableTitleElement = $state<HTMLElement>()

    function startTitleEdit() {
        editingTitle = true
        draftTitle = data.recipe.title
        tick().then(() => editableTitleElement?.focus())
    }

    function endTitleEdit() {
        editingTitle = false
        data.recipe.title = draftTitle
        // ... call remote
    }

</script>

<div class="wrapper">
    <header>
        <div class="editable">
            <div class="input-wrapper" data-value={draftTitle || 'Missing title'}>
                <input
                    type="text" 
                    placeholder="Missing title" 
                    disabled={!isAuthor || !editingTitle}
                    bind:value={draftTitle} 
                    bind:this={editableTitleElement}
                    onblur={endTitleEdit}
                >
            </div>
                
            {#if isAuthor}
                <Button style="icon" onclick={startTitleEdit}> <Pencil /> </Button>
            {/if}
        </div>

        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
    </header>
</div>

<style lang="scss">

    @use '$styles/variables' as *;
	@use '$styles/themes' as *;

    .editable {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: 0.75rem;

        .input-wrapper {
            position: relative;

            &::after {
                content: attr(data-value);
                visibility: hidden;
                font-size: $xxxl-font;
                white-space: pre;
            }

            input {
                position: absolute;
                width: 100%;
                outline: none;
                font: inherit;
                font-size: $xxxl-font;

                &:disabled {
                    color: var(--foreground);
                }
            }
        }

        :global(.button) {
            outline: none;
            
            :global(.lucide) {
                width: 1.1rem;
                color: var(--muted);
            }
        }
    }

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