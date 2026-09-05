import React, { useState } from 'react';
import { CalendarCheck, Calendar, Save, CheckCheck, Users, Search, AlertCircle } from 'lucide-react';
import { storage } from '../../services/storage';
import { PresensiItem, PresensiStatus, SessionUser } from '../../types';

interface PresensiManagerProps {
  currentUser: SessionUser;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const PresensiManager: React.FC<PresensiManagerProps> = ({ currentUser, onShowToast }) => {
  const kelasList = storage.getKelas();
  const murids = storage.getMurid();

  const [selectedKelas, setSelectedKelas] = useState(
    currentUser.role === 'MURID' ? (currentUser.nama_kelas || 'XI-01') : (kelasList[0]?.KELAS_ID || 'XI-01')
  );
  const [selectedTanggal, setSelectedTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [presensiMap, setPresensiMap] = useState<Record<string, PresensiStatus>>({});
  const [keteranganMap, setKeteranganMap] = useState<Record<string, string>>({});

  const isTeacherOrAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'GURU';

  // Load existing presensi records for this class & date
  const loadClassPresensi = () => {
    const existing = storage.getPresensi().filter(
      p => p.KELAS_ID === selectedKelas && p.TANGGAL === selectedTanggal
    );

    const newPresensiMap: Record<string, PresensiStatus> = {};
    const newKeteranganMap: Record<string, string> = {};

    existing.forEach(p => {
      newPresensiMap[p.MURID_ID] = p.STATUS;
      newKeteranganMap[p.MURID_ID] = p.KETERANGAN || '';
    });

    setPresensiMap(newPresensiMap);
    setKeteranganMap(newKeteranganMap);
  };

  // Run on change of kelas or tanggal
  React.useEffect(() => {
    loadClassPresensi();
  }, [selectedKelas, selectedTanggal]);

  // Students in selected class
  const classStudents = murids.filter(
    m => m.KELAS_ID === selectedKelas && m.STATUS === 'AKTIF'
  );

  const handleSetStatus = (muridId: string, status: PresensiStatus) => {
    setPresensiMap(prev => ({ ...prev, [muridId]: status }));
  };

  const handleSetAllHadir = () => {
    const map: Record<string, PresensiStatus> = {};
    classStudents.forEach(s => {
      map[s.MURID_ID] = 'HADIR';
    });
    setPresensiMap(map);
    onShowToast('Semua siswa ditandai HADIR!', 'info');
  };

  const handleSavePresensi = () => {
    classStudents.forEach(s => {
      const status = presensiMap[s.MURID_ID] || 'HADIR';
      const keterangan = keteranganMap[s.MURID_ID] || '';

      storage.recordPresensi({
        TANGGAL: selectedTanggal,
        KELAS_ID: selectedKelas,
        MURID_ID: s.MURID_ID,
        NAMA_MURID: s.NAMA_MURID,
        STATUS: status,
        KETERANGAN: keterangan,
        WAKTU: new Date().toTimeString().slice(0, 5)
      });
    });

    onShowToast(`Presensi kelas ${selectedKelas} tanggal ${selectedTanggal} berhasil disimpan!`, 'success');
  };

  // If student is viewing, show their own attendance record
  if (currentUser.role === 'MURID') {
    const myPresensiList = storage.getPresensi().filter(p => p.MURID_ID === currentUser.ref_id);
    const myHadir = myPresensiList.filter(p => p.STATUS === 'HADIR').length;
    const rate = myPresensiList.length > 0 ? Math.round((myHadir / myPresensiList.length) * 100) : 100;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Presensi Kehadiran Saya</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Riwayat presensi saat pertemuan PJOK di lapangan & kelas teori
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400">Total Pertemuan</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{myPresensiList.length}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-emerald-600">Hadir</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{myHadir}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-blue-600">Izin / Sakit</span>
            <div className="text-2xl font-black text-blue-700 mt-1">
              {myPresensiList.filter(p => p.STATUS === 'IZIN' || p.STATUS === 'SAKIT').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-teal-600">Persentase</span>
            <div className="text-2xl font-black text-teal-800 mt-1">{rate}%</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {myPresensiList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Belum ada data presensi.
                  </td>
                </tr>
              ) : (
                myPresensiList.map(p => (
                  <tr key={p.PRESENSI_ID}>
                    <td className="py-3 px-4 font-mono font-bold">{p.TANGGAL}</td>
                    <td className="py-3 px-4">{p.KELAS_ID}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.STATUS === 'HADIR' ? 'bg-emerald-100 text-emerald-800' :
                        p.STATUS === 'IZIN' ? 'bg-blue-100 text-blue-800' :
                        p.STATUS === 'SAKIT' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.STATUS}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{p.KETERANGAN || '-'}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{p.WAKTU}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Presensi Harian Siswa PJOK</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan presensi kehadiran lapangan (H, S, I, A) langsung tersinkron ke Sheet <code>15_PRESENSI</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSetAllHadir}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" /> Tandai Semua Hadir
          </button>
          <button
            onClick={handleSavePresensi}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" /> Simpan Presensi
          </button>
        </div>
      </div>

      {/* Selector: Rombel Kelas & Tanggal */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Pilih Kelas:</span>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-teal-800 outline-none focus:ring-2 focus:ring-teal-600"
            >
              {kelasList.map(k => (
                <option key={k.KELAS_ID} value={k.KELAS_ID}>{k.NAMA_KELAS}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Tanggal:</span>
            <input
              type="date"
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-600"
            >
            </input>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Peserta Terdaftar: <strong className="text-slate-800">{classStudents.length} Siswa</strong>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-12">No</th>
                <th className="py-3.5 px-4">NIS</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4 text-center">JK</th>
                <th className="py-3.5 px-4 text-center">Status Presensi</th>
                <th className="py-3.5 px-4">Keterangan / Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Tidak ada siswa yang terdaftar di kelas {selectedKelas}.
                  </td>
                </tr>
              ) : (
                classStudents.map((s, idx) => {
                  const status = presensiMap[s.MURID_ID] || 'HADIR';
                  return (
                    <tr key={s.MURID_ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{s.NIS}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{s.NAMA_MURID}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.JENIS_KELAMIN === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {s.JENIS_KELAMIN}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                          {(['HADIR', 'SAKIT', 'IZIN', 'ALPA'] as const).map(st => {
                            const active = status === st;
                            let color = 'text-slate-600 hover:text-slate-900';
                            if (active) {
                              if (st === 'HADIR') color = 'bg-emerald-600 text-white shadow-xs font-bold';
                              if (st === 'SAKIT') color = 'bg-amber-500 text-white shadow-xs font-bold';
                              if (st === 'IZIN') color = 'bg-blue-600 text-white shadow-xs font-bold';
                              if (st === 'ALPA') color = 'bg-rose-600 text-white shadow-xs font-bold';
                            }
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleSetStatus(s.MURID_ID, st)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wide transition-all ${color}`}
                              >
                                {st === 'HADIR' ? 'Hadir' : st === 'SAKIT' ? 'Sakit' : st === 'IZIN' ? 'Izin' : 'Alpa'}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          value={keteranganMap[s.MURID_ID] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setKeteranganMap(prev => ({ ...prev, [s.MURID_ID]: val }));
                          }}
                          placeholder="Catatan surat sakit / alasan izin..."
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 outline-none"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
