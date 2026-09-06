import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  LogOut,
  ChevronRight,
  Database
} from 'lucide-react';
import { googleSignIn, googleSignOut, getCurrentGoogleUser, initAuth } from '../../services/googleAuth';
import { googleSheetsService, DriveSpreadsheetFile, SpreadsheetMetadata, SHEET_NAMES } from '../../services/googleSheets';
import { storage } from '../../services/storage';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [googleUser, setGoogleUser] = useState<any>(getCurrentGoogleUser());
  const [spreadsheetId, setSpreadsheetId] = useState(storage.getConfig('GOOGLE_SPREADSHEET_ID', ''));
  const [spreadsheetMeta, setSpreadsheetMeta] = useState<SpreadsheetMetadata | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveSpreadsheetFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(storage.getConfig('LAST_SHEETS_SYNC', ''));
  const [statusMsg, setStatusMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'browse' | 'create'>('status');

  useEffect(() => {
    const unsub = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen && spreadsheetId && googleUser) {
      loadSpreadsheetInfo(spreadsheetId);
    }
  }, [isOpen, spreadsheetId, googleUser]);

  const loadSpreadsheetInfo = async (id: string) => {
    if (!id.trim()) return;
    try {
      const meta = await googleSheetsService.getSpreadsheetMetadata(id.trim());
      setSpreadsheetMeta(meta);
    } catch (e: any) {
      console.warn('Could not load sheet meta:', e.message);
      setSpreadsheetMeta(null);
    }
  };

  const handleConnectGoogle = async () => {
    setIsProcessing(true);
    setStatusMsg('Menghubungkan ke Google...');
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setGoogleUser(res.user);
        onShowToast(`Terhubung dengan Google: ${res.user.email}`, 'success');
        if (spreadsheetId) {
          await loadSpreadsheetInfo(spreadsheetId);
        }
      }
    } catch (e: any) {
      if (e?.code === 'auth/unauthorized-domain' || e?.message?.includes('unauthorized-domain') || e?.isUnauthorizedDomain) {
        onShowToast(`Domain ${window.location.hostname} belum diizinkan di Firebase. Gunakan tab Google Apps Script untuk sinkronisasi tanpa batas domain.`, 'error');
      } else {
        onShowToast(e.message || 'Gagal menghubungkan akun Google.', 'error');
      }
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  const handleDisconnectGoogle = async () => {
    if (window.confirm('Apakah Anda yakin ingin memutuskan sambungan akun Google?')) {
      await googleSignOut();
      setGoogleUser(null);
      setSpreadsheetMeta(null);
      onShowToast('Akun Google berhasil diputuskan.', 'info');
    }
  };

  const handleFetchDriveFiles = async () => {
    if (!googleUser) {
      onShowToast('Silakan hubungkan akun Google terlebih dahulu.', 'error');
      return;
    }
    setLoadingFiles(true);
    try {
      const files = await googleSheetsService.listUserSpreadsheets();
      setDriveFiles(files);
      setActiveTab('browse');
    } catch (e: any) {
      onShowToast(e.message || 'Gagal mengambil daftar spreadsheet dari Google Drive.', 'error');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleSelectSpreadsheet = async (file: DriveSpreadsheetFile) => {
    setSpreadsheetId(file.id);
    storage.updateConfig('GOOGLE_SPREADSHEET_ID', file.id, 'ID Google Spreadsheet LMS PJOK');
    onShowToast(`Spreadsheet "${file.name}" berhasil dipilih!`, 'success');
    await loadSpreadsheetInfo(file.id);
    setActiveTab('status');
  };

  const handleCreateNewSpreadsheet = async () => {
    if (!googleUser) {
      onShowToast('Silakan hubungkan akun Google terlebih dahulu.', 'error');
      return;
    }

    const title = window.prompt('Masukkan nama Google Spreadsheet baru:', 'Database LMS PJOK SMA');
    if (!title || !title.trim()) return;

    setIsProcessing(true);
    setStatusMsg('Membuat spreadsheet baru dengan 19 sheet tabel LMS PJOK...');
    try {
      const currentDb = storage.getDatabase();
      const meta = await googleSheetsService.createNewLmsSpreadsheet(title.trim(), currentDb);
      setSpreadsheetId(meta.spreadsheetId);
      setSpreadsheetMeta(meta);
      storage.updateConfig('GOOGLE_SPREADSHEET_ID', meta.spreadsheetId, 'ID Google Spreadsheet LMS PJOK');
      
      const now = new Date().toLocaleString('id-ID');
      setLastSyncTime(now);
      storage.updateConfig('LAST_SHEETS_SYNC', now, 'Waktu Sinkronisasi Terakhir');

      onShowToast(`Spreadsheet baru berhasil dibuat dan diisi data awal!`, 'success');
      setActiveTab('status');
    } catch (e: any) {
      onShowToast(e.message || 'Gagal membuat spreadsheet baru.', 'error');
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  const handleExportToSheets = async () => {
    if (!spreadsheetId.trim()) {
      onShowToast('Pilih atau masukkan ID Google Spreadsheet terlebih dahulu.', 'error');
      return;
    }

    setIsProcessing(true);
    setStatusMsg('Mengekspor seluruh 19 sheet data ke Google Sheets...');
    try {
      const currentDb = storage.getDatabase();
      await googleSheetsService.exportAllToSpreadsheet(spreadsheetId.trim(), currentDb, true);
      const now = new Date().toLocaleString('id-ID');
      setLastSyncTime(now);
      storage.updateConfig('LAST_SHEETS_SYNC', now, 'Waktu Sinkronisasi Terakhir');
      await loadSpreadsheetInfo(spreadsheetId.trim());
      onShowToast('Seluruh data LMS berhasil diekspor ke Google Sheets!', 'success');
    } catch (e: any) {
      onShowToast(e.message || 'Gagal mengekspor data ke Google Sheets.', 'error');
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  const handleImportFromSheets = async () => {
    if (!spreadsheetId.trim()) {
      onShowToast('Pilih atau masukkan ID Google Spreadsheet terlebih dahulu.', 'error');
      return;
    }

    const confirmed = window.confirm(
      'PERINGATAN: Mengimpor dari Google Sheets akan menimpa data yang ada di aplikasi dengan data terbaru dari Google Spreadsheet.\n\nApakah Anda yakin ingin melanjutkan?'
    );
    if (!confirmed) return;

    setIsProcessing(true);
    setStatusMsg('Mengunduh seluruh 19 sheet data dari Google Sheets...');
    try {
      const importedData = await googleSheetsService.importAllFromSpreadsheet(spreadsheetId.trim());
      storage.mergeDatabase(importedData);
      const now = new Date().toLocaleString('id-ID');
      setLastSyncTime(now);
      storage.updateConfig('LAST_SHEETS_SYNC', now, 'Waktu Sinkronisasi Terakhir');
      onShowToast('Data berhasil disinkronkan dari Google Sheets! Memuat ulang...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (e: any) {
      onShowToast(e.message || 'Gagal mengimpor data dari Google Sheets.', 'error');
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  const handleManualSaveId = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateConfig('GOOGLE_SPREADSHEET_ID', spreadsheetId.trim(), 'ID Google Spreadsheet LMS PJOK');
    if (spreadsheetId.trim() && googleUser) {
      loadSpreadsheetInfo(spreadsheetId.trim());
    }
    onShowToast('ID Spreadsheet berhasil disimpan.', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Integrasi Google Sheets & Drive</h2>
              <p className="text-xs text-slate-500">
                Sinkronisasi database LMS PJOK secara langsung ke Google Spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Google Account Authentication */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Akun Google Terhubung</div>
              {googleUser ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold font-mono">
                    {googleUser.email ? googleUser.email[0].toUpperCase() : 'G'}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{googleUser.email}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Terhubung
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-500 mt-1">
                  Belum terhubung ke Akun Google. Masuk untuk mengizinkan sinkronisasi ke Google Drive & Sheets.
                </div>
              )}
            </div>

            <div>
              {googleUser ? (
                <button
                  type="button"
                  onClick={handleDisconnectGoogle}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Putuskan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>Hubungkan Akun Google</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 font-bold cursor-pointer transition-colors border-b-2 -mb-px ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Status & Sinkronisasi
          </button>
          <button
            onClick={handleFetchDriveFiles}
            className={`pb-2.5 px-3 font-bold cursor-pointer transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'browse'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Telusuri di Google Drive
          </button>
        </div>

        {/* Tab 1: Status & Sync Controls */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {/* Linked Spreadsheet Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-emerald-800">
                  Google Spreadsheet Aktif
                </span>
                {spreadsheetMeta?.spreadsheetUrl && (
                  <a
                    href={spreadsheetMeta.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                  >
                    Buka di Google Sheets <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div>
                <div className="text-sm font-bold text-slate-900">
                  {spreadsheetMeta ? spreadsheetMeta.title : (spreadsheetId ? 'Spreadsheet Tersambung' : 'Belum Ada Spreadsheet Terpilih')}
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  ID: <span className="text-slate-700">{spreadsheetId || 'Belum diatur'}</span>
                </div>
              </div>

              {spreadsheetMeta && (
                <div className="text-[11px] text-emerald-800 flex items-center gap-3 pt-1 border-t border-emerald-100">
                  <span>Jumlah Sheet: <strong>{spreadsheetMeta.sheets.length}</strong></span>
                  <span>•</span>
                  <span>19 Tabel LMS: <strong>{spreadsheetMeta.sheets.filter(s => (SHEET_NAMES as readonly string[]).includes(s.title)).length}/19 Siap</strong></span>
                </div>
              )}

              {lastSyncTime && (
                <div className="text-[10px] text-slate-500">
                  Terakhir disinkronkan: <strong>{lastSyncTime}</strong>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportToSheets}
                disabled={isProcessing || !googleUser || !spreadsheetId}
                className="p-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Ekspor Data ke Google Sheets</span>
              </button>

              <button
                type="button"
                onClick={handleImportFromSheets}
                disabled={isProcessing || !googleUser || !spreadsheetId}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Impor Data dari Google Sheets</span>
              </button>
            </div>

            {/* Create Spreadsheet Option */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-slate-800">Belum punya Spreadsheet khusus LMS?</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Buat spreadsheet baru secara otomatis dengan 19 lembar tabel LMS PJOK siap pakai.
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateNewSpreadsheet}
                disabled={isProcessing || !googleUser}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Buat Spreadsheet Baru
              </button>
            </div>

            {/* Manual ID Form */}
            <form onSubmit={handleManualSaveId} className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Atur Spreadsheet ID Manual
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Simpan ID
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Browse Google Drive */}
        {activeTab === 'browse' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Pilih spreadsheet yang ada di akun Google Drive Anda:</span>
              <button
                onClick={handleFetchDriveFiles}
                className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Muat Ulang
              </button>
            </div>

            {loadingFiles ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                Mencari spreadsheet di Google Drive...
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Tidak ditemukan Google Spreadsheet di akun Anda.
                <div className="mt-2">
                  <button
                    onClick={handleCreateNewSpreadsheet}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    + Buat Spreadsheet Baru Sekarang
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {driveFiles.map((file, fIdx) => (
                  <div
                    key={`drive-modal-file-${file.id || 'f'}-${fIdx}`}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      file.id === spreadsheetId
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate">{file.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{file.id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {file.id === spreadsheetId ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full">
                          Aktif
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectSpreadsheet(file)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          Pilih <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
            <span>{statusMsg || 'Memproses permintaan Google Sheets...'}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" /> 19 Sheet Tersedia (01_CONFIG s/d 19_LOG_AKTIVITAS)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
