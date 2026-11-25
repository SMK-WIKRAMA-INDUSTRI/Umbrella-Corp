import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  PhoneCall,
  ShieldAlert,
  ChevronRight,
  Bed,
  Stethoscope,
  FileText,
  Ambulance,
  RotateCcw,
  Volume2,
  VolumeX,
  Phone,
  HeartPulse,
  ShieldCheck,
  Send,
  X,
  Activity,
  User,
  ZoomIn,
  ZoomOut,
  Info,
  Mic,
  PhoneOff,
  Loader2,
} from 'lucide-react';
import { UmbrellaLogo } from './UmbrellaLogo';
import { stripMarkdown } from '../services/chatEngine';
import {
  startSmartSpeechRecognition,
  startBargeInDetector,
  synthesizeSpeech,
  synthesizeSpeechResponse,
  SmartSTTController,
} from '../services/speechService';
import {
  callGeminiLive,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_HOSPITAL_CONTEXT,
} from '../services/geminiService';

export interface ChatItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface ChatPlaygroundProps {
  messages: ChatItem[];
  isLoading: boolean;
  onSendMessage: (query: string) => Promise<string>;
  onClearChat: () => void;
}

interface QuickMenuCard {
  badge: string;
  title: string;
  subtitle: string;
  query: string;
  category: 'bed' | 'doctor' | 'insurance' | 'lab';
}

const getQuickMenuCards = (userText: string, aiText: string): QuickMenuCard[] => {
  const combined = `${userText} ${aiText}`.toLowerCase();

  if (/\b(kamar|rawat inap|bed|ranjang|paviliun|vvip|vip|kelas\s*[123]|icu|nicu|isolasi)\b/.test(combined)) {
    return [
      {
        badge: 'VVIP • Aster Lt. 5',
        title: 'Kamar VVIP',
        subtitle: 'Tercatat 2 tersedia • Rp 2.850.000/mlm',
        query: 'Jelaskan detail fasilitas, tarif, dan jam besuk kamar VVIP Paviliun Aster.',
        category: 'bed',
      },
      {
        badge: 'VIP • Aster & Melati',
        title: 'Kamar VIP',
        subtitle: 'Tercatat 6 tersedia • Rp 1.650.000/mlm',
        query: 'Jelaskan detail fasilitas, ketersediaan, dan tarif kamar VIP Paviliun Aster & Melati.',
        category: 'bed',
      },
      {
        badge: 'Kelas 1, 2 & 3',
        title: 'Kamar Kelas & BPJS',
        subtitle: 'Paviliun Cempaka • Mulai Rp 350.000/mlm',
        query: 'Bandingkan fasilitas, tarif, dan cakupan BPJS untuk kamar Kelas 1, Kelas 2, dan Kelas 3.',
        category: 'bed',
      },
      {
        badge: 'Unit Khusus 24 Jam',
        title: 'ICU, NICU & Isolasi',
        subtitle: 'Perawatan intensif & tekanan negatif',
        query: 'Bagaimana informasi tarif, fasilitas, dan aturan kunjungan ruang ICU, NICU, dan Isolasi?',
        category: 'bed',
      },
    ];
  }

  if (/\b(dokter|spesialis|poli|poliklinik|jadwal praktik)\b/.test(combined)) {
    return [
      {
        badge: 'Poli Anak',
        title: 'dr. Rina Puspita, Sp.A(K)',
        subtitle: 'Sen, Sel, Kam, Sab • 15:00-19:30 WIB',
        query: 'Tampilkan detail jadwal, lokasi ruang, dan penjaminan dr. Rina Puspita, Sp.A(K).',
        category: 'doctor',
      },
      {
        badge: 'Penyakit Dalam',
        title: 'dr. Budi Santoso, Sp.PD',
        subtitle: 'Sen, Rab, Jum • 09:00-13:00 WIB',
        query: 'Tampilkan detail jadwal, lokasi ruang, dan fokus layanan dr. Budi Santoso, Sp.PD.',
        category: 'doctor',
      },
      {
        badge: 'Kardiologi / Jantung',
        title: 'dr. Ratna Dewi & dr. Andi',
        subtitle: 'Pusat Kardiovaskular Terpadu',
        query: 'Bagaimana jadwal dr. Ratna Dewi Sp.JP dan status praktik dr. Andi Kurniawan?',
        category: 'doctor',
      },
      {
        badge: 'Obgyn & Bedah',
        title: 'dr. Farhan & dr. Hendra',
        subtitle: 'Kandungan & Bedah Digestif',
        query: 'Tampilkan jadwal praktik dr. Farhan Malik Sp.OG dan dr. Hendra Wijaya Sp.B.',
        category: 'doctor',
      },
      {
        badge: 'Saraf & Kulit',
        title: 'dr. Jessica & dr. Nadia',
        subtitle: 'Neurologi & Dermatologi',
        query: 'Tampilkan jadwal praktik dr. Jessica Vanesha Sp.S dan dr. Nadia Saraswati Sp.KK.',
        category: 'doctor',
      },
    ];
  }

  if (/\b(bpjs|asuransi|rujukan|cashless|penjamin|klaim)\b/.test(combined)) {
    return [
      {
        badge: 'BPJS Rawat Jalan',
        title: 'Syarat Rujukan Faskes 1',
        subtitle: 'Surat rujukan online & masa berlaku 90 hari',
        query: 'Apa saja syarat berkas dan alur rujukan BPJS Kesehatan untuk rawat jalan?',
        category: 'insurance',
      },
      {
        badge: '12 Rekanan',
        title: 'Asuransi Swasta Cashless',
        subtitle: 'Prudential, AdMedika, Allianz, AXA/Mandiri, dll',
        query: 'Sebutkan daftar lengkap perusahaan asuransi rekanan cashless RS Umbrella.',
        category: 'insurance',
      },
      {
        badge: 'IGD 24 Jam',
        title: 'IGD Tanpa Surat Rujukan',
        subtitle: 'Ketentuan pasien darurat BPJS',
        query: 'Bagaimana ketentuan pasien gawat darurat BPJS yang langsung ke IGD tanpa rujukan?',
        category: 'insurance',
      },
    ];
  }

  if (/\b(lab|laboratorium|radiologi|rontgen|usg|ct-?scan|darah|lipid|hba1c)\b/.test(combined)) {
    return [
      {
        badge: 'Laboratorium',
        title: 'Darah Lengkap & Lipid',
        subtitle: 'Mulai Rp 145.000 • Cek syarat puasa',
        query: 'Berapa tarif, persiapan puasa, dan estimasi hasil tes Darah Lengkap dan Profil Lipid?',
        category: 'lab',
      },
      {
        badge: 'Diabetes Check',
        title: 'HbA1c & Glukosa Puasa',
        subtitle: 'Rp 280.000 • Estimasi 2 jam',
        query: 'Berapa tarif, syarat puasa, dan cakupan BPJS untuk pemeriksaan HbA1c dan Glukosa?',
        category: 'lab',
      },
      {
        badge: 'Radiologi',
        title: 'Rontgen & USG 4D',
        subtitle: 'Thorax Rp 220.000 • USG 4D Rp 750.000',
        query: 'Berapa tarif dan persiapan Rontgen Thorax serta USG Kandungan 4D?',
        category: 'lab',
      },
      {
        badge: 'Imaging 128 Slices',
        title: 'CT-Scan Kepala',
        subtitle: 'Rp 1.450.000 • Non-kontras 5-10 menit',
        query: 'Berapa biaya, durasi pemeriksaan, dan cakupan BPJS untuk CT-Scan Kepala?',
        category: 'lab',
      },
    ];
  }

  return [];
};

