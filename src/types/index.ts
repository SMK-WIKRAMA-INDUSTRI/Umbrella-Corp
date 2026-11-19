export type SenderType = 'ai' | 'user' | 'system' | 'agent';

export interface ActionPill {
  id: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'crimson' | 'secondary' | 'danger';
  actionType: 'prompt' | 'modal' | 'link' | 'download' | 'call' | 'intake';
  payload?: string;
}

export interface BedAvailabilityDetail {
  pavilion: string;
  roomClass: string;
  availableBeds: number;
  totalBeds: number;
  facilities: string[];
  priceFormatted?: string;
}

export interface BedCardData {
  title: string;
  badge?: string;
  lastUpdated?: string;
  items: {
    label: string;
    description: string;
  }[];
}

export interface DoctorCardData {
  doctorName: string;
  specialty: string;
  sip: string;
  days: string[];
  hours: string;
  room: string;
  status: 'active' | 'on-leave' | 'substitute';
  substituteName?: string;
  substituteHours?: string;
  quotaAvailable: number;
  quotaTotal: number;
  image?: string;
}

export interface EmergencyCardData {
  severity: 'RED' | 'YELLOW' | 'GREEN';
  title: string;
  warningText: string;
  emergencyHotline: string;
  ambulanceHotline: string;
  recommendedAction: string;
}

export interface MessageCard {
  type: 'bed-status' | 'doctor-list' | 'emergency-alert' | 'intake-summary' | 'bpjs-flow' | 'lab-radiology' | 'queue-status';
  bedData?: BedCardData;
  doctorData?: DoctorCardData[];
  emergencyData?: EmergencyCardData;
  rawContent?: string;
}

export interface ChatMessage {
  id: string;
  sender: SenderType;
  senderName?: string;
  timestamp: string; // e.g. "10:41 WIB"
  statusText?: string; // e.g. "Terkirim"
  text: string;
  card?: MessageCard;
  actionPills?: ActionPill[];
  quickReplies?: ActionPill[];
  isError?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  subSpecialty?: string;
  sip: string;
  almamater: string;
  days: string[];
  hours: string;
  room: string;
  floor: string;
  status: 'active' | 'on-leave' | 'substitute';
  substituteDoctor?: string;
  substituteHours?: string;
  quotaAvailable: number;
  quotaTotal: number;
  avatarUrl: string;
  rating: number;
  acceptsBPJS: boolean;
  acceptsPrivateInsurance: boolean;
}

export interface RoomBed {
  id: string;
  pavilion: string;
  roomClass: 'VVIP' | 'VIP' | 'Kelas 1' | 'Kelas 2' | 'Kelas 3' | 'ICU' | 'NICU' | 'PICU' | 'HCU' | 'Isolasi Tekanan Negatif';
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  cleaningBeds: number;
  pricePerNight: number;
  priceFormatted: string;
  facilities: string[];
  visitorRules: string;
  liveStatus: 'Tersedia' | 'Terbatas' | 'Penuh';
}

export interface ClinicalIntakeForm {
  patientCategory: 'Dewasa' | 'Anak' | 'Lansia' | 'Ibu Hamil';
  chiefComplaint: string;
  symptomDuration: string;
  painScale: number; // 1-10
  drugAllergies: string;
  medicalHistory: string;
  targetSpecialty?: string;
}

export interface OutpatientAppointment {
  bookingCode: string;
  patientName: string;
  nik: string;
  mrn?: string;
  phone: string;
  doctorName: string;
  specialty: string;
  date: string;
  timeSlot: string;
  room: string;
  queueNumber: string;
  currentCallingQueue: string;
  insuranceType: 'BPJS' | 'Asuransi Swasta' | 'Umum/Mandiri';
  status: 'TERKONFIRMASI' | 'DALAM ANTREAN' | 'SELESAI';
}

export interface LabRadiologyTest {
  id: string;
  code: string;
  category: 'Laboratorium Darah' | 'Patologi Klinik' | 'Radiologi' | 'USG' | 'CT-Scan' | 'MRI';
  name: string;
  fastingRequired: boolean;
  fastingHours?: number;
  preparationNotes: string;
  priceFormatted: string;
  slaHours: string;
  bpjsCovered: boolean;
}

export interface InsurancePartner {
  name: string;
  category: 'BPJS' | 'Asuransi Nasional' | 'Asuransi Internasional' | 'TPA';
  coverageMethod: 'Cashless' | 'Reimbursement' | 'Surat Jaminan (GL)';
  hotline: string;
  logoText: string;
}
