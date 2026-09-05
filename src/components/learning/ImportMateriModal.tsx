import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BookMarked
} from 'lucide-react';
import { storage } from '../../services/storage';
import { MateriItem, SessionUser } from '../../types';

interface ImportMateriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  currentUser: SessionUser;
}

interface ParsedMateriRow {
  JUDUL: string;
  TOPIK: string;
  FASE: string;
  KELAS: string;
  TUJUAN_PEMBELAJARAN: string;
  ISI_MATERI: string;
  FILE_URL?: string;
  VIDEO_URL?: string;
  STATUS: 'PUBLISH' | 'DRAFT';
  isValid: boolean;
  error?: string;
}

export const ImportMateriModal: React.FC<ImportMateriModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pasteContent, setPasteContent] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedMateriRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate & download template CSV for Materi
  const handleDownloadTemplate = () => {
    const headers = 'JUDUL,TOPIK,FASE,KELAS,TUJUAN_PEMBELAJARAN,ISI_MATERI,FILE_URL,VIDEO_URL,STATUS';
    const sampleRows = [
      '"Analisis Teknik Passing dan Servis Bola Voli","Permainan Bola Besar","Fase F","Kelas XI","Peserta didik mampu menganalisis variasi passing bawah dan atas","Modul pembelajaran teknik passing bola voli dengan penekanan pada posisi lutut dan ayunan lengan.","https://example.com/modul-voli.pdf","https://www.youtube.com/watch?v=dQw4w9WgXcQ","PUBLISH"',
      '"Kebugaran Jasmani: Sirkuit Training Mandiri","Kebugaran Jasmani","Fase F","Kelas XI","Merancang program latihan fisik peningkatan daya tahan","Program latihan interval 5 pos: push up, sit up, jumping jack, shuttle run, dan plank.","","https://www.youtube.com/watch?v=dQw4w9WgXcQ","PUBLISH"',
      '"Aktivitas Senam Lantai: Rangkaian Roll Depan dan Lenting","Senam Lantai","Fase E","Kelas X","Menguasai tahapan tumpuan tengkuk dan dorongan pinggul","Pedoman keselamatan dan rangkaian senam lantai bertahap di atas matras.","","","PUBLISH"'
    ];
    const csvContent = '\uFEFF' + [headers, ...sampleRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Template_Import_Materi_PJOK.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Template CSV Materi berhasil diunduh. Silakan isi dan upload kembali.', 'success');
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
      headerParts.some(h => h.includes('judul')) ||
      headerParts.some(h => h.includes('materi')) ||
      headerParts.some(h => h.includes('topik'));

    const startIndex = hasHeader ? 1 : 0;
    const judulColIdx = hasHeader ? headerParts.findIndex(h => h.includes('judul') || h.includes('materi')) : 0;
    const topikColIdx = hasHeader ? headerParts.findIndex(h => h.includes('topik') || h.includes('cabang')) : 1;
    const faseColIdx = hasHeader ? headerParts.findIndex(h => h.includes('fase')) : 2;
    const kelasColIdx = hasHeader ? headerParts.findIndex(h => h.includes('kelas')) : 3;
    const tujuanColIdx = hasHeader ? headerParts.findIndex(h => h.includes('tujuan') || h.includes('tp')) : 4;
    const isiColIdx = hasHeader ? headerParts.findIndex(h => h.includes('isi') || h.includes('konten') || h.includes('deskripsi')) : 5;
    const fileColIdx = hasHeader ? headerParts.findIndex(h => h.includes('file') || h.includes('pdf')) : 6;
    const videoColIdx = hasHeader ? headerParts.findIndex(h => h.includes('video') || h.includes('youtube')) : 7;
    const statusColIdx = hasHeader ? headerParts.findIndex(h => h.includes('status')) : 8;

    const parsed: ParsedMateriRow[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const cols = splitLine(lines[i]);
      if (cols.length === 0 || cols.every(c => !c)) continue;

      const judul = (judulColIdx !== -1 && cols[judulColIdx] ? cols[judulColIdx] : cols[0] || '').trim();
      const topik = (topikColIdx !== -1 && cols[topikColIdx] ? cols[topikColIdx] : cols[1] || 'Permainan Bola Besar').trim();
      const fase = (faseColIdx !== -1 && cols[faseColIdx] ? cols[faseColIdx] : cols[2] || 'Fase F').trim();
      const kelas = (kelasColIdx !== -1 && cols[kelasColIdx] ? cols[kelasColIdx] : cols[3] || 'Kelas XI').trim();
      const tujuan = (tujuanColIdx !== -1 && cols[tujuanColIdx] ? cols[tujuanColIdx] : cols[4] || '').trim();
      const isi = (isiColIdx !== -1 && cols[isiColIdx] ? cols[isiColIdx] : cols[5] || '').trim();
      const fileUrl = (fileColIdx !== -1 && cols[fileColIdx] ? cols[fileColIdx] : '').trim();
      const videoUrl = (videoColIdx !== -1 && cols[videoColIdx] ? cols[videoColIdx] : '').trim();
      const rawStatus = (statusColIdx !== -1 && cols[statusColIdx] ? cols[statusColIdx] : 'PUBLISH').trim().toUpperCase();

      const isValid = judul.length > 0;
      parsed.push({
        JUDUL: judul,
        TOPIK: topik || 'Permainan Bola Besar',
        FASE: fase || 'Fase F',
        KELAS: kelas || 'Kelas XI',
        TUJUAN_PEMBELAJARAN: tujuan || 'Memahami teknik dan strategi dasar pembelajaran PJOK.',
        ISI_MATERI: isi || 'Rangkuman materi pembelajaran gerak dan kebugaran jasmani.',
        FILE_URL: fileUrl,
        VIDEO_URL: videoUrl,
        STATUS: rawStatus === 'DRAFT' ? 'DRAFT' : 'PUBLISH',
        isValid,
        error: !isValid ? 'Judul materi wajib diisi' : undefined
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
          const rawList = Array.isArray(json) ? json : json['09_MATERI'] || [];
          const parsed = rawList.map((item: any) => ({
            JUDUL: item.JUDUL || '',
            TOPIK: item.TOPIK || 'Permainan Bola Besar',
            FASE: item.FASE || 'Fase F',
            KELAS: item.KELAS || 'Kelas XI',
            TUJUAN_PEMBELAJARAN: item.TUJUAN_PEMBELAJARAN || '',
            ISI_MATERI: item.ISI_MATERI || '',
            FILE_URL: item.FILE_URL || '',
            VIDEO_URL: item.VIDEO_URL || '',
            STATUS: item.STATUS === 'DRAFT' ? 'DRAFT' : 'PUBLISH',
            isValid: Boolean(item.JUDUL)
          }));
          setParsedRows(parsed);
        } catch {
          onShowToast('Format berkas JSON tidak valid.', 'error');
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
      onShowToast('Tidak ada data materi yang valid untuk diimpor.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const itemsToImport = validRows.map(r => ({
        ATP_ID: 'ATP001',
        JUDUL: r.JUDUL,
        TOPIK: r.TOPIK,
        FASE: r.FASE,
        KELAS: r.KELAS,
        TUJUAN_PEMBELAJARAN: r.TUJUAN_PEMBELAJARAN,
        ISI_MATERI: r.ISI_MATERI,
        FILE_URL: r.FILE_URL,
        VIDEO_URL: r.VIDEO_URL,
        GURU_ID: currentUser.ref_id || 'G001',
        NAMA_GURU: currentUser.nama || 'Guru PJOK',
        STATUS: r.STATUS
      }));

      storage.bulkAddMateri(itemsToImport);
      onShowToast(`Berhasil mengimpor ${validRows.length} materi pembelajaran!`, 'success');
      onSuccess(validRows.length);
      onClose();
    } catch {
      onShowToast('Gagal memproses impor materi.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Import / Upload Materi Pembelajaran
              </h3>
              <p className="text-[11px] text-slate-500">
                Impor daftar materi, modul belajar, atau tautan video secara massal dari spreadsheet.
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
              <span className="font-bold text-teal-900 block">Unduh Format Contoh CSV Materi</span>
              <span className="text-[11px] text-teal-700">Kolom: Judul, Topik, Fase, Kelas, Tujuan, Isi, File_URL, Video_URL, Status</span>
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

        {/* Tab Switcher */}
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

        {/* Upload File */}
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
              {fileName ? `File Terpilih: ${fileName}` : 'Pilih file CSV Materi atau seret ke sini'}
            </div>
            <p className="text-[11px] text-slate-400">
              Mendukung format .CSV dari Microsoft Excel, LibreOffice, atau Google Spreadsheet
            </p>
          </div>
        )}

        {/* Paste Area */}
        {activeTab === 'paste' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Tempel Baris CSV Materi:
            </label>
            <textarea
              rows={4}
              value={pasteContent}
              onChange={(e) => {
                setPasteContent(e.target.value);
                parseCSVContent(e.target.value);
              }}
              placeholder={`"Teknik Passing Bawah Bola Voli","Permainan Bola Besar","Fase F","Kelas XI","Tujuan pembelajaran voli","Rangkuman isi materi","","","PUBLISH"`}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
            />
          </div>
        )}

        {/* Preview Section */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Pratinjau Data ({parsedRows.length} baris materi)
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
                    <th className="py-2 px-3">Judul Materi</th>
                    <th className="py-2 px-3">Topik / Fase</th>
                    <th className="py-2 px-3">Tujuan</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 15).map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                      <td className="py-1.5 px-3 font-semibold text-slate-800 max-w-[200px] truncate" title={row.JUDUL}>
                        {row.JUDUL}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600">
                        {row.TOPIK} ({row.FASE})
                      </td>
                      <td className="py-1.5 px-3 text-slate-600 max-w-[200px] truncate" title={row.TUJUAN_PEMBELAJARAN}>
                        {row.TUJUAN_PEMBELAJARAN}
                      </td>
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
            {parsedRows.length > 15 && (
              <p className="text-[10px] text-slate-400 text-right">
                Menampilkan 15 dari {parsedRows.length} baris...
              </p>
            )}
          </div>
        )}

        {/* Footer Actions */}
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
            {isProcessing ? 'Memproses...' : `Import ${validCount} Materi`}
          </button>
        </div>
      </div>
    </div>
  );
};
