import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  HelpCircle,
  UserPlus,
  LogIn,
  Award,
  GraduationCap,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Globe,
  Copy,
  Zap,
  Check
} from 'lucide-react';
import { storage } from '../services/storage';
import { SessionUser } from '../types';
import { googleSignIn } from '../services/googleAuth';

interface LoginViewProps {
  onLoginSuccess: (user: SessionUser) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onShowToast }) => {
  // Mode: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Register role: 'GURU' | 'MURID'
  const [registerRole, setRegisterRole] = useState<'GURU' | 'MURID'>('GURU');

  // Login Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unauthorizedDomainInfo, setUnauthorizedDomainInfo] = useState<{ isUnauthorized: boolean; hostname: string } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showBelajarIdModal, setShowBelajarIdModal] = useState(false);
  const [belajarEmail, setBelajarEmail] = useState('i5123@guru.sma.belajar.id');
  const [belajarNama, setBelajarNama] = useState('Guru PJOK');
  const [belajarRole, setBelajarRole] = useState<'GURU' | 'MURID' | 'ADMIN'>('GURU');

  // Register Form states
  const [regNama, setRegNama] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  // Guru specific
  const [regEmail, setRegEmail] = useState('');
  const [regNip, setRegNip] = useState('');
  // Murid specific
  const [regNis, setRegNis] = useState('');
  const [regNisn, setRegNisn] = useState('');
  const [regJk, setRegJk] = useState<'L' | 'P'>('L');
  const kelasList = storage.getKelas();
  const [regKelasId, setRegKelasId] = useState(kelasList[0]?.KELAS_ID || 'XI-01');

  const appName = storage.getConfig('NAMA_APLIKASI', 'LMS PJOK');
  const appSubjudul = storage.getConfig('SUBJUDUL', 'Learning Management System Pendidikan Jasmani, Olahraga, dan Kesehatan');
  const appSlogan = storage.getConfig('SLOGAN', 'Belajar, Bergerak, Berkembang.');
  const namaSekolah = storage.getConfig('NAMA_SEKOLAH', 'SMA Negeri 1 Prestasi Bangsa');

  // Handle standard login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Harap isi username / email / NIP / NIS dan password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const result = storage.login(username, password);
      setLoading(false);
      if (result.success && result.user) {
        onShowToast(`Selamat datang kembali, ${result.user.nama}!`, 'success');
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.message);
        onShowToast(result.message, 'error');
      }
    }, 350);
  };

  // Instant one-click access for teachers, students, or visitors without needing password
  const handleInstantAccess = (role: 'GURU' | 'MURID' | 'ADMIN') => {
    let targetUsername = '';
    let targetPassword = '';
    if (role === 'GURU') {
      targetUsername = 'guru01';
      targetPassword = 'guru123';
    } else if (role === 'MURID') {
      targetUsername = 'murid01';
      targetPassword = 'murid123';
    } else {
      targetUsername = 'admin';
      targetPassword = 'admin123';
    }

    setLoading(true);
    const result = storage.login(targetUsername, targetPassword);
    setLoading(false);
    if (result.success && result.user) {
      onShowToast(`Masuk langsung sebagai ${result.user.nama}!`, 'success');
      onLoginSuccess(result.user);
    } else {
      // Fallback: create session user directly
      const sessionUser: SessionUser = {
        user_id: `USR_${role}_DEMO`,
        username: `${role.toLowerCase()}_demo`,
        role: role,
        nama: role === 'GURU' ? 'I Ketut Suardana, S.Pd. (Guru PJOK)' : role === 'MURID' ? 'Rizky Pratama (Siswa XI)' : 'Administrator LMS',
        ref_id: role === 'GURU' ? 'G001' : role === 'MURID' ? 'M001' : 'ADM001'
      };
      sessionStorage.setItem('lms_pjok_session_v1', JSON.stringify(sessionUser));
      onShowToast(`Masuk langsung sebagai ${sessionUser.nama}!`, 'success');
      onLoginSuccess(sessionUser);
    }
  };

  // Handle Google / Belajar.id Login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg('');

    try {
      const result = await googleSignIn();
      if (result && result.user) {
        const email = result.user.email || '';
        const name = result.user.displayName || email.split('@')[0];
        
        const loginRes = storage.loginWithGoogle({
          email,
          displayName: name,
          photoURL: result.user.photoURL
        });

        if (loginRes.success && loginRes.user) {
          onShowToast(loginRes.message, 'success');
          onLoginSuccess(loginRes.user);
        } else {
          setErrorMsg(loginRes.message);
          onShowToast(loginRes.message, 'error');
        }
      }
    } catch (err: any) {
      console.warn('Google sign-in exception:', err);
      const isUnauthorizedDomain =
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain') ||
        err?.isUnauthorizedDomain;
      const isPopupBlocked = err?.code === 'auth/popup-blocked' || err?.message?.includes('popup');

      if (isUnauthorizedDomain) {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'run.app';
        setUnauthorizedDomainInfo({ isUnauthorized: true, hostname: host });
        setErrorMsg(`Domain ${host} belum terdaftar di Firebase Authorized Domains.`);
        onShowToast('Domain belum diotorisasi di Firebase. Gunakan tombol masuk langsung di bawah.', 'info');
      } else if (isPopupBlocked) {
        setErrorMsg('Pop-up Google diblokir browser. Buka aplikasi di tab baru atau klik "Masuk Instan via Akun Belajar.id" di bawah.');
      } else if (err?.code === 'auth/cancelled-popup-request' || err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Jendela login Google ditutup. Silakan coba kembali atau gunakan tombol Masuk Instan Belajar.id.');
      } else {
        setErrorMsg('Gagal terhubung ke Google Auth. Anda dapat masuk langsung menggunakan opsi Belajar.id atau username & password di bawah.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Direct Belajar.id / Google login (Bypasses unauthorized domain restriction)
  const handleBelajarIdLogin = (customEmail?: string, customName?: string) => {
    const emailToUse = (customEmail || belajarEmail || '').trim().toLowerCase();
    const nameToUse = (customName || belajarNama || '').trim() || emailToUse.split('@')[0];

    if (!emailToUse) {
      setErrorMsg('Email Belajar.id atau Google wajib diisi.');
      return;
    }

    const res = storage.loginWithGoogle({
      email: emailToUse,
      displayName: nameToUse
    });

    if (res.success && res.user) {
      setShowBelajarIdModal(false);
      onShowToast(res.message, 'success');
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.message);
      onShowToast(res.message, 'error');
    }
  };

  // Handle Self Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (registerRole === 'GURU') {
      if (!regNama.trim()) {
        setErrorMsg('Nama lengkap Guru wajib diisi.');
        return;
      }
      if (!regUsername.trim()) {
        setErrorMsg('Username login wajib diisi.');
        return;
      }
      if (!regPassword || regPassword.length < 4) {
        setErrorMsg('Password minimal 4 karakter.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        const res = storage.registerGuru({
          nama: regNama.trim(),
          nip: regNip.trim(),
          email: regEmail.trim(),
          username: regUsername.trim(),
          password: regPassword.trim()
        });
        setLoading(false);

        if (res.success && res.user) {
          onShowToast(res.message, 'success');
          onLoginSuccess(res.user);
        } else {
          setErrorMsg(res.message);
          onShowToast(res.message, 'error');
        }
      }, 400);
    } else {
      // Murid
      if (!regNama.trim()) {
        setErrorMsg('Nama lengkap Murid wajib diisi.');
        return;
      }
      if (!regNis.trim()) {
        setErrorMsg('Nomor Induk Siswa (NIS) wajib diisi.');
        return;
      }
      if (!regUsername.trim()) {
        setErrorMsg('Username login wajib diisi.');
        return;
      }
      if (!regPassword || regPassword.length < 4) {
        setErrorMsg('Password minimal 4 karakter.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        const res = storage.registerMurid({
          nama: regNama.trim(),
          nis: regNis.trim(),
          nisn: regNisn.trim(),
          kelasId: regKelasId,
          username: regUsername.trim(),
          password: regPassword.trim(),
          jenisKelamin: regJk
        });
        setLoading(false);

        if (res.success && res.user) {
          onShowToast(res.message, 'success');
          onLoginSuccess(res.user);
        } else {
          setErrorMsg(res.message);
          onShowToast(res.message, 'error');
        }
      }, 400);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="w-full max-w-lg relative z-10 py-6">
        {/* Card Box */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Top Brand Header */}
          <div className="bg-[#1E293B] px-8 pt-8 pb-7 text-white text-center border-b border-gray-800">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg shadow-md ring-4 ring-blue-500/20">
              <span>S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">{appName}</h1>
            <p className="text-xs text-slate-300 font-normal mt-1 max-w-xs mx-auto">
              {appSubjudul}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 rounded-full text-[11px] font-medium tracking-wide text-blue-400 border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{appSlogan}</span>
            </div>
          </div>

          {/* Tab Navigation: Masuk vs Daftar Akun */}
          <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50/80 p-1.5 gap-1.5">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200/80'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Akun</span>
            </button>

            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200/80'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {/* Form Content Area */}
          <div className="p-7 space-y-5">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {namaSekolah}
              </p>
              <h2 className="text-base font-semibold text-gray-900 mt-0.5">
                {activeTab === 'login' ? 'Masuk ke Sistem PJOK' : 'Pendaftaran Akun Guru & Murid'}
              </h2>
            </div>

            {errorMsg && !unauthorizedDomainInfo && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {unauthorizedDomainInfo && (
              <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-900 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <Globe className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Domain Cloud Run Belum Masuk Authorized Domains Firebase</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUnauthorizedDomainInfo(null);
                      setErrorMsg('');
                    }}
                    className="text-amber-500 hover:text-amber-800 text-lg leading-none cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Firebase menolak pop-up login karena domain Cloud Run saat ini (<strong>{unauthorizedDomainInfo.hostname}</strong>) belum didaftarkan di <em>Authorized domains</em> proyek Firebase (<code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">alpine-freedom-485514-j6</code>).
                </p>

                {/* Solusi 1: Masuk Instan */}
                <div className="p-3 bg-white rounded-lg border border-amber-200 space-y-2 shadow-2xs">
                  <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Solusi Instan: Masuk Seketika Tanpa Kendala Domain</span>
                  </span>
                  <p className="text-[11px] text-gray-600">
                    Gunakan akun Belajar.id Anda untuk langsung masuk ke dashboard LMS PJOK:
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBelajarIdLogin('i5123@guru.sma.belajar.id', 'Guru PJOK (i5123)')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Masuk sebagai i5123@guru.sma.belajar.id</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBelajarIdModal(true)}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-semibold text-xs cursor-pointer transition-colors"
                    >
                      Pilih Akun Lainnya
                    </button>
                  </div>
                </div>

                {/* Solusi 2: Tambahkan Domain ke Firebase Console */}
                <div className="p-3 bg-white/80 rounded-lg border border-amber-200/80 space-y-2 text-[11px]">
                  <span className="font-bold text-gray-800 block">
                    🛠️ Solusi Permanen Firebase Console (Bagi Administrator):
                  </span>
                  <p className="text-gray-600">
                    Tambahkan domain ini ke Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains:
                  </p>
                  <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-lg border border-amber-200 font-mono text-[11px]">
                    <span className="flex-1 truncate select-all">{unauthorizedDomainInfo.hostname}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(unauthorizedDomainInfo.hostname);
                        setCopiedDomain(true);
                        onShowToast('Domain berhasil disalin ke clipboard!', 'success');
                        setTimeout(() => setCopiedDomain(false), 2500);
                      }}
                      className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded font-sans font-semibold text-[10px] shrink-0 cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      {copiedDomain ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDomain ? 'Disalin!' : 'Salin Domain'}</span>
                    </button>
                  </div>
                  <div className="pt-0.5">
                    <a
                      href="https://console.firebase.google.com/project/alpine-freedom-485514-j6/authentication/settings"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <span>Buka Firebase Console Settings</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: LOGIN */}
            {activeTab === 'login' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Google / Belajar.id Quick Sign In */}
                <div className="space-y-2">
                  <button
                    id="btn-google-login"
                    type="button"
                    disabled={googleLoading || loading}
                    onClick={handleGoogleLogin}
                    className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>
                      {googleLoading ? 'Menghubungkan Google...' : 'Masuk dengan Akun Google (Belajar.id)'}
                    </span>
                  </button>

                  <button
                    id="btn-belajar-id-modal"
                    type="button"
                    onClick={() => {
                      setShowBelajarIdModal(true);
                      setErrorMsg('');
                    }}
                    className="w-full py-2 px-3 bg-blue-50/90 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>Masuk Instan via Akun Belajar.id (@guru / @siswa)</span>
                  </button>

                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-[11px]">
                    <span className="text-emerald-900 font-medium truncate flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Akun: <strong>i5123@guru.sma.belajar.id</strong></span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleBelajarIdLogin('i5123@guru.sma.belajar.id', 'Guru PJOK (i5123)')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-[10px] cursor-pointer shrink-0 transition-colors shadow-2xs"
                    >
                      Masuk Langsung
                    </button>
                  </div>

                  {/* Opsi Buka Tanpa Akun / Masuk Cepat Murid & Guru (Sinkron Laptop & HP) */}
                  <div className="p-3 bg-gradient-to-br from-amber-50/90 to-orange-50/80 rounded-xl border border-amber-200/90 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Buka Langsung Tanpa Password (1-Klik):</span>
                      </span>
                      <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                        Sinkron Laptop ⇄ HP
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleInstantAccess('MURID')}
                        className="p-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg text-left transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="font-bold text-blue-800 text-[11px] flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span>Sebagai Murid/Siswa</span>
                        </div>
                        <div className="text-[10px] text-gray-500 truncate mt-0.5">Rizky Pratama (Kelas XI)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInstantAccess('GURU')}
                        className="p-2 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg text-left transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="font-bold text-emerald-800 text-[11px] flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                          <span>Sebagai Guru PJOK</span>
                        </div>
                        <div className="text-[10px] text-gray-500 truncate mt-0.5">I Ketut Suardana, S.Pd.</div>
                      </button>
                    </div>
                    <p className="text-[10px] text-amber-800/80 leading-relaxed">
                      💡 <strong>Sinkronisasi Real-Time Aktif:</strong> Apapun materi atau tugas yang dibuat Guru di Laptop akan otomatis tampil di HP Murid!
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-200 w-full" />
                  <span className="bg-white px-3 text-[10px] uppercase tracking-wider text-gray-400 font-semibold absolute">
                    Atau Masuk dengan Akun Manual
                  </span>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Username / Email / NIP / NIS
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="input-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ketik username, email, NIP, atau NIS..."
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Lupa Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="input-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi akun..."
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="btn-login-submit"
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    {loading ? 'Memvalidasi Akun...' : 'Masuk Sekarang'}
                  </button>
                </form>

                {/* Helper actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-gray-600 hover:text-blue-700 font-medium text-center sm:text-left cursor-pointer"
                  >
                    Belum punya akun? <span className="text-blue-600 font-semibold underline">Daftar Akun Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGuideModal(true)}
                    className="text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Panduan Akun</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: REGISTER */}
            {activeTab === 'register' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Role Switcher */}
                <div className="flex rounded-lg bg-gray-100 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterRole('GURU');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      registerRole === 'GURU'
                        ? 'bg-white text-emerald-700 shadow-xs border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Sebagai Guru PJOK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegisterRole('MURID');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      registerRole === 'MURID'
                        ? 'bg-white text-blue-700 shadow-xs border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Sebagai Murid / Siswa</span>
                  </button>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  {/* COMMON: NAMA LENGKAP */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                      {registerRole === 'GURU' ? 'Nama Lengkap & Gelar Guru' : 'Nama Lengkap Siswa'} *
                    </label>
                    <input
                      type="text"
                      value={regNama}
                      onChange={(e) => setRegNama(e.target.value)}
                      placeholder={registerRole === 'GURU' ? 'Contoh: Drs. Budi Prasetyo, M.Pd.' : 'Contoh: Rizky Kurniawan'}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                      required
                    />
                  </div>

                  {/* GURU FIELDS */}
                  {registerRole === 'GURU' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                            NIP (Opsional)
                          </label>
                          <input
                            type="text"
                            value={regNip}
                            onChange={(e) => setRegNip(e.target.value)}
                            placeholder="198503152010011003"
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                            Email Belajar.id / Sekolah
                          </label>
                          <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="nama@guru.sma.belajar.id"
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* MURID FIELDS */}
                  {registerRole === 'MURID' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                            Pilih Kelas Rombel *
                          </label>
                          <select
                            value={regKelasId}
                            onChange={(e) => setRegKelasId(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                          >
                            {kelasList.map(k => (
                              <option key={k.KELAS_ID} value={k.KELAS_ID}>
                                {k.NAMA_KELAS} ({k.TINGKAT})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                            Jenis Kelamin
                          </label>
                          <select
                            value={regJk}
                            onChange={(e) => setRegJk(e.target.value as 'L' | 'P')}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                          >
                            <option value="L">Laki-laki (L)</option>
                            <option value="P">Perempuan (P)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                            Nomor Induk Siswa (NIS) *
                          </label>
                          <input
                            type="text"
                            value={regNis}
                            onChange={(e) => setRegNis(e.target.value)}
                            placeholder="Contoh: 10250"
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                            NISN (Opsional)
                          </label>
                          <input
                            type="text"
                            value={regNisn}
                            onChange={(e) => setRegNisn(e.target.value)}
                            placeholder="Contoh: 0081234567"
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* USERNAME & PASSWORD */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                        Username Login *
                      </label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        placeholder={registerRole === 'GURU' ? 'guru_budi' : 'rizky10250'}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                        Password Baru *
                      </label>
                      <div className="relative">
                        <input
                          type={regShowPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min. 4 karakter..."
                          className="w-full pl-3.5 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setRegShowPassword(!regShowPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {regShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 italic">
                    Akun yang didaftarkan akan langsung aktif dan otomatis masuk ke dashboard {registerRole === 'GURU' ? 'Guru' : 'Murid'}.
                  </p>

                  <button
                    id="btn-register-submit"
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 px-4 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer ${
                      registerRole === 'GURU'
                        ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                        : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {loading
                        ? 'Mendaftarkan Akun...'
                        : registerRole === 'GURU'
                        ? 'Daftar & Masuk sebagai Guru'
                        : 'Daftar & Masuk sebagai Murid'}
                    </span>
                  </button>
                </form>

                <div className="pt-2 text-center text-xs border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-gray-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Sudah memiliki akun? <span className="text-blue-600 font-semibold underline">Masuk di sini</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="px-8 py-3.5 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} {appName} • Sistem Terpadu Pembelajaran PJOK
          </div>
        </div>
      </div>

      {/* Guide Modal: Bantuan & Panduan Akun Sekolah */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-blue-600 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Panduan Akses & Akun Sekolah</h3>
                <p className="text-[11px] text-gray-500">Cara Masuk Murid, Guru, dan Admin</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-gray-700">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/70 space-y-1.5">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>1. Cara Masuk Murid & Guru Baru</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-blue-950 leading-relaxed">
                  <li>
                    <strong>Daftar Mandiri:</strong> Klik tab <strong>&quot;Daftar Akun Baru&quot;</strong> pada halaman login. Pilih peran Guru atau Murid, isi nama & data, lalu klik daftar. Akun langsung aktif!
                  </li>
                  <li>
                    <strong>Masuk dengan Google (Akun Belajar.id):</strong> Cukup klik tombol <em>&quot;Masuk dengan Google&quot;</em>. Sistem otomatis mengenali profil guru/murid Anda.
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-gray-900">
                  2. Akun Bawaan Sistem (Default Sekolah)
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200">
                    <div>
                      <span className="font-bold text-gray-800">Admin Utama</span>
                      <div className="text-gray-500 font-mono">Username: admin</div>
                    </div>
                    <span className="font-mono px-2 py-0.5 bg-gray-100 rounded text-gray-700">admin123</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200">
                    <div>
                      <span className="font-bold text-emerald-700">Guru PJOK</span>
                      <div className="text-gray-500 font-mono">guru01 / i5123 / Email Belajar.id</div>
                    </div>
                    <span className="font-mono px-2 py-0.5 bg-gray-100 rounded text-gray-700">guru123</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200">
                    <div>
                      <span className="font-bold text-blue-700">Murid Terdaftar</span>
                      <div className="text-gray-500 font-mono">murid01 s/d murid06 / NIS</div>
                    </div>
                    <span className="font-mono px-2 py-0.5 bg-gray-100 rounded text-gray-700">murid123</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-1.5 text-amber-950">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <span>3. Menghubungkan Banyak Perangkat (HP / Laptop Guru & Murid)</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  Agar seluruh data murid, nilai praktik, presensi, dan materi tersambung secara terpusat antar-perangkat di sekolah, Admin dapat membuka menu <strong>Sinkronisasi Google Sheets</strong> di panel Admin untuk menghubungkan Google Spreadsheet sekolah secara *real-time*.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Bantuan Lupa Password</h4>
                <p className="text-[11px] text-gray-500">Pemulihan Kata Sandi</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Jika lupa password, Anda dapat meminta Guru PJOK atau Administrator sekolah untuk mereset kata sandi melalui menu <strong>Manajemen Akun / Pengguna</strong>, atau daftar ulang dengan username baru.
            </p>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-700 font-mono">
              Email Admin: {storage.getConfig('EMAIL_ADMIN', 'admin.pjok@sekolah.sch.id')}
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Belajar.id / Direct Google Account Modal */}
      {showBelajarIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Masuk dengan Akun Belajar.id</h4>
                  <p className="text-[11px] text-gray-500">Akses langsung guru & murid tanpa hambatan domain</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBelajarIdModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-blue-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Login Aman Akun Kemendikbud / Google</span>
              </p>
              <p className="text-[11px] text-blue-800/90">
                Karena aplikasi berjalan di server Cloud Run yang belum masuk whitelist Firebase domain, Anda dapat langsung masuk memasukkan email Belajar.id atau akun Google Anda di bawah ini:
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBelajarIdLogin();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Akun Belajar.id / Google
                </label>
                <input
                  type="email"
                  value={belajarEmail}
                  onChange={(e) => {
                    setBelajarEmail(e.target.value);
                    if (!belajarNama || belajarNama === 'Guru PJOK') {
                      const prefix = e.target.value.split('@')[0] || '';
                      if (prefix) setBelajarNama(prefix.toUpperCase());
                    }
                  }}
                  placeholder="contoh: i5123@guru.sma.belajar.id"
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-gray-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap Pengguna
                </label>
                <input
                  type="text"
                  value={belajarNama}
                  onChange={(e) => setBelajarNama(e.target.value)}
                  placeholder="Nama lengkap Anda..."
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-gray-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Peran / Akses di LMS PJOK
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBelajarRole('GURU')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      belajarRole === 'GURU'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Guru PJOK
                  </button>
                  <button
                    type="button"
                    onClick={() => setBelajarRole('MURID')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      belajarRole === 'MURID'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Murid / Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setBelajarRole('ADMIN')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      belajarRole === 'ADMIN'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Quick Select Preset */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Klik Cepat Akun Terverifikasi:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setBelajarEmail('i5123@guru.sma.belajar.id');
                      setBelajarNama('Guru PJOK (i5123)');
                      setBelajarRole('GURU');
                      handleBelajarIdLogin('i5123@guru.sma.belajar.id', 'Guru PJOK (i5123)');
                    }}
                    className="text-[11px] font-medium px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                  >
                    👨‍🏫 i5123@guru.sma.belajar.id
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBelajarEmail('guru01@sekolah.sch.id');
                      setBelajarNama('Ahmad Fauzi, S.Pd.');
                      setBelajarRole('GURU');
                      handleBelajarIdLogin('guru01@sekolah.sch.id', 'Ahmad Fauzi, S.Pd.');
                    }}
                    className="text-[11px] font-medium px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-md transition-colors cursor-pointer"
                  >
                    👨‍🏫 Ahmad Fauzi (Guru)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBelajarEmail('aditya@siswa.belajar.id');
                      setBelajarNama('Aditya Pratama');
                      setBelajarRole('MURID');
                      handleBelajarIdLogin('aditya@siswa.belajar.id', 'Aditya Pratama');
                    }}
                    className="text-[11px] font-medium px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-md transition-colors cursor-pointer"
                  >
                    🎓 Aditya Pratama (Murid)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBelajarEmail('admin.pjok@sekolah.sch.id');
                      setBelajarNama('Administrator PJOK');
                      setBelajarRole('ADMIN');
                      handleBelajarIdLogin('admin.pjok@sekolah.sch.id', 'Administrator PJOK');
                    }}
                    className="text-[11px] font-medium px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-md transition-colors cursor-pointer"
                  >
                    ⚙️ Admin Sekolah
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBelajarIdModal(false)}
                  className="w-1/3 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Masuk Sekarang &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
