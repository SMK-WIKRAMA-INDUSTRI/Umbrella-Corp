/**
 * PT Umbrella Corp - Unified Smart Speech-to-Text (STT) Service
 * - Deteksi otomatis saat pengguna selesai berbicara (Voice Activity & Silence Detection)
 * - Real-time live transcription (kata-kata langsung muncul saat diucapkan)
 * - Didukung oleh Web Speech API (Native id-ID) & Deepgram Nova-2 (Indonesian Cloud Engine)
 */

const FALLBACK_DEEPGRAM_KEY = '60a13af1a04287bdd70caf432f6b6b76ccbcbbc5';

export interface SmartSTTOptions {
  onInterimResult?: (interimText: string) => void;
  onFinalResult: (finalText: string) => void;
  onStateChange: (state: 'listening' | 'transcribing' | 'idle', message?: string) => void;
  onError?: (errorMessage: string) => void;
}

export interface SmartSTTController {
  stop: () => void;
  isListening: () => boolean;
}

/**
 * Mendapatkan mimeType audio perekaman terbaik yang didukung browser.
 */
export function getSupportedAudioMimeType(): string {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return 'audio/webm';
  }

  const candidateTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/wav',
  ];

  for (const type of candidateTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'audio/webm';
}

/**
 * Mengirimkan rekaman audio Blob ke Backend Proxy (/api/stt) atau langsung ke Deepgram Nova-2.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (!audioBlob || audioBlob.size === 0) {
    return '';
  }

  // 1. Coba kirim via Secure Backend Proxy (/api/stt)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    // Normalisasi content type untuk Deepgram
    let mime = (audioBlob.type || 'audio/webm').split(';')[0];
    if (!mime || mime === 'application/octet-stream') mime = 'audio/webm';

    const response = await fetch('/api/stt', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': mime,
      },
      body: audioBlob,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.transcript === 'string') {
        return data.transcript.trim();
      }
    }
  } catch (proxyErr) {
    console.warn('Backend proxy /api/stt error, falling back to direct Deepgram:', proxyErr);
  }

  // 2. Direct Fallback ke Deepgram API jika backend proxy sedang offline
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let mime = (audioBlob.type || 'audio/webm').split(';')[0];
    if (!mime || mime === 'application/octet-stream') mime = 'audio/webm';

    const directResponse = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&language=id&smart_format=true&punctuate=true',
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Token ${FALLBACK_DEEPGRAM_KEY}`,
          'Content-Type': mime,
        },
        body: audioBlob,
      }
    );

    clearTimeout(timeoutId);

    if (directResponse.ok) {
      const dgData = await directResponse.json();
      const transcript =
        dgData.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      return transcript.trim();
    }
  } catch (fallbackErr) {
    console.warn('Direct Deepgram STT failed:', fallbackErr);
  }

  return '';
}

/**
 * Memulai Speech-to-Text Cerdas dengan Auto-Stop Silence Detection.
 * Begitu pengguna berhenti berbicara (jeda ~1.3 detik), perekaman otomatis selesai
 * dan teks langsung masuk ke input textarea.
 */
