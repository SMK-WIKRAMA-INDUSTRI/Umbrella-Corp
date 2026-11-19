import { Doctor, RoomBed, InsurancePartner, LabRadiologyTest } from '../types';

export const HOSPITAL_METADATA = {
  name: 'PT Umbrella Corp',
  facilityName: 'Umbrella Care & Advanced Diagnostic Center',
  tagline: 'Precision Healthcare & Clinical Modernist Center',
  address: '88 Rasuna Medical Parkway, Jakarta 12940',
  emergencyPhone: '+62 21 8065 9911',
  nationalEmergency: '119',
  ambulanceDirect: '+62 21 8065 9999',
  callCenter: '+62 21 8065 0000',
  whatsappCare: '+62 811 9876 0099',
  accreditation: 'JCI International Accredited & 5-Star Hospital Standards',
  operatingHoursER: '24/7 Continuous Operation',
  operatingHoursClinics: 'Monday - Saturday: 08:00 - 21:00 WIB',
  operatingHoursIGD: '24/7 Continuous Operation',
  operatingHoursPoli: 'Monday - Saturday: 08:00 - 21:00 WIB',
};

export const CLINIC_SPECIALTIES = [
  'Penyakit Dalam (Internis)',
  'Kesehatan Anak (Pediatri)',
  'Kebidanan & Kandungan (Obgyn)',
  'Bedah Umum & Digestif',
  'Jantung & Pembuluh Darah (Kardiologi)',
  'Saraf (Neurologi)',
  'Mata (Oftalmologi)',
  'THT-KL (Telinga Hidung Tenggorok)',
  'Paru & Pernapasan (Pulmonologi)',
  'Ortopedi & Traumatologi',
  'Kulit & Kelamin (Dermatologi)',
  'Kesehatan Jiwa (Psikiatri)',
  'Gigi & Mulut / Bedah Mulut',
  'Radiologi & Imaging Intervensi',
  'Patologi Klinik & Laboratorium',
  'Rehabilitasi Medik & Fisioterapi',
  'Anestesiologi & Terapi Intensif'
];

