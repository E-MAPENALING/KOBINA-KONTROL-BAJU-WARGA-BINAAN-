import React, { useState, useEffect } from 'react';
import { Inmate } from '../types';
import { X, Printer, Shirt, RefreshCw, Calendar, History, CheckCircle2, AlertTriangle, User, ArrowRightLeft, ExternalLink, Download, UserX, UserCheck } from 'lucide-react';
import { executePrint, openInNewPrintTab, downloadPrintableDocument } from '../utils/printHelper';
import { getSavedPejabatConfig, PejabatConfig } from '../utils/pejabatHelper';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmate: Inmate | null;
  allInmates?: Inmate[];
  onSelectInmate?: (inmate: Inmate) => void;
  onOpenQuickControl: (inmate: Inmate) => void;
  onOpenTukarPakaian?: (inmate: Inmate) => void;
  onOpenMutasi?: (inmate: Inmate) => void;
  onOpenPrintCenter?: (inmate: Inmate) => void;
  onOpenNonaktifkanBebas?: (inmate: Inmate) => void;
  onAktifkanKembali?: (inmateId: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  inmate,
  allInmates,
  onSelectInmate,
  onOpenQuickControl,
  onOpenTukarPakaian,
  onOpenMutasi,
  onOpenPrintCenter,
  onOpenNonaktifkanBebas,
  onAktifkanKembali,
}) => {
  const [printNotice, setPrintNotice] = useState<string | null>(null);
  const [pejabatConfig] = useState<PejabatConfig>(getSavedPejabatConfig);

  // Synchronize printable content to #print-portal for immediate Ctrl + P printing
  useEffect(() => {
    if (!isOpen || !inmate) return;
    const timer = setTimeout(() => {
      const el = document.getElementById('printable-detail-card');
      const portal = document.getElementById('print-portal');
      if (el && portal) {
        portal.innerHTML = el.innerHTML;
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isOpen, inmate, pejabatConfig]);

  if (!isOpen || !inmate) return null;

  const handlePrintCard = () => {
    const docTitle = `Kartu_Kendali_Pakaian_${inmate.nama.replace(/\s+/g, '_')}_${inmate.noRegister}`;
    const result = executePrint('printable-detail-card', docTitle);
    if (result.fallbackUsed === 'new-tab') {
      setPrintNotice('Pencetakan dialihkan ke Tab Baru untuk mencetak kartu tanpa hambatan frame browser.');
    } else if (result.fallbackUsed === 'download') {
      setPrintNotice('File cetak HTML telah diunduh ke perangkat Anda.');
    }
  };

  const handleOpenNewTab = () => {
    const el = document.getElementById('printable-detail-card');
    const content = el ? el.innerHTML : '';
    const docTitle = `Kartu_Kendali_Pakaian_${inmate.nama.replace(/\s+/g, '_')}_${inmate.noRegister}`;
    const opened = openInNewPrintTab(docTitle, content);
    if (!opened) {
      downloadPrintableDocument(docTitle, content, docTitle);
      setPrintNotice('Pop-up terblokir. File cetak telah diunduh secara otomatis.');
    }
  };

  const handleDownload = () => {
    const el = document.getElementById('printable-detail-card');
    const content = el ? el.innerHTML : '';
    const docTitle = `Kartu_Kendali_Pakaian_${inmate.nama.replace(/\s+/g, '_')}_${inmate.noRegister}`;
    downloadPrintableDocument(docTitle, content, docTitle);
    setPrintNotice('File dokumen cetak berhasil diunduh.');
  };

  const pakaianList = inmate.pakaianList || [];
  const riwayatPenukaran = inmate.riwayatPenukaran || [];
  const riwayatKontrol = inmate.riwayatKontrol || [];
  const riwayatMutasi = inmate.riwayatMutasi || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible print:block">
      <div className="bg-[#082231] rounded-2xl shadow-2xl w-full max-w-3xl border border-[#144963] overflow-hidden my-6 text-white print:my-0 print:border-none print:shadow-none print:max-w-none print:rounded-none print:w-full print:bg-white print:text-black">
        
        {/* Header (No print) */}
        <div className="no-print bg-[#061824] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#144963]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-base">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-condensed tracking-wider text-white">KARTU KENDALI PAKAIAN</h3>
              <p className="text-xs text-slate-400">{inmate.nama} ({inmate.noRegister}) • Kamar {inmate.kamarHunian}</p>
            </div>
          </div>

          {/* Quick Inmate Switcher if multiple inmates are available */}
          {allInmates && allInmates.length > 1 && onSelectInmate && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 hidden md:inline">Ganti WBP:</span>
              <select
                value={inmate.id}
                onChange={(e) => {
                  const target = allInmates.find((i) => i.id === e.target.value);
                  if (target) onSelectInmate(target);
                }}
                className="px-2.5 py-1.5 bg-[#092242] border border-blue-800/80 rounded-xl text-amber-300 font-bold focus:ring-2 focus:ring-amber-400 outline-none text-xs"
              >
                {allInmates.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nama} ({i.kamarHunian})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            {onOpenMutasi && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMutasi(inmate);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#092242] hover:bg-[#0d2a52] text-cyan-300 hover:text-white border border-cyan-500/40 transition shadow-xs"
                title="Mutasi Kamar / Blok"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Mutasi Kamar
              </button>
            )}
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
            {inmate.statusKeaktifan === 'Bebas' ? (
              onAktifkanKembali && (
                <button
                  onClick={() => {
                    onAktifkanKembali(inmate.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                  title="Aktifkan Kembali Warga Binaan ke Hunian"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Aktifkan Kembali
                </button>
              )
            ) : (
              onOpenNonaktifkanBebas && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenNonaktifkanBebas(inmate);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/50 transition shadow-xs"
                  title="Nonaktifkan WBP yang Sudah Bebas"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Nonaktifkan (Bebas)
                </button>
              )
            )}
            {onOpenPrintCenter && (
              <button
                id="btn-open-print-center"
                onClick={() => {
                  onClose();
                  onOpenPrintCenter(inmate);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition"
                title="Buka Format Dokumen A4 Lengkap dengan Kop Kedinasan & Tanda Tangan"
              >
                <Printer className="w-3.5 h-3.5" />
                Format Cetak A4
              </button>
            )}
            <button
              id="btn-print-kartu-modal"
              onClick={handlePrintCard}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-sm border border-amber-200 transition active:scale-95"
              title="Cetak Langsung Kartu Kendali Ini (A4)"
            >
              <Printer className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              Cetak Cepat
            </button>
            <button
              id="btn-print-new-tab"
              onClick={handleOpenNewTab}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-[#0e3152] hover:bg-[#16436e] text-cyan-300 border border-cyan-500/40 transition"
              title="Buka Pratinjau di Tab Baru Browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tab Baru</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-[#061824] hover:bg-[#0c2e42] border border-blue-900/60 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice if print was redirected or downloaded */}
        {printNotice && (
          <div className="no-print mx-4 sm:mx-6 mt-3 p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-between text-xs text-amber-200">
            <span>{printNotice}</span>
            <button onClick={() => setPrintNotice(null)} className="text-slate-400 hover:text-white ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Printable Card Content */}
        <div id="printable-detail-card" className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:bg-white print:text-black print:max-h-none print:overflow-visible print:p-0 printable-document">
          
          {/* Institutional Print Header */}
          <div className="border-b-2 border-cyan-500/40 print:border-black pb-4 text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 print:text-black">
              Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia
            </div>
            <div className="text-lg font-black uppercase text-white print:text-black mt-0.5 font-condensed tracking-wider">
              LEMBAGA PEMASYARAKATAN KELAS IIB BATANG
            </div>
            <div className="text-xs font-semibold text-slate-300 print:text-black tracking-wide mt-1">
              KOBINA- KONTROL BAJU WARGA BINAAN
            </div>
            <div className="text-sm font-black uppercase tracking-wider text-amber-300 print:text-black underline mt-1">
              KARTU KENDALI PAKAIAN
            </div>
          </div>

          {/* Status Bebas Alert Banner */}
          {inmate.statusKeaktifan === 'Bebas' && (
            <div className="bg-rose-950/60 print:bg-rose-50 border-2 border-rose-500/60 print:border-rose-400 p-3.5 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <UserX className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex-1 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black tracking-wider uppercase text-rose-300 print:text-rose-900 font-condensed text-sm">
                    STATUS: TELAH DINONAKTIFKAN (SUDAH BEBAS)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-200 border border-rose-500/30 text-[10px] font-bold">
                    {inmate.dataBebas?.jenisPembebasan || 'Bebas'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 print:text-slate-800 pt-1">
                  <div><strong>Tgl Bebas:</strong> {inmate.dataBebas?.tanggalBebas || '-'} {inmate.dataBebas?.jamBebas && `(${inmate.dataBebas.jamBebas})`}</div>
                  <div><strong>No. SK Bebas:</strong> <span className="font-mono">{inmate.dataBebas?.nomorSuratBebas || '-'}</span></div>
                  <div><strong>Pengembalian Seragam:</strong> {inmate.dataBebas?.statusPengembalianSeragam || 'Selesai'}</div>
                </div>
                {inmate.dataBebas?.petugasPembebas && (
                  <div className="text-[10px] text-slate-400 print:text-slate-600">
                    Petugas Pembebas: <strong>{inmate.dataBebas.petugasPembebas}</strong>
                  </div>
                )}
                {inmate.dataBebas?.keterangan && (
                  <div className="text-[10px] text-slate-400 print:text-slate-600 italic">
                    Catatan: {inmate.dataBebas.keterangan}
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* RIWAYAT MUTASI KAMAR / BLOK */}
          {riwayatMutasi.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-sm font-bold text-white print:text-slate-900 flex items-center gap-2 font-condensed uppercase tracking-wider">
                  <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                  Riwayat Mutasi Kamar & Penempatan Hunian
                </h4>
                <span className="text-xs text-slate-400 print:text-slate-500">
                  {riwayatMutasi.length} Mutasi
                </span>
              </div>

              <div className="space-y-2">
                {riwayatMutasi.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-[#144963] bg-[#061824] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                          {m.blokAsal} - {m.kamarAsal} ➔ {m.blokTujuan} - {m.kamarTujuan}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {m.tanggal} {m.jam ? `• ${m.jam} WIB` : ''}
                      </span>
                    </div>

                    <div className="text-slate-300">
                      Alasan: <strong className="text-white">{m.alasan}</strong>
                      {m.catatan && <span className="text-slate-400 italic block mt-0.5">Catatan: {m.catatan}</span>}
                    </div>

                    <div className="text-[11px] text-slate-400 pt-1 border-t border-[#12415c]/60 flex justify-between">
                      <span>Petugas Pemutasian: <strong className="text-slate-200">{m.petugas}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Official Signature Section for Print */}
          <div className="pt-6 border-t-2 border-[#144963] print:border-slate-300 flex justify-end text-center text-xs break-inside-avoid print:text-slate-900 mt-6">
            <div className="w-64 space-y-16">
              <p className="font-semibold text-slate-300 print:text-slate-700">
                {pejabatConfig.kota || 'Batang'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                {pejabatConfig.judulPetugas || 'PETUGAS'},
              </p>
              <div>
                <p className="font-bold underline text-white print:text-slate-900">
                  {pejabatConfig.namaPetugas || 'SURYANTO, A.Md.P., S.H.'}
                </p>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  {pejabatConfig.nipPetugas ? `NIP. ${pejabatConfig.nipPetugas}` : ''}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
