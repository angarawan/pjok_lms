import React, { useState, useMemo } from 'react';
import { Award, Save, Trash2, Plus, RefreshCw, Users, User, CheckSquare, Square, Search, CheckCircle2 } from 'lucide-react';
import { storage } from '../../services/storage';
import { PenilaianItem, SessionUser } from '../../types';

interface PenilaianPraktikProps {
  currentUser: SessionUser;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export interface TeknikPraktikItem {
  id: string;
  nama: string;
}

type TargetMode = 'ALL' | 'MULTIPLE' | 'SINGLE';

const DEFAULT_TEKNIK_BY_MATERI: Record<string, string[]> = {
  'Bola Voli': ['Passing Bawah', 'Passing Atas', 'Servis Bawah'],
  'Bola Basket': ['Dribbling', 'Passing (Chest Pass)', 'Shooting / Lay-up'],
  'Sepak Bola': ['Passing & Control', 'Dribbling', 'Shooting ke Gawang'],
  'Atletik': ['Start Jongkok', 'Gerakan Lari Sprint', 'Teknik Memasuki Finish'],
  'Kebugaran Jasmani': ['Daya Tahan Jantung-Paru', 'Kekuatan Otot', 'Kelenturan'],
  'Senam Lantai': ['Sikap Awalan', 'Roll Depan / Belakang', 'Sikap Pendaratan & Keseimbangan'],
  'Bulu Tangkis': ['Pegang Raket (Grip)', 'Servis Pendek / Panjang', 'Pukulan Forehand / Lob'],
  'Tenis Meja': ['Servis', 'Drive Forehand', 'Footwork'],
  'Renang': ['Gerakan Tungkai Kaki', 'Ayunan Lengan', 'Teknik Pengambilan Napas'],
  'Pencak Silat': ['Sikap Pasang & Kuda-kuda', 'Pukulan & Tendangan', 'Tangkisan / Elakan']
};

const SPORT_OPTIONS = [
  'Bola Voli',
  'Bola Basket',
  'Sepak Bola',
  'Atletik',
  'Kebugaran Jasmani',
  'Senam Lantai',
  'Bulu Tangkis',
  'Tenis Meja',
  'Renang',
  'Pencak Silat',
  'Lainnya (Ketik Manual)'
];

export const PenilaianPraktik: React.FC<PenilaianPraktikProps> = ({ currentUser, onShowToast }) => {
  const kelasList = storage.getKelas();
  const murids = storage.getMurid();
  const [penilaianList, setPenilaianList] = useState<PenilaianItem[]>(storage.getPenilaian());

  // Form selections
  const [selectedKelas, setSelectedKelas] = useState(kelasList[0]?.KELAS_ID || 'XI-01');
  const classStudents = useMemo(() => {
    return murids.filter(m => m.KELAS_ID === selectedKelas && m.STATUS === 'AKTIF');
  }, [murids, selectedKelas]);

  // Target Student Mode: 'ALL' | 'MULTIPLE' | 'SINGLE'
  const [targetMode, setTargetMode] = useState<TargetMode>('ALL');
  const [selectedMuridId, setSelectedMuridId] = useState<string>(classStudents[0]?.MURID_ID || '');
  const [selectedMuridIds, setSelectedMuridIds] = useState<string[]>([]);
  const [searchStudentQuery, setSearchStudentQuery] = useState<string>('');
  const [showMultiPicker, setShowMultiPicker] = useState<boolean>(false);

  const [materiPJOK, setMateriPJOK] = useState('Bola Voli');
  const [customMateri, setCustomMateri] = useState('');
  const [jenisPenilaian, setJenisPenilaian] = useState<'FORMATIF' | 'SUMATIF' | 'PRAKTIK'>('PRAKTIK');
  const [globalCatatan, setGlobalCatatan] = useState('');

  // Dynamic Manual Techniques definition (e.g. T1: Passing Bawah, T2: Passing Atas)
  const [teknikList, setTeknikList] = useState<TeknikPraktikItem[]>([
    { id: 'T1', nama: 'Passing Bawah' },
    { id: 'T2', nama: 'Passing Atas' },
    { id: 'T3', nama: 'Servis Bawah' }
  ]);

  // Scores state: Record<MURID_ID, { scores: Record<TEKNIK_ID, number>, catatan: string }>
  const [studentScores, setStudentScores] = useState<Record<string, { scores: Record<string, number>; catatan: string }>>({});

  const refreshList = () => {
    setPenilaianList(storage.getPenilaian());
  };

  // Sync selected murid when class changes
  React.useEffect(() => {
    if (classStudents.length > 0) {
      setSelectedMuridId(classStudents[0].MURID_ID);
      setSelectedMuridIds(classStudents.map(s => s.MURID_ID));
    } else {
      setSelectedMuridId('');
      setSelectedMuridIds([]);
    }
  }, [selectedKelas, classStudents]);

  // Target students to grade based on mode
  const targetStudents = useMemo(() => {
    if (targetMode === 'ALL') {
      return classStudents;
    } else if (targetMode === 'SINGLE') {
      const found = classStudents.find(s => s.MURID_ID === selectedMuridId);
      return found ? [found] : (classStudents[0] ? [classStudents[0]] : []);
    } else {
      // MULTIPLE
      return classStudents.filter(s => selectedMuridIds.includes(s.MURID_ID));
    }
  }, [targetMode, classStudents, selectedMuridId, selectedMuridIds]);

  // Filtered displayed students in the list (if teacher searches)
  const displayedStudents = useMemo(() => {
    if (!searchStudentQuery.trim()) return targetStudents;
    const q = searchStudentQuery.toLowerCase();
    return targetStudents.filter(s =>
      s.NAMA_MURID.toLowerCase().includes(q) ||
      s.NIS.toLowerCase().includes(q)
    );
  }, [targetStudents, searchStudentQuery]);

  // Score helpers
  const getStudentTeknikScore = (muridId: string, teknikId: string): number => {
    return studentScores[muridId]?.scores?.[teknikId] ?? 3; // Default 3
  };

  const getStudentCatatan = (muridId: string): string => {
    return studentScores[muridId]?.catatan ?? '';
  };

  const setStudentTeknikScore = (muridId: string, teknikId: string, skor: number) => {
    setStudentScores(prev => ({
      ...prev,
      [muridId]: {
        scores: {
          ...(prev[muridId]?.scores || {}),
          [teknikId]: skor
        },
        catatan: prev[muridId]?.catatan ?? ''
      }
    }));
  };

  const setStudentCatatan = (muridId: string, catatan: string) => {
    setStudentScores(prev => ({
      ...prev,
      [muridId]: {
        scores: prev[muridId]?.scores || {},
        catatan
      }
    }));
  };

  const setAllTeknikForStudent = (muridId: string, skor: number) => {
    const newScores: Record<string, number> = {};
    teknikList.forEach(t => { newScores[t.id] = skor; });
    setStudentScores(prev => ({
      ...prev,
      [muridId]: {
        scores: newScores,
        catatan: prev[muridId]?.catatan ?? ''
      }
    }));
  };

  const setAllScoresForAllTargetStudents = (skor: number) => {
    setStudentScores(prev => {
      const updated = { ...prev };
      targetStudents.forEach(s => {
        const newScores: Record<string, number> = {};
        teknikList.forEach(t => { newScores[t.id] = skor; });
        updated[s.MURID_ID] = {
          scores: newScores,
          catatan: updated[s.MURID_ID]?.catatan ?? ''
        };
      });
      return updated;
    });
    onShowToast(`Semua teknik untuk ${targetStudents.length} murid diset ke angka ${skor}.`, 'info');
  };

  // Calculation for a student
  const computeStudentScore = (muridId: string) => {
    const totalSkor = teknikList.reduce((acc, t) => acc + getStudentTeknikScore(muridId, t.id), 0);
    const maxSkor = Math.max(teknikList.length * 4, 1);
    const nilai = Math.round((totalSkor / maxSkor) * 100);
    return { totalSkor, maxSkor, nilai };
  };

  const getPredikatLetter = (nilai: number): 'A' | 'B' | 'C' | 'D' => {
    if (nilai >= 90) return 'A';
    if (nilai >= 80) return 'B';
    if (nilai >= 70) return 'C';
    return 'D';
  };

  const getPredikatLabel = (nilai: number): string => {
    if (nilai >= 90) return 'A (Sangat Baik)';
    if (nilai >= 80) return 'B (Baik)';
    if (nilai >= 70) return 'C (Cukup)';
    return 'D (Kurang)';
  };

  // Changing materi
  const handleMateriChange = (newMateri: string) => {
    setMateriPJOK(newMateri);
    if (newMateri !== 'Lainnya (Ketik Manual)') {
      const defaults = DEFAULT_TEKNIK_BY_MATERI[newMateri] || ['Teknik 1', 'Teknik 2'];
      setTeknikList(
        defaults.map((nama, idx) => ({
          id: `T_${Date.now()}_${idx}`,
          nama
        }))
      );
    }
  };

  // Technique manipulation
  const handleAddTeknik = () => {
    setTeknikList(prev => [
      ...prev,
      {
        id: `T_${Date.now()}`,
        nama: ''
      }
    ]);
  };

  const handleUpdateTeknikNama = (id: string, nama: string) => {
    setTeknikList(prev => prev.map(t => t.id === id ? { ...t, nama } : t));
  };

  const handleRemoveTeknik = (id: string) => {
    if (teknikList.length <= 1) {
      onShowToast('Minimal harus ada 1 teknik yang dinilai.', 'info');
      return;
    }
    setTeknikList(prev => prev.filter(t => t.id !== id));
  };

  const handleResetDefaultTeknik = () => {
    const defaults = DEFAULT_TEKNIK_BY_MATERI[materiPJOK] || ['Teknik 1', 'Teknik 2'];
    setTeknikList(
      defaults.map((nama, idx) => ({
        id: `T_${Date.now()}_${idx}`,
        nama
      }))
    );
    onShowToast(`Teknik telah direset ke standar ${materiPJOK}.`, 'info');
  };

  // Multiple students selection toggle
  const toggleStudentSelection = (muridId: string) => {
    setSelectedMuridIds(prev =>
      prev.includes(muridId) ? prev.filter(id => id !== muridId) : [...prev, muridId]
    );
  };

  const selectAllStudents = () => {
    setSelectedMuridIds(classStudents.map(s => s.MURID_ID));
  };

  const clearAllStudents = () => {
    setSelectedMuridIds([]);
  };

  // Form Submit (Batch or Single)
  const handleSimpanPenilaian = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetStudents.length === 0) {
      onShowToast('Tidak ada murid yang dipilih untuk dinilai.', 'error');
      return;
    }

