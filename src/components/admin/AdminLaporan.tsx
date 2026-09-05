import React, { useState } from 'react';
import { FileBarChart, Printer, Download, Filter, GraduationCap, CalendarCheck, Award, BookOpen } from 'lucide-react';
import { storage } from '../../services/storage';

interface AdminLaporanProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminLaporan: React.FC<AdminLaporanProps> = ({ onShowToast }) => {
  const [reportType, setReportType] = useState<'murid' | 'presensi' | 'nilai' | 'pembelajaran'>('nilai');
  const [filterKelas, setFilterKelas] = useState('ALL');
  const kelasList = storage.getKelas();

  const murids = storage.getMurid();
  const presensi = storage.getPresensi();
  const penilaian = storage.getPenilaian();
  const materi = storage.getMateri();
  const tugas = storage.getTugas();

  const namaSekolah = storage.getConfig('NAMA_SEKOLAH', 'SMA Negeri 1 Prestasi Bangsa');
  const tahunPelajaran = storage.getConfig('TAHUN_PELAJARAN', '2026/2027');
  const semester = storage.getConfig('SEMESTER', '1 (Ganjil)');

  // Filtered data sets
  const filteredMurids = murids.filter(m => filterKelas === 'ALL' || m.KELAS_ID === filterKelas);
  const filteredPresensi = presensi.filter(p => filterKelas === 'ALL' || p.KELAS_ID === filterKelas);
  const filteredPenilaian = penilaian.filter(n => filterKelas === 'ALL' || n.KELAS_ID === filterKelas);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = `Laporan_PJOK_${reportType}_${filterKelas}.csv`;

