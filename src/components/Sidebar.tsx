import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarCheck,
  Award,
  BookMarked,
  FileBarChart,
  Settings,
  Activity,
  LogOut,
  HelpCircle,
  FileText,
  UserCheck,
  Sparkles,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { SessionUser } from '../types';

interface SidebarProps {
  currentUser: SessionUser;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

interface MenuGroup {
  groupTitle?: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
  onLogout,
  onOpenAppsScript
}) => {
  // Define Role-specific Menu Groups
  const adminMenus: MenuGroup[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      groupTitle: 'MANAJEMEN PENGGUNA',
      items: [
        { id: 'users', label: 'Daftar Pengguna', icon: Users },
        { id: 'guru', label: 'Data Guru', icon: Award },
        { id: 'murid', label: 'Data Murid', icon: GraduationCap }
      ]
    },
    {
      groupTitle: 'DATA AKADEMIK',
      items: [
        { id: 'kelas', label: 'Data Kelas', icon: School },
        { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen }
      ]
    },
    {
      groupTitle: 'PEMBELAJARAN',
      items: [
        { id: 'atp', label: 'ATP PJOK', icon: Sparkles },
        { id: 'materi', label: 'Materi Belajar', icon: BookMarked },
        { id: 'tugas', label: 'Tugas Siswa', icon: FileText },
        { id: 'quiz', label: 'Quiz & Soal', icon: HelpCircle }
      ]
    },
    {
      groupTitle: 'EVALUASI & JURNAL',
      items: [
        { id: 'penilaian', label: 'Penilaian & Rekap', icon: Award },
        { id: 'presensi', label: 'Rekap Presensi', icon: CalendarCheck },
        { id: 'jurnal', label: 'Jurnal Mengajar', icon: BookMarked }
      ]
    },
    {
      groupTitle: 'SINKRONISASI & SISTEM',
      items: [
        { id: 'sinkronisasi', label: 'Sinkronisasi Google Sheets', icon: FileSpreadsheet, badge: 'Cloud' },
        { id: 'laporan', label: 'Laporan & Export', icon: FileBarChart },
        { id: 'logs', label: 'Log Aktivitas', icon: Activity },
        { id: 'settings', label: 'Pengaturan Sekolah', icon: Settings }
      ]
    }
  ];

  const guruMenus: MenuGroup[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard Guru', icon: LayoutDashboard }
      ]
    },
    {
      groupTitle: 'DATA MURID',
      items: [
        { id: 'data-murid', label: 'Murid Kelas Saya', icon: GraduationCap }
      ]
    },
    {
      groupTitle: 'PEMBELAJARAN PJOK',
      items: [
        { id: 'atp', label: 'ATP PJOK', icon: Sparkles },
        { id: 'materi', label: 'Materi Pembelajaran', icon: BookMarked },
        { id: 'tugas', label: 'Tugas & Evaluasi', icon: FileText },
        { id: 'quiz', label: 'Quiz & Bank Soal', icon: HelpCircle }
      ]
    },
    {
      groupTitle: 'PRESENSI & NILAI',
      items: [
        { id: 'presensi', label: 'Presensi Harian', icon: CalendarCheck },
        { id: 'penilaian-praktik', label: 'Penilaian Praktik PJOK', icon: Award, badge: 'Rubrik 1-4' },
        { id: 'rekap-nilai', label: 'Rekap Nilai Lengkap', icon: FileBarChart },
        { id: 'jurnal', label: 'Jurnal Mengajar', icon: BookMarked }
      ]
    },
    {
      groupTitle: 'AKUN',
      items: [
        { id: 'profil', label: 'Profil Saya', icon: UserCheck }
      ]
    }
  ];

  const muridMenus: MenuGroup[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard Murid', icon: LayoutDashboard }
      ]
    },
    {
      groupTitle: 'PEMBELAJARAN SAYA',
      items: [
        { id: 'materi-saya', label: 'Materi PJOK', icon: BookMarked },
        { id: 'tugas-saya', label: 'Tugas Saya', icon: FileText },
        { id: 'quiz-saya', label: 'Quiz & Tes Teori', icon: HelpCircle }
      ]
    },
    {
      groupTitle: 'HASIL BELAJAR',
      items: [
        { id: 'nilai-saya', label: 'Nilai & Perkembangan', icon: Award },
        { id: 'presensi-saya', label: 'Presensi Saya', icon: CalendarCheck }
      ]
    },
    {
      groupTitle: 'AKUN',
      items: [
        { id: 'profil-saya', label: 'Profil Saya', icon: UserCheck }
      ]
    }
  ];

  const menuGroups = currentUser.role === 'ADMIN'
    ? adminMenus
    : currentUser.role === 'GURU'
    ? guruMenus
    : muridMenus;

  return (
    <>
      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:sticky top-0 lg:top-16 z-40 h-full lg:h-[calc(100vh-4rem)] w-64 bg-[#111827] border-r border-gray-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between lg:hidden bg-[#111827]">
          <div className="font-semibold text-sm text-white tracking-tight">
            MENU LMS PJOK
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {menuGroups.map((group, gIdx) => (
            <div key={`group-${group.groupTitle || gIdx}`} className="space-y-1">
              {group.groupTitle && (
                <div className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  {group.groupTitle}
                </div>
              )}
              {group.items.map((item, iIdx) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={`menu-${item.id}-${iIdx}`}
                    id={`menu-${item.id}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group ${
                      isActive
                        ? 'bg-[#1F2937] text-white shadow-xs'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isActive ? (
                        <div className="w-4 h-4 bg-blue-500 rounded-xs flex items-center justify-center shrink-0">
                          <IconComponent className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 border border-gray-600 rounded-xs flex items-center justify-center shrink-0 group-hover:border-gray-400">
                          <IconComponent className="w-3 h-3 text-gray-400 group-hover:text-white" />
                        </div>
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Actions: User & Apps Script Integration */}
        <div className="p-4 border-t border-gray-800 bg-[#111827] space-y-2">
          <div className="flex items-center gap-3 px-2 py-1 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold">
              {currentUser.nama ? currentUser.nama.charAt(0) : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-white font-medium truncate">{currentUser?.nama || 'User'}</span>
              <span className="text-[10px] text-gray-400 capitalize">{currentUser?.role ? currentUser.role.toLowerCase() : ''}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>
    </>
  );
};
