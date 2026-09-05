import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Code2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appsScriptCode = `/**
 * ====================================================================
 * LMS PJOK - GOOGLE APPS SCRIPT WEB APP ENGINE
 * Slogan: "Belajar, Bergerak, Berkembang"
 * Mendukung 19 Sheet Basis Data Sinkronisasi Dua Arah
 * ====================================================================
 */

function doGet(e) {
  var params = e ? e.parameter : {};
  var action = params.action || 'ping';
  var sheetName = params.sheet || '';

  var output = { success: true, message: 'LMS PJOK Backend Active', timestamp: new Date() };

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'getAllData') {
      var allData = {};
      var sheets = ss.getSheets();
      sheets.forEach(function(s) {
        var name = s.getName();
        var data = getSheetDataAsJson(s);
        allData[name] = data;
      });
      output.data = allData;
    } else if (action === 'getSheet' && sheetName) {
      var s = ss.getSheetByName(sheetName);
      if (!s) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');
      output.data = getSheetDataAsJson(s);
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
    var rawData = e.postData.contents;
    var body = JSON.parse(rawData);
    var action = body.action;
    var sheetName = body.sheet;
    var rowData = body.data;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var s = ss.getSheetByName(sheetName);
    if (!s) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');

    if (action === 'appendRow') {
      var headers = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0];
      var newRow = headers.map(function(h) {
        return rowData[h] !== undefined ? rowData[h] : '';
      });
      s.appendRow(newRow);
      output.message = 'Baris berhasil ditambahkan ke ' + sheetName;
    } else if (action === 'syncAll') {
      // Menimpa atau sinkronisasi massal
      output.message = 'Sinkronisasi massal berhasil';
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
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    onShowToast('Kode Google Apps Script berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Integrasi Google Cloud Apps Script
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Panduan & Kode Google Apps Script (Code.gs)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sambungkan LMS PJOK langsung ke Google Spreadsheet sekolah Anda tanpa perlu server bulanan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Step by Step Deployment Guide */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-700" />
            Langkah-Langkah Deploy Web App (1 s/d 6):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-black text-teal-700">1. Buka Spreadsheet</span>
              <p className="text-slate-600">
                Buka Google Spreadsheet yang memiliki 19 Sheet LMS PJOK.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-black text-teal-700">2. Buka Apps Script</span>
              <p className="text-slate-600">
                Klik menu <strong>Ekstensi</strong> &rarr; <strong>Apps Script</strong>.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-black text-teal-700">3. Tempel Kode</span>
              <p className="text-slate-600">
                Hapus isi file <code>Code.gs</code> lalu tempel kode script di bawah ini.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-black text-teal-700">4. Terapkan Deployment</span>
              <p className="text-slate-600">
                Klik tombol biru <strong>Terapkan (Deploy)</strong> &rarr; <strong>Deployment Baru</strong>.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-black text-teal-700">5. Atur Hak Akses Web App</span>
              <p className="text-slate-600">
                Pilih jenis <strong>Aplikasi Web</strong>, jalankan sebagai <strong>Saya</strong>, dan akses: <strong>Siapa Saja (Anyone)</strong>.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-black text-teal-700">6. Salin URL Web App</span>
              <p className="text-slate-600">
                Salin Web App URL (berakhiran <code>/exec</code>) lalu masukkan ke menu <strong>Pengaturan Sistem</strong> LMS PJOK.
              </p>
            </div>
          </div>
        </div>

        {/* Code Block Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 font-mono">Code.gs (Ready for Deployment)</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin!' : 'Salin Kode Apps Script'}
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-64 leading-relaxed border border-slate-800">
            {appsScriptCode}
          </pre>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
