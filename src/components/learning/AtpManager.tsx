import React, { useState } from 'react';
import { Sparkles, Plus, Search, Edit, Trash2, BookOpen, Clock, Filter, Upload } from 'lucide-react';
import { storage } from '../../services/storage';
import { AtpItem } from '../../types';
import { ImportAtpModal } from './ImportAtpModal';

interface AtpManagerProps {
  canEdit: boolean;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AtpManager: React.FC<AtpManagerProps> = ({ canEdit, onShowToast }) => {
  const [atpList, setAtpList] = useState<AtpItem[]>(storage.getAtp());
  const [faseFilter, setFaseFilter] = useState('ALL');
  const [elemenFilter, setElemenFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedAtp, setSelectedAtp] = useState<AtpItem | null>(null);

  // Form states
  const [fase, setFase] = useState<'Fase E' | 'Fase F'>('Fase F');
  const [kelas, setKelas] = useState('Kelas XI');
  const [elemen, setElemen] = useState('Keterampilan Gerak');
  const [capaian, setCapaian] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [alokasi, setAlokasi] = useState('6 JP');
  const [semester, setSemester] = useState('1 (Ganjil)');

  const refreshList = () => {
    setAtpList(storage.getAtp());
  };

  const filteredAtp = atpList.filter(item => {
    const q = (search || '').toLowerCase();
    const matchSearch =
      (item.TUJUAN_PEMBELAJARAN || '').toLowerCase().includes(q) ||
      (item.ELEMEN || '').toLowerCase().includes(q) ||
      (item.CAPAIAN_PEMBELAJARAN || '').toLowerCase().includes(q);
    const matchFase = faseFilter === 'ALL' || item.FASE === faseFilter;
    const matchElemen = elemenFilter === 'ALL' || item.ELEMEN === elemenFilter;
    return matchSearch && matchFase && matchElemen;
  });

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedAtp(null);
    setFase('Fase F');
    setKelas('Kelas XI');
    setElemen('Keterampilan Gerak');
    setCapaian('');
    setTujuan('');
    setAlokasi('6 JP');
    setSemester('1 (Ganjil)');
    setShowModal(true);
  };

  const handleOpenEdit = (item: AtpItem) => {
    setModalMode('edit');
    setSelectedAtp(item);
    setFase(item.FASE as any);
    setKelas(item.KELAS);
    setElemen(item.ELEMEN);
    setCapaian(item.CAPAIAN_PEMBELAJARAN);
    setTujuan(item.TUJUAN_PEMBELAJARAN);
    setAlokasi(item.ALOKASI_WAKTU);
    setSemester(item.SEMESTER);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tujuan.trim() || !capaian.trim()) {
      onShowToast('Tujuan dan Capaian Pembelajaran wajib diisi.', 'error');
      return;
    }

    if (modalMode === 'add') {
      storage.addAtp({
        FASE: fase,
        KELAS: kelas,
        ELEMEN: elemen,
        CAPAIAN_PEMBELAJARAN: capaian.trim(),
        TUJUAN_PEMBELAJARAN: tujuan.trim(),
        ALOKASI_WAKTU: alokasi.trim(),
        SEMESTER: semester
      });
      onShowToast('ATP PJOK berhasil ditambahkan!', 'success');
    } else if (modalMode === 'edit' && selectedAtp) {
      storage.updateAtp(selectedAtp.ATP_ID, {
        FASE: fase,
        KELAS: kelas,
        ELEMEN: elemen,
        CAPAIAN_PEMBELAJARAN: capaian.trim(),
        TUJUAN_PEMBELAJARAN: tujuan.trim(),
        ALOKASI_WAKTU: alokasi.trim(),
        SEMESTER: semester
      });
      onShowToast('ATP PJOK berhasil diperbarui!', 'success');
    }

