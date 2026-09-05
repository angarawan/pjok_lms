import React, { useState } from 'react';
import { Award, Plus, Search, Edit, Trash2, CheckCircle, XCircle, Phone, Mail, Eye, Key, Copy, Check, Lock, ShieldCheck } from 'lucide-react';
import { storage } from '../../services/storage';
import { GuruItem, UserItem } from '../../types';

interface AdminGuruProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminGuru: React.FC<AdminGuruProps> = ({ onShowToast }) => {
  const [gurus, setGurus] = useState<GuruItem[]>(storage.getGuru());
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedGuru, setSelectedGuru] = useState<GuruItem | null>(null);

  // Form states
  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [jk, setJk] = useState<'L' | 'P'>('L');
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [mapel, setMapel] = useState('Pendidikan Jasmani, Olahraga, dan Kesehatan');
  const [status, setStatus] = useState<'AKTIF' | 'NONAKTIF'>('AKTIF');

  // Account login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('guru123');
  const [showPassword, setShowPassword] = useState(false);
  const [customUsernameEdited, setCustomUsernameEdited] = useState(false);

  const refreshList = () => {
    setGurus(storage.getGuru());
  };

  const filteredGurus = gurus.filter(g => {
    const q = (search || '').toLowerCase();
    const user = storage.getGuruUser(g.GURU_ID);
    return (
      (g.NAMA_GURU || '').toLowerCase().includes(q) ||
      (g.NIP || '').includes(search) ||
      (g.EMAIL || '').toLowerCase().includes(q) ||
      (user?.USERNAME || '').toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedGuru(null);
    setNip('');
    setNama('');
    setJk('L');
    setEmail('');
    setNoHp('');
    setMapel('Pendidikan Jasmani, Olahraga, dan Kesehatan');
    setStatus('AKTIF');
    setUsername('');
    setPassword('guru123');
    setShowPassword(false);
    setCustomUsernameEdited(false);
    setShowModal(true);
  };

  const handleOpenEdit = (g: GuruItem) => {
    setModalMode('edit');
    setSelectedGuru(g);
    setNip(g.NIP);
    setNama(g.NAMA_GURU);
    setJk(g.JENIS_KELAMIN);
    setEmail(g.EMAIL);
    setNoHp(g.NO_HP);
    setMapel(g.MATA_PELAJARAN);
    setStatus(g.STATUS);

    const user = storage.getGuruUser(g.GURU_ID);
    setUsername(user?.USERNAME || (g.EMAIL ? g.EMAIL.split('@')[0] : (g.NIP || 'guru_' + g.GURU_ID.toLowerCase())));
    setPassword(user?.PASSWORD_HASH || 'guru123');
    setShowPassword(false);
    setCustomUsernameEdited(true);
    setShowModal(true);
  };

  const handleOpenView = (g: GuruItem) => {
    setModalMode('view');
    setSelectedGuru(g);
    setNip(g.NIP);
    setNama(g.NAMA_GURU);
    setJk(g.JENIS_KELAMIN);
    setEmail(g.EMAIL);
    setNoHp(g.NO_HP);
    setMapel(g.MATA_PELAJARAN);
    setStatus(g.STATUS);

    const user = storage.getGuruUser(g.GURU_ID);
    setUsername(user?.USERNAME || (g.EMAIL ? g.EMAIL.split('@')[0] : (g.NIP || 'guru_' + g.GURU_ID.toLowerCase())));
    setPassword(user?.PASSWORD_HASH || 'guru123');
    setShowPassword(false);
    setShowModal(true);
  };

  // Helper auto-suggest username when adding
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!customUsernameEdited && modalMode === 'add' && val.includes('@')) {
      const suggested = val.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
      setUsername(suggested);
    }
  };

  const handleNipChange = (val: string) => {
    setNip(val);
    if (!customUsernameEdited && modalMode === 'add' && !email && val.length >= 4) {
      setUsername(val.trim());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      onShowToast('Nama Guru wajib diisi.', 'error');
      return;
    }

    if (modalMode === 'add') {
      storage.addGuru({
        NIP: nip.trim(),
        NAMA_GURU: nama.trim(),
        JENIS_KELAMIN: jk,
        EMAIL: email.trim(),
        NO_HP: noHp.trim(),
        MATA_PELAJARAN: mapel.trim(),
        STATUS: status
      }, {
        USERNAME: username.trim(),
        PASSWORD: password.trim() || 'guru123'
      });
      onShowToast('Data guru & akun login berhasil ditambahkan!', 'success');
    } else if (modalMode === 'edit' && selectedGuru) {
      storage.updateGuru(selectedGuru.GURU_ID, {
        NIP: nip.trim(),
        NAMA_GURU: nama.trim(),
        JENIS_KELAMIN: jk,
        EMAIL: email.trim(),
        NO_HP: noHp.trim(),
        MATA_PELAJARAN: mapel.trim(),
        STATUS: status
      }, {
        USERNAME: username.trim(),
        PASSWORD: password.trim() || 'guru123'
      });
      onShowToast('Data guru & akun login berhasil diperbarui!', 'success');
    }

    setShowModal(false);
    refreshList();
  };

  const handleToggleStatus = (g: GuruItem) => {
    const nextStatus = g.STATUS === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
    storage.updateGuru(g.GURU_ID, { STATUS: nextStatus });
    onShowToast(`Status guru ${g.NAMA_GURU} diubah menjadi ${nextStatus}.`, 'info');
    refreshList();
  };

  const handleDelete = (g: GuruItem) => {
    if (confirm(`Hapus guru ${g.NAMA_GURU}? Akun login terkait juga akan dinonaktifkan.`)) {
      storage.deleteGuru(g.GURU_ID);
      onShowToast(`Data guru ${g.NAMA_GURU} berhasil dihapus.`, 'success');
      refreshList();
    }
  };

  const handleCopyCredentials = (g: GuruItem) => {
    const user = storage.getGuruUser(g.GURU_ID);
    const uname = user?.USERNAME || (g.EMAIL ? g.EMAIL.split('@')[0] : (g.NIP || 'guru_' + g.GURU_ID.toLowerCase()));
    const pass = user?.PASSWORD_HASH || 'guru123';
    const text = `*Akun Login LMS PJOK SMA*\nNama Guru: ${g.NAMA_GURU}\nUsername: ${uname}\nPassword: ${pass}\nEmail: ${g.EMAIL || '-'}\nNIP: ${g.NIP || '-'}\n\n*Petunjuk Login:* Anda dapat login menggunakan Username (${uname}), Email, atau NIP.`;
    navigator.clipboard.writeText(text);
    setCopiedId(g.GURU_ID);
    onShowToast(`Kredensial login guru ${g.NAMA_GURU} berhasil disalin!`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Data Tenaga Pendidik (Guru PJOK)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar guru pengampu mata pelajaran PJOK (Sheet <code>04_GURU</code>)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Guru
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari guru berdasarkan nama, NIP, atau email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">NIP</th>
                <th className="py-3.5 px-4">Nama Guru</th>
                <th className="py-3.5 px-4">Akun Login LMS</th>
                <th className="py-3.5 px-4">Mata Pelajaran</th>
                <th className="py-3.5 px-4">Kontak</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredGurus.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Tidak ada data guru.
                  </td>
                </tr>
              ) : (
                filteredGurus.map((g, idx) => {
                  const guruUser = storage.getGuruUser(g.GURU_ID);
                  const displayUname = guruUser?.USERNAME || (g.EMAIL ? g.EMAIL.split('@')[0] : (g.NIP || 'guru_' + g.GURU_ID.toLowerCase()));
                  const displayPass = guruUser?.PASSWORD_HASH || 'guru123';
                  const isCopied = copiedId === g.GURU_ID;

                  return (
                    <tr key={g.GURU_ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{g.NIP || '-'}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{g.NAMA_GURU}</span>
                          <span className="text-[10px] text-slate-400">({g.JENIS_KELAMIN === 'L' ? 'L' : 'P'})</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-teal-50/80 border border-teal-200/70 rounded-lg px-2.5 py-1 text-[11px]">
                            <div className="flex items-center gap-1.5 font-mono font-bold text-teal-900">
                              <Key className="w-3 h-3 text-teal-600 shrink-0" />
                              <span>{displayUname}</span>
                            </div>
                            <div className="text-[10px] text-teal-700 font-mono mt-0.5">
                              Pass: <span className="font-semibold">{displayPass}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(g)}
                            title="Salin username dan password guru"
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                : 'bg-slate-50 hover:bg-teal-50 border-slate-200 hover:border-teal-300 text-slate-500 hover:text-teal-700'
                            }`}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-teal-800 font-medium">{g.MATA_PELAJARAN}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-slate-600">{g.EMAIL || '-'}</div>
                        <div className="text-[10px] font-mono text-slate-400">{g.NO_HP || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(g)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            g.STATUS === 'AKTIF'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {g.STATUS === 'AKTIF' ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                          {g.STATUS}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenView(g)}
                            title="Lihat Detail & Akun"
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(g)}
                            title="Edit Guru & Akun"
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(g)}
                            title="Hapus Guru"
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View / Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  {modalMode === 'add' ? <Plus className="w-4 h-4" /> : modalMode === 'edit' ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {modalMode === 'add' ? 'Tambah Guru & Buat Akun Login' : modalMode === 'edit' ? 'Edit Data Guru & Akun Login' : 'Detail Guru & Informasi Login'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalMode === 'view' && selectedGuru ? (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1 border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Nama Lengkap & Gelar</div>
                  <div className="text-sm font-bold text-slate-900">{selectedGuru.NAMA_GURU}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">NIP</div>
                    <div className="font-mono font-semibold text-slate-800">{selectedGuru.NIP || '-'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Jenis Kelamin</div>
                    <div className="font-semibold text-slate-800">{selectedGuru.JENIS_KELAMIN === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Mata Pelajaran</div>
                  <div className="font-semibold text-teal-800">{selectedGuru.MATA_PELAJARAN}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Kontak</div>
                  <div>Email: <span className="font-medium text-slate-800">{selectedGuru.EMAIL || '-'}</span></div>
                  <div>No HP / WhatsApp: <span className="font-mono font-medium text-slate-800">{selectedGuru.NO_HP || '-'}</span></div>
                </div>

                {/* Akun Login Section */}
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-teal-700" />
                      <span className="font-bold text-teal-900 text-xs">Kredensial Login LMS PJOK</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-200 text-teal-800">
                      Role: GURU
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                      <div className="text-[9px] text-slate-400 uppercase font-bold font-sans">Username</div>
                      <div className="font-bold text-teal-900 mt-0.5">{username || '-'}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                      <div className="text-[9px] text-slate-400 uppercase font-bold font-sans">Password</div>
                      <div className="font-bold text-teal-900 mt-0.5">{password || '-'}</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-teal-800/90 leading-relaxed">
                    💡 <strong>Tips Login Guru:</strong> Guru dapat login menggunakan <strong>Username</strong> di atas, atau langsung mengetikkan <strong>Email</strong> ({selectedGuru.EMAIL || 'dinas'}) / <strong>NIP</strong> dengan password yang tertera.
                  </p>

                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(selectedGuru)}
                    className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {copiedId === selectedGuru.GURU_ID ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedId === selectedGuru.GURU_ID ? 'Kredensial Berhasil Disalin!' : 'Salin Info Akun untuk Guru'}
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Guru Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: I Ketut Suardana, S.Pd., M.Fis."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIP</label>
                    <input
                      type="text"
                      value={nip}
                      onChange={(e) => handleNipChange(e.target.value)}
                      placeholder="19820514..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={jk}
                      onChange={(e) => setJk(e.target.value as 'L' | 'P')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Belajar / Dinas</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="guru@guru.sma.belajar.id"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No HP / WhatsApp</label>
                    <input
                      type="text"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      placeholder="08123456789"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Section Akun Login LMS */}
                <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-2xl space-y-3 mt-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <div>
                      <div className="font-bold text-teal-950 text-xs">Akun Login Guru (LMS PJOK)</div>
                      <div className="text-[10px] text-teal-700">Akun ini langsung aktif untuk masuk ke portal guru</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-teal-900 mb-1">Username Login</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setCustomUsernameEdited(true);
                        }}
                        placeholder="Contoh: guru01"
                        className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-600 font-mono text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-teal-900">Password</label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[10px] text-teal-700 hover:underline cursor-pointer"
                        >
                          {showPassword ? 'Sembunyikan' : 'Lihat'}
                        </button>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="guru123"
                        className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-600 font-mono text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-teal-800/80 leading-relaxed">
                    ℹ️ Guru dapat masuk dengan <strong>Username</strong>, <strong>Email Belajar.id</strong>, atau <strong>NIP</strong> mereka.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'AKTIF' | 'NONAKTIF')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                  </select>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    {modalMode === 'add' ? 'Simpan Guru & Akun' : 'Update Perubahan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
