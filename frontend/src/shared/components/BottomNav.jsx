import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import camaraSvg from '../assets/icons/camara.svg?raw';
import homeSvg from '../assets/icons/home.svg?raw';
import perfilSvg from '../assets/icons/perfil.svg?raw';
import mapaSvg from '../assets/icons/mapa.svg?raw';
import busquedaSvg from '../assets/icons/busqueda.svg?raw';
import miAlbumIcon from '../assets/icons/BookSelected.png';
import { fileToDataUrl, savePendingAudio, savePendingScan } from '../lib/scanFlow';
import { useRecorder } from '../lib/useRecorder';
import { getDraftPublicationPath } from '../lib/publicationRoutes';

const ACCENT = '#96b232'; // Aproximado al verde oscuro de la imagen
const MUTED = '#7B7B7B';

const cleanSvgColors = (svg, color) => {
  if (!svg) return '';
  let cleaned = svg.replace(/fill="([^"]+)"/gi, (match, p1) => {
    if (p1.toLowerCase() === 'none' || p1.toLowerCase() === '#ffffff' || p1.toLowerCase() === 'white') return match;
    return `fill="${color}"`;
  });
  cleaned = cleaned.replace(/stroke="([^"]+)"/gi, (match, p1) => {
    if (p1.toLowerCase() === 'none') return match;
    return `stroke="${color}"`;
  });
  cleaned = cleaned.replace(/filter="url\(#.*?\)"/gi, '');
  return cleaned;
};

function NavItem({ active, svgRaw, iconSrc, label, onClick }) {
  const btnColorClass = active ? 'text-[#96b232]' : 'text-[#7B7B7B]';
  const activeBg = active ? 'bg-white ring-1 ring-white shadow-none' : '';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`appearance-none border-0 bg-transparent p-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 relative flex flex-col items-center justify-center pt-2 transition-all ${btnColorClass} hover:text-[#96b232] hover:scale-105 hover:bg-white/20 hover:rounded-lg active:scale-95 ${activeBg} ${
        active ? 'opacity-100' : 'opacity-85'
      }`}
    >
      <span
        className="flex h-[26px] w-[26px] shrink-0 items-center justify-center bg-transparent"
        aria-hidden
      />
      {iconSrc ? (
        <img
          src={iconSrc}
          alt=""
          className={`absolute top-2 h-[26px] w-[26px] object-contain transition-all duration-150 ${
            active ? 'filter-none opacity-100' : 'grayscale contrast-75 opacity-80'
          } hover:grayscale-0 hover:opacity-100 focus:outline-none`}
          aria-hidden
        />
      ) : null}
      {svgRaw ? (
        <span
          className="absolute top-2 flex h-[26px] w-[26px] items-center justify-center bg-transparent [&>svg]:h-full [&>svg]:w-full focus:outline-none"
          aria-hidden
          dangerouslySetInnerHTML={{ __html: cleanSvgColors(svgRaw, 'currentColor') }}
        />
      ) : null}
      <span
        className="mt-1 truncate text-center text-[11px] font-bold leading-none tracking-tight text-current"
      >
        {label}
      </span>
    </button>
  );
}

