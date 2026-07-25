/**
 * Web Speech API TTS & Web Audio API Synth Sound Effects
 */

// Sound effect types allowed in Audio Contract
export type SoundEffectType = 'success' | 'click' | 'reward' | 'timer_alarm';

// Singleton WebAudio Context
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // AudioContext state resume fallback
    });
  }
  return audioCtx;
}

/**
 * Play synthesized sound effects using Web Audio API
 */
export function playSound(type: SoundEffectType): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'click': {
        // Short soft pop sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'success': {
        // Uplifting ascending major arpeggio (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.08;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.25);
        });
        break;
      }

      case 'reward': {
        // Sparkling chime / fan-fare for rewards & stickers
        const notes = [659.25, 783.99, 987.77, 1046.5, 1318.51]; // E5, G5, B5, C6, E6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.07;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.4);
        });
        break;
      }

      case 'timer_alarm': {
        // Friendly 3-stage alarm chime
        const alarmFreqs = [523.25, 659.25, 783.99, 1046.5];
        [0, 0.3, 0.6].forEach((timeOffset) => {
          alarmFreqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = now + timeOffset + idx * 0.05;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.2);
          });
        });
        break;
      }
    }
  } catch (err) {
    console.warn('[audio] Web Audio synth playback error:', err);
  }
}

/**
 * Check if Web Speech API TTS is supported in current browser
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Cancel any active speech output
 */
export function cancelSpeech(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (err) {
      console.warn('[speech] Cancel error:', err);
    }
  }
}

/**
 * Speak text using Web Speech API TTS (speechSynthesis)
 * @param text Text string to speak
 * @param lang Language code e.g. 'en-US' (default) or 'ko-KR'
 */
export function speakText(text: string, lang: string = 'en-US'): void {
  if (!isSpeechSupported()) {
    console.warn('[speech] SpeechSynthesis is not supported in this browser.');
    return;
  }

  try {
    // Cancel prior speech utterances
    cancelSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85; // Slightly slower speed ideal for 1st grade elementary kids
    utterance.pitch = 1.1; // Gentle, clear, child-friendly pitch

    // Attempt to pick an optimal voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith(lang.split('-')[0]) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Yuna'))
      ) || voices.find((v) => v.lang.startsWith(lang.split('-')[0]));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('[speech] Failed to speak text:', err);
  }
}

/**
 * Specialized helper to pronounce Phonics letters and words
 */
export function playPhonics(letter: string, word: string): void {
  playSound('click');
  speakText(`${letter}. ${word}.`, 'en-US');
}

/**
 * Check if Web Speech STT SpeechRecognition is supported
 */
export function isSTTSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export interface STTResult {
  transcript: string;
  confidence: number;
}

/**
 * Listen for user's voice and evaluate speech using Web Speech API STT
 */
export function listenAndRecognize(
  lang: string = 'en-US',
  onResult: (result: STTResult) => void,
  onError: (errorMsg: string) => void
): () => void {
  if (!isSTTSupported()) {
    onError('이 브라우저는 음성 인식을 지원하지 않아요.');
    return () => {};
  }

  try {
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence || 0.9;
        onResult({ transcript, confidence });
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[stt] Speech recognition error:', event.error);
      onError(`음성을 들을 수 없었어요 (${event.error})`);
    };

    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore stop errors
      }
    };
  } catch (err) {
    console.error('[stt] Failed to initialize speech recognition:', err);
    onError('음성 인식을 시작하지 못했어요.');
    return () => {};
  }
}

