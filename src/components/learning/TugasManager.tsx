import React, { useState, useRef } from 'react';
import { FileText, Plus, Calendar, Clock, CheckCircle, Upload, Eye, ExternalLink, Award, Search, Paperclip } from 'lucide-react';
import { storage } from '../../services/storage';
import { TugasItem, PengumpulanTugasItem, SessionUser } from '../../types';
import { ImportTugasModal } from './ImportTugasModal';

interface TugasManagerProps {
  currentUser: SessionUser;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TugasManager: React.FC<TugasManagerProps> = ({ currentUser, onShowToast }) => {
  const [tugasList, setTugasList] = useState<TugasItem[]>(storage.getTugas());
  const [pengumpulanList, setPengumpulanList] = useState<PengumpulanTugasItem[]>(storage.getPengumpulanTugas());
  const [search, setSearch] = useState('');
  const kelasList = storage.getKelas();

  const isTeacherOrAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'GURU';

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);

  // Selected items
  const [selectedTugas, setSelectedTugas] = useState<TugasItem | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<PengumpulanTugasItem | null>(null);

  // Form states - Create Task
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [materiId, setMateriId] = useState('M001');
  const [kelasId, setKelasId] = useState(kelasList[0]?.KELAS_ID || 'XI-01');
  const [deadline, setDeadline] = useState('2026-10-15');
  const [bobot, setBobot] = useState(20);