export const INITIAL_BEDS: RoomBed[] = [
  {
    id: 'bed-vvip-aster',
    pavilion: 'Paviliun Aster (Lantai 5)',
    roomClass: 'VVIP',
    totalBeds: 6,
    occupiedBeds: 4,
    availableBeds: 2,
    cleaningBeds: 0,
    pricePerNight: 2850000,
    priceFormatted: 'Rp 2.850.000 / malam',
    facilities: [
      '1 Bed Elektrik Hill-Rom dengan Remote Tangan',
      'Kamar Mandi Dalam dengan Pemanas Air & Bathtub',
      'Ruang Tamu Keluarga Terpisah + Sofa Bed Premium',
      'Smart TV 55 Inch 4K + Netflix Medis',
      'Kulkas 2 Pintu, Microwave & Electric Kettle',
      'Menu Nutrisi Gourmet Pilihan Chef RS (3x Makan + 2x Snack)',
      'Free Parking VIP & Butler Care Service 24 Jam'
    ],
    visitorRules: 'Jam besuk fleksibel 09:00 - 21:00 WIB, maksimal 3 penunggu di kamar.',
    liveStatus: 'Tersedia'
  },
  {
    id: 'bed-vip-aster-melati',
    pavilion: 'Paviliun Aster & Paviliun Melati',
    roomClass: 'VIP',
    totalBeds: 18,
    occupiedBeds: 12,
    availableBeds: 6, // 4 di Aster & 2 di Melati as in screenshot!
    cleaningBeds: 0,
    pricePerNight: 1650000,
    priceFormatted: 'Rp 1.650.000 / malam',
    facilities: [
      '1 Bed Pasien Elektrik Parametric',
      'Kamar Mandi Dalam dengan Air Panas/Dingin',
      'Sofa Bed untuk 1 Orang Penunggu Pasien',
      'Smart TV 43 Inch LED',
      'Kulkas 1 Pintu & Lemari Pakaian Medis',
      'AC Split Individual + Air Purifier HEPA H13',
      'Jatah Makan Penunggu 1x Sehari'
    ],
    visitorRules: 'Jam besuk: Siang 11.00 - 13.00 WIB & Sore 17.00 - 19.30 WIB. Maks 2 orang bergantian.',
    liveStatus: 'Tersedia'
  },
  {
    id: 'bed-kelas1-cempaka',
    pavilion: 'Paviliun Cempaka (Lantai 3)',
    roomClass: 'Kelas 1',
    totalBeds: 24,
    occupiedBeds: 18,
    availableBeds: 5,
    cleaningBeds: 1,
    pricePerNight: 850000,
    priceFormatted: 'Rp 850.000 / malam (Ditanggung Penuh BPJS Kelas 1)',
    facilities: [
      'Kapasitas 2 Pasien per Kamar (Tirai Sekat Privasi Anti-Bakteri)',
      'Kamar Mandi Dalam',
      'Kursi Tunggu Recliner per Pasien',
      'TV Bersama 43 Inch',
      'AC Sentral RS',
      'Overbed Table & Lemari Penyimpanan'
    ],
    visitorRules: 'Jam besuk: Siang 11.00 - 13.00 & Sore 17.00 - 19.00 WIB. Maks 1 penunggu malam.',
    liveStatus: 'Tersedia'
  },
  {
    id: 'bed-kelas2-cempaka',
    pavilion: 'Paviliun Cempaka (Lantai 2)',
    roomClass: 'Kelas 2',
    totalBeds: 32,
    occupiedBeds: 28,
    availableBeds: 3,
    cleaningBeds: 1,
    pricePerNight: 550000,
    priceFormatted: 'Rp 550.000 / malam (Ditanggung BPJS Kelas 2)',
    facilities: [
      'Kapasitas 3 Pasien per Kamar',
      'Kamar Mandi Dalam',
      'Kursi Tunggu Pasien',
      'AC Ruangan',
      'Overbed Table'
    ],
    visitorRules: 'Sesuai regulasi rawat inap umum. 1 penunggu terdaftar kartu jaga.',
    liveStatus: 'Terbatas'
  },
  {
    id: 'bed-kelas3-cempaka',
    pavilion: 'Paviliun Cempaka (Lantai 1)',
    roomClass: 'Kelas 3',
    totalBeds: 40,
    occupiedBeds: 38,
    availableBeds: 2,
    cleaningBeds: 0,
    pricePerNight: 350000,
    priceFormatted: 'Rp 350.000 / malam (Ditanggung Penuh BPJS PBI & Non-PBI)',
    facilities: [
      'Kapasitas 4-5 Pasien per Kamar (Sesuai Standar KRIS BPJS Kemenkes)',
      'Kamar Mandi Dalam Khusus Kamar',
      'Exhaust & Sirkulasi Udara Standar Kemenkes',
      'Overbed Cabinet'
    ],
    visitorRules: 'Jam besuk siang & sore teratur. 1 penunggu resmi.',
    liveStatus: 'Terbatas'
  },
  {
    id: 'bed-icu',
    pavilion: 'Unit Perawatan Intensif (Lantai 2 Gedung Utama)',
    roomClass: 'ICU',
    totalBeds: 12,
    occupiedBeds: 10,
    availableBeds: 2,
    cleaningBeds: 0,
    pricePerNight: 3200000,
    priceFormatted: 'Rp 3.200.000 / malam (BPJS Tercover dg Indikasi Medis DPJP)',
    facilities: [
      'Ventilator Mekanik Hamilton C6 / Dräger Evita',
      'Central Patient Monitor 12-Lead + Invasive Arterial Line',
      'Syringe & Infusion Pump Digital Terintegrasi',
      'Perawat Rasio 1:1 Khusus Pasien Kritis',
      'Kesiapan Dokter Spesialis Anestesi Konsultan Intensive Care (KIC) 24/7'
    ],
    visitorRules: 'Ruang steril ketat. Kunjungan keluarga hanya 1 orang bergantian (11:00-12:00 & 17:00-18:00 WIB). Baju hazmat/apron steril disediakan.',
    liveStatus: 'Terbatas'
  },
  {
    id: 'bed-nicu-picu',
    pavilion: 'Pusat Perawatan Intensif Bayi & Anak (Lantai 2)',
    roomClass: 'NICU',
    totalBeds: 8,
    occupiedBeds: 7,
    availableBeds: 1,
    cleaningBeds: 0,
    pricePerNight: 2900000,
    priceFormatted: 'Rp 2.900.000 / malam',
    facilities: [
      'Inkubator Bayi Giraffe Omnibed Carestation',
      'Ventilator Neonatal Frekuensi Tinggi (HFOV)',
      'Lampu Fototerapi Double Surface LED',
      'Laktasi Corner & Suport ASI Steril'
    ],
    visitorRules: 'Khusus orang tua kandung terdaftar. Sterilisasi tangan ketat.',
    liveStatus: 'Terbatas'
  },
  {
    id: 'bed-isolasi',
    pavilion: 'Gedung Karantina Tekanan Negatif (Wing Krisan)',
    roomClass: 'Isolasi Tekanan Negatif',
    totalBeds: 10,
    occupiedBeds: 6,
    availableBeds: 4,
    cleaningBeds: 0,
    pricePerNight: 2100000,
    priceFormatted: 'Rp 2.100.000 / malam',
    facilities: [
      'Sistem Aliran Udara Bertekanan Negatif Teruji -15 Pa',
      'Filter Udara HEPA Ultra Clean Filtration',
      'Anteroom Interlock Bersegel Kedap Udara',
      'CCTV Monitoring & Sistem Interkom 2 Arah Pasien-Perawat'
    ],
    visitorRules: 'Pengunjung umum dilarang masuk. Komunikasi tatap muka melalui jendela kaca observasi interkom.',
    liveStatus: 'Tersedia'
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-001',
    name: 'dr. Budi Santoso, Sp.PD, K-HOM',
    title: 'Spesialis Penyakit Dalam (Konsultan Hematologi & Onkologi Medik)',
    specialty: 'Penyakit Dalam (Internis)',
    subSpecialty: 'Hematologi Onkologi Medik & Imunologi',
    sip: 'SIP.446/1829/DINKES/2022',
    almamater: 'FK Universitas Indonesia / Fellowship National Cancer Center Tokyo',
    days: ['Senin', 'Rabu', 'Jumat'],
    hours: '09:00 - 13:00 WIB',
    room: 'Poli Internis Ruang 201',
    floor: 'Lantai 2 Gedung Poliklinik',
    status: 'active',
    quotaAvailable: 7,
    quotaTotal: 25,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    rating: 4.9,
    acceptsBPJS: true,
    acceptsPrivateInsurance: true
  },
  {
    id: 'doc-002',
    name: 'dr. Rina Puspita, Sp.A(K), M.Biomed',
    title: 'Spesialis Anak (Konsultan Tumbuh Kembang & Pediatri Sosial)',
    specialty: 'Kesehatan Anak (Pediatri)',
    subSpecialty: 'Tumbuh Kembang Bayi & Anak, Alergi Pediatri',
    sip: 'SIP.446/2041/DINKES/2021',
    almamater: 'FK Universitas Gadjah Mada (UGM)',
    days: ['Senin', 'Selasa', 'Kamis', 'Sabtu'],
    hours: '15:00 - 19:30 WIB',
    room: 'Poli Anak Ramah Anak Ruang 105',
    floor: 'Lantai 1 Gedung Poliklinik',
    status: 'active',
    quotaAvailable: 11,
    quotaTotal: 30,
    avatarUrl: 'https://images.unsplash.com/photo-1594824813583-162299710325?w=300&auto=format&fit=crop&q=80',
    rating: 5.0,
    acceptsBPJS: true,
    acceptsPrivateInsurance: true
  },
  {
    id: 'doc-003',
    name: 'dr. Andi Kurniawan, Sp.JP(K), FIHA',
    title: 'Spesialis Jantung & Pembuluh Darah (Intervensi Kardiovaskular)',
    specialty: 'Jantung & Pembuluh Darah (Kardiologi)',
    subSpecialty: 'Katerisasi Jantung, Angioplasti, Pasang Ring',
    sip: 'SIP.446/3310/DINKES/2020',
    almamater: 'FK Universitas Airlangga / Cath Lab Fellow Seoul',
    days: ['Selasa', 'Kamis', 'Jumat'],
    hours: '16:00 - 20:30 WIB',
    room: 'Pusat Kardiovaskular Terpadu R. 302',
    floor: 'Lantai 3 Gedung Diagnostik',
    status: 'on-leave',
    substituteDoctor: 'dr. Ratna Dewi, Sp.JP, FIHA',
    substituteHours: '16:00 - 20:30 WIB (Poli Jantung R. 302)',
    quotaAvailable: 4,
    quotaTotal: 20,
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    rating: 4.8,
    acceptsBPJS: true,
    acceptsPrivateInsurance: true
  },
  {
    id: 'doc-004',
    name: 'dr. Ratna Dewi, Sp.JP, FIHA',
    title: 'Spesialis Jantung & Pembuluh Darah',
    specialty: 'Jantung & Pembuluh Darah (Kardiologi)',
    subSpecialty: 'Ekokardiografi & Rehabilitasi Jantung',
    sip: 'SIP.446/1109/DINKES/2023',
    almamater: 'FK Universitas Indonesia',
    days: ['Senin', 'Rabu', 'Sabtu'],
    hours: '08:30 - 12:30 WIB',
    room: 'Pusat Kardiovaskular Terpadu R. 301',
    floor: 'Lantai 3 Gedung Diagnostik',
    status: 'active',
    quotaAvailable: 14,
    quotaTotal: 25,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
    rating: 4.9,
    acceptsBPJS: true,
    acceptsPrivateInsurance: true
  },
  {
    id: 'doc-005',
    name: 'dr. Farhan Malik, Sp.OG(K)-FER',
    title: 'Spesialis Obstetri & Ginekologi (Konsultan Fertilitas Endokrin Reproduksi)',
    specialty: 'Kebidanan & Kandungan (Obgyn)',
    subSpecialty: 'USG 4D Fetomaternal, Program Hamil & Bayi Tabung, Operasi Caesar ERACS',
    sip: 'SIP.446/5521/DINKES/2019',
    almamater: 'FK Universitas Padjadjaran (UNPAD)',
    days: ['Senin', 'Rabu', 'Kamis', 'Jumat'],
    hours: '13:00 - 17:00 WIB',
    room: 'Poli Kebidanan & Kandungan R. 210',
    floor: 'Lantai 2 Gedung Poliklinik',
    status: 'active',
    quotaAvailable: 8,
    quotaTotal: 25,
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
    rating: 4.95,
    acceptsBPJS: true,
    acceptsPrivateInsurance: true
  },
  {
    id: 'doc-006',
    name: 'dr. Hendra Wijaya, Sp.B, Subsp.BD(K)',
    title: 'Spesialis Bedah Digestif & Laparoskopi Minimal Invasif',
    specialty: 'Bedah Umum & Digestif',
    subSpecialty: 'Bedah Usus Buntu Laparoskopi, Batu Empedu, Hernia',
    sip: 'SIP.446/4011/DINKES/2020',
    almamater: 'FK Universitas Indonesia',
    days: ['Selasa', 'Kamis', 'Sabtu'],
    hours: '10:00 - 14:00 WIB',
    room: 'Poli Bedah Terpadu R. 205',
    floor: 'Lantai 2 Gedung Poliklinik',
    status: 'active',
    quotaAvailable: 9,
    quotaTotal: 20,
    avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
    rating: 4.85,
    acceptsBPJS: true,
    acceptsPrivateInsurance: true
  },
  {
    id: 'doc-007',
    name: 'dr. Jessica Vanesha, Sp.S, FICA',
    title: 'Spesialis Saraf (Neurologi)',
    specialty: 'Saraf (Neurologi)',
    subSpecialty: 'Manajemen Stroke Akut, Nyeri Kepala Kronis, Vertigo, Saraf Terjepit (HNP)',
    sip: 'SIP.446/7821/DINKES/2022',
    almamater: 'FK Universitas Diponegoro',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    hours: '08:30 - 12:30 WIB',
    room: 'Poli Neurologi R. 308',
    floor: 'Lantai 3 Gedung Poliklinik',
    status: 'active',
    quotaAvailable: 12,
    quotaTotal: 25,
    avatarUrl: 'https://images.unsplash.com/photo-1594824813583-162299710325?w=300&auto=format&fit=crop&q=80',
    rating: 4.9,
    acceptsBPJS: true,
    acceptsPrivateInsurance: true
  },
  {
    id: 'doc-008',
    name: 'dr. Nadia Saraswati, Sp.KK, FINSDV',
    title: 'Spesialis Dermatologi & Venereologi',
    specialty: 'Kulit & Kelamin (Dermatologi)',
    subSpecialty: 'Dermatitis Atopik, Jerawat Kronis, Laser Medis Kulit',
    sip: 'SIP.446/9012/DINKES/2023',
    almamater: 'FK Universitas Gadjah Mada',
    days: ['Senin', 'Rabu', 'Jumat'],
    hours: '14:00 - 18:00 WIB',
    room: 'Poli Kulit & Estetika Medis R. 112',
    floor: 'Lantai 1 Gedung Poliklinik',
    status: 'active',
    quotaAvailable: 15,
    quotaTotal: 30,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
    rating: 4.88,
    acceptsBPJS: true,
    acceptsPrivateInsurance: true
  }
];

