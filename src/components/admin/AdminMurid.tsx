import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { storage } from '../../services/storage';
import { MuridItem } from '../../types';
import { ImportMuridModal } from './ImportMuridModal';

interface AdminMuridProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminMurid: React.FC<AdminMuridProps> = ({ onShowToast }) => {
  const [murids, setMurids] = useState<MuridItem[]>(storage.getMurid());
  const [kelas] = useState(storage.getKelas());
  const [search, setSearch] = useState('');
  const [kelasFilter, setKelasFilter] = useState('ALL');
  const [jkFilter, setJkFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedMurid, setSelectedMurid] = useState<MuridItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [jk, setJk] = useState<'L' | 'P'>('L');
  const [kelasId, setKelasId] = useState(kelas[0]?.KELAS_ID || 'XI-01');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'AKTIF' | 'NONAKTIF'>('AKTIF');

  const refreshList = () => {
    setMurids(storage.getMurid());
  };

  const filteredMurids = murids.filter(m => {
    const q = (search || '').toLowerCase();
    const matchSearch =
      (m.NAMA_MURID || '').toLowerCase().includes(q) ||
      (m.NIS || '').includes(search) ||
      (m.NISN || '').includes(search);
    const matchKelas = kelasFilter === 'ALL' || m.KELAS_ID === kelasFilter;
    const matchJk = jkFilter === 'ALL' || m.JENIS_KELAMIN === jkFilter;
    return matchSearch && matchKelas && matchJk;
  });

