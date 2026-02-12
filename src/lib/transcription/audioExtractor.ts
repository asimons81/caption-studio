// Extract audio from video using Web Audio API
export async function extractAudioFromVideo(videoFile: File): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    video.src = URL.createObjectURL(videoFile);
    video.load();

    video.addEventListener('loadedmetadata', async () => {
      try {
        // Create media element source
        const source = audioContext.createMediaElementSource(video);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);

        // Use MediaRecorder to capture audio
        const mediaRecorder = new MediaRecorder(destination.stream);
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          try {
            // Combine chunks and decode
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Get mono channel data
            const channelData = audioBuffer.getChannelData(0);

            // Resample to 16kHz if needed (Whisper expects 16kHz)
            const targetSampleRate = 16000;
            const resampledData = resampleAudio(
              channelData,
              audioBuffer.sampleRate,
              targetSampleRate
            );

            URL.revokeObjectURL(video.src);
            resolve(resampledData);
          } catch (error) {
            URL.revokeObjectURL(video.src);
            reject(error);
          }
        };

        // Start recording and play video
        mediaRecorder.start();
        video.play();

        // Stop when video ends
        video.addEventListener('ended', () => {
          mediaRecorder.stop();
          video.pause();
        });
      } catch (error) {
        URL.revokeObjectURL(video.src);
        reject(error);
      }
    });

    video.addEventListener('error', () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video for audio extraction'));
    });
  });
}

// Simple linear resampling
function resampleAudio(
  audioData: Float32Array,
  originalSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (originalSampleRate === targetSampleRate) {
    return audioData;
  }

  const ratio = originalSampleRate / targetSampleRate;
  const newLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
    const fraction = srcIndex - srcIndexFloor;

    // Linear interpolation
    result[i] =
      audioData[srcIndexFloor] * (1 - fraction) + audioData[srcIndexCeil] * fraction;
  }

  return result;
}
