import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle
} from 'lucide-react';
import { storage } from '../../services/storage';
import { SessionUser } from '../../types';

interface ImportQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  currentUser: SessionUser;
}

interface ParsedQuizRow {
  QUIZ_JUDUL: string;
  TOPIK: string;
  PERTANYAAN: string;
  OPSI_A: string;
  OPSI_B: string;
  OPSI_C: string;
  OPSI_D: string;
  OPSI_E?: string;
  KUNCI: string;
  PEMBAHASAN: string;
  BOBOT: number;
  isValid: boolean;
  error?: string;
}

export const ImportQuizModal: React.FC<ImportQuizModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pasteContent, setPasteContent] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedQuizRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const headers = 'QUIZ_JUDUL,TOPIK,PERTANYAAN,OPSI_A,OPSI_B,OPSI_C,OPSI_D,OPSI_E,KUNCI,PEMBAHASAN,BOBOT';
    const sampleRows = [
      '"Kuis Kebugaran Jasmani","Kebugaran Jasmani","Komponen kebugaran jasmani yang diukur menggunakan tes lari shuttle run adalah...","Kelenturan otot","Kelincahan gerak","Daya tahan aerobik","Kekuatan otot kaki","Keseimbangan statis","B","Shuttle run mengukur kelincahan (agility) dalam mengubah arah secara cepat.",20',
      '"Kuis Kebugaran Jasmani","Kebugaran Jasmani","Kemampuan otot untuk melakukan kontraksi secara berulang-ulang dalam waktu lama disebut...","Kekuatan otot","Daya tahan otot (Muscular endurance)","Kecepatan gerak","Kelenturan persendian","Daya ledak otot","B","Daya tahan otot merupakan ketahanan otot terhadap kelelahan pada kontraksi berulang.",20',
      '"Kuis Bola Voli","Bola Voli","Perkenaan bola voli yang tepat saat melakukan gerakan passing bawah adalah pada bagian...","Ujung jari kedua tangan","Pergelangan tangan bagian dalam hingga lengan bawah","Siku tangan bagian dalam","Telapak tangan terbuka","Bahu bagian samping","B","Perkenaan passing bawah yang optimal berada pada lengan bawah antara pergelangan dan siku.",20'
    ];
    const csvContent = '\uFEFF' + [headers, ...sampleRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Template_Import_Soal_Quiz_PJOK.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Template CSV Soal Quiz berhasil diunduh.', 'success');
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
      headerParts.some(h => h.includes('soal') || h.includes('tanya') || h.includes('opsi') || h.includes('pertanyaan'));

    const startIndex = hasHeader ? 1 : 0;
    const quizJudulIdx = hasHeader ? headerParts.findIndex(h => h.includes('quiz') || h.includes('judul')) : 0;
    const topikIdx = hasHeader ? headerParts.findIndex(h => h.includes('topik') || h.includes('materi')) : 1;
    const tanyaIdx = hasHeader ? headerParts.findIndex(h => h.includes('pertanyaan') || h.includes('soal') || h.includes('tanya')) : 2;
    const opsiAIdx = hasHeader ? headerParts.findIndex(h => h.includes('opsi_a') || h === 'a' || h.includes('opsi a')) : 3;
    const opsiBIdx = hasHeader ? headerParts.findIndex(h => h.includes('opsi_b') || h === 'b' || h.includes('opsi b')) : 4;
    const opsiCIdx = hasHeader ? headerParts.findIndex(h => h.includes('opsi_c') || h === 'c' || h.includes('opsi c')) : 5;
    const opsiDIdx = hasHeader ? headerParts.findIndex(h => h.includes('opsi_d') || h === 'd' || h.includes('opsi d')) : 6;
    const opsiEIdx = hasHeader ? headerParts.findIndex(h => h.includes('opsi_e') || h === 'e' || h.includes('opsi e')) : 7;
    const kunciIdx = hasHeader ? headerParts.findIndex(h => h.includes('kunci') || h.includes('jawaban')) : 8;
    const pembahasanIdx = hasHeader ? headerParts.findIndex(h => h.includes('bahas') || h.includes('penjelasan')) : 9;
    const bobotIdx = hasHeader ? headerParts.findIndex(h => h.includes('bobot') || h.includes('poin')) : 10;

    const parsed: ParsedQuizRow[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const cols = splitLine(lines[i]);
      if (cols.length === 0 || cols.every(c => !c)) continue;

      const quizJudul = (quizJudulIdx !== -1 && cols[quizJudulIdx] ? cols[quizJudulIdx] : 'Kuis Evaluasi PJOK').trim();
      const topik = (topikIdx !== -1 && cols[topikIdx] ? cols[topikIdx] : 'PJOK').trim();
      const pertanyaan = (tanyaIdx !== -1 && cols[tanyaIdx] ? cols[tanyaIdx] : cols[2] || cols[0] || '').trim();
      const opsiA = (opsiAIdx !== -1 && cols[opsiAIdx] ? cols[opsiAIdx] : cols[3] || '').trim();
      const opsiB = (opsiBIdx !== -1 && cols[opsiBIdx] ? cols[opsiBIdx] : cols[4] || '').trim();
      const opsiC = (opsiCIdx !== -1 && cols[opsiCIdx] ? cols[opsiCIdx] : cols[5] || '').trim();
      const opsiD = (opsiDIdx !== -1 && cols[opsiDIdx] ? cols[opsiDIdx] : cols[6] || '').trim();
      const opsiE = (opsiEIdx !== -1 && cols[opsiEIdx] ? cols[opsiEIdx] : cols[7] || '').trim();
      const rawKunci = (kunciIdx !== -1 && cols[kunciIdx] ? cols[kunciIdx] : 'A').trim().toUpperCase();
      const pembahasan = (pembahasanIdx !== -1 && cols[pembahasanIdx] ? cols[pembahasanIdx] : '').trim();
      const bobot = Number(bobotIdx !== -1 && cols[bobotIdx] ? cols[bobotIdx] : '20') || 20;

      const validKunci = ['A', 'B', 'C', 'D', 'E'].includes(rawKunci) ? rawKunci : 'A';
      const isValid = pertanyaan.length > 0 && opsiA.length > 0 && opsiB.length > 0;

      parsed.push({
        QUIZ_JUDUL: quizJudul || 'Kuis PJOK',
        TOPIK: topik || 'Kebugaran & Olahraga',
        PERTANYAAN: pertanyaan,
        OPSI_A: opsiA,
        OPSI_B: opsiB,
        OPSI_C: opsiC || '-',
        OPSI_D: opsiD || '-',
        OPSI_E: opsiE || undefined,
        KUNCI: validKunci,
        PEMBAHASAN: pembahasan || 'Kunci jawaban yang tepat adalah ' + validKunci,
        BOBOT: bobot,
        isValid,
        error: !isValid ? 'Pertanyaan dan Opsi A & B wajib diisi' : undefined
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
          const rawList = Array.isArray(json) ? json : json['08_BANK_SOAL'] || json.soal || [];
          const parsed = rawList.map((item: any) => ({
            QUIZ_JUDUL: item.QUIZ_JUDUL || 'Kuis PJOK',
            TOPIK: item.TOPIK || 'PJOK',
            PERTANYAAN: item.PERTANYAAN || '',
            OPSI_A: item.OPSI_A || '',
            OPSI_B: item.OPSI_B || '',
            OPSI_C: item.OPSI_C || '',
            OPSI_D: item.OPSI_D || '',
            OPSI_E: item.OPSI_E || undefined,
            KUNCI: (item.KUNCI || item.KUNCI_JAWABAN || 'A').toUpperCase(),
            PEMBAHASAN: item.PEMBAHASAN || '',
            BOBOT: Number(item.BOBOT) || 20,
            isValid: Boolean(item.PERTANYAAN && item.OPSI_A && item.OPSI_B)
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
      onShowToast('Tidak ada soal yang valid untuk diimpor.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      // Group by QUIZ_JUDUL
      const quizGroups: Record<string, ParsedQuizRow[]> = {};
      validRows.forEach(r => {
        const title = r.QUIZ_JUDUL || 'Kuis PJOK';
        if (!quizGroups[title]) quizGroups[title] = [];
        quizGroups[title].push(r);
      });

      let totalImported = 0;

      // Check existing quizzes or create new quiz headers
      const existingQuizzes = storage.getQuiz();

      Object.entries(quizGroups).forEach(([quizTitle, rows]) => {
        let quiz = existingQuizzes.find(q => (q.JUDUL_QUIZ || '').toLowerCase() === quizTitle.toLowerCase());
        let quizId = quiz?.QUIZ_ID;

        if (!quiz) {
          const createdQuiz = storage.addQuiz({
            JUDUL_QUIZ: quizTitle,
            DESKRIPSI: `Kuis evaluasi topik ${rows[0]?.TOPIK || 'PJOK'}`,
            MATERI_ID: 'M001',
            DURASI_MENIT: 20,
            JUMLAH_SOAL: rows.length,
            PASSING_GRADE: 75,
            STATUS: 'AKTIF'
          });
          quizId = createdQuiz.QUIZ_ID;
        }

        // Map rows to SoalItem
        const soalToInsert = rows.map((r, idx) => ({
          SOAL_ID: `S_${quizId}_${Date.now()}_${idx}`,
          QUIZ_ID: quizId!,
          NOMOR: idx + 1,
          TOPIK: r.TOPIK,
          PERTANYAAN: r.PERTANYAAN,
          OPSI_A: r.OPSI_A,
          OPSI_B: r.OPSI_B,
          OPSI_C: r.OPSI_C,
          OPSI_D: r.OPSI_D,
          OPSI_E: r.OPSI_E || '',
          KUNCI: r.KUNCI,
          KUNCI_JAWABAN: r.KUNCI,
          PEMBAHASAN: r.PEMBAHASAN,
          BOBOT: r.BOBOT,
          JENIS_SOAL: 'PILIHAN_GANDA' as const
        }));

        storage.bulkAddSoal(soalToInsert);
        totalImported += soalToInsert.length;
      });

      onShowToast(`Berhasil mengimpor ${totalImported} butir soal pilihan ganda ke Bank Soal & Quiz!`, 'success');
      onSuccess(totalImported);
      onClose();
    } catch {
      onShowToast('Gagal memproses impor soal quiz.', 'error');
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
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Import / Upload Soal & Kuis PJOK
              </h3>
              <p className="text-[11px] text-slate-500">
                Impor butir soal pilihan ganda, kunci jawaban, dan pembahasan secara massal.
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
        <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-900 block">Unduh Format Contoh CSV Soal Quiz</span>
              <span className="text-[11px] text-amber-700">Kolom: Judul, Topik, Pertanyaan, Opsi_A..D, Kunci, Pembahasan, Bobot</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 bg-white hover:bg-amber-100/50 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
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
              activeTab === 'upload' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload File CSV / JSON
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'paste' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Salin-Tempel Teks (Paste)
          </button>
        </div>

        {/* Upload Mode */}
        {activeTab === 'upload' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-amber-200 hover:border-amber-400 bg-amber-50/20 hover:bg-amber-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-800">
              {fileName ? `File Terpilih: ${fileName}` : 'Pilih file CSV Soal Quiz atau seret ke sini'}
            </div>
            <p className="text-[11px] text-slate-400">
              Mendukung file spreadsheet CSV atau JSON dari Google Drive & Excel
            </p>
          </div>
        )}

        {/* Paste Mode */}
        {activeTab === 'paste' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Tempel Format CSV Soal Quiz:
            </label>
            <textarea
              rows={4}
              value={pasteContent}
              onChange={(e) => {
                setPasteContent(e.target.value);
                parseCSVContent(e.target.value);
              }}
              placeholder={`"Kuis Bola Basket","Bola Basket","Jumlah pemain dalam satu tim basket...","4 orang","5 orang","6 orang","7 orang","","B","Satu tim beranggotakan 5 orang di lapangan.",20`}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        )}

        {/* Preview Section */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Pratinjau Butir Soal ({parsedRows.length} butir)
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
                    <th className="py-2 px-3">Soal Pertanyaan</th>
                    <th className="py-2 px-3">Kuis / Topik</th>
                    <th className="py-2 px-3">Kunci</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 15).map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                      <td className="py-1.5 px-3 font-semibold text-slate-800 max-w-[220px] truncate" title={row.PERTANYAAN}>
                        {row.PERTANYAAN}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600 max-w-[120px] truncate">{row.QUIZ_JUDUL}</td>
                      <td className="py-1.5 px-3 font-bold text-teal-700 text-center">{row.KUNCI}</td>
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
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isProcessing ? 'Memproses...' : `Import ${validCount} Butir Soal`}
          </button>
        </div>
      </div>
    </div>
  );
};
