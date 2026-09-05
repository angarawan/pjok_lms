import React, { useState, useRef } from 'react';
import { BookMarked, Plus, Search, Video, FileText, ExternalLink, Edit, Trash2, CheckCircle, Clock, Play, Upload, Paperclip } from 'lucide-react';
import { storage } from '../../services/storage';
import { MateriItem, SessionUser } from '../../types';
import { ImportMateriModal } from './ImportMateriModal';

interface MateriManagerProps {
  currentUser: SessionUser;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const MateriManager: React.FC<MateriManagerProps> = ({ currentUser, onShowToast }) => {
  const [materiList, setMateriList] = useState<MateriItem[]>(storage.getMateri());
  const [search, setSearch] = useState('');
  const [topikFilter, setTopikFilter] = useState('ALL');
  const [selectedMateri, setSelectedMateri] = useState<MateriItem | null>(null);

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const docInputRef = useRef<HTMLInputElement>(null);
  const [judul, setJudul] = useState('');
  const [topik, setTopik] = useState('Permainan Bola Besar');
  const [fase, setFase] = useState('Fase F');
  const [kelas, setKelas] = useState('Kelas XI');
  const [tujuan, setTujuan] = useState('');
  const [isi, setIsi] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISH'>('PUBLISH');

  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'GURU';

  const refreshList = () => {
    setMateriList(storage.getMateri());
  };

  const filteredMateri = materiList.filter(m => {
    const q = (search || '').toLowerCase();
    const matchSearch =
      (m.JUDUL || '').toLowerCase().includes(q) ||
      (m.TOPIK || '').toLowerCase().includes(q) ||
      (m.ISI_MATERI || '').toLowerCase().includes(q);
    const matchTopik = topikFilter === 'ALL' || m.TOPIK === topikFilter;
    // If student, only show published
    const matchPublish = currentUser?.role !== 'MURID' || m.STATUS === 'PUBLISH';
    return matchSearch && matchTopik && matchPublish;
  });

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedMateri(null);
    setJudul('');
    setTopik('Permainan Bola Besar');
    setFase('Fase F');
    setKelas('Kelas XI');
    setTujuan('');
    setIsi('');
    setFileUrl('');
    setUploadedFileName('');
    setVideoUrl('');
    setStatus('PUBLISH');
    setShowModal(true);
  };

  const handleOpenEdit = (m: MateriItem) => {
    setModalMode('edit');
    setSelectedMateri(m);
    setJudul(m.JUDUL);
    setTopik(m.TOPIK);
    setFase(m.FASE);
    setKelas(m.KELAS);
    setTujuan(m.TUJUAN_PEMBELAJARAN);
    setIsi(m.ISI_MATERI);
    setFileUrl(m.FILE_URL || '');
    setUploadedFileName(m.FILE_URL ? 'Lampiran Modul Tersimpan' : '');
    setVideoUrl(m.VIDEO_URL || '');
    setStatus(m.STATUS);
    setShowModal(true);
  };

