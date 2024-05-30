let mediaRecorder;
let audioChunks = [];

document.getElementById('recordButton').addEventListener('click', async () => {
  let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    let audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    let audioUrl = URL.createObjectURL(audioBlob);
    document.getElementById('audioPlayback').src = audioUrl;

    let formData = new FormData();
    formData.append('audio', audioBlob);

    let response = await fetch('https://YOUR_RENDER_APP_URL.onrender.com/process_audio', {
      method: 'POST',
      body: formData
    });

    let result = await response.json();
    document.getElementById('result').innerText = `Language: ${result.language}\nTranscription: ${result.text}`;
  };

  document.getElementById('stopButton').disabled = false;
  document.getElementById('recordButton').disabled = true;
});

document.getElementById('stopButton').addEventListener('click', () => {
  mediaRecorder.stop();
  document.getElementById('stopButton').disabled = true;
  document.getElementById('recordButton').disabled = false;
});