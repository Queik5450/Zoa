import React, { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { isSpeechSynthesisAvailable, speakText, stopSpeech } from '../lib/tts';

function SpeechButton({ text, className = '', label = 'Escuchar', stopLabel = 'Detener', lang = 'es-VE' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => () => stopSpeech(), []);

  const handleClick = async (event) => {
    event.stopPropagation();

    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const content = String(text || '').trim();
    if (!content) {
      setErrorMessage('No hay texto disponible para leer.');
      return;
    }

    if (!isSpeechSynthesisAvailable()) {
      setErrorMessage('Tu navegador no soporta lectura por voz.');
      return;
    }

    setErrorMessage('');
    const result = await speakText(content, { lang });
    if (!result.started) {
      setErrorMessage('No se pudo iniciar la lectura por voz.');
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isSpeaking}
        aria-label={isSpeaking ? 'Detener lectura' : 'Escuchar en voz alta'}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95 ${className}`}
      >
        <Volume2 size={17} className={isSpeaking ? 'animate-pulse' : ''} />
        <span>{isSpeaking ? stopLabel : label}</span>
      </button>
      {errorMessage ? <p className="max-w-[220px] text-right text-xs font-medium text-rose-600">{errorMessage}</p> : null}
    </div>
  );
}

export default SpeechButton;
