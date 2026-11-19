import React, { useState } from 'react';
import { Settings, Eye, EyeOff, Lock, FileUp, ExternalLink } from 'lucide-react';
import { UmbrellaLogo } from './UmbrellaLogo';

interface SettingsPanelProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  rememberKey: boolean;
  onToggleRememberKey: (checked: boolean) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  systemContext: string;
  onContextChange: (ctx: string) => void;
  uploadedFileName: string | null;
  onFileUpload: (file: File) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  apiKey,
  onApiKeyChange,
  rememberKey,
  onToggleRememberKey,
  selectedModel,
  onModelChange,
  systemContext,
  onContextChange,
  uploadedFileName,
  onFileUpload,
}) => {
  const [showKey, setShowKey] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <aside className="w-full lg:w-[360px] xl:w-[390px] h-full flex flex-col bg-white border border-[#E2E8F0] rounded-2xl shadow-subtle overflow-hidden select-none text-left flex-shrink-0 font-sans">
      
      {/* Panel Header */}
      <div className="px-5 py-3.5 border-b border-[#F1F5F9] flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-slate-700" />
          <h2 className="font-semibold text-sm text-[#0F172A] tracking-tight">
            Pengaturan
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-400">Konfigurasi</span>
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        
        {/* 1. Transparansi Identitas Asisten AI */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E11D48] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <UmbrellaLogo size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-xs text-slate-900">
                  Umbrella AI Assistant
                </span>
                <span className="text-[10px] font-semibold text-[#BE123C] bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                  Layanan Resmi
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Customer Service AI Rumah Sakit
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2">
            Sistem ini beroperasi secara transparan sebagai <strong>Kecerdasan Buatan (AI)</strong> resmi untuk membantu pasien menanyakan jadwal dokter, ketersediaan kamar rawat inap, alur BPJS, dan admisi 24 jam.
          </p>
        </div>

        {/* 2. API KEY Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
              API KEY GEMINI
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-[#BE123C] hover:text-[#9F1239] hover:underline inline-flex items-center space-x-0.5"
            >
              <span>Dapatkan Key</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
            </a>
          </div>

          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Masukkan Gemini API Key Anda..."
              className="w-full text-xs font-mono py-2.5 pl-3 pr-24 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-rose-200 transition-all placeholder:font-sans placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 font-medium rounded hover:bg-slate-100 transition-colors flex items-center space-x-1"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showKey ? 'Sembunyikan' : 'Tampilkan'}</span>
            </button>
          </div>

          {/* Remember Checkbox */}
          <div className="flex items-center space-x-2 pt-0.5">
            <input
              type="checkbox"
              id="remember-key"
              checked={rememberKey}
              onChange={(e) => onToggleRememberKey(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#E11D48] accent-[#E11D48] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="remember-key" className="text-xs text-slate-600 cursor-pointer font-medium">
              Simpan API key di browser ini
            </label>
          </div>

          <p className="text-[11px] text-slate-400 flex items-center space-x-1.5 pt-0.5">
            <Lock className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span>API key dikirim langsung ke endpoint Google Gemini (tanpa server perantara).</span>
          </p>
        </div>

        {/* 3. MODEL Selector */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase block">
            MODEL
          </label>
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#E11D48] cursor-pointer"
            >
              <option value="gemini-flash-latest">
                gemini-flash-latest (Rekomendasi: Sangat Cepat & Cerdas)
              </option>
              <option value="gemini-1.5-flash">
                gemini-1.5-flash (Standar Produksi Efisien)
              </option>
              <option value="gemini-1.5-pro">
                gemini-1.5-pro (Penalaran Klinis Mendalam)
              </option>
              <option value="gemini-2.0-flash">
                gemini-2.0-flash (Generasi Terbaru)
              </option>
            </select>
          </div>
        </div>

        {/* 4. KONTEKS BASIS PENGETAHUAN */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
              KONTEKS BASIS PENGETAHUAN
            </label>
            <span className="text-[10.5px] text-slate-400 font-normal">Markdown didukung</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Tuliskan info operasional RS: jadwal dokter, kamar rawat inap, aturan BPJS, tarif, dan panduan IGD.
          </p>
          <textarea
            rows={7}
            value={systemContext}
            onChange={(e) => onContextChange(e.target.value)}
            placeholder="Tuliskan konteks data operasional rumah sakit di sini..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-sans leading-relaxed focus:outline-none focus:border-[#E11D48] resize-y min-h-[140px]"
          />
        </div>

        {/* 5. DOKUMEN BASIS PENGETAHUAN (Opsional) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase block">
            DOKUMEN BASIS PENGETAHUAN
          </label>
          <p className="text-[11px] text-slate-500 leading-tight">
            Lampirkan SOP atau katalog tarif (.txt, .md, .pdf). Teks dokumen diproses lokal di browser dan disertakan ke konteks AI.
          </p>
          
          <div className="pt-1 flex items-center space-x-2">
            <label className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700 transition-colors shadow-subtle flex-shrink-0">
              <FileUp className="w-3.5 h-3.5 text-slate-400" />
              <span>Pilih Berkas</span>
              <input
                type="file"
                accept=".txt,.pdf,.md,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <span className="text-xs text-slate-400 truncate max-w-[200px]">
              {uploadedFileName || 'Belum ada berkas dipilih'}
            </span>
          </div>
        </div>

        {/* 6. Indikator Status Konteks */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left text-xs">
          <div className="flex items-center space-x-2 font-semibold text-slate-800 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Konteks Aktif Terhubung</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {uploadedFileName
              ? `Berkas [${uploadedFileName}] telah digabungkan ke dalam basis pengetahuan AI.`
              : 'Asisten AI saat ini mengacu pada panduan resmi internal RS PT Umbrella Corp.'}
          </p>
        </div>

      </div>

    </aside>
  );
};
