import React, { useState, useEffect } from 'react';
import { SessionUser } from './types';
import { storage } from './services/storage';

// Navigation & Layout
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/LoginView';

// Admin Modules
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminGuru } from './components/admin/AdminGuru';
import { AdminMurid } from './components/admin/AdminMurid';
import { AdminAkademik } from './components/admin/AdminAkademik';
import { AdminLaporan } from './components/admin/AdminLaporan';
import { AdminLogs } from './components/admin/AdminLogs';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminGoogleSheetsSync } from './components/admin/AdminGoogleSheetsSync';

// Learning Modules
import { AtpManager } from './components/learning/AtpManager';
import { MateriManager } from './components/learning/MateriManager';
import { TugasManager } from './components/learning/TugasManager';
import { QuizManager } from './components/learning/QuizManager';

// Evaluation Modules
import { PresensiManager } from './components/evaluation/PresensiManager';
import { PenilaianPraktik } from './components/evaluation/PenilaianPraktik';
import { JurnalMengajar } from './components/evaluation/JurnalMengajar';

// Role Dashboards
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';

// Modals
import { UserProfileModal } from './components/profile/UserProfileModal';
import { SearchModal } from './components/common/SearchModal';

// Icons
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(storage.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [dbVersion, setDbVersion] = useState<number>(0);

  // Modals
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Toast Notification System
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    // Subscribe to live database updates (e.g. changes synced from Laptop or HP)
    const unsubscribe = storage.subscribe(() => {
      setDbVersion(v => v + 1);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLoginSuccess = (user: SessionUser) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    showToast(`Selamat datang, ${user.nama}!`, 'success');
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
    showToast('Anda telah berhasil keluar (logout).', 'info');
  };

  const handleNavigate = (tab: string) => {
    if (tab === 'profil' || tab === 'profil-saya') {
      setShowProfileModal(true);
      return;
    }
    setActiveTab(tab);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is not authenticated, render LoginView
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} onShowToast={showToast} />;
  }

  // Render view router
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'ADMIN') {
          return (
            <AdminDashboard
              onNavigate={handleNavigate}
            />
          );
        } else if (currentUser.role === 'GURU') {
          return (
            <TeacherDashboard
              currentUser={currentUser}
              onNavigate={handleNavigate}
            />
          );
        } else {
          return (
            <StudentDashboard
              currentUser={currentUser}
              onNavigate={handleNavigate}
            />
          );
        }

      case 'users':
        return <AdminUsers onShowToast={showToast} />;

      case 'guru':
        return <AdminGuru onShowToast={showToast} />;

      case 'murid':
      case 'data-murid':
        return <AdminMurid onShowToast={showToast} />;

      case 'kelas':
      case 'mapel':
      case 'akademik':
        return <AdminAkademik onShowToast={showToast} />;

      case 'atp':
        return <AtpManager onShowToast={showToast} />;

      case 'materi':
      case 'materi-saya':
        return <MateriManager currentUser={currentUser} onShowToast={showToast} />;

      case 'tugas':
      case 'tugas-saya':
        return <TugasManager currentUser={currentUser} onShowToast={showToast} />;

      case 'quiz':
      case 'quiz-saya':
        return <QuizManager currentUser={currentUser} onShowToast={showToast} />;

      case 'presensi':
      case 'presensi-saya':
        return <PresensiManager currentUser={currentUser} onShowToast={showToast} />;

      case 'penilaian':
      case 'penilaian-praktik':
      case 'rekap-nilai':
      case 'nilai-saya':
        return <PenilaianPraktik currentUser={currentUser} onShowToast={showToast} />;

      case 'jurnal':
        return <JurnalMengajar currentUser={currentUser} onShowToast={showToast} />;

      case 'laporan':
        return <AdminLaporan onShowToast={showToast} />;

      case 'logs':
        return <AdminLogs onShowToast={showToast} />;

      case 'settings':
        return (
          <AdminSettings
            onShowToast={showToast}
          />
        );

      case 'sinkronisasi':
      case 'google-sheets':
      case 'sync':
        return <AdminGoogleSheetsSync onShowToast={showToast} />;

      default:
        return (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
            <h3 className="font-extrabold text-slate-800 text-base">Halaman Dalam Pembaruan</h3>
            <p className="text-xs text-slate-500">
              Modul &quot;{activeTab}&quot; sedang disiapkan. Silakan kembali ke dashboard.
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold"
            >
              Kembali ke Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onOpenSearch={() => setShowSearchModal(true)}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onShowToast={showToast}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Role-Based Sidebar */}
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          isOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        {/* Content View Area with reactive server sync update */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8" key={`${activeTab}-${dbVersion}`}>
          {renderActiveView()}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 px-6 text-center text-xs text-gray-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
          <span>
            <strong className="text-gray-900 font-semibold">LMS PJOK</strong> &copy; {new Date().getFullYear()} • Slogan:{' '}
            <em className="text-teal-700 font-medium not-italic">&quot;Belajar, Bergerak, Berkembang.&quot;</em>
          </span>
          <span className="text-[11px] text-gray-500 font-medium">
            Penyimpanan Data Internal Mandiri • Database Offline-Ready
          </span>
        </div>
      </footer>

      <UserProfileModal
        currentUser={currentUser}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onShowToast={showToast}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onNavigate={handleNavigate}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-teal-300 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/20 rounded-lg ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
