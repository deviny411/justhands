import React, { useRef, useEffect, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import Webcam from 'react-webcam';

export default function HandTracking() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [gesture, setGesture] = useState('No hands detected');
  const handsRef = useRef(null);
  const requestRef = useRef(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    isActiveRef.current = true;

    if (!webcamRef.current || !canvasRef.current) return;

    const hands = new Hands({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    handsRef.current = hands;

    hands.onResults(onResults);

    async function onFrame() {
      if (!isActiveRef.current) return;

      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4 &&
        handsRef.current
      ) {
        try {
          await handsRef.current.send({ image: webcamRef.current.video });
        } catch (error) {
          console.log('Hand tracking stopped');
          return;
        }
      }
      
      if (isActiveRef.current) {
        requestRef.current = requestAnimationFrame(onFrame);
      }
    }

    function onResults(results) {
      if (!canvasRef.current || !isActiveRef.current) return;
      
      const canvasCtx = canvasRef.current.getContext('2d');
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, width, height);
      canvasCtx.drawImage(results.image, 0, 0, width, height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const numHands = results.multiHandLandmarks.length;
        setGesture(`${numHands} hand${numHands > 1 ? 's' : ''} detected`);

        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const landmarks = results.multiHandLandmarks[i];
          
          // Use different colors for left and right hands
          const handedness = results.multiHandedness[i].label;
          const strokeColor = handedness === 'Left' ? '#00FF00' : '#00FFFF';
          const landmarkColor = handedness === 'Left' ? '#FF0000' : '#FF00FF';

          // Draw connections
          const connections = [
            [0,1],[1,2],[2,3],[3,4],
            [0,5],[5,6],[6,7],[7,8],
            [0,9],[9,10],[10,11],[11,12],
            [0,13],[13,14],[14,15],[15,16],
            [0,17],[17,18],[18,19],[19,20],
            [5,9],[9,13],[13,17]
          ];

          canvasCtx.strokeStyle = strokeColor;
          canvasCtx.lineWidth = 3;
          connections.forEach(([start, end]) => {
            canvasCtx.beginPath();
            canvasCtx.moveTo(landmarks[start].x * width, landmarks[start].y * height);
            canvasCtx.lineTo(landmarks[end].x * width, landmarks[end].y * height);
            canvasCtx.stroke();
          });

          landmarks.forEach(landmark => {
            canvasCtx.fillStyle = landmarkColor;
            canvasCtx.beginPath();
            canvasCtx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
            canvasCtx.fill();
          });

          // Add label for which hand
          canvasCtx.fillStyle = strokeColor;
          canvasCtx.font = '20px Arial';
          canvasCtx.fillText(
            handedness,
            landmarks[0].x * width + 10,
            landmarks[0].y * height - 10
          );
        }
      } else {
        setGesture('No hands detected');
      }
      canvasCtx.restore();
    }

    onFrame();

    return () => {
      // Stop all activity immediately
      isActiveRef.current = false;
      
      // Cancel animation frame
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      
      // Close hands instance
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>justhands - Gesture Tracker</h2>
      <div style={{ position: 'relative', width: 640, height: 480, margin: '0 auto' }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={640}
          height={480}
          style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, visibility: 'hidden' }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, border: '2px solid #333' }}
        />
      </div>
      <p style={{ marginTop: 20, fontSize: 18 }}>Status: {gesture}</p>
      <p style={{ fontSize: 14, color: '#666' }}>
        Left hand: Green/Red | Right hand: Cyan/Magenta
      </p>
    </div>
  );
}
