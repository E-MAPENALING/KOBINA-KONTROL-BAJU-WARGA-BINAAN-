import React from 'react';
import { Inmate } from '../types';
import { X, Printer, Shirt, RefreshCw, Calendar, History, CheckCircle2, AlertTriangle, User } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmate: Inmate | null;
  onOpenQuickControl: (inmate: Inmate) => void;
  onOpenTukarPakaian?: (inmate: Inmate) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  inmate,
  onOpenQuickControl,
  onOpenTukarPakaian,
}) => {
  if (!isOpen || !inmate) return null;

  const handlePrintCard = () => {
    window.print();
  };

  const pakaianList = inmate.pakaianList || [];
  const riwayatPenukaran = inmate.riwayatPenukaran || [];
  const riwayatKontrol = inmate.riwayatKontrol || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#082231] rounded-2xl shadow-2xl w-full max-w-3xl border border-[#144963] overflow-hidden my-6 text-white">
        
        {/* Header (No print) */}
        <div className="no-print bg-[#061824] text-white p-5 flex items-center justify-between border-b border-[#144963]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-base">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-condensed tracking-wider text-white">KARTU KENDALI SANDANG & RIWAYAT KONTROL</h3>
              <p className="text-xs text-slate-400">{inmate.nama} ({inmate.noRegister})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenTukarPakaian && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTukarPakaian(inmate);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition shadow-xs ring-1 ring-amber-300"
                title="Tukar Baju / Sandang"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tukar Pakaian
              </button>
            )}
            <button
              onClick={handlePrintCard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#0b334a] hover:bg-[#104766] text-cyan-300 border border-cyan-500/30 transition"
              title="Cetak Kartu Kendali Ini"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              Cetak Kartu
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:bg-white print:text-black">
          
          {/* Institutional Print Header */}
          <div className="border-b-2 border-cyan-500/40 print:border-slate-900 pb-4 text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 print:text-slate-500">
              Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia
            </div>
            <div className="text-lg font-black uppercase text-white print:text-slate-900 mt-0.5 font-condensed tracking-wider">
              LEMBAGA PEMASYARAKATAN / RUMAH TAHANAN NEGARA
            </div>
            <div className="text-xs font-semibold text-slate-300 print:text-slate-700 tracking-wide mt-1">
              KOBINA - KARTU KONTROL & INVENTARISASI PAKAIAN SERAGAM PENGHUNI
            </div>
          </div>

          {/* Profile & Room Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#061824] print:bg-slate-50 p-4 rounded-xl border border-[#144963] print:border-slate-200 text-sm">
            <div className="space-y-1.5">
              <div className="flex justify-between border-b border-[#144963]/60 print:border-slate-200/60 pb-1">
                <span className="text-slate-400 print:text-slate-500 text-xs">Nama Lengkap:</span>
                <span className="font-bold text-white print:text-slate-900">{inmate.nama}</span>
              </div>
              <div className="flex justify-between border-b border-[#144963]/60 print:border-slate-200/60 pb-1">
                <span className="text-slate-400 print:text-slate-500 text-xs">Nama Panggilan/Alias:</span>
                <span className="font-medium text-slate-300 print:text-slate-800">{inmate.alias || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-[#144963]/60 print:border-slate-200/60 pb-1">
                <span className="text-slate-400 print:text-slate-500 text-xs">Nomor Register:</span>
                <span className="font-mono font-bold text-cyan-400 print:text-slate-900">{inmate.noRegister}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-500 text-xs">Status:</span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${
                  inmate.status === 'Tahanan' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 print:bg-amber-100 print:text-amber-800' 
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 print:bg-blue-100 print:text-blue-800'
                }`}>
                  {inmate.status}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between border-b border-[#144963]/60 print:border-slate-200/60 pb-1">
                <span className="text-slate-400 print:text-slate-500 text-xs">Kamar Hunian:</span>
                <span className="font-bold text-white print:text-slate-900">{inmate.kamarHunian}</span>
              </div>
              <div className="flex justify-between border-b border-[#144963]/60 print:border-slate-200/60 pb-1">
                <span className="text-slate-400 print:text-slate-500 text-xs">Blok:</span>
                <span className="text-xs font-bold text-cyan-300 print:text-slate-700">{inmate.blok}</span>
              </div>
              {inmate.lokasiSel && (
                <div className="flex justify-between border-b border-[#144963]/60 print:border-slate-200/60 pb-1">
                  <span className="text-slate-400 print:text-slate-500 text-xs">Lokasi Sel (Roster):</span>
                  <span className="text-xs font-mono font-bold text-amber-300 print:text-slate-900">{inmate.lokasiSel}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-[#144963]/60 print:border-slate-200/60 pb-1">
                <span className="text-slate-400 print:text-slate-500 text-xs">Tindak Pidana / Kejahatan:</span>
                <span className="font-bold text-white print:text-slate-900">{inmate.jenisKejahatan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-500 text-xs">Terakhir Diperiksa:</span>
                <span className="text-xs font-semibold text-slate-300 print:text-slate-800">{inmate.tanggalKontrolTerakhir}</span>
              </div>
            </div>
          </div>

          {/* DATA PAKAIAN (Table: Baju, Celana, Sarung, Handuk, dll) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white print:text-slate-900 flex items-center gap-2 font-condensed uppercase tracking-wider">
                <Shirt className="w-4 h-4 text-cyan-400" />
                Data Inventaris Pakaian (Baju, Celana, Sarung, Handuk, dll)
              </h4>
              <span className="text-xs text-slate-400 print:text-slate-500">
                Total {pakaianList.length} Item
              </span>
            </div>

            <div className="border border-[#144963] print:border-slate-200 rounded-xl overflow-hidden bg-[#061824] print:bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b2838] print:bg-slate-100 text-slate-300 print:text-slate-700 font-bold border-b border-[#144963] print:border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Nama Pakaian</th>
                    <th className="py-2.5 px-3 text-center">Ukuran</th>
                    <th className="py-2.5 px-3 text-center">Jumlah Dimiliki</th>
                    <th className="py-2.5 px-3 text-center">Batas Maksimal</th>
                    <th className="py-2.5 px-3 text-center">Status Kuota</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#12415c]/60 print:divide-slate-100">
                  {pakaianList.map((p) => {
                    const isOver = p.jumlah > p.maxJumlah;
                    const isMax = p.jumlah === p.maxJumlah;

                    return (
                      <tr key={p.id} className={isOver ? 'bg-rose-950/30' : 'hover:bg-[#082638]/40'}>
                        <td className="py-2 px-3 font-bold text-white print:text-slate-900">{p.namaItem}</td>
                        <td className="py-2 px-3 text-center text-slate-300 print:text-slate-700">{p.ukuran || '-'}</td>
                        <td className={`py-2 px-3 text-center font-bold font-mono ${isOver ? 'text-rose-400' : 'text-cyan-300 print:text-slate-900'}`}>
                          {p.jumlah} pcs
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-400 font-mono">
                          {p.maxJumlah} pcs
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isOver ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px]">
                              ⚠️ Melebihi Kuota
                            </span>
                          ) : isMax ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px]">
                              Maksimal (Tukar Baju)
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium text-[10px]">
                              Memenuhi Syarat
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-400 print:text-slate-500 text-[11px]">{p.keterangan || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIWAYAT PERGANTIAN / PENUKARAN PAKAIAN (TUKAR BAJU) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-sm font-bold text-white print:text-slate-900 flex items-center gap-2 font-condensed uppercase tracking-wider">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                Riwayat Pergantian & Penukaran Pakaian (Tukar Baju)
              </h4>
              <span className="text-xs text-slate-400 print:text-slate-500 font-medium">
                {riwayatPenukaran.length} Penukaran Tercatat
              </span>
            </div>

            {riwayatPenukaran.length === 0 ? (
              <div className="bg-[#061824] print:bg-slate-50 border border-[#144963] print:border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400 print:text-slate-500">
                Belum ada data pertukaran pakaian. Ketika WBP mencapai kuota maksimal, penukaran dapat dicatat melalui tombol <strong>Tukar Pakaian</strong>.
              </div>
            ) : (
              <div className="space-y-2">
                {riwayatPenukaran.map((swap) => (
                  <div
                    key={swap.id}
                    className="p-3 bg-[#061824] border border-[#144963] rounded-xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] font-condensed">
                          Tukar 1:1
                        </span>
                        <span className="font-bold text-white">{swap.itemDitukar}</span>
                        <span className="text-cyan-400 font-bold">➔</span>
                        <span className="font-bold text-emerald-400">{swap.itemPengganti}</span>
                        <span className="text-[10px] text-slate-400">({swap.jumlah} pcs)</span>
                      </div>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {swap.tanggal} {swap.jam && `• ${swap.jam}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 pt-1 border-t border-[#12415c]">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Kondisi Lama / Alasan:</span>
                        <span className="font-medium text-white">{swap.kondisiLama} - {swap.alasan}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Petugas:</span>
                        <span className="font-medium text-cyan-300">{swap.petugas}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Catatan:</span>
                        <span className="text-slate-300 italic">{swap.catatan || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIWAYAT PEMERIKSAAN & KONTROL FISIK */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-sm font-bold text-white print:text-slate-900 flex items-center gap-2 font-condensed uppercase tracking-wider">
                <History className="w-4 h-4 text-cyan-400" />
                Log Riwayat Kontrol Fisik & Sidak Kamar
              </h4>
              <span className="text-xs text-slate-400 print:text-slate-500">
                {riwayatKontrol.length} Catatan Pemeriksaan
              </span>
            </div>

            <div className="space-y-2">
              {riwayatKontrol.map((record) => (
                <div
                  key={record.id}
                  className="p-3 rounded-xl border border-[#144963] bg-[#061824] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300">
                        {record.kategoriAksi}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#082638] text-slate-300 border border-[#144963]">
                        {record.kondisi}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {record.tanggal}
                    </span>
                  </div>

                  <p className="text-slate-300">
                    {record.catatan}
                  </p>

                  <div className="text-[11px] text-slate-400 pt-1 border-t border-[#12415c]/60 flex justify-between">
                    <span>Petugas: <strong className="text-slate-200">{record.petugas}</strong></span>
                    <span>Status Baju: {record.jumlahSebelumnya} pcs ➔ {record.jumlahSesudahnya} pcs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
