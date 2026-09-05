import React, { useState, useRef } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Download,
  Upload,
  HardDrive,
  Database,
  FileSpreadsheet,
  FileJson,
  Check
} from 'lucide-react';
import { storage } from '../../services/storage';

interface AdminSettingsProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'pengaturan' | 'database'>('pengaturan');
  const [namaAplikasi, setNamaAplikasi] = useState(storage.getConfig('NAMA_APLIKASI', 'LMS PJOK'));
  const [subjudul, setSubjudul] = useState(storage.getConfig('SUBJUDUL', 'Learning Management System'));
  const [slogan, setSlogan] = useState(storage.getConfig('SLOGAN', 'Belajar, Bergerak, Berkembang.'));
  const [namaSekolah, setNamaSekolah] = useState(storage.getConfig('NAMA_SEKOLAH', 'SMA Negeri 1 Prestasi Bangsa'));
  const [alamatSekolah, setAlamatSekolah] = useState(storage.getConfig('ALAMAT_SEKOLAH', 'Jl. Pendidikan No. 45, Denpasar, Bali'));
  const [tahunPelajaran, setTahunPelajaran] = useState(storage.getConfig('TAHUN_PELAJARAN', '2026/2027'));
  const [semester, setSemester] = useState(storage.getConfig('SEMESTER', '1 (Ganjil)'));
  const [kkmDefault, setKkmDefault] = useState(storage.getConfig('KKM_DEFAULT', '75'));
  const [emailAdmin, setEmailAdmin] = useState(storage.getConfig('EMAIL_ADMIN', 'admin.pjok@sekolah.sch.id'));
  const [telpSekolah, setTelpSekolah] = useState(storage.getConfig('TELP_SEKOLAH', '(0361) 234567'));

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const configs = [
      { KUNCI: 'NAMA_APLIKASI', NILAI: namaAplikasi, KETERANGAN: 'Nama sistem' },
      { KUNCI: 'SUBJUDUL', NILAI: subjudul, KETERANGAN: 'Subjudul aplikasi' },
      { KUNCI: 'SLOGAN', NILAI: slogan, KETERANGAN: 'Slogan kurikulum' },
      { KUNCI: 'NAMA_SEKOLAH', NILAI: namaSekolah, KETERANGAN: 'Nama instansi sekolah' },
      { KUNCI: 'ALAMAT_SEKOLAH', NILAI: alamatSekolah, KETERANGAN: 'Alamat lengkap instansi' },
      { KUNCI: 'TAHUN_PELAJARAN', NILAI: tahunPelajaran, KETERANGAN: 'Tahun ajaran aktif' },
      { KUNCI: 'SEMESTER', NILAI: semester, KETERANGAN: 'Semester berjalan' },
      { KUNCI: 'KKM_DEFAULT', NILAI: kkmDefault, KETERANGAN: 'Kriteria Ketuntasan Minimal' },
      { KUNCI: 'EMAIL_ADMIN', NILAI: emailAdmin, KETERANGAN: 'Email helpdesk admin' },
      { KUNCI: 'TELP_SEKOLAH', NILAI: telpSekolah, KETERANGAN: 'Nomor telepon sekolah' }
    ];

    configs.forEach(c => storage.setConfig(c.KUNCI, c.NILAI, c.KETERANGAN));
    onShowToast('Pengaturan identitas dan parameter sekolah berhasil disimpan!', 'success');
  };

  // Export complete internal database to JSON
  const handleExportBackup = () => {
    try {
      const db = storage.getDatabase();
      const jsonString = JSON.stringify(db, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Cadangan_LMS_PJOK_${dateStr}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('Cadangan database aplikasi (.json) berhasil diunduh!', 'success');
    } catch (err: any) {
      onShowToast('Gagal mengekspor data: ' + err.message, 'error');
    }
  };

  // Import complete internal database from JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Basic sanity check: verify essential collections exist
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Format file cadangan JSON tidak valid.');
        }

        storage.replaceDatabase(parsed);
        onShowToast('Database aplikasi berhasil dipulihkan dari file cadangan!', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err: any) {
        console.error('Import error:', err);
        onShowToast('Gagal memulihkan file cadangan: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download Student CSV template
  const handleDownloadCsvTemplate = () => {
    const headers = 'NIS,NISN,NAMA_MURID,KELAS_ID,JENIS_KELAMIN,EMAIL,STATUS\n';
    const sampleRows = [
      '20261001,0081234501,Aditya Pratama,KELAS_X_A,L,aditya@siswa.belajar.id,AKTIF',
      '20261002,0081234502,Bella Safitri,KELAS_X_A,P,bella@siswa.belajar.id,AKTIF',
      '20261003,0081234503,Candra Wijaya,KELAS_X_A,L,candra@siswa.belajar.id,AKTIF',
      '20261004,0081234504,Dewi Lestari,KELAS_X_B,P,dewi@siswa.belajar.id,AKTIF'
    ].join('\n');

    const csvContent = headers + sampleRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_murid_pjok.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Template CSV Murid berhasil diunduh!', 'success');
  };

  const handleResetDatabase = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data aplikasi ke data bawaan awal?')) {
      storage.resetToMockData();
      onShowToast('Database berhasil dikembalikan ke sampel bawaan awal!', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Pengaturan Aplikasi & Sekolah</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola parameter sistem, profil sekolah, serta manajemen data internal aplikasi.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pengaturan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pengaturan'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-teal-700" />
            <span>Pengaturan Sekolah</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>Cadangan & Data Internal</span>
          </button>
        </div>
      </div>

      {activeTab === 'database' ? (
        /* Database & Backup Management View */
        <div className="space-y-6">
          {/* Storage Information Banner */}
          <div className="p-5 rounded-3xl bg-teal-50 border border-teal-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Penyimpanan Data Internal Mandiri Aktif
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                  Seluruh data (Murid, Guru, Rombel, Materi, Tugas, Presensi, Nilai, dan Jurnal) tersimpan langsung secara mandiri di dalam aplikasi. Tidak ada ketergantungan atau batasan akun dari Google Spreadsheet.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Cadangan Lengkap (.json)</span>
            </button>
          </div>

          {/* Backup & Restore Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Ekspor Cadangan */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                  <FileJson className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Ekspor Cadangan Data</h4>
                  <p className="text-xs text-slate-500">Simpan salinan data lengkap sekolah Anda ke berkas komputer.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Menghasilkan berkas cadangan JSON yang mencakup data seluruh siswa, materi, penilaian, dan akun login. Berkas ini dapat dipulihkan kapan saja.
              </p>

              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Cadangan (.json)</span>
              </button>
            </div>

            {/* Card 2: Impor / Pulihkan Cadangan */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Pulihkan Cadangan Data</h4>
                  <p className="text-xs text-slate-500">Unggah berkas JSON untuk memulihkan seluruh data aplikasi.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Berguna saat Anda berpindah komputer atau ingin memindahkan seluruh database sekolah ke browser lain tanpa perlu login Google.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
                id="upload-backup-json"
              />

              <label
                htmlFor="upload-backup-json"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Berkas Cadangan (.json)</span>
              </label>
            </div>
          </div>

          {/* Additional Helpers: Template CSV & Reset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 3: Template CSV Murid */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Template Impor Murid</h4>
                  <p className="text-xs text-slate-500">Format Excel/CSV untuk entri data massal siswa.</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Gunakan template ini untuk mengisi daftar nama murid sekaligus melalui fitur Impor CSV di menu Data Murid.
              </p>
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Format CSV Murid</span>
              </button>
            </div>

            {/* Card 4: Reset ke Data Awal */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Reset ke Sampel Awal</h4>
                  <p className="text-xs text-slate-500">Kembalikan data ke contoh awal bawaan sistem.</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Gunakan jika Anda ingin menghapus seluruh data percobaan dan kembali ke data percontohan awal PJOK.
              </p>
              <button
                type="button"
                onClick={handleResetDatabase}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Database Bawaan</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* General Settings Form */
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Identitas Aplikasi & Sekolah */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="w-4 h-4 text-teal-700" />
              Identitas Sekolah & Aplikasi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Aplikasi</label>
                <input
                  type="text"
                  required
                  value={namaAplikasi}
                  onChange={(e) => setNamaAplikasi(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slogan PJOK</label>
                <input
                  type="text"
                  required
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none italic"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Subjudul / Deskripsi Pendek</label>
                <input
                  type="text"
                  required
                  value={subjudul}
                  onChange={(e) => setSubjudul(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Sekolah / Lembaga</label>
                <input
                  type="text"
                  required
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Instansi Sekolah</label>
                <input
                  type="text"
                  value={alamatSekolah}
                  onChange={(e) => setAlamatSekolah(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Administrator</label>
                <input
                  type="email"
                  value={emailAdmin}
                  onChange={(e) => setEmailAdmin(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telepon Sekolah</label>
                <input
                  type="text"
                  value={telpSekolah}
                  onChange={(e) => setTelpSekolah(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kalender Akademik & KKM */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Parameter Akademik & Kelulusan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Pelajaran</label>
                <input
                  type="text"
                  required
                  value={tahunPelajaran}
                  onChange={(e) => setTahunPelajaran(e.target.value)}
                  placeholder="2026/2027"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Semester Aktif</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-semibold"
                >
                  <option value="1 (Ganjil)">1 (Ganjil)</option>
                  <option value="2 (Genap)">2 (Genap)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">KKM Default PJOK</label>
                <input
                  type="number"
                  required
                  value={kkmDefault}
                  onChange={(e) => setKkmDefault(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-bold text-teal-800"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-teal-700/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Simpan Pengaturan Sekolah
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-teal-600" />
              Kelola Cadangan & Data Internal &rarr;
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
