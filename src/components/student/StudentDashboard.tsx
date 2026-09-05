import React from 'react';
import {
  Activity,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  Flame,
  Dumbbell
} from 'lucide-react';
import { storage } from '../../services/storage';
import { SessionUser } from '../../types';

interface StudentDashboardProps {
  currentUser: SessionUser;
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser, onNavigate }) => {
  const materiList = storage.getMateri().filter(m => m.STATUS === 'PUBLIK');
  const tugasList = storage.getTugas();
  const pengumpulanList = storage.getPengumpulanTugas().filter(p => p.MURID_ID === currentUser.ref_id);
  const presensiList = storage.getPresensi().filter(p => p.MURID_ID === currentUser.ref_id);
  const penilaianList = storage.getPenilaian().filter(p => p.MURID_ID === currentUser.ref_id);
  const hasilQuizList = storage.getHasilQuiz().filter(h => h.MURID_ID === currentUser.ref_id);

  // Calculate attendance %
  const totalPresensi = presensiList.length;
  const hadirCount = presensiList.filter(p => p.STATUS === 'HADIR').length;
  const attendanceRate = totalPresensi > 0 ? Math.round((hadirCount / totalPresensi) * 100) : 100;

  // Calculate Average Praktik Score
  const avgPraktik =
    penilaianList.length > 0
      ? Math.round(penilaianList.reduce((acc, curr) => acc + curr.NILAI, 0) / penilaianList.length)
      : 88;

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-900/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold tracking-wide">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            LMS PJOK • Belajar, Bergerak, Berkembang
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Halo, {currentUser.nama}!
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-lg leading-relaxed font-medium">
            Jaga kebugaran jasmani dan raih prestasi maksimal melalui pemahaman teori serta latihan praktik gerak yang teratur.
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-teal-200">
            <span>Kelas: <strong className="text-white">{currentUser.nama_kelas || 'Kelas XI PJOK'}</strong></span>
            <span>•</span>
            <span>NIS: <strong className="text-white">{currentUser.username}</strong></span>
          </div>
        </div>

        <div className="p-4 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/20 text-center min-w-[140px] shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200 block mb-1">
            Rata-rata Nilai Praktik
          </span>
          <div className="text-3xl font-black text-amber-300">{avgPraktik}</div>
          <span className="text-[10px] text-teal-200">Predikat Sangat Baik</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kehadiran</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{attendanceRate}%</div>
          <div className="text-[10px] text-emerald-600 mt-1">{hadirCount} Pertemuan Hadir</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tugas Selesai</span>
            <CheckCircle className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{pengumpulanList.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Video Praktik Mandiri</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Quiz Kognitif</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{hasilQuizList.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Ujian Teori Diikuti</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kebugaran</span>
            <Dumbbell className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700">OPTIMAL</div>
          <div className="text-[10px] text-indigo-500 mt-1">Status Jasmani</div>
        </div>
      </div>

      {/* Main Grid: Pending Tasks & Recent Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Tugas Praktik PJOK</h3>
            <button
              onClick={() => onNavigate('tugas')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-0.5"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {tugasList.slice(0, 3).map((t) => {
              const mySub = pengumpulanList.find(p => p.TUGAS_ID === t.TUGAS_ID);
              return (
                <div
                  key={t.TUGAS_ID}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                        Maks {t.NILAI_MAKSIMAL || t.BOBOT || 100}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {t.DEADLINE}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-800">{t.JUDUL || t.JUDUL_TUGAS}</div>
                  </div>

                  {mySub ? (
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      {mySub.STATUS === 'DINILAI' ? `Nilai: ${mySub.NILAI}` : 'Terkumpul'}
                    </span>
                  ) : (
                    <button
                      onClick={() => onNavigate('tugas')}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs"
                    >
                      Kumpulkan
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Learning Modules */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Materi Pembelajaran PJOK</h3>
            <button
              onClick={() => onNavigate('materi')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-0.5"
            >
              Buka Modul <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {materiList.slice(0, 3).map((m) => (
              <div
                key={m.MATERI_ID}
                onClick={() => onNavigate('materi')}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    {m.TOPIK}
                  </span>
                  <div className="font-bold text-xs text-slate-800 mt-1">{m.JUDUL}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Oleh: {m.NAMA_GURU || 'Guru PJOK'}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
