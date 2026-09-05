import React, { useState } from 'react';
import { HelpCircle, Play, CheckCircle2, XCircle, Clock, Plus, Award, AlertCircle, RefreshCw, Shuffle, Upload } from 'lucide-react';
import { storage } from '../../services/storage';
import { QuizItem, BankSoalItem, HasilQuizItem, SessionUser } from '../../types';
import { ImportQuizModal } from './ImportQuizModal';

interface QuizManagerProps {
  currentUser: SessionUser;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export interface ShuffledOption {
  displayKey: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  isCorrect: boolean;
  originalKey: string;
}

export interface ActiveQuizQuestion extends BankSoalItem {
  shuffledOptions: ShuffledOption[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const QuizManager: React.FC<QuizManagerProps> = ({ currentUser, onShowToast }) => {
  const [quizzes, setQuizzes] = useState<QuizItem[]>(storage.getQuiz());
  const [bankSoal, setBankSoal] = useState<BankSoalItem[]>(storage.getBankSoal());
  const [hasilQuizList, setHasilQuizList] = useState<HasilQuizItem[]>(storage.getHasilQuiz());

  // Interactive Quiz state for student
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<ActiveQuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);

  // Modal to add quiz (for teacher)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [judulQuiz, setJudulQuiz] = useState('');
  const [deskripsiQuiz, setDeskripsiQuiz] = useState('');
  const [durasiMenit, setDurasiMenit] = useState(15);
  const [passingGrade, setPassingGrade] = useState(75);

  const isTeacherOrAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'GURU';

  const refreshData = () => {
    setQuizzes(storage.getQuiz());
    setBankSoal(storage.getBankSoal());
    setHasilQuizList(storage.getHasilQuiz());
  };

  const handleStartQuiz = (q: QuizItem) => {
    // Pick questions matching quiz id, materi, or topic
    let questions: BankSoalItem[] = bankSoal.filter(
      s => s.QUIZ_ID === q.QUIZ_ID || s.MATERI_ID === q.MATERI_ID || (s.TOPIK && q.JUDUL_QUIZ && q.JUDUL_QUIZ.toLowerCase().includes(s.TOPIK.toLowerCase()))
    );
    if (questions.length === 0) {
      questions = bankSoal.slice(0, 10);
    }

    // 1. Acak urutan pertanyaan (Shuffle questions)
    const shuffledQuestions: BankSoalItem[] = shuffleArray<BankSoalItem>(questions);

    // 2. Acak pilihan ganda di setiap butir soal (Shuffle options)
    const alphabet = ['A', 'B', 'C', 'D', 'E'] as const;
    const processedQuestions: ActiveQuizQuestion[] = shuffledQuestions.map((soal: BankSoalItem) => {
      const rawCorrectKey = (soal.KUNCI || 'A').trim().toUpperCase();

      const rawOptions: { originalKey: string; text: string }[] = [];
      if (soal.OPSI_A) rawOptions.push({ originalKey: 'A', text: soal.OPSI_A });
      if (soal.OPSI_B) rawOptions.push({ originalKey: 'B', text: soal.OPSI_B });
      if (soal.OPSI_C) rawOptions.push({ originalKey: 'C', text: soal.OPSI_C });
      if (soal.OPSI_D) rawOptions.push({ originalKey: 'D', text: soal.OPSI_D });
      if (soal.OPSI_E) rawOptions.push({ originalKey: 'E', text: soal.OPSI_E });

      // Acak pilihan ganda
      const shuffledRaw = shuffleArray(rawOptions);

      const shuffledOptions: ShuffledOption[] = shuffledRaw.map((opt, idx) => ({
        displayKey: alphabet[idx] || 'A',
        text: opt.text,
        isCorrect: opt.originalKey === rawCorrectKey,
        originalKey: opt.originalKey
      }));

      return {
        ...soal,
        shuffledOptions
      };
    });

    setActiveQuiz(q);
    setQuizQuestions(processedQuestions);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setFinalScore(0);
  };

  const handleSelectAnswer = (soalId: string, choice: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [soalId]: choice }));
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;

    let correctCount = 0;
    quizQuestions.forEach((q) => {
      const selectedDisplayKey = selectedAnswers[q.SOAL_ID];
      const matchingOpt = q.shuffledOptions.find(o => o.displayKey === selectedDisplayKey);
      if (matchingOpt && matchingOpt.isCorrect) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / (quizQuestions.length || 1)) * 100);
    setFinalScore(calculatedScore);
    setQuizSubmitted(true);

