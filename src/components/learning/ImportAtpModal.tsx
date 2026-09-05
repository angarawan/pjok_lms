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
  Sparkles
} from 'lucide-react';
import { storage } from '../../services/storage';
import { AtpItem } from '../../types';

interface ImportAtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface ParsedAtpRow {
  FASE: string;
  KELAS: string;
  ELEMEN: string;
  CAPAIAN_PEMBELAJARAN: string;
  TUJUAN_PEMBELAJARAN: string;
  ALOKASI_WAKTU: string;
  SEMESTER: string;
  isValid: boolean;
  error?: string;
}

export const ImportAtpModal: React.FC<ImportAtpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pasteContent, setPasteContent] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedAtpRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate & download template CSV for ATP
  const handleDownloadTemplate = () => {
    const headers = 'FASE,KELAS,ELEMEN,CAPAIAN_PEMBELAJARAN,TUJUAN_PEMBELAJARAN,ALOKASI_WAKTU,SEMESTER';
    const sampleRows = [
      '"Fase F","Kelas XI","Keterampilan Gerak","Peserta didik dapat mengevaluasi keterampilan gerak spesifik permainan invasi.","Menganalisis dan mempraktikkan variasi passing dan servis bola voli","6 JP","1 (Ganjil)"',
      '"Fase F","Kelas XI","Kebugaran Jasmani","Peserta didik mampu merancang program kebugaran jasmani terkait kesehatan.","Merancang aktivitas latihan daya tahan jantung-paru dan kelentukan","8 JP","1 (Ganjil)"',
      '"Fase F","Kelas XI","Pengembangan Karakter","Peserta didik menunjukkan perilaku sportif dan kerjasama dalam tim.","Menunjukkan sikap kepemimpinan dan fair play dalam permainan beregu","4 JP","1 (Ganjil)"',
      '"Fase E","Kelas X","Pola Hidup Sehat","Peserta didik memahami pencegahan penyakit dan bahaya NAPZA.","Mengidentifikasi bahaya pergaulan bebas dan pola makan bergizi seimbang","4 JP","2 (Genap)"'
    ];
    const csvContent = '\uFEFF' + [headers, ...sampleRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Template_Import_ATP_PJOK.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Template CSV ATP berhasil diunduh. Silakan isi dan upload kembali.', 'success');
  };

  // Parse CSV
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
      headerParts.some(h => h.includes('fase')) ||
      headerParts.some(h => h.includes('tujuan')) ||
      headerParts.some(h => h.includes('elemen'));

    const startIndex = hasHeader ? 1 : 0;
    const faseColIdx = hasHeader ? headerParts.findIndex(h => h.includes('fase')) : 0;
    const kelasColIdx = hasHeader ? headerParts.findIndex(h => h.includes('kelas')) : 1;
    const elemenColIdx = hasHeader ? headerParts.findIndex(h => h.includes('elemen')) : 2;
    const capaianColIdx = hasHeader ? headerParts.findIndex(h => h.includes('capaian') || h.includes('cp')) : 3;
    const tujuanColIdx = hasHeader ? headerParts.findIndex(h => h.includes('tujuan') || h.includes('tp')) : 4;
    const alokasiColIdx = hasHeader ? headerParts.findIndex(h => h.includes('alokasi') || h.includes('jp') || h.includes('waktu')) : 5;
    const semesterColIdx = hasHeader ? headerParts.findIndex(h => h.includes('semester')) : 6;

    const parsed: ParsedAtpRow[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const cols = splitLine(lines[i]);
      if (cols.length === 0 || cols.every(c => !c)) continue;

      const fase = (faseColIdx !== -1 && cols[faseColIdx] ? cols[faseColIdx] : cols[0] || 'Fase F').trim();
      const kelas = (kelasColIdx !== -1 && cols[kelasColIdx] ? cols[kelasColIdx] : cols[1] || 'Kelas XI').trim();
      const elemen = (elemenColIdx !== -1 && cols[elemenColIdx] ? cols[elemenColIdx] : cols[2] || 'Keterampilan Gerak').trim();
      const capaian = (capaianColIdx !== -1 && cols[capaianColIdx] ? cols[capaianColIdx] : cols[3] || '').trim();
      const tujuan = (tujuanColIdx !== -1 && cols[tujuanColIdx] ? cols[tujuanColIdx] : cols[4] || '').trim();
      const alokasi = (alokasiColIdx !== -1 && cols[alokasiColIdx] ? cols[alokasiColIdx] : '6 JP').trim();
      const semester = (semesterColIdx !== -1 && cols[semesterColIdx] ? cols[semesterColIdx] : '1 (Ganjil)').trim();

      const isValid = tujuan.length > 0;
      parsed.push({
        FASE: fase,
        KELAS: kelas,
        ELEMEN: elemen,
        CAPAIAN_PEMBELAJARAN: capaian || 'Peserta didik dapat menguasai capaian pembelajaran PJOK.',
        TUJUAN_PEMBELAJARAN: tujuan,
        ALOKASI_WAKTU: alokasi || '6 JP',
        SEMESTER: semester || '1 (Ganjil)',
        isValid,
        error: !isValid ? 'Tujuan Pembelajaran wajib diisi' : undefined
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
          const rawList = Array.isArray(json) ? json : json['08_ATP'] || [];
          const parsed = rawList.map((item: any) => ({
            FASE: item.FASE || 'Fase F',
            KELAS: item.KELAS || 'Kelas XI',
            ELEMEN: item.ELEMEN || 'Keterampilan Gerak',
            CAPAIAN_PEMBELAJARAN: item.CAPAIAN_PEMBELAJARAN || '',
            TUJUAN_PEMBELAJARAN: item.TUJUAN_PEMBELAJARAN || item.TUJUAN || '',
            ALOKASI_WAKTU: item.ALOKASI_WAKTU || '6 JP',
            SEMESTER: item.SEMESTER || '1 (Ganjil)',
            isValid: Boolean(item.TUJUAN_PEMBELAJARAN || item.TUJUAN)
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
      onShowToast('Tidak ada data ATP yang valid untuk diimpor.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const itemsToImport = validRows.map(r => ({
        FASE: r.FASE,
        KELAS: r.KELAS,
        ELEMEN: r.ELEMEN,
        CAPAIAN_PEMBELAJARAN: r.CAPAIAN_PEMBELAJARAN,
        TUJUAN_PEMBELAJARAN: r.TUJUAN_PEMBELAJARAN,
        ALOKASI_WAKTU: r.ALOKASI_WAKTU,
        SEMESTER: r.SEMESTER
      }));

      storage.bulkAddAtp(itemsToImport);
      onShowToast(`Berhasil mengimpor ${validRows.length} data Alur Tujuan Pembelajaran (ATP)!`, 'success');
      onSuccess(validRows.length);
      onClose();
    } catch {
      onShowToast('Gagal memproses impor data ATP.', 'error');
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
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Import / Upload Alur Tujuan Pembelajaran (ATP)
              </h3>
              <p className="text-[11px] text-slate-500">
                Unggah berkas CSV/Excel atau salin format kurikulum PJOK secara massal.
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

        {/* Action Top Bar: Download Template */}
        <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-700 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-teal-900 block">Unduh Format Contoh CSV ATP</span>
              <span className="text-[11px] text-teal-700">Kolom: Fase, Kelas, Elemen, Capaian, Tujuan, Alokasi, Semester</span>
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
              {fileName ? `File Terpilih: ${fileName}` : 'Klik untuk memilih file CSV atau seret ke sini'}
            </div>
            <p className="text-[11px] text-slate-400">
              Mendukung file .CSV, .TXT, atau .JSON dari Excel / spreadsheet
            </p>
          </div>
        )}

        {/* Paste Mode */}
        {activeTab === 'paste' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Tempel Baris Teks CSV dari Excel / Google Sheet:
            </label>
            <textarea
              rows={4}
              value={pasteContent}
              onChange={(e) => {
                setPasteContent(e.target.value);
                parseCSVContent(e.target.value);
              }}
              placeholder={`Fase F,Kelas XI,Keterampilan Gerak,Capaian gerak bola voli,Menganalisis variasi passing dan servis voli,6 JP,1 (Ganjil)`}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
            />
          </div>
        )}

        {/* Preview Section */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>Pratinjau Data ({parsedRows.length} baris terdeteksi)</span>
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
                    <th className="py-2 px-3">Fase / Kelas</th>
                    <th className="py-2 px-3">Elemen</th>
                    <th className="py-2 px-3">Tujuan Pembelajaran (TP)</th>
                    <th className="py-2 px-3">Alokasi</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 15).map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                      <td className="py-1.5 px-3 font-semibold text-slate-800">
                        {row.FASE} - {row.KELAS}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600">{row.ELEMEN}</td>
                      <td className="py-1.5 px-3 font-medium text-slate-700 max-w-xs truncate" title={row.TUJUAN_PEMBELAJARAN}>
                        {row.TUJUAN_PEMBELAJARAN}
                      </td>
                      <td className="py-1.5 px-3 font-mono text-slate-500">{row.ALOKASI_WAKTU}</td>
                      <td className="py-1.5 px-3">
                        {row.isValid ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Valid
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800" title={row.error}>
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

        {/* Modal Action Buttons */}
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
            {isProcessing ? 'Memproses...' : `Import ${validCount} Data ATP`}
          </button>
        </div>
      </div>
    </div>
  );
};
