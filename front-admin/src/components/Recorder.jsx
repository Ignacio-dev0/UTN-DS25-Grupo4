import { useRef, useEffect, useState } from "react";

function Recorder() {
  const canvasRef = useRef(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    let audioContext, analyser, source, animationId;

    if (recording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContext = new AudioContext();
        source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);
        const ctx = canvasRef.current.getContext("2d");

        const draw = () => {
          animationId = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          const barWidth = (canvasRef.current.width / bufferLength) * 2.5;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i];
            ctx.fillStyle = `rgb(${barHeight + 100},50,200)`;
            ctx.fillRect(x, canvasRef.current.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
        };

        draw();
      });
    }

    return () => {
      cancelAnimationFrame(animationId);
      if (source) source.disconnect();
      if (audioContext) audioContext.close();
    };
  }, [recording]);

  return (
    <div>
      <button onClick={() => setRecording(!recording)}>
        {recording ? "Detener" : "Grabar"}
      </button>
      <canvas ref={canvasRef} width="600" height="300"></canvas>
    </div>
  );
}

export default Recorder;

