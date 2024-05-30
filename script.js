let mediaRecorder;
let audioChunks = [];

document.getElementById('recordButton').addEventListener('click', async () => {
  console.log("Record button clicked");
  let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  mediaRecorder.ondataavailable = (event) => {
    console.log("Data available");
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    console.log("Recording stopped");
    let audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    let audioUrl = URL.createObjectURL(audioBlob);
    document.getElementById('audioPlayback').src = audioUrl;

    let formData = new FormData();
    formData.append('audio', audioBlob);

    console.log("Sending audio to server");

    document.getElementById('loadingMessage').style.display = 'block';  // Show "please wait" message

    try {
      let response = await fetch('https://flask-backend-csy4.onrender.com/process_audio', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      let result = await response.json();
      document.getElementById('result').innerText = `Language: ${result.language}\nTranscription: ${result.text}`;
    } catch (error) {
      console.error("Error processing audio", error);
      document.getElementById('result').innerText = `Error: ${error.message}`;
    } finally {
      document.getElementById('loadingMessage').style.display = 'none';  // Hide "please wait" message
    }
  };

  document.getElementById('stopButton').disabled = false;
  document.getElementById('recordButton').disabled = true;
});

document.getElementById('stopButton').addEventListener('click', () => {
  console.log("Stop button clicked");
  mediaRecorder.stop();
  document.getElementById('stopButton').disabled = true;
  document.getElementById('recordButton').disabled = false;
});