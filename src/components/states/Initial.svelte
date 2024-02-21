<script lang="ts">
    import { Button, Select } from "flowbite-svelte";
    import { onMount } from "svelte";

    import type { InitialState } from "../../state.ts";

    let screenElement;
    let laptopElement;
    let uiWrapperElement;

    onMount(() => {
        const animationOptions = {
            duration: 1000,
            easing: "ease-out",
        };

        uiWrapperElement.animate(
            [
                { opacity: 0.3, translate: "0% 30px" },
                { opacity: 1, translate: "0% 0%" },
            ],
            { ...animationOptions, duration: animationOptions.duration / 2 },
        );
        laptopElement.animate(
            [
                { opacity: 0.3, scale: 0.8 },
                { opacity: 1, scale: 1 },
            ],
            animationOptions,
        );
        screenElement.animate(
            [{ transform: "rotateX(-20deg)" }, { transform: "rotateX(0deg)" }],
            animationOptions,
        );
    });

    export let context: InitialState;
</script>

<main class="max-w-screen-sm space-y-6">
    <div
        class="laptop relative flex grow justify-center"
        bind:this={laptopElement}
    >
        <div class="screen" bind:this={screenElement}>
            <Button>Screen screen</Button>
        </div>
        <div class="keyboard"></div>
    </div>
    <div
        class="flex flex-col items-start space-y-3 rounded-lg border border-primary-700 bg-primary-50 bg-opacity-5 p-3 backdrop-blur-sm"
        bind:this={uiWrapperElement}
    >
        <p class="text-sm opacity-70">Select recording devices</p>
        <div class="flex space-x-3">
            <Select id="microphones" placeholder="Select a Microphone">
                {#each context.devices.audioDevices as { label, deviceId }}
                    <option value={deviceId}
                        >{label || deviceId || "Default"}</option
                    >
                {/each}
            </Select>
            <Select id="cameras" placeholder="Select a Camera">
                {#each context.devices.videoDevices as { label, deviceId }}
                    <option value={deviceId}
                        >{label || deviceId || "Default"}</option
                    >
                {/each}
            </Select>
            <Button color="blue">Start</Button>
        </div>
    </div>
</main>

<style lang="postcss">
    .laptop {
        perspective: 500px;
    }

    .keyboard,
    .screen {
        @apply aspect-video rounded;
        max-width: 500px;
        width: 70vw;
        border: 1px solid var(--color-border);
    }
    .screen {
        @apply relative flex  items-center justify-center bg-white bg-opacity-5 p-3;
        transform-origin: bottom center;
        &:after {
            @apply absolute inset-3 rounded-sm bg-white bg-opacity-5 opacity-50;
            content: "";
            top: 10%;
            border: 1px solid var(--color-border);
        }

        &:before {
            @apply absolute aspect-square rounded-full bg-black bg-opacity-10;
            content: "";
            width: 3%;
            top: 2.6%;
            border: 1px solid var(--color-border);
        }
    }

    .keyboard {
        @apply absolute bg-white bg-opacity-5;
        translate: 0% calc(100% + 10px);
        transform: rotateX(45deg) scaleY(0.7);
        transform-origin: top center;
        z-index: -1;
        opacity: 0.4;
        mask-image: -webkit-gradient(
            linear,
            center 20%,
            center bottom,
            from(rgba(0, 0, 0, 1)),
            to(rgba(0, 0, 0, 0))
        );
    }
</style>
