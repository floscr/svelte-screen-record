<script lang="ts">
    import { Select } from "flowbite-svelte";

    import type { InitialState } from "../state.ts";

    export let context: InitialState;
</script>

<main>
    <Select id="microphones" class="mt-2" placeholder="Select a Microphone">
        {#each context.devices.audioDevices as { label, deviceId }}
            <option value={deviceId}>{label || deviceId || "Default"}</option>
        {/each}
    </Select>
    <Select id="cameras" class="mt-2" placeholder="Select a Camera">
        {#each context.devices.videoDevices as { label, deviceId }}
            <option value={deviceId}>{label || deviceId || "Default"}</option>
        {/each}
    </Select>
</main>
