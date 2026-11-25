/**
 * PT Umbrella Corp - Unified Smart Speech-to-Text (STT) Service
 * - Deteksi otomatis saat pengguna selesai berbicara (Voice Activity & Silence Detection)
 * - Real-time live transcription (kata-kata langsung muncul saat diucapkan)
 * - Didukung oleh Web Speech API (Native id-ID) & Deepgram Nova-2 (Indonesian Cloud Engine)
 */

export interface SmartSTTOptions {
  forceDeepgram?: boolean;
  onInterimResult?: (interimText: string) => void;
  onFinalResult: (finalText: string) => void;
  onStateChange: (state: 'listening' | 'transcribing' | 'idle', message?: string) => void;
  onError?: (errorMessage: string) => void;
}

export interface SmartSTTController {
  stop: () => void;
  cancel: () => void;
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
 * Mengirimkan rekaman audio ke Backend Proxy agar API key Deepgram tetap di server.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('Rekaman audio kosong.');
  }

  let mime = (audioBlob.type || 'audio/webm').split(';')[0];
  if (!mime || mime === 'application/octet-stream') mime = 'audio/webm';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  let response: Response;

  try {
    response = await fetch('/api/stt', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': mime,
      },
      body: audioBlob,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Permintaan transkripsi Deepgram melewati batas waktu.');
    }
    throw new Error('Tidak dapat menghubungi backend transkripsi Deepgram.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.message || `Layanan transkripsi gagal (HTTP ${response.status}).`,
    );
  }

  const data = await response.json();
  if (!data || typeof data.transcript !== 'string') {
    throw new Error('Backend transkripsi tidak mengembalikan teks.');
  }
  return data.transcript.trim();
}

/**
 * Mengubah teks jawaban AI menjadi stream audio suara melalui Deepgram TTS (/api/tts).
 */
export async function synthesizeSpeechResponse(text: string): Promise<Response> {
  const cleaned = text.trim();
  if (!cleaned) {
    throw new Error('Teks suara kosong.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: cleaned }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || `Layanan suara Deepgram gagal (HTTP ${response.status}).`);
    }

    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Permintaan suara Deepgram melewati batas waktu.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Mengubah teks jawaban AI menjadi audio Blob melalui Deepgram TTS (/api/tts).
 */
export async function synthesizeSpeech(text: string): Promise<Blob> {
  const response = await synthesizeSpeechResponse(text);
  return await response.blob();
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

  if (SpeechRecognitionClass && !options.forceDeepgram) {
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
        cancel: () => {
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

          const buffer = new Uint8Array(analyser.fftSize);
          // Gunakan RMS time-domain dengan jeda 550ms agar respons terasa instan (~1 detik setelah selesai bicara)
          const SILENCE_THRESHOLD = 4.5;
          const SILENCE_DURATION_MS = 550;

          const checkVolume = () => {
            if (!active || recorder.state === 'inactive') return;
            analyser.getByteTimeDomainData(buffer);

            let sumSquares = 0;
            for (let i = 0; i < buffer.length; i++) {
              const centered = buffer[i] - 128;
              sumSquares += centered * centered;
            }
            const rms = Math.sqrt(sumSquares / buffer.length);

            if (rms > SILENCE_THRESHOLD) {
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

      let aborted = false;

      recorder.onstop = async () => {
        cleanup();
        if (aborted || audioChunks.length === 0) {
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
          if (aborted) return;
          if (transcript) {
            options.onFinalResult(transcript);
          } else {
            options.onStateChange('idle', 'Suara tidak terdeteksi, silakan coba lagi.');
          }
        } catch (err: any) {
          if (aborted) return;
          console.error('STT process error:', err);
          options.onStateChange('idle');
          if (options.onError) {
            options.onError(err?.message || 'Gagal memproses suara.');
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
        cancel: () => {
          aborted = true;
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          cleanup();
          options.onStateChange('idle');
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
        cancel: () => {},
        isListening: () => false,
      };
    }
  }

  // Jika SpeechRecognition tidak ada di browser, langsung gunakan MediaRecorder + Deepgram VAD
  return fallbackToDeepgramWithVAD();
}

/**
 * Detektor interupsi (Barge-In) saat AI sedang berbicara.
 * Menggunakan echoCancellation browser + ambang RMS lebih tinggi & durasi minimal ~100ms
 * agar gema speaker AI tidak memicu interupsi palsu.
 */
export async function startBargeInDetector(
  onBargeIn: () => void,
): Promise<{ stop: () => void }> {
  let active = true;
  let stream: MediaStream | null = null;
  let audioCtx: AudioContext | null = null;
  let rafId: number | null = null;

  const stop = () => {
    if (!active) return;
    active = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (audioCtx && audioCtx.state !== 'closed') {
      try {
        audioCtx.close();
      } catch (_) {}
      audioCtx = null;
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    if (!active) {
      stop();
      return { stop };
    }

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      stop();
      return { stop };
    }

    audioCtx = new AudioCtx();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const buffer = new Uint8Array(analyser.fftSize);
    const BARGE_IN_RMS_THRESHOLD = 13;
    const REQUIRED_CONSECUTIVE_FRAMES = 6;
    let consecutiveHits = 0;

    const check = () => {
      if (!active) return;
      analyser.getByteTimeDomainData(buffer);

      let sumSquares = 0;
      for (let i = 0; i < buffer.length; i++) {
        const centered = buffer[i] - 128;
        sumSquares += centered * centered;
      }
      const rms = Math.sqrt(sumSquares / buffer.length);

      if (rms > BARGE_IN_RMS_THRESHOLD) {
        consecutiveHits++;
        if (consecutiveHits >= REQUIRED_CONSECUTIVE_FRAMES) {
          stop();
          onBargeIn();
          return;
        }
      } else {
        consecutiveHits = 0;
      }

      rafId = requestAnimationFrame(check);
    };

    // Beri jeda 250ms sebelum aktif agar bunyi klik/awal audio tidak memicu barge-in
    setTimeout(() => {
      if (active) {
        rafId = requestAnimationFrame(check);
      }
    }, 250);
  } catch {
    stop();
  }

  return { stop };
}
