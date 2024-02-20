<script lang="ts">
    import { createBrowserInspector } from "@statelyai/inspect";
    import { useMachine } from "@xstate/svelte";

    import InitialStateComponent from "./components/InitialState.svelte";
    import { stateMachine, StateNames } from "./state";
    import type { InitialState } from "./state.ts";

    const { inspect } = createBrowserInspector({
        // Comment out the line below to start the inspector
        // autoStart: false,
    });

    $: initialContext =
        $snapshot.matches(StateNames.Initial) &&
        ($snapshot.context as InitialState);

    const sm = useMachine(stateMachine, { inspect });
    const { snapshot } = sm;
</script>

<main>
    {#if $snapshot.matches(StateNames.Setup)}
        Setup
    {:else if $snapshot.matches(StateNames.Initial) && typeof initialContext !== "undefined"}
        <InitialStateComponent context={initialContext} />
    {:else if $snapshot.matches(StateNames.Error)}
        Error
    {/if}
</main>
