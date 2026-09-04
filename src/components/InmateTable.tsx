import React, { useState, useMemo } from 'react';
import { Inmate } from '../types';
import { 
  Shirt, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  MinusCircle, 
  FileText,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';

interface InmateTableProps {
  inmates: Inmate[];
  onOpenDetail: (inmate: Inmate) => void;
  onOpenQuickControl: (inmate: Inmate) => void;
  onOpenEdit: (inmate: Inmate) => void;
  onDelete: (id: string, nama: string) => void;
  onOpenTukarPakaian: (inmate: Inmate) => void;
  onOpenMutasi?: (inmate: Inmate) => void;
  onQuickAdjustClothing: (inmateId: string, delta: number) => void;
  onQuickAdjustItem?: (inmateId: string, itemType: 'baju' | 'celana', delta: number) => void;
}

export const InmateTable: React.FC<InmateTableProps> = ({
  inmates,
  onOpenDetail,
  onOpenQuickControl,
  onOpenEdit,
  onDelete,
  onOpenTukarPakaian,
  onOpenMutasi,
  onQuickAdjustClothing,
  onQuickAdjustItem,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Reset to page 1 whenever inmates list changes length
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
    return (
      <div className="bg-[#09203d]/95 backdrop-blur-md rounded-2xl border border-blue-900/70 p-12 text-center shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-[#0d2a52] border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300 mb-3 shadow-md">
          <Shirt className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold font-condensed tracking-wider text-white">TIDAK ADA DATA PENGHUNI DITEMUKAN</h3>
        <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
          Tidak ada data tahanan atau warga binaan yang sesuai dengan filter blok, kamar hunian, atau jenis kejahatan.
        </p>
      </div>
    );
  }

  const handleAdjust = (inmateId: string, type: 'baju' | 'celana', delta: number) => {
    if (onQuickAdjustItem) {
      onQuickAdjustItem(inmateId, type, delta);
    } else {
      onQuickAdjustClothing(inmateId, delta);
    }
  };

  const startIndex = pageSize === -1 ? 0 : (validPage - 1) * pageSize;
  const endIndex = pageSize === -1 ? inmates.length : Math.min(startIndex + pageSize, inmates.length);

  return (
    <div className="bg-[#09203d]/95 backdrop-blur-md rounded-2xl border border-blue-900/70 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-200 border-collapse">
          <thead className="bg-[#07182e] border-b border-blue-900/80 text-xs uppercase font-bold text-slate-200 tracking-wider font-condensed">
            <tr>
              <th className="py-3.5 px-4">Identitas & No. Reg</th>
              <th className="py-3.5 px-4">Kamar & Blok</th>
              <th className="py-3.5 px-4">Tindak Pidana</th>
              <th className="py-3.5 px-4">Data Pakaian (Milik / Maks)</th>
              <th className="py-3.5 px-4">Status Kuota & Sitaan</th>
              <th className="py-3.5 px-4">Kontrol Terakhir</th>
              <th className="py-3.5 px-4 text-center">Aksi Pakaian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/40">
            {paginatedInmates.map((inmate) => {
              const pakaianList = inmate.pakaianList || [];
              const itemsOver = pakaianList.filter((p) => p.jumlah > p.maxJumlah);
              const itemsAtMax = pakaianList.filter((p) => p.jumlah === p.maxJumlah);
              const isOver = itemsOver.length > 0;
              const hasItemsAtMax = itemsAtMax.length > 0;
              const hasSitaan = inmate.bajuTerlarangDisita > 0;

              return (
                <tr 
                  key={inmate.id}
                  className="hover:bg-blue-900/30 transition-colors group"
                >
                  {/* Identitas & No Register */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold font-condensed tracking-wider shadow-2xs ${
                        inmate.status === 'Tahanan'
                          ? 'bg-amber-400/25 text-amber-300 border border-amber-400/60'
                          : 'bg-white text-blue-950 font-black border border-blue-300'
                      }`}>
                        {inmate.status}
                      </span>
                      <span className="font-bold text-white text-base font-condensed tracking-wide">
                        {inmate.nama}
                      </span>
                    </div>
                    {inmate.alias && (
                      <div className="text-xs text-slate-300 italic mt-0.5">
                        Alias: {inmate.alias}
                      </div>
                    )}
                    <div className="text-xs font-mono text-amber-300/90 font-bold mt-1">
                      {inmate.noRegister}
                    </div>
                  </td>

                  {/* Kamar & Blok Hunian */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg bg-[#0d2a52] border border-blue-400/40 text-amber-300 text-xs font-condensed tracking-wider font-bold shadow-2xs">
                        {inmate.blok}
                      </span>
                      {inmate.lokasiSel && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-950 text-cyan-300 border border-blue-800 font-mono font-bold" title="Lokasi Sel Roster">
                          {inmate.lokasiSel}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-200 mt-1 font-semibold">
                      {inmate.kamarHunian}
                    </div>
                  </td>

                  {/* Tindak Pidana (Manual Input) */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-[#07182e] text-slate-200 border border-blue-800/60 text-xs font-medium">
                      {inmate.jenisKejahatan}
                    </span>
                  </td>

                  {/* Data Pakaian */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5 max-w-xs">
                      {pakaianList.slice(0, 3).map((item) => {
                        const itemOver = item.jumlah > item.maxJumlah;
                        return (
                          <div key={item.id} className="flex items-center justify-between text-xs bg-[#07182e]/80 px-2 py-1 rounded border border-blue-900/50">
                            <span className="text-slate-300 truncate mr-2">{item.namaItem} ({item.ukuran}):</span>
                            <div className="flex items-center gap-1 shrink-0 font-mono font-bold">
                              <span className={itemOver ? 'text-rose-400 font-black' : 'text-slate-100'}>
                                {item.jumlah}
                              </span>
                              <span className="text-slate-500">/</span>
                              <span className="text-slate-400">{item.maxJumlah}</span>
                            </div>
                          </div>
                        );
                      })}
                      {pakaianList.length > 3 && (
                        <div className="text-[11px] text-amber-300/80 font-medium">
                          +{pakaianList.length - 3} item pakaian lainnya
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status Kuota & Sitaan */}
                  <td className="py-3.5 px-4">
                    {isOver ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-500/60 text-xs font-bold font-condensed tracking-wider shadow-2xs animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        OVER KUOTA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 text-xs font-bold font-condensed tracking-wider shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        SESUAI KUOTA
                      </span>
                    )}

                    {hasSitaan && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/60 px-2 py-0.5 rounded-lg shadow-2xs">
                          <ShieldAlert className="w-3 h-3 text-amber-400" /> {inmate.bajuTerlarangDisita} Disita
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Kontrol Terakhir */}
                  <td className="py-3.5 px-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{inmate.tanggalKontrolTerakhir}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Oleh: {inmate.petugasPemeriksa}
                    </div>
                  </td>

                  {/* Aksi Pakaian & Kuota */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      
                      {/* Tombol Sidak / Quick Control */}
                      <button
                        onClick={() => onOpenQuickControl(inmate)}
                        className="p-1.5 rounded-xl text-amber-300 hover:text-white bg-[#061527] hover:bg-amber-600/30 border border-amber-500/40 hover:border-amber-400 transition shadow-2xs"
                        title="Catat Sidak / Kontrol Pakaian"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                      </button>

                      {/* Tombol Tukar Baju 1-in 1-out */}
                      <button
                        onClick={() => onOpenTukarPakaian(inmate)}
                        className="p-1.5 rounded-xl text-cyan-300 hover:text-white bg-[#061527] hover:bg-cyan-600/30 border border-cyan-500/40 hover:border-cyan-400 transition shadow-2xs"
                        title="Tukar Baju Rusak (1 Masuk 1 Keluar)"
                      >
                        <RefreshCw className="w-4 h-4 text-cyan-400" />
                      </button>

                      {/* Tombol Mutasi Kamar / Blok */}
                      {onOpenMutasi && (
                        <button
                          onClick={() => onOpenMutasi(inmate)}
                          className="p-1.5 rounded-xl text-blue-300 hover:text-white bg-[#061527] hover:bg-blue-600/30 border border-blue-500/40 hover:border-cyan-400 transition shadow-2xs"
                          title="Mutasi Kamar / Blok Warga Binaan"
                        >
                          <ArrowRightLeft className="w-4 h-4 text-cyan-300" />
                        </button>
                      )}

                      {/* Tombol Detail / Cetak Kartu Kendali */}
                      <button
                        onClick={() => onOpenDetail(inmate)}
                        className="p-1.5 rounded-xl text-slate-200 hover:text-white bg-[#061527] hover:bg-[#0d2a52] border border-blue-800/60 hover:border-amber-400/60 transition shadow-2xs"
                        title="Lihat Kartu Kendali & Riwayat Pertukaran"
                      >
                        <FileText className="w-4 h-4 text-blue-300" />
                      </button>

                      {/* Tombol Edit */}
                      <button
                        onClick={() => onOpenEdit(inmate)}
                        className="p-1.5 rounded-xl text-slate-200 hover:text-white bg-[#061527] hover:bg-[#0d2a52] border border-blue-800/60 hover:border-amber-400/60 transition shadow-2xs"
                        title="Edit Data Pakaian & Kuota"
                      >
                        <Edit3 className="w-4 h-4 text-emerald-400" />
                      </button>

                      {/* Tombol Hapus */}
                      <button
                        onClick={() => onDelete(inmate.id, inmate.nama)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-300 bg-[#061527] hover:bg-rose-950/50 border border-blue-800/60 hover:border-rose-500/50 transition shadow-2xs"
                        title="Hapus Data"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-[#07182e] border-t border-blue-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300 font-medium">
        <div className="flex items-center gap-2">
          <span>Menampilkan <strong className="text-amber-300">{inmates.length > 0 ? startIndex + 1 : 0}</strong> - <strong className="text-amber-300">{endIndex}</strong> dari <strong className="text-white">{inmates.length}</strong> Warga Binaan</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-1.5">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#09203d] border border-blue-800/80 text-slate-100 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
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
