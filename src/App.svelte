<script lang="ts">
    import { createBrowserInspector } from "@statelyai/inspect";
    import { useMachine } from "@xstate/svelte";
    import { Button, Select } from "flowbite-svelte";

    import { stateMachine, StateNames } from "./state";

    const { inspect } = createBrowserInspector({
        // Comment out the line below to start the inspector
        // autoStart: false,
    });

    const sm = useMachine(stateMachine, { inspect });
    const { snapshot } = sm;

    console.log($snapshot);
    console.log(sm);
</script>

<main>
    {#if $snapshot.matches(StateNames.Setup)}
        Initial
    {:else if $snapshot.matches(StateNames.Initial)}
        <Select id="microphones" class="mt-2" placeholder="">
            {#each $snapshot.context.devices.audioDevices as { label, deviceId }}
                <option>{label || deviceId || "Default"}</option>
            {/each}
        </Select>
        <Select id="microphones" class="mt-2" placeholder="">
            {#each $snapshot.context.devices.videoDevices as { label, deviceId }}
                <option>{label || deviceId || "Default"}</option>
            {/each}
        </Select>
        Initial
    {:else if $snapshot.matches(StateNames.Error)}
        Error
    {/if}
</main>
