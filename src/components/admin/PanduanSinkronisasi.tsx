import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  ExternalLink,
  Globe,
  HelpCircle,
  FileSpreadsheet,
  Zap,
  RefreshCw,
  FileText
} from 'lucide-react';
import { storage } from '../../services/storage';

interface PanduanSinkronisasiProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  currentGasUrl?: string;
  onUrlUpdated?: (newUrl: string) => void;
}

export const PanduanSinkronisasi: React.FC<PanduanSinkronisasiProps> = ({
  onShowToast,
  currentGasUrl = '',
  onUrlUpdated
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSheets, setCopiedSheets] = useState(false);
  const [testUrl, setTestUrl] = useState(
    currentGasUrl || 'https://script.google.com/macros/s/AKfycbyeNRTs2sep0ac6gZbjJiJ7vD6XMkZOhMSS6Fz0UzmONGhFJGFw71JxYufNF29wtq6_jA/exec'
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    detail?: string;
  }>({ status: 'idle', message: '' });

  const sheetNames = [
    '01_CONFIG', '02_USERS', '03_ADMIN', '04_GURU', '05_MURID',
    '06_KELAS', '07_MAPEL', '08_ROMBEL', '09_TAHUN_AJARAN', '10_MATERI',
    '11_TUGAS', '12_PENGUMPULAN_TUGAS', '13_BANK_SOAL', '14_JAWABAN_QUIZ',
    '15_PRESENSI', '16_NILAI', '17_JURNAL', '18_EKSTRAKURIKULER', '19_LOG_AKTIVITAS'
  ];

  const appsScriptCode = `/**
 * LMS PJOK SMA - Google Apps Script Web App API
 * Mendukung 19 Sheet Database & Akses Multi-Browser
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
    onShowToast('Kode Apps Script berhasil disalin!', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleCopySheets = () => {
    navigator.clipboard.writeText(sheetNames.join('\n'));
    setCopiedSheets(true);
    onShowToast('Daftar 19 nama Sheet berhasil disalin!', 'success');
    setTimeout(() => setCopiedSheets(false), 3000);
  };

  // CSV Download for Student Import Template
  const handleDownloadCsvTemplate = () => {
    const headers = 'NIS,NISN,NAMA_MURID,KELAS_ID,JENIS_KELAMIN,EMAIL,STATUS\n';
    const sampleRows = [
      '20261001,0081234501,Aditya Pratama,KELAS_X_A,L,aditya@siswa.belajar.id,AKTIF',
      '20261002,0081234502,Bella Safitri,KELAS_X_A,P,bella@siswa.belajar.id,AKTIF',
      '20261003,0081234503,Candra Wijaya,KELAS_X_A,L,candra@siswa.belajar.id,AKTIF',
      '20261004,0081234504,Dewi Lestari,KELAS_X_B,P,dewi@siswa.belajar.id,AKTIF',
      '20261005,0081234505,Eko Saputra,KELAS_XI_A,L,eko@siswa.belajar.id,AKTIF',
      '20261006,0081234506,Fitriani Rahma,KELAS_XI_B,P,fitri@siswa.belajar.id,AKTIF',
      '20261007,0081234507,Gede Artawan,KELAS_XII_A,L,gede@siswa.belajar.id,AKTIF'
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

  // Test URL Connectivity
  const handleTestConnection = async () => {
    const url = testUrl.trim();
    if (!url) {
      onShowToast('Masukkan URL Google Apps Script terlebih dahulu.', 'error');
      return;
    }

    setTesting(true);
    setTestResult({ status: 'idle', message: '' });

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
        setTestResult({
          status: 'success',
          message: 'Koneksi Berhasil!',
          detail: `Web App aktif dan dapat diakses publik. Spreadsheet Name: ${json.spreadsheetName || 'Terkoneksi'}`
        });
        onShowToast('Koneksi Google Apps Script berhasil dan siap digunakan!', 'success');
        if (onUrlUpdated) {
          onUrlUpdated(url);
        }
      } else {
        throw new Error(json?.error || 'Respon dari Apps Script tidak valid.');
      }
    } catch (err: any) {
      console.error('Test connection failed:', err);
      let detailMessage = err.message;
      if (err.name === 'TypeError' || err.message.includes('Failed to fetch') || err.message.includes('CORS')) {
        detailMessage =
          'TERBLOKIR AKSES / CORS: Kemungkinan besar pengaturan deployment di Google Apps Script belum diset ke "Who has access: Anyone" (Siapa saja). Hal ini menyebabkan browser lain atau mode incognito meminta login akun pemilik dan terblokir browser!';
      }
      setTestResult({
        status: 'error',
        message: 'Koneksi Gagal / Belum Siap Diakses Publik',
        detail: detailMessage
      });
      onShowToast('Koneksi Apps Script gagal. Periksa izin akses deployment Anda.', 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">
              Panduan Visual Sinkronisasi Google Apps Script & Spreadsheet
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ikuti langkah visual berikut agar data spreadsheet dapat dibuka di semua browser tanpa kendala akun pemilik.
            </p>
          </div>
        </div>

        {/* Download CSV Action */}
        <button
          type="button"
          onClick={handleDownloadCsvTemplate}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Template CSV Murid</span>
        </button>
      </div>

      {/* Critical Highlight Alert: Kenapa Tidak Bisa Dibuka di Browser Lain */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-black text-amber-800 uppercase tracking-wide text-[11px]">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          Kunci Penting: Mengatasi &quot;Belum Bisa Dibuka di Browser Lain&quot;
        </div>
        <p className="leading-relaxed">
          Google Apps Script secara bawaan mengunci akses hanya untuk akun pembuat (<code>Only myself</code>).
          Ketika dibuka di browser lain atau perangkat lain, Google otomatis memblokir permintaan dengan CORS error.
        </p>
        <div className="p-3 bg-white/90 rounded-xl border border-amber-300 font-semibold text-slate-800 space-y-1">
          <div>Solusi Mutlak saat Deploy Apps Script:</div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-700">
            <li>
              <strong>Execute as (Jalankan sebagai):</strong> Pilih <code>Me (Akun Saya / Pemilik)</code>
            </li>
            <li>
              <strong>Who has access (Siapa yang memiliki akses):</strong> WAJIB pilih <code>Anyone (Siapa saja)</code>
            </li>
          </ul>
        </div>
      </div>

      {/* Visual Step-by-Step Cards */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          Tahapan Demi Tahapan Menghubungkan Google Apps Script
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <button
                onClick={handleCopySheets}
                className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedSheets ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin 19 Nama Sheet</span>
              </button>
            </div>
            <h5 className="font-bold text-slate-800 text-sm">Siapkan Spreadsheet Anda</h5>
            <p className="text-slate-600 leading-relaxed">
              Buka Google Spreadsheet sekolah Anda. Pastikan memiliki tab/sheet dengan nama baku LMS PJOK (seperti <code>01_CONFIG</code>, <code>02_USERS</code>, <code>05_MURID</code>, dll.).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-[11px] font-bold text-slate-400">Menu Ekstensi</span>
            </div>
            <h5 className="font-bold text-slate-800 text-sm">Buka Apps Script</h5>
            <p className="text-slate-600 leading-relaxed">
              Di Google Spreadsheet Anda, klik menu bar atas: <strong>Ekstensi (Extensions)</strong> &rarr; <strong>Apps Script</strong>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <button
                onClick={handleCopyCode}
                className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin Kode Code.gs</span>
              </button>
            </div>
            <h5 className="font-bold text-slate-800 text-sm">Tempel Kode Code.gs</h5>
            <p className="text-slate-600 leading-relaxed">
              Hapus seluruh isi di tab editor <code>Code.gs</code>, lalu tempel kode lengkap yang sudah disediakan pada tombol salin di atas.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-black text-xs flex items-center justify-center">
                4
              </span>
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wide">Paling Penting!</span>
            </div>
            <h5 className="font-bold text-slate-900 text-sm">Deploy Web App (Akses Publik)</h5>
            <p className="text-slate-700 leading-relaxed">
              Klik <strong>Deploy &rarr; New deployment</strong>. Pilih tipe <strong>Web app</strong>.<br />
              - <em>Execute as:</em> <strong>Me (Saya)</strong><br />
              - <em>Who has access:</em> <strong>Anyone (Siapa saja)</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Test Connection Form */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-600" />
          Uji Konektivitas Google Apps Script URL
        </h4>
        <p className="text-xs text-slate-500">
          Uji apakah URL Web App Anda sudah dapat diakses dari browser lain tanpa login akun Google:
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-teal-600"
          />
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menguji Akses...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Uji Koneksi Sekarang</span>
              </>
            )}
          </button>
        </div>

        {/* Test Result Feedback */}
        {testResult.status === 'success' && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {testResult.message}
            </div>
            {testResult.detail && <p className="text-[11px] text-emerald-700">{testResult.detail}</p>}
          </div>
        )}

        {testResult.status === 'error' && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              {testResult.message}
            </div>
            {testResult.detail && <p className="text-[11px] text-rose-700 leading-relaxed">{testResult.detail}</p>}
          </div>
        )}
      </div>

      {/* CSV Murid Information Table */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Struktur Header CSV Impor Murid
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">Format UTF-8 .csv</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Kolom</th>
                <th className="p-2.5">Nama Field</th>
                <th className="p-2.5">Keterangan / Contoh</th>
                <th className="p-2.5">Sifat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px] bg-white text-slate-600">
              <tr>
                <td className="p-2.5 font-mono font-bold text-teal-700">A</td>
                <td className="p-2.5 font-bold">NIS</td>
                <td className="p-2.5">Nomor Induk Siswa (Contoh: <code>20261001</code>)</td>
                <td className="p-2.5 text-rose-600 font-bold">Wajib</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-teal-700">B</td>
                <td className="p-2.5 font-bold">NISN</td>
                <td className="p-2.5">Nomor Induk Siswa Nasional (10 digit, contoh: <code>0081234501</code>)</td>
                <td className="p-2.5 text-slate-400">Opsional</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-teal-700">C</td>
                <td className="p-2.5 font-bold">NAMA_MURID</td>
                <td className="p-2.5">Nama Lengkap Siswa (Contoh: <code>Aditya Pratama</code>)</td>
                <td className="p-2.5 text-rose-600 font-bold">Wajib</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-teal-700">D</td>
                <td className="p-2.5 font-bold">KELAS_ID</td>
                <td className="p-2.5">ID Rombel Kelas (Contoh: <code>KELAS_X_A</code>, <code>KELAS_XI_B</code>)</td>
                <td className="p-2.5 text-rose-600 font-bold">Wajib</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-teal-700">E</td>
                <td className="p-2.5 font-bold">JENIS_KELAMIN</td>
                <td className="p-2.5">L (Laki-laki) atau P (Perempuan)</td>
                <td className="p-2.5 text-slate-400">Opsional</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-teal-700">F</td>
                <td className="p-2.5 font-bold">EMAIL</td>
                <td className="p-2.5">Email akun belajar murid (Contoh: <code>aditya@siswa.belajar.id</code>)</td>
                <td className="p-2.5 text-slate-400">Opsional</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-teal-700">G</td>
                <td className="p-2.5 font-bold">STATUS</td>
                <td className="p-2.5">Status siswa (default: <code>AKTIF</code>)</td>
                <td className="p-2.5 text-slate-400">Opsional</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
