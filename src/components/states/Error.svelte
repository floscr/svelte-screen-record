<script lang="ts">
    import { ErrorKind } from "../../state";
    import type { ErrorState } from "../../state";

    export let context: ErrorState;
</script>

<main>
    {#if context.kind === ErrorKind.MissingPermissions}
        Error: Missing Permissions
    {:else}
        Unknown Error
    {/if}
</main>
