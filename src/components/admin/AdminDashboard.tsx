import React from 'react';
import {
  Users,
  Award,
  GraduationCap,
  School,
  BookOpen,
  FileText,
  HelpCircle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Plus,
  Database,
  Compass,
  CheckCircle2,
  ArrowRight,
  Upload,
  Settings,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { storage } from '../../services/storage';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const users = storage.getUsers();
  const gurus = storage.getGuru();
  const murids = storage.getMurid();
  const kelas = storage.getKelas();
  const materi = storage.getMateri();
  const tugas = storage.getTugas();
  const quiz = storage.getQuiz();
  const logs = storage.getLogAktivitas();
  const presensi = storage.getPresensi();
  const penilaian = storage.getPenilaian();

  const totalAdmin = users.filter(u => u.ROLE === 'ADMIN').length;
  const totalGuru = gurus.length;
  const totalMurid = murids.length;
  const totalKelas = kelas.length;
  const totalMateri = materi.length;
  const totalTugas = tugas.length;
  const totalQuiz = quiz.length;

  // Compute student distribution per class
  const classCounts: Record<string, number> = {};
  kelas.forEach(k => { classCounts[k.KELAS_ID] = 0; });
  murids.forEach(m => {
    if (classCounts[m.KELAS_ID] !== undefined) {
      classCounts[m.KELAS_ID] += 1;
    }
  });

  // Compute attendance stats
  const hadirCount = presensi.filter(p => p.STATUS === 'HADIR').length;
  const totalPresensiCount = presensi.length || 1;
  const attendanceRate = Math.round((hadirCount / totalPresensiCount) * 100);

  // Compute average grade
  const validGrades = penilaian.map(p => p.NILAI).filter(n => typeof n === 'number' && !isNaN(n));
  const avgGrade = validGrades.length > 0 ? Math.round(validGrades.reduce((a, b) => a + b, 0) / validGrades.length) : 85;

  const [showGuide, setShowGuide] = React.useState(true);

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Ringkasan Eksekutif PJOK
            </h1>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-medium border border-blue-100">
              T.A. 2026/2027
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Pusat kendali data kurikulum PJOK, presensi lapangan, dan penilaian berbasis rubrik dengan penyimpanan data mandiri di aplikasi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('sinkronisasi')}
            className="px-3.5 py-2 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Sinkronisasi Google Sheets</span>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Database className="w-4 h-4 text-teal-600" />
            <span>Cadangan & Data</span>
          </button>
          <button
            onClick={() => onNavigate('guru')}
            className="px-3.5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Production Go-Live Quick Guide Banner */}
      {showGuide && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm border border-slate-700 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Panduan Memulai Penggunaan Riil Sekolah (Go-Live)
                </h3>
                <p className="text-xs text-slate-300">
                  Ikuti 4 langkah ini untuk beralih dari mode pengujian cepat ke operasional sekolah sesungguhnya:
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded hover:bg-slate-700/50 cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div
              onClick={() => onNavigate('settings')}
              className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-lg border border-slate-700 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-xs text-blue-400 font-bold mb-1">
                <span>1. Profil & Password</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Ganti password admin bawaan & atur nama sekolah serta tahun ajaran di menu Pengaturan.
              </p>
            </div>

            <div
              onClick={() => onNavigate('kelas')}
              className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-lg border border-slate-700 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
                <span>2. Kelas & Guru PJOK</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Sesuaikan rombel kelas dan daftarkan akun guru PJOK pengampu mapel.
              </p>
            </div>

            <div
              onClick={() => onNavigate('murid')}
              className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-lg border border-slate-700 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-xs text-teal-300 font-bold mb-1">
                <span>3. Import Siswa CSV</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Unduh template CSV, isi nama & NIS siswa sekolah, lalu upload. Akun login siswa otomatis aktif!
              </p>
            </div>

            <div
              onClick={() => onNavigate('sinkronisasi')}
              className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-lg border border-slate-700 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
                <span>4. Sinkronisasi Google Sheets</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Hubungkan Google Spreadsheet sekolah atau Google Apps Script agar data tersinkronisasi antar-laptop & HP.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Executive Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">Total Siswa Aktif</span>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-bold text-gray-900">{totalMurid}</span>
            <span className="text-emerald-500 text-sm font-medium mb-1">Terdaftar di {totalKelas} Kelas</span>
          </div>
          <div className="w-full bg-gray-100 h-1 mt-4 rounded-full">
            <div className="bg-emerald-500 h-1 w-5/6 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">Tingkat Presensi Lapangan</span>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-bold text-gray-900">{attendanceRate}%</span>
            <span className="text-blue-500 text-sm font-medium mb-1">Kehadiran Siswa</span>
          </div>
          <div className="w-full bg-gray-100 h-1 mt-4 rounded-full">
            <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">Rata-Rata Nilai PJOK</span>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-bold text-gray-900">{avgGrade}</span>
            <span className="text-amber-500 text-sm font-medium mb-1">KKM Target: 75</span>
          </div>
          <div className="w-full bg-gray-100 h-1 mt-4 rounded-full">
            <div className="bg-amber-500 h-1 w-4/5 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* 7 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{totalAdmin}</div>
          <div className="text-[10px] text-gray-400 mt-1">Super User</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Guru</span>
            <Award className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{totalGuru}</div>
          <div className="text-[10px] text-emerald-600 mt-1">Pendidik Aktif</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Murid</span>
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{totalMurid}</div>
          <div className="text-[10px] text-blue-600 mt-1">Siswa Terdaftar</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Kelas</span>
            <School className="w-3.5 h-3.5 text-gray-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{totalKelas}</div>
          <div className="text-[10px] text-gray-400 mt-1">Rombel</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Materi</span>
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{totalMateri}</div>
          <div className="text-[10px] text-gray-400 mt-1">Modul Belajar</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tugas</span>
            <FileText className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{totalTugas}</div>
          <div className="text-[10px] text-gray-400 mt-1">Tugas Siswa</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Quiz</span>
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{totalQuiz}</div>
          <div className="text-[10px] text-gray-400 mt-1">Bank Soal</div>
        </div>
      </div>

      {/* Visual Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Murid per Kelas */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Distribusi Siswa per Kelas</h3>
              <p className="text-[11px] text-gray-400">Jumlah peserta didik per rombel</p>
            </div>
            <button
              onClick={() => onNavigate('murid')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
            >
              Detail <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 space-y-3">
            {Object.entries(classCounts).slice(0, 6).map(([kId, count]) => {
              const percentage = Math.min(100, Math.max(10, count * 30));
              return (
                <div key={kId}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-700">{kId}</span>
                    <span className="text-gray-500 font-mono">{count} Siswa</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Total Siswa Terdata: {totalMurid}</span>
            <span className="text-blue-600 font-medium">Tahun 2026/2027</span>
          </div>
        </div>

        {/* Chart 2: Kehadiran & Rata-rata Nilai */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Rekap Presensi & Prestasi</h3>
              <p className="text-[11px] text-gray-400">Efektivitas pembelajaran lapangan</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Tingkat Kehadiran</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{attendanceRate}%</div>
                <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">Siswa Hadir di Lapangan</div>
              </div>

              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Rata-rata Nilai</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{avgGrade}</div>
                <div className="text-[10px] text-blue-600 mt-0.5 font-medium">KKM Target: 75</div>
              </div>
            </div>

            {/* Attendance breakdown pills */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">Komposisi Presensi PJOK</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 rounded">H: {hadirCount}</span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-medium border border-blue-200 rounded">
                  I: {presensi.filter(p => p.STATUS === 'IZIN').length}
                </span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-medium border border-amber-200 rounded">
                  S: {presensi.filter(p => p.STATUS === 'SAKIT').length}
                </span>
                <span className="px-2.5 py-1 bg-red-50 text-red-700 font-medium border border-red-200 rounded">
                  A: {presensi.filter(p => p.STATUS === 'ALPA').length}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 text-[11px] text-gray-400">
            Terintegrasi otomatis dengan Sheet <code>15_PRESENSI</code>
          </div>
        </div>

        {/* Activity Log Feed */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Aktivitas Terbaru</h3>
              <p className="text-[11px] text-gray-400">Audit Trail Log Sistem</p>
            </div>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Semua
            </button>
          </div>

          <div className="p-5 space-y-3 flex-1">
            {logs.slice(0, 5).map((log) => (
              <div key={log.LOG_ID} className="flex items-start gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 truncate">{log.NAMA}</span>
                    <span className="text-[10px] text-gray-400 shrink-0 font-mono">{log.WAKTU.slice(11, 16) || 'Baru'}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{log.AKTIVITAS} • {log.DETAIL}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => onNavigate('logs')}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md text-xs font-medium text-center transition-colors border border-gray-200"
            >
              Buka Audit Trail Lengkap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
