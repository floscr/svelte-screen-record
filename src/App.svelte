<script lang="ts">
    import { createBrowserInspector } from "@statelyai/inspect";
    import { useMachine } from "@xstate/svelte";

    import { stateMachine, StateNames } from "./state";

    const { inspect } = createBrowserInspector({
        // Comment out the line below to start the inspector
        // autoStart: false,
    });

    const { snapshot } = useMachine(stateMachine, { inspect });
</script>

<main>
    {#if $snapshot.matches(StateNames.Initial)}
        Initial
    {:else if $snapshot.matches(StateNames.DevicesLoaded)}
        Devices Loaded
    {:else if $snapshot.matches(StateNames.Error)}
        Error
    {/if}
</main>
