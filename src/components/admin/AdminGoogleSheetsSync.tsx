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
  Database,
  Link,
  Code2,
  Copy,
  Check,
  Zap,
  Globe,
  BookOpen,
  ArrowRight,
  HardDrive,
  Download,
  Upload,
  Info
} from 'lucide-react';
import { googleSignIn, googleSignOut, getCurrentGoogleUser, initAuth, setManualGoogleSession } from '../../services/googleAuth';
import { googleSheetsService, DriveSpreadsheetFile, SpreadsheetMetadata, SHEET_NAMES } from '../../services/googleSheets';
import { storage } from '../../services/storage';

interface AdminGoogleSheetsSyncProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminGoogleSheetsSync: React.FC<AdminGoogleSheetsSyncProps> = ({ onShowToast }) => {
  // Navigation sub-tab
  const [subTab, setSubTab] = useState<'drive' | 'gas' | 'sheets_info'>('drive');

  // Google Account & Direct API state
  const [googleUser, setGoogleUser] = useState<any>(getCurrentGoogleUser());
  const [spreadsheetId, setSpreadsheetId] = useState(storage.getConfig('GOOGLE_SPREADSHEET_ID', ''));
  const [spreadsheetMeta, setSpreadsheetMeta] = useState<SpreadsheetMetadata | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveSpreadsheetFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(storage.getConfig('LAST_SHEETS_SYNC', ''));
  const [statusMsg, setStatusMsg] = useState('');
  const [showDomainHelpModal, setShowDomainHelpModal] = useState(false);
  const [manualEmail, setManualEmail] = useState('i5123@guru.sma.belajar.id');

  // Google Apps Script state
  const [gasUrl, setGasUrl] = useState(
    storage.getConfig('GAS_WEBAPP_URL', 'https://script.google.com/macros/s/AKfycbyeNRTs2sep0ac6gZbjJiJ7vD6XMkZOhMSS6Fz0UzmONGhFJGFw71JxYufNF29wtq6_jA/exec')
  );
  const [gasTesting, setGasTesting] = useState(false);
  const [gasTestResult, setGasTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    detail?: string;
  }>({ status: 'idle', message: '' });
  const [copiedCode, setCopiedCode] = useState(false);

  // Initialize auth listener
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

  // Load spreadsheet metadata if ID is present and user is logged in
  useEffect(() => {
    if (spreadsheetId && googleUser) {
      loadSpreadsheetInfo(spreadsheetId);
    }
  }, [spreadsheetId, googleUser]);

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

  // Google Sign In
  const handleConnectGoogle = async () => {
    setIsProcessing(true);
    setStatusMsg('Menghubungkan ke Akun Google...');
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
        setShowDomainHelpModal(true);
        onShowToast('Domain belum diotorisasi di Firebase. Membuka dialog solusi...', 'info');
      } else {
        onShowToast(e.message || 'Gagal menghubungkan akun Google.', 'error');
      }
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  const handleManualConnect = () => {
    if (!manualEmail.trim()) {
      onShowToast('Masukkan email Google / Belajar.id.', 'error');
      return;
    }
    const session = setManualGoogleSession(manualEmail.trim());
    setGoogleUser(session.user);
    setShowDomainHelpModal(false);
    onShowToast(`Terhubung dengan sesi akun: ${session.user.email}`, 'success');
  };

  // Google Sign Out
  const handleDisconnectGoogle = async () => {
    if (window.confirm('Apakah Anda yakin ingin memutuskan sambungan akun Google?')) {
      await googleSignOut();
      setGoogleUser(null);
      setSpreadsheetMeta(null);
      onShowToast('Akun Google berhasil diputuskan.', 'info');
    }
  };

  // Fetch Drive Files
  const handleFetchDriveFiles = async () => {
    if (!googleUser) {
      onShowToast('Silakan hubungkan akun Google terlebih dahulu.', 'error');
      return;
    }
    setLoadingFiles(true);
    try {
      const files = await googleSheetsService.listUserSpreadsheets();
      setDriveFiles(files);
      if (files.length === 0) {
        onShowToast('Tidak ditemukan file spreadsheet di Google Drive Anda. Anda dapat membuat yang baru.', 'info');
      } else {
        onShowToast(`Ditemukan ${files.length} file spreadsheet di Google Drive.`, 'success');
      }
    } catch (e: any) {
      onShowToast(e.message || 'Gagal mengambil daftar spreadsheet dari Google Drive.', 'error');
    } finally {
      setLoadingFiles(false);
    }
  };

