import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

function buildAudioBlob(chunks) {
  if (!chunks.length) return null;
  const firstChunkType = chunks.find((chunk) => chunk?.type)?.type || 'audio/webm';
  return new Blob(chunks, { type: firstChunkType });
}

export function useRecorder() {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [durationMs, setDurationMs] = useState(0);
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setIsSupported(Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder));
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const cleanupUrl = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
    }
  }, [audioUrl]);

  const resetRecordingState = useCallback(() => {
    clearTimer();
    releaseStream();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = 0;
    setIsRecording(false);
    setDurationMs(0);
  }, [clearTimer, releaseStream]);

  const clearRecording = useCallback(() => {
    resetRecordingState();
    setAudioBlob(null);
    cleanupUrl();
    setError('');
  }, [cleanupUrl, resetRecordingState]);

  const startRecording = useCallback(async () => {
    setError('');

    if (!isSupported) {
      setError('Tu navegador no soporta grabación de audio.');
      return false;
    }

    try {
      cleanupUrl();
      setAudioBlob(null);
      setDurationMs(0);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia(DEFAULT_CONSTRAINTS);
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        clearTimer();
        const elapsedMs = Math.max(0, Date.now() - startedAtRef.current);
        const blob = buildAudioBlob(chunksRef.current);
        resetRecordingState();

        if (!blob) {
          setError('No se pudo construir el audio grabado.');
          return;
        }

        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setDurationMs(elapsedMs);
      };

      recorder.onerror = () => {
        setError('Hubo un problema al grabar el audio.');
        clearRecording();
      };

      recorder.start();
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setDurationMs(Date.now() - startedAtRef.current);
      }, 250);
      return true;
    } catch (err) {
      clearTimer();
      releaseStream();
      mediaRecorderRef.current = null;
      const message = err?.name === 'NotAllowedError'
        ? 'Necesitamos permiso para usar el micrófono.'
        : err?.message || 'No se pudo iniciar la grabación.';
      setError(message);
      setIsRecording(false);
      return false;
    }
  }, [clearRecording, clearTimer, cleanupUrl, isSupported, releaseStream, resetRecordingState]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      setIsRecording(false);
      releaseStream();
      clearTimer();
      return;
    }

    try {
      mediaRecorderRef.current.stop();
    } finally {
      releaseStream();
      setIsRecording(false);
      clearTimer();
    }
  }, [clearTimer, releaseStream]);

  useEffect(() => () => {
    clearTimer();
    releaseStream();
    cleanupUrl();
  }, [clearTimer, cleanupUrl, releaseStream]);

  return {
    isSupported,
    isRecording,
    error,
    audioBlob,
    audioUrl,
    durationMs,
    startRecording,
    stopRecording,
    clearRecording,
  };
}
