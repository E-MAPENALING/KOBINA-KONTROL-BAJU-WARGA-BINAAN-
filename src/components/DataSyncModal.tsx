import React, { useState } from 'react';
import { BlokHunian, Inmate } from '../types';
import {
  X,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Layers,
  ShieldCheck,
  ArrowRightLeft,
  Info,
} from 'lucide-react';
import { getAllRoomsGroupedByBlok } from '../utils/kamarHelper';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveInmates: Inmate[];
  dummyInmates: Inmate[];
  liveBlok: BlokHunian[];
  dummyBlok: BlokHunian[];
  onSyncToDummy: () => void;
  lastSyncTime?: string;
}

export const DataSyncModal: React.FC<DataSyncModalProps> = ({
  isOpen,
  onClose,
  liveInmates,
  dummyInmates,
  liveBlok,
  dummyBlok,
  onSyncToDummy,
  lastSyncTime,
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'tahanan' | 'blok'>('ringkasan');
  const [confirmSync, setConfirmSync] = useState(false);

  if (!isOpen) return null;

  // Comparison metrics
  const isCountMatched = liveInmates.length === dummyInmates.length;
  const isBlokCountMatched = liveBlok.length === dummyBlok.length;

  const roomGroups = getAllRoomsGroupedByBlok(liveBlok, liveInmates);
  const totalSpecificRooms = roomGroups.reduce((acc, g) => acc + g.kamarList.length, 0);

  const handleExecuteSync = () => {
    onSyncToDummy();
    setConfirmSync(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#082231] rounded-2xl shadow-2xl w-full max-w-4xl border border-[#144963] overflow-hidden my-6 text-white animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#061824] p-5 flex items-center justify-between border-b border-[#144963]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-condensed tracking-wider text-white uppercase">
                  SINKRONISASI DATA LIVE & DATA DAMI
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Penyelarasan data operasional (Live) dengan master referensi Lapas (Data Dami)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Summary Banner */}
        <div className="bg-gradient-to-r from-[#072538] via-[#09334d] to-[#072538] p-4 border-b border-[#144963]/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Metric 1: Total WBP */}
            <div className="bg-[#061824]/80 p-3 rounded-xl border border-[#144963]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> WBP / Tahanan
                </span>
                {isCountMatched ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Cocok
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Berbeda
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-bold font-mono text-cyan-300">{liveInmates.length}</span>
                  <span className="text-xs text-slate-400 ml-1">Live</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-slate-300">{dummyInmates.length}</span>
                  <span className="text-[10px] text-slate-400 ml-1">Dami</span>
                </div>
              </div>
            </div>

            {/* Metric 2: Blok Hunian */}
            <div className="bg-[#061824]/80 p-3 rounded-xl border border-[#144963]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Blok Hunian
                </span>
                {isBlokCountMatched ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Terpadu
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Berbeda
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-bold font-mono text-cyan-300">{liveBlok.length}</span>
                  <span className="text-xs text-slate-400 ml-1">Live</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-slate-300">{dummyBlok.length}</span>
                  <span className="text-[10px] text-slate-400 ml-1">Dami</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Kamar Spesifik */}
            <div className="bg-[#061824]/80 p-3 rounded-xl border border-[#144963]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Kamar Spesifik
                </span>
                <span className="text-[10px] font-bold text-cyan-300">
                  {roomGroups.length} Klaster
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-bold font-mono text-cyan-300">{totalSpecificRooms}</span>
                  <span className="text-xs text-slate-400 ml-1">Kamar Aktif</span>
                </div>
                <div className="text-[10px] text-emerald-400 text-right font-medium">
                  Tersinkron Blok
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#144963]/80 bg-[#061824]">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition font-condensed tracking-wider uppercase border-t border-x ${
              activeTab === 'ringkasan'
                ? 'bg-[#082231] text-cyan-300 border-[#144963] border-b-[#082231]'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            Ringkasan & Sinkronisasi
          </button>
          <button
            onClick={() => setActiveTab('tahanan')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition font-condensed tracking-wider uppercase border-t border-x ${
              activeTab === 'tahanan'
                ? 'bg-[#082231] text-cyan-300 border-[#144963] border-b-[#082231]'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            Data WBP (Live vs Dami)
          </button>
          <button
            onClick={() => setActiveTab('blok')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition font-condensed tracking-wider uppercase border-t border-x ${
              activeTab === 'blok'
                ? 'bg-[#082231] text-cyan-300 border-[#144963] border-b-[#082231]'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            Kamar Spesifik per Blok
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[420px] overflow-y-auto space-y-4">
          
          {/* TAB 1: Ringkasan */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3 text-xs">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm">
                    Mekanisme Sinkronisasi Data KOBINA
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Sistem memelihara sinkronisasi antara <strong>Data Live</strong> (disimpan di browser Anda) dengan <strong>Data Dami Master</strong> Lapas. Seluruh data tahanan/WBP secara otomatis dikaitkan dengan blok hunian resmi (<span className="text-cyan-300">BLOK ANGREK, BLOK B, BLOK C, BLOK D, BLOK E, BLOK F</span>).
                  </p>
                  {lastSyncTime && (
                    <div className="text-[11px] text-cyan-300/80 font-mono mt-1">
                      Waktu Sinkronisasi Terakhir: {lastSyncTime}
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison Details Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Column Live */}
                <div className="p-4 rounded-xl bg-[#061824] border border-[#144963] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#144963]">
                    <span className="font-bold text-cyan-300 text-xs uppercase tracking-wider font-condensed">
                      DATA LIVE (OPERASIONAL)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                      Aktif di Layar
                    </span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li className="flex justify-between">
                      <span className="text-slate-400">Total Penghuni:</span>
                      <strong className="text-white font-mono">{liveInmates.length} Orang</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Total Blok Hunian:</span>
                      <strong className="text-white font-mono">{liveBlok.length} Blok</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Kamar Spesifik Aktif:</span>
                      <strong className="text-white font-mono">{totalSpecificRooms} Kamar</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Penyimpanan:</span>
                      <strong className="text-emerald-400">Local Storage (Persisten)</strong>
                    </li>
                  </ul>
                </div>

                {/* Column Dummy Master */}
                <div className="p-4 rounded-xl bg-[#061824] border border-[#144963] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#144963]">
                    <span className="font-bold text-amber-300 text-xs uppercase tracking-wider font-condensed">
                      DATA DAMI (MASTER BAWAAN)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      Standar Referensi
                    </span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li className="flex justify-between">
                      <span className="text-slate-400">Total Penghuni Standar:</span>
                      <strong className="text-white font-mono">{dummyInmates.length} Orang</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Blok Hunian Bawaan:</span>
                      <strong className="text-white font-mono">{dummyBlok.length} Blok</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Daftar Blok Acuan:</span>
                      <span className="text-[11px] text-cyan-300 truncate max-w-[180px]">
                        {dummyBlok.map((b) => b.nama).join(', ')}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Status Validasi:</span>
                      <strong className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi Lapas
                      </strong>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Sync Action Area */}
              <div className="p-4 rounded-xl bg-[#061824] border border-[#144963] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white">
                    Sinkronkan Ulang ke Data Dami Standar
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Mengembalikan 10 data WBP dan 6 Blok standar jika data live Anda terhapus atau ingin di-reset.
                  </div>
                </div>

                {!confirmSync ? (
                  <button
                    onClick={() => setConfirmSync(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600/80 hover:bg-amber-600 text-white border border-amber-500/40 flex items-center gap-1.5 transition shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sinkronkan ke Data Dami</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmSync(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleExecuteSync}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-lg shadow-rose-950/50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Konfirmasi Sinkron
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Data Tahanan Live vs Dami */}
          {activeTab === 'tahanan' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Daftar tahanan/WBP live yang disinkronkan dengan kamar spesifik dan kuota pakaian:
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#144963]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#061824] text-slate-300 uppercase tracking-wider font-condensed border-b border-[#144963]">
                    <tr>
                      <th className="py-2.5 px-3">No. Register</th>
                      <th className="py-2.5 px-3">Nama WBP</th>
                      <th className="py-2.5 px-3">Blok</th>
                      <th className="py-2.5 px-3">Kamar Spesifik</th>
                      <th className="py-2.5 px-3">Baju</th>
                      <th className="py-2.5 px-3">Status Sandang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#144963]/50 font-sans">
                    {liveInmates.map((inmate) => (
                      <tr key={inmate.id} className="hover:bg-[#0c354e]/40 transition">
                        <td className="py-2 px-3 font-mono text-cyan-300">{inmate.noRegister}</td>
                        <td className="py-2 px-3 font-bold text-white">{inmate.nama}</td>
                        <td className="py-2 px-3 font-condensed font-bold text-slate-200">{inmate.blok}</td>
                        <td className="py-2 px-3 font-mono text-cyan-200">{inmate.kamarHunian}</td>
                        <td className="py-2 px-3 font-mono">{inmate.jumlahBajuMilik} stel</td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              inmate.statusKelayakan === 'Memenuhi Syarat'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {inmate.statusKelayakan}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Kamar Spesifik per Blok */}
          {activeTab === 'blok' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Pemetaan kamar hunian spesifik yang terhubung secara dinamis dengan setiap blok:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roomGroups.map((group) => {
                  const occupantsInBlok = liveInmates.filter(
                    (i) => i.blok?.toLowerCase() === group.blok.toLowerCase()
                  );

                  return (
                    <div
                      key={group.blok}
                      className="bg-[#061824] p-3.5 rounded-xl border border-[#144963] space-y-2.5"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#144963]/80">
                        <span className="font-bold text-sm text-cyan-300 uppercase font-condensed tracking-wider">
                          {group.blok}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 font-mono">
                          {occupantsInBlok.length} WBP
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        <span className="text-[11px] text-slate-400 block mb-1">
                          Kamar Spesifik Tersedia:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {group.kamarList.map((kamar) => {
                            const count = liveInmates.filter((i) => i.kamarHunian === kamar).length;
                            return (
                              <span
                                key={kamar}
                                className={`text-[11px] px-2 py-1 rounded-lg border font-mono ${
                                  count > 0
                                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-bold'
                                    : 'bg-[#082231] text-slate-400 border-slate-700/50'
                                }`}
                              >
                                {kamar.replace(`${group.blok} - `, '')}{' '}
                                {count > 0 && `(${count})`}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#061824] p-4 flex items-center justify-between border-t border-[#144963] text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Data live disimpan di penyimpanan lokal browser</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#082231] hover:bg-[#0c354e] text-white border border-[#144963] transition font-semibold"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