  // Select File from Drive
  const handleSelectSpreadsheet = async (file: DriveSpreadsheetFile) => {
    setSpreadsheetId(file.id);
    storage.updateConfig('GOOGLE_SPREADSHEET_ID', file.id, 'ID Google Spreadsheet LMS PJOK');
    onShowToast(`Spreadsheet "${file.name}" berhasil dipilih!`, 'success');
    await loadSpreadsheetInfo(file.id);
  };

  // Create New Spreadsheet on Google Drive
  const handleCreateNewSpreadsheet = async () => {
    if (!googleUser) {
      onShowToast('Silakan hubungkan akun Google terlebih dahulu.', 'error');
      return;
    }

    const title = window.prompt('Masukkan nama Google Spreadsheet baru:', 'Database LMS PJOK SMA 2026/2027');
    if (!title || !title.trim()) return;

    setIsProcessing(true);
    setStatusMsg('Membuat spreadsheet baru dengan 19 sheet tabel LMS PJOK di Google Drive...');
    try {
      const currentDb = storage.getDatabase();
      const meta = await googleSheetsService.createNewLmsSpreadsheet(title.trim(), currentDb);
      setSpreadsheetId(meta.spreadsheetId);
      setSpreadsheetMeta(meta);
      storage.updateConfig('GOOGLE_SPREADSHEET_ID', meta.spreadsheetId, 'ID Google Spreadsheet LMS PJOK');

      const now = new Date().toLocaleString('id-ID');
      setLastSyncTime(now);
      storage.updateConfig('LAST_SHEETS_SYNC', now, 'Waktu Sinkronisasi Terakhir');

      onShowToast(`Spreadsheet baru "${title}" berhasil dibuat dan diisi data awal!`, 'success');
    } catch (e: any) {
      onShowToast(e.message || 'Gagal membuat spreadsheet baru di Google Drive.', 'error');
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  // Export to Google Sheets
  const handleExportToSheets = async () => {
    if (!spreadsheetId.trim()) {
      onShowToast('Pilih atau masukkan ID Google Spreadsheet terlebih dahulu.', 'error');
      return;
    }

    setIsProcessing(true);
    setStatusMsg('Mengekspor seluruh 19 sheet data aplikasi ke Google Spreadsheet...');
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

  // Import from Google Sheets
  const handleImportFromSheets = async () => {
    if (!spreadsheetId.trim()) {
      onShowToast('Pilih atau masukkan ID Google Spreadsheet terlebih dahulu.', 'error');
      return;
    }

    const confirmed = window.confirm(
      'PERINGATAN: Mengimpor dari Google Sheets akan memperbarui basis data di aplikasi ini dengan data terbaru dari Google Spreadsheet.\n\nLanjutkan proses impor?'
    );
    if (!confirmed) return;

    setIsProcessing(true);
    setStatusMsg('Mengunduh seluruh 19 sheet data dari Google Spreadsheet...');
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

  // Manual save of spreadsheet ID
  const handleManualSaveId = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = spreadsheetId.trim();
    storage.updateConfig('GOOGLE_SPREADSHEET_ID', clean, 'ID Google Spreadsheet LMS PJOK');
    if (clean && googleUser) {
      loadSpreadsheetInfo(clean);
    }
    onShowToast('ID Google Spreadsheet berhasil disimpan.', 'success');
  };

  // GAS test connection
  const handleTestGasConnection = async () => {
    const url = gasUrl.trim();
    if (!url) {
      onShowToast('Masukkan URL Google Apps Script terlebih dahulu.', 'error');
      return;
    }

    setGasTesting(true);
    setGasTestResult({ status: 'idle', message: '' });

    try {
      const pingUrl = url.includes('?') ? `${url}&action=ping` : `${url}?action=ping`;
      const res = await fetch(pingUrl, {
        method: 'GET',
        mode: 'cors'
      });

      if (!res.ok) {
        throw new Error(`HTTP Error status: ${res.status}`);
      }

      const json = await res.json();
      if (json && (json.success || json.message)) {
        setGasTestResult({
          status: 'success',
          message: 'Koneksi Berhasil!',
          detail: `Web App aktif dan dapat diakses publik. Spreadsheet Name: ${json.spreadsheetName || 'Terkoneksi'}`
        });
        storage.updateConfig('GAS_WEBAPP_URL', url, 'URL Google Apps Script Web App');
        onShowToast('Koneksi Google Apps Script berhasil dan siap digunakan multi-perangkat!', 'success');
      } else {
        throw new Error(json?.error || 'Respon dari Apps Script tidak valid.');
      }
    } catch (err: any) {
      console.error('Test connection failed:', err);
      let detailMessage = err.message;
      if (err.name === 'TypeError' || err.message.includes('Failed to fetch') || err.message.includes('CORS')) {
        detailMessage =
          'TERBLOKIR AKSES / CORS: Pengaturan deployment di Google Apps Script belum diset ke "Who has access: Anyone" (Siapa saja). Harap edit Deployment dan pilih Anyone.';
      }
      setGasTestResult({
        status: 'error',
        message: 'Koneksi Gagal / Belum Siap Diakses Publik',
        detail: detailMessage
      });
      onShowToast('Koneksi Apps Script gagal. Periksa pengaturan deployment Anyone.', 'error');
    } finally {
      setGasTesting(false);
    }
  };

  // Fetch data via GAS Web App
  const handleFetchFromGas = async () => {
    const url = gasUrl.trim();
    if (!url) {
      onShowToast('Masukkan URL Google Apps Script terlebih dahulu.', 'error');
      return;
    }

    setIsProcessing(true);
    setStatusMsg('Mengambil data dari Google Apps Script Web App...');
    try {
      const res = await storage.fetchDataFromGoogleAppsScript(url);
      if (res.success) {
        const now = new Date().toLocaleString('id-ID');
        setLastSyncTime(now);
        storage.updateConfig('LAST_SHEETS_SYNC', now, 'Waktu Sinkronisasi Terakhir');
        onShowToast(res.message, 'success');
        setTimeout(() => {
          window.location.reload();
        }, 900);
      } else {
        onShowToast(res.message, 'error');
      }
    } catch (e: any) {
      onShowToast('Gagal menarik data via Apps Script: ' + e.message, 'error');
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  // Apps Script code for 19 sheets
  const appsScriptCode = `/**
 * LMS PJOK SMA - Google Apps Script Web App API
 * Mendukung 19 Sheet Basis Data Sinkronisasi Dua Arah Multi-Perangkat
 */

function doGet(e) {
  var params = e ? e.parameter : {};
  var action = params.action || 'ping';
  var sheetName = params.sheet || '';

  var output = {
    success: true,
    message: 'Backend Google Apps Script LMS PJOK Aktif',
    timestamp: new Date().toISOString()
  };

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'getAllData') {
      var allData = {};
      var sheets = ss.getSheets();
      sheets.forEach(function(s) {
        allData[s.getName()] = getSheetDataAsJson(s);
      });
      output.data = allData;
    } else if (action === 'getSheet' && sheetName) {
      var s = ss.getSheetByName(sheetName);
      if (!s) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');
      output.data = getSheetDataAsJson(s);
    } else if (action === 'ping') {
      output.sheetCount = ss.getSheets().length;
      output.spreadsheetName = ss.getName();
    }
  } catch (err) {
    output.success = false;
    output.error = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var output = { success: true, message: 'Data berhasil diproses' };

  try {
    var raw = e.postData.contents;
    var body = JSON.parse(raw);
    var action = body.action;
    var sheetName = body.sheet;
    var data = body.data;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var s = ss.getSheetByName(sheetName);
    if (!s) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');

    if (action === 'appendRow') {
      var headers = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0];
      var newRow = headers.map(function(h) {
        return data[h] !== undefined ? data[h] : '';
      });
      s.appendRow(newRow);
      output.message = 'Baris berhasil ditambahkan ke ' + sheetName;
    }
  } catch (err) {
    output.success = false;
    output.error = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetDataAsJson(sheet) {
  var lr = sheet.getLastRow();
  var lc = sheet.getLastColumn();
  if (lr < 2 || lc < 1) return [];

  var values = sheet.getRange(1, 1, lr, lc).getValues();
  var headers = values[0];
  var rows = [];

  for (var i = 1; i < values.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    rows.push(row);
  }
  return rows;
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    onShowToast('Kode Apps Script berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // CSV Template download
  const handleDownloadCsvTemplate = () => {
    const headers = 'NIS,NISN,NAMA_MURID,KELAS_ID,JENIS_KELAMIN,EMAIL,STATUS\n';
    const sampleRows = [
      '20261001,0081234501,Aditya Pratama,KELAS_X_A,L,aditya@siswa.belajar.id,AKTIF',
      '20261002,0081234502,Bella Safitri,KELAS_X_A,P,bella@siswa.belajar.id,AKTIF',
      '20261003,0081234503,Candra Wijaya,KELAS_X_A,L,candra@siswa.belajar.id,AKTIF',
      '20261004,0081234504,Dewi Lestari,KELAS_X_B,P,dewi@siswa.belajar.id,AKTIF',
      '20261005,0081234505,Eko Saputra,KELAS_XI_A,L,eko@siswa.belajar.id,AKTIF'
    ].join('\n');

    const csvContent = headers + sampleRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_murid_pjok.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast('Template CSV Murid berhasil diunduh!', 'success');
  };

  // Export JSON backup
  const handleExportBackup = () => {
    try {
      const db = storage.getDatabase();
      const jsonString = JSON.stringify(db, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Cadangan_LMS_PJOK_${dateStr}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('Cadangan database aplikasi (.json) berhasil diunduh!', 'success');
    } catch (err: any) {
      onShowToast('Gagal mengekspor data: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0 shadow-2xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Sinkronisasi Google Sheets & Multi-Perangkat
                </h1>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Cloud Live Sync
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                Hubungkan Google Spreadsheet sekolah untuk sinkronisasi data presensi, nilai, materi, dan murid secara terpusat antar-perangkat (Laptop & HP Guru/Murid).
              </p>
            </div>
          </div>

          {/* Indicators */}
          <div className="flex flex-wrap items-center gap-2">
            {googleUser ? (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google: <strong>{googleUser.email}</strong></span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>Google Belum Terhubung</span>
              </div>
            )}

            {lastSyncTime && (
              <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
                Sinkron Terakhir: <strong>{lastSyncTime}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setSubTab('drive')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'drive'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Google Drive & Spreadsheet Langsung</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('gas')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'gas'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Google Apps Script (Multi-Perangkat HP/Laptop)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('sheets_info')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'sheets_info'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Struktur 19 Sheet & Cadangan Berkas</span>
          </button>
        </div>
      </div>

      {/* Processing Status Banner */}
      {isProcessing && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>{statusMsg || 'Memproses sinkronisasi data... Mohon tunggu sejenak.'}</span>
        </div>
      )}

      {/* SUB-TAB 1: GOOGLE DRIVE & SPREADSHEET LANGSUNG */}
      {subTab === 'drive' && (
        <div className="space-y-6">
          {/* Section: Akun Google */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>1. Hubungkan Akun Google Admin / Sekolah</span>
            </h2>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-gray-700 shadow-2xs">
                  {googleUser?.photoURL ? (
                    <img src={googleUser.photoURL} alt="Avatar" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <span>G</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    {googleUser ? googleUser.displayName || 'Akun Google Terhubung' : 'Belum Ada Akun Google'}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {googleUser ? googleUser.email : 'Masuk dengan Google Belajar.id atau akun Google pribadi sekolah'}
                  </div>
                </div>
              </div>

              <div>
                {googleUser ? (
                  <button
                    type="button"
                    onClick={handleDisconnectGoogle}
                    className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Putuskan Sambungan</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectGoogle}
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Hubungkan Akun Google</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section: Pemilihan atau Pembuatan Spreadsheet */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>2. Pilih atau Buat Google Spreadsheet</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opsi A: Buat Baru Otomatis */}
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Buat Spreadsheet Baru Otomatis</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Sistem akan otomatis membuat file Google Spreadsheet baru di Google Drive Anda dengan <strong>19 Sheet tabel terformat</strong> dan langsung mengisinya dengan data awal aplikasi.
                </p>
                <button
                  type="button"
                  disabled={!googleUser || isProcessing}
                  onClick={handleCreateNewSpreadsheet}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Spreadsheet di Google Drive</span>
                </button>
              </div>

              {/* Opsi B: Pilih dari Google Drive */}
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center gap-2 text-gray-800 font-bold text-xs">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>Pilih dari Google Drive Saya</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Cari dan pilih file spreadsheet yang sudah ada sebelumnya di Google Drive Anda tanpa perlu repot menyalin ID secara manual.
                </p>
                <button
                  type="button"
                  disabled={!googleUser || loadingFiles}
                  onClick={handleFetchDriveFiles}
                  className="w-full py-2.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loadingFiles ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Memuat Drive...</span>
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                      <span>Muat Daftar File Google Drive</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List Drive Files Modal/Inline */}
            {driveFiles.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    File Spreadsheet Ditemukan ({driveFiles.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setDriveFiles([])}
                    className="text-[11px] text-gray-500 hover:text-gray-800"
                  >
                    Tutup Daftar
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-gray-100">
                  {driveFiles.map((file, fIdx) => (
                    <div
                      key={`drive-file-${file.id || 'file'}-${fIdx}`}
                      className="pt-1.5 flex items-center justify-between hover:bg-white p-2 rounded-lg transition-colors cursor-pointer"
                      onClick={() => handleSelectSpreadsheet(file)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-medium text-gray-800 truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0 px-2 py-1 bg-blue-50 rounded"
                      >
                        Pilih
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual ID Input */}
            <form onSubmit={handleManualSaveId} className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Atau Masukkan ID Google Spreadsheet Secara Manual:
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Link className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Simpan ID
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                ID dapat disalin dari URL Google Sheets Anda: https://docs.google.com/spreadsheets/d/<strong>[ID-SPREADSHEET]</strong>/edit
              </p>
            </form>
          </div>

          {/* Section: Status & Aksi Sinkronisasi */}
          {spreadsheetId && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>3. Aksi Sinkronisasi Data</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Spreadsheet Aktif: <strong className="text-gray-800">{spreadsheetMeta?.title || spreadsheetId}</strong>
                  </p>
                </div>

                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 self-start"
                >
                  <span>Buka di Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Ekspor ke Google Sheets */}
                <div className="p-5 rounded-xl border border-gray-200 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Ekspor ke Google Sheets</h4>
                      <p className="text-[11px] text-gray-500">Kirim data dari LMS lokal ke Google Sheets</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Menyimpan seluruh data aplikasi (murid, materi, presensi harian, nilai praktik, dan akun) langsung ke Google Spreadsheet Anda.
                  </p>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleExportToSheets}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Ekspor Seluruh Data ke Sheets</span>
                  </button>
                </div>

                {/* Impor dari Google Sheets */}
                <div className="p-5 rounded-xl border border-gray-200 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <DownloadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Impor dari Google Sheets</h4>
                      <p className="text-[11px] text-gray-500">Tarik data dari Google Sheets ke LMS</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Mengambil data terbaru yang telah Anda edit atau tambahkan langsung di Google Spreadsheet ke dalam aplikasi LMS.
                  </p>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleImportFromSheets}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>Impor Data dari Sheets</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: GOOGLE APPS SCRIPT WEB APP */}
      {subTab === 'gas' && (
        <div className="space-y-6">
          {/* Penjelasan Keunggulan Web App */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Mengapa Google Apps Script Sangat Direkomendasikan untuk Sekolah?</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-900">
              Dengan menerapkan <strong>Google Apps Script Web App</strong>, seluruh murid dan guru lain dapat membuka LMS PJOK di HP atau laptop mereka dan langsung tersambung ke spreadsheet sekolah <strong>tanpa harus login akun Google pemilik spreadsheet</strong> atau terhalang izin pop-up!
            </p>
          </div>

          {/* Konfigurasi URL Web App */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan URL Google Apps Script Web App</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  URL Web App Eksekusi (Deployment URL):
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="url"
                    value={gasUrl}
                    onChange={(e) => setGasUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfy.../exec"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    disabled={gasTesting}
                    onClick={handleTestGasConnection}
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {gasTesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menguji...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Uji Koneksi (Test Ping)</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleFetchFromGas}
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>Tarik Data Cloud</span>
                  </button>
                </div>
              </div>

              {/* Status Test Result */}
              {gasTestResult.status !== 'idle' && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${
                    gasTestResult.status === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {gasTestResult.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{gasTestResult.message}</span>
                  </div>
                  {gasTestResult.detail && <p className="text-[11px] opacity-90">{gasTestResult.detail}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Panduan Langkah demi Langkah Deploy */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Panduan 5 Menit Pasang Google Apps Script</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="text-xs font-bold text-gray-900">Buka Spreadsheet</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Buka file Google Spreadsheet sekolah Anda, lalu klik menu atas: <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h4 className="text-xs font-bold text-gray-900">Tempel Kode Script</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Hapus kode default `function myFunction()`, lalu tempel kode script yang telah disediakan di bawah ini, lalu klik ikon <strong>Simpan (Save)</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h4 className="text-xs font-bold text-gray-900">Terapkan (Deploy)</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Klik <strong>Deploy</strong> &gt; <strong>New deployment</strong>. Pilih jenis <strong>Web app</strong>. Setel <strong>Who has access: Anyone (Siapa saja)</strong> lalu klik Deploy dan salin URL-nya!
                </p>
              </div>
            </div>

            {/* Code Box */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-gray-500" />
                  <span>Kode Google Apps Script (Mendukung 19 Sheet Basis Data):</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Seluruh Kode'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-64 select-all leading-relaxed">
                {appsScriptCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: STRUKTUR 19 SHEET & CADANGAN BERKAS */}
      {subTab === 'sheets_info' && (
        <div className="space-y-6">
          {/* Quick Backup/Restore Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span>Cadangan Berkas Mandiri (Offline / Backup JSON)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="font-bold text-xs text-gray-900">Unduh Cadangan Database Lengkap (.json)</div>
                <p className="text-[11px] text-gray-600">
                  Menyimpan seluruh data 19 sheet ke dalam 1 file JSON di komputer Anda untuk keamanan atau arsip sekolah.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Cadangan (.json)</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="font-bold text-xs text-gray-900">Format Template Impor Siswa Massal (.csv)</div>
                <p className="text-[11px] text-gray-600">
                  Unduh template format CSV untuk memasukkan puluhan murid sekaligus ke aplikasi melalui menu Data Murid.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadCsvTemplate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Format CSV Murid</span>
                </button>
              </div>
            </div>
          </div>

          {/* Daftar 19 Sheet */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Daftar 19 Sheet Basis Data LMS PJOK</span>
            </h2>

            <p className="text-xs text-gray-500">
              Setiap tab di bawah ini merepresentasikan tabel data di Google Spreadsheet yang disinkronkan secara otomatis:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {SHEET_NAMES.map((name, index) => {
                const count = ((storage.getDatabase() as any)[name] || []).length;
                return (
                  <div
                    key={`sheet-item-${name}-${index}`}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-gray-800 truncate">{name}</div>
                      <div className="text-[10px] text-gray-500">{count} baris data</div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Domain Authorization Help Modal */}
      {showDomainHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200 shrink-0 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Domain Belum Masuk Whitelist Firebase</h3>
                  <p className="text-[11px] text-gray-500">Firebase: Error (auth/unauthorized-domain)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDomainHelpModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Karena aplikasi ini di-host pada server Cloud Run kontainer dinamis (<strong>{typeof window !== 'undefined' ? window.location.hostname : 'run.app'}</strong>), Firebase Auth menolak pop-up karena domain belum didaftarkan di Firebase Console.
            </p>

            <div className="space-y-3">
              {/* Opsi 1: Google Apps Script */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Solusi 1: Pakai Google Apps Script Web App (Direkomendasikan)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full">
                    100% Bebas Kendala Domain
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Metode Apps Script tidak memerlukan Authorized Domain Firebase sama sekali dan dapat langsung dipakai sinkronisasi oleh seluruh HP/Laptop guru dan murid di sekolah!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowDomainHelpModal(false);
                    setSubTab('gas');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Buka Tab Google Apps Script</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Opsi 2: Hubungkan Langsung Email Belajar.id */}
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Link className="w-4 h-4 text-blue-600" />
                  <span>Solusi 2: Hubungkan Sesi Manual dengan Akun Belajar.id / Google</span>
                </span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Masukkan email akun Google atau Belajar.id Anda untuk mengaktifkan sesi integrasi:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="email.anda@guru.sma.belajar.id"
                    className="flex-1 px-3 py-1.5 text-xs border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleManualConnect}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Hubungkan
                  </button>
                </div>
              </div>

              {/* Opsi 3: Salin domain untuk didaftarkan ke Firebase Console */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1.5">
                <span className="font-bold text-gray-800 text-[11px] block">
                  Solusi 3: Daftarkan Domain ke Firebase Console (Bagi Admin Pengelola)
                </span>
                <p className="text-[11px] text-gray-500">
                  Buka Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains &gt; Tambahkan domain berikut:
                </p>
                <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-gray-300 font-mono text-[11px]">
                  <span className="flex-1 truncate">{typeof window !== 'undefined' ? window.location.hostname : 'run.app'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.hostname);
                      onShowToast('Domain berhasil disalin ke clipboard!', 'success');
                    }}
                    className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-sans font-semibold cursor-pointer"
                  >
                    Salin Domain
                  </button>
                </div>
                <div className="pt-1">
                  <a
                    href="https://console.firebase.google.com/project/alpine-freedom-485514-j6/authentication/settings"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                  >
                    <span>Buka Firebase Console Settings (alpine-freedom-485514-j6)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDomainHelpModal(false)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Tutup Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
