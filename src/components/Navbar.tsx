import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  HardDrive,
  CheckCircle2,
  ChevronDown,
  Flame,
  RefreshCw
} from 'lucide-react';
import { SessionUser, NotifikasiItem } from '../types';
import { storage } from '../services/storage';

interface NavbarProps {
  currentUser: SessionUser;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onToggleSidebar,
  onOpenSearch,
  onLogout,
  onNavigate,
  onShowToast
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [syncStatus, setSyncStatus] = useState(storage.getServerSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(storage.getServerSyncStatus());
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const res = await storage.syncWithServer();
    setIsSyncing(false);
    setSyncStatus(storage.getServerSyncStatus());
    if (onShowToast) {
      onShowToast(res.message, res.success ? 'success' : 'info');
    }
  };

  const notifications = storage.getNotifikasi(currentUser.role, currentUser.ref_id);
  const unreadCount = notifications.filter(n => n.STATUS === 'BELUM_DIBACA').length;

  const roleColors: Record<string, { bg: string; text: string; label: string }> = {
    ADMIN: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', label: 'Administrator' },
    GURU: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', label: 'Guru PJOK' },
    MURID: { bg: 'bg-gray-100 text-gray-700 border-gray-200', text: 'text-gray-700', label: 'Murid' }
  };

  const currentRole = roleColors[currentUser.role] || roleColors.MURID;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-xs">
            <span>P</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-gray-900">
                LMS PJOK
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${currentRole.bg}`}>
                {currentRole.label}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 hidden sm:block font-medium">
              Belajar, Bergerak, Berkembang
            </p>
          </div>
        </div>
      </div>

      {/* Center / Right: Search & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          id="btn-global-search"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <span className="hidden md:inline font-medium">Cari modul, tugas, siswa...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 bg-white rounded border border-gray-200">
            Ctrl+K
          </kbd>
        </button>

        {/* Real-time Server Sync Badge (Laptop ⇄ HP) */}
        <div
          id="badge-storage-status"
          title="Sinkronisasi otomatis antara Laptop dan HP via server pusat"
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium bg-emerald-50/90 text-emerald-800 border-emerald-200 shadow-2xs"
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${syncStatus.isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${syncStatus.isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-[11px] font-semibold">
            {isSyncing ? 'Menyinkronkan...' : syncStatus.isOnline ? 'Sinkron Laptop ⇄ HP' : 'Mode Offline'}
          </span>
          <button
            id="btn-navbar-sync"
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-1 hover:bg-emerald-100/80 rounded text-emerald-700 transition-all cursor-pointer"
            title="Klik untuk sinkronisasi paksa sekarang"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Mobile Quick Sync Icon for HP / Smartphone */}
        <button
          id="btn-mobile-sync"
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="sm:hidden p-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md cursor-pointer"
          title="Sinkronisasi Laptop & HP"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => {
              setShowNotifs(!showNotifs);
              setShowUserMenu(false);
            }}
            aria-label="Notifikasi"
            className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Notifikasi ({unreadCount} Baru)
                </span>
                <button
                  onClick={() => {
                    notifications.forEach(n => storage.markNotificationAsRead(n.NOTIFIKASI_ID));
                    setShowNotifs(false);
                  }}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Tandai dibaca
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs">
                    Tidak ada notifikasi saat ini.
                  </div>
                ) : (
                  notifications.map((n: NotifikasiItem, idx: number) => (
                    <div
                      key={`notif-${n.NOTIFIKASI_ID || 'ntf'}-${idx}`}
                      onClick={() => {
                        storage.markNotificationAsRead(n.NOTIFIKASI_ID);
                        if (n.LINK) onNavigate(n.LINK);
                        setShowNotifs(false);
                      }}
                      className={`p-3.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                        n.STATUS === 'BELUM_DIBACA' ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-gray-900">{n.JUDUL}</div>
                        {n.STATUS === 'BELUM_DIBACA' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-snug">{n.PESAN}</p>
                      <span className="text-[10px] text-gray-400 mt-1.5 block">{n.TANGGAL}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            id="btn-user-profile-menu"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifs(false);
            }}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-md hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {currentUser.nama ? currentUser.nama.charAt(0) : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-gray-900 truncate max-w-[130px]">
                {currentUser?.nama || 'User'}
              </div>
              <div className="text-[10px] text-gray-500 capitalize font-medium">
                {currentUser?.role ? currentUser.role.toLowerCase() : ''}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900 truncate">{currentUser.nama}</p>
                <p className="text-[11px] text-gray-500">@{currentUser.username}</p>
                {currentUser.nama_kelas && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                    {currentUser.nama_kelas}
                  </span>
                )}
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate(currentUser.role === 'MURID' ? 'profil-saya' : 'profil');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 font-medium"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  Profil Akun
                </button>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar (Logout)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