    const effectiveMateri = materiPJOK === 'Lainnya (Ketik Manual)'
      ? (customMateri.trim() || 'Praktik PJOK')
      : materiPJOK;

    const emptyTeknik = teknikList.find(t => !t.nama.trim());
    if (emptyTeknik) {
      onShowToast('Pastikan semua nama teknik yang dinilai sudah diisi.', 'error');
      return;
    }

    const itemsToSave = targetStudents.map(student => {
      const { nilai } = computeStudentScore(student.MURID_ID);
      const aspekDetail = teknikList.map(t => `${t.nama.trim()}: ${getStudentTeknikScore(student.MURID_ID, t.id)}/4`).join(' | ');
      const note = getStudentCatatan(student.MURID_ID).trim() || globalCatatan.trim() || 'Gerakan telah memenuhi rubrik penilaian praktik PJOK.';

      return {
        MURID_ID: student.MURID_ID,
        NAMA_MURID: student.NAMA_MURID,
        KELAS_ID: selectedKelas,
        MATERI: effectiveMateri,
        JENIS_PENILAIAN: jenisPenilaian,
        ASPEK: aspekDetail,
        NILAI: nilai,
        PREDIKAT: getPredikatLetter(nilai),
        KETERANGAN: note
      };
    });

    storage.addPenilaianBatch(itemsToSave);
    onShowToast(`Berhasil menyimpan nilai praktik untuk ${itemsToSave.length} murid (${effectiveMateri})!`, 'success');
    refreshList();
  };

  const handleDeletePenilaian = (id: string) => {
    if (confirm('Hapus entri penilaian ini?')) {
      const db = storage.getDatabase();
      db['16_PENILAIAN'] = db['16_PENILAIAN'].filter(p => p.NILAI_ID !== id);
      storage.saveDatabase(db);
      onShowToast('Nilai berhasil dihapus.', 'info');
      refreshList();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Penilaian Praktik PJOK</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Asesmen praktik unjuk kerja gerak per individu atau seluruh rombel kelas sekaligus (Sheet <code>16_PENILAIAN</code>)
          </p>
        </div>
      </div>

      {/* Main Rubric & Selection Setup Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSimpanPenilaian} className="space-y-6 text-xs">
          {/* Row 1: Rombel, Target Siswa, Materi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Pilih Kelas */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                1. Pilih Kelas Rombel
              </label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-bold text-teal-800"
              >
                {kelasList.map(k => (
                  <option key={k.KELAS_ID} value={k.KELAS_ID}>{k.NAMA_KELAS}</option>
                ))}
              </select>
            </div>

            {/* 2. Pilih Peserta Didik (Semua Murid / Beberapa / Satu Murid) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                2. Pilih Peserta Didik
              </label>
              <select
                value={targetMode}
                onChange={(e) => {
                  const mode = e.target.value as TargetMode;
                  setTargetMode(mode);
                  if (mode === 'MULTIPLE') setShowMultiPicker(true);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-bold text-slate-800"
              >
                <option value="ALL">👥 Semua Murid ({classStudents.length} Siswa)</option>
                <option value="MULTIPLE">☑️ Pilih Beberapa Murid ({selectedMuridIds.length} Dipilih)</option>
                <option value="SINGLE">👤 Satu Murid Saja</option>
              </select>

              {/* Sub-selector for SINGLE mode */}
              {targetMode === 'SINGLE' && (
                <div className="mt-2">
                  <select
                    value={selectedMuridId}
                    onChange={(e) => setSelectedMuridId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-600 font-semibold text-slate-800 text-xs"
                  >
                    {classStudents.map(s => (
                      <option key={s.MURID_ID} value={s.MURID_ID}>
                        {s.NIS} - {s.NAMA_MURID} ({s.JENIS_KELAMIN})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Toggle button for MULTIPLE mode picker */}
              {targetMode === 'MULTIPLE' && (
                <button
                  type="button"
                  onClick={() => setShowMultiPicker(!showMultiPicker)}
                  className="mt-2 text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  {showMultiPicker ? 'Tutup Daftar Pilihan Siswa' : `Atur Siswa (${selectedMuridIds.length}/${classStudents.length} Terpilih)`}
                </button>
              )}
            </div>

            {/* 3. Materi Uji Praktik */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                3. Materi Uji Praktik
              </label>
              <select
                value={materiPJOK}
                onChange={(e) => handleMateriChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-bold text-slate-800"
              >
                {SPORT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {materiPJOK === 'Lainnya (Ketik Manual)' && (
                <input
                  type="text"
                  value={customMateri}
                  onChange={(e) => setCustomMateri(e.target.value)}
                  placeholder="Ketik nama materi (misal: Tolak Peluru)"
                  className="mt-2 w-full px-3 py-2 bg-white border border-teal-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-600 font-semibold text-teal-900"
                />
              )}
            </div>
          </div>

          {/* Multiple Students Picker Checklist (visible when in MULTIPLE mode and toggled open) */}
          {targetMode === 'MULTIPLE' && showMultiPicker && (
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-teal-900 text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-700" />
                  Pilih Siswa yang Dinilai ({selectedMuridIds.length} dari {classStudents.length} Siswa Terpilih)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllStudents}
                    className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Pilih Semua
                  </button>
                  <button
                    type="button"
                    onClick={clearAllStudents}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                {classStudents.map(s => {
                  const isChecked = selectedMuridIds.includes(s.MURID_ID);
                  return (
                    <label
                      key={s.MURID_ID}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer text-[11px] transition-colors ${
                        isChecked
                          ? 'bg-white border-teal-400 text-teal-900 font-bold shadow-2xs'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleStudentSelection(s.MURID_ID)}
                        className="rounded text-teal-700 focus:ring-teal-600 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="truncate">{s.NAMA_MURID} ({s.JENIS_KELAMIN})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Pengaturan Kriteria Teknik yang Dinilai */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-700" />
                  Kriteria Teknik yang Dinilai ({teknikList.length} Teknik)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Atur atau ubah nama teknik yang diuji. Skor setiap teknik (1 - 4) dapat langsung diisi pada form nama murid di bawah.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {DEFAULT_TEKNIK_BY_MATERI[materiPJOK] && (
                  <button
                    type="button"
                    onClick={handleResetDefaultTeknik}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reset teknik ke standar materi ini"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Standar
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddTeknik}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Teknik
                </button>
              </div>
            </div>

            {/* Editable Technique Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {teknikList.map((tech, index) => (
                <div
                  key={`tech-def-${tech.id}-${index}`}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                >
                  <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 font-black text-[11px] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={tech.nama}
                    onChange={(e) => handleUpdateTeknikNama(tech.id, e.target.value)}
                    placeholder={`Teknik ke-${index + 1}`}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-teal-600 outline-none text-xs"
                  />
                  {teknikList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTeknik(tech.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Hapus teknik ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Form Penilaian Setiap Nama Murid (Active Students) */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-700" />
                <div>
                  <span className="font-extrabold text-sm text-slate-800">
                    Form Penilaian Murid
                  </span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px]">
                    {targetStudents.length} Siswa Terdaftar
                  </span>
                </div>
              </div>

              {/* Quick Actions & Search */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search in class */}
                {targetStudents.length > 5 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchStudentQuery}
                      onChange={(e) => setSearchStudentQuery(e.target.value)}
                      placeholder="Cari nama siswa..."
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-600 w-44"
                    />
                  </div>
                )}

                {/* Bulk score setter */}
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold mr-1">Set Semua ke:</span>
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAllScoresForAllTargetStudents(num)}
                      className="w-6 h-6 rounded-md font-bold text-xs bg-slate-100 hover:bg-teal-700 hover:text-white text-slate-700 transition-colors cursor-pointer"
                      title={`Set semua teknik seluruh murid ke ${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List of Student Scoring Forms */}
            {displayedStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                Tidak ada murid yang ditemukan untuk dinilai.
              </div>
            ) : (
              <div className="space-y-3">
                {displayedStudents.map((student, idx) => {
                  const { totalSkor, maxSkor, nilai } = computeStudentScore(student.MURID_ID);
                  const predikatLabel = getPredikatLabel(nilai);
                  const studentNote = getStudentCatatan(student.MURID_ID);

                  return (
                    <div
                      key={`student-card-${student.MURID_ID}-${idx}`}
                      className="p-4 bg-white hover:bg-slate-50/70 rounded-2xl border border-slate-200 shadow-2xs space-y-3 transition-all"
                    >
                      {/* Student Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-teal-50 text-teal-800 font-black text-xs flex items-center justify-center border border-teal-200">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                              {student.NAMA_MURID}
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                {student.JENIS_KELAMIN}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              NIS: {student.NIS} • Kelas: {student.KELAS_ID}
                            </div>
                          </div>
                        </div>

                        {/* Calculated Score for this Student & Quick set for this student */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <span>Set:</span>
                            {[1, 2, 3, 4].map(num => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setAllTeknikForStudent(student.MURID_ID, num)}
                                className="w-5 h-5 rounded font-bold text-[10px] bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-600 cursor-pointer transition-colors"
                                title={`Set semua teknik ${student.NAMA_MURID} ke ${num}`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>

                          <div className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-right">
                            <div className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                              Skor: {totalSkor}/{maxSkor}
                            </div>
                            <div className="text-xs font-black text-teal-950">
                              Nilai: {nilai} • {predikatLabel}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scoring Form per Technique for this Student (Tombol Kecil 1-4 Saja) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                        {teknikList.map((tech, tIdx) => {
                          const currentSkor = getStudentTeknikScore(student.MURID_ID, tech.id);
                          return (
                            <div
                              key={`tech-score-${student.MURID_ID}-${tech.id}-${tIdx}`}
                              className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2"
                            >
                              <div className="truncate flex-1">
                                <span className="font-bold text-slate-700 text-xs block truncate" title={tech.nama || `Teknik ke-${tIdx + 1}`}>
                                  {tech.nama || `Teknik ke-${tIdx + 1}`}
                                </span>
                              </div>

                              {/* Tombol kecil angka 1 - 4 saja */}
                              <div className="flex items-center gap-1 shrink-0">
                                {[1, 2, 3, 4].map(num => {
                                  const isSelected = currentSkor === num;
                                  return (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() => setStudentTeknikScore(student.MURID_ID, tech.id, num)}
                                      className={`w-7 h-7 rounded-lg font-black text-xs transition-all flex items-center justify-center cursor-pointer ${
                                        isSelected
                                          ? 'bg-teal-700 text-white shadow-xs scale-105 ring-2 ring-teal-600/30'
                                          : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 hover:border-slate-300'
                                      }`}
                                      title={`Skor ${num}`}
                                    >
                                      {num}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Catatan Khusus Siswa Ini (Opsional) */}
                      <div className="pt-1">
                        <input
                          type="text"
                          value={studentNote}
                          onChange={(e) => setStudentCatatan(student.MURID_ID, e.target.value)}
                          placeholder={`Catatan evaluasi untuk ${student.NAMA_MURID} (opsional)...`}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-600 text-slate-700 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Bar: Global Catatan & Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:flex-1">
              <input
                type="text"
                value={globalCatatan}
                onChange={(e) => setGlobalCatatan(e.target.value)}
                placeholder="Catatan umum rombel (opsional jika catatan individu dikosongkan)..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-600 text-xs text-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={targetStudents.length === 0}
              className="w-full sm:w-auto px-6 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" />
              Simpan Penilaian Praktik ({targetStudents.length} Murid)
            </button>
          </div>
        </form>
      </div>

      {/* History / Rekapitulasi Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Rekapitulasi Nilai Praktik Tersimpan</h3>
            <p className="text-xs text-slate-400">Sheet <code>16_PENILAIAN</code></p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{penilaianList.length} Catatan Nilai</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Materi Praktik</th>
                <th className="py-3 px-4">Rincian Teknik & Skor</th>
                <th className="py-3 px-4 text-center">Nilai</th>
                <th className="py-3 px-4 text-center">Predikat</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {penilaianList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Belum ada data nilai praktik.
                  </td>
                </tr>
              ) : (
                penilaianList.map((p, idx) => (
                  <tr key={`nilai-row-${p.NILAI_ID}-${idx}`} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{p.NAMA_MURID}</td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{p.KELAS_ID}</td>
                    <td className="py-3 px-4 text-teal-800 font-bold">{p.MATERI}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-600">{p.ASPEK}</td>
                    <td className="py-3 px-4 text-center font-black text-slate-900 text-sm">{p.NILAI}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                        {p.PREDIKAT}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">{p.KETERANGAN}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeletePenilaian(p.NILAI_ID)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Hapus Nilai"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
};
