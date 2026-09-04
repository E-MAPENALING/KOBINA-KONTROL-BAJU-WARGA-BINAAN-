import React from 'react';
import { ShieldCheck, Plus, ClipboardCheck, Printer, RefreshCw, Shirt, Building2, DoorOpen, ArrowRightLeft } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenKamarInspect: () => void;
  onOpenPrintModal: () => void;
  onOpenKelolaBlok: () => void;
  onOpenDetailKamar?: () => void;
  onOpenMutasi?: () => void;
  onResetData: () => void;
  totalInmates: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenKamarInspect,
  onOpenPrintModal,
  onOpenKelolaBlok,
  onOpenDetailKamar,
  onOpenMutasi,
  onResetData,
  totalInmates,
}) => {
  return (
    <header className="relative bg-[#081d39]/95 backdrop-blur-md border-b-2 border-amber-500/40 shadow-2xl overflow-hidden">
      
      {/* Top Background Pattern & Subtle Gold / Royal Blue Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(to_right,#f59e0b18_1px,transparent_1px),linear-gradient(to_bottom,#3b82f618_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="absolute top-0 right-1/4 w-96 h-28 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-28 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Gold Header Top Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-amber-400 to-blue-700" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          
          {/* Main Title / Brand Area: Royal Blue, White & Gold Institutional Branding */}
          <div className="relative pl-5 pt-2.5 pb-2 border-l-3 border-t-3 border-amber-400 rounded-tl-2xl pr-6 shadow-sm">
            
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-condensed tracking-wider text-white uppercase drop-shadow-[0_2px_14px_rgba(245,158,11,0.25)]">
                KOBINA
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/50 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> SISTEM KONTROL SANDANG
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm sm:text-base md:text-lg font-extrabold font-condensed tracking-widest text-white uppercase drop-shadow-sm">
                KONTROL BAJU WARGA BINAAN
              </p>
              <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="hidden md:inline-block text-xs text-amber-200/90 font-medium tracking-wide">
                Lapas Kelas IIB Batang • {totalInmates} WBP Terdaftar
              </span>
            </div>
          </div>

          {/* Action Toolbar: White & Gold Accented Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {onOpenDetailKamar && (
              <button
                id="btn-detail-kamar"
                onClick={onOpenDetailKamar}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#0b274e] hover:bg-[#10376d] text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 transition shadow-sm"
                title="Detail, Edit, dan Kelola Kamar Hunian per Blok"
              >
                <DoorOpen className="w-4 h-4 text-amber-400" />
                <span>Detail Kamar</span>
              </button>
            )}

            <button
              id="btn-kelola-blok"
              onClick={onOpenKelolaBlok}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#0b274e] hover:bg-[#10376d] text-slate-100 hover:text-white border border-blue-400/40 hover:border-amber-400/70 transition shadow-sm"
              title="Kelola, Tambah, Edit, dan Hapus Blok Hunian"
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Kelola Blok</span>
            </button>

            {onOpenMutasi && (
              <button
                id="btn-mutasi-kamar"
                onClick={onOpenMutasi}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#092242] hover:bg-[#0e315d] text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 transition shadow-sm"
                title="Mutasi & Pemindahan Kamar/Blok Warga Binaan"
              >
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span>Mutasi Kamar</span>
              </button>
            )}

            <button
              id="btn-inspeksi-kamar"
              onClick={onOpenKamarInspect}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 text-[#081d39] border-2 border-amber-400 shadow-md shadow-amber-500/10 transition hover:scale-[1.02]"
              title="Periksa pakaian serentak per kamar hunian"
            >
              <ClipboardCheck className="w-4 h-4 text-amber-600" />
              <span>Sidak Kamar</span>
            </button>

            <button
              id="btn-cetak-laporan"
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#0b274e] hover:bg-[#10376d] text-amber-200 hover:text-white border border-amber-500/40 hover:border-amber-400 transition shadow-sm"
              title="Cetak Berita Acara & Kartu Kontrol Sandang"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak Laporan</span>
            </button>

            <button
              id="btn-tambah-inmate"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 transition shadow-lg shadow-amber-500/25 border border-amber-200 font-sans tracking-wide"
              title="Registrasi Baju Tahanan/Narapidana Baru"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Registrasi Baju</span>
            </button>

            <button
              id="btn-reset-data"
              onClick={onResetData}
              className="inline-flex items-center p-2 text-xs font-medium rounded-xl bg-[#0b274e] hover:bg-[#10376d] text-slate-300 hover:text-amber-300 border border-blue-400/30 hover:border-amber-400/50 transition"
              title="Kembalikan ke data awal Lapas"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
