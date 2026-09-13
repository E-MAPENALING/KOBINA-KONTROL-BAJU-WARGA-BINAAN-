import React, { useState, useMemo } from 'react';
import { Inmate } from '../types';
import { 
  Shirt, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  FileText, 
  Printer,
  Edit3, 
  Trash2, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  UserX,
  UserCheck
} from 'lucide-react';

interface InmateCardViewProps {
  inmates: Inmate[];
  onOpenDetail: (inmate: Inmate) => void;
  onOpenQuickControl: (inmate: Inmate) => void;
  onOpenEdit: (inmate: Inmate) => void;
  onDelete: (id: string, nama: string) => void;
  onOpenTukarPakaian: (inmate: Inmate) => void;
  onOpenMutasi?: (inmate: Inmate) => void;
  onOpenCetakKartu?: (inmate: Inmate) => void;
  onOpenNonaktifkanBebas?: (inmate: Inmate) => void;
  onAktifkanKembali?: (inmateId: string) => void;
}

export const InmateCardView: React.FC<InmateCardViewProps> = ({
  inmates,
  onOpenDetail,
  onOpenQuickControl,
  onOpenEdit,
  onDelete,
  onOpenTukarPakaian,
  onOpenMutasi,
  onOpenCetakKartu,
  onOpenNonaktifkanBebas,
  onAktifkanKembali,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(24);

  // Reset to page 1 on inmates length change
  useMemo(() => {
    setCurrentPage(1);
  }, [inmates.length]);

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(inmates.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedInmates = useMemo(() => {
    if (pageSize === -1) return inmates;
    const startIndex = (validPage - 1) * pageSize;
    return inmates.slice(startIndex, startIndex + pageSize);
  }, [inmates, validPage, pageSize]);

  if (inmates.length === 0) {
    return null;
  }

  const startIndex = pageSize === -1 ? 0 : (validPage - 1) * pageSize;
  const endIndex = pageSize === -1 ? inmates.length : Math.min(startIndex + pageSize, inmates.length);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedInmates.map((inmate) => {
          const pakaianList = inmate.pakaianList || [];
          const itemsOver = pakaianList.filter((p) => p.jumlah > p.maxJumlah);
          const isOver = itemsOver.length > 0;
          const hasSitaan = inmate.bajuTerlarangDisita > 0;

          return (
            <div
              key={inmate.id}
              className="bg-[#09203d]/95 backdrop-blur-md rounded-2xl border border-blue-900/70 p-4 shadow-xl hover:border-amber-400/60 hover:bg-[#0c284e] transition flex flex-col justify-between"
            >
              <div>
                {/* Header card: Status & Room */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold font-condensed tracking-wider shadow-2xs ${
                      inmate.status === 'Tahanan'
                        ? 'bg-amber-400/25 text-amber-300 border border-amber-400/60'
                        : 'bg-white text-blue-950 font-black border border-blue-300'
                    }`}>
                      {inmate.status}
                    </span>
                    {inmate.statusKeaktifan === 'Bebas' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold font-condensed tracking-wider bg-rose-500/25 text-rose-300 border border-rose-500/60 shadow-2xs">
                        BEBAS
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-amber-300 bg-[#07182e] px-2.5 py-0.5 rounded-lg border border-blue-800/60 font-condensed tracking-wider">
                      {inmate.kamarHunian}
                    </span>
                    {inmate.lokasiSel && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-950 text-cyan-300 border border-blue-800 font-mono font-bold">
                        {inmate.lokasiSel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Inmate info */}
                <div className="mt-3">
                  <h4 className="text-lg font-bold text-white leading-tight font-condensed tracking-wide">
                    {inmate.nama}
                    {inmate.alias && (
                      <span className="text-xs font-normal text-slate-300 ml-1.5 italic font-sans">
                        alias {inmate.alias}
                      </span>
                    )}
                  </h4>
                  <div className="text-xs font-mono text-amber-300/90 font-bold mt-0.5">
                    Reg: {inmate.noRegister}
                  </div>
                </div>

                {/* Crime */}
                <div className="mt-2.5 pt-2.5 border-t border-blue-900/60">
                  <div className="text-[11px] text-slate-300 font-medium">Tindak Pidana:</div>
                  <div className="text-xs font-semibold text-slate-100 mt-0.5">
                    {inmate.jenisKejahatan}
                  </div>
                </div>

                {/* Clothing list summary */}
                <div className="mt-3 space-y-1 bg-[#07182e]/80 p-2.5 rounded-xl border border-blue-900/60">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-condensed">
                    Distribusi Pakaian Seragam
                  </div>
                  {pakaianList.slice(0, 3).map((p) => {
                    const over = p.jumlah > p.maxJumlah;
                    return (
                      <div key={p.id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 truncate mr-2">{p.namaItem}:</span>
                        <span className={`font-mono font-bold ${over ? 'text-rose-400 font-black' : 'text-slate-100'}`}>
                          {p.jumlah}/{p.maxJumlah}
                        </span>
                      </div>
                    );
                  })}
                  {pakaianList.length > 3 && (
                    <div className="text-[10px] text-amber-300/80 italic text-right">
                      +{pakaianList.length - 3} item lainnya
                    </div>
                  )}
                </div>

                {/* Status badges */}
                <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                  {isOver ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950/80 border border-rose-500/60 px-2 py-0.5 rounded-lg shadow-2xs">
                      <AlertTriangle className="w-3 h-3 text-rose-400" /> Over Kuota
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/50 px-2 py-0.5 rounded-lg shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Kuota Sesuai
                    </span>
                  )}

                  {hasSitaan && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/60 px-2 py-0.5 rounded-lg shadow-2xs">
                      <ShieldAlert className="w-3 h-3 text-amber-400" /> {inmate.bajuTerlarangDisita} Sitaan
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-blue-900/60 flex items-center justify-between gap-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>{inmate.tanggalKontrolTerakhir}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenQuickControl(inmate)}
                    className="p-1.5 rounded-lg bg-[#07182e] hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 transition shadow-2xs"
                    title="Sidak Pakaian"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <button
                    onClick={() => onOpenTukarPakaian(inmate)}
                    className="p-1.5 rounded-lg bg-[#07182e] hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition shadow-2xs"
                    title="Tukar Pakaian"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  {onOpenMutasi && (
                    <button
                      onClick={() => onOpenMutasi(inmate)}
                      className="p-1.5 rounded-lg bg-[#07182e] hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:border-cyan-400 transition shadow-2xs"
                      title="Mutasi Kamar / Blok Warga Binaan"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-300" />
                    </button>
                  )}

                  <button
                    id={`btn-card-cetak-kartu-${inmate.id}`}
                    onClick={() => {
                      if (onOpenCetakKartu) {
                        onOpenCetakKartu(inmate);
                      } else {
                        onOpenDetail(inmate);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-[#07182e] hover:bg-amber-950/50 text-amber-300 border border-amber-500/50 hover:border-amber-400 transition shadow-2xs"
                    title="Cetak Kartu Kendali Pakaian (A4)"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                  </button>

                  {/* Tombol Nonaktifkan (Bebas) atau Aktifkan Kembali */}
                  {inmate.statusKeaktifan === 'Bebas' ? (
                    onAktifkanKembali && (
                      <button
                        onClick={() => onAktifkanKembali(inmate.id)}
                        className="p-1.5 rounded-lg bg-[#07182e] hover:bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 transition shadow-2xs"
                        title="Aktifkan Kembali WBP ke Kamar Hunian"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    )
                  ) : (
                    onOpenNonaktifkanBebas && (
                      <button
                        onClick={() => onOpenNonaktifkanBebas(inmate)}
                        className="p-1.5 rounded-lg bg-[#07182e] hover:bg-rose-950/60 text-rose-300 border border-rose-500/50 hover:border-rose-400 transition shadow-2xs"
                        title="Nonaktifkan WBP yang Sudah Bebas"
                      >
                        <UserX className="w-3.5 h-3.5 text-rose-400" />
                      </button>
                    )
                  )}

                  <button
                    onClick={() => onOpenEdit(inmate)}
                    className="p-1.5 rounded-lg bg-[#07182e] hover:bg-[#0d2a52] text-slate-200 border border-blue-800/60 transition shadow-2xs"
                    title="Edit Data"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                  </button>

                  <button
                    onClick={() => onDelete(inmate.id, inmate.nama)}
                    className="p-1.5 rounded-lg bg-[#07182e] hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-blue-800/60 transition shadow-2xs"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-[#07182e] rounded-2xl border border-blue-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300 font-medium shadow-xl">
        <div className="flex items-center gap-2">
          <span>Menampilkan <strong className="text-amber-300">{inmates.length > 0 ? startIndex + 1 : 0}</strong> - <strong className="text-amber-300">{endIndex}</strong> dari <strong className="text-white">{inmates.length}</strong> Warga Binaan</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-1.5">
            <span>Kartu per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#09203d] border border-blue-800/80 text-slate-100 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={-1}>Semua ({inmates.length})</option>
            </select>
          </div>
        </div>

        {pageSize !== -1 && totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validPage <= 1}
              className="px-2.5 py-1 rounded-lg bg-[#09203d] border border-blue-800/80 text-slate-200 hover:text-white hover:bg-blue-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
            <span className="px-3 py-1 font-bold text-amber-300 bg-[#0d2a52] rounded-lg border border-amber-400/40">
              Hal {validPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validPage >= totalPages}
              className="px-2.5 py-1 rounded-lg bg-[#09203d] border border-blue-800/80 text-slate-200 hover:text-white hover:bg-blue-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
