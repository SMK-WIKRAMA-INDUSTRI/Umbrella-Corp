# PT Umbrella Corp - Umbrella Healthcare Portal & AI Assistant

<<<<<<< HEAD
### List Fitur & Kontributor:
=======
Portal Layanan Terpadu Rumah Sakit PT Umbrella Corp dilengkapi Asisten AI Medis Cerdas, Ketersediaan Kamar Rawat Inap VIP, Pendaftaran Poliklinik Spesialis, dan Alur Gawat Darurat IGD 24 Jam.

---

## 👥 Tim Pengembang & Kontributor
>>>>>>> e8f02a7b9d47d07eb7eefbc0619904ac8856718b
- **Front End:** Dimas Iqbal
- **Backend Security & Architecture:** Ihsan
- **Fix Copas Output & UI Polish:** Dyza
- **Respon AI & Text-to-Speech:** Prasgos, Hifzhi
<<<<<<< HEAD
=======
- **Speech-to-Text (STT) Deepgram Integration:** Ahmad Rhezki Prasetya & Umbrella AI Team
>>>>>>> e8f02a7b9d47d07eb7eefbc0619904ac8856718b

---

## 🛡️ Arsitektur Keamanan & Performa (Backend Security by Ihsan)
Proyek ini telah diperkuat dengan arsitektur berstandar industri:
1. **Zero Client-Side Secret Leakage:** Kunci API DeepSeek/OpenRouter dipindahkan seluruhnya ke sisi server (`server.js`). Peramban klien tidak pernah memegang atau membocorkan kredensial rahasia.
2. **Sliding Window Rate Limiter:** Pembatasan 20 request/menit per IP untuk mencegah *Denial of Service* dan *Denial of Wallet* (pengurasan saldo API oleh bot).
3. **Instant Knowledge Caching:** Pertanyaan rutin (Tarif Kamar VIP, Hotline IGD, Syarat BPJS) dijawab langsung dari cache memori server (<10ms) tanpa memakan kuota LLM atau menyebabkan *server lag*.
4. **Optimasi Aset WebP:** Seluruh aset gambar dikonversi ke WebP, memangkas ukuran dari 1,7 MB menjadi 114 KB (efisiensi transfer data >93%).
5. **Memory-Safe Animations:** Mengendalikan event kursor AnimeJS dengan mekanisme *throttle* untuk mencegah lonjakan CPU dan *memory leak*.

---

## 🚀 Cara Menjalankan Proyek

### 1. Salin Pengaturan Lingkungan
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi kunci API Anda di dalam file `.env` (disimpan aman di server):
```env
PORT=5000
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
<<<<<<< HEAD
=======
DEEPGRAM_API_KEY=your_deepgram_api_key_here
>>>>>>> e8f02a7b9d47d07eb7eefbc0619904ac8856718b
```

### 2. Mode Pengembangan (Development)
Jalankan backend proxy dan frontend dev server secara bersamaan:

**Terminal 1 (Backend Server):**
```bash
npm run server
```
*Server aktif di `http://localhost:5000`*

**Terminal 2 (Frontend Vite):**
```bash
npm run dev
```
*Aplikasi web aktif di `http://localhost:3000` (terhubung otomatis ke proxy backend)*

### 3. Mode Produksi (Single Command Fullstack)
Build frontend statis dan jalankan server produksi terpadu:
```bash
npm run build
npm start
```
*Aplikasi siap di-publish dan diakses di `http://localhost:5000`*
