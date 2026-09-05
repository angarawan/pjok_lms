import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ClipboardList
} from 'lucide-react';
import { storage } from '../../services/storage';
import { SessionUser } from '../../types';

interface ImportTugasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  currentUser: SessionUser;
  defaultKelasId?: string;
}

interface ParsedTugasRow {
  JUDUL_TUGAS: string;
  JENIS_TUGAS: 'PRAKTIK' | 'TEORI' | 'PORTOFOLIO' | 'PROYEK';
  KELAS_ID: string;
  TOPIK: string;
  DESKRIPSI: string;
  BATAS_WAKTU: string;
  BOBOT_NILAI: number;
  STATUS: 'AKTIF' | 'DRAFT' | 'SELESAI';
  isValid: boolean;
  error?: string;
}

export const ImportTugasModal: React.FC<ImportTugasModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
  currentUser,
  defaultKelasId = 'K01'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pasteContent, setPasteContent] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedTugasRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate & download template CSV for Tugas
  const handleDownloadTemplate = () => {
    const headers = 'JUDUL_TUGAS,JENIS_TUGAS,KELAS_ID,TOPIK,DESKRIPSI,BATAS_WAKTU,BOBOT_NILAI,STATUS';
    const sampleRows = [
      '"Praktik Rekaman Video Servis Bawah Bola Voli","PRAKTIK","K01","Bola Voli","Rekam video demonstrasi passing bawah dan servis bawah durasi 1-2 menit.","2026-10-15 23:59",100,"AKTIF"',
      '"Analisis Pola Penyerangan Permainan Bola Basket","TEORI","K01","Bola Basket","Buat rangkuman dan diagram pola penyerangan fast break dan set offense.","2026-10-20 23:59",100,"AKTIF"',
      '"Jurnal Harian Program Latihan Kebugaran Fisik","PORTOFOLIO","K02","Kebugaran Jasmani","Catat denyut nadi istirahat dan program latihan lari 12 menit selama 1 minggu.","2026-10-25 23:59",100,"AKTIF"'
    ];
    const csvContent = '\uFEFF' + [headers, ...sampleRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Template_Import_Tugas_PJOK.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Template CSV Tugas berhasil diunduh. Silakan isi dan upload kembali.', 'success');
  };

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

    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) {
      delimiter = ';';
    } else if (firstLine.includes('\t') && firstLine.split('\t').length > firstLine.split(',').length) {
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
      headerParts.some(h => h.includes('tugas')) ||
      headerParts.some(h => h.includes('judul')) ||
      headerParts.some(h => h.includes('jenis'));

    const startIndex = hasHeader ? 1 : 0;
    const judulColIdx = hasHeader ? headerParts.findIndex(h => h.includes('judul') || h.includes('tugas')) : 0;
    const jenisColIdx = hasHeader ? headerParts.findIndex(h => h.includes('jenis') || h.includes('tipe')) : 1;
    const kelasColIdx = hasHeader ? headerParts.findIndex(h => h.includes('kelas')) : 2;
    const topikColIdx = hasHeader ? headerParts.findIndex(h => h.includes('topik')) : 3;
    const deskripsiColIdx = hasHeader ? headerParts.findIndex(h => h.includes('deskripsi') || h.includes('petunjuk')) : 4;
    const batasColIdx = hasHeader ? headerParts.findIndex(h => h.includes('batas') || h.includes('deadline')) : 5;
    const bobotColIdx = hasHeader ? headerParts.findIndex(h => h.includes('bobot') || h.includes('nilai')) : 6;
    const statusColIdx = hasHeader ? headerParts.findIndex(h => h.includes('status')) : 7;

    const parsed: ParsedTugasRow[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const cols = splitLine(lines[i]);
      if (cols.length === 0 || cols.every(c => !c)) continue;

      const judul = (judulColIdx !== -1 && cols[judulColIdx] ? cols[judulColIdx] : cols[0] || '').trim();
      const rawJenis = (jenisColIdx !== -1 && cols[jenisColIdx] ? cols[jenisColIdx] : 'PRAKTIK').trim().toUpperCase();
      const kelas = (kelasColIdx !== -1 && cols[kelasColIdx] ? cols[kelasColIdx] : defaultKelasId).trim();
      const topik = (topikColIdx !== -1 && cols[topikColIdx] ? cols[topikColIdx] : 'PJOK').trim();
      const deskripsi = (deskripsiColIdx !== -1 && cols[deskripsiColIdx] ? cols[deskripsiColIdx] : '').trim();
      const batas = (batasColIdx !== -1 && cols[batasColIdx] ? cols[batasColIdx] : '').trim();
      const bobot = Number((bobotColIdx !== -1 && cols[bobotColIdx] ? cols[bobotColIdx] : '100')) || 100;
      const rawStatus = (statusColIdx !== -1 && cols[statusColIdx] ? cols[statusColIdx] : 'AKTIF').trim().toUpperCase();

      const validJenis: 'PRAKTIK' | 'TEORI' | 'PORTOFOLIO' | 'PROYEK' =
        rawJenis === 'TEORI' || rawJenis === 'PORTOFOLIO' || rawJenis === 'PROYEK' ? rawJenis : 'PRAKTIK';

      const validStatus: 'AKTIF' | 'DRAFT' | 'SELESAI' =
        rawStatus === 'DRAFT' || rawStatus === 'SELESAI' ? rawStatus : 'AKTIF';

      const isValid = judul.length > 0;
      parsed.push({
        JUDUL_TUGAS: judul,
        JENIS_TUGAS: validJenis,
        KELAS_ID: kelas || defaultKelasId,
        TOPIK: topik || 'Keterampilan Gerak',
        DESKRIPSI: deskripsi || 'Kerjakan tugas sesuai petunjuk guru.',
        BATAS_WAKTU: batas || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
        BOBOT_NILAI: bobot,
        STATUS: validStatus,
        isValid,
        error: !isValid ? 'Judul tugas wajib diisi' : undefined
      });
    }

    setParsedRows(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (evt) => {
        try {
          const json = JSON.parse(evt.target?.result as string);
          const rawList = Array.isArray(json) ? json : json['10_TUGAS'] || [];
          const parsed = rawList.map((item: any) => ({
            JUDUL_TUGAS: item.JUDUL_TUGAS || '',
            JENIS_TUGAS: item.JENIS_TUGAS || 'PRAKTIK',
            KELAS_ID: item.KELAS_ID || defaultKelasId,
            TOPIK: item.TOPIK || 'PJOK',
            DESKRIPSI: item.DESKRIPSI || '',
            BATAS_WAKTU: item.BATAS_WAKTU || '',
            BOBOT_NILAI: Number(item.BOBOT_NILAI) || 100,
            STATUS: item.STATUS || 'AKTIF',
            isValid: Boolean(item.JUDUL_TUGAS)
          }));
          setParsedRows(parsed);
        } catch {
          onShowToast('Format file JSON tidak valid.', 'error');
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (evt) => {
        parseCSVContent(evt.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleProcessImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      onShowToast('Tidak ada data tugas yang valid untuk diimpor.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const today = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const itemsToImport = validRows.map(r => ({
        JUDUL_TUGAS: r.JUDUL_TUGAS,
        JENIS_TUGAS: r.JENIS_TUGAS,
        KELAS_ID: r.KELAS_ID,
        TOPIK: r.TOPIK,
        DESKRIPSI: r.DESKRIPSI,
        TANGGAL_DIBUAT: today,
        BATAS_WAKTU: r.BATAS_WAKTU,
        BOBOT_NILAI: r.BOBOT_NILAI,
        GURU_ID: currentUser.ref_id || 'G001',
        NAMA_GURU: currentUser.nama || 'Guru PJOK',
        STATUS: r.STATUS
      }));

      storage.bulkAddTugas(itemsToImport);
      onShowToast(`Berhasil mengimpor ${validRows.length} tugas pembelajaran!`, 'success');
      onSuccess(validRows.length);
      onClose();
    } catch {
      onShowToast('Gagal memproses impor tugas.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Import / Upload Tugas & Evaluasi PJOK
              </h3>
              <p className="text-[11px] text-slate-500">
                Impor daftar penugasan praktik, teori, atau portofolio dari spreadsheet secara massal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Download */}
        <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-700 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-teal-900 block">Unduh Format Contoh CSV Tugas</span>
              <span className="text-[11px] text-teal-700">Kolom: Judul, Jenis, Kelas_ID, Topik, Deskripsi, Batas_Waktu, Bobot, Status</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 bg-white hover:bg-teal-100/50 text-teal-800 border border-teal-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Unduh Template CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upload' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload File CSV / JSON
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'paste' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Salin-Tempel Teks (Paste)
          </button>
        </div>

        {/* Upload Mode */}
        {activeTab === 'upload' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/20 hover:bg-teal-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-10 h-10 mx-auto rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-800">
              {fileName ? `File Terpilih: ${fileName}` : 'Pilih file CSV Tugas atau seret ke sini'}
            </div>
            <p className="text-[11px] text-slate-400">
              Mendukung format CSV atau JSON dari Microsoft Excel & Google Sheets
            </p>
          </div>
        )}

        {/* Paste Mode */}
        {activeTab === 'paste' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Tempel Baris CSV Tugas:
            </label>
            <textarea
              rows={4}
              value={pasteContent}
              onChange={(e) => {
                setPasteContent(e.target.value);
                parseCSVContent(e.target.value);
              }}
              placeholder={`"Praktik Passing Voli","PRAKTIK","K01","Bola Voli","Rekam video passing 1 menit","2026-10-20 23:59",100,"AKTIF"`}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
            />
          </div>
        )}

        {/* Preview Section */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Pratinjau Data ({parsedRows.length} baris tugas)
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {validCount} Siap Impor
                </span>
                {invalidCount > 0 && (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {invalidCount} Tidak Valid
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Judul Tugas</th>
                    <th className="py-2 px-3">Jenis</th>
                    <th className="py-2 px-3">Kelas</th>
                    <th className="py-2 px-3">Batas Waktu</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 15).map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                      <td className="py-1.5 px-3 font-semibold text-slate-800 max-w-[200px] truncate" title={row.JUDUL_TUGAS}>
                        {row.JUDUL_TUGAS}
                      </td>
                      <td className="py-1.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {row.JENIS_TUGAS}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 font-medium text-slate-600">{row.KELAS_ID}</td>
                      <td className="py-1.5 px-3 text-slate-500 font-mono">{row.BATAS_WAKTU}</td>
                      <td className="py-1.5 px-3">
                        {row.isValid ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Valid
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Gagal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={validCount === 0 || isProcessing}
            onClick={handleProcessImport}
            className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isProcessing ? 'Memproses...' : `Import ${validCount} Tugas`}
          </button>
        </div>
      </div>
    </div>
  );
};
