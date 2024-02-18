<script lang="ts">
  import { onMount } from 'svelte';

  let isRecording = false;
  let screenStream;
  let screenRecorder;
  let screenVideoUrl;

  async function startRecording() {
    isRecording = true;

    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    screenRecorder = new MediaRecorder(screenStream, { mimeType: 'video/webm' });

    const screenChunks = [];
    screenRecorder.ondataavailable = e => screenChunks.push(e.data);
    screenRecorder.onstop = () => {
      const blob = new Blob(screenChunks, { type: 'video/mp4' });
      screenVideoUrl = URL.createObjectURL(blob);
    };
    screenRecorder.start();

    const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoElement = document.getElementById('webcamPreview');
    videoElement.srcObject = webcamStream;
    videoElement.addEventListener('loadedmetadata', () => {
      videoElement.play().then(() => {
        videoElement.requestPictureInPicture();
      });
    });
  }

  function stopRecording() {
    screenRecorder.stop();
    screenStream.getTracks().forEach(track => track.stop());
    isRecording = false;
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }
</script>

<!-- App.svelte (Template) -->
<button on:click={toggleRecording}>
  {#if isRecording}
    <span class="recording-indicator"></span>
    Stop Recording
  {:else}
    Start Recording
  {/if}
</button>

{#if isRecording}
  <video id="webcamPreview" width="320" autoplay muted></video>
{/if}

{#if screenVideoUrl}
  <div>
    <h2>Screen Recording</h2>
    <video src={screenVideoUrl} controls width="320"></video>
    <a href={screenVideoUrl} download="screen-recording.mp4">Download Screen Recording</a>
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