export const INSURANCE_PARTNERS: InsurancePartner[] = [
  { name: 'BPJS Kesehatan', category: 'BPJS', coverageMethod: 'Surat Jaminan (GL)', hotline: '165', logoText: 'BPJS KES' },
  { name: 'AdMedika (TPA)', category: 'TPA', coverageMethod: 'Cashless', hotline: '021-500-111', logoText: 'ADMEDIKA' },
  { name: 'Prudential Indonesia (PRUmedical Network)', category: 'Asuransi Nasional', coverageMethod: 'Cashless', hotline: '1500085', logoText: 'PRUDENTIAL' },
  { name: 'Mandiri Inhealth', category: 'Asuransi Nasional', coverageMethod: 'Cashless', hotline: '14017', logoText: 'INHEALTH' },
  { name: 'Allianz Care Indonesia', category: 'Asuransi Internasional', coverageMethod: 'Cashless', hotline: '1500136', logoText: 'ALLIANZ' },
  { name: 'AIA Financial', category: 'Asuransi Internasional', coverageMethod: 'Cashless', hotline: '1500980', logoText: 'AIA' },
  { name: 'Manulife Indonesia', category: 'Asuransi Internasional', coverageMethod: 'Cashless', hotline: '021-2555-7777', logoText: 'MANULIFE' },
  { name: 'Sinarmas MSIG Life', category: 'Asuransi Nasional', coverageMethod: 'Cashless', hotline: '021-5060-9999', logoText: 'SINARMAS' },
  { name: 'Sequis Life', category: 'Asuransi Nasional', coverageMethod: 'Cashless', hotline: '021-2994-2999', logoText: 'SEQUIS' },
  { name: 'Astra Life', category: 'Asuransi Nasional', coverageMethod: 'Cashless', hotline: '1500-282', logoText: 'ASTRA LIFE' },
  { name: 'Generali Indonesia', category: 'Asuransi Internasional', coverageMethod: 'Cashless', hotline: '1500-037', logoText: 'GENERALI' },
  { name: 'FWD Insurance', category: 'Asuransi Internasional', coverageMethod: 'Cashless', hotline: '1500-393', logoText: 'FWD' }
];

