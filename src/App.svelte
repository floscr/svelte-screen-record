<script lang="ts">
    import { createBrowserInspector } from "@statelyai/inspect";
    import { useMachine } from "@xstate/svelte";
    import { Button, Select } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { match } from "ts-pattern";

    import { stateMachine, StateNames } from "./state";

    const { snapshot, state, send } = useMachine(stateMachine);
    console.log(state);
    console.log(snapshot);

    const { inspect } = createBrowserInspector({
        // Comment out the line below to start the inspector
        autoStart: false,
    });

    // const view = match(state.context)
    //     .with({ name: StateNames.Initial }, () => <p>Loading</p>)
    //     .otherwise(() => null);
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
