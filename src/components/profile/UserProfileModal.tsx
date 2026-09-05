import React, { useState } from 'react';
import { User, Key, Lock, CheckCircle2, Shield, School, Phone, Mail, Sparkles } from 'lucide-react';
import { SessionUser } from '../../types';
import { storage } from '../../services/storage';

interface UserProfileModalProps {
  currentUser: SessionUser;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onShowToast
}) => {
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');

  if (!isOpen) return null;

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordBaru.length < 5) {
      onShowToast('Password baru minimal 5 karakter.', 'error');
      return;
    }
    if (passwordBaru !== konfirmasiPassword) {
      onShowToast('Konfirmasi password tidak cocok.', 'error');
      return;
    }

    const users = storage.getUsers();
    const targetUser = users.find(u => u.USERNAME === currentUser.username);
    if (targetUser) {
      storage.updateUser(targetUser.USER_ID, {
        PASSWORD_HASH: passwordBaru,
        PASSWORD: passwordBaru
      });
      onShowToast('Password Anda berhasil diperbarui!', 'success');
      setPasswordBaru('');
      setKonfirmasiPassword('');
      onClose();
    } else {
      onShowToast('User tidak ditemukan di sistem.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 font-extrabold flex items-center justify-center text-lg shadow-sm">
              {currentUser.nama.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">{currentUser.nama}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-teal-700">{currentUser.role}</span>
                <span>•</span>
                <span>@{currentUser.username}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* User Info Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Role Akun</span>
            <div className="font-bold text-slate-800 mt-0.5">{currentUser.role}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Kelas / Unit</span>
            <div className="font-bold text-slate-800 mt-0.5">{currentUser.nama_kelas || 'PJOK SMAN 1'}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Ref ID</span>
            <div className="font-bold font-mono text-slate-800 mt-0.5">{currentUser.ref_id || '-'}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
            <div className="font-bold text-emerald-600 mt-0.5">Aktif Terverifikasi</div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-teal-700" /> Ganti Kata Sandi (Password)
          </h4>

          <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password Baru</label>
              <input
                type="password"
                required
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                placeholder="Minimal 5 karakter..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                placeholder="Ulangi password baru..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              Simpan Password Baru
            </button>
          </form>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