  // Form states - Student Submission
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionCatatan, setSubmissionCatatan] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states - Teacher Grading
  const [gradeNilai, setGradeNilai] = useState<number>(85);
  const [gradeCatatan, setGradeCatatan] = useState('');

  const refreshData = () => {
    setTugasList(storage.getTugas());
    setPengumpulanList(storage.getPengumpulanTugas());
  };

  const filteredTugas = tugasList.filter(t => {
    const title = t.JUDUL_TUGAS || t.JUDUL || '';
    const desc = t.DESKRIPSI || '';
    const matchSearch =
      title.toLowerCase().includes((search || '').toLowerCase()) ||
      desc.toLowerCase().includes((search || '').toLowerCase());
    // If student, show only their class tasks
    const matchClass =
      currentUser.role !== 'MURID' ||
      !currentUser.nama_kelas ||
      t.KELAS_ID === currentUser.nama_kelas ||
      (t.KELAS_ID && t.KELAS_ID.includes(currentUser.nama_kelas.replace('Kelas ', '')));
    return matchSearch && matchClass;
  });

  const handleCreateTugas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim()) {
      onShowToast('Judul dan instruksi tugas wajib diisi.', 'error');
      return;
    }

    storage.addTugas({
      MATERI_ID: materiId,
      JUDUL: judul.trim(),
      JUDUL_TUGAS: judul.trim(),
      DESKRIPSI: deskripsi.trim(),
      KELAS_ID: kelasId,
      DEADLINE: deadline,
      BOBOT: Number(bobot) || 20,
      STATUS: 'AKTIF'
    });

    onShowToast('Tugas PJOK baru berhasil diterbitkan!', 'success');
    setShowCreateModal(false);
    refreshData();
  };

  const handleStudentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      onShowToast('Ukuran berkas maksimal 15MB.', 'error');
      return;
    }

    setSubmissionFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setSubmissionLink(result);
      onShowToast(`Berkas ${file.name} siap dikirim!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitTugas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTugas) return;
    if (!submissionLink.trim()) {
      onShowToast('Harap sertakan link video gerakan atau unggah file tugas.', 'error');
      return;
    }

    const existing = pengumpulanList.find(
      p => p.TUGAS_ID === selectedTugas.TUGAS_ID && p.MURID_ID === currentUser.ref_id
    );

    if (existing) {
      storage.updatePengumpulanTugas(existing.PENGUMPULAN_ID, {
        LINK_TUGAS: submissionLink.trim(),
        CATATAN: submissionCatatan.trim(),
        STATUS: 'DIKUMPUL',
        WAKTU_KUMPUL: new Date().toISOString().replace('T', ' ').slice(0, 16)
      });
    } else {
      storage.addPengumpulanTugas({
        TUGAS_ID: selectedTugas.TUGAS_ID,
        MURID_ID: currentUser.ref_id || 'M001',
        NAMA_MURID: currentUser.nama || 'Murid',
        KELAS_ID: selectedTugas.KELAS_ID,
        FILE_URL: '',
        LINK_TUGAS: submissionLink.trim(),
        STATUS: 'DIKUMPUL',
        CATATAN: submissionCatatan.trim(),
        GURU_CATATAN: ''
      });
    }

    onShowToast('Tugas video praktik / tugas fisik berhasil dikumpulkan!', 'success');
    setShowSubmitModal(false);
    setSubmissionLink('');
    setSubmissionFileName('');
    setSubmissionCatatan('');
    refreshData();
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    storage.updatePengumpulanTugas(selectedSubmission.PENGUMPULAN_ID, {
      NILAI: Number(gradeNilai),
      GURU_CATATAN: gradeCatatan.trim(),
      STATUS: 'DINILAI'
    });

    onShowToast(`Nilai berhasil disimpan untuk ${selectedSubmission.NAMA_MURID}!`, 'success');
    setShowGradeModal(false);
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Tugas & Praktik Lapangan PJOK</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengumpulan rekaman gerak fisik mandiri, tugas portofolio & koreksi guru (Sheet <code>10_TUGAS</code> & <code>11_PENGUMPULAN_TUGAS</code>)
          </p>
        </div>
        {isTeacherOrAdmin && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2.5 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-teal-700" /> Import / Upload Tugas
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Berikan Tugas Baru
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tugas berdasarkan judul atau instruksi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTugas.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada penugasan saat ini.
          </div>
        ) : (
          filteredTugas.map((t, idx) => {
            const submissionsForTask = pengumpulanList.filter(p => p.TUGAS_ID === t.TUGAS_ID);
            const mySubmission = pengumpulanList.find(
              p => p.TUGAS_ID === t.TUGAS_ID && p.MURID_ID === currentUser.ref_id
            );

            return (
              <div
                key={`tugas-card-${t.TUGAS_ID || 'tug'}-${idx}`}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      Kelas: {t.KELAS_ID}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Bobot: {t.BOBOT}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 line-clamp-2">
                      {t.JUDUL_TUGAS || t.JUDUL}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                      {t.DESKRIPSI}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>Batas Akhir: <strong className="text-slate-700">{t.DEADLINE}</strong></span>
                  </div>
                </div>

                {/* Card Action Area */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  {currentUser.role === 'MURID' ? (
                    mySubmission ? (
                      <div className="flex items-center justify-between w-full">
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                          mySubmission.STATUS === 'DINILAI'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {mySubmission.STATUS === 'DINILAI'
                            ? `Nilai: ${mySubmission.NILAI}`
                            : 'Terkirim'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedTugas(t);
                            setSubmissionLink(mySubmission.LINK_TUGAS || '');
                            setSubmissionCatatan(mySubmission.CATATAN || '');
                            setShowSubmitModal(true);
                          }}
                          className="text-xs font-semibold text-teal-700 hover:underline"
                        >
                          Ubah Kiriman
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedTugas(t);
                          setSubmissionLink('');
                          setSubmissionCatatan('');
                          setShowSubmitModal(true);
                        }}
                        className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" /> Kumpulkan Tugas Video
                      </button>
                    )
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-medium text-slate-500">
                        {submissionsForTask.length} Jawaban Masuk
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTugas(t);
                          setShowSubmissionsModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Periksa & Nilai
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Create Task */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Terbitkan Penugasan PJOK Baru</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTugas} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Penugasan</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Rekaman Praktik Mandiri Passing Bawah Bola Voli 1 Menit"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rombel Sasaran</label>
                  <select
                    value={kelasId}
                    onChange={(e) => setKelasId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-bold text-teal-800"
                  >
                    {kelasList.map(k => (
                      <option key={k.KELAS_ID} value={k.KELAS_ID}>{k.NAMA_KELAS}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batas Akhir (Deadline)</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Petunjuk & Rincian Gerak</label>
                <textarea
                  required
                  rows={4}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Instruksikan posisi kamera, durasi rekaman, dan aspek sikap yang harus terlihat jelas..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bobot Penilaian (%)</label>
                  <input
                    type="number"
                    value={bobot}
                    onChange={(e) => setBobot(Number(e.target.value))}
                    min={5}
                    max={100}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Terbitkan Tugas
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Student Submission Form */}
      {showSubmitModal && selectedTugas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Pengumpulan Tugas Praktik PJOK</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 text-xs text-teal-900">
              <div className="font-bold">{selectedTugas.JUDUL_TUGAS || selectedTugas.JUDUL}</div>
              <div className="text-[11px] text-teal-700 mt-1">{selectedTugas.DESKRIPSI}</div>
            </div>

            <form onSubmit={handleSubmitTugas} className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    Tautan Video / Unggah Berkas Jawaban
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-teal-700 hover:text-teal-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Paperclip className="w-3 h-3" /> Unggah Berkas / Video
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,image/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleStudentFileUpload}
                  />
                </div>
                <input
                  type="text"
                  required
                  value={submissionLink}
                  onChange={(e) => {
                    setSubmissionLink(e.target.value);
                    setSubmissionFileName('');
                  }}
                  placeholder="https://drive.google.com/..., YouTube URL, atau klik Unggah Berkas..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono"
                />
                {submissionFileName ? (
                  <p className="text-[10px] text-teal-700 mt-1 font-semibold flex items-center gap-1">
                    <Paperclip className="w-3 h-3" /> Berkas Terunggah: {submissionFileName}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Bisa berupa tautan YouTube / Google Drive atau unggah berkas video/gambar langsung.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan untuk Guru (Opsional)</label>
                <textarea
                  rows={2}
                  value={submissionCatatan}
                  onChange={(e) => setSubmissionCatatan(e.target.value)}
                  placeholder="Ceritakan kendala atau waktu pengambilan video..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Kirimkan Tugas Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: View All Submissions for a Task */}
      {showSubmissionsModal && selectedTugas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Pengumpulan Siswa: {selectedTugas.JUDUL_TUGAS || selectedTugas.JUDUL}
                </h3>
                <p className="text-xs text-slate-400">Kelas: {selectedTugas.KELAS_ID} • Bobot: {selectedTugas.BOBOT}%</p>
              </div>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Waktu Kumpul</th>
                    <th className="py-2.5 px-3">Link Tugas</th>
                    <th className="py-2.5 px-3">Catatan Siswa</th>
                    <th className="py-2.5 px-3 text-center">Nilai</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {pengumpulanList.filter(p => p.TUGAS_ID === selectedTugas.TUGAS_ID).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada siswa yang mengumpulkan tugas ini.
                      </td>
                    </tr>
                  ) : (
                    pengumpulanList
                      .filter(p => p.TUGAS_ID === selectedTugas.TUGAS_ID)
                      .map((sub, sIdx) => (
                        <tr key={`sub-row-${sub.PENGUMPULAN_ID || 'sub'}-${sIdx}`} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold text-slate-800">{sub.NAMA_MURID}</td>
                          <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{sub.WAKTU_KUMPUL}</td>
                          <td className="py-3 px-3">
                            <a
                              href={sub.LINK_TUGAS}
                              target="_blank"
                              rel="noreferrer"
                              className="text-teal-700 hover:underline flex items-center gap-1 font-semibold"
                            >
                              Buka Video <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{sub.CATATAN || '-'}</td>
                          <td className="py-3 px-3 text-center font-bold text-slate-900">
                            {sub.NILAI !== undefined ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {sub.NILAI}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setGradeNilai(sub.NILAI || 85);
                                setGradeCatatan(sub.GURU_CATATAN || '');
                                setShowGradeModal(true);
                              }}
                              className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold"
                            >
                              {sub.NILAI !== undefined ? 'Koreksi' : 'Beri Nilai'}
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Teacher Grading Modal */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Penilaian Tugas Siswa</h3>
              <button
                onClick={() => setShowGradeModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
              <div>Siswa: <strong className="text-slate-900">{selectedSubmission.NAMA_MURID}</strong></div>
              <div>
                Tautan Rekaman:{' '}
                <a
                  href={selectedSubmission.LINK_TUGAS}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 font-semibold underline"
                >
                  Buka Video Siswa
                </a>
              </div>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai Praktik (0 - 100)</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={gradeNilai}
                  onChange={(e) => setGradeNilai(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-bold text-xl text-teal-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Evaluasi / Koreksi Gerak</label>
                <textarea
                  rows={3}
                  value={gradeCatatan}
                  onChange={(e) => setGradeCatatan(e.target.value)}
                  placeholder="Contoh: Ayunan lengan sudah baik, namun perkenaan bola masih terlalu tinggi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Simpan Nilai
                </button>
                <button
                  type="button"
                  onClick={() => setShowGradeModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Tugas Modal */}
      <ImportTugasModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => refreshData()}
        onShowToast={onShowToast}
        currentUser={currentUser}
        defaultKelasId={kelasList[0]?.KELAS_ID || 'XI-01'}
      />
    </div>
  );
};
