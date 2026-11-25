import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { PlaygroundHeader } from './components/PlaygroundHeader';
import { ChatPlayground, ChatItem } from './components/ChatPlayground';
import { TutorialModal } from './components/TutorialModal';
import { SettingsPanel } from './components/SettingsPanel';
import { AuthModal } from './components/AuthModal';
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_HOSPITAL_CONTEXT,
  callGeminiLive,
} from './services/geminiService';
import { getCurrentWIB } from './services/chatEngine';

export const App: React.FC = () => {
  // 1. Status Tampilan Navigasi: 'landing' (Beranda RS) atau 'chatbot' (AI Assistant)
  const [currentView, setCurrentView] = useState<'landing' | 'chatbot'>('landing');

  // 2. Daftar Pesan Percakapan (Bersih dari awal, siap menerima tanya-jawab pasien)
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [apiKey, setApiKey] = useState<string>('');
  const [systemContext, setSystemContext] = useState<string>(DEFAULT_HOSPITAL_CONTEXT);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedDocumentText, setUploadedDocumentText] = useState<string>('');
  const [rememberKey, setRememberKey] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-flash-latest');

  // 3. Status Modal Panduan Penggunaan
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Hapus riwayat percakapan di playground
  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm('Hapus seluruh riwayat percakapan dengan Asisten AI?')) {
      setMessages([]);
    }
  };

  // Kirim pertanyaan ke Gemini AI
  const handleSendMessage = async (queryText: string) => {
    const timestamp = getCurrentWIB();

    // 1. Tambahkan Pesan Pasien/Pengguna
    const userMessage: ChatItem = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // 2. Panggil API Live Google Gemini (Kunci API & Konfigurasi otomatis dari ENV / Sistem)
    setIsLoading(true);

    try {
      const historyForAPI = updatedMessages.map((m) => ({
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
        />

        {/* Tombol Pengaturan (untuk akses upload PDF & API key) */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Pengaturan
        </button>

        {isSettingsOpen && (
          <div className="absolute inset-0 z-40 flex">
            <div className="flex-1 min-w-0 bg-black/30" onClick={() => setIsSettingsOpen(false)} />
            <div className="w-full max-w-md h-full">
              <SettingsPanel
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
                rememberKey={rememberKey}
                onToggleRememberKey={setRememberKey}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                systemContext={systemContext}
                onContextChange={setSystemContext}
                uploadedFileName={uploadedFileName}
                onFileUpload={(file, extractedText) => {
                  setUploadedFileName(file.name);
                  if (extractedText) {
                    setUploadedDocumentText((prev) => (prev ? prev + '\n\n' + extractedText : extractedText));
                  }
                }}
              />
            </div>
          </div>
        )}
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

    </div>
  );
};

export default App;