  const totalPages = Math.ceil(filteredMurids.length / itemsPerPage) || 1;
  const paginatedMurids = filteredMurids.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedMurid(null);
    setNis('10' + (murids.length + 100));
    setNisn('007' + Date.now().toString().slice(-7));
    setNama('');
    setJk('L');
    setKelasId(kelas[0]?.KELAS_ID || 'XI-01');
    setUsername('');
    setStatus('AKTIF');
    setShowModal(true);
  };

  const handleOpenEdit = (m: MuridItem) => {
    setModalMode('edit');
    setSelectedMurid(m);
    setNis(m.NIS);
    setNisn(m.NISN);
    setNama(m.NAMA_MURID);
    setJk(m.JENIS_KELAMIN);
    setKelasId(m.KELAS_ID);
    setUsername(m.USERNAME);
    setStatus(m.STATUS);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      onShowToast('Nama Murid wajib diisi.', 'error');
      return;
    }

    const targetKelas = kelas.find(k => k.KELAS_ID === kelasId);
    const namaKelas = targetKelas ? targetKelas.NAMA_KELAS : kelasId;
    const autoUsername = username.trim() || ('murid_' + nis);

    if (modalMode === 'add') {
      const newM = storage.addMurid({
        NIS: nis.trim(),
        NISN: nisn.trim(),
        NAMA_MURID: nama.trim(),
        JENIS_KELAMIN: jk,
        KELAS_ID: kelasId,
        NAMA_KELAS: namaKelas,
        TAHUN_PELAJARAN: '2026/2027',
        USERNAME: autoUsername,
        STATUS: status
      });

      // Create linked login account if not exists
      storage.addUser({
        USERNAME: autoUsername,
        PASSWORD_HASH: 'murid123',
        ROLE: 'MURID',
        REF_ID: newM.MURID_ID,
        NAMA: nama.trim(),
        STATUS: status
      });

      onShowToast('Data murid dan akun login berhasil dibuat!', 'success');
    } else if (modalMode === 'edit' && selectedMurid) {
      storage.updateMurid(selectedMurid.MURID_ID, {
        NIS: nis.trim(),
        NISN: nisn.trim(),
        NAMA_MURID: nama.trim(),
        JENIS_KELAMIN: jk,
        KELAS_ID: kelasId,
        NAMA_KELAS: namaKelas,
        USERNAME: autoUsername,
        STATUS: status
      });
      onShowToast('Data murid berhasil diperbarui!', 'success');
    }

    setShowModal(false);
    refreshList();
  };

  const handleToggleStatus = (m: MuridItem) => {
    const nextStatus = m.STATUS === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
    storage.updateMurid(m.MURID_ID, { STATUS: nextStatus });
    onShowToast(`Status siswa ${m.NAMA_MURID} diubah menjadi ${nextStatus}.`, 'info');
    refreshList();
  };

  const handleDelete = (m: MuridItem) => {
    if (confirm(`Hapus data murid ${m.NAMA_MURID}?`)) {
      storage.deleteMurid(m.MURID_ID);
      onShowToast(`Murid ${m.NAMA_MURID} berhasil dihapus.`, 'success');
      refreshList();
    }
  };

  const handleExportCSV = () => {
    if (murids.length === 0) {
      onShowToast('Tidak ada data murid untuk diekspor.', 'info');
      return;
    }

    const headers = [
      'NIS',
      'NISN',
      'NAMA_MURID',
      'JENIS_KELAMIN',
      'KELAS_ID',
      'NAMA_KELAS',
      'TAHUN_PELAJARAN',
      'USERNAME',
      'STATUS'
    ];

    const rows = murids.map(m => [
      `"${(m.NIS || '').replace(/"/g, '""')}"`,
      `"${(m.NISN || '').replace(/"/g, '""')}"`,
      `"${(m.NAMA_MURID || '').replace(/"/g, '""')}"`,
      `"${m.JENIS_KELAMIN || 'L'}"`,
      `"${(m.KELAS_ID || '').replace(/"/g, '""')}"`,
      `"${(m.NAMA_KELAS || '').replace(/"/g, '""')}"`,
      `"${(m.TAHUN_PELAJARAN || '2026/2027').replace(/"/g, '""')}"`,
      `"${(m.USERNAME || '').replace(/"/g, '""')}"`,
      `"${m.STATUS || 'AKTIF'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Data_Murid_LMS_PJOK_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`Berhasil mengekspor ${murids.length} data murid ke file CSV!`, 'success');
  };

  const handleDownloadTemplate = () => {
    const headers = 'NIS,NISN,NAMA_MURID,JENIS_KELAMIN,KELAS_ID,USERNAME,PASSWORD';
    const sampleRows = [
      '10101,0071234561,Ahmad Fauzi,L,XI-01,ahmad.fauzi,murid123',
      '10102,0071234562,Siti Rahmawati,P,XI-01,siti.rahmawati,murid123',
      '10103,0071234563,Budi Santoso,L,XI-02,budi.santoso,murid123',
      '10104,0071234564,Dewi Lestari,P,XI-02,dewi.lestari,murid123',
      '10105,0071234565,Rian Hidayat,L,XI-03,rian.hidayat,murid123'
    ];
    const csvContent = '\uFEFF' + [headers, ...sampleRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Template_Import_Murid_LMS_PJOK.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Template CSV berhasil diunduh. Silakan isi dan import kembali.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Data Peserta Didik (Murid)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar peserta didik aktif seluruh kelas PJOK (Sheet <code>05_MURID</code>) • Total: <strong>{murids.length} Siswa</strong>
          </p>
        </div>

        {/* Action Buttons: Import, Export, Template, Tambah */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            title="Unduh Format Template CSV untuk diisi di Excel"
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Format</span> Template CSV
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            title="Download seluruh data murid dalam bentuk CSV"
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            Ekspor CSV
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            title="Import daftar nama murid dari file CSV"
            className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-teal-700" />
            Import CSV
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Murid
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari murid berdasarkan nama, NIS, atau NISN..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={kelasFilter}
            onChange={(e) => {
              setKelasFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="ALL">Semua Kelas</option>
            {kelas.map(k => (
              <option key={k.KELAS_ID} value={k.KELAS_ID}>{k.NAMA_KELAS}</option>
            ))}
          </select>

          <select
            value={jkFilter}
            onChange={(e) => {
              setJkFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="ALL">Semua JK</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">NIS</th>
                <th className="py-3.5 px-4">NISN</th>
                <th className="py-3.5 px-4">Nama Murid</th>
                <th className="py-3.5 px-4">JK</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedMurids.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    Tidak ada data murid yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedMurids.map((m, idx) => (
                  <tr key={m.MURID_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{m.NIS}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{m.NISN}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{m.NAMA_MURID}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.JENIS_KELAMIN === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {m.JENIS_KELAMIN}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-teal-800">{m.NAMA_KELAS}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">@{m.USERNAME}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(m)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          m.STATUS === 'AKTIF'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {m.STATUS === 'AKTIF' ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                        {m.STATUS}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          title="Edit Murid"
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
                          title="Hapus Murid"
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredMurids.length)} dari {filteredMurids.length} murid
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {modalMode === 'add' ? 'Tambah Data Murid' : 'Edit Data Murid'}
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
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Murid</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS</label>
                  <input
                    type="text"
                    required
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="10241"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    required
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="0071234561"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={jk}
                    onChange={(e) => setJk(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-medium"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rombel Kelas</label>
                  <select
                    value={kelasId}
                    onChange={(e) => setKelasId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-bold text-teal-800"
                  >
                    {kelas.map(k => (
                      <option key={k.KELAS_ID} value={k.KELAS_ID}>{k.NAMA_KELAS}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="murid01 (opsional)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'AKTIF' | 'NONAKTIF')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-medium"
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  {modalMode === 'add' ? 'Simpan Murid' : 'Update Perubahan'}
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

      {/* Modal Import CSV */}
      <ImportMuridModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          refreshList();
        }}
        onShowToast={onShowToast}
        kelasList={kelas}
      />
    </div>
  );
};
