<script lang="ts">
    import { Button, Select } from "flowbite-svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import { match, P } from "ts-pattern";

    import type { InitialState } from "../../state";

    const dispatch = createEventDispatcher();

    let screenElement: HTMLDivElement;
    let laptopElement: HTMLDivElement;
    let uiWrapperElement: HTMLDivElement;
    let videoElement: HTMLVideoElement;

    let aspectRatioCSS: string = "16 / 9";

    function onPreviewClick() {
        dispatch("preview");
    }

    function dispatchDeviceSelectedIdChange(eventKey: string, event: Event) {
        const target = event.target as HTMLSelectElement;
        dispatch(eventKey, target.value);
    }

    function onChangeSelectedAudioInputId(event: Event) {
        dispatchDeviceSelectedIdChange("changeSelectedAudioInputId", event);
    }

    function onChangeSelectedVideoInputId(event: Event) {
        dispatchDeviceSelectedIdChange("changeSelectedVideoInputId", event);
    }

    const animateLaptop = function () {
        const animationOptions = {
            duration: 750,
            easing: "ease-out",
        };

        uiWrapperElement.animate(
            [
                { opacity: 0.3, translate: "0% 10px" },
                { opacity: 1, translate: "0% 0%" },
            ],
            { ...animationOptions, duration: animationOptions.duration / 1.5 },
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
    };

    onMount(() => {
        const screenWidth = window.screen.availWidth;
        const screenHeight = window.screen.availHeight;
        aspectRatioCSS = `${screenWidth} / ${screenHeight}`;
        console.log(aspectRatioCSS);

        animateLaptop();
    });

    export let context: InitialState;

    $: context && videoElement && setSrcElement();

    const setSrcElement = function () {
        match(context.screenStream)
            .with({ ok: true, val: P.select() }, (src: MediaStream) => {
                videoElement.srcObject = src;
            })
            .otherwise(() => null);
    };
</script>

<main class="max-w-screen-sm space-y-6">
    <div class="intro">
        <h1 class="mb-2 text-2xl">Record your screen</h1>
        <p class="text-sm text-primary-400">
            Record your screen (or window) together with a webcam window &
            easily save the outcome as a video file to share with others.
        </p>
    </div>
    <div
        class="laptop relative flex grow justify-center"
        bind:this={laptopElement}
    >
        <div class="display" bind:this={screenElement}>
            <div class="webcam" />
            <div class="screen" style="aspect-ratio: {aspectRatioCSS};">
                {#if context.screenStream}
                    <!-- svelte-ignore a11y-media-has-caption -->
                    <video bind:this={videoElement} autoplay />
                {:else}
                    <div class="flex w-full items-center justify-center">
                        <Button on:click={onPreviewClick}>Preview Screen</Button
                        >
                    </div>
                {/if}
            </div>
        </div>
        <div class="keyboard" style="aspect-ratio: {aspectRatioCSS};"></div>
    </div>
    <div
        class="flex flex-col gap-3 divide-y divide-border rounded-lg border border-primary-700 bg-primary-50 bg-opacity-5 p-3 backdrop-blur-md"
        bind:this={uiWrapperElement}
    >
        <div class="flex flex-col items-start space-y-3">
            <div class="flex space-x-3">
                <Select
                    id="microphones"
                    placeholder="Select a Microphone"
                    bind:value={context.devices.selectedAudioDeviceId}
                    on:change={onChangeSelectedAudioInputId}
                >
                    {#each context.devices.audioDevices as { label, deviceId }}
                        <option value={deviceId}
                            >{label || deviceId || "Default"}</option
                        >
                    {/each}
                </Select>
                <Select
                    id="cameras"
                    placeholder="Select a Camera"
                    bind:value={context.devices.selectedVideoDeviceId}
                    on:change={onChangeSelectedVideoInputId}
                >
                    {#each context.devices.videoDevices as { label, deviceId }}
                        <option value={deviceId}
                            >{label || deviceId || "Default"}</option
                        >
                    {/each}
                </Select>
                <Button color="blue">Start</Button>
            </div>
        </div>

        <!-- <div class="pt-3">
             <Checkbox checked>Picture in Picture</Checkbox>
             </div> -->
    </div>
</main>

<style lang="postcss">
    .intro {
        @apply mx-auto mb-6 flex flex-col;
        max-width: 420px;
    }

    .laptop {
        perspective: 500px;
    }

    .keyboard,
    .display {
        @apply rounded;
        max-width: 500px;
        width: 70vw;
        border: 1px solid var(--color-border);
        overflow: hidden;
    }
    .display {
        @apply relative flex flex-col items-center bg-white bg-opacity-5 p-3 pt-2;
        transform-origin: bottom center;
    }

    .screen {
        @apply flex w-full grow rounded-sm;
        border: 1px solid var(--color-border);
        position: relative;
        overflow: hidden;
        background-color: rgba(0, 0, 0, 0.1);

        video {
            @apply h-full rounded;
            position: absolute;
            left: 50%;
            translate: -50% 0%;
            width: auto;
            overflow: hidden;
        }
    }

    .webcam {
        @apply mb-2 aspect-square rounded-full bg-black bg-opacity-10;
        width: 3%;
        border: 1px solid var(--color-border);
    }

    .keyboard {
        @apply absolute bg-white bg-opacity-5;
        translate: 0% calc(100% + 40px);
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