export const LAB_RADIOLOGY_CATALOG: LabRadiologyTest[] = [
  {
    id: 'lab-01',
    code: 'LAB-DRH-01',
    category: 'Laboratorium Darah',
    name: 'Darah Lengkap Otomatis (CBC / Hematologi Lengkap)',
    fastingRequired: false,
    preparationNotes: 'Tidak perlu puasa. Dapat diambil sewaktu-waktu.',
    priceFormatted: 'Rp 145.000',
    slaHours: '1 - 2 Jam (Hasil Online di Portal)',
    bpjsCovered: true
  },
  {
    id: 'lab-02',
    code: 'LAB-KIM-02',
    category: 'Patologi Klinik',
    name: 'Profil Lipid Lengkap (Kolesterol Total, HDL, LDL, Trigliserida)',
    fastingRequired: true,
    fastingHours: 10,
    preparationNotes: 'Wajib puasa 10-12 jam sebelum pengambilan darah. Air putih tetap diperbolehkan.',
    priceFormatted: 'Rp 320.000',
    slaHours: '2 - 3 Jam',
    bpjsCovered: true
  },
  {
    id: 'lab-03',
    code: 'LAB-DM-03',
    category: 'Patologi Klinik',
    name: 'HbA1c & Glukosa Darah Puasa (Pemantauan Diabetes)',
    fastingRequired: true,
    fastingHours: 8,
    preparationNotes: 'Puasa 8 jam untuk glukosa puasa. HbA1c tidak dipengaruhi makanan.',
    priceFormatted: 'Rp 280.000',
    slaHours: '2 Jam',
    bpjsCovered: true
  },
  {
    id: 'rad-01',
    code: 'RAD-XRY-01',
    category: 'Radiologi',
    name: 'Rontgen Thorax PA / AP (Foto Rontgen Dada)',
    fastingRequired: false,
    preparationNotes: 'Lepas kalung, kancing logam, atau bra berkawat sebelum pemeriksaan.',
    priceFormatted: 'Rp 220.000',
    slaHours: '1 Jam (Ekspertise Spesialis Radiologi)',
    bpjsCovered: true
  },
  {
    id: 'rad-02',
    code: 'RAD-USG-02',
    category: 'USG',
    name: 'USG Kandungan 4D HD-Live Fetomaternal',
    fastingRequired: false,
    preparationNotes: 'Minum 2 gelas air 30 menit sebelum tindakan dan tahan buang air kecil agar kandung kemih terisi sedang.',
    priceFormatted: 'Rp 750.000',
    slaHours: 'Langsung setelah pemeriksaan (Termasuk Video 4D USB)',
    bpjsCovered: false
  },
  {
    id: 'rad-03',
    code: 'RAD-CT-03',
    category: 'CT-Scan',
    name: 'CT-Scan Kepala Non-Kontras (Multislice 128 Slices)',
    fastingRequired: false,
    preparationNotes: 'Pemeriksaan cepat 5-10 menit. Khusus evaluasi trauma/stroke akut IGD siaga 24 jam.',
    priceFormatted: 'Rp 1.450.000',
    slaHours: '2 Jam (Emergency < 30 menit)',
    bpjsCovered: true
  }
];

