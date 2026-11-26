import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { RoomBookingModal } from './components/RoomBookingModal';
import { PlaygroundHeader } from './components/PlaygroundHeader';
import { ChatPlayground, ChatItem } from './components/ChatPlayground';
import { TutorialModal } from './components/TutorialModal';

import { AuthModal } from './components/AuthModal';
import { useAuth } from './contexts/AuthContext';
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_HOSPITAL_CONTEXT,
  callGeminiLive,
} from './services/geminiService';
import { getCurrentWIB } from './services/chatEngine';
import {
  getOrCreateCurrentSession,
  fetchSessionMessages,
  persistMessage,
  startNewSession,
} from './services/chatSessionService';

export const App: React.FC = () => {
  const { user } = useAuth();

  // 1. Status Tampilan Navigasi: 'landing' (Beranda RS) atau 'chatbot' (AI Assistant)
  const [currentView, setCurrentView] = useState<'landing' | 'chatbot'>('landing');

  // 2. Daftar Pesan Percakapan (Bersih dari awal, siap menerima tanya-jawab pasien)
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sesi chat persisten (Supabase / localStorage)
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const sid = await getOrCreateCurrentSession(user?.id ?? null);
        if (!mounted) return;
        setSessionId(sid);
        const storedMessages = await fetchSessionMessages(sid);
        if (!mounted) return;
        setMessages(storedMessages);
      } catch (e) {
        console.error('Gagal memulihkan sesi chat:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isRoomBookingOpen, setIsRoomBookingOpen] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [systemContext, setSystemContext] = useState<string>(DEFAULT_HOSPITAL_CONTEXT);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedDocumentText, setUploadedDocumentText] = useState<string>('');
  const [rememberKey, setRememberKey] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-flash-latest');

  // 3. Status Modal Panduan Penggunaan
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Hapus riwayat percakapan di playground (mulai sesi baru)
  const handleClearChat = async () => {
    if (messages.length === 0) return;
    if (window.confirm('Hapus seluruh riwayat percakapan dengan Asisten AI?')) {
      try {
        const newSid = await startNewSession(user?.id ?? null);
        setSessionId(newSid);
        setMessages([]);
      } catch (e) {
        console.error('Gagal membuat sesi baru:', e);
        setMessages([]);
      }
    }
  };

  // Kirim pertanyaan ke Gemini AI
  const handleSendMessage = async (queryText: string): Promise<string> => {
    const timestamp = getCurrentWIB();

    // Deteksi intent reservasi kamar -> buka form (data masuk ke Supabase room_bookings)
    const lower = queryText.toLowerCase();
    const isBookingIntent =
      /reservasi\s*kamar/.test(lower) ||
      (lower.includes('reservasi') && lower.includes('kamar')) ||
      lower.includes('pesan kamar') ||
      lower.includes('booking kamar');

    if (isBookingIntent) {
      const userMessage: ChatItem = {
        id: `usr-${Date.now()}`,
        sender: 'user',
        text: queryText,
        timestamp,
      };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      if (sessionId) {
        void persistMessage(sessionId, userMessage);
      }

      const aiMessage: ChatItem = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'Baik, saya buka formulir reservasi kamar rawat inap. Silakan isi data pasien, kelas kamar, dan durasi. Data akan dicatat ke database RS Umbrella.',
        timestamp: getCurrentWIB(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      if (sessionId) {
        void persistMessage(sessionId, aiMessage);
      }

      setIsRoomBookingOpen(true);
      return aiMessage.text;
    }

    // 1. Tambahkan Pesan Pasien/Pengguna
    const userMessage: ChatItem = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Persist pesan pengguna ke sesi (tidak hilang saat refresh)
    if (sessionId) {
      void persistMessage(sessionId, userMessage);
    }

    // 2. Panggil API Live Google Gemini (Kunci API & Konfigurasi otomatis dari ENV / Sistem)
    setIsLoading(true);

    try {
      const historyForAPI = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

      const combinedContext = systemContext + (uploadedDocumentText ? `\n\n[Dokumen Terlampir]\n${uploadedDocumentText}` : '');
      const aiText = await callGeminiLive({
        userQuery: queryText,
        chatHistory: historyForAPI,
        apiKey: apiKey,
        model: selectedModel,
        systemContext: combinedContext,
      });

      const aiMessage: ChatItem = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: getCurrentWIB(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (sessionId) {
        void persistMessage(sessionId, aiMessage);
      }
      return aiText;
    } catch (error: any) {
      console.error('Gemini Live API Call Error:', error);

      const errorMessage: ChatItem = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **KENDALA SISTEM ASISTEN AI**: Mohon maaf, sistem AI kami sedang mengalami kendala jaringan atau batas kuota saat memproses pertanyaan Anda.\n\nUntuk informasi cepat dan layanan darurat, silakan langsung hubungi **Call Center RS Umbrella di (021) 8065-0000** atau **IGD 24 Jam di (021) 8065-9911**.`,
        timestamp: getCurrentWIB(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
      if (sessionId) {
        void persistMessage(sessionId, errorMessage);
      }
      return errorMessage.text;
    } finally {
      setIsLoading(false);
    }
  };

  // Buka Asisten AI dari Landing Page (dengan opsi kueri awal dari kartu kapabilitas)
  const handleLaunchAssistantFromLanding = (initialPrompt?: string) => {
    setCurrentView('chatbot');
    if (initialPrompt) {
      setTimeout(() => {
        handleSendMessage(initialPrompt);
      }, 100);
    }
  };

  // Jika pengguna berada di Landing Page
  if (currentView === 'landing') {
    return <LandingPage onLaunchAssistant={handleLaunchAssistantFromLanding} />;
  }

  // Jika pengguna berada di AI Chatbot Playground (Tampilan Bersih, Elegan, Siap Pakai)
  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
      
      {/* Header Bar Atas */}
      <PlaygroundHeader
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onBackToHome={() => setCurrentView('landing')}
        messageCount={messages.length}
          onOpenAuth={(mode) => { setAuthMode(mode); setIsAuthOpen(true); }}
      />

      {/* Area Chatbot Penuh (Tanpa sidebar pengaturan, user langsung pakai) */}
      <main className="flex-1 min-h-0 w-full flex flex-col overflow-hidden relative">
        <ChatPlayground
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          uploadedFileName={uploadedFileName}
          onFileUpload={(file, extractedText) => {
            setUploadedFileName(file.name);
            if (extractedText) {
              setUploadedDocumentText((prev) => (prev ? prev + '\\n\\n' + extractedText : extractedText));
            }
          }}
        />


      </main>

      {/* Modal Panduan Penggunaan */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      <RoomBookingModal
        isOpen={isRoomBookingOpen}
        onClose={() => setIsRoomBookingOpen(false)}
      />

    </div>
  );
};

export default App;
