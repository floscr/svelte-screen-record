<script lang="ts">
    import type { ErrorState } from "../../state.ts";
    import { ErrorKind } from "../../state.ts";

    export let context: ErrorState;
</script>

<main>
    {#if context.kind === ErrorKind.MissingPermissions}
        Error: Missing Permissions
    {:else}
        Unknown Error
    {/if}
</main>