export const FAQ_BANK = [
  {
    id: 'faq-01',
    question: 'Bagaimana cara berobat menggunakan BPJS Kesehatan di RS Umbrella?',
    category: 'BPJS & Asuransi',
    answer: `Untuk berobat rawat jalan menggunakan BPJS Kesehatan, ikuti alur berjenjang resmi berikut:\n\n1. **Kunjungi Faskes Tingkat 1** (Puskesmas / Klinik Pratama terdaftar di kartu KIS Anda).\n2. Dapatkan **Surat Rujukan Online (PCare)** yang ditujukan ke poliklinik spesialis RS Umbrella Care.\n3. Masa berlaku surat rujukan adalah **90 hari** sejak tanggal penerbitan.\n4. Siapkan berkas: **KTP Asli / KIS Digital di Mobile JKN** dan nomor rujukan.\n5. Lakukan pendaftaran online melalui chatbot ini atau datang langsung ke Loket Admisi BPJS di Lantai 1.\n\n*Catatan Khusus Kedaruratan:* Pasien kondisi gawat darurat (mengancam nyawa) **TIDAK MEMERLUKAN SURAT RUJUKAN** dan dapat langsung menuju IGD RS Umbrella 24 Jam.`
  },
  {
    id: 'faq-02',
    question: 'Apa saja fasilitas kamar rawat inap VIP dan berapa tarifnya?',
    category: 'Kamar & Fasilitas',
    answer: `Kamar rawat inap **VIP Paviliun Aster & Paviliun Melati** memiliki tarif resmi **Rp 1.650.000 per malam** dengan fasilitas:\n• 1 Pasien 1 Kamar (Privasi penuh)\n• Bed pasien elektrik Hill-Rom dengan remote\n• Smart monitor pasien terhubung sentral perawat\n• Sofa bed untuk 1 penunggu pasien\n• Kamar mandi dalam dengan water heater\n• Smart TV 43 Inch, AC Split individual & HEPA Air Purifier\n• Kulkas & overbed table\n• Jatah makan penunggu 1x sehari\n\n*Saat ini tersedia 4 Bed di Paviliun Aster dan 2 Bed di Paviliun Melati.*`
  },
  {
    id: 'faq-03',
    question: 'Bagaimana prosedur penanganan pasien darurat di IGD RS Umbrella?',
    category: 'Darurat & Pengaduan',
    answer: `Instalasi Gawat Darurat (IGD) RS Umbrella beroperasi **24 Jam Non-Stop** dengan standar triase internasional:\n\n• **Triase Merah (Resusitasi/Gawat Darurat):** Penanganan tanpa antrean dalam < 0 detik oleh Tim Spesialis Emergensi (misal: henti jantung, sesak napas berat, cedera kepala parah, kejang aktif).\n• **Triase Kuning (Urgent):** Penanganan dalam waktu < 15 menit (misal: patah tulang tertutup, demam tinggi anak dg dehidrasi, nyeri perut hebat).\n• **Triase Hijau (Non-Urgent):** Penanganan stabil di ruang observasi.\n\nHotline Emergency IGD: **021-8065-9911** atau **119**. Layanan ambulans jemput darurat siap siaga.`
  },
  {
    id: 'faq-04',
    question: 'Bagaimana cara booking jadwal dokter spesialis anak?',
    category: 'Pelayanan Medis',
    answer: `Untuk dokter spesialis anak di RS Umbrella:\n• **dr. Rina Puspita, Sp.A(K), M.Biomed** praktik setiap **Senin, Selasa, Kamis, Sabtu** pukul **15:00 - 19:30 WIB** di Poli Anak Ramah Anak R. 105 Lantai 1.\n• Pendaftaran kuota antrean dapat dilakukan online maksimal H-1 pukul 21:00 WIB melalui bot ini atau datang langsung.\n• Menerima penjaminan BPJS Kesehatan dan seluruh asuransi swasta rekanan.`
  },
  {
    id: 'faq-05',
    question: 'Apakah RS Umbrella menerima asuransi Prudential, Admedika, dan Mandiri Inhealth?',
    category: 'BPJS & Asuransi',
    answer: `Ya, RS Umbrella Care bekerja sama secara resmi (*cashless guarantee*) dengan lebih dari 25 perusahaan asuransi nasional dan multinasional, termasuk **Prudential (PRUmedical Network Priority Desk), AdMedika, Mandiri Inhealth, Allianz, AIA, Manulife, Sinarmas MSIG, Astra Life, dan Sequis Life**.\n\nCukup tunjukkan kartu asuransi fisik atau e-card di Loket Pendaftaran Asuransi Swasta Lantai 1 untuk verifikasi eligibilitas instan.`
  },
  {
    id: 'faq-06',
    question: 'Apa syarat pemeriksaan laboratorium darah profil lipid dan gula puasa?',
    category: 'Biaya & Administrasi',
    answer: `Untuk pemeriksaan profil lipid (kolesterol) dan gula darah puasa:\n1. Pasien wajib berpuasa selama **10 hingga 12 jam** sebelum pengambilan darah (hanya diperbolehkan minum air putih tanpa rasa).\n2. Tidak merokok dan tidak mengonsumsi alkohol selama periode puasa.\n3. Obat rutin darah tinggi tetap dapat diminum dengan air putih sedikit kecuali ada instruksi lain dari dokter DPJP.\n4. Laboratorium buka 24 jam; untuk hasil optimal disarankan pengambilan sampel pukul 07:00 - 10:00 pagi.`
  }
];
