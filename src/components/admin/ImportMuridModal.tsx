import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  Users
} from 'lucide-react';
import { storage } from '../../services/storage';
import { KelasItem } from '../../types';

interface ImportMuridModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  kelasList: KelasItem[];
}

interface ParsedMuridRow {
  NIS: string;
  NISN: string;
  NAMA_MURID: string;
  JENIS_KELAMIN: 'L' | 'P';
  KELAS_ID: string;
  USERNAME: string;
  PASSWORD: string;
  isValid: boolean;
  error?: string;
}

export const ImportMuridModal: React.FC<ImportMuridModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
  kelasList
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'paste'>('upload');
  const [defaultKelasId, setDefaultKelasId] = useState(kelasList[0]?.KELAS_ID || 'XI-01');
  const [autoCreateLogin, setAutoCreateLogin] = useState(true);
  const [duplicateAction, setDuplicateAction] = useState<'update' | 'skip'>('update');
  const [pasteContent, setPasteContent] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedMuridRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate and download template CSV
  const handleDownloadTemplate = () => {
    const headers = 'NIS,NISN,NAMA_MURID,JENIS_KELAMIN,KELAS_ID,USERNAME,PASSWORD';
    const sampleRows = [
      '10101,0071234561,Ahmad Fauzi,L,XI-01,ahmad.fauzi,murid123',
      '10102,0071234562,Siti Rahmawati,P,XI-01,siti.rahmawati,murid123',
      '10103,0071234563,Budi Santoso,L,XI-02,budi.santoso,murid123',
      '10104,0071234564,Dewi Lestari,P,XI-02,dewi.lestari,murid123',
      '10105,0071234565,Rian Hidayat,L,XI-03,rian.hidayat,murid123'
    ];
    const csvContent = '\uFEFF' + [headers, ...sampleRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Template_Import_Murid_LMS_PJOK.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Template CSV berhasil diunduh. Silakan buka dan isi di Excel/Spreadsheet.', 'success');
  };

  // Parse CSV string
  const parseCSVContent = (content: string) => {
    if (!content.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = content
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Detect delimiter: check first line
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes(';') && (firstLine.split(';').length > firstLine.split(',').length)) {
      delimiter = ';';
    } else if (firstLine.includes('\t') && (firstLine.split('\t').length > firstLine.split(',').length)) {
      delimiter = '\t';
    }

    const splitLine = (line: string) => {
      const result: string[] = [];
      let current = '';
      let insideQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === delimiter && !insideQuotes) {
          result.push(current.trim().replace(/^"|"$/g, '').trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, '').trim());
      return result;
    };

    const headerParts = splitLine(lines[0]).map(h => h.toLowerCase());
    const hasHeader =
      headerParts.some(h => h.includes('nama')) ||
      headerParts.some(h => h.includes('nis')) ||
      headerParts.some(h => h.includes('siswa'));

    const startIndex = hasHeader ? 1 : 0;
    const nameColIdx = hasHeader ? headerParts.findIndex(h => h.includes('nama') || h.includes('siswa')) : 2;
    const nisColIdx = hasHeader ? headerParts.findIndex(h => h === 'nis' || h.includes('nis')) : 0;
    const nisnColIdx = hasHeader ? headerParts.findIndex(h => h.includes('nisn')) : 1;
    const jkColIdx = hasHeader ? headerParts.findIndex(h => h === 'jk' || h.includes('kelamin') || h.includes('gender')) : 3;
    const kelasColIdx = hasHeader ? headerParts.findIndex(h => h.includes('kelas') || h.includes('rombel')) : 4;
    const userColIdx = hasHeader ? headerParts.findIndex(h => h.includes('user') || h.includes('akun')) : 5;
    const passColIdx = hasHeader ? headerParts.findIndex(h => h.includes('pass') || h.includes('sandi')) : 6;

    const parsed: ParsedMuridRow[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const cols = splitLine(lines[i]);
      if (cols.length === 0 || cols.every(c => !c)) continue;

      const nama = (nameColIdx !== -1 && cols[nameColIdx] !== undefined ? cols[nameColIdx] : cols[0] || '').trim();
      const nis = (nisColIdx !== -1 && cols[nisColIdx] !== undefined ? cols[nisColIdx] : '').trim();
      const nisn = (nisnColIdx !== -1 && cols[nisnColIdx] !== undefined ? cols[nisnColIdx] : '').trim();
      const rawJk = (jkColIdx !== -1 && cols[jkColIdx] !== undefined ? cols[jkColIdx] : 'L').trim().toUpperCase();
      const rawKelas = (kelasColIdx !== -1 && cols[kelasColIdx] !== undefined ? cols[kelasColIdx] : defaultKelasId).trim();
      const rawUser = (userColIdx !== -1 && cols[userColIdx] !== undefined ? cols[userColIdx] : '').trim();
      const rawPass = (passColIdx !== -1 && cols[passColIdx] !== undefined ? cols[passColIdx] : 'murid123').trim();

      const isValid = nama.length > 0;
      parsed.push({
        NAMA_MURID: nama,
        NIS: nis,
        NISN: nisn,
        JENIS_KELAMIN: rawJk.startsWith('P') ? 'P' : 'L',
        KELAS_ID: rawKelas || defaultKelasId,
        USERNAME: rawUser,
        PASSWORD: rawPass || 'murid123',
        isValid,
        error: !isValid ? 'Nama murid tidak boleh kosong' : undefined
      });
    }

    setParsedRows(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || '';
      parseCSVContent(text);
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (val: string) => {
    setPasteContent(val);
    parseCSVContent(val);
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      onShowToast('Tidak ada data murid yang valid untuk diimpor.', 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const result = storage.importMuridBatch(
        validRows.map(r => ({
          NAMA_MURID: r.NAMA_MURID,
          NIS: r.NIS,
          NISN: r.NISN,
          JENIS_KELAMIN: r.JENIS_KELAMIN,
          KELAS_ID: r.KELAS_ID || defaultKelasId,
          USERNAME: r.USERNAME,
          PASSWORD: r.PASSWORD
        })),
        {
          defaultKelasId,
          autoCreateLogin,
          onDuplicateNis: duplicateAction
        }
      );

      setIsProcessing(false);
      onShowToast(
        `Sukses! ${result.imported} murid ditambahkan, ${result.updated} diperbarui, ${result.userCount} akun login siap digunakan.`,
        'success'
      );
      onSuccess(result.imported + result.updated);
      onClose();
    }, 300);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/30 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                Import Data Peserta Didik (Murid)
              </h3>
              <p className="text-xs text-slate-400">
                Unggah atau tempel daftar nama murid dari file CSV / Excel sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Step 1: Download Template Banner */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-teal-700" />
                Format File CSV Baku
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Gunakan template resmi untuk hasil terbaik. Kolom mencakup: <strong>NIS, NISN, NAMA_MURID, JENIS_KELAMIN (L/P), KELAS_ID, USERNAME, PASSWORD</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 shrink-0 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" /> Unduh Template CSV
            </button>
          </div>

          {/* Step 2: Choose Mode (Upload / Paste) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveInputTab('upload')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeInputTab === 'upload'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Unggah File .CSV
              </button>
              <button
                type="button"
                onClick={() => setActiveInputTab('paste')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeInputTab === 'paste'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Tempel Teks CSV
              </button>
            </div>

            {activeInputTab === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-teal-50/20"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mx-auto mb-2.5 text-teal-700">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-800 text-xs">
                  {fileName ? `File Terpilih: ${fileName}` : 'Klik untuk memilih file CSV atau seret file ke sini'}
                </p>
                <p className="text-slate-400 text-[11px] mt-1">
                  Mendukung format .csv dengan pemisah koma (,) atau titik-koma (;)
                </p>
              </div>
            ) : (
              <div>
                <textarea
                  rows={5}
                  value={pasteContent}
                  onChange={(e) => handlePasteChange(e.target.value)}
                  placeholder={`Tempelkan baris CSV di sini, contoh:\nNIS,NISN,NAMA_MURID,JENIS_KELAMIN,KELAS_ID,USERNAME,PASSWORD\n10101,0071234561,Ahmad Fauzi,L,XI-01,ahmad.fauzi,murid123\n10102,0071234562,Siti Rahmawati,P,XI-01,siti.rahmawati,murid123`}
                  className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>
            )}
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kelas Default (Fallback)</label>
              <select
                value={defaultKelasId}
                onChange={(e) => setDefaultKelasId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-600 outline-none"
              >
                {kelasList.map(k => (
                  <option key={k.KELAS_ID} value={k.KELAS_ID}>
                    {k.NAMA_KELAS} ({k.KELAS_ID})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Digunakan bila kolom kelas pada baris murid kosong.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jika NIS Sudah Terdaftar</label>
              <select
                value={duplicateAction}
                onChange={(e) => setDuplicateAction(e.target.value as 'update' | 'skip')}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-600 outline-none"
              >
                <option value="update">Perbarui Data Murid (Update)</option>
                <option value="skip">Lewati Baris (Skip)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Mencegah duplikasi data siswa yang sama.
              </p>
            </div>

            <div className="flex flex-col justify-between">
              <label className="block font-bold text-slate-700 mb-1">Akun Login Siswa</label>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={autoCreateLogin}
                  onChange={(e) => setAutoCreateLogin(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-800 text-xs">
                  Buatkan akun login otomatis
                </span>
              </label>
              <p className="text-[10px] text-slate-400 mt-1">
                Username & password dibuat otomatis agar siswa bisa langsung login.
              </p>
            </div>
          </div>

          {/* Step 3: Data Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-700" />
                  Pratinjau Data Murid Terdeteksi:
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                  {validCount} murid siap diimpor
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0">
                    <tr>
                      <th className="px-3 py-2">No</th>
                      <th className="px-3 py-2">NIS</th>
                      <th className="px-3 py-2">Nama Murid</th>
                      <th className="px-3 py-2">JK</th>
                      <th className="px-3 py-2">Kelas</th>
                      <th className="px-3 py-2">Username Login</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                        <td className="px-3 py-1.5 text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-700">{row.NIS || '(Auto)'}</td>
                        <td className="px-3 py-1.5 font-bold text-slate-800">{row.NAMA_MURID}</td>
                        <td className="px-3 py-1.5 text-slate-600">{row.JENIS_KELAMIN}</td>
                        <td className="px-3 py-1.5 text-slate-600">{row.KELAS_ID}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-500">{row.USERNAME || '(Auto)'}</td>
                        <td className="px-3 py-1.5">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[10px]">
                              <AlertTriangle className="w-3 h-3" /> {row.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 50 && (
                <p className="text-[10px] text-slate-400 text-center italic">
                  Menampilkan 50 dari total {parsedRows.length} data murid.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={validCount === 0 || isProcessing}
            onClick={handleExecuteImport}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isProcessing ? 'Memproses Data...' : `Import & Simpan ${validCount} Murid`}
          </button>
        </div>
      </div>
    </div>
  );
};
