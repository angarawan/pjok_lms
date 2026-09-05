import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, FileText, HelpCircle, Users, Award, ChevronRight } from 'lucide-react';
import { SessionUser } from '../types';
import { storage } from '../services/storage';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SessionUser;
  onNavigate: (tab: string, extraData?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const results: Array<{ id: string; type: string; title: string; subtitle: string; icon: any; targetTab: string; payload?: any }> = [];

    // Search Materi
    const materiList = storage.getMateri();
    materiList.forEach(m => {
      if (currentUser?.role === 'MURID' && currentUser.kelas_id && m.KELAS !== currentUser.kelas_id && m.KELAS !== 'Semua') {
        return;
      }
      const judul = m.JUDUL || '';
      const topik = m.TOPIK || '';
      const desc = m.DESKRIPSI || '';
      if (judul.toLowerCase().includes(q) || topik.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) {
        results.push({
          id: m.MATERI_ID,
          type: 'Materi PJOK',
          title: m.JUDUL,
          subtitle: `Kelas: ${m.KELAS} • Topik: ${m.TOPIK}`,
          icon: BookOpen,
          targetTab: currentUser?.role === 'MURID' ? 'materi-saya' : 'materi',
          payload: m
        });
      }
    });

    // Search Tugas
    const tugasList = storage.getTugas();
    tugasList.forEach(t => {
      if (currentUser?.role === 'MURID' && currentUser.kelas_id && t.KELAS_ID !== currentUser.kelas_id) {
        return;
      }
      const judul = t.JUDUL || t.JUDUL_TUGAS || '';
      const desc = t.DESKRIPSI || '';
      if (judul.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) {
        results.push({
          id: t.TUGAS_ID,
          type: 'Tugas',
          title: judul,
          subtitle: `Deadline: ${t.DEADLINE}`,
          icon: FileText,
          targetTab: currentUser?.role === 'MURID' ? 'tugas-saya' : 'tugas',
          payload: t
        });
      }
    });

    // Search Quiz
    const quizList = storage.getQuiz();
    quizList.forEach(qz => {
      if (currentUser?.role === 'MURID' && currentUser.kelas_id && qz.KELAS_ID !== currentUser.kelas_id) {
        return;
      }
      const judul = qz.JUDUL || '';
      const desc = qz.DESKRIPSI || '';
      if (judul.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) {
        results.push({
          id: qz.QUIZ_ID,
          type: 'Quiz',
          title: qz.JUDUL,
          subtitle: `Durasi: ${qz.DURASI} Menit • KKM: ${qz.KKM}`,
          icon: HelpCircle,
          targetTab: currentUser?.role === 'MURID' ? 'quiz-saya' : 'quiz',
          payload: qz
        });
      }
    });

    // Search Murid (Only Admin & Guru)
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'GURU') {
      const muridList = storage.getMurid();
      muridList.forEach(m => {
        const nama = m.NAMA_MURID || '';
        const nis = m.NIS || '';
        const kelas = m.NAMA_KELAS || '';
        if (nama.toLowerCase().includes(q) || nis.includes(q) || kelas.toLowerCase().includes(q)) {
          results.push({
            id: m.MURID_ID,
            type: 'Murid',
            title: m.NAMA_MURID,
            subtitle: `NIS: ${m.NIS} • ${m.NAMA_KELAS}`,
            icon: Users,
            targetTab: currentUser?.role === 'ADMIN' ? 'murid' : 'data-murid',
            payload: m
          });
        }
      });
    }

    // Search Guru (Only Admin)
    if (currentUser?.role === 'ADMIN') {
      const guruList = storage.getGuru();
      guruList.forEach(g => {
        const nama = g.NAMA_GURU || '';
        const nip = g.NIP || '';
        if (nama.toLowerCase().includes(q) || nip.includes(q)) {
          results.push({
            id: g.GURU_ID,
            type: 'Guru',
            title: g.NAMA_GURU,
            subtitle: `NIP: ${g.NIP} • ${g.MATA_PELAJARAN}`,
            icon: Award,
            targetTab: 'guru',
            payload: g
          });
        }
      });
    }

    return results;
  }, [query, currentUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              currentUser.role === 'ADMIN'
                ? 'Cari Guru, Murid, Materi, Tugas, Quiz...'
                : currentUser.role === 'GURU'
                ? 'Cari Murid, Materi, Tugas, Quiz...'
                : 'Cari Materi, Tugas, Quiz PJOK...'
            }
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg border border-slate-200 bg-white">
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim().length >= 2 && searchResults.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ditemukan hasil untuk &quot;{query}&quot;
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-1">
              {searchResults.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      onNavigate(item.targetTab, item.payload);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-teal-50/70 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-teal-100 text-slate-600 group-hover:text-teal-700 flex items-center justify-center transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800 group-hover:text-teal-900">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-800">
                            {item.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.subtitle}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
                  </button>
                );
              })}
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              Ketik minimal 2 huruf untuk memulai pencarian...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
