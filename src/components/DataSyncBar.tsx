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
} from 'lucide-react';

interface DataSyncBarProps {
  liveInmates: Inmate[];
  dummyInmates: Inmate[];
  liveBlok: BlokHunian[];
  dummyBlok: BlokHunian[];
  onOpenSyncModal: () => void;
  onQuickSyncToDummy: () => void;
  selectedBlok: string;
}

export const DataSyncBar: React.FC<DataSyncBarProps> = ({
  liveInmates,
  dummyInmates,
  liveBlok,
  dummyBlok,
  onOpenSyncModal,
  onQuickSyncToDummy,
  selectedBlok,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleQuickSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onQuickSyncToDummy();
      setIsSyncing(false);
      setToastMessage('Data Live berhasil disinkronkan kembali dengan Data Dami Master Lapas!');
      setTimeout(() => setToastMessage(null), 3500);
    }, 400);
  };

  const isMatched =
    liveInmates.length === dummyInmates.length && liveBlok.length === dummyBlok.length;

  return (
    <div className="relative bg-[#09203d]/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3.5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Indicator & Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 shrink-0">
            <Database className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#09203d] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-condensed tracking-wider uppercase text-white">
                STATUS SINKRONISASI DATA (LIVE & DAMI)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-blue-950 border border-amber-300 shadow-xs">
                <CheckCircle2 className="w-2.5 h-2.5 text-blue-700" />
                {isMatched ? 'TERSINKRON' : 'DATA LIVE DIMODIFIKASI'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-200 mt-0.5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Live: <strong className="text-white font-mono">{liveInmates.length} WBP</strong>{' '}
                <span className="text-slate-300">(Dami: {dummyInmates.length})</span>
              </span>

              <span className="text-amber-500/40 hidden sm:inline">•</span>

              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Blok: <strong className="text-white font-mono">{liveBlok.length} Blok</strong>{' '}
                <span className="text-slate-300">({liveBlok.map((b) => b.nama.replace('BLOK ', '')).join(', ')})</span>
              </span>

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
            title="Buka perbandingan detail data Live vs Data Dami"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300" />
            <span>Detail Sinkron</span>
          </button>

          <button
            onClick={handleQuickSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 border border-amber-200 transition shadow-md shadow-amber-500/20 disabled:opacity-50"
            title="Sinkronkan ulang data live ke dataset dami master Lapas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyelaraskan...' : 'Sinkronkan ke Dami'}</span>
          </button>

        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mt-2.5 p-2 bg-emerald-900/90 border border-emerald-400/60 text-emerald-100 text-xs rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
          <div className="flex items-center gap-2">
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
