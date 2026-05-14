const DEFAULT_LANG = 'es-VE';

function getSpeechSynthesis() {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis || null;
}

function pickVoice(voices, lang) {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  const normalizedLang = (lang || DEFAULT_LANG).toLowerCase();
  const exactMatch = voices.find((voice) => (voice.lang || '').toLowerCase() === normalizedLang);
  if (exactMatch) return exactMatch;

  const prefix = normalizedLang.split('-')[0];
  const prefixMatch = voices.find((voice) => (voice.lang || '').toLowerCase().startsWith(prefix));
  if (prefixMatch) return prefixMatch;

  return voices.find((voice) => /spanish|español/i.test(voice.name || '')) || voices[0] || null;
}

function waitForVoices(speechSynthesis, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const timer = window.setTimeout(() => finish(speechSynthesis.getVoices()), timeoutMs);
    const previousHandler = speechSynthesis.onvoiceschanged;

    speechSynthesis.onvoiceschanged = () => {
      window.clearTimeout(timer);
      if (typeof previousHandler === 'function') {
        previousHandler.call(speechSynthesis);
      }
      finish(speechSynthesis.getVoices());
      speechSynthesis.onvoiceschanged = previousHandler || null;
    };
  });
}

export function isSpeechSynthesisAvailable() {
  return Boolean(getSpeechSynthesis());
}

export function stopSpeech() {
  const speechSynthesis = getSpeechSynthesis();
  if (!speechSynthesis) return;
  speechSynthesis.cancel();
}

export async function speakText(text, options = {}) {
  const speechSynthesis = getSpeechSynthesis();
  const content = String(text || '').trim();

  if (!speechSynthesis || !content) {
    return { started: false, reason: 'speech-synthesis-unavailable' };
  }

  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = options.lang || DEFAULT_LANG;
  utterance.rate = typeof options.rate === 'number' ? options.rate : 1;
  utterance.pitch = typeof options.pitch === 'number' ? options.pitch : 1;
  utterance.volume = typeof options.volume === 'number' ? options.volume : 1;

  const voices = await waitForVoices(speechSynthesis, options.voiceTimeoutMs ?? 1000);
  const voice = pickVoice(voices, utterance.lang);
  if (voice) {
    utterance.voice = voice;
  }

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);

  return { started: true };
}
