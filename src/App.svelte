<script lang="ts">
    import { createBrowserInspector } from "@statelyai/inspect";
    import { useMachine } from "@xstate/svelte";

    import ErrorStateComponent from "./components/states/Error.svelte";
    import InitialStateComponent from "./components/states/Initial.svelte";
    import { stateMachine, StateNames } from "./state";
    import type { ErrorState, InitialState } from "./state.ts";

    const { inspect } = createBrowserInspector({
        autoStart: import.meta.env.DEV,
    });
    $: errorContext = $snapshot.matches(StateNames.Error)
        ? ($snapshot.context as ErrorState)
        : undefined;

    $: initialContext = $snapshot.matches(StateNames.Initial)
        ? ($snapshot.context as InitialState)
        : undefined;

    const { snapshot } = useMachine(stateMachine, { inspect });
</script>

<main>
    {#if $snapshot.matches(StateNames.Setup)}
        <!-- Empty -->
    {:else if $snapshot.matches(StateNames.Initial) && typeof initialContext !== "undefined"}
        <InitialStateComponent context={initialContext} />
    {:else if $snapshot.matches(StateNames.Error) && typeof errorContext !== "undefined"}
        <ErrorStateComponent context={errorContext} />
    {/if}
</main>
