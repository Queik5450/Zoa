import { useState, useRef } from 'react';
import { Mic, Square, Play, Upload, Trash2 } from 'lucide-react';

export default function AudioRecorder({ onAudioChange }) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioName, setAudioName] = useState(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const fileInput = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioName('Grabación');
        onAudioChange && onAudioChange(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.current.start();
      setRecording(true);
    } catch {
      alert('No se pudo acceder al micrófono.');
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioURL(URL.createObjectURL(file));
      setAudioName(file.name);
      onAudioChange && onAudioChange(file);
    }
  };

  const remove = () => {
    setAudioURL(null);
    setAudioName(null);
    onAudioChange && onAudioChange(null);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
      <p className="text-xs font-medium text-gray-600 mb-2">Audio (opcional)</p>
      {audioURL ? (
        <div className="flex items-center gap-2">
          <audio src={audioURL} controls className="flex-1 h-8" />
          <button onClick={remove} className="text-red-400 hover:text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-guayana-600 text-white hover:bg-guayana-700'}`}
          >
            {recording ? <><Square size={14} /> Detener</> : <><Mic size={14} /> Grabar</>}
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <Upload size={14} /> Subir
          </button>
          <input ref={fileInput} type="file" accept="audio/*" className="hidden" onChange={handleFile} />
        </div>
      )}
    </div>
  );
}
