import React, { useState } from 'react';
import { FileSpreadsheet, Plus, Calendar, Clock, BookOpen, Trash2, Download } from 'lucide-react';
import { storage } from '../../services/storage';
import { JurnalItem, SessionUser } from '../../types';

interface JurnalMengajarProps {
  currentUser: SessionUser;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const JurnalMengajar: React.FC<JurnalMengajarProps> = ({ currentUser, onShowToast }) => {
  const [jurnals, setJurnals] = useState<JurnalItem[]>(storage.getJurnal());
  const kelasList = storage.getKelas();

  const [showAddModal, setShowAddModal] = useState(false);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jamKe, setJamKe] = useState('1 - 3');
  const [kelasId, setKelasId] = useState(kelasList[0]?.KELAS_ID || 'XI-01');
  const [materi, setMateri] = useState('Teknik Passing Bawah Bola Voli');
  const [kegiatan, setKegiatan] = useState('Pemanasan statis dinamis, demonstrasi teknik, latihan berpasangan 30 menit, pendinginan.');
  const [hambatan, setHambatan] = useState('Sebagian siswa putri masih takut terhadap benturan bola voli keras.');
  const [solusi, setSolusi] = useState('Menggunakan bola spons/busa untuk melatih kenyamanan dan teknik perkenaan lengan bawah.');

  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'GURU';

  const refreshList = () => {
    setJurnals(storage.getJurnal());
  };

  const handleDownloadCSV = () => {
    if (jurnals.length === 0) {
      onShowToast('Belum ada data jurnal mengajar untuk diunduh.', 'error');
      return;
    }

    const headers = [
      'NO',
      'TANGGAL',
      'KELAS',
      'JAM_KE',
      'NAMA_GURU',
      'MATERI_PEMBELAJARAN',
      'KEGIATAN_PEMBELAJARAN',
      'HAMBATAN_KENDALA',
      'SOLUSI_TINDAK_LANJUT'
    ];

    const rows = jurnals.map((j, idx) => [
      idx + 1,
      `"${(j.TANGGAL || '').replace(/"/g, '""')}"`,
      `"${(j.KELAS_ID || '').replace(/"/g, '""')}"`,
      `"${(j.JAM_KE || '').replace(/"/g, '""')}"`,
      `"${(j.NAMA_GURU || '').replace(/"/g, '""')}"`,
      `"${(j.MATERI || '').replace(/"/g, '""')}"`,
      `"${(j.KEGIATAN || '').replace(/"/g, '""')}"`,
      `"${(j.HAMBATAN || '').replace(/"/g, '""')}"`,
      `"${(j.SOLUSI || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Jurnal_Mengajar_Guru_PJOK_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`Berhasil mengunduh ${jurnals.length} catatan jurnal mengajar (CSV / Excel).`, 'success');
  };

  const handleSaveJurnal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materi.trim() || !kegiatan.trim()) {
      onShowToast('Materi dan kegiatan pembelajaran wajib diisi.', 'error');
      return;
    }

    storage.addJurnalGuru({
      TANGGAL: tanggal,
      GURU_ID: currentUser.ref_id || 'G001',
      NAMA_GURU: currentUser.nama || 'Guru PJOK',
      KELAS_ID: kelasId,
      JAM_KE: jamKe,
      MATERI: materi.trim(),
      KEGIATAN: kegiatan.trim(),
      HAMBATAN: hambatan.trim(),
      SOLUSI: solusi.trim()
    });

    onShowToast('Catatan jurnal mengajar berhasil disimpan ke Sheet 17_JURNAL_GURU!', 'success');
    setShowAddModal(false);
    refreshList();
  };

  const handleDeleteJurnal = (id: string) => {
    if (confirm('Hapus catatan jurnal ini?')) {
      storage.deleteJurnal(id);
      onShowToast('Jurnal berhasil dihapus.', 'info');
      refreshList();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Jurnal Mengajar Guru PJOK</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Agenda harian, kegiatan pembelajaran, evaluasi hambatan & tindak lanjut (Sheet <code>17_JURNAL_GURU</code>)
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2.5 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Unduh seluruh data jurnal mengajar ke spreadsheet CSV / Excel"
          >
            <Download className="w-4 h-4 text-teal-700" /> Download Jurnal
          </button>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tulis Jurnal Baru
            </button>
          )}
        </div>
      </div>

      {/* Jurnal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jurnals.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Belum ada catatan jurnal mengajar.
          </div>
        ) : (
          jurnals.map((j, idx) => (
            <div
              key={`jurnal-card-${j.JURNAL_ID || 'jur'}-${idx}`}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      Kelas: {j.KELAS_ID}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Jam ke: {j.JAM_KE}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{j.TANGGAL}</span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">{j.MATERI}</h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-800">Aktivitas Gerak: </strong>
                    {j.KEGIATAN}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 text-rose-900">
                    <span className="font-bold text-[10px] uppercase text-rose-700 block mb-0.5">Hambatan</span>
                    <p className="line-clamp-2">{j.HAMBATAN || 'Tidak ada kendala berarti.'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-900">
                    <span className="font-bold text-[10px] uppercase text-emerald-700 block mb-0.5">Solusi</span>
                    <p className="line-clamp-2">{j.SOLUSI || 'Materi berjalan lancar.'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Pengampu: <strong className="text-slate-700">{j.NAMA_GURU}</strong></span>
                {canEdit && (
                  <button
                    onClick={() => handleDeleteJurnal(j.JURNAL_ID)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add Jurnal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Entri Jurnal Mengajar Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJurnal} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Jam Ke</label>
                  <input
                    type="text"
                    required
                    value={jamKe}
                    onChange={(e) => setJamKe(e.target.value)}
                    placeholder="1 - 3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Materi / Topik Pembelajaran</label>
                <input
                  type="text"
                  required
                  value={materi}
                  onChange={(e) => setMateri(e.target.value)}
                  placeholder="Contoh: Kebugaran Jasmani - Latihan Kekuatan Otot Lengan dan Perut"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rincian Kegiatan Pembelajaran</label>
                <textarea
                  required
                  rows={3}
                  value={kegiatan}
                  onChange={(e) => setKegiatan(e.target.value)}
                  placeholder="Uraikan tahapan apersepsi, latihan inti, dan refleksi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hambatan / Kendala di Lapangan</label>
                <textarea
                  rows={2}
                  value={hambatan}
                  onChange={(e) => setHambatan(e.target.value)}
                  placeholder="Contoh: Cuaca hujan gerimis sehingga dialihkan ke aula serbaguna..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Solusi & Tindak Lanjut</label>
                <textarea
                  rows={2}
                  value={solusi}
                  onChange={(e) => setSolusi(e.target.value)}
                  placeholder="Contoh: Memberikan penugasan video latihan ringan di rumah..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Simpan Jurnal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