  const handleLocalDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Ukuran file maksimal 5MB.', 'error');
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setFileUrl(result);
      onShowToast(`File ${file.name} berhasil diunggah sebagai lampiran!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) {
      onShowToast('Judul dan isi materi wajib diisi.', 'error');
      return;
    }

    if (modalMode === 'add') {
      storage.addMateri({
        ATP_ID: 'ATP001',
        JUDUL: judul.trim(),
        TOPIK: topik,
        FASE: fase,
        KELAS: kelas,
        TUJUAN_PEMBELAJARAN: tujuan.trim() || 'Memahami teknik dan strategi dasar PJOK.',
        ISI_MATERI: isi.trim(),
        FILE_URL: fileUrl.trim(),
        VIDEO_URL: videoUrl.trim(),
        GURU_ID: currentUser.ref_id || 'G001',
        NAMA_GURU: currentUser.nama || 'Guru PJOK',
        STATUS: status
      });
      onShowToast('Materi pembelajaran baru berhasil disimpan!', 'success');
    } else if (modalMode === 'edit' && selectedMateri) {
      storage.updateMateri(selectedMateri.MATERI_ID, {
        JUDUL: judul.trim(),
        TOPIK: topik,
        FASE: fase,
        KELAS: kelas,
        TUJUAN_PEMBELAJARAN: tujuan.trim(),
        ISI_MATERI: isi.trim(),
        FILE_URL: fileUrl.trim(),
        VIDEO_URL: videoUrl.trim(),
        STATUS: status
      });
      onShowToast('Materi pembelajaran berhasil diperbarui!', 'success');
    }

    setShowModal(false);
    refreshList();
  };

  const handleDelete = (m: MateriItem) => {
    if (confirm(`Hapus materi "${m.JUDUL}"?`)) {
      storage.deleteMateri(m.MATERI_ID);
      onShowToast('Materi berhasil dihapus.', 'success');
      if (selectedMateri?.MATERI_ID === m.MATERI_ID) {
        setSelectedMateri(null);
      }
      refreshList();
    }
  };

  // Convert regular youtube links to embed
  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    return url;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Materi Pembelajaran PJOK</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Modul ajar, panduan teknik gerak fisik, video demonstrasi & e-book (Sheet <code>09_MATERI</code>)
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2.5 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-teal-700" /> Import / Upload Materi
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Buat Materi Baru
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari materi berdasarkan judul, topik, atau kata kunci..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
          />
        </div>

        <select
          value={topikFilter}
          onChange={(e) => setTopikFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          <option value="ALL">Semua Cabang / Topik</option>
          <option value="Permainan Bola Besar">Permainan Bola Besar</option>
          <option value="Permainan Bola Kecil">Permainan Bola Kecil</option>
          <option value="Atletik">Atletik</option>
          <option value="Kebugaran Jasmani">Kebugaran Jasmani</option>
          <option value="Senam Lantai">Senam Lantai</option>
          <option value="Aktivitas Air / Renang">Aktivitas Air / Renang</option>
          <option value="Kesehatan Reproduksi">Kesehatan Reproduksi</option>
        </select>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMateri.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Belum ada materi pembelajaran yang cocok.
          </div>
        ) : (
          filteredMateri.map((m) => (
            <div
              key={m.MATERI_ID}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {m.TOPIK}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{m.TANGGAL}</span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-teal-700 transition-colors line-clamp-2">
                    {m.JUDUL}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {m.TUJUAN_PEMBELAJARAN}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="font-semibold">{m.FASE}</span>
                  <span>•</span>
                  <span>{m.KELAS}</span>
                  {m.VIDEO_URL && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                        <Video className="w-3.5 h-3.5" /> Video
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedMateri(m)}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <BookMarked className="w-3.5 h-3.5" /> Pelajari Modul
                </button>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg"
                      title="Edit Materi"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(m)}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      title="Hapus Materi"
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

      {/* Reader Modal / Full Detail View */}
      {selectedMateri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {selectedMateri.TOPIK}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {selectedMateri.FASE} • {selectedMateri.KELAS}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {selectedMateri.JUDUL}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Oleh: <strong className="text-slate-700">{selectedMateri.NAMA_GURU}</strong> • {selectedMateri.TANGGAL}
                </p>
              </div>
              <button
                onClick={() => setSelectedMateri(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Video Player if available */}
            {selectedMateri.VIDEO_URL && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                <iframe
                  src={getEmbedUrl(selectedMateri.VIDEO_URL)}
                  title={selectedMateri.JUDUL}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Tujuan Pembelajaran Callout */}
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 text-xs text-teal-900 space-y-1">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-teal-700 block">
                Tujuan Pembelajaran (TP)
              </span>
              <p className="leading-relaxed">{selectedMateri.TUJUAN_PEMBELAJARAN}</p>
            </div>

            {/* Content Body */}
            <div className="prose max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line font-medium bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              {selectedMateri.ISI_MATERI}
            </div>

            {/* Attached File Download */}
            {selectedMateri.FILE_URL && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                  <FileText className="w-5 h-5 text-teal-700" />
                  <span>Lampiran Modul / E-Book PJOK</span>
                </div>
                <a
                  href={selectedMateri.FILE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Dokumen
                </a>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMateri(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Selesai Membaca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {modalMode === 'add' ? 'Buat Materi Pembelajaran PJOK Baru' : 'Edit Materi PJOK'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Materi Pembelajaran</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Teknik Dasar Passing dan Spike Bola Voli Modern"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cabang / Topik</label>
                  <select
                    value={topik}
                    onChange={(e) => setTopik(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-medium"
                  >
                    <option value="Permainan Bola Besar">Permainan Bola Besar</option>
                    <option value="Permainan Bola Kecil">Permainan Bola Kecil</option>
                    <option value="Atletik">Atletik</option>
                    <option value="Kebugaran Jasmani">Kebugaran Jasmani</option>
                    <option value="Senam Lantai">Senam Lantai</option>
                    <option value="Aktivitas Air / Renang">Aktivitas Air / Renang</option>
                    <option value="Kesehatan Reproduksi">Kesehatan Reproduksi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fase</label>
                  <select
                    value={fase}
                    onChange={(e) => setFase(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  >
                    <option value="Fase E">Fase E</option>
                    <option value="Fase F">Fase F</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
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
                <label className="block font-bold text-slate-700 mb-1">Tujuan Pembelajaran</label>
                <input
                  type="text"
                  value={tujuan}
                  onChange={(e) => setTujuan(e.target.value)}
                  placeholder="Peserta didik mampu menganalisis gerak spesifik..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Isi Modul / Langkah Pelaksanaan</label>
                <textarea
                  required
                  rows={6}
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  placeholder="Tuliskan materi pelajaran, tahapan persiapan, pelaksanaan, dan gerakan lanjutan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Link Video YouTube</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Berkas / Modul Ajar</label>
                    <button
                      type="button"
                      onClick={() => docInputRef.current?.click()}
                      className="text-teal-700 hover:text-teal-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Paperclip className="w-3 h-3" /> Upload Berkas
                    </button>
                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*"
                      className="hidden"
                      onChange={handleLocalDocUpload}
                    />
                  </div>
                  <input
                    type="text"
                    value={fileUrl}
                    onChange={(e) => {
                      setFileUrl(e.target.value);
                      setUploadedFileName('');
                    }}
                    placeholder="Link Drive / URL berkas atau klik Upload Berkas..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono"
                  />
                  {uploadedFileName && (
                    <p className="text-[10px] text-teal-700 mt-1 font-semibold flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> Berkas Terlampir: {uploadedFileName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Publikasi</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISH')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-semibold"
                >
                  <option value="PUBLISH">PUBLISH (Dapat dilihat siswa)</option>
                  <option value="DRAFT">DRAFT (Hanya guru & admin)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  {modalMode === 'add' ? 'Simpan Materi' : 'Update Perubahan'}
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

      {/* Import Materi Modal */}
      <ImportMateriModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => refreshList()}
        onShowToast={onShowToast}
        currentUser={currentUser}
      />
    </div>
  );
};
