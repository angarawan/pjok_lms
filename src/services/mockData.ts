import { AppDatabase } from '../types';

export const INITIAL_DATABASE: AppDatabase = {
  '01_CONFIG': [
    { KEY: 'NAMA_APLIKASI', VALUE: 'LMS PJOK', DESCRIPTION: 'Nama Sistem Pembelajaran' },
    { KEY: 'SUBJUDUL', VALUE: 'Learning Management System Pendidikan Jasmani, Olahraga, dan Kesehatan', DESCRIPTION: 'Subjudul Aplikasi' },
    { KEY: 'SLOGAN', VALUE: 'Belajar, Bergerak, Berkembang.', DESCRIPTION: 'Slogan Utama' },
    { KEY: 'NAMA_SEKOLAH', VALUE: 'SMA Negeri 1 Prestasi Bangsa', DESCRIPTION: 'Nama Sekolah Pengguna' },
    { KEY: 'TAHUN_PELAJARAN', VALUE: '2026/2027', DESCRIPTION: 'Tahun Ajaran Aktif' },
    { KEY: 'SEMESTER', VALUE: '1 (Ganjil)', DESCRIPTION: 'Semester Berjalan' },
    { KEY: 'KKM', VALUE: '75', DESCRIPTION: 'Kriteria Ketuntasan Minimal / KKTP' },
    { KEY: 'LOGO_URL', VALUE: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=128&auto=format&fit=crop&q=80', DESCRIPTION: 'URL Logo Sekolah' },
    { KEY: 'EMAIL_ADMIN', VALUE: 'admin.pjok@sekolah.sch.id', DESCRIPTION: 'Kontak Administrator' },
    { KEY: 'LINK_GOOGLE_DRIVE', VALUE: 'https://drive.google.com/drive/folders/lms-pjok-storage', DESCRIPTION: 'Direktori Folder Media Drive' },
    { KEY: 'GAS_WEBAPP_URL', VALUE: 'https://script.google.com/macros/s/AKfycbyeNRTs2sep0ac6gZbjJiJ7vD6XMkZOhMSS6Fz0UzmONGhFJGFw71JxYufNF29wtq6_jA/exec', DESCRIPTION: 'URL Deployment Google Apps Script Web App' }
  ],

  '02_USERS': [
    {
      USER_ID: 'USR001',
      USERNAME: 'admin',
      PASSWORD_HASH: 'admin123', // Demo plaintext/hash
      ROLE: 'ADMIN',
      REF_ID: 'ADM001',
      NAMA: 'Administrator PJOK',
      STATUS: 'AKTIF',
      LAST_LOGIN: '2026-09-04 08:30',
      CREATED_AT: '2026-07-01',
      UPDATED_AT: '2026-09-04'
    },
    {
      USER_ID: 'USR002',
      USERNAME: 'guru01',
      PASSWORD_HASH: 'guru123',
      ROLE: 'GURU',
      REF_ID: 'G001',
      NAMA: 'I Ketut Suardana, S.Pd., M.Fis.',
      STATUS: 'AKTIF',
      LAST_LOGIN: '2026-09-04 09:15',
      CREATED_AT: '2026-07-01',
      UPDATED_AT: '2026-09-04'
    },
    {
      USER_ID: 'USR003',
      USERNAME: 'guru02',
      PASSWORD_HASH: 'guru123',
      ROLE: 'GURU',
      REF_ID: 'G002',
      NAMA: 'Dra. Siti Rahmawati, M.Pd.',
      STATUS: 'AKTIF',
      LAST_LOGIN: '2026-09-03 14:20',
      CREATED_AT: '2026-07-01',
      UPDATED_AT: '2026-09-03'
    },
    {
      USER_ID: 'USR_I5123',
      USERNAME: 'i5123',
      PASSWORD_HASH: 'guru123',
      ROLE: 'GURU',
      REF_ID: 'G003',
      NAMA: 'Guru PJOK (i5123)',
      STATUS: 'AKTIF',
      LAST_LOGIN: '',
      CREATED_AT: '2026-07-01',
      UPDATED_AT: '2026-09-05'
    },
    {
      USER_ID: 'USR004',
      USERNAME: 'murid01',
      PASSWORD_HASH: 'murid123',
      ROLE: 'MURID',
      REF_ID: 'M001',
      NAMA: 'Andi Pratama',
      STATUS: 'AKTIF',
      LAST_LOGIN: '2026-09-04 10:00',
      CREATED_AT: '2026-07-10',
      UPDATED_AT: '2026-09-04'
    },
    {
      USER_ID: 'USR005',
      USERNAME: 'murid02',
      PASSWORD_HASH: 'murid123',
      ROLE: 'MURID',
      REF_ID: 'M002',
      NAMA: 'Budi Santoso',
      STATUS: 'AKTIF',
      LAST_LOGIN: '2026-09-03 16:45',
      CREATED_AT: '2026-07-10',
      UPDATED_AT: '2026-09-03'
    },
    {
      USER_ID: 'USR006',
      USERNAME: 'murid03',
      PASSWORD_HASH: 'murid123',
      ROLE: 'MURID',
      REF_ID: 'M003',
      NAMA: 'Citra Lestari',
      STATUS: 'AKTIF',
      LAST_LOGIN: '2026-09-02 11:10',
      CREATED_AT: '2026-07-10',
      UPDATED_AT: '2026-09-02'
    },
    {
      USER_ID: 'USR007',
      USERNAME: 'murid04',
      PASSWORD_HASH: 'murid123',
      ROLE: 'MURID',
      REF_ID: 'M004',
      NAMA: 'Dewi Anggraini',
      STATUS: 'AKTIF',
      LAST_LOGIN: '2026-09-04 07:30',
      CREATED_AT: '2026-07-10',
      UPDATED_AT: '2026-09-04'
    }
  ],

  '03_ADMIN': [
    {
      ADMIN_ID: 'ADM001',
      NAMA: 'Administrator PJOK',
      USERNAME: 'admin',
      EMAIL: 'admin.pjok@sekolah.sch.id',
      NO_HP: '081234567890',
      STATUS: 'AKTIF'
    }
  ],

  '04_GURU': [
    {
      GURU_ID: 'G001',
      NIP: '198205142008011005',
      NAMA_GURU: 'I Ketut Suardana, S.Pd., M.Fis.',
      JENIS_KELAMIN: 'L',
      EMAIL: 'ketut.suardana@guru.sma.belajar.id',
      NO_HP: '081298765432',
      MATA_PELAJARAN: 'Pendidikan Jasmani, Olahraga, dan Kesehatan',
      STATUS: 'AKTIF'
    },
    {
      GURU_ID: 'G002',
      NIP: '197911202005012007',
      NAMA_GURU: 'Dra. Siti Rahmawati, M.Pd.',
      JENIS_KELAMIN: 'P',
      EMAIL: 'siti.rahmawati@guru.sma.belajar.id',
      NO_HP: '081387654321',
      MATA_PELAJARAN: 'Pendidikan Jasmani, Olahraga, dan Kesehatan',
      STATUS: 'AKTIF'
    },
    {
      GURU_ID: 'G003',
      NIP: '198503152010011003',
      NAMA_GURU: 'Guru PJOK (i5123)',
      JENIS_KELAMIN: 'L',
      EMAIL: 'i5123@guru.sma.belajar.id',
      NO_HP: '081234567890',
      MATA_PELAJARAN: 'Pendidikan Jasmani, Olahraga, dan Kesehatan',
      STATUS: 'AKTIF'
    }
  ],

  '05_MURID': [
    {
      MURID_ID: 'M001',
      NIS: '10241',
      NISN: '0071234561',
      NAMA_MURID: 'Andi Pratama',
      JENIS_KELAMIN: 'L',
      KELAS_ID: 'XI-01',
      NAMA_KELAS: 'Kelas XI-01',
      TAHUN_PELAJARAN: '2026/2027',
      USERNAME: 'murid01',
      STATUS: 'AKTIF'
    },
    {
      MURID_ID: 'M002',
      NIS: '10242',
      NISN: '0071234562',
      NAMA_MURID: 'Budi Santoso',
      JENIS_KELAMIN: 'L',
      KELAS_ID: 'XI-01',
      NAMA_KELAS: 'Kelas XI-01',
      TAHUN_PELAJARAN: '2026/2027',
      USERNAME: 'murid02',
      STATUS: 'AKTIF'
    },
    {
      MURID_ID: 'M003',
      NIS: '10243',
      NISN: '0071234563',
      NAMA_MURID: 'Citra Lestari',
      JENIS_KELAMIN: 'P',
      KELAS_ID: 'XI-02',
      NAMA_KELAS: 'Kelas XI-02',
      TAHUN_PELAJARAN: '2026/2027',
      USERNAME: 'murid03',
      STATUS: 'AKTIF'
    },
    {
      MURID_ID: 'M004',
      NIS: '10244',
      NISN: '0081234564',
      NAMA_MURID: 'Dewi Anggraini',
      JENIS_KELAMIN: 'P',
      KELAS_ID: 'X-01',
      NAMA_KELAS: 'Kelas X-01',
      TAHUN_PELAJARAN: '2026/2027',
      USERNAME: 'murid04',
      STATUS: 'AKTIF'
    },
    {
      MURID_ID: 'M005',
      NIS: '10245',
      NISN: '0081234565',
      NAMA_MURID: 'Eka Prasetya',
      JENIS_KELAMIN: 'L',
      KELAS_ID: 'X-02',
      NAMA_KELAS: 'Kelas X-02',
      TAHUN_PELAJARAN: '2026/2027',
      USERNAME: 'murid05',
      STATUS: 'AKTIF'
    },
    {
      MURID_ID: 'M006',
      NIS: '10246',
      NISN: '0061234566',
      NAMA_MURID: 'Fajar Hidayat',
      JENIS_KELAMIN: 'L',
      KELAS_ID: 'XII-01',
      NAMA_KELAS: 'Kelas XII-01',
      TAHUN_PELAJARAN: '2026/2027',
      USERNAME: 'murid06',
      STATUS: 'AKTIF'
    }
  ],

  '06_KELAS': [
    { KELAS_ID: 'X-01', TINGKAT: 'X', NAMA_KELAS: 'Kelas X-01', WALI_KELAS: 'Dra. Siti Rahmawati, M.Pd.', GURU_ID: 'G002', TAHUN_PELAJARAN: '2026/2027', STATUS: 'AKTIF' },
    { KELAS_ID: 'X-02', TINGKAT: 'X', NAMA_KELAS: 'Kelas X-02', WALI_KELAS: 'Bambang Sudirman, S.Pd.', GURU_ID: 'G002', TAHUN_PELAJARAN: '2026/2027', STATUS: 'AKTIF' },
    { KELAS_ID: 'XI-01', TINGKAT: 'XI', NAMA_KELAS: 'Kelas XI-01', WALI_KELAS: 'I Ketut Suardana, S.Pd., M.Fis.', GURU_ID: 'G001', TAHUN_PELAJARAN: '2026/2027', STATUS: 'AKTIF' },
    { KELAS_ID: 'XI-02', TINGKAT: 'XI', NAMA_KELAS: 'Kelas XI-02', WALI_KELAS: 'Sri Mulyani, S.Pd.', GURU_ID: 'G001', TAHUN_PELAJARAN: '2026/2027', STATUS: 'AKTIF' },
    { KELAS_ID: 'XI-03', TINGKAT: 'XI', NAMA_KELAS: 'Kelas XI-03', WALI_KELAS: 'Agus Wijaya, M.Pd.', GURU_ID: 'G001', TAHUN_PELAJARAN: '2026/2027', STATUS: 'AKTIF' },
    { KELAS_ID: 'XI-04', TINGKAT: 'XI', NAMA_KELAS: 'Kelas XI-04', WALI_KELAS: 'Nurhayati, S.Si.', GURU_ID: 'G001', TAHUN_PELAJARAN: '2026/2027', STATUS: 'AKTIF' },
    { KELAS_ID: 'XI-05', TINGKAT: 'XI', NAMA_KELAS: 'Kelas XI-05', WALI_KELAS: 'Hendra Saputra, M.Kom.', GURU_ID: 'G001', TAHUN_PELAJARAN: '2026/2027', STATUS: 'AKTIF' },
    { KELAS_ID: 'XI-06', TINGKAT: 'XI', NAMA_KELAS: 'Kelas XI-06', WALI_KELAS: 'Dewi Sartika, S.Pd.', GURU_ID: 'G001', TAHUN_PELAJARAN: '2026/2027', STATUS: 'AKTIF' },
    { KELAS_ID: 'XI-07', TINGKAT: 'XI', NAMA_KELAS: 'Kelas XI-07', WALI_KELAS: 'Yusuf Maulana, M.Pd.', GURU_ID: 'G001', TAHUN_PELAJARAN: '2026/2027', STATUS: 'AKTIF' },
    { KELAS_ID: 'XII-01', TINGKAT: 'XII', NAMA_KELAS: 'Kelas XII-01', WALI_KELAS: 'Rahmat Santoso, S.Pd.', GURU_ID: 'G002', TAHUN_PELAJARAN: '2026/2027', STATUS: 'AKTIF' }
  ],

  '07_MAPEL': [
    {
      MAPEL_ID: 'PJOK-X',
      NAMA_MAPEL: 'PJOK Fase E (Kelas X)',
      FASE: 'Fase E',
      TINGKAT: 'Kelas X',
      GURU_ID: 'G002',
      TAHUN_PELAJARAN: '2026/2027',
      SEMESTER: '1 (Ganjil)',
      STATUS: 'AKTIF'
    },
    {
      MAPEL_ID: 'PJOK-XI',
      NAMA_MAPEL: 'PJOK Fase F (Kelas XI)',
      FASE: 'Fase F',
      TINGKAT: 'Kelas XI',
      GURU_ID: 'G001',
      TAHUN_PELAJARAN: '2026/2027',
      SEMESTER: '1 (Ganjil)',
      STATUS: 'AKTIF'
    },
    {
      MAPEL_ID: 'PJOK-XII',
      NAMA_MAPEL: 'PJOK Fase F (Kelas XII)',
      FASE: 'Fase F',
      TINGKAT: 'Kelas XII',
      GURU_ID: 'G001',
      TAHUN_PELAJARAN: '2026/2027',
      SEMESTER: '1 (Ganjil)',
      STATUS: 'AKTIF'
    }
  ],

  '08_ATP': [
    {
      ATP_ID: 'ATP001',
      MAPEL_ID: 'PJOK-XI',
      FASE: 'Fase F',
      KELAS: 'XI',
      ELEMEN: 'Keterampilan Gerak & Pengetahuan Gerak',
      MATERI: 'Permainan Bola Besar - Bola Voli',
      TUJUAN_PEMBELAJARAN: 'Peserta didik mampu merancang, mempraktikkan, dan mengevaluasi keterampilan gerak passing bawah, passing atas, dan servis dalam permainan bola voli secara terampil dan sportif.',
      MEMAHAMI: 'Peserta didik menganalisis fakta, konsep, dan prosedur gerak spesifik passing bawah dan passing atas bola voli.',
      MENERAPKAN: 'Peserta didik mempraktikkan rangkaian variasi pola passing dalam formasi permainan bola voli 6 lawan 6 dengan aturan modifikasi.',
      MEREFLEKSI: 'Peserta didik mengevaluasi efektivitas pola gerak kelompok, mengenali kelemahan koordinasi, dan menunjukkan sikap fair play.',
      INDIKATOR: '1. Menyebutkan posisi siku dan lutut saat passing. 2. Mempraktikkan akurasi passing ke target minimal 4 dari 5 bola. 3. Mengisi rubrik refleksi tim.',
      ALOKASI_WAKTU: '3 x 45 Menit (2 Pertemuan)',
      SEMESTER: '1',
      TAHUN_PELAJARAN: '2026/2027',
      GURU_ID: 'G001',
      STATUS: 'AKTIF'
    },
    {
      ATP_ID: 'ATP002',
      MAPEL_ID: 'PJOK-XI',
      FASE: 'Fase F',
      KELAS: 'XI',
      ELEMEN: 'Pemanfaatan Gerak',
      MATERI: 'Kebugaran Jasmani - Daya Tahan Jantung & Kekuatan Otot',
      TUJUAN_PEMBELAJARAN: 'Peserta didik mampu merancang program latihan sirkuit (circuit training) untuk meningkatkan kapasitas cardiorespiratory dan daya tahan otot.',
      MEMAHAMI: 'Mengidentifikasi denyut nadi istirahat, denyut nadi latihan (target heart rate), serta komponen kebugaran terkait kesehatan.',
      MENERAPKAN: 'Menjalankan 5 pos circuit training (push up, plank, shuttle run, jumping jacks, squat) dengan intensitas moderat-tinggi.',
      MEREFLEKSI: 'Mencatat perubahan heart rate pemulihan serta mengevaluasi disiplin diri dalam menjaga kesehatan organ vital.',
      INDIKATOR: '1. Mengukur heart rate secara akurat. 2. Menyelesaikan putaran sirkuit sesuai alokasi waktu. 3. Membuat portofolio data kebugaran pribadi.',
      ALOKASI_WAKTU: '3 x 45 Menit (3 Pertemuan)',
      SEMESTER: '1',
      TAHUN_PELAJARAN: '2026/2027',
      GURU_ID: 'G001',
      STATUS: 'AKTIF'
    },
    {
      ATP_ID: 'ATP003',
      MAPEL_ID: 'PJOK-X',
      FASE: 'Fase E',
      KELAS: 'X',
      ELEMEN: 'Keterampilan Gerak & Pengembangan Karakter',
      MATERI: 'Senam Lantai - Senam Ketangkasan Tanpa Alat',
      TUJUAN_PEMBELAJARAN: 'Peserta didik mampu menguasai teknik guling depan (forward roll) dan guling lenting dengan memperhatikan keselamatan dan kelenturan.',
      MEMAHAMI: 'Memahami biomekanika titik tumpu, pendaratan tengkuk, dan dorongan pinggul.',
      MENERAPKAN: 'Melakukan guling depan pada matras secara beruntun dengan transisi berdiri tegak.',
      MEREFLEKSI: 'Menghargai keberanian diri, mengatasi rasa takut, dan saling menjaga keselamatan rekan saat latihan.',
      INDIKATOR: '1. Posisi dagu merapat ke dada. 2. Kecepatan dan kelancaran gulingan. 3. Sikap akhir stabil tanpa terjatuh ke samping.',
      ALOKASI_WAKTU: '3 x 45 Menit (2 Pertemuan)',
      SEMESTER: '1',
      TAHUN_PELAJARAN: '2026/2027',
      GURU_ID: 'G002',
      STATUS: 'AKTIF'
    }
  ],

  '09_MATERI': [
    {
      MATERI_ID: 'MAT001',
      JUDUL: 'Teknik Dasar & Analisis Passing Bawah & Passing Atas Bola Voli',
      MAPEL_ID: 'PJOK-XI',
      FASE: 'Fase F',
      KELAS: 'XI-01',
      TOPIK: 'Permainan Bola Besar (Bola Voli)',
      DESKRIPSI: 'Panduan lengkap mengenai mekanika passing bawah (forearm pass) dan passing atas (overhead pass) dalam permainan bola voli modern.',
      TUJUAN_PEMBELAJARAN: 'Siswa dapat menganalisis dan mempraktikkan passing bawah dan passing atas bola voli dengan akurat serta bekerja sama dalam tim.',
      ISI_MATERI: `### 1. Pengantar Passing Bawah
Passing bawah (forearm pass) adalah fondasi utama pertahanan dan penerimaan servis dalam bola voli. Kunci keberhasilan terletak pada:
- Kaki dibuka selebar bahu, lutut ditekuk membentuk sudut sekitar 110-120 derajat (posisi siap / ready position).
- Lengan diluruskan ke depan bawah, kedua telapak tangan saling bertaut dengan ibu jari sejajar.
- Perkenaan bola harus berada tepat pada bagian proksimal pergelangan tangan (kira-kira 5-10 cm di atas pergelangan).
- Dorongan berasal dari perpanjangan sendi lutut dan pinggul, bukan mengayunkan lengan berlebihan melebihi tinggi dada.

### 2. Teknik Passing Atas
Passing atas digunakan untuk mengumpan bola ke penyerang (setter) atau mengembalikan bola lambung:
- Jari-jari tangan dibuka membentuk mangkuk (cangkir) tepat di atas kening.
- Perkenaan bola menggunakan ruas jari-jari (khususnya ibu jari, telunjuk, dan jari tengah), bukan telapak tangan.
- Ekstensi lengan dan tungkai secara serempak saat bola disentuh untuk menghasilkan lentingan halus.

### 3. Kesalahan Umum yang Harus Dihindari:
1. Menekuk siku saat perkenaan passing bawah.
2. Memukul bola dengan telapak tangan pada passing atas.
3. Kaki berdiri tegak kaku tanpa merendahkan pusat gravitasi tubuh.`,
      VIDEO_URL: 'https://www.youtube.com/watch?v=0kQ3m8L2Z1U',
      PDF_URL: 'https://drive.google.com/file/d/modul-bola-voli-xi/view',
      GAMBAR_URL: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=80',
      GURU_ID: 'G001',
      TANGGAL: '2026-08-25',
      STATUS: 'PUBLIK'
    },
    {
      MATERI_ID: 'MAT002',
      JUDUL: 'Pengukuran dan Peningkatan Kebugaran Jasmani (Circuit Training)',
      MAPEL_ID: 'PJOK-XI',
      FASE: 'Fase F',
      KELAS: 'XI-01',
      TOPIK: 'Kebugaran Jasmani Berkelanjutan',
      DESKRIPSI: 'Pemahaman denyut nadi istirahat, target heart rate, serta perancangan 5 pos sirkuit pelatihan mandiri.',
      TUJUAN_PEMBELAJARAN: 'Siswa dapat menghitung denyut nadi maksimal (MHR), denyut nadi latihan, dan menjalankan protokol circuit training secara aman.',
      ISI_MATERI: `### 1. Menghitung Target Denyut Nadi Latihan
- Rumus Denyut Nadi Maksimal (MHR) = 220 - Usia.
- Untuk usia 17 tahun: MHR = 220 - 17 = 203 bpm.
- Zona Latihan Aerobik Efektif: 65% - 85% dari MHR (132 - 172 denyutan per menit).

### 2. Protokol Pos Circuit Training:
- **Pos 1:** Push-Up (Kekuatan & Daya Tahan Otot Lengan & Dada) - 45 detik.
- **Pos 2:** Sit-Up / Crunch (Kekuatan Otot Inti Abdomen) - 45 detik.
- **Pos 3:** Shuttle Run 5 Meter (Kelincahan & Akselerasi) - 45 detik.
- **Pos 4:** Squat Jump / Bodyweight Squat (Daya Ledak Otot Tungkai) - 45 detik.
- **Pos 5:** Plank Statis (Stabilitas Inti Tubuh) - 45 detik.
- Istirahat antar pos: 20 detik. Ulangi sebanyak 2-3 putaran.`,
      VIDEO_URL: 'https://www.youtube.com/watch?v=yPLbH3u9nQ8',
      PDF_URL: 'https://drive.google.com/file/d/panduan-kebugaran-jasmani/view',
      GAMBAR_URL: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
      GURU_ID: 'G001',
      TANGGAL: '2026-08-30',
      STATUS: 'PUBLIK'
    },
    {
      MATERI_ID: 'MAT003',
      JUDUL: 'Pencegahan Cedera Olahraga & Pertolongan Pertama (R.I.C.E)',
      MAPEL_ID: 'PJOK-XI',
      FASE: 'Fase F',
      KELAS: 'XI-02',
      TOPIK: 'Kesehatan & Pertolongan Pertama',
      DESKRIPSI: 'Metode penanganan cepat kram otot, terkilir (sprain), dan memar saat aktivitas berolahraga dengan protokol R.I.C.E.',
      TUJUAN_PEMBELAJARAN: 'Peserta didik memahami konsep Rest, Ice, Compression, Elevation dalam penanganan cedera akut olahraga.',
      ISI_MATERI: `### Protokol R.I.C.E
1. **Rest (Istirahat):** Hentikan aktivitas segera untuk mencegah kerusakan jaringan lebih lanjut.
2. **Ice (Kompres Es):** Bungkus es dengan handuk tipis, tempelkan selama 15-20 menit setiap 2-3 jam untuk mengurangi inflamasi.
3. **Compression (Balut Tekan):** Balut dengan elastic bandage (jangan terlalu kencang hingga menghambat sirkulasi).
4. **Elevation (Elevasi):** Posisikan bagian yang cedera lebih tinggi dari posisi jantung untuk mengurangi pembengkakan.`,
      VIDEO_URL: 'https://www.youtube.com/watch?v=k4U8R9H7n1A',
      PDF_URL: 'https://drive.google.com/file/d/rice-protocol/view',
      GAMBAR_URL: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
      GURU_ID: 'G001',
      TANGGAL: '2026-09-01',
      STATUS: 'PUBLIK'
    }
  ],

  '10_TUGAS': [
    {
      TUGAS_ID: 'TUG001',
      JUDUL: 'Tugas Praktik Mandiri: Video Analisis Passing Bola Voli',
      JUDUL_TUGAS: 'Tugas Praktik Mandiri: Video Analisis Passing Bola Voli',
      MATERI_ID: 'MAT001',
      MAPEL_ID: 'PJOK-XI',
      KELAS_ID: 'XI-01',
      GURU_ID: 'G001',
      DESKRIPSI: 'Buat rekaman video singkat (1-2 menit) mempraktikkan passing bawah sebanyak 10 kali pantulan berturut-turut ke dinding atau berpasangan.',
      INSTRUKSI: `1. Awali dengan perkenalan nama dan kelas.
2. Rekam dari sudut samping 45 derajat agar postur lutut, punggung, dan ayunan lengan terlihat jelas.
3. Tunjukkan 10 kali passing bawah tanpa terjatuh.
4. Di akhir video, jelaskan 1 kendala koordinasi yang dirasakan dan bagaimana cara mengatasinya.
5. Unggah video ke Google Drive / YouTube (unlisted) dan cantumkan link URL jawaban di form ini.`,
      TANGGAL_MULAI: '2026-08-26',
      DEADLINE: '2026-09-10 23:59',
      FILE_URL: 'https://drive.google.com/rubrik-penilaian-passing-voli.pdf',
      NILAI_MAKSIMAL: 100,
      STATUS: 'AKTIF'
    },
    {
      TUGAS_ID: 'TUG002',
      JUDUL: 'Laporan Jurnal Latihan Mandiri Sirkuit Kebugaran (3 Hari)',
      JUDUL_TUGAS: 'Laporan Jurnal Latihan Mandiri Sirkuit Kebugaran (3 Hari)',
      MATERI_ID: 'MAT002',
      MAPEL_ID: 'PJOK-XI',
      KELAS_ID: 'XI-01',
      GURU_ID: 'G001',
      DESKRIPSI: 'Pengisian tabel heart rate sebelum, sesaat setelah latihan, dan 5 menit masa pemulihan selama 3 sesi circuit training.',
      INSTRUKSI: `Lakukan 3 sesi latihan selama 1 minggu (misal: Selasa, Kamis, Sabtu). Catat denyut nadi istirahat pagi hari, denyut nadi puncak saat sirkuit pos 5 selesai, serta denyut nadi 5 menit pendinginan. Buat kesimpulan perkembangan daya tahan Anda.`,
      TANGGAL_MULAI: '2026-08-31',
      DEADLINE: '2026-09-15 23:59',
      FILE_URL: 'https://drive.google.com/template-jurnal-kebugaran.docx',
      NILAI_MAKSIMAL: 100,
      STATUS: 'AKTIF'
    }
  ],

  '11_PENGUMPULAN_TUGAS': [
    {
      PENGUMPULAN_ID: 'KMP001',
      TUGAS_ID: 'TUG001',
      MURID_ID: 'M001',
      NAMA_MURID: 'Andi Pratama',
      FILE_URL: 'https://youtu.be/video-passing-andi-pratama',
      JAWABAN: 'Berikut tugas video passing bawah bola voli saya Pak. Saya melakukan 12 kali pantulan di lapangan RW. Kendala: Awalnya bola agak melenceng ke kiri karena posisi lengan kurang sejajar, setelah dirapatkan bola menjadi stabil.',
      TANGGAL_KUMPUL: '2026-09-02 14:35',
      STATUS: 'DINILAI',
      NILAI: 88,
      KOMENTAR_GURU: 'Gerakan lutut dan ayunan lengan sudah sangat baik dan terkontrol. Pertahankan konsistensi pandangan mata ke arah datangnya bola!',
      DINILAI_OLEH: 'G001',
      TANGGAL_DINILAI: '2026-09-03 10:15'
    },
    {
      PENGUMPULAN_ID: 'KMP002',
      TUGAS_ID: 'TUG001',
      MURID_ID: 'M002',
      NAMA_MURID: 'Budi Santoso',
      FILE_URL: 'https://drive.google.com/file/d/budi-passing-voli.mp4/view',
      JAWABAN: 'Selamat siang Pak Ketut, ini video rekaman passing bola voli saya bersama adik. Terima kasih.',
      TANGGAL_KUMPUL: '2026-09-03 19:20',
      STATUS: 'DIKUMPULKAN',
      NILAI: null,
      KOMENTAR_GURU: '',
      DINILAI_OLEH: '',
      TANGGAL_DINILAI: ''
    }
  ],

  '12_QUIZ': [
    {
      QUIZ_ID: 'QZ001',
      JUDUL: 'Penilaian Formatif Teori Permainan Bola Voli & Biomekanika Passing',
      MAPEL_ID: 'PJOK-XI',
      MATERI_ID: 'MAT001',
      KELAS_ID: 'XI-01',
      GURU_ID: 'G001',
      DESKRIPSI: 'Uji pemahaman aturan permainan bola voli FIVB, teknik passing, rotasi posisi, dan strategi penyerangan.',
      JUMLAH_SOAL: 5,
      DURASI: 15,
      TANGGAL_MULAI: '2026-08-28',
      DEADLINE: '2026-09-12 23:59',
      KKM: 75,
      ACAK_SOAL: 'YA',
      ACAK_JAWABAN: 'YA',
      STATUS: 'AKTIF'
    },
    {
      QUIZ_ID: 'QZ002',
      JUDUL: 'Quiz Pengetahuan Komponen Kebugaran Jasmani & Pencegahan Cedera',
      MAPEL_ID: 'PJOK-XI',
      MATERI_ID: 'MAT002',
      KELAS_ID: 'XI-01',
      GURU_ID: 'G001',
      DESKRIPSI: 'Pemahaman konsep Target Heart Rate, intensitas latihan, dan protokol R.I.C.E.',
      JUMLAH_SOAL: 4,
      DURASI: 15,
      TANGGAL_MULAI: '2026-09-01',
      DEADLINE: '2026-09-14 23:59',
      KKM: 75,
      ACAK_SOAL: 'YA',
      ACAK_JAWABAN: 'TIDAK',
      STATUS: 'AKTIF'
    }
  ],

  '13_SOAL': [
    {
      SOAL_ID: 'SOL001',
      QUIZ_ID: 'QZ001',
      NOMOR: 1,
      PERTANYAAN: 'Pada saat melakukan passing bawah dalam bola voli, perkenaan bola yang tepat pada lengan adalah pada bagian...',
      OPSI_A: 'Ujung telapak tangan dan jari-jari',
      OPSI_B: 'Kira-kira 5-10 cm di atas pergelangan tangan pada bagian lengan bawah yang datar',
      OPSI_C: 'Tepat pada sendi siku agar pantulan lebih kencang',
      OPSI_D: 'Pangkal bahu dekat leher',
      OPSI_E: 'Punggung tangan dengan jari-jari menggenggam',
      KUNCI: 'B',
      BOBOT: 20,
      JENIS_SOAL: 'PILIHAN_GANDA'
    },
    {
      SOAL_ID: 'SOL002',
      QUIZ_ID: 'QZ001',
      NOMOR: 2,
      PERTANYAAN: 'Sumber tenaga utama dalam mendorong bola pada passing bawah bola voli berasal dari...',
      OPSI_A: 'Ayunan lengan ke atas melewati batas kepala',
      OPSI_B: 'Sentakan pergelangan tangan saja',
      OPSI_C: 'Lenturan dan dorongan ekstensi lutut serta pinggul yang terkoordinasi',
      OPSI_D: 'Hentakan tumit ke tanah',
      OPSI_E: 'Kepala yang digerakkan ke depan',
      KUNCI: 'C',
      BOBOT: 20,
      JENIS_SOAL: 'PILIHAN_GANDA'
    },
    {
      SOAL_ID: 'SOL003',
      QUIZ_ID: 'QZ001',
      NOMOR: 3,
      PERTANYAAN: 'Dalam peraturan bola voli resmi (FIVB), berapa jumlah sentuhan maksimal bola oleh satu tim sebelum bola diseberangkan ke net (di luar sentuhan block)?',
      OPSI_A: '2 kali',
      OPSI_B: '3 kali',
      OPSI_C: '4 kali',
      OPSI_D: '5 kali',
      OPSI_E: 'Bebas selama bola tidak jatuh',
      KUNCI: 'B',
      BOBOT: 20,
      JENIS_SOAL: 'PILIHAN_GANDA'
    },
    {
      SOAL_ID: 'SOL004',
      QUIZ_ID: 'QZ001',
      NOMOR: 4,
      PERTANYAAN: 'Posisi jari-jari kedua tangan saat melakukan passing atas harus dirapatkan rapat dan kaku untuk menahan beban bola.',
      OPSI_A: 'BENAR',
      OPSI_B: 'SALAH',
      OPSI_C: '',
      OPSI_D: '',
      OPSI_E: '',
      KUNCI: 'SALAH',
      BOBOT: 20,
      JENIS_SOAL: 'BENAR_SALAH'
    },
    {
      SOAL_ID: 'SOL005',
      QUIZ_ID: 'QZ001',
      NOMOR: 5,
      PERTANYAAN: 'Sebutkan nama pemain dalam tim bola voli yang memiliki seragam berbeda dan khusus bertugas menerima servis serta pertahanan tanpa boleh melakukan smash atau servis!',
      OPSI_A: 'Setter / Tosser',
      OPSI_B: 'Libero',
      OPSI_C: 'Spiker / Smasher',
      OPSI_D: 'Universal Player',
      OPSI_E: 'Middle Blocker',
      KUNCI: 'B',
      BOBOT: 20,
      JENIS_SOAL: 'PILIHAN_GANDA'
    },
    // Quiz 2 questions
    {
      SOAL_ID: 'SOL006',
      QUIZ_ID: 'QZ002',
      NOMOR: 1,
      PERTANYAAN: 'Jika seorang siswa berusia 17 tahun, berapakah perkiraan Maximum Heart Rate (MHR) teoritisnya menggunakan rumus Astrand?',
      OPSI_A: '185 bpm',
      OPSI_B: '195 bpm',
      OPSI_C: '203 bpm',
      OPSI_D: '220 bpm',
      OPSI_E: '170 bpm',
      KUNCI: 'C',
      BOBOT: 25,
      JENIS_SOAL: 'PILIHAN_GANDA'
    },
    {
      SOAL_ID: 'SOL007',
      QUIZ_ID: 'QZ002',
      NOMOR: 2,
      PERTANYAAN: 'Pada metode pertolongan pertama cedera R.I.C.E, huruf "E" merupakan singkatan dari...',
      OPSI_A: 'Exercise (Olahraga lanjutan)',
      OPSI_B: 'Elevation (Meninggikan bagian cedera di atas level jantung)',
      OPSI_C: 'Extension (Meluruskan persendian sekuatnya)',
      OPSI_D: 'Emergency (Memanggil ambulans)',
      OPSI_E: 'Energy (Memberi asupan gula)',
      KUNCI: 'B',
      BOBOT: 25,
      JENIS_SOAL: 'PILIHAN_GANDA'
    },
    {
      SOAL_ID: 'SOL008',
      QUIZ_ID: 'QZ002',
      NOMOR: 3,
      PERTANYAAN: 'Bentuk latihan kelincahan (agility) yang paling efektif dalam circuit training adalah...',
      OPSI_A: 'Plank statis 60 detik',
      OPSI_B: 'Shuttle run (lari bolak-balik mengubah arah)',
      OPSI_C: 'Push up lambat',
      OPSI_D: 'Stretching statis',
      OPSI_E: 'Mengangkat dumbel di tempat',
      KUNCI: 'B',
      BOBOT: 25,
      JENIS_SOAL: 'PILIHAN_GANDA'
    },
    {
      SOAL_ID: 'SOL009',
      QUIZ_ID: 'QZ002',
      NOMOR: 4,
      PERTANYAAN: 'Kompres es pada pergelangan kaki yang terkilir (sprain) sebaiknya dilakukan dengan menempelkan es batu langsung tanpa pembungkus selama 1 jam penuh.',
      OPSI_A: 'BENAR',
      OPSI_B: 'SALAH',
      OPSI_C: '',
      OPSI_D: '',
      OPSI_E: '',
      KUNCI: 'SALAH',
      BOBOT: 25,
      JENIS_SOAL: 'BENAR_SALAH'
    }
  ],

  '14_JAWABAN_QUIZ': [
    {
      JAWABAN_ID: 'JWB001',
      QUIZ_ID: 'QZ001',
      SOAL_ID: 'SOL001',
      MURID_ID: 'M001',
      JAWABAN: 'B',
      BENAR_SALAH: 'BENAR',
      BOBOT: 20,
      WAKTU_JAWAB: '2026-08-29 10:05'
    },
    {
      JAWABAN_ID: 'JWB002',
      QUIZ_ID: 'QZ001',
      SOAL_ID: 'SOL002',
      MURID_ID: 'M001',
      JAWABAN: 'C',
      BENAR_SALAH: 'BENAR',
      BOBOT: 20,
      WAKTU_JAWAB: '2026-08-29 10:07'
    },
    {
      JAWABAN_ID: 'JWB003',
      QUIZ_ID: 'QZ001',
      SOAL_ID: 'SOL003',
      MURID_ID: 'M001',
      JAWABAN: 'B',
      BENAR_SALAH: 'BENAR',
      BOBOT: 20,
      WAKTU_JAWAB: '2026-08-29 10:09'
    },
    {
      JAWABAN_ID: 'JWB004',
      QUIZ_ID: 'QZ001',
      SOAL_ID: 'SOL004',
      MURID_ID: 'M001',
      JAWABAN: 'SALAH',
      BENAR_SALAH: 'BENAR',
      BOBOT: 20,
      WAKTU_JAWAB: '2026-08-29 10:11'
    },
    {
      JAWABAN_ID: 'JWB005',
      QUIZ_ID: 'QZ001',
      SOAL_ID: 'SOL005',
      MURID_ID: 'M001',
      JAWABAN: 'B',
      BENAR_SALAH: 'BENAR',
      BOBOT: 20,
      WAKTU_JAWAB: '2026-08-29 10:12'
    }
  ],

  '15_PRESENSI': [
    {
      PRESENSI_ID: 'PRS001',
      TANGGAL: '2026-09-01',
      KELAS_ID: 'XI-01',
      MURID_ID: 'M001',
      NAMA_MURID: 'Andi Pratama',
      GURU_ID: 'G001',
      STATUS: 'HADIR',
      KETERANGAN: 'Mengikuti praktik passing bola voli',
      WAKTU: '07:15'
    },
    {
      PRESENSI_ID: 'PRS002',
      TANGGAL: '2026-09-01',
      KELAS_ID: 'XI-01',
      MURID_ID: 'M002',
      NAMA_MURID: 'Budi Santoso',
      GURU_ID: 'G001',
      STATUS: 'HADIR',
      KETERANGAN: 'Hadir tepat waktu',
      WAKTU: '07:12'
    },
    {
      PRESENSI_ID: 'PRS003',
      TANGGAL: '2026-09-01',
      KELAS_ID: 'XI-02',
      MURID_ID: 'M003',
      NAMA_MURID: 'Citra Lestari',
      GURU_ID: 'G001',
      STATUS: 'HADIR',
      KETERANGAN: 'Hadir dengan seragam olahraga lengkap',
      WAKTU: '08:45'
    },
    {
      PRESENSI_ID: 'PRS004',
      TANGGAL: '2026-09-01',
      KELAS_ID: 'X-01',
      MURID_ID: 'M004',
      NAMA_MURID: 'Dewi Anggraini',
      GURU_ID: 'G002',
      STATUS: 'HADIR',
      KETERANGAN: 'Mengikuti senam lantai matras',
      WAKTU: '10:15'
    },
    {
      PRESENSI_ID: 'PRS005',
      TANGGAL: '2026-08-25',
      KELAS_ID: 'XI-01',
      MURID_ID: 'M001',
      NAMA_MURID: 'Andi Pratama',
      GURU_ID: 'G001',
      STATUS: 'HADIR',
      KETERANGAN: 'Hadir materi pengantar',
      WAKTU: '07:10'
    },
    {
      PRESENSI_ID: 'PRS006',
      TANGGAL: '2026-08-25',
      KELAS_ID: 'XI-01',
      MURID_ID: 'M002',
      NAMA_MURID: 'Budi Santoso',
      GURU_ID: 'G001',
      STATUS: 'IZIN',
      KETERANGAN: 'Dispensasi lomba pramuka sekolah',
      WAKTU: '07:00'
    }
  ],

  '16_PENILAIAN': [
    {
      NILAI_ID: 'NIL001',
      MURID_ID: 'M001',
      NAMA_MURID: 'Andi Pratama',
      KELAS_ID: 'XI-01',
      GURU_ID: 'G001',
      MAPEL_ID: 'PJOK-XI',
      MATERI: 'Bola Voli - Passing Bawah',
      JENIS_PENILAIAN: 'PRAKTIK',
      ASPEK: 'Teknik Gerakan & Akurasi Lengan',
      NILAI: 90,
      SKOR_MAKSIMAL: 100,
      PREDIKAT: 'A',
      KETERANGAN: 'Sangat terampil, konsistensi posisi lutut dan kontak bola sangat akurat.',
      TANGGAL: '2026-09-01',
      SEMESTER: '1',
      TAHUN_PELAJARAN: '2026/2027'
    },
    {
      NILAI_ID: 'NIL002',
      MURID_ID: 'M001',
      NAMA_MURID: 'Andi Pratama',
      KELAS_ID: 'XI-01',
      GURU_ID: 'G001',
      MAPEL_ID: 'PJOK-XI',
      MATERI: 'Quiz Teori Bola Voli',
      JENIS_PENILAIAN: 'PENGETAHUAN',
      ASPEK: 'Kognitif FIVB Rules & Biomekanika',
      NILAI: 100,
      SKOR_MAKSIMAL: 100,
      PREDIKAT: 'A',
      KETERANGAN: 'Menjawab 5 dari 5 soal quiz dengan benar.',
      TANGGAL: '2026-08-29',
      SEMESTER: '1',
      TAHUN_PELAJARAN: '2026/2027'
    },
    {
      NILAI_ID: 'NIL003',
      MURID_ID: 'M001',
      NAMA_MURID: 'Andi Pratama',
      KELAS_ID: 'XI-01',
      GURU_ID: 'G001',
      MAPEL_ID: 'PJOK-XI',
      MATERI: 'Karakter dan Sikap Olahraga',
      JENIS_PENILAIAN: 'SIKAP',
      ASPEK: 'Sportivitas, Kerja Sama, & Fair Play',
      NILAI: 92,
      SKOR_MAKSIMAL: 100,
      PREDIKAT: 'A',
      KETERANGAN: 'Selalu memberi semangat kepada rekan satu tim dan menaati keputusan wasit.',
      TANGGAL: '2026-09-01',
      SEMESTER: '1',
      TAHUN_PELAJARAN: '2026/2027'
    },
    {
      NILAI_ID: 'NIL004',
      MURID_ID: 'M002',
      NAMA_MURID: 'Budi Santoso',
      KELAS_ID: 'XI-01',
      GURU_ID: 'G001',
      MAPEL_ID: 'PJOK-XI',
      MATERI: 'Bola Voli - Passing Bawah',
      JENIS_PENILAIAN: 'PRAKTIK',
      ASPEK: 'Teknik Gerakan & Akurasi Lengan',
      NILAI: 78,
      SKOR_MAKSIMAL: 100,
      PREDIKAT: 'B',
      KETERANGAN: 'Cukup berkembang, perlu membiasakan merendahkan lutut sebelum kontak bola.',
      TANGGAL: '2026-09-01',
      SEMESTER: '1',
      TAHUN_PELAJARAN: '2026/2027'
    }
  ],

  '17_JURNAL': [
    {
      JURNAL_ID: 'JRN001',
      TANGGAL: '2026-09-01',
      GURU_ID: 'G001',
      KELAS_ID: 'XI-01',
      MAPEL_ID: 'PJOK-XI',
      MATERI: 'Permainan Bola Voli (Variasi Passing Bawah Berpasangan)',
      TUJUAN: 'Peserta didik dapat melakukan passing bawah berpasangan minimal 15 kali tanpa jatuh.',
      KEGIATAN: '1. Pemanasan dinamis dan peregangan persendian pergelangan & bahu (15 menit). 2. Penjelasan drill passing bertahap jarak 3 meter (30 menit). 3. Game simulasi mini voli 3 vs 3 (35 menit). 4. Pendinginan dan evaluasi postur (10 menit).',
      METODE: 'Demonstrasi, Drill Practice, Peer Assessment',
      MEDIA: 'Lapangan Voli, Bola Mikasa MVA300, Peluit, Stopwatch, Cone Pembatas',
      JUMLAH_HADIR: 32,
      CATATAN: 'Semua siswa antusias. 2 siswa sempat mengalami kesulitan ayunan tangan dan diberikan pendampingan koreksi gerak.',
      REFLEKSI_GURU: 'Drill jarak pendek 2-3 meter sangat efektif meningkatkan rasa percaya diri siswa sebelum masuk ke simulasi game besar.'
    },
    {
      JURNAL_ID: 'JRN002',
      TANGGAL: '2026-08-25',
      GURU_ID: 'G001',
      KELAS_ID: 'XI-01',
      MAPEL_ID: 'PJOK-XI',
      MATERI: 'Pengantar Teori Bola Voli & Analisis Video Pertandingan',
      TUJUAN: 'Peserta didik memahami posisi rotasi pemain 1-6 serta tugas spesifik libero dan tosser.',
      KEGIATAN: '1. Presentasi interaktif di ruang multimedia. 2. Bedah video rekaman Proliga terkait rotasi setter. 3. Diskusi kelompok dan tanya jawab aturan FIVB.',
      METODE: 'Problem Based Learning & Diskusi Kelompok',
      MEDIA: 'Proyektor LCD, Video Cuplikan FIVB, Modul Digital LMS',
      JUMLAH_HADIR: 31,
      CATATAN: '1 siswa izin dispensasi pramuka (Budi Santoso).',
      REFLEKSI_GURU: 'Visualisasi video sangat membantu pemahaman rotasi yang sering kali membingungkan jika hanya digambar di papan tulis.'
    }
  ],

  '18_NOTIFIKASI': [
    {
      NOTIFIKASI_ID: 'NTF001',
      USER_ID: 'ALL',
      ROLE: 'ALL',
      JUDUL: 'Selamat Datang di LMS PJOK!',
      PESAN: 'Sistem Pembelajaran Jasmani, Olahraga, dan Kesehatan telah aktif untuk Tahun Ajaran 2026/2027. Belajar, Bergerak, Berkembang!',
      TIPE: 'INFO',
      LINK: 'dashboard',
      STATUS: 'BELUM_DIBACA',
      TANGGAL: '2026-09-01 07:00'
    },
    {
      NOTIFIKASI_ID: 'NTF002',
      USER_ID: 'M001',
      ROLE: 'MURID',
      JUDUL: 'Tugas Baru: Video Analisis Passing Bola Voli',
      PESAN: 'Pak I Ketut Suardana telah menugaskan rekaman video passing bola voli. Deadline: 10 September 2026.',
      TIPE: 'TUGAS',
      LINK: 'tugas',
      STATUS: 'BELUM_DIBACA',
      TANGGAL: '2026-08-26 08:30'
    },
    {
      NOTIFIKASI_ID: 'NTF003',
      USER_ID: 'M001',
      ROLE: 'MURID',
      JUDUL: 'Nilai Tugas Diberikan: Skor 88',
      PESAN: 'Tugas video passing bola voli Anda telah diperiksa dan dinilai oleh Guru PJOK.',
      TIPE: 'NILAI',
      LINK: 'nilai',
      STATUS: 'BELUM_DIBACA',
      TANGGAL: '2026-09-03 10:15'
    },
    {
      NOTIFIKASI_ID: 'NTF004',
      USER_ID: 'G001',
      ROLE: 'GURU',
      JUDUL: 'Pengumpulan Tugas Baru Masuk',
      PESAN: 'Budi Santoso (XI-01) telah mengumpulkan Tugas Video Passing Bola Voli.',
      TIPE: 'TUGAS',
      LINK: 'tugas',
      STATUS: 'BELUM_DIBACA',
      TANGGAL: '2026-09-03 19:21'
    }
  ],

  '19_LOG_AKTIVITAS': [
    {
      LOG_ID: 'LOG001',
      USER_ID: 'USR001',
      NAMA: 'Administrator PJOK',
      ROLE: 'ADMIN',
      AKTIVITAS: 'Setup Database',
      DETAIL: 'Inisialisasi 19 Sheets Database LMS PJOK Tahun Pelajaran 2026/2027.',
      WAKTU: '2026-09-01 06:45'
    },
    {
      LOG_ID: 'LOG002',
      USER_ID: 'USR002',
      NAMA: 'I Ketut Suardana, S.Pd., M.Fis.',
      ROLE: 'GURU',
      AKTIVITAS: 'Publikasi Materi',
      DETAIL: 'Menambahkan materi baru: Teknik Dasar & Analisis Passing Bola Voli untuk Kelas XI-01.',
      WAKTU: '2026-08-25 09:00'
    },
    {
      LOG_ID: 'LOG003',
      USER_ID: 'USR004',
      NAMA: 'Andi Pratama',
      ROLE: 'MURID',
      AKTIVITAS: 'Mengerjakan Quiz',
      DETAIL: 'Menyelesaikan Penilaian Formatif Teori Permainan Bola Voli dengan Skor 100/100.',
      WAKTU: '2026-08-29 10:15'
    },
    {
      LOG_ID: 'LOG004',
      USER_ID: 'USR002',
      NAMA: 'I Ketut Suardana, S.Pd., M.Fis.',
      ROLE: 'GURU',
      AKTIVITAS: 'Input Presensi',
      DETAIL: 'Menyimpan presensi Kelas XI-01 tanggal 01 September 2026 (32 Hadir).',
      WAKTU: '2026-09-01 07:30'
    }
  ]
};
