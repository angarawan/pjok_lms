import React, { useState } from 'react';
import { Activity, Search, Trash2, Filter } from 'lucide-react';
import { storage } from '../../services/storage';
import { LogAktivitasItem } from '../../types';

interface AdminLogsProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminLogs: React.FC<AdminLogsProps> = ({ onShowToast }) => {
  const [logs, setLogs] = useState<LogAktivitasItem[]>(storage.getLogAktivitas());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredLogs = logs.filter(l => {
    const q = (search || '').toLowerCase();
    const matchSearch =
      (l.NAMA || '').toLowerCase().includes(q) ||
      (l.AKTIVITAS || '').toLowerCase().includes(q) ||
      (l.DETAIL || '').toLowerCase().includes(q);
    const matchRole = roleFilter === 'ALL' || l.ROLE === roleFilter;
    return matchSearch && matchRole;
  });

  const handleClearLogs = () => {
    if (confirm('Bersihkan riwayat log aktivitas? (Sheet 19_LOG_AKTIVITAS)')) {
      const db = storage.getDatabase();
      db['19_LOG_AKTIVITAS'] = [];
      storage.saveDatabase(db);
      setLogs([]);
      onShowToast('Log aktivitas berhasil dibersihkan.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Audit Trail & Log Aktivitas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Catatan riwayat interaksi pengguna dan perubahan sistem (Sheet <code>19_LOG_AKTIVITAS</code>)
          </p>
        </div>
        <button
          onClick={handleClearLogs}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-4 h-4" /> Bersihkan Log
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari dalam log aktivitas..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          <option value="ALL">Semua Peran</option>
          <option value="ADMIN">Admin</option>
          <option value="GURU">Guru</option>
          <option value="MURID">Murid</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Log ID</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4">Peran</th>
                <th className="py-3.5 px-4">Aktivitas</th>
                <th className="py-3.5 px-4">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Tidak ada catatan log aktivitas.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.LOG_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{log.LOG_ID}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">{log.WAKTU}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{log.NAMA}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.ROLE === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' :
                        log.ROLE === 'GURU' ? 'bg-teal-100 text-teal-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {log.ROLE}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{log.AKTIVITAS}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{log.DETAIL}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