    // Save to Sheet 14_HASIL_QUIZ
    storage.addHasilQuiz({
      QUIZ_ID: activeQuiz.QUIZ_ID,
      MURID_ID: currentUser.ref_id || 'M001',
      NAMA_MURID: currentUser.nama || 'Murid',
      NILAI: calculatedScore,
      JUMLAH_BENAR: correctCount,
      JUMLAH_SALAH: quizQuestions.length - correctCount,
      TOTAL_SOAL: quizQuestions.length,
      STATUS: calculatedScore >= activeQuiz.PASSING_GRADE ? 'LULUS' : 'REMEDIAL',
      WAKTU_SELESAI: new Date().toISOString().replace('T', ' ').slice(0, 16)
    });

    onShowToast(`Quiz selesai! Nilai Anda: ${calculatedScore}`, 'success');
    refreshData();
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulQuiz.trim()) {
      onShowToast('Judul quiz wajib diisi.', 'error');
      return;
    }

    storage.addQuiz({
      MATERI_ID: 'M001',
      JUDUL_QUIZ: judulQuiz.trim(),
      DESKRIPSI: deskripsiQuiz.trim() || 'Evaluasi Pemahaman Teori PJOK',
      JUMLAH_SOAL: 5,
      DURASI_MENIT: Number(durasiMenit),
      PASSING_GRADE: Number(passingGrade),
      STATUS: 'AKTIF'
    });

    onShowToast('Quiz baru berhasil dibuat!', 'success');
    setShowAddModal(false);
    refreshData();
  };

  // If in active quiz mode
  if (activeQuiz && quizQuestions.length > 0) {
    const currentQ = quizQuestions[currentQuestionIdx];
    const isLastQ = currentQuestionIdx === quizQuestions.length - 1;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Quiz Header Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-800">{activeQuiz.JUDUL_QUIZ}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Shuffle className="w-3 h-3 text-amber-600" /> Soal & Pilihan Diacak
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Soal {currentQuestionIdx + 1} dari {quizQuestions.length}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl text-xs font-bold text-amber-800 border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Durasi: {activeQuiz.DURASI_MENIT} Menit</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {currentQ.TOPIK}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {currentQ.PERTANYAAN}
            </h3>
          </div>

          {/* Options (Acak Pilihan Ganda) */}
          <div className="space-y-2.5">
            {currentQ.shuffledOptions.map((opt) => {
              const isSelected = selectedAnswers[currentQ.SOAL_ID] === opt.displayKey;
              const isCorrect = opt.isCorrect;

              let btnClass = 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700';
              if (isSelected) {
                btnClass = 'bg-teal-700 text-white border-teal-700 shadow-sm';
              }
              if (quizSubmitted) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
                }
              }

              return (
                <button
                  key={opt.displayKey}
                  type="button"
                  onClick={() => handleSelectAnswer(currentQ.SOAL_ID, opt.displayKey)}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${btnClass}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-white/20 border border-current/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {opt.displayKey}
                  </span>
                  <span className="leading-snug flex-1">{opt.text}</span>
                  {quizSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Pembahasan if submitted */}
          {quizSubmitted && (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1">
              <span className="font-bold block uppercase tracking-wider text-[10px] text-teal-700">
                Kunci & Pembahasan Soal
              </span>
              <p>
                Kunci Jawaban yang benar:{' '}
                <strong>
                  {currentQ.shuffledOptions.find(o => o.isCorrect)?.displayKey}.{' '}
                  {currentQ.shuffledOptions.find(o => o.isCorrect)?.text}
                </strong>
              </p>
              <p className="text-slate-600 leading-relaxed">{currentQ.PEMBAHASAN}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-40"
            >
              Soal Sebelumnya
            </button>

            {!isLastQ ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Soal Berikutnya
              </button>
            ) : !quizSubmitted ? (
              <button
                onClick={handleFinishQuiz}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Selesai & Kumpulkan
              </button>
            ) : (
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Kembali ke Daftar Quiz
              </button>
            )}
          </div>
        </div>

        {/* Final Score Banner if submitted */}
        {quizSubmitted && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-2 shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Hasil Evaluasi Anda</div>
            <div className="text-4xl font-black text-teal-800">{finalScore} / 100</div>
            <div className="text-xs font-semibold text-slate-600">
              Passing Grade: {activeQuiz.PASSING_GRADE} • Status:{' '}
              <strong className={finalScore >= activeQuiz.PASSING_GRADE ? 'text-emerald-600' : 'text-rose-600'}>
                {finalScore >= activeQuiz.PASSING_GRADE ? 'LULUS KOMPETENSI' : 'REMEDIAL'}
              </strong>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Quiz & Tes Teori PJOK</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bank soal pilihan ganda, ujian kognitif PJOK & riwayat nilai (Sheet <code>12_BANK_SOAL</code>, <code>13_QUIZ</code>, <code>14_HASIL_QUIZ</code>)
          </p>
        </div>
        {isTeacherOrAdmin && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-700" /> Import / Upload Soal Quiz
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Buat Quiz Baru
            </button>
          </div>
        )}
      </div>

      {/* Available Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((q) => {
          const myAttempts = hasilQuizList.filter(
            h => h.QUIZ_ID === q.QUIZ_ID && h.MURID_ID === currentUser.ref_id
          );
          const bestScore = myAttempts.length > 0 ? Math.max(...myAttempts.map(h => h.NILAI)) : null;

          return (
            <div
              key={q.QUIZ_ID}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {q.JUMLAH_SOAL} Soal Pilihan Ganda
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Durasi: {q.DURASI_MENIT} Menit
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">{q.JUDUL_QUIZ}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{q.DESKRIPSI}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <span>KKM: <strong className="text-slate-700">{q.PASSING_GRADE}</strong></span>
                  {bestScore !== null && (
                    <span className="font-bold text-teal-700">
                      Nilai Tertinggi: {bestScore}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 border-t border-slate-100">
                <button
                  onClick={() => handleStartQuiz(q)}
                  className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {bestScore !== null ? 'Kerjakan Ulang Quiz' : 'Mulai Kerjakan Quiz'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Result History Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">
            {currentUser.role === 'MURID' ? 'Riwayat Hasil Quiz Saya' : 'Rekap Nilai Quiz Seluruh Siswa'}
          </h3>
          <p className="text-xs text-slate-400">Data Sheet <code>14_HASIL_QUIZ</code></p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Quiz</th>
                <th className="py-3 px-4 text-center">Benar</th>
                <th className="py-3 px-4 text-center">Salah</th>
                <th className="py-3 px-4 text-center">Nilai</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Waktu Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {hasilQuizList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Belum ada riwayat hasil quiz.
                  </td>
                </tr>
              ) : (
                hasilQuizList
                  .filter(h => currentUser.role !== 'MURID' || h.MURID_ID === currentUser.ref_id)
                  .map((res) => (
                    <tr key={res.HASIL_ID} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-800">{res.NAMA_MURID}</td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{res.QUIZ_ID}</td>
                      <td className="py-3 px-4 text-center text-emerald-600 font-bold">{res.JUMLAH_BENAR}</td>
                      <td className="py-3 px-4 text-center text-rose-600 font-bold">{res.JUMLAH_SALAH}</td>
                      <td className="py-3 px-4 text-center font-black text-slate-900">{res.NILAI}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          res.STATUS === 'LULUS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {res.STATUS}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{res.WAKTU_SELESAI}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create Quiz */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Buat Quiz Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Quiz</label>
                <input
                  type="text"
                  required
                  value={judulQuiz}
                  onChange={(e) => setJudulQuiz(e.target.value)}
                  placeholder="Contoh: Tes Formatif Bola Voli Modern"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi / Petunjuk</label>
                <textarea
                  rows={2}
                  value={deskripsiQuiz}
                  onChange={(e) => setDeskripsiQuiz(e.target.value)}
                  placeholder="Ujian kognitif untuk mengukur pemahaman rotasi dan teknik..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={durasiMenit}
                    onChange={(e) => setDurasiMenit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passing Grade (KKM)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={passingGrade}
                    onChange={(e) => setPassingGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none font-bold text-teal-800"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Terbitkan Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Quiz Modal */}
      <ImportQuizModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => refreshData()}
        onShowToast={onShowToast}
        currentUser={currentUser}
      />
    </div>
  );
};