    setShowModal(false);
    refreshList();
  };

  const handleDelete = (item: AtpItem) => {
    if (confirm(`Hapus Alur Tujuan Pembelajaran: "${item.TUJUAN_PEMBELAJARAN}"?`)) {
      storage.deleteAtp(item.ATP_ID);
      onShowToast('ATP PJOK berhasil dihapus.', 'success');
      refreshList();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Alur Tujuan Pembelajaran (ATP) PJOK</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Struktur Capaian & Tujuan Pembelajaran Kurikulum Merdeka Fase E & F (Sheet <code>08_ATP</code>)
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2.5 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-teal-700" /> Import / Upload ATP
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah ATP Baru
            </button>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari elemen atau tujuan pembelajaran..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={faseFilter}
            onChange={(e) => setFaseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="ALL">Semua Fase</option>
            <option value="Fase E">Fase E (Kelas X)</option>
            <option value="Fase F">Fase F (Kelas XI - XII)</option>
          </select>

          <select
            value={elemenFilter}
            onChange={(e) => setElemenFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="ALL">Semua Elemen</option>
            <option value="Keterampilan Gerak">Keterampilan Gerak</option>
            <option value="Pengetahuan Gerak">Pengetahuan Gerak</option>
            <option value="Pemanfaatan Gerak">Pemanfaatan Gerak</option>
            <option value="Pengembangan Karakter">Pengembangan Karakter</option>
          </select>
        </div>
      </div>

      {/* ATP Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAtp.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Belum ada Alur Tujuan Pembelajaran yang sesuai.
          </div>
        ) : (
          filteredAtp.map((item) => (
            <div
              key={item.ATP_ID}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {item.FASE} ({item.KELAS})
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {item.ELEMEN}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.ALOKASI_WAKTU}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">
                    {item.TUJUAN_PEMBELAJARAN}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">CP: </span>
                    {item.CAPAIAN_PEMBELAJARAN}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Semester: {item.SEMESTER}</span>
                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg"
                      title="Edit ATP"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      title="Hapus ATP"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {modalMode === 'add' ? 'Tambah Alur Tujuan Pembelajaran (ATP)' : 'Edit ATP PJOK'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fase Kurikulum</label>
                  <select
                    value={fase}
                    onChange={(e) => setFase(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-semibold"
                  >
                    <option value="Fase E">Fase E (Kelas X)</option>
                    <option value="Fase F">Fase F (Kelas XI - XII)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  >
                    <option value="Kelas X">Kelas X</option>
                    <option value="Kelas XI">Kelas XI</option>
                    <option value="Kelas XII">Kelas XII</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Elemen PJOK</label>
                <select
                  value={elemen}
                  onChange={(e) => setElemen(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-semibold"
                >
                  <option value="Keterampilan Gerak">Keterampilan Gerak</option>
                  <option value="Pengetahuan Gerak">Pengetahuan Gerak</option>
                  <option value="Pemanfaatan Gerak">Pemanfaatan Gerak</option>
                  <option value="Pengembangan Karakter">Pengembangan Karakter</option>
                  <option value="Internalisasi Nilai-nilai Gerak">Internalisasi Nilai-nilai Gerak</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tujuan Pembelajaran (TP)</label>
                <textarea
                  required
                  rows={2}
                  value={tujuan}
                  onChange={(e) => setTujuan(e.target.value)}
                  placeholder="Contoh: Peserta didik mampu mempraktikkan variasi passing dan smash bola voli secara terukur..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Capaian Pembelajaran (CP)</label>
                <textarea
                  required
                  rows={3}
                  value={capaian}
                  onChange={(e) => setCapaian(e.target.value)}
                  placeholder="Salin teks Capaian Pembelajaran terkait..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alokasi Waktu</label>
                  <input
                    type="text"
                    required
                    value={alokasi}
                    onChange={(e) => setAlokasi(e.target.value)}
                    placeholder="6 JP"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  >
                    <option value="1 (Ganjil)">1 (Ganjil)</option>
                    <option value="2 (Genap)">2 (Genap)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  {modalMode === 'add' ? 'Simpan Alur Tujuan' : 'Update Perubahan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import ATP Modal */}
      <ImportAtpModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => refreshList()}
        onShowToast={onShowToast}
      />
    </div>
  );
};
