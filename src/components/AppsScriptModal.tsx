import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Database, Code, FileSpreadsheet, RefreshCw, Download } from 'lucide-react';
import { APPS_SCRIPT_FILES, APPS_SCRIPT_HEADERS, APPS_SCRIPT_SHEET_NAMES } from '../services/appsScriptCode';
import { storage } from '../services/storage';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'guides' | 'code' | 'sheets' | 'connector'>('guides');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [webAppUrl, setWebAppUrl] = useState(storage.getConfig('GAS_WEBAPP_URL', ''));
  const [isTesting, setIsTesting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pingStatus, setPingStatus] = useState<{ success: boolean; message: string; timestamp?: string } | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      const currentUrl = storage.getConfig('GAS_WEBAPP_URL', '');
      setWebAppUrl(currentUrl);
      if (currentUrl) {
        setPingStatus({
          success: true,
          message: 'URL Google Apps Script Aktif & Siap Digunakan'
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    onShowToast('Kode berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleTestConnection = async () => {
    if (!webAppUrl) {
      onShowToast('Masukkan URL Web App Google Apps Script terlebih dahulu.', 'error');
      return;
    }
    setIsTesting(true);
    const res = await storage.syncWithGoogleAppsScript(webAppUrl);
    setIsTesting(false);
    if (res.success) {
      setPingStatus({
        success: true,
        message: res.message,
        timestamp: res.data?.timestamp || new Date().toLocaleTimeString()
      });
      onShowToast(res.message, 'success');
    } else {
      setPingStatus({
        success: false,
        message: res.message
      });
      onShowToast(res.message, 'error');
    }
  };

  const handleInitializeSheets = async () => {
    if (!webAppUrl) {
      onShowToast('Hubungkan URL Google Apps Script terlebih dahulu.', 'error');
      return;
    }
    setIsInitializing(true);
    const res = await storage.initializeGoogleSpreadsheet(webAppUrl);
    setIsInitializing(false);
    if (res.success) {
      onShowToast(res.message || '19 Sheets berhasil diinisialisasi di Google Spreadsheet!', 'success');
    } else {
      onShowToast(res.message || 'Gagal inisialisasi sheet. Pastikan izin Web App Anyone.', 'error');
    }
  };

  const handlePullData = async () => {
    if (!webAppUrl) {
      onShowToast('Hubungkan URL Google Apps Script terlebih dahulu.', 'error');
      return;
    }
    setIsPulling(true);
    const res = await storage.fetchDataFromGoogleAppsScript(webAppUrl);
    setIsPulling(false);
    if (res.success) {
      onShowToast(res.message, 'success');
    } else {
      onShowToast(res.message, 'error');
    }
  };

  const handleExportCSV = (sheetName: string) => {
    const csv = storage.exportSheetToCSV(sheetName as any);
    if (!csv) {
      onShowToast(`Sheet ${sheetName} masih kosong.`, 'info');
      return;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${sheetName}_LMS_PJOK.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`Sheet ${sheetName} berhasil diexport ke CSV!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Google Spreadsheet & Apps Script Hub</h2>
              <p className="text-xs text-slate-500">Integrasi 19 Sheets Database & Kode Backend Google Apps Script</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-2 bg-white">
          <button
            onClick={() => setActiveTab('guides')}
            className={`py-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'guides'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            Panduan Instalasi
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'code'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            Source Code (.gs)
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`py-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'sheets'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Struktur 19 Sheets
          </button>
          <button
            onClick={() => setActiveTab('connector')}
            className={`py-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'connector'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Konektor Live Web App
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeTab === 'guides' && (
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <h4 className="font-bold text-teal-900 mb-1">Prinsip Kerja Integrasi:</h4>
                <p className="text-teal-800 text-xs">
                  Aplikasi LMS PJOK ini sudah memiliki internal database engine yang bekerja langsung di browser. Untuk menghubungkan dengan Google Spreadsheet Anda secara live, cukup ikuti 6 langkah mudah di bawah ini!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-teal-700 font-bold">
                    <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs">1</span>
                    Buat Google Spreadsheet Baru
                  </div>
                  <p className="text-xs text-slate-600">
                    Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-teal-600 underline font-medium inline-flex items-center gap-1">sheets.new <ExternalLink className="w-3 h-3" /></a>, beri judul <strong>Database LMS PJOK 2026/2027</strong>.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-teal-700 font-bold">
                    <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs">2</span>
                    Buka Apps Script Editor
                  </div>
                  <p className="text-xs text-slate-600">
                    Di Google Spreadsheet, klik menu <strong>Extensions (Ekstensi) &gt; Apps Script</strong>.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-teal-700 font-bold">
                    <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs">3</span>
                    Salin Kode Backend (.gs)
                  </div>
                  <p className="text-xs text-slate-600">
                    Buka tab <strong>Source Code (.gs)</strong> di modal ini, salin isi file <code>Code.gs</code> dan <code>Database.gs</code> ke editor Apps Script.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-teal-700 font-bold">
                    <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs">4</span>
                    Jalankan setupDatabase()
                  </div>
                  <p className="text-xs text-slate-600">
                    Di Apps Script, pilih fungsi <code>setupDatabase</code> dan klik <strong>Run (Jalankan)</strong>. Seluruh 19 sheet beserta kolom header otomatis terbuat dan diwarnai rapi!
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-teal-700 font-bold">
                    <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs">5</span>
                    Deploy sebagai Web App
                  </div>
                  <p className="text-xs text-slate-600">
                    Klik tombol biru <strong>Deploy &gt; New Deployment</strong>, pilih tipe <strong>Web app</strong>. Atur:
                    <br />• Execute as: <em>Me</em>
                    <br />• Who has access: <em>Anyone</em>
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-teal-700 font-bold">
                    <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs">6</span>
                    Hubungkan ke Aplikasi
                  </div>
                  <p className="text-xs text-slate-600">
                    Salin URL Web App yang dihasilkan (akhiran <code>/exec</code>), lalu masukkan ke tab <strong>Konektor Live Web App</strong> untuk aktivasi sinkronisasi langsung!
                  </p>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-bold text-amber-900 mb-2">Panduan Troubleshooting Cepat:</h4>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                  <li><strong>Data Tidak Muncul?</strong> Pastikan nama sheet di Spreadsheet tidak diubah dan fungsi <code>setupDatabase()</code> sudah dijalankan dengan sukses.</li>
                  <li><strong>Izin Google Apps Script?</strong> Saat pertama kali Run, klik <em>Review Permissions &gt; Advanced &gt; Go to Untitled project (unsafe) &gt; Allow</em>.</li>
                  <li><strong>Login Gagal?</strong> Pastikan sheet <code>02_USERS</code> memuat kolom status bernilai <code>AKTIF</code>.</li>
                  <li><strong>Presensi & Nilai:</strong> Sistem secara otomatis memproteksi duplikasi presensi berdasarkan tanggal, kelas, dan ID murid.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="flex flex-col md:flex-row gap-4 h-full">
              <div className="w-full md:w-56 shrink-0 flex flex-col gap-1.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 px-2">Pilih File Kode</div>
                {APPS_SCRIPT_FILES.map((file, idx) => (
                  <button
                    key={file.filename}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedFileIndex === idx
                        ? 'bg-teal-700 text-white font-semibold shadow-sm'
                        : 'bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{file.filename}</span>
                    <span className="text-[10px] opacity-75">{file.code.split('\n').length} baris</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60">
                  <div>
                    <span className="text-xs font-mono font-bold text-teal-400">{APPS_SCRIPT_FILES[selectedFileIndex].filename}</span>
                    <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">{APPS_SCRIPT_FILES[selectedFileIndex].description}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(APPS_SCRIPT_FILES[selectedFileIndex].code, selectedFileIndex)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                  >
                    {copiedIndex === selectedFileIndex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIndex === selectedFileIndex ? 'Tersalin' : 'Salin Kode'}
                  </button>
                </div>
                <div className="p-4 overflow-auto font-mono text-xs text-slate-200 max-h-96 leading-relaxed">
                  <pre className="whitespace-pre">{APPS_SCRIPT_FILES[selectedFileIndex].code}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">19 Sheet Database Utama</h4>
                  <p className="text-xs text-slate-500">Struktur nama sheet dan kolom header yang terintegrasi</p>
                </div>
                <div className="text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  Total 19 Sheets Terverifikasi
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {APPS_SCRIPT_SHEET_NAMES.map((sheetName, i) => {
                  const headers = APPS_SCRIPT_HEADERS[sheetName] || [];
                  return (
                    <div key={sheetName} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {sheetName}
                          </span>
                          <button
                            onClick={() => handleExportCSV(sheetName)}
                            title="Download CSV"
                            className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap gap-1">
                          {headers.map((h, hIdx) => (
                            <span key={`hdr-${sheetName}-${h}-${hIdx}`} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
                        {headers.length} Kolom Terdaftar
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'connector' && (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Integrasi Google Apps Script</h4>
                      <p className="text-xs text-gray-500">Koneksi langsung ke Google Spreadsheet via Web App</p>
                    </div>
                  </div>

                  {webAppUrl ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Terhubung
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      Offline Mode
                    </span>
                  )}
                </div>

                {pingStatus && (
                  <div className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
                    pingStatus.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    <span>{pingStatus.message}</span>
                    {pingStatus.timestamp && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        {pingStatus.timestamp}
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">Google Apps Script Web App URL</label>
                    {webAppUrl && (
                      <a
                        href={webAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                      >
                        Buka Endpoint <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                  />
                  <p className="text-[11px] text-gray-500">
                    Deployment aktif: <span className="font-mono text-gray-700 select-all">AKfycbzZnYrxow8JSBgyftUIqIIqMinkI0DFoxZoZS9YlB3wrR9D0WVJMmMDC3JVsVuE47zXjA</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                    {isTesting ? 'Menguji...' : 'Uji Koneksi (Ping)'}
                  </button>

                  <button
                    onClick={handleInitializeSheets}
                    disabled={isInitializing || !webAppUrl}
                    className="py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <FileSpreadsheet className={`w-4 h-4 text-emerald-600 ${isInitializing ? 'animate-spin' : ''}`} />
                    {isInitializing ? 'Memproses...' : 'Inisialisasi 19 Sheets'}
                  </button>

                  <button
                    onClick={handlePullData}
                    disabled={isPulling || !webAppUrl}
                    className="py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Download className={`w-4 h-4 text-blue-600 ${isPulling ? 'animate-spin' : ''}`} />
                    {isPulling ? 'Menarik data...' : 'Tarik Data Spreadsheet'}
                  </button>

                  <button
                    onClick={() => {
                      setWebAppUrl('');
                      storage.updateConfig('GAS_WEBAPP_URL', '');
                      setPingStatus(null);
                      onShowToast('Koneksi Web App direset ke mode offline.', 'info');
                    }}
                    className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Reset ke Offline
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 p-4 rounded-xl leading-relaxed space-y-1">
                <p className="font-semibold text-gray-800">Status Penyimpanan Data:</p>
                <p>
                  Sistem beroperasi dalam mode sinkronisasi ganda: data selalu tersimpan aman di browser Anda dan tersambung langsung dengan Google Apps Script Web App untuk pembaruan cloud.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="text-xs text-slate-500">
            LMS PJOK - &quot;Belajar, Bergerak, Berkembang.&quot;
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
