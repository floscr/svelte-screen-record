<script lang="ts">
  import { onMount } from 'svelte';

  let screenStream, webcamStream;
  let screenRecorder, webcamRecorder;

  let screenVideoUrl, webcamVideoUrl;

  onMount(() => {
    // Webcam stream with audio is set up in startRecording to ensure microphone access
  });

  async function startRecording() {
    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // Combine the screen stream with the audio from the webcamStream
    const tracks = [...screenStream.getVideoTracks(), ...webcamStream.getAudioTracks()];
    const combinedStream = new MediaStream(tracks);

    screenRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
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
    // Stop all tracks from both streams
    screenStream.getTracks().forEach(track => track.stop());
    webcamStream.getTracks().forEach(track => track.stop());
  }

</script>

<main>

<button on:click={startRecording}>Start Recording</button>
<button on:click={stopRecording}>Stop Recording</button>

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

</main>

<style>





  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