export const ChatPlayground: React.FC<ChatPlaygroundProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ratedMap, setRatedMap] = useState<Record<string, 'up' | 'down'>>({});
  const [seniorMode, setSeniorMode] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sttMessage, setSttMessage] = useState<string | null>(null);
  const [isVoiceCallDialogOpen, setIsVoiceCallDialogOpen] = useState(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceCallPhase, setVoiceCallPhase] = useState<
    'ready' | 'listening' | 'transcribing' | 'thinking' | 'speaking' | 'error'
  >('ready');
  const [voiceCallError, setVoiceCallError] = useState<string | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sttControllerRef = useRef<SmartSTTController | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioStopResolverRef = useRef<(() => void) | null>(null);
  const bargeInMonitorRef = useRef<{ stop: () => void } | null>(null);
  const callTurnIdRef = useRef(0);
  const lineAudioRef = useRef<Map<string, Blob>>(new Map());
  const voiceHistoryRef = useRef<Array<{ role: 'user' | 'model'; text: string }>>([]);
  const voiceCallActiveRef = useRef(false);
  const startVoiceListeningRef = useRef<(() => Promise<void>) | null>(null);

  const stopVoiceAudio = () => {
    bargeInMonitorRef.current?.stop();
    bargeInMonitorRef.current = null;
    audioStopResolverRef.current?.();
    audioStopResolverRef.current = null;
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Timer lama panggilan aktif (format MM:SS)
  useEffect(() => {
    if (!isVoiceCallActive) {
      setCallSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isVoiceCallActive]);

  // Auto-scroll saat pesan baru muncul atau sedang loading
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Cleanup speech synthesis & microphone controller saat komponen ditutup
  useEffect(() => {
    return () => {
      voiceCallActiveRef.current = false;
      callTurnIdRef.current++;
      stopVoiceAudio();
      if (sttControllerRef.current) {
        sttControllerRef.current.cancel();
        sttControllerRef.current = null;
      }
    };
  }, []);

  // Fitur Smart Speech-to-Text dengan Auto-Stop Silence Detection
  const toggleSpeechRecognition = async () => {
    // Jika sedang mendengarkan, pengguna dapat klik manual untuk langsung berhenti
    if (isListening) {
      if (sttControllerRef.current) {
        sttControllerRef.current.cancel();
        sttControllerRef.current = null;
      }
      setIsListening(false);
      return;
    }

    if (isTranscribing) return;

    setSttMessage(null);

    const controller = await startSmartSpeechRecognition({
      onInterimResult: (interimText) => {
        // Kata-kata langsung muncul real-time saat pengguna berbicara
        setInputText(interimText);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
        }
      },
      onFinalResult: (finalText) => {
        // Teks final otomatis terisi dan textarea terfokus saat pengguna selesai berbicara
        setInputText(finalText);
        setIsListening(false);
        setIsTranscribing(false);
        setSttMessage(null);

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
          }
        }, 50);
      },
      onStateChange: (state, message) => {
        if (state === 'listening') {
          setIsListening(true);
          setIsTranscribing(false);
          setSttMessage(message || 'Mendengarkan... (otomatis transkrip saat Anda selesai bicara)');
        } else if (state === 'transcribing') {
          setIsListening(false);
          setIsTranscribing(true);
          setSttMessage(message || 'Memproses teks...');
        } else if (state === 'idle') {
          setIsListening(false);
          setIsTranscribing(false);
          if (message) {
            setSttMessage(message);
            setTimeout(() => setSttMessage(null), 3500);
          } else {
            setSttMessage(null);
          }
        }
      },
      onError: (errMsg) => {
        setIsListening(false);
        setIsTranscribing(false);
        setSttMessage(errMsg);
        setTimeout(() => setSttMessage(null), 4000);
      },
    });

    sttControllerRef.current = controller;
  };

  const splitSpeechChunks = (text: string, maxLength = 180): string[] => {
    const normalized = stripMarkdown(text).replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    const sentences = normalized.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if ((current + ' ' + sentence).trim().length <= maxLength) {
        current = (current + ' ' + sentence).trim();
      } else {
        if (current) chunks.push(current);
        if (sentence.length <= maxLength) {
          current = sentence;
        } else {
          const words = sentence.split(' ');
          let part = '';
          for (const word of words) {
            if ((part + ' ' + word).trim().length <= maxLength) {
              part = (part + ' ' + word).trim();
            } else {
              if (part) chunks.push(part);
              part = word;
            }
          }
          current = part;
        }
      }
    }

    if (current) chunks.push(current);
    return chunks;
  };

  const AGENT_NAME = 'Dewi';
  const INSTANT_CHECKING_LINE = 'Oke, baik Bapak atau Ibu, akan kami periksa dahulu ya.';
  const CHECKING_LINES = [INSTANT_CHECKING_LINE];
  const STILL_CHECKING_LINE = 'Mohon ditunggu sebentar lagi ya, masih kami periksa.';
  const THANKS_FOR_WAITING_LINES = [
    'Terima kasih sudah menunggu ya.',
    'Baik, terima kasih telah menunggu.',
  ];
  const STILL_CHECKING_DELAY_MS = 5000;
  const SMALL_TALK = /^(halo|hai|oke|ok|baik|siap|sip|iya|ya|makasih|terima kasih)\b/i;

  const pickRandom = (items: string[]) => items[Math.floor(Math.random() * items.length)];

  const needsChecking = (question: string) => !SMALL_TALK.test(question.trim());

  const settlesWithin = <T,>(promise: Promise<T>, ms: number): Promise<boolean> => {
    const settled = promise.then(() => true, () => true);
    const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), ms));
    return Promise.race([settled, timeout]);
  };

  const getVoiceGreeting = (): string => {
    const hour = new Date().getHours();
    let time = 'malam';
    if (hour >= 4 && hour < 11) time = 'pagi';
    else if (hour >= 11 && hour < 15) time = 'siang';
    else if (hour >= 15 && hour < 18) time = 'sore';

    return `Halo, selamat ${time}! Dengan ${AGENT_NAME} dari customer service RS Umbrella. Ada yang bisa saya bantu?`;
  };

  const preloadLines = async () => {
    const lines = [...CHECKING_LINES, STILL_CHECKING_LINE, ...THANKS_FOR_WAITING_LINES];
    await Promise.allSettled(
      lines.map(async (line) => {
        if (lineAudioRef.current.has(line)) return;
        const blob = await synthesizeSpeech(line);
        lineAudioRef.current.set(line, blob);
      }),
    );
  };

  const playAudioElement = (audio: HTMLAudioElement, revokeUrl?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!voiceCallActiveRef.current) {
        if (revokeUrl) URL.revokeObjectURL(revokeUrl);
        resolve(false);
        return;
      }

      let settled = false;
      voiceAudioRef.current = audio;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        if (audioStopResolverRef.current === forceStop) {
          audioStopResolverRef.current = null;
        }
        if (voiceAudioRef.current === audio) {
          voiceAudioRef.current = null;
        }
        if (revokeUrl) URL.revokeObjectURL(revokeUrl);
        resolve(ok);
      };

      const forceStop = () => {
        audio.pause();
        finish(false);
      };
      audioStopResolverRef.current = forceStop;

      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      audio.play().catch(() => finish(false));
    });
  };

  const playAudioBlob = (blob: Blob): Promise<boolean> => {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    return playAudioElement(audio, audioUrl);
  };

  const streamSpeechResponse = async (response: Response): Promise<boolean> => {
    const contentType = response.headers.get('content-type') || '';
    const canStreamMse =
      contentType.includes('mpeg') &&
      typeof MediaSource !== 'undefined' &&
      MediaSource.isTypeSupported('audio/mpeg') &&
      response.body;

    if (!canStreamMse || !response.body) {
      const blob = await response.blob();
      return playAudioBlob(blob);
    }

    const mediaSource = new MediaSource();
    const objectUrl = URL.createObjectURL(mediaSource);
    const audio = new Audio(objectUrl);

    mediaSource.addEventListener(
      'sourceopen',
      async () => {
        try {
          const buffer = mediaSource.addSourceBuffer('audio/mpeg');
          const reader = response.body!.getReader();
          for (;;) {
            if (!voiceCallActiveRef.current) break;
            const { done, value } = await reader.read();
            if (done) break;
            buffer.appendBuffer(value);
            await new Promise<void>((resolve) =>
              buffer.addEventListener('updateend', () => resolve(), { once: true }),
            );
          }
          if (mediaSource.readyState === 'open') {
            mediaSource.endOfStream();
          }
        } catch {
          if (mediaSource.readyState === 'open') {
            try {
              mediaSource.endOfStream('network');
            } catch (_) {}
          }
        }
      },
      { once: true },
    );

    return playAudioElement(audio, objectUrl);
  };

  const speakWithBrowserFallback = async (chunks: string[]): Promise<boolean> => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      return false;
    }

    window.speechSynthesis.cancel();
    await new Promise((r) => setTimeout(r, 40));
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.toLowerCase().startsWith('id'));

    for (const chunk of chunks) {
      if (!voiceCallActiveRef.current) return false;

      const spoken = await new Promise<boolean>((resolve) => {
        let settled = false;
        const finish = (ok: boolean) => {
          if (settled) return;
          settled = true;
          clearTimeout(safetyTimer);
          resolve(ok);
        };

        const safetyTimer = setTimeout(() => finish(true), Math.max(5000, chunk.length * 120));
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = 'id-ID';
        if (idVoice) utterance.voice = idVoice;
        utterance.rate = 0.98;
        utterance.onend = () => finish(true);
        utterance.onerror = () => finish(false);
        window.speechSynthesis.speak(utterance);
      });

      if (!spoken) return false;
    }

    return true;
  };

  const speakVoiceReply = async (
    text: string,
    fromCache = false,
    allowBargeIn = true,
  ): Promise<boolean> => {
    const myTurnId = callTurnIdRef.current;

    if (allowBargeIn && voiceCallActiveRef.current) {
      bargeInMonitorRef.current?.stop();
      void startBargeInDetector(() => {
        if (!voiceCallActiveRef.current || callTurnIdRef.current !== myTurnId) return;
        callTurnIdRef.current++;
        stopVoiceAudio();
        void startVoiceListeningRef.current?.();
      }).then((monitor) => {
        if (voiceCallActiveRef.current && callTurnIdRef.current === myTurnId) {
          bargeInMonitorRef.current = monitor;
        } else {
          monitor.stop();
        }
      });
    }

    try {
      const cachedBlob = fromCache ? lineAudioRef.current.get(text) : undefined;
      if (cachedBlob) {
        return await playAudioBlob(cachedBlob);
      }

      const deepgramChunks = splitSpeechChunks(text, 900);
      if (deepgramChunks.length === 0) return true;

      // 1. Utamakan Deepgram TTS v2 (flux-fitri-id) streaming audio
      try {
        for (const chunk of deepgramChunks) {
          if (!voiceCallActiveRef.current || callTurnIdRef.current !== myTurnId) return false;
          const response = await synthesizeSpeechResponse(chunk);
          if (!voiceCallActiveRef.current || callTurnIdRef.current !== myTurnId) return false;
          const played = await streamSpeechResponse(response);
          if (!played) {
            throw new Error('Gagal memutar audio Deepgram.');
          }
        }
        return true;
      } catch (dgErr) {
        if (!voiceCallActiveRef.current || callTurnIdRef.current !== myTurnId) return false;
        console.warn('Deepgram TTS fallback ke browser speechSynthesis:', dgErr);
      }

      // 2. Fallback ke browser speechSynthesis jika /api/tts gagal
      const fallbackChunks = splitSpeechChunks(text, 180);
      const fallbackOk = await speakWithBrowserFallback(fallbackChunks);
      if (!fallbackOk && voiceCallActiveRef.current && callTurnIdRef.current === myTurnId) {
        setVoiceCallError('Jawaban tidak dapat dibacakan. Pastikan server berjalan dan izin audio aktif.');
        setVoiceCallPhase('error');
      }
      return fallbackOk;
    } finally {
      bargeInMonitorRef.current?.stop();
      bargeInMonitorRef.current = null;
    }
  };

  const sayWhileChecking = async (line: string, myTurnId: number) => {
    if (!voiceCallActiveRef.current || callTurnIdRef.current !== myTurnId) return;
    setVoiceCallPhase('speaking');
    await speakVoiceReply(line, true, true);
    if (voiceCallActiveRef.current && callTurnIdRef.current === myTurnId) {
      setVoiceCallPhase('thinking');
    }
  };

  const handleVoiceQuery = async (transcript: string) => {
    if (!voiceCallActiveRef.current) return;

    const myTurnId = ++callTurnIdRef.current;
    sttControllerRef.current = null;
    setVoiceCallError(null);
    setVoiceCallPhase('thinking');

    const replyPromise = callGeminiLive({
      userQuery: transcript,
      chatHistory: voiceHistoryRef.current,
      model: DEFAULT_GEMINI_MODEL,
      systemContext: DEFAULT_HOSPITAL_CONTEXT,
      voiceMode: true,
    });

    try {
      // Jika AI menjawab cepat (<= 1 detik), langsung putar jawaban utama tanpa jeda kalimat pengisi.
      // Jika > 1 detik, langsung putar "Oke, baik Bapak atau Ibu, akan kami periksa dahulu ya." sambil menunggu.
      if (needsChecking(transcript) && !(await settlesWithin(replyPromise, 1000))) {
        if (!voiceCallActiveRef.current || callTurnIdRef.current !== myTurnId) return;
        await sayWhileChecking(INSTANT_CHECKING_LINE, myTurnId);
        if (
          voiceCallActiveRef.current &&
          callTurnIdRef.current === myTurnId &&
          !(await settlesWithin(replyPromise, STILL_CHECKING_DELAY_MS))
        ) {
          await sayWhileChecking(STILL_CHECKING_LINE, myTurnId);
        }
      }

      const rawReply = await replyPromise;
      if (!voiceCallActiveRef.current || callTurnIdRef.current !== myTurnId) return;

      const reply = rawReply;

      voiceHistoryRef.current = [
        ...voiceHistoryRef.current.slice(-10),
        { role: 'user', text: transcript },
        { role: 'model', text: rawReply },
      ];

      setVoiceCallPhase('speaking');
      const spoken = await speakVoiceReply(reply, false, true);
      if (spoken && voiceCallActiveRef.current && callTurnIdRef.current === myTurnId) {
        await startVoiceListeningRef.current?.();
      }
    } catch (error) {
      if (!voiceCallActiveRef.current || callTurnIdRef.current !== myTurnId) return;
      setVoiceCallError(
        error instanceof Error ? error.message : 'Terjadi kendala saat memproses pertanyaan.',
      );
      setVoiceCallPhase('error');
    }
  };

  const startVoiceListening = async () => {
    if (!voiceCallActiveRef.current) return;

    setVoiceCallError(null);
    try {
      const controller = await startSmartSpeechRecognition({
        forceDeepgram: true,
        onFinalResult: (transcript) => {
          void handleVoiceQuery(transcript);
        },
        onStateChange: (state, message) => {
          if (!voiceCallActiveRef.current) return;
          if (state === 'listening') {
            setVoiceCallPhase('listening');
          } else if (state === 'transcribing') {
            setVoiceCallPhase('transcribing');
          } else if (message) {
            setVoiceCallError(message);
            setVoiceCallPhase('error');
          }
        },
        onError: (message) => {
          if (!voiceCallActiveRef.current) return;
          setVoiceCallError(message);
          setVoiceCallPhase('error');
        },
      });

      if (!voiceCallActiveRef.current) {
        controller.stop();
        return;
      }
      sttControllerRef.current = controller;
    } catch (error) {
      if (!voiceCallActiveRef.current) return;
      setVoiceCallError(
        error instanceof Error ? error.message : 'Tidak dapat memulai mikrofon.',
      );
      setVoiceCallPhase('error');
    }
  };
  startVoiceListeningRef.current = startVoiceListening;

  const handleStartVoiceCall = async () => {
    if (!('speechSynthesis' in window)) {
      setVoiceCallError('Fitur suara tidak didukung oleh browser ini.');
      setVoiceCallPhase('error');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceCallError('Browser ini tidak mendukung perekaman suara yang dibutuhkan Deepgram.');
      setVoiceCallPhase('error');
      return;
    }

    voiceCallActiveRef.current = true;
    voiceHistoryRef.current = [];
    setIsVoiceCallActive(true);
    setVoiceCallError(null);

    void preloadLines();

    const greetingText = getVoiceGreeting();
    setVoiceCallPhase('speaking');

    const greeted = await speakVoiceReply(greetingText);
    if (greeted && voiceCallActiveRef.current) {
      await startVoiceListeningRef.current?.();
    }
  };

  const handleEndVoiceCall = () => {
    voiceCallActiveRef.current = false;
    callTurnIdRef.current++;
    voiceHistoryRef.current = [];
    setIsVoiceCallActive(false);
    sttControllerRef.current?.cancel();
    sttControllerRef.current = null;
    stopVoiceAudio();
    setVoiceCallPhase('ready');
  };

  const handleCloseVoiceCallDialog = () => {
    if (voiceCallActiveRef.current) {
      handleEndVoiceCall();
    }
    setIsVoiceCallDialogOpen(false);
    setVoiceCallError(null);
    setVoiceCallPhase('ready');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInputText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto-expand textarea up to 140px
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 140)}px`;
  };

  const handleCopyText = (id: string, text: string) => {
    // Bersihkan format markdown (seperti **, *, ###, #, dll) saat disalin ke clipboard
    const cleanText = stripMarkdown(text);
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Handler paste untuk mencegah tanda bintang (*) dan pagar (#) masuk ke input box
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData) return;

    // Jika teks yang ditempel mengandung karakter format markdown (*, **, #, >)
    if (/(\*\*|\*|#{1,6}\s+|^>\s+)/m.test(pasteData)) {
      e.preventDefault();
      const cleaned = stripMarkdown(pasteData);

      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const currentVal = target.value;
      const nextVal = currentVal.substring(0, start) + cleaned + currentVal.substring(end);

      setInputText(nextVal);

      // Sesuaikan tinggi textarea dan posisi kursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + cleaned.length;
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
        }
      }, 0);
    }
  };

  const handleRate = (id: string, type: 'up' | 'down') => {
    setRatedMap((prev) => ({ ...prev, [id]: type }));
  };

  // Fitur Text-to-Speech (Membacakan jawaban dalam Bahasa Indonesia untuk kemudahan pasien/lansia)
  const handleToggleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Fitur suara tidak didukung oleh browser ini.');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Membersihkan format markdown agar narasi suara terdengar alami
    const cleanSpeech = text
      .replace(/\*\*/g, '')
      .replace(/•/g, '')
      .replace(/[#*_-]/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // 4 Topik Pertanyaan Populer Unggulan (Kompak, Elegan & Pas di Layar)
  const featuredQuestions = [
    {
      badge: 'Rawat Inap VIP',
      title: 'Ketersediaan Kamar VIP',
      desc: 'Cek sisa ranjang Paviliun Aster, Melati & tarif kamar',
      query: 'Berapa ketersediaan kamar rawat inap VIP Paviliun Aster dan Melati saat ini beserta tarifnya?',
      icon: Bed,
    },
    {
      badge: 'Poliklinik Spesialis',
      title: 'Jadwal Dokter Spesialis',
      desc: 'Cek jam praktik dokter spesialis anak, internis & jantung hari ini',
      query: 'Bagaimana jadwal praktik dokter spesialis anak dan penyakit dalam hari ini?',
      icon: Stethoscope,
    },
    {
      badge: 'BPJS & Asuransi',
      title: 'Alur Rujukan BPJS & Bebas IGD',
      desc: 'Syarat rujukan faskes 1 & penanganan darurat langsung di IGD',
      query: 'Apakah pasien gawat darurat memerlukan surat rujukan dari faskes 1 untuk berobat?',
      icon: FileText,
    },
    {
      badge: 'Kedaruratan Medis',
      title: 'Hotline IGD & Ambulans 119',
      desc: 'Nomor ambulans siaga 119 & hotline triase IGD darurat 24 jam',
      query: 'Bagaimana nomor ambulans darurat dan prosedur triase IGD 24 jam RS Umbrella?',
      icon: Ambulance,
    },
  ];

  // Saran Pertanyaan Cepat Mengambang di Atas Input (Bersih, merah-putih-hitam tanpa warna lain)
  const quickSuggestions = [
    { label: 'Biaya Kamar VIP', query: 'Berapa tarif kamar VIP Paviliun Aster & Melati per malam?' },
    { label: 'Dokter Anak Hari Ini', query: 'Apakah poli spesialis anak buka hari ini dan jam berapa?' },
    { label: 'Syarat Pasien BPJS', query: 'Apa saja syarat berkas rujukan untuk berobat BPJS?' },
    { label: 'Panggil Ambulans 119', query: 'Bagaimana alur darurat memanggil ambulans RS Umbrella?' },
    { label: 'Jam Kunjung Pasien', query: 'Jam berapa jam besuk atau kunjungan rawat inap pasien?' },
  ];

  // Helper format teks dengan highlight medis cerdas & nomor telepon interaktif
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((rawLine, lineIdx) => {
      let line = rawLine;

      // 1. Deteksi dan hilangkan Header Markdown (#, ##, ###, dst.) agar tidak muncul tanda pagar di layar
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      let isHeader = false;
      let headerLevel = 0;
      if (headerMatch) {
        isHeader = true;
        headerLevel = headerMatch[1].length;
        line = headerMatch[2]; // Hilangkan tanda '#'
      }

      // 2. Deteksi Blockquote (>)
      let isQuote = false;
      if (line.trim().startsWith('>')) {
        isQuote = true;
        line = line.replace(/^>\s*/, '');
      }

      // 3. Deteksi bullet point (termasuk •, -, atau *)
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.replace(/^[\s•*-]+/, '').trim() : line;

      // 4. Split formatting: Bold (**teks**) dan Italic (*teks*)
      const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      const formattedParts = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          // Highlight jika nomor darurat
          if (content.includes('021-8065-9911') || content.includes('119') || content.includes('8065-0000')) {
            return (
              <span
                key={partIdx}
                className="font-bold text-[#E11D48] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block"
              >
                {content}
              </span>
            );
          }
          return (
            <strong key={partIdx} className="font-bold text-slate-900">
              {content}
            </strong>
          );
        }

        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={partIdx} className="italic text-slate-700">
              {part.slice(1, -1)}
            </em>
          );
        }

        // Cek jika ada nomor telepon di teks biasa
        if (part.includes('021-8065-9911')) {
          return (
            <a
              key={partIdx}
              href="tel:02180659911"
              className="text-[#E11D48] font-bold underline decoration-rose-300 hover:decoration-[#E11D48]"
            >
              (021) 8065-9911
            </a>
          );
        }

        return part;
      });

      if (isHeader) {
        return (
          <div
            key={lineIdx}
            className={`font-bold text-slate-900 ${
              headerLevel <= 2 ? 'text-base sm:text-lg mt-3.5 mb-1.5' : 'text-sm sm:text-base mt-2.5 mb-1'
            }`}
          >
            {formattedParts}
          </div>
        );
      }

      if (isQuote) {
        return (
          <div
            key={lineIdx}
            className="my-2 pl-3 border-l-2 border-[#E11D48] bg-rose-50/50 py-1 rounded-r text-slate-700 italic"
          >
            {formattedParts}
          </div>
        );
      }

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start space-x-2.5 my-1.5 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-2 flex-shrink-0" />
            <div className="flex-1 text-slate-800">{formattedParts}</div>
          </div>
        );
      }

      return (
        <div
          key={lineIdx}
          className={lineIdx > 0 && lines[lineIdx - 1] === '' ? 'mt-2.5 text-slate-800' : 'text-slate-800'}
        >
          {formattedParts}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-slate-50/70 select-text relative">

      {/* Area Chat Utama: Berpusat, Nyaman & Pas Layar */}
      <div className={`flex-1 overflow-y-auto px-4 sm:px-6 py-2 sm:py-3 min-h-0 flex flex-col items-center ${messages.length === 0 ? 'justify-center' : 'justify-start'}`}>
        <div className={`w-full max-w-3xl flex-1 flex flex-col ${messages.length === 0 ? 'justify-center' : 'justify-between'}`}>

          {messages.length === 0 ? (
            /* ============================================================ */
            /* EMPTY STATE: Tampilan Awal yang Tenang & Terstruktur         */
            /* ============================================================ */
            <div className="my-auto py-4 flex flex-col items-center text-center select-none w-full max-w-2xl mx-auto">

              {/* Logo RS Umbrella */}
              <div className="mb-4 w-12 h-12 rounded-xl bg-[#E11D48] flex items-center justify-center text-white">
                <UmbrellaLogo size={26} />
              </div>

              {/* Judul & Pengantar */}
              <div className="space-y-2 px-2">
                <p className="text-xs font-medium text-slate-500">
                  Layanan Informasi Pasien 24 Jam
                </p>
                <h1 className="text-2xl sm:text-[26px] font-semibold text-[#0F172A] tracking-tight leading-snug">
                  Ada yang bisa kami bantu hari ini?
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-normal leading-relaxed">
                  Tanyakan jadwal dokter spesialis, kamar rawat inap, ketentuan rujukan BPJS, atau layanan IGD RS Umbrella.
                </p>
              </div>

              {/* Ringkasan Kapasitas Tercatat */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0]">
                  <Bed className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                  <span>VIP Aster 4 bed • Melati 2 bed</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0]">
                  <Stethoscope className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                  <span>Poliklinik Senin–Sabtu</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0]">
                  <Ambulance className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                  <span>IGD 24 Jam • Ambulans 119</span>
                </span>
              </div>

              {/* Grid 4 Kartu Pertanyaan Populer */}
              <div className="w-full mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {featuredQuestions.map((item, idx) => {
                  const CardIcon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(item.query)}
                      className="group p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#E11D48] hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-left"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-rose-50 group-hover:text-[#E11D48] flex items-center justify-center flex-shrink-0 transition-colors">
                          <CardIcon className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-[#E11D48] leading-tight mb-0.5">
                            {item.badge}
                          </div>
                          <h3 className="font-semibold text-[13px] text-[#0F172A] truncate">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E11D48] flex-shrink-0 transition-colors" />
                    </button>
                  );
                })}
              </div>

              {/* Himbauan Medis Singkat */}
              <div className="mt-4 flex items-center justify-center space-x-1.5 text-xs text-slate-500 max-w-xl text-center px-2">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                <span>
                  Informasi operasional aplikasi. Keadaan darurat segera ke IGD RS Umbrella atau hubungi 119.
                </span>
              </div>

            </div>
          ) : (
            /* ============================================================ */
            /* CONVERSATION STREAM: Tampilan Obrolan yang Nyaman & Rapi      */
            /* ============================================================ */
            <div className="space-y-6 pb-6 pt-2">

              {messages.map((m, idx) => {
                // PESAN DARI PENGGUNA (USER)
                if (m.sender === 'user') {
                  return (
                    <div key={m.id} className="flex flex-col items-end animate-fade-in">
                      <div className="flex items-end space-x-2.5 max-w-[90%] sm:max-w-[78%]">
                        <div
                          className={`bg-[#0F172A] text-white rounded-2xl rounded-br-xs px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm leading-relaxed text-left font-normal ${seniorMode ? 'text-base sm:text-lg leading-relaxed' : 'text-xs sm:text-sm'
                            }`}
                        >
                          {m.text}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold mb-1 shadow-2xs">
                          <User className="w-4 h-4 text-slate-600" />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 mr-9 px-1">
                        {m.timestamp}
                      </span>
                    </div>
                  );
                }

                // PESAN DARI AI ASSISTANT (UMBRELLA HEALTHCARE)
                const isSpeaking = speakingId === m.id;
                const prevUserMsg = idx > 0 && messages[idx - 1]?.sender === 'user' ? messages[idx - 1].text : '';
                const quickCards = !m.isError ? getQuickMenuCards(prevUserMsg, m.text) : [];
                const containsEmergency =
                  m.text.includes('021-8065-9911') ||
                  m.text.toLowerCase().includes('gawat darurat') ||
                  m.text.toLowerCase().includes('ambulans 119') ||
                  m.text.toLowerCase().includes('triase merah');

                return (
                  <div key={m.id} className="flex items-start space-x-3 text-left group">
                    {/* Avatar RS Umbrella */}
                    <div className="pt-0.5 flex-shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-[#E11D48] flex items-center justify-center text-white">
                        <UmbrellaLogo size={20} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 max-w-[92%] sm:max-w-[85%]">
                      {/* Bar Informasi Pengirim */}
                      <div className="flex items-center justify-between pb-1.5 px-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs sm:text-sm text-[#0F172A]">
                            Umbrella AI Assistant
                          </span>
                          <span className="text-[11px] text-slate-400 tabular-nums">{m.timestamp}</span>
                        </div>

                        {/* Tombol Suara (Text-to-Speech) */}
                        <button
                          onClick={() => handleToggleSpeak(m.id, m.text)}
                          className={`inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${isSpeaking
                            ? 'bg-rose-50 text-[#BE123C] border-rose-200 font-medium'
                            : 'bg-white text-slate-500 border-[#E2E8F0] hover:text-[#0F172A] hover:border-slate-300'
                            }`}
                          title={isSpeaking ? 'Hentikan suara narasi' : 'Dengarkan jawaban ini dibacakan'}
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" strokeWidth={1.75} />
                              <span className="text-[11px]">Berhenti</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                              <span className="text-[11px] hidden sm:inline">Bacakan</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Bubble Respon AI Medis */}
                      <div
                        className={`p-4 sm:p-5 rounded-2xl rounded-tl-xs border ${m.isError
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : isSpeaking
                            ? 'bg-white border-[#E11D48] text-slate-900'
                            : 'bg-white border-[#E2E8F0] text-slate-800'
                          } ${seniorMode ? 'text-base sm:text-[17px] leading-relaxed sm:leading-loose' : 'text-[13px] sm:text-sm leading-relaxed'}`}
                      >
                        {renderFormattedText(m.text)}
                      </div>

                      {/* Menu Cepat Berbentuk Card Interaktif di Bawah Jawaban */}
                      {quickCards.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {quickCards.map((card, cardIdx) => {
                            const CardIcon =
                              card.category === 'bed'
                                ? Bed
                                : card.category === 'doctor'
                                  ? Stethoscope
                                  : card.category === 'insurance'
                                    ? ShieldCheck
                                    : Activity;
                            return (
                              <button
                                key={cardIdx}
                                type="button"
                                disabled={isLoading}
                                onClick={() => void onSendMessage(card.query)}
                                className="group p-3 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#E11D48] hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-left disabled:opacity-50"
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-rose-50 group-hover:text-[#E11D48] flex items-center justify-center flex-shrink-0 transition-colors">
                                    <CardIcon className="w-4 h-4" strokeWidth={1.75} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[11px] font-medium text-[#E11D48] leading-tight mb-0.5 truncate">
                                      {card.badge}
                                    </div>
                                    <div className="font-semibold text-xs text-[#0F172A] truncate">
                                      {card.title}
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate">
                                      {card.subtitle}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E11D48] flex-shrink-0 transition-colors" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Kotak Aksi Kedaruratan Otomatis Jika Terdeteksi Kasus Darurat / IGD */}
                      {containsEmergency && (
                        <div className="mt-2.5 p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs animate-fade-in">
                          <div className="flex items-center space-x-2">
                            <Ambulance className="w-4 h-4 text-[#E11D48] flex-shrink-0" />
                            <span className="text-slate-800 font-medium">
                              <strong>Kondisi Gawat Darurat?</strong> Jangan tunda, segera hubungi tim triase siaga 24 jam.
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0 w-full sm:w-auto">
                            <a
                              href="tel:02180659911"
                              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 shadow-xs"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>Hotline IGD</span>
                            </a>
                            <a
                              href="tel:119"
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 shadow-xs"
                            >
                              <span>Ambulans 119</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Action Bar Bawah Pesan AI */}
                      {!m.isError && (
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
                          <div className="flex items-center space-x-3">
                            {/* Tombol Salin */}
                            <button
                              onClick={() => handleCopyText(m.id, m.text)}
                              className="hover:text-slate-700 transition-colors inline-flex items-center space-x-1 font-medium"
                              title="Salin jawaban ini ke clipboard"
                            >
                              {copiedId === m.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                                  <span className="text-[#E11D48] font-bold">Tersalin ke Clipboard</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Salin Teks</span>
                                </>
                              )}
                            </button>

                            {/* Umpan Balik Jempol */}
                            <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
                              <span className="text-slate-400 mr-1">Bermanfaat?</span>
                              <button
                                onClick={() => handleRate(m.id, 'up')}
                                className={`p-1 rounded-md hover:bg-slate-100 transition-colors ${ratedMap[m.id] === 'up' ? 'text-[#E11D48] font-bold bg-rose-50' : 'text-slate-400'
                                  }`}
                                title="Jawaban sangat membantu"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleRate(m.id, 'down')}
                                className={`p-1 rounded-md hover:bg-slate-100 transition-colors ${ratedMap[m.id] === 'down' ? 'text-rose-600 font-bold bg-rose-50' : 'text-slate-400'
                                  }`}
                                title="Jawaban kurang membantu"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Info Kontak Staf Medis Manusia */}
                          <a
                            href="tel:02180650000"
                            className="hover:text-[#E11D48] transition-colors inline-flex items-center space-x-1 font-semibold text-slate-500"
                            title="Bicara dengan petugas rumah sakit"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>Bantuan Staf: (021) 8065-0000</span>
                          </a>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

              {/* Status Mengetik AI yang Halus */}
              {isLoading && (
                <div className="flex items-start space-x-3 text-left animate-fade-in select-none">
                  <div className="pt-0.5 flex-shrink-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E11D48] flex items-center justify-center text-white shadow-md animate-pulse">
                      <UmbrellaLogo size={22} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 pb-1.5 px-0.5">
                      <span className="font-bold text-xs text-[#0F172A]">Umbrella AI Assistant</span>
                      <span className="text-[10.5px] font-medium text-slate-400">Sedang memproses...</span>
                    </div>
                    <div className="inline-flex items-center space-x-3 bg-white px-4 py-3 rounded-2xl rounded-tl-xs border border-[#E2E8F0] shadow-sm">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] typing-dot-1"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] typing-dot-2"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] typing-dot-3"></span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium">
                        Mencari data jadwal dokter &amp; fasilitas medis terpadu...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>
          )}

        </div>
      </div>

      {/* ============================================================ */}
      {/* FLOATING INPUT DOCK                                          */}
      {/* ============================================================ */}
      <div className="w-full bg-white border-t border-[#E2E8F0] p-3 flex-shrink-0 select-none z-20">
        <div className="max-w-3xl mx-auto w-full space-y-2">

          {/* Quick Follow-up Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => {
                setVoiceCallError(null);
                setVoiceCallPhase('ready');
                setIsVoiceCallDialogOpen(true);
              }}
              disabled={isLoading || isListening || isTranscribing || isVoiceCallActive}
              className="flex-shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mulai percakapan suara dengan Dewi"
            >
              <PhoneCall className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Telepon CS</span>
            </button>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={onClearChat}
                className="flex-shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] text-xs font-medium transition-colors"
                title="Bersihkan percakapan dan mulai topik baru"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                <span>Reset Chat</span>
              </button>
            )}
            <span className="text-xs font-medium text-slate-400 flex-shrink-0 hidden sm:inline pl-1">
              Saran:
            </span>
            {quickSuggestions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => onSendMessage(chip.query)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-[#E2E8F0] text-xs font-medium transition-colors disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Status Banner STT (Perekaman & Transkripsi) */}
          {(isListening || isTranscribing || sttMessage) && (
            <div className="mb-2 px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all bg-white border border-rose-200 shadow-sm">
              <div className="flex items-center space-x-2">
                {isListening && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-semibold text-rose-600 animate-pulse">
                      Mendengarkan suara Anda... (Klik tombol mic lagi jika sudah selesai bicara)
                    </span>
                  </>
                )}
                {isTranscribing && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-[#E11D48] animate-spin" />
                    <span className="font-semibold text-slate-700">
                      Mentranskripsi suara dengan Deepgram AI...
                    </span>
                  </>
                )}
                {!isListening && !isTranscribing && sttMessage && (
                  <span className="font-medium text-amber-600">{sttMessage}</span>
                )}
              </div>
              {isListening && (
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
                >
                  Selesai
                </button>
              )}
            </div>
          )}

          {/* Input Form Bar */}
          <form onSubmit={handleSubmit} className="relative flex items-end bg-slate-50 focus-within:bg-white border border-slate-300 focus-within:border-[#E11D48] focus-within:ring-2 focus-within:ring-rose-100 rounded-2xl p-1.5 transition-all shadow-inner">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Tanyakan keluhan, jadwal dokter spesialis, kamar VIP, atau alur BPJS..."
              className={`w-full py-2 pl-3 pr-28 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-slate-400 text-slate-800 transition-all ${seniorMode ? 'text-base' : 'text-xs sm:text-sm'
                }`}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />

            {/* Action Buttons Zone: Clear, Mic STT, Kirim */}
            <div className="flex items-center space-x-1.5 pb-1 pr-1 flex-shrink-0">
              {/* Clear Text button */}
              {inputText.trim().length > 0 && !isListening && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    if (textareaRef.current) textareaRef.current.style.height = 'auto';
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
                  title="Hapus ketikan"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Tombol Mic (Speech-to-Text Deepgram) */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                disabled={isTranscribing || isLoading}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${isListening
                  ? 'bg-rose-500 text-white ring-4 ring-rose-200 animate-pulse shadow-md'
                  : isTranscribing
                    ? 'bg-rose-50 text-rose-600 cursor-wait'
                    : 'text-slate-500 hover:text-[#E11D48] hover:bg-rose-50'
                  }`}
                title={
                  isListening
                    ? 'Sedang merekam... Klik untuk selesai'
                    : isTranscribing
                      ? 'Sedang mentranskripsi suara...'
                      : 'Bicara dengan Suara (Speech-to-Text)'
                }
              >
                {isTranscribing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#E11D48]" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Tombol Kirim */}
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading || isListening}
                className={`p-2 sm:px-3.5 sm:py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-sm ${!inputText.trim() || isLoading || isListening
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#E11D48] hover:bg-[#BE123C] text-white active:scale-95 shadow-rose-500/25'
                  }`}
                title="Kirim pertanyaan ke Asisten AI"
              >
                <span className="hidden sm:inline">Kirim</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Petunjuk & Catatan Kaki */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-400 px-1">
            <span>
              Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-[#E2E8F0] text-slate-600 font-mono">Enter</kbd> untuk kirim, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-[#E2E8F0] text-slate-600 font-mono">Shift + Enter</kbd> untuk baris baru
            </span>
            <span className="text-slate-500">
              RS PT Umbrella Corp • Layanan Informasi Pasien
            </span>
          </div>

        </div>
      </div>

      {isVoiceCallDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="voice-call-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white text-[#0F172A] border border-[#E2E8F0] shadow-xl"
          >
            {/* Header — selaras dengan PlaygroundHeader & bubble chat */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E11D48] text-white">
                  <UmbrellaLogo size={20} />
                </div>
                <div>
                  <h2 id="voice-call-title" className="text-sm font-semibold text-[#0F172A]">
                    Dewi • Customer Service
                  </h2>
                  <p className="text-xs text-[#64748B]">RS PT Umbrella Corp</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isVoiceCallActive && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 font-mono text-xs font-medium tabular-nums text-[#0F172A]">
                    <span className="h-2 w-2 rounded-full bg-[#E11D48]" />
                    {String(Math.floor(callSeconds / 60)).padStart(2, '0')}:
                    {String(callSeconds % 60).padStart(2, '0')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCloseVoiceCallDialog}
                  className="rounded-lg p-2 text-[#64748B] hover:bg-slate-200/60 hover:text-[#0F172A] transition-colors"
                  aria-label="Tutup percakapan suara"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full border transition-colors ${
                    voiceCallPhase === 'listening'
                      ? 'border-[#E11D48] bg-[#E11D48] text-white ring-4 ring-rose-100'
                      : voiceCallPhase === 'speaking'
                        ? 'border-[#0F172A] bg-[#0F172A] text-white ring-4 ring-slate-100'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A]'
                  }`}
                >
                  {voiceCallPhase === 'listening' ? (
                    <Mic className="h-7 w-7 stroke-[1.75]" />
                  ) : voiceCallPhase === 'speaking' ? (
                    <Volume2 className="h-7 w-7 stroke-[1.75]" />
                  ) : voiceCallPhase === 'thinking' || voiceCallPhase === 'transcribing' ? (
                    <Loader2 className="h-7 w-7 animate-spin text-[#E11D48]" />
                  ) : (
                    <PhoneCall className="h-7 w-7 stroke-[1.75]" />
                  )}
                </div>
              </div>

              {(voiceCallPhase === 'listening' || voiceCallPhase === 'speaking') && (
                <div className="mb-3 flex items-end justify-center gap-1 h-4" aria-hidden="true">
                  {[0.45, 0.9, 0.65, 1, 0.55, 0.85, 0.45].map((scale, i) => (
                    <span
                      key={i}
                      style={{
                        height: `${Math.round(scale * 16)}px`,
                        animationDelay: `${i * 90}ms`,
                      }}
                      className={`w-1 rounded-full animate-pulse ${
                        voiceCallPhase === 'listening' ? 'bg-[#E11D48]' : 'bg-[#0F172A]'
                      }`}
                    />
                  ))}
                </div>
              )}

              <p className="text-base font-semibold text-[#0F172A]" aria-live="polite">
                {voiceCallPhase === 'ready' && 'Panggilan suara Dewi'}
                {voiceCallPhase === 'listening' && 'Mendengarkan pertanyaan Anda'}
                {voiceCallPhase === 'transcribing' && 'Memproses ucapan Anda'}
                {voiceCallPhase === 'thinking' && 'Memeriksa informasi RS'}
                {voiceCallPhase === 'speaking' && 'Dewi sedang menjawab'}
                {voiceCallPhase === 'error' && 'Koneksi terganggu'}
              </p>

              <p className="mt-1.5 text-xs leading-relaxed text-[#64748B] max-w-xs">
                {voiceCallPhase === 'ready' &&
                  'Mulai panggilan untuk berbicara langsung seputar jadwal dokter, kamar rawat inap, atau BPJS.'}
                {voiceCallPhase === 'listening' &&
                  'Silakan berbicara, sistem otomatis memproses setelah Anda selesai.'}
                {voiceCallPhase === 'speaking' &&
                  'Anda dapat memotong pembicaraan kapan saja untuk bertanya lagi.'}
                {(voiceCallPhase === 'thinking' || voiceCallPhase === 'transcribing') &&
                  'Mohon tunggu sebentar.'}
              </p>

              {voiceCallError && (
                <p
                  role="alert"
                  className="mt-4 w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-[#BE123C]"
                >
                  {voiceCallError}
                </p>
              )}

              <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                {!isVoiceCallActive ? (
                  <button
                    type="button"
                    onClick={handleStartVoiceCall}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#BE123C] transition-colors"
                  >
                    <PhoneCall className="h-4 w-4" />
                    Mulai panggilan
                  </button>
                ) : (
                  <>
                    {voiceCallPhase === 'error' && (
                      <button
                        type="button"
                        onClick={() => void startVoiceListeningRef.current?.()}
                        className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                      >
                        Coba lagi
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleEndVoiceCall}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                    >
                      <PhoneOff className="h-4 w-4" />
                      Akhiri panggilan
                    </button>
                  </>
                )}
              </div>

              <p className="mt-5 text-[11px] text-[#64748B]">
                Layanan suara otomatis RS Umbrella. Hindari menyebut NIK atau data sensitif.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
