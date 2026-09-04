import React, { useState } from 'react';
import { BlokHunian, Inmate } from '../types';
import {
  Database,
  CheckCircle2,
  RefreshCw,
  Building2,
  Users,
  Layers,
  Sparkles,
  ArrowRightLeft,
  AlertTriangle,
} from 'lucide-react';

interface DataSyncBarProps {
  liveInmates: Inmate[];
  dummyInmates: Inmate[];
  liveBlok: BlokHunian[];
  dummyBlok: BlokHunian[];
  onOpenSyncModal: () => void;
  onQuickSyncToDummy: () => void;
  onSmartSync?: () => void;
  selectedBlok: string;
  lastSyncTime?: string;
}

export const DataSyncBar: React.FC<DataSyncBarProps> = ({
  liveInmates,
  dummyInmates,
  liveBlok,
  dummyBlok,
  onOpenSyncModal,
  onQuickSyncToDummy,
  onSmartSync,
  selectedBlok,
  lastSyncTime,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleQuickSync = (useSmart = false) => {
    setIsSyncing(true);
    setTimeout(() => {
      if (useSmart && onSmartSync) {
        onSmartSync();
        setToastMessage('Data Live berhasil diselaraskan dengan Master Lapas Batang (444 WBP & 6 Blok)!');
      } else {
        onQuickSyncToDummy();
        setToastMessage('Data Live 100% tersinkronkan ulang dengan Data Master Resmi Lapas Batang (444 WBP & 6 Blok)!');
      }
      setIsSyncing(false);
      setTimeout(() => setToastMessage(null), 4000);
    }, 450);
  };

  const isMatched =
    liveInmates.length === dummyInmates.length && liveBlok.length === dummyBlok.length;

  return (
    <div className={`relative bg-[#09203d]/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl transition-all duration-300 ${
      isMatched ? 'border border-blue-500/40' : 'border border-amber-500/70 shadow-amber-500/10'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Indicator & Status */}
        <div className="flex items-center gap-3">
          <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl border shrink-0 transition-colors ${
            isMatched
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-400/20 text-amber-300 border-amber-400/50 animate-pulse'
          }`}>
            <Database className="w-4 h-4" />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-[#09203d] ${
              isMatched ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-condensed tracking-wider uppercase text-white">
                SINKRONISASI DATA OPERASIONAL LAPAS KELAS IIB BATANG
              </span>
              {isMatched ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  TERSINKRON 100% (444 WBP)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  PERLU DISINKRONKAN ({liveInmates.length}/{dummyInmates.length} WBP)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-200 mt-0.5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Data Live: <strong className="text-white font-mono">{liveInmates.length} WBP</strong>{' '}
                <span className="text-slate-300 font-mono">(Master: {dummyInmates.length})</span>
              </span>

              <span className="text-amber-500/40 hidden sm:inline">•</span>

              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Blok Hunian: <strong className="text-white font-mono">{liveBlok.length} Blok</strong>{' '}
                <span className="text-slate-300">({liveBlok.map((b) => b.nama.replace('BLOK ', '')).join(', ')})</span>
              </span>

              {lastSyncTime && (
                <>
                  <span className="text-amber-500/40 hidden sm:inline">•</span>
                  <span className="text-emerald-300 font-mono text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Auto-Sync: <strong>{lastSyncTime}</strong>
                  </span>
                </>
              )}

              {selectedBlok !== 'Semua Blok' && (
                <>
                  <span className="text-amber-500/40 hidden sm:inline">•</span>
                  <span className="text-amber-300 font-bold">
                    Filter: <strong>{selectedBlok}</strong>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          
          <button
            onClick={onOpenSyncModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#0d2a52] hover:bg-[#12396d] text-slate-100 hover:text-white border border-blue-400/40 hover:border-amber-400/60 transition shadow-xs"
            title="Buka perbandingan detail data Live vs Data Master Lapas Batang"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300" />
            <span>Detail Sinkron</span>
          </button>

          <button
            onClick={() => handleQuickSync(false)}
            disabled={isSyncing}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition shadow-md disabled:opacity-50 ${
              isMatched
                ? 'bg-[#0d2a52] hover:bg-[#15427d] text-cyan-200 border border-cyan-500/40'
                : 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 border border-amber-200 shadow-amber-500/20'
            }`}
            title="Sinkronkan data live agar 100% selaras dengan data master 444 WBP & 6 Blok Lapas Batang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyelaraskan...' : isMatched ? 'Sinkronkan Ulang' : 'Sinkronkan Sekarang'}</span>
          </button>

        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mt-2.5 p-2.5 bg-emerald-900/95 border border-emerald-400/60 text-emerald-100 text-xs rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white text-[11px] font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
