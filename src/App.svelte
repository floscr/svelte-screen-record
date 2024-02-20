<script lang="ts">
    import { createBrowserInspector } from "@statelyai/inspect";
    import { useMachine } from "@xstate/svelte";

    import InitialStateComponent from "./components/InitialState.svelte";
    import { stateMachine, StateNames } from "./state";
    import type { InitialState } from "./state.ts";

    const { inspect } = createBrowserInspector({
        autoStart: import.meta.env.DEV,
    });

    $: initialContext =
        $snapshot.matches(StateNames.Initial) &&
        ($snapshot.context as InitialState);

    const { snapshot } = useMachine(stateMachine, { inspect });
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
