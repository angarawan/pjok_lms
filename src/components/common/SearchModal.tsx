import React, { useState } from 'react';
import { Search, BookMarked, Users, Award, CalendarCheck, FileText, ArrowRight } from 'lucide-react';
import { storage } from '../../services/storage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const materi = storage.getMateri();
  const tugas = storage.getTugas();
  const murids = storage.getMurid();

  const filteredMateri = query.trim()
    ? materi.filter(m => (m.JUDUL || '').toLowerCase().includes(query.toLowerCase()) || (m.TOPIK || '').toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : [];

  const filteredTugas = query.trim()
    ? tugas.filter(t => (t.JUDUL || t.JUDUL_TUGAS || '').toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : [];

  const filteredMurid = query.trim()
    ? murids.filter(m => (m.NAMA_MURID || '').toLowerCase().includes(query.toLowerCase()) || (m.NIS || '').includes(query)).slice(0, 4)
    : [];

  const handleSelect = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl p-6 max-w-xl w-full shadow-xl border border-gray-200 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-blue-600 absolute left-3.5 top-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari materi, tugas, nama siswa, atau menu..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Search Results */}
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 text-xs">
          {query.trim() === '' ? (
            <div className="py-6 text-center text-gray-400">
              Ketikkan kata kunci untuk mencari modul pembelajaran, tugas, atau nama siswa.
            </div>
          ) : filteredMateri.length === 0 && filteredTugas.length === 0 && filteredMurid.length === 0 ? (
            <div className="py-6 text-center text-gray-400">
              Tidak ditemukan hasil untuk &quot;{query}&quot;.
            </div>
          ) : (
            <>
              {filteredMateri.map((m, idx) => (
                <div
                  key={`materi-${m.MATERI_ID || 'mat'}-${idx}`}
                  onClick={() => handleSelect('materi')}
                  className="py-2.5 px-3 hover:bg-gray-50 rounded-md cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BookMarked className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-800 group-hover:text-blue-600">{m.JUDUL}</div>
                      <div className="text-[10px] text-gray-400">Materi PJOK • {m.TOPIK}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              ))}

              {filteredTugas.map((t, idx) => (
                <div
                  key={`tugas-${t.TUGAS_ID || 'tug'}-${idx}`}
                  onClick={() => handleSelect('tugas')}
                  className="py-2.5 px-3 hover:bg-gray-50 rounded-md cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <div>
                      <div className="font-semibold text-gray-800 group-hover:text-rose-600">{t.JUDUL}</div>
                      <div className="text-[10px] text-gray-400">Tugas PJOK • Deadline: {t.DEADLINE}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                </div>
              ))}

              {filteredMurid.map((s, idx) => (
                <div
                  key={`murid-${s.MURID_ID || 'mrd'}-${idx}`}
                  onClick={() => handleSelect('murid')}
                  className="py-2.5 px-3 hover:bg-gray-50 rounded-md cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-800 group-hover:text-blue-600">{s.NAMA_MURID}</div>
                      <div className="text-[10px] text-gray-400">NIS: {s.NIS} • Kelas: {s.KELAS_ID}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              ))}
            </>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-md transition-colors"
          >
            Tutup (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