    if (reportType === 'murid') {
      csvContent = 'No,NIS,NISN,Nama Murid,Jenis Kelamin,Kelas,Tahun Pelajaran,Status\n';
      filteredMurids.forEach((m, idx) => {
        csvContent += `"${idx + 1}","${m.NIS}","${m.NISN}","${m.NAMA_MURID}","${m.JENIS_KELAMIN}","${m.NAMA_KELAS}","${m.TAHUN_PELAJARAN}","${m.STATUS}"\n`;
      });
    } else if (reportType === 'presensi') {
      csvContent = 'No,Tanggal,Kelas,NIS Murid,Nama Murid,Status,Keterangan,Waktu\n';
      filteredPresensi.forEach((p, idx) => {
        csvContent += `"${idx + 1}","${p.TANGGAL}","${p.KELAS_ID}","${p.MURID_ID}","${p.NAMA_MURID}","${p.STATUS}","${p.KETERANGAN}","${p.WAKTU}"\n`;
      });
    } else if (reportType === 'nilai') {
      csvContent = 'No,Nama Murid,Kelas,Materi,Jenis Penilaian,Aspek,Nilai,Predikat,Keterangan\n';
      filteredPenilaian.forEach((n, idx) => {
        csvContent += `"${idx + 1}","${n.NAMA_MURID}","${n.KELAS_ID}","${n.MATERI}","${n.JENIS_PENILAIAN}","${n.ASPEK}","${n.NILAI}","${n.PREDIKAT}","${n.KETERANGAN}"\n`;
      });
    } else {
      csvContent = 'No,Judul Materi,Topik,Fase,Kelas,Status,Tanggal\n';
      materi.forEach((mat, idx) => {
        csvContent += `"${idx + 1}","${mat.JUDUL}","${mat.TOPIK}","${mat.FASE}","${mat.KELAS}","${mat.STATUS}","${mat.TANGGAL}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`Laporan ${reportType} berhasil diexport ke CSV/Excel!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Control Panel (Hidden on Print) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Laporan & Rekapitulasi Akademik PJOK</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cetak dokumen resmi dan export data untuk dinas pendidikan & arsip sekolah
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="nilai">Laporan Rekapitulasi Nilai</option>
            <option value="presensi">Laporan Rekap Presensi</option>
            <option value="murid">Laporan Data Murid</option>
            <option value="pembelajaran">Laporan Modul Pembelajaran</option>
          </select>

          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-teal-800 outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="ALL">Semua Kelas</option>
            {kelasList.map(k => (
              <option key={k.KELAS_ID} value={k.KELAS_ID}>{k.NAMA_KELAS}</option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" /> Cetak / PDF
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Kop Surat Resmi */}
        <div className="text-center pb-6 border-b-2 border-slate-800 mb-6">
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">
            PEMERINTAH PROVINSI DINAS PENDIDIKAN
          </h1>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide mt-0.5">
            {namaSekolah}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Learning Management System PJOK • Belajar, Bergerak, Berkembang
          </p>
          <div className="mt-3 inline-block px-4 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-800">
            {reportType === 'nilai' && 'REKAPITULASI PENILAIAN HASIL BELAJAR PJOK'}
            {reportType === 'presensi' && 'REKAPITULASI PRESENSI KEHADIRAN SISWA DI LAPANGAN'}
            {reportType === 'murid' && 'DATA INDUK PESERTA DIDIK PJOK'}
            {reportType === 'pembelajaran' && 'LAPORAN MODUL PEMBELAJARAN & TUGAS PJOK'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tahun Pelajaran: {tahunPelajaran} • Semester: {semester} • Kelas: {filterKelas === 'ALL' ? 'Seluruh Rombel' : filterKelas}
          </div>
        </div>

        {/* Content Table by Report Type */}
        <div className="overflow-x-auto">
          {reportType === 'nilai' && (
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border border-slate-300">No</th>
                  <th className="py-2.5 px-3 border border-slate-300">Nama Murid</th>
                  <th className="py-2.5 px-3 border border-slate-300">Kelas</th>
                  <th className="py-2.5 px-3 border border-slate-300">Materi Uji</th>
                  <th className="py-2.5 px-3 border border-slate-300">Jenis</th>
                  <th className="py-2.5 px-3 border border-slate-300">Aspek yang Dinilai</th>
                  <th className="py-2.5 px-3 border border-slate-300 text-center">Nilai</th>
                  <th className="py-2.5 px-3 border border-slate-300 text-center">Predikat</th>
                  <th className="py-2.5 px-3 border border-slate-300">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPenilaian.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-slate-400">
                      Belum ada data penilaian pada kelas ini.
                    </td>
                  </tr>
                ) : (
                  filteredPenilaian.map((n, idx) => (
                    <tr key={n.NILAI_ID} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border border-slate-300 font-mono text-center">{idx + 1}</td>
                      <td className="py-2 px-3 border border-slate-300 font-bold text-slate-800">{n.NAMA_MURID}</td>
                      <td className="py-2 px-3 border border-slate-300 font-semibold">{n.KELAS_ID}</td>
                      <td className="py-2 px-3 border border-slate-300 text-slate-700">{n.MATERI}</td>
                      <td className="py-2 px-3 border border-slate-300 font-medium text-teal-800">{n.JENIS_PENILAIAN}</td>
                      <td className="py-2 px-3 border border-slate-300 text-slate-600">{n.ASPEK}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-bold text-slate-900">{n.NILAI}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-bold">{n.PREDIKAT}</td>
                      <td className="py-2 px-3 border border-slate-300 text-[11px] text-slate-600">{n.KETERANGAN}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {reportType === 'presensi' && (
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border border-slate-300">No</th>
                  <th className="py-2.5 px-3 border border-slate-300">Tanggal</th>
                  <th className="py-2.5 px-3 border border-slate-300">Kelas</th>
                  <th className="py-2.5 px-3 border border-slate-300">Nama Murid</th>
                  <th className="py-2.5 px-3 border border-slate-300 text-center">Status</th>
                  <th className="py-2.5 px-3 border border-slate-300">Keterangan</th>
                  <th className="py-2.5 px-3 border border-slate-300 text-center">Waktu Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPresensi.map((p, idx) => (
                  <tr key={p.PRESENSI_ID}>
                    <td className="py-2 px-3 border border-slate-300 font-mono text-center">{idx + 1}</td>
                    <td className="py-2 px-3 border border-slate-300 font-mono">{p.TANGGAL}</td>
                    <td className="py-2 px-3 border border-slate-300 font-semibold">{p.KELAS_ID}</td>
                    <td className="py-2 px-3 border border-slate-300 font-bold text-slate-800">{p.NAMA_MURID}</td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-bold">{p.STATUS}</td>
                    <td className="py-2 px-3 border border-slate-300 text-slate-600">{p.KETERANGAN || '-'}</td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-mono text-[11px]">{p.WAKTU}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'murid' && (
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border border-slate-300">No</th>
                  <th className="py-2.5 px-3 border border-slate-300">NIS</th>
                  <th className="py-2.5 px-3 border border-slate-300">NISN</th>
                  <th className="py-2.5 px-3 border border-slate-300">Nama Peserta Didik</th>
                  <th className="py-2.5 px-3 border border-slate-300 text-center">JK</th>
                  <th className="py-2.5 px-3 border border-slate-300">Rombel Kelas</th>
                  <th className="py-2.5 px-3 border border-slate-300">Tahun Pelajaran</th>
                  <th className="py-2.5 px-3 border border-slate-300 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMurids.map((m, idx) => (
                  <tr key={m.MURID_ID}>
                    <td className="py-2 px-3 border border-slate-300 font-mono text-center">{idx + 1}</td>
                    <td className="py-2 px-3 border border-slate-300 font-mono font-bold">{m.NIS}</td>
                    <td className="py-2 px-3 border border-slate-300 font-mono text-slate-600">{m.NISN}</td>
                    <td className="py-2 px-3 border border-slate-300 font-bold text-slate-800">{m.NAMA_MURID}</td>
                    <td className="py-2 px-3 border border-slate-300 text-center">{m.JENIS_KELAMIN}</td>
                    <td className="py-2 px-3 border border-slate-300 font-semibold">{m.NAMA_KELAS}</td>
                    <td className="py-2 px-3 border border-slate-300">{m.TAHUN_PELAJARAN}</td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-bold">{m.STATUS}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'pembelajaran' && (
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border border-slate-300">No</th>
                  <th className="py-2.5 px-3 border border-slate-300">Materi & Topik</th>
                  <th className="py-2.5 px-3 border border-slate-300">Fase / Kelas</th>
                  <th className="py-2.5 px-3 border border-slate-300">Tujuan Pembelajaran</th>
                  <th className="py-2.5 px-3 border border-slate-300 text-center">Status</th>
                  <th className="py-2.5 px-3 border border-slate-300">Tanggal Rilis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {materi.map((mat, idx) => (
                  <tr key={mat.MATERI_ID}>
                    <td className="py-2 px-3 border border-slate-300 font-mono text-center">{idx + 1}</td>
                    <td className="py-2 px-3 border border-slate-300">
                      <div className="font-bold text-slate-800">{mat.JUDUL}</div>
                      <div className="text-[11px] text-teal-800">{mat.TOPIK}</div>
                    </td>
                    <td className="py-2 px-3 border border-slate-300 font-semibold">{mat.FASE} ({mat.KELAS})</td>
                    <td className="py-2 px-3 border border-slate-300 text-[11px] text-slate-600">{mat.TUJUAN_PEMBELAJARAN}</td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-bold">{mat.STATUS}</td>
                    <td className="py-2 px-3 border border-slate-300 font-mono text-[11px]">{mat.TANGGAL}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Tanda Tangan Resmi */}
        <div className="mt-12 flex justify-between text-xs text-slate-800 print:mt-16">
          <div className="text-center">
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah</p>
            <div className="h-20" />
            <p className="font-bold underline">Drs. H. I Wayan Sudarsana, M.M.</p>
            <p className="text-[11px] text-slate-500">NIP. 196803121994031004</p>
          </div>

          <div className="text-center">
            <p>Denpasar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">Guru Koordinator PJOK</p>
            <div className="h-20" />
            <p className="font-bold underline">I Ketut Suardana, S.Pd., M.Fis.</p>
            <p className="text-[11px] text-slate-500">NIP. 198205142008011005</p>
          </div>
        </div>
      </div>
    </div>
  );
};
