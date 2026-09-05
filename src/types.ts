// Database Sheets Type Definitions for LMS PJOK
// Exactly matching the 19 Google Spreadsheet structure

export type UserRole = 'ADMIN' | 'GURU' | 'MURID';

export type UserStatus = 'AKTIF' | 'NONAKTIF';

// 01_CONFIG
export interface ConfigItem {
  KEY: string;
  VALUE: string;
  DESCRIPTION: string;
}

// 02_USERS
export interface UserItem {
  USER_ID: string;
  USERNAME: string;
  PASSWORD_HASH: string;
  PASSWORD?: string;
  ROLE: UserRole;
  REF_ID: string;
  NAMA: string;
  STATUS: UserStatus;
  LAST_LOGIN: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

// 03_ADMIN
export interface AdminItem {
  ADMIN_ID: string;
  NAMA: string;
  USERNAME: string;
  EMAIL: string;
  NO_HP: string;
  STATUS: UserStatus;
}

// 04_GURU
export interface GuruItem {
  GURU_ID: string;
  NIP: string;
  NAMA_GURU: string;
  JENIS_KELAMIN: 'L' | 'P';
  EMAIL: string;
  NO_HP: string;
  MATA_PELAJARAN: string;
  STATUS: UserStatus;
}

// 05_MURID
export interface MuridItem {
  MURID_ID: string;
  NIS: string;
  NISN: string;
  NAMA_MURID: string;
  JENIS_KELAMIN: 'L' | 'P';
  KELAS_ID: string;
  NAMA_KELAS: string;
  TAHUN_PELAJARAN: string;
  USERNAME: string;
  STATUS: UserStatus;
}

// 06_KELAS
export interface KelasItem {
  KELAS_ID: string;
  TINGKAT: 'X' | 'XI' | 'XII';
  NAMA_KELAS: string;
  WALI_KELAS: string;
  GURU_ID: string;
  TAHUN_PELAJARAN: string;
  STATUS: UserStatus;
}

// 07_MAPEL
export interface MapelItem {
  MAPEL_ID: string;
  NAMA_MAPEL: string;
  FASE: string;
  TINGKAT: string;
  GURU_ID: string;
  TAHUN_PELAJARAN: string;
  SEMESTER: string;
  STATUS: UserStatus;
}

// 08_ATP
export interface ATPItem {
  ATP_ID: string;
  MAPEL_ID?: string;
  FASE: string;
  KELAS: string;
  ELEMEN: string;
  MATERI?: string;
  TUJUAN_PEMBELAJARAN: string;
  CAPAIAN_PEMBELAJARAN?: string;
  MEMAHAMI?: string;
  MENERAPKAN?: string;
  MEREFLEKSI?: string;
  INDIKATOR?: string;
  ALOKASI_WAKTU: string;
  SEMESTER: string;
  TAHUN_PELAJARAN?: string;
  GURU_ID?: string;
  STATUS?: UserStatus;
}
export type AtpItem = ATPItem;

// 09_MATERI
export interface MateriItem {
  MATERI_ID: string;
  JUDUL: string;
  MAPEL_ID?: string;
  FASE: string;
  KELAS: string;
  TOPIK: string;
  DESKRIPSI?: string;
  TUJUAN_PEMBELAJARAN: string;
  ISI_MATERI: string;
  VIDEO_URL?: string;
  PDF_URL?: string;
  GAMBAR_URL?: string;
  FILE_URL?: string;
  GURU_ID: string;
  NAMA_GURU?: string;
  TANGGAL: string;
  STATUS: 'PUBLIK' | 'DRAFT';
  ATP_ID?: string;
}

// 10_TUGAS
export interface TugasItem {
  TUGAS_ID: string;
  JUDUL?: string;
  JUDUL_TUGAS?: string;
  MATERI_ID: string;
  MAPEL_ID?: string;
  KELAS_ID: string;
  GURU_ID?: string;
  DESKRIPSI: string;
  INSTRUKSI?: string;
  TANGGAL_MULAI?: string;
  DEADLINE: string;
  FILE_URL?: string;
  NILAI_MAKSIMAL?: number;
  BOBOT?: number;
  STATUS: 'AKTIF' | 'SELESAI' | 'DRAFT';
}

// 11_PENGUMPULAN_TUGAS
export interface PengumpulanTugasItem {
  PENGUMPULAN_ID: string;
  TUGAS_ID: string;
  MURID_ID: string;
  NAMA_MURID: string;
  FILE_URL: string;
  JAWABAN: string;
  TANGGAL_KUMPUL: string;
  STATUS: 'DIKUMPULKAN' | 'DINILAI' | 'TERLAMBAT';
  NILAI: number | null;
  KOMENTAR_GURU: string;
  DINILAI_OLEH: string;
  TANGGAL_DINILAI: string;
}

// 12_QUIZ
export interface QuizItem {
  QUIZ_ID: string;
  JUDUL?: string;
  JUDUL_QUIZ?: string;
  MAPEL_ID?: string;
  MATERI_ID: string;
  KELAS_ID?: string;
  GURU_ID?: string;
  DESKRIPSI: string;
  JUMLAH_SOAL?: number;
  DURASI?: number; // in minutes
  DURASI_MENIT?: number;
  TANGGAL_MULAI?: string;
  DEADLINE?: string;
  KKM?: number;
  PASSING_GRADE?: number;
  ACAK_SOAL?: 'YA' | 'TIDAK';
  ACAK_JAWABAN?: 'YA' | 'TIDAK';
  STATUS: 'AKTIF' | 'SELESAI' | 'DRAFT';
}

// 13_SOAL
export type JenisSoal = 'PILIHAN_GANDA' | 'BENAR_SALAH' | 'ISIAN';

export interface SoalItem {
  SOAL_ID: string;
  QUIZ_ID: string;
  NOMOR: number;
  PERTANYAAN: string;
  OPSI_A: string;
  OPSI_B: string;
  OPSI_C: string;
  OPSI_D: string;
  OPSI_E: string;
  KUNCI: string;
  BOBOT: number;
  JENIS_SOAL: JenisSoal;
}
export type BankSoalItem = SoalItem;

export interface HasilQuizItem {
  HASIL_ID: string;
  QUIZ_ID: string;
  MURID_ID: string;
  NAMA_MURID: string;
  NILAI: number;
  JUMLAH_BENAR: number;
  JUMLAH_SALAH: number;
  TOTAL_SOAL: number;
  STATUS: string;
  WAKTU_SELESAI: string;
}

// 14_JAWABAN_QUIZ
export interface JawabanQuizItem {
  JAWABAN_ID: string;
  QUIZ_ID: string;
  SOAL_ID: string;
  MURID_ID: string;
  JAWABAN: string;
  BENAR_SALAH: 'BENAR' | 'SALAH';
  BOBOT: number;
  WAKTU_JAWAB: string;
}

// 15_PRESENSI
export type PresensiStatus = 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA' | 'TERLAMBAT';

export interface PresensiItem {
  PRESENSI_ID: string;
  TANGGAL: string;
  KELAS_ID: string;
  MURID_ID: string;
  NAMA_MURID: string;
  GURU_ID: string;
  STATUS: PresensiStatus;
  KETERANGAN: string;
  WAKTU: string;
}

// 16_PENILAIAN
export type JenisPenilaian =
  | 'DIAGNOSTIK'
  | 'FORMATIF'
  | 'SUMATIF'
  | 'PRAKTIK'
  | 'PENGETAHUAN'
  | 'KETERAMPILAN'
  | 'SIKAP';

export interface PenilaianItem {
  NILAI_ID: string;
  MURID_ID: string;
  NAMA_MURID: string;
  KELAS_ID: string;
  GURU_ID: string;
  MAPEL_ID: string;
  MATERI: string;
  JENIS_PENILAIAN: JenisPenilaian;
  ASPEK: string;
  NILAI: number;
  SKOR_MAKSIMAL: number;
  PREDIKAT: 'A' | 'B' | 'C' | 'D';
  KETERANGAN: string;
  TANGGAL: string;
  SEMESTER: string;
  TAHUN_PELAJARAN: string;
}

// 17_JURNAL
export interface JurnalItem {
  JURNAL_ID: string;
  TANGGAL: string;
  GURU_ID: string;
  NAMA_GURU?: string;
  KELAS_ID: string;
  JAM_KE?: string;
  MAPEL_ID: string;
  MATERI: string;
  TUJUAN: string;
  KEGIATAN: string;
  METODE: string;
  MEDIA: string;
  JUMLAH_HADIR: number;
  CATATAN: string;
  HAMBATAN?: string;
  SOLUSI?: string;
  REFLEKSI_GURU: string;
}
export type JurnalGuruItem = JurnalItem;

// 18_NOTIFIKASI
export interface NotifikasiItem {
  NOTIFIKASI_ID: string;
  USER_ID: string; // or 'ALL'
  ROLE: UserRole | 'ALL';
  JUDUL: string;
  PESAN: string;
  TIPE: 'INFO' | 'TUGAS' | 'QUIZ' | 'NILAI' | 'PERINGATAN';
  LINK: string;
  STATUS: 'DIBACA' | 'BELUM_DIBACA';
  TANGGAL: string;
}

// 19_LOG_AKTIVITAS
export interface LogAktivitasItem {
  LOG_ID: string;
  USER_ID: string;
  NAMA: string;
  ROLE: UserRole;
  AKTIVITAS: string;
  DETAIL: string;
  WAKTU: string;
}

// Application State Helper Interfaces
export interface AppDatabase {
  '01_CONFIG': ConfigItem[];
  '02_USERS': UserItem[];
  '03_ADMIN': AdminItem[];
  '04_GURU': GuruItem[];
  '05_MURID': MuridItem[];
  '06_KELAS': KelasItem[];
  '07_MAPEL': MapelItem[];
  '08_ATP': ATPItem[];
  '09_MATERI': MateriItem[];
  '10_TUGAS': TugasItem[];
  '11_PENGUMPULAN_TUGAS': PengumpulanTugasItem[];
  '12_QUIZ': QuizItem[];
  '13_SOAL': SoalItem[];
  '14_JAWABAN_QUIZ': JawabanQuizItem[];
  '15_PRESENSI': PresensiItem[];
  '16_PENILAIAN': PenilaianItem[];
  '17_JURNAL': JurnalItem[];
  '18_NOTIFIKASI': NotifikasiItem[];
  '19_LOG_AKTIVITAS': LogAktivitasItem[];
}

export interface SessionUser {
  user_id: string;
  username: string;
  role: UserRole;
  ref_id: string;
  nama: string;
  email?: string;
  kelas_id?: string;
  nama_kelas?: string;
  avatar?: string;
}

// PJOK Rubrics
export interface PJOKRubricAspect {
  id: string;
  nama: string;
  deskripsi: string;
  skor: number; // 1 to 4
}
