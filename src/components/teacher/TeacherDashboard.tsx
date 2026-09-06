import React from 'react';
import {
  Users,
  Award,
  BookOpen,
  CalendarCheck,
  BookMarked,
  Plus,
  ArrowUpRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { storage } from '../../services/storage';
import { SessionUser } from '../../types';

interface TeacherDashboardProps {
  currentUser: SessionUser;
  onNavigate: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentUser, onNavigate }) => {
  const murids = storage.getMurid();
  const materi = storage.getMateri();
  const tugas = storage.getTugas();
  const presensi = storage.getPresensi();
  const penilaian = storage.getPenilaian();
  const kelas = storage.getKelas();

  const today = new Date().toISOString().slice(0, 10);
  const presensiHariIni = presensi.filter(p => p.TANGGAL === today);

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Portal Pendidik PJOK
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Selamat Bertugas, {currentUser.nama}!
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl leading-relaxed">
            Kelola pembelajaran jasmani, laksanakan asesmen praktik rubrik 1-4, dan catat presensi lapangan dengan mudah.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('penilaian-praktik')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Award className="w-4 h-4" /> Input Nilai Praktik (1-4)
          </button>
          <button
            onClick={() => onNavigate('presensi')}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-300" /> Presensi Hari Ini
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Siswa</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{murids.length}</div>
          <div className="text-[10px] text-teal-600 mt-1">Seluruh Rombel</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Modul Ajar</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{materi.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Materi PJOK</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tugas Video</span>
            <FileText className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{tugas.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Praktik Lapangan</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Presensi Hari Ini</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{presensiHariIni.length}</div>
          <div className="text-[10px] text-emerald-600 mt-1">Catatan Tanggal Ini</div>
        </div>
      </div>

      {/* Grid: Shortcut Actions & Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Grid */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Menu Cepat Guru PJOK</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('penilaian-praktik')}
              className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-left transition-all group"
            >
              <Award className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-xs text-slate-800">Penilaian Praktik PJOK (1-4)</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Gunakan rubrik 4 aspek (Sikap Awal, Pelaksanaan, Akhir, Karakter).
              </p>
            </button>

            <button
              onClick={() => onNavigate('presensi')}
              className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-left transition-all group"
            >
              <CalendarCheck className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-xs text-slate-800">Catat Presensi Harian</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tandai kehadiran (H, S, I, A) secara cepat per kelas.
              </p>
            </button>

            <button
              onClick={() => onNavigate('materi')}
              className="p-4 rounded-2xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/60 text-left transition-all group"
            >
              <BookOpen className="w-6 h-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-xs text-slate-800">Tambah Materi & Video</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Unggah panduan gerak spesifik, video YouTube, dan file e-book.
              </p>
            </button>

            <button
              onClick={() => onNavigate('jurnal')}
              className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 text-left transition-all group"
            >
              <BookMarked className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-xs text-slate-800">Tulis Jurnal Mengajar</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dokumentasikan materi jam ke, hambatan, dan solusi di lapangan.
              </p>
            </button>
          </div>
        </div>

        {/* Classes Overview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Rombel Kelas</h3>
            <button
              onClick={() => onNavigate('data-murid')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-0.5"
            >
              Lihat Siswa <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {kelas.slice(0, 5).map((k, idx) => {
              const count = murids.filter(m => m.KELAS_ID === k.KELAS_ID).length;
              return (
                <div
                  key={`teach-kelas-${k.KELAS_ID || 'k'}-${idx}`}
                  className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">{k.NAMA_KELAS}</div>
                    <div className="text-[11px] text-slate-400">Wali: {k.WALI_KELAS || '-'}</div>
                  </div>
                  <span className="px-2.5 py-1 bg-white font-bold rounded-xl text-teal-800 border border-slate-200">
                    {count} Siswa
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
