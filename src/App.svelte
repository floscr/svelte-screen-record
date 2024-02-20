<script lang="ts">
    import { useMachine } from "@xstate/svelte";
    import { Button, Select } from "flowbite-svelte";
    import { onMount } from "svelte";

    import { stateMachine } from "./state";

    const { state, send } = useMachine(stateMachine);
    console.log(state);
</script>