/** Barra inferior estilo mock "Parte abajo": blanca con hendidura central y FAB con gradiente. */
function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const path = location.pathname;
  const { isSupported: recorderSupported, isRecording, audioBlob, durationMs, startRecording, stopRecording } = useRecorder();
  const [audioMessage, setAudioMessage] = useState('');
  const [isSavingAudio, setIsSavingAudio] = useState(false);

  const isHome = path === '/' || path === '';
  const isMap = path.startsWith('/map');
  const isAlbum = path.startsWith('/album');
  const isProfile = path.startsWith('/profile');

  useEffect(() => {
    let cancelled = false;

    async function persistAudio() {
      if (!audioBlob) return;

      setIsSavingAudio(true);
      try {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('No se pudo preparar el audio grabado.'));
          reader.readAsDataURL(audioBlob);
        });

        if (cancelled) return;

        savePendingAudio({
          name: `audio-${Date.now()}.webm`,
          dataUrl,
          durationMs,
          createdAt: Date.now(),
        });
        setAudioMessage('Audio listo');
        // navigate to publication draft view so user can confirm and publish
        try {
          if (!path.startsWith('/publicacion-audio')) {
            // use a short delay to let UI update before navigation
            setTimeout(() => navigate(getDraftPublicationPath('audio')), 250);
          }
        } catch (e) {
          // ignore navigation errors
        }
      } catch (error) {
        if (!cancelled) {
          setAudioMessage(error?.message || 'No se pudo guardar el audio.');
        }
      } finally {
        if (!cancelled) {
          setIsSavingAudio(false);
        }
      }
    }

    persistAudio();

    return () => {
      cancelled = true;
    };
  }, [audioBlob, durationMs]);

  const toggleAudioRecording = async () => {
    setAudioMessage('');

    if (isRecording) {
      stopRecording();
      return;
    }

    const started = await startRecording();
    if (!started) {
      setAudioMessage('No se pudo abrir el micrófono.');
    }
  };

  const audioLabel = isRecording ? 'Grabando' : audioBlob ? 'Audio listo' : 'Audio';
  const audioDurationLabel = `${String(Math.floor(durationMs / 60000)).padStart(2, '0')}:${String(Math.floor((durationMs / 1000) % 60)).padStart(2, '0')}`;

  return (
    <div
      className="relative h-[var(--zoa-bottom-height)] w-[100vw] [margin-left:calc(50%-50vw)]"
    >
      <svg
        viewBox="0 0 405 78"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 block h-full w-full"
        aria-hidden="true"
      >
        <path d="M141.601 13.9629C150.416 22.7978 158.193 28.809 167.59 32.916C177.067 37.0578 188.12 39.2322 203.425 40.4971L203.49 40.502L203.556 40.499C217.209 39.8456 225.498 38.1983 234.207 34.1572C242.804 30.1683 251.805 23.8429 266.815 13.9727L404 1.09863V77H1V1.0957L141.601 13.9629Z" fill="white" stroke="#7B7B7B" strokeWidth="2" />
      </svg>

      <div className="absolute inset-x-0 bottom-0 flex h-[calc(var(--zoa-bottom-height)-16px)] w-full items-end px-2 pb-4">
        <div className="flex w-[40%] items-end justify-around pr-1">
          <NavItem active={isHome} svgRaw={homeSvg} label="Inicio" onClick={() => navigate('/')} />
          <NavItem active={isMap} svgRaw={busquedaSvg} label="Busqueda" onClick={() => navigate('/map')} />
        </div>
        <div className="w-[20%]" />
        <div className="flex w-[40%] items-end justify-around pl-1">
          <NavItem active={isAlbum} iconSrc={miAlbumIcon} label="Mi Album" onClick={() => navigate('/album')} />
          <NavItem active={isProfile} svgRaw={perfilSvg} label="Perfil" onClick={() => navigate('/profile')} />
        </div>
      </div>

      <div className="absolute bottom-[22px] left-1/2 z-30 -translate-x-1/2 rounded-full bg-white p-1">
        <div className="absolute left-1/2 top-[-66px] -translate-x-1/2 rounded-full bg-white p-1 shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
          <button
            type="button"
            onClick={toggleAudioRecording}
            disabled={!recorderSupported || isSavingAudio}
            aria-label={isRecording ? 'Detener grabación de audio' : 'Grabar audio'}
            className={`flex h-[56px] w-[56px] items-center justify-center rounded-full border-0 text-white shadow-[0_8px_16px_rgba(0,0,0,0.28)] outline-none transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${isRecording ? 'bg-rose-600' : 'bg-[#80902e]'}`}
          >
            {isSavingAudio ? (
              <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/70 border-t-transparent" />
            ) : isRecording ? (
              <span className="h-3.5 w-3.5 rounded-full bg-white" />
            ) : (
              <span className="text-2xl leading-none">🎙</span>
            )}
          </button>
        </div>
        {(isRecording || audioMessage) ? (
          <div className="absolute left-1/2 top-[-92px] -translate-x-1/2 rounded-full bg-black/85 px-3 py-1 text-[10px] font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
            {audioMessage || (isRecording ? `${audioLabel}` : `${audioLabel}${audioBlob ? ` · ${audioDurationLabel}` : ''}`)}
          </div>
        ) : null}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;

            try {
              const dataUrl = await fileToDataUrl(file);
              savePendingScan({ name: file.name, dataUrl });
              navigate(`/analysis?scan=${Date.now()}`);
            } catch (error) {
              console.error('Error al procesar la imagen:', error);
            } finally {
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-0 bg-[#96b232] shadow-[0_8px_16px_rgba(0,0,0,0.3)] outline-none transition-transform active:scale-95"
          aria-label="Abrir cámara o explorador"
        >
          <span
            className="flex h-9 w-9 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
            aria-hidden
            dangerouslySetInnerHTML={{ __html: cleanSvgColors(camaraSvg, '#ffffff') }}
          />
        </button>
      </div>
    </div>
  );
}

export default BottomNav;
