<script lang="ts">
  import { Select } from "flowbite-svelte";

  import { onMount } from "svelte";

  let isRecording = false;
  let availableMicrophones = [];
  let selectedMicrophoneId = "";
  let screenStream;
  let screenRecorder;
  let webcamStream;
  let screenVideoUrl;
  let socket;

  onMount(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    availableMicrophones = devices
      .filter((device) => device.kind === "audioinput")
      .map((device) => ({
        inputDeviceInfo: device,
        value: device.deviceId,
        name: device.label || "Microphone " + device.deviceId,
      }));

    if (availableMicrophones.length > 0) {
      selectedMicrophoneId = availableMicrophones[0].value;
    }
  });

  async function startRecording() {
    socket = new WebSocket("ws://localhost:8080");

    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
    const audioConstraints = {
      audio: {
        deviceId: selectedMicrophoneId
          ? { exact: selectedMicrophoneId }
          : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };
    const audioStream =
      await navigator.mediaDevices.getUserMedia(audioConstraints);
    webcamStream = new MediaStream([...audioStream.getTracks()]);
    const combinedStream = new MediaStream(
      [...screenStream.getVideoTracks(), ...webcamStream.getAudioTracks()],
      {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 4 * 1024 * 1024,
      },
    );

    screenRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm",
    });

    const screenChunks = [];
    screenRecorder.ondataavailable = (event) => {
      screenChunks.push(event.data);
      if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };
    screenRecorder.onstop = () => {
      socket.close();
      const blob = new Blob(screenChunks, { type: "video/webm" });
      screenVideoUrl = URL.createObjectURL(blob);
    };
    screenRecorder.start(1000);

    // Now add the webcam stream for PiP without recording it
    const webcamConstraints = { video: true };
    navigator.mediaDevices
      .getUserMedia(webcamConstraints)
      .then((stream) => {
        webcamStream = stream;
        const videoElement = document.createElement("video");
        videoElement.srcObject = webcamStream;
        videoElement
          .play()
          .then(() => {
            videoElement.requestPictureInPicture().catch((e) => {
              // Handle any errors that occur during requestPictureInPicture()
              console.error(e);
            });
          })
          .catch((e) => {
            // Handle errors that occur during play()
            console.error(e);
          });
      })
      .catch((error) => {
        console.error("Error accessing the webcam:", error);
      });

    isRecording = true;
  }

  async function stopRecording() {
    screenRecorder.stop();
    screenStream.getTracks().forEach((track) => track.stop());
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
    }
    isRecording = false;

    // Exit Picture-in-Picture mode if active
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch (error) {
        console.error("Error exiting Picture-in-Picture:", error);
      }
    }
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }
</script>

<Select
  id="microphones"
  class="mt-2"
  bind:value={selectedMicrophoneId}
  placeholder=""
>
  {#each availableMicrophones as { value, name }}
    <option {value}>{name}</option>
  {/each}
</Select>

<button on:click={toggleRecording}>
  {#if isRecording}
    <span class="recording-indicator"></span>
    Stop Recording
  {:else}
    Start Recording
  {/if}
</button>

{#if screenVideoUrl}
  <div>
    <h2>Screen Recording</h2>
    <!-- svelte-ignore a11y-media-has-caption -->
    <video src={screenVideoUrl} controls width="320"></video>
    <a href={screenVideoUrl} download="screen-recording.webm"
      >Download Screen Recording</a
    >
  </div>
{/if}

<style>
  .recording-indicator {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: green;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      opacity: 1;
    }
    70% {
      transform: scale(1.05);
      opacity: 0.7;
    }
    100% {
      transform: scale(0.95);
      opacity: 1;
    }
  }
</style>
