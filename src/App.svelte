<script lang="ts">
  import { onMount } from 'svelte';

  let isRecording = false;
  let screenStream, webcamStream;
  let screenRecorder, webcamRecorder;
  let screenVideoUrl, webcamVideoUrl;

  async function startRecording() {
    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    screenRecorder = new MediaRecorder(screenStream, { mimeType: 'video/webm' });
    webcamRecorder = new MediaRecorder(webcamStream, { mimeType: 'video/webm' });

    const screenChunks = [];
    const webcamChunks = [];

    screenRecorder.ondataavailable = e => screenChunks.push(e.data);
    webcamRecorder.ondataavailable = e => webcamChunks.push(e.data);

    screenRecorder.onstop = () => {
      const blob = new Blob(screenChunks, { type: 'video/mp4' });
      screenVideoUrl = URL.createObjectURL(blob);
    };

    webcamRecorder.onstop = () => {
      const blob = new Blob(webcamChunks, { type: 'video/mp4' });
      webcamVideoUrl = URL.createObjectURL(blob);
    };

    screenRecorder.start();
    webcamRecorder.start();
  }

  function stopRecording() {
    screenRecorder.stop();
    webcamRecorder.stop();
    screenStream.getTracks().forEach(track => track.stop());
    webcamStream.getTracks().forEach(track => track.stop());
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    isRecording = !isRecording;
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

{#if screenVideoUrl}
  <div>
    <h2>Screen Recording</h2>
    <video src={screenVideoUrl} controls width="320"></video>
    <a href={screenVideoUrl} download="screen-recording.mp4">Download Screen Recording</a>
  </div>
{/if}

{#if webcamVideoUrl}
  <div>
    <h2>Webcam Recording</h2>
    <video src={webcamVideoUrl} controls width="320"></video>
    <a href={webcamVideoUrl} download="webcam-recording.mp4">Download Webcam Recording</a>
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
