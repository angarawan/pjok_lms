import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Key, CheckCircle, XCircle, Trash2, Edit, AlertCircle, Shield } from 'lucide-react';
import { storage } from '../../services/storage';
import { UserItem, UserRole, UserStatus } from '../../types';

interface AdminUsersProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onShowToast }) => {
  const [users, setUsers] = useState<UserItem[]>(storage.getUsers());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form states
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('MURID');
  const [formRefId, setFormRefId] = useState('');
  const [formStatus, setFormStatus] = useState<UserStatus>('AKTIF');

  const refreshList = () => {
    setUsers(storage.getUsers());
  };

  const filteredUsers = users.filter(u => {
    const q = (search || '').toLowerCase();
    const matchSearch =
      (u.USERNAME || '').toLowerCase().includes(q) ||
      (u.NAMA || '').toLowerCase().includes(q) ||
      (u.USER_ID || '').toLowerCase().includes(q);
    const matchRole = roleFilter === 'ALL' || u.ROLE === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.STATUS === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedUser(null);
    setFormUsername('');
    setFormPassword('123456');
    setFormNama('');
    setFormRole('MURID');
    setFormRefId('');
    setFormStatus('AKTIF');
    setShowModal(true);
  };

  const handleOpenEdit = (u: UserItem) => {
    setModalMode('edit');
    setSelectedUser(u);
    setFormUsername(u.USERNAME || '');
    setFormPassword('');
    setFormNama(u.NAMA || '');
    setFormRole(u.ROLE || 'MURID');
    setFormRefId(u.REF_ID || '');
    setFormStatus(u.STATUS || 'AKTIF');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formNama.trim()) {
      onShowToast('Username dan Nama wajib diisi.', 'error');
      return;
    }

    if (modalMode === 'add') {
      // Check duplicate username
      if (users.some(u => (u.USERNAME || '').toLowerCase() === formUsername.trim().toLowerCase())) {
        onShowToast('Username sudah digunakan.', 'error');
        return;
      }

      storage.addUser({
        USERNAME: formUsername.trim(),
        PASSWORD_HASH: formPassword.trim() || '123456',
        ROLE: formRole,
        REF_ID: formRefId.trim() || ('REF' + Date.now().toString().slice(-4)),
        NAMA: formNama.trim(),
        STATUS: formStatus
      });
      onShowToast('Pengguna baru berhasil ditambahkan!', 'success');
    } else if (modalMode === 'edit' && selectedUser) {
      const updates: Partial<UserItem> = {
        USERNAME: formUsername.trim(),
        NAMA: formNama.trim(),
        ROLE: formRole,
        REF_ID: formRefId.trim(),
        STATUS: formStatus
      };
      if (formPassword.trim()) {
        updates.PASSWORD_HASH = formPassword.trim();
      }
      storage.updateUser(selectedUser.USER_ID, updates);
      onShowToast('Data pengguna berhasil diperbarui!', 'success');
    }

    setShowModal(false);
    refreshList();
  };

  const handleToggleStatus = (u: UserItem) => {
    const newStatus: UserStatus = u.STATUS === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
    storage.updateUser(u.USER_ID, { STATUS: newStatus });
    onShowToast(`Status akun ${u.USERNAME} diubah menjadi ${newStatus}.`, 'info');
    refreshList();
  };

  const handleResetPassword = (u: UserItem) => {
    const newPass = prompt(`Masukkan password baru untuk user "${u.USERNAME}":`, 'pjok123');
    if (newPass) {
      storage.updateUser(u.USER_ID, { PASSWORD_HASH: newPass.trim() });
      onShowToast(`Password untuk ${u.USERNAME} berhasil direset!`, 'success');
      refreshList();
    }
  };

  const handleDelete = (u: UserItem) => {
    if (confirm(`Yakin ingin menghapus pengguna "${u.USERNAME}" (${u.NAMA})?`)) {
      storage.deleteUser(u.USER_ID);
      onShowToast(`Pengguna ${u.USERNAME} berhasil dihapus.`, 'success');
      refreshList();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Manajemen Pengguna</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar kredensial login akun Admin, Guru, dan Murid (Sheet <code>02_USERS</code>)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, username, atau ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="ALL">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="GURU">Guru</option>
            <option value="MURID">Murid</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="ALL">Semua Status</option>
            <option value="AKTIF">Aktif</option>
            <option value="NONAKTIF">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">User ID</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Ref ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Terakhir Login</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Tidak ada data pengguna yang cocok.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => {
                  const roleBadgeClass =
                    u.ROLE === 'ADMIN'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : u.ROLE === 'GURU'
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  return (
                    <tr key={`user-row-${u.USER_ID || 'u'}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{u.USER_ID}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{u.NAMA}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">@{u.USERNAME}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadgeClass}`}>
                          {u.ROLE}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{u.REF_ID || '-'}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                            u.STATUS === 'AKTIF'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {u.STATUS === 'AKTIF' ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> AKTIF
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" /> NONAKTIF
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {u.LAST_LOGIN || 'Belum Pernah'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Edit Pengguna"
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(u)}
                            title="Reset Password"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            title="Hapus Pengguna"
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {modalMode === 'add' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
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
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Contoh: budi01"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password {modalMode === 'edit' && '(Kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={modalMode === 'edit' ? 'Biarkan kosong untuk mempertahankan password lama' : 'Password default'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-semibold"
                  >
                    <option value="MURID">Murid</option>
                    <option value="GURU">Guru</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-semibold"
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reference ID (REF_ID)
                </label>
                <input
                  type="text"
                  value={formRefId}
                  onChange={(e) => setFormRefId(e.target.value)}
                  placeholder="Contoh: G001, M001, atau ADM001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Hubungkan dengan GURU_ID atau MURID_ID untuk sinkronisasi profil.
                </p>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  {modalMode === 'add' ? 'Simpan Pengguna' : 'Update Perubahan'}
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
    </div>
  );
};
