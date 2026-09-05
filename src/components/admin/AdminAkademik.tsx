import React, { useState } from 'react';
import { School, BookOpen, Plus, Trash2, Edit, CheckCircle } from 'lucide-react';
import { storage } from '../../services/storage';
import { KelasItem, MapelItem } from '../../types';

interface AdminAkademikProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminAkademik: React.FC<AdminAkademikProps> = ({ onShowToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<'kelas' | 'mapel'>('kelas');
  const [kelasList, setKelasList] = useState<KelasItem[]>(storage.getKelas());
  const [mapelList, setMapelList] = useState<MapelItem[]>(storage.getMapel());
  const gurus = storage.getGuru();

  // Modal Kelas
  const [showKelasModal, setShowKelasModal] = useState(false);
  const [kelasId, setKelasId] = useState('');
  const [tingkat, setTingkat] = useState<'X' | 'XI' | 'XII'>('XI');
  const [namaKelas, setNamaKelas] = useState('');
  const [waliKelas, setWaliKelas] = useState('');
  const [guruId, setGuruId] = useState(gurus[0]?.GURU_ID || 'G001');

  const refreshKelas = () => setKelasList(storage.getKelas());

  const handleSaveKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasId.trim() || !namaKelas.trim()) {
      onShowToast('Kode Kelas dan Nama Kelas wajib diisi.', 'error');
      return;
    }

    // Check duplicate
    if (kelasList.some(k => k.KELAS_ID.toUpperCase() === kelasId.trim().toUpperCase())) {
      onShowToast(`Kelas dengan kode ${kelasId} sudah ada.`, 'error');
      return;
    }

    storage.addKelas({
      KELAS_ID: kelasId.trim().toUpperCase(),
      TINGKAT: tingkat,
      NAMA_KELAS: namaKelas.trim(),
      WALI_KELAS: waliKelas.trim() || '-',
      GURU_ID: guruId,
      TAHUN_PELAJARAN: '2026/2027',
      STATUS: 'AKTIF'
    });

    onShowToast(`Kelas ${kelasId} berhasil ditambahkan!`, 'success');
    setShowKelasModal(false);
    setKelasId('');
    setNamaKelas('');
    setWaliKelas('');
    refreshKelas();
  };

  const handleDeleteKelas = (k: KelasItem) => {
    if (confirm(`Hapus rombel kelas ${k.NAMA_KELAS}?`)) {
      storage.deleteKelas(k.KELAS_ID);
      onShowToast(`Kelas ${k.NAMA_KELAS} berhasil dihapus.`, 'success');
      refreshKelas();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Data Rombel Kelas & Kurikulum PJOK</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar rombongan belajar (Sheet <code>06_KELAS</code>) & Mata Pelajaran (Sheet <code>07_MAPEL</code>)
          </p>
        </div>
        {activeSubTab === 'kelas' && (
          <button
            onClick={() => setShowKelasModal(true)}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Rombel Kelas
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveSubTab('kelas')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === 'kelas'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <School className="w-4 h-4" />
          Rombongan Belajar ({kelasList.length} Kelas)
        </button>
        <button
          onClick={() => setActiveSubTab('mapel')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === 'mapel'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Mata Pelajaran & Fase ({mapelList.length} Jenjang)
        </button>
      </div>

      {/* Tab 1: Kelas */}
      {activeSubTab === 'kelas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Kode Kelas</th>
                  <th className="py-3.5 px-4">Tingkat</th>
                  <th className="py-3.5 px-4">Nama Rombel</th>
                  <th className="py-3.5 px-4">Wali Kelas</th>
                  <th className="py-3.5 px-4">Guru PJOK ID</th>
                  <th className="py-3.5 px-4">Tahun Ajaran</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {kelasList.map((k) => (
                  <tr key={k.KELAS_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800 bg-teal-50/40">{k.KELAS_ID}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{k.TINGKAT}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{k.NAMA_KELAS}</td>
                    <td className="py-3.5 px-4 text-slate-600">{k.WALI_KELAS || '-'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{k.GURU_ID || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{k.TAHUN_PELAJARAN}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {k.STATUS}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDeleteKelas(k)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Mapel */}
      {activeSubTab === 'mapel' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Kode Mapel</th>
                  <th className="py-3.5 px-4">Nama Mata Pelajaran</th>
                  <th className="py-3.5 px-4">Fase Kurikulum</th>
                  <th className="py-3.5 px-4">Tingkat</th>
                  <th className="py-3.5 px-4">Pengampu ID</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {mapelList.map((m) => (
                  <tr key={m.MAPEL_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">{m.MAPEL_ID}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{m.NAMA_MAPEL}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {m.FASE}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{m.TINGKAT}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{m.GURU_ID}</td>
                    <td className="py-3.5 px-4 text-slate-600">{m.SEMESTER}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {m.STATUS}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Kelas Modal */}
      {showKelasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Tambah Rombel Kelas Baru</h3>
              <button
                onClick={() => setShowKelasModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveKelas} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Kelas</label>
                  <input
                    type="text"
                    required
                    value={kelasId}
                    onChange={(e) => setKelasId(e.target.value)}
                    placeholder="XI-08"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value as 'X' | 'XI' | 'XII')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-semibold"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Rombel Lengkap</label>
                <input
                  type="text"
                  required
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  placeholder="Contoh: Kelas XI-08"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Wali Kelas</label>
                <input
                  type="text"
                  value={waliKelas}
                  onChange={(e) => setWaliKelas(e.target.value)}
                  placeholder="Contoh: Drs. Wahyudi, M.Pd."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Guru Pengampu PJOK</label>
                <select
                  value={guruId}
                  onChange={(e) => setGuruId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-medium"
                >
                  {gurus.map(g => (
                    <option key={g.GURU_ID} value={g.GURU_ID}>
                      {g.GURU_ID} - {g.NAMA_GURU}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Simpan Rombel
                </button>
                <button
                  type="button"
                  onClick={() => setShowKelasModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
