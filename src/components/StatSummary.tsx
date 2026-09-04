import React from 'react';
import { Inmate } from '../types';
import { Users, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface StatSummaryProps {
  inmates: Inmate[];
  onFilterAlerts: () => void;
}

export const StatSummary: React.FC<StatSummaryProps> = ({ inmates, onFilterAlerts }) => {
  const total = inmates.length;
  const tahananCount = inmates.filter((i) => i.status === 'Tahanan').length;
  const wbpCount = inmates.filter((i) => i.status === 'Warga Binaan').length;

  const lengkapLayak = inmates.filter((i) => {
    const isOver = i.pakaianList?.some((p) => p.jumlah > p.maxJumlah);
    const isKurang = i.pakaianList?.some((p) => p.jumlah < p.maxJumlah);
    const isRusak = i.kondisiBaju === 'Perlu Ganti' || i.kondisiBaju === 'Rusak/Sobek';
    const hasSitaan = i.bajuTerlarangDisita > 0;
    return !isOver && !isKurang && !isRusak && !hasSitaan;
  }).length;

  const butuhPergantian = inmates.filter((i) => {
    const isOver = i.pakaianList?.some((p) => p.jumlah > p.maxJumlah);
    const isKurang = i.pakaianList?.some((p) => p.jumlah < p.maxJumlah);
    const isRusak = i.kondisiBaju === 'Perlu Ganti' || i.kondisiBaju === 'Rusak/Sobek';
    return isOver || isKurang || isRusak;
  }).length;

  const totalSitaan = inmates.reduce((acc, curr) => acc + (curr.bajuTerlarangDisita || 0), 0);
  const inmateWithSitaan = inmates.filter((i) => i.bajuTerlarangDisita > 0).length;

  const persentaseKepatuhan = total > 0 ? Math.round((lengkapLayak / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Tahanan & WBP */}
      <div className="relative bg-[#09203d]/95 backdrop-blur-md rounded-2xl border border-blue-900/60 border-t-3 border-t-amber-400 p-4 shadow-xl flex flex-col justify-between overflow-hidden group hover:border-amber-400/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-condensed">
            TOTAL HUNIAN TERDATA
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-3xl font-black font-condensed tracking-wider text-white">
            {total} <span className="text-sm font-normal text-slate-300 font-sans">Jiwa</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-white text-blue-950 font-bold border border-amber-300/60 shadow-xs">
              WBP: {wbpCount}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-200 font-bold border border-amber-400/40">
              Tahanan: {tahananCount}
            </span>
          </div>
        </div>
      </div>

      {/* Seragam Lengkap & Layak */}
      <div className="relative bg-[#09203d]/95 backdrop-blur-md rounded-2xl border border-blue-900/60 border-t-3 border-t-emerald-400 p-4 shadow-xl flex flex-col justify-between overflow-hidden group hover:border-emerald-400/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-condensed">
            SANDANG LENGKAP & LAYAK
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-3xl font-black font-condensed tracking-wider text-white">
            {lengkapLayak} <span className="text-sm font-normal text-slate-300 font-sans">Orang</span>
          </div>
          <div className="mt-2.5 text-xs text-slate-200 flex items-center gap-1.5 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {persentaseKepatuhan}%
            </span>
            <span>Standar Ditjenpas</span>
          </div>
        </div>
      </div>

      {/* Perlu Ganti / Butuh Tukar */}
      <div 
        onClick={onFilterAlerts}
        className="relative bg-[#0c274b]/95 backdrop-blur-md rounded-2xl border-2 border-amber-400 p-4 shadow-xl shadow-amber-500/10 flex flex-col justify-between cursor-pointer hover:bg-[#103463] hover:scale-[1.01] transition group overflow-hidden"
        title="Klik untuk menyaring yang butuh pergantian atau penukaran baju"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider font-condensed flex items-center gap-1.5">
            PERLU TUKAR / KURANG
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm group-hover:rotate-45 transition duration-300">
            <RefreshCw className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-3xl font-black font-condensed tracking-wider text-amber-300">
            {butuhPergantian} <span className="text-sm font-normal text-amber-100 font-sans">Penghuni</span>
          </div>
          <div className="mt-2.5 text-xs text-amber-200/90 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Maksimal kuota / sobek / perlu ganti</span>
          </div>
        </div>
      </div>

      {/* Baju Sitaan / Pelanggaran Kamtib */}
      <div className="relative bg-[#09203d]/95 backdrop-blur-md rounded-2xl border border-blue-900/60 border-t-3 border-t-rose-400 p-4 shadow-xl flex flex-col justify-between overflow-hidden group hover:border-rose-400/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-condensed">
            BAJU BERLEBIH / SITAAN
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-3xl font-black font-condensed tracking-wider text-white">
            {totalSitaan} <span className="text-sm font-normal text-slate-300 font-sans">Pcs</span>
          </div>
          <div className="mt-2.5 text-xs text-slate-200">
            Dari <span className="font-bold text-amber-300">{inmateWithSitaan}</span> penghuni (diamankan)
          </div>
        </div>
      </div>
    </div>
  );
};