export async function startSmartSpeechRecognition(options: SmartSTTOptions): Promise<SmartSTTController> {
  let active = true;
  let recognitionInstance: any = null;
  let mediaStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let silenceTimeout: any = null;
  let hasUserSpoken = false;

  const cleanup = () => {
    active = false;
    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
      silenceTimeout = null;
    }
    if (recognitionInstance) {
      try {
        recognitionInstance.abort();
      } catch (_) {}
      recognitionInstance = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
      try {
        audioContext.close();
      } catch (_) {}
      audioContext = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }
  };

  // =========================================================================
  // METODE 1: Web Speech API (Natif Browser - Real-time & Auto Silence Stop)
  // Sangat responsif di Chrome, Edge, Safari, dan Android
  // =========================================================================
  const SpeechRecognitionClass =
    (typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
    null;

  if (SpeechRecognitionClass) {
    try {
      const rec = new SpeechRecognitionClass();
      recognitionInstance = rec;
      rec.lang = 'id-ID';
      rec.continuous = false; // Berhenti otomatis begitu jeda bicara selesai!
      rec.interimResults = true; // Kata-kata langsung muncul real-time saat bicara
      rec.maxAlternatives = 1;

      let finalAccumulatedText = '';

      rec.onstart = () => {
        if (!active) return;
        options.onStateChange('listening', 'Mendengarkan... (otomatis selesai saat Anda berhenti berbicara)');
      };

      rec.onresult = (event: any) => {
        if (!active) return;
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalAccumulatedText += item[0].transcript + ' ';
          } else {
            interim += item[0].transcript;
          }
        }

        const displayText = (finalAccumulatedText + interim).trim();
        if (displayText) {
          hasUserSpoken = true;
          if (options.onInterimResult) {
            options.onInterimResult(displayText);
          }
        }
      };

      rec.onspeechend = () => {
        // Terpicu otomatis saat browser mendeteksi hening setelah berbicara
        if (active) {
          options.onStateChange('transcribing', 'Selesai berbicara, memproses teks...');
        }
      };

      rec.onend = () => {
        const text = finalAccumulatedText.trim();
        cleanup();
        options.onStateChange('idle');
        if (text) {
          options.onFinalResult(text);
        } else if (!hasUserSpoken) {
          // Jika belum sempat bicara
          options.onStateChange('idle', 'Tidak ada suara yang terdeteksi.');
        }
      };

      rec.onerror = (event: any) => {
        console.warn('SpeechRecognition event error:', event.error);
        if (event.error === 'not-allowed') {
          cleanup();
          options.onStateChange('idle');
          if (options.onError) {
            options.onError('Izin mikrofon ditolak di browser Anda.');
          }
          return;
        }

        // Jika Web Speech API mengalami kendala (misal network no-speech), coba Deepgram VAD
        if (!hasUserSpoken) {
          cleanup();
          fallbackToDeepgramWithVAD();
        } else {
          cleanup();
          options.onStateChange('idle');
        }
      };

      rec.start();

      return {
        stop: () => {
          if (recognitionInstance) {
            try {
              recognitionInstance.stop();
            } catch (_) {}
          }
          cleanup();
          options.onStateChange('idle');
        },
        isListening: () => active,
      };
    } catch (e) {
      console.warn('Gagal menginisialisasi Web Speech API, fallback ke Deepgram VAD:', e);
    }
  }

  // =========================================================================
  // METODE 2: MediaRecorder + Deepgram Nova-2 dengan AudioContext Silence Detector
  // =========================================================================
  async function fallbackToDeepgramWithVAD(): Promise<SmartSTTController> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStream = stream;
      const audioChunks: Blob[] = [];
      const mimeType = getSupportedAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      // Voice Activity & Silence Detector dengan Web Audio API
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContext = new AudioCtx();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 512;
          source.connect(analyser);

          const buffer = new Uint8Array(analyser.frequencyBinCount);
          const SILENCE_THRESHOLD = 14; // Ambang batas volume suara
          const SILENCE_DURATION_MS = 1400; // Otomatis stop setelah jeda 1.4 detik

          const checkVolume = () => {
            if (!active || recorder.state === 'inactive') return;
            analyser.getByteFrequencyData(buffer);

            // Hitung rata-rata volume
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) {
              sum += buffer[i];
            }
            const average = sum / buffer.length;

            if (average > SILENCE_THRESHOLD) {
              hasUserSpoken = true;
              if (silenceTimeout) {
                clearTimeout(silenceTimeout);
                silenceTimeout = null;
              }
            } else if (hasUserSpoken) {
              // Pengguna sudah bicara dan sekarang hening -> pasang timer auto-stop
              if (!silenceTimeout) {
                silenceTimeout = setTimeout(() => {
                  if (active && recorder.state === 'recording') {
                    options.onStateChange('transcribing', 'Selesai berbicara, memproses teks...');
                    recorder.stop();
                  }
                }, SILENCE_DURATION_MS);
              }
            }

            requestAnimationFrame(checkVolume);
          };

          requestAnimationFrame(checkVolume);
        }
      } catch (vadErr) {
        console.warn('AudioContext VAD warning:', vadErr);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        cleanup();
        if (audioChunks.length === 0) {
          options.onStateChange('idle');
          return;
        }

        options.onStateChange('transcribing', 'Mentranskripsi suara (Deepgram Nova-2)...');

        try {
          const recordedBlob = new Blob(audioChunks, {
            type: recorder.mimeType || 'audio/webm',
          });

          const transcript = await transcribeAudio(recordedBlob);
          options.onStateChange('idle');
          if (transcript) {
            options.onFinalResult(transcript);
          } else {
            options.onStateChange('idle', 'Suara tidak terdeteksi, silakan coba lagi.');
          }
        } catch (err: any) {
          console.error('STT process error:', err);
          options.onStateChange('idle');
          if (options.onError) {
            options.onError('Gagal memproses suara. Pastikan mikrofon aktif.');
          }
        }
      };

      recorder.start(250);
      options.onStateChange('listening', 'Mendengarkan... (otomatis selesai saat Anda berhenti berbicara)');

      return {
        stop: () => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          cleanup();
        },
        isListening: () => active,
      };
    } catch (err: any) {
      cleanup();
      options.onStateChange('idle');
      if (options.onError) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          options.onError('Izin mikrofon ditolak di browser Anda.');
        } else {
          options.onError('Tidak dapat mengakses mikrofon.');
        }
      }
      return {
        stop: () => {},
        isListening: () => false,
      };
    }
  }

  // Jika SpeechRecognition tidak ada di browser, langsung gunakan MediaRecorder + Deepgram VAD
  return fallbackToDeepgramWithVAD();
}
