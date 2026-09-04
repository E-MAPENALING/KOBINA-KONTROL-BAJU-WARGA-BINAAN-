import React, { useState, useMemo, useEffect } from 'react';
import { Inmate, BlokHunian } from '../types';
import { 
  X, 
  Printer, 
  Building2, 
  Home, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Filter, 
  RotateCcw,
  CheckSquare,
  Square
} from 'lucide-react';
import { RoomGroup, getAllSpecificRoomsFlat, getSpecificRoomsForBlok } from '../utils/kamarHelper';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmates: Inmate[];
  daftarBlok?: BlokHunian[];
  roomGroups?: RoomGroup[];
  initialKamar?: string;
  initialBlok?: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  inmates,
  daftarBlok = [],
  roomGroups = [],
  initialKamar,
  initialBlok,
}) => {
  // Filters inside modal
  const [selectedBlok, setSelectedBlok] = useState<string>('Semua Blok');
  const [selectedKamar, setSelectedKamar] = useState<string>('Semua Kamar');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Tahanan' | 'Warga Binaan'>('All');
  const [kondisiFilter, setKondisiFilter] = useState<'All' | 'Bermasalah' | 'Sesuai'>('All');
  const [includeSignatureCol, setIncludeSignatureCol] = useState<boolean>(true);
  const [includeInspectionNotes, setIncludeInspectionNotes] = useState<boolean>(true);
  const [petugasPemeriksa, setPetugasPemeriksa] = useState<string>('Tim Regbimpas & Pengamanan');
  const [nipPetugas, setNipPetugas] = useState<string>('19850615 200801 1 001');

  // Sync initial selections when modal opens or initial props change
  useEffect(() => {
    if (isOpen) {
      if (initialKamar && initialKamar !== 'Semua Kamar') {
        setSelectedKamar(initialKamar);
        // Extract block if present
        if (initialKamar.includes('-')) {
          const possibleBlok = initialKamar.split('-')[0].trim();
          setSelectedBlok(possibleBlok);
        } else if (initialBlok && initialBlok !== 'Semua Blok') {
          setSelectedBlok(initialBlok);
        }
      } else if (initialBlok && initialBlok !== 'Semua Blok') {
        setSelectedBlok(initialBlok);
        setSelectedKamar('Semua Kamar');
      } else {
        setSelectedBlok('Semua Blok');
        setSelectedKamar('Semua Kamar');
      }
      setStatusFilter('All');
      setKondisiFilter('All');
    }
  }, [isOpen, initialKamar, initialBlok]);

  // Compute room occupancy count map from inmates
  const roomOccupancyMap = useMemo(() => {
    const map = new Map<string, number>();
    inmates.forEach((inmate) => {
      const room = inmate.kamarHunian ? inmate.kamarHunian.trim() : '';
      if (room) {
        map.set(room, (map.get(room) || 0) + 1);
      }
    });
    return map;
  }, [inmates]);

  // Compute block occupancy count map
  const blokOccupancyMap = useMemo(() => {
    const map = new Map<string, number>();
    inmates.forEach((inmate) => {
      const b = inmate.blok ? inmate.blok.trim().toUpperCase() : '';
      if (b) {
        map.set(b, (map.get(b) || 0) + 1);
      }
    });
    return map;
  }, [inmates]);

  // Compute available rooms based on selected block
  const availableRooms = useMemo(() => {
    if (selectedBlok !== 'Semua Blok') {
      return getSpecificRoomsForBlok(selectedBlok, inmates);
    }
    return getAllSpecificRoomsFlat(daftarBlok, inmates);
  }, [selectedBlok, daftarBlok, inmates]);

  // Handle block filter change
  const handleBlokChange = (newBlok: string) => {
    setSelectedBlok(newBlok);
    if (newBlok === 'Semua Blok') {
      setSelectedKamar('Semua Kamar');
    } else {
      // Check if current selected kamar belongs to the new block
      if (selectedKamar !== 'Semua Kamar' && !selectedKamar.toLowerCase().includes(newBlok.toLowerCase())) {
        setSelectedKamar('Semua Kamar');
      }
    }
  };

  // Filtered inmates for document
  const displayInmates = useMemo(() => {
    return inmates.filter((inmate) => {
      // 1. Blok filter
      if (selectedBlok !== 'Semua Blok') {
        const inmateBlok = (inmate.blok || '').toLowerCase().trim();
        const sel = selectedBlok.toLowerCase().trim();
        let matchBlok = inmateBlok === sel;
        if (!matchBlok && inmate.kamarHunian) {
          matchBlok = inmate.kamarHunian.toLowerCase().includes(sel);
        }
        if (!matchBlok) return false;
      }

      // 2. Kamar filter
      if (selectedKamar !== 'Semua Kamar') {
        const inmateKamar = (inmate.kamarHunian || '').trim();
        if (inmateKamar !== selectedKamar) {
          const cleanSelected = selectedKamar.toLowerCase().trim();
          const cleanInmate = inmateKamar.toLowerCase().trim();
          if (cleanInmate !== cleanSelected && !cleanInmate.endsWith(cleanSelected)) {
            return false;
          }
        }
      }

      // 3. Status filter
      if (statusFilter !== 'All') {
        if (inmate.status !== statusFilter) return false;
      }

      // 4. Kondisi / Sandang filter
      if (kondisiFilter === 'Bermasalah') {
        const isOver = inmate.pakaianList?.some((p) => p.jumlah > p.maxJumlah);
        const isKurang = inmate.pakaianList?.some((p) => p.jumlah < p.maxJumlah);
        const isRusak = inmate.kondisiBaju === 'Perlu Ganti' || inmate.kondisiBaju === 'Rusak/Sobek';
        const hasSitaan = (inmate.bajuTerlarangDisita || 0) > 0;
        if (!isOver && !isKurang && !isRusak && !hasSitaan) return false;
      } else if (kondisiFilter === 'Sesuai') {
        const isOver = inmate.pakaianList?.some((p) => p.jumlah > p.maxJumlah);
        const isRusak = inmate.kondisiBaju === 'Perlu Ganti' || inmate.kondisiBaju === 'Rusak/Sobek';
        const hasSitaan = (inmate.bajuTerlarangDisita || 0) > 0;
        if (isOver || isRusak || hasSitaan) return false;
      }

      return true;
    });
  }, [inmates, selectedBlok, selectedKamar, statusFilter, kondisiFilter]);

  // Statistics
  const totalBaju = displayInmates.reduce((acc, curr) => acc + (curr.jumlahBaju ?? curr.jumlahBajuMilik ?? 2), 0);
  const totalCelana = displayInmates.reduce((acc, curr) => acc + (curr.jumlahCelana ?? 2), 0);
  const totalSitaan = displayInmates.reduce((acc, curr) => acc + (curr.bajuTerlarangDisita || 0), 0);
  const totalTahanan = displayInmates.filter((i) => i.status === 'Tahanan').length;
  const totalWBP = displayInmates.filter((i) => i.status === 'Warga Binaan').length;
  const totalOverKuota = displayInmates.filter((i) =>
    (i.pakaianList || []).some((p) => p.jumlah > p.maxJumlah)
  ).length;

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl border border-slate-200 overflow-hidden my-4 print:my-0 print:border-none print:shadow-none print:max-w-none print:rounded-none">
        
        {/* ========================================================= */}
        {/* MODAL TOOLBAR & FILTER CONTROLS (HIDDEN ON PRINT)         */}
        {/* ========================================================= */}
        <div className="no-print bg-[#06182c] text-white border-b border-blue-950">
          
          {/* Top Bar Title & Print Action Button */}
          <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-condensed tracking-wide">
                  CETAK LAPORAN & BERITA ACARA KONTROL SANDANG
                </h3>
                <p className="text-xs text-slate-300">
                  Pilih kamar hunian spesifik atau blok untuk mencetak rekapitulasi pemeriksaan sandang A4
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                id="btn-trigger-print"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-200 transition active:scale-95"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>Cetak Dokumen (A4)</span>
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-[#09203d] border border-blue-800/60 hover:border-amber-400/60 transition"
                title="Tutup Pratinjau"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Room & Block Selection Controls */}
          <div className="p-4 sm:px-6 bg-[#08203b] space-y-3.5 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* 1. Pilih Blok Hunian */}
              <div>
                <label htmlFor="select-print-blok" className="block font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Pilih Blok Hunian:</span>
                </label>
                <select
                  id="select-print-blok"
                  value={selectedBlok}
                  onChange={(e) => handleBlokChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#061527] border border-blue-800/80 rounded-xl text-slate-100 font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                >
                  <option value="Semua Blok">Semua Blok ({inmates.length} WBP)</option>
                  {daftarBlok.map((blok) => {
                    const count = blokOccupancyMap.get(blok.nama.toUpperCase().trim()) || 0;
                    return (
                      <option key={blok.id} value={blok.nama}>
                        {blok.nama} ({count} WBP)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 2. Pilih Kamar Hunian (Kunci Solusi Permintaan Pengguna) */}
              <div>
                <label htmlFor="select-print-kamar" className="block font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Pilih Kamar Hunian:</span>
                </label>
                <select
                  id="select-print-kamar"
                  value={selectedKamar}
                  onChange={(e) => setSelectedKamar(e.target.value)}
                  className="w-full px-3 py-2 bg-[#061527] border border-blue-800/80 rounded-xl text-amber-300 font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                >
                  <option value="Semua Kamar" className="text-white font-bold">
                    {selectedBlok !== 'Semua Blok' ? `Semua Kamar di ${selectedBlok}` : `Semua Kamar Hunian (${inmates.length} WBP)`}
                  </option>
                  
                  {selectedBlok === 'Semua Blok' && roomGroups.length > 0 ? (
                    roomGroups.map((group) => (
                      <optgroup
                        key={group.blok}
                        label={`── ${group.blok} ──`}
                        className="bg-[#051120] text-cyan-300 font-bold"
                      >
                        {group.kamarList.map((room) => {
                          const count = roomOccupancyMap.get(room) || 0;
                          return (
                            <option key={room} value={room} className="text-slate-100 font-normal pl-3">
                              {room} ({count} Penghuni)
                            </option>
                          );
                        })}
                      </optgroup>
                    ))
                  ) : (
                    availableRooms.map((room) => {
                      const count = roomOccupancyMap.get(room) || 0;
                      return (
                        <option key={room} value={room} className="text-slate-100 font-normal">
                          {room} ({count} Penghuni)
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* 3. Filter Status WBP */}
              <div>
                <label htmlFor="select-print-status" className="block font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3. Status Warga Binaan:</span>
                </label>
                <select
                  id="select-print-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#061527] border border-blue-800/80 rounded-xl text-slate-100 font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                >
                  <option value="All">Semua Status (Tahanan & WBP)</option>
                  <option value="Tahanan">Hanya Tahanan</option>
                  <option value="Warga Binaan">Hanya Warga Binaan (WBP)</option>
                </select>
              </div>

              {/* 4. Filter Kepatuhan Sandang */}
              <div>
                <label htmlFor="select-print-kondisi" className="block font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" />
                  <span>4. Filter Kepatuhan Sandang:</span>
                </label>
                <select
                  id="select-print-kondisi"
                  value={kondisiFilter}
                  onChange={(e) => setKondisiFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#061527] border border-blue-800/80 rounded-xl text-slate-100 font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                >
                  <option value="All">Semua Kondisi Sandang</option>
                  <option value="Bermasalah">Hanya Bermasalah (Over / Sitaan / Rusak)</option>
                  <option value="Sesuai">Hanya Tertib / Sesuai Kuota</option>
                </select>
              </div>

            </div>

            {/* Additional Options & Settings */}
            <div className="pt-2 border-t border-blue-900/60 flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={includeSignatureCol}
                    onChange={(e) => setIncludeSignatureCol(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-[#061527] border-blue-800"
                  />
                  <span>Sertakan Kolom Paraf / Tanda Tangan WBP</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={includeInspectionNotes}
                    onChange={(e) => setIncludeInspectionNotes(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-[#061527] border-blue-800"
                  />
                  <span>Sertakan Catatan & Rekomendasi Hasil Sidak</span>
                </label>
              </div>

              {/* Quick Reset Shortcut */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedBlok('Semua Blok');
                    setSelectedKamar('Semua Kamar');
                    setStatusFilter('All');
                    setKondisiFilter('All');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#061527] hover:bg-blue-900/40 border border-blue-800/60 text-slate-300 hover:text-white transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Pilihan</span>
                </button>
              </div>

            </div>

            {/* Target Selected Summary Banner */}
            <div className="bg-[#051424] rounded-xl p-2.5 border border-blue-900/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-400 uppercase font-condensed tracking-wider">Hasil Seleksi:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40">
                  {selectedKamar !== 'Semua Kamar' ? selectedKamar : `Semua Kamar (${selectedBlok})`}
                </span>
                <span className="text-slate-300">
                  Total Terpilih: <strong className="text-white">{displayInmates.length} Orang</strong> ({totalTahanan} Tahanan, {totalWBP} WBP)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sandang: <strong className="text-white">{totalBaju}</strong> Baju / <strong className="text-white">{totalCelana}</strong> Celana</span>
                {totalSitaan > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-500/50">
                    {totalSitaan} Sitaan
                  </span>
                )}
                {totalOverKuota > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-500/50">
                    {totalOverKuota} Over Kuota
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* PRINTABLE OFFICIAL A4 DOCUMENT BODY                       */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 space-y-5 text-slate-950 bg-white printable-area">
          
          {/* Institutional Kop Surat Resmi Lembaga */}
          <div className="border-b-2 border-slate-900 pb-3 text-center print:border-black">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700 print:text-black">
              KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 print:text-black">
              DIREKTORAT JENDERAL PEMASYARAKATAN
            </div>
            <div className="text-lg font-black uppercase text-slate-950 mt-0.5 print:text-black tracking-wide">
              LEMBAGA PEMASYARAKATAN KELAS IIB BREBES
            </div>
            <div className="text-[11px] text-slate-600 print:text-black">
              Jalan Pemasyarakatan No. 01 • Telp: (0283) 671234 • Brebes, Jawa Tengah 52212
            </div>
          </div>

          {/* Document Title & Subtitle */}
          <div className="text-center pt-1">
            <h2 className="text-sm sm:text-base font-black uppercase underline tracking-wide print:text-black">
              {selectedKamar !== 'Semua Kamar'
                ? 'BERITA ACARA & DAFTAR INVENTARISASI SANDANG KAMAR HUNIAN'
                : selectedBlok !== 'Semua Blok'
                ? `REKAPITULASI KONTROL DAN INVENTARISASI SANDANG ${selectedBlok.toUpperCase()}`
                : 'REKAPITULASI KONTROL DAN INVENTARISASI SANDANG SELURUH PENGHUNI'}
            </h2>
            <div className="text-[11px] text-slate-700 print:text-black font-mono mt-0.5 font-bold">
              Nomor: W17.PAS.PAS.18/PK.02.01-{currentYear}/{selectedKamar !== 'Semua Kamar' ? selectedKamar.replace(/[^a-zA-Z0-9]/g, '-') : 'ALL'}
            </div>
            <p className="text-[11px] text-slate-600 print:text-black mt-0.5">
              Pemeriksaan Fisik Seragam, Inventarisasi Sandang, dan Penertiban Pakaian Warga Binaan Per Tanggal {currentDate}
            </p>
          </div>

          {/* Metadata Box: Rincian Kamar & Pelaksanaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border border-slate-400 p-3 rounded-lg bg-slate-50 print:bg-white print:border-black">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-32 text-slate-600 print:text-black font-semibold">Kamar Hunian:</span>
                <span className="font-bold text-slate-950 print:text-black">
                  {selectedKamar !== 'Semua Kamar' ? selectedKamar : 'Seluruh Kamar Hunian'}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-600 print:text-black font-semibold">Blok Hunian:</span>
                <span className="font-bold text-slate-900 print:text-black">
                  {selectedBlok !== 'Semua Blok' ? selectedBlok : 'Seluruh Blok Lapas'}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-600 print:text-black font-semibold">Petugas Pemeriksa:</span>
                <span className="font-semibold text-slate-800 print:text-black">{petugasPemeriksa}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex">
                <span className="w-36 text-slate-600 print:text-black font-semibold">Jumlah Terdata:</span>
                <span className="font-bold text-slate-950 print:text-black">
                  {displayInmates.length} Orang ({totalTahanan} Tahanan, {totalWBP} WBP)
                </span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-600 print:text-black font-semibold">Total Sandang Beredar:</span>
                <span className="font-semibold text-slate-800 print:text-black">
                  {totalBaju} Stel Baju, {totalCelana} Celana
                </span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-600 print:text-black font-semibold">Status Kepatuhan:</span>
                <span className={`font-bold ${totalOverKuota > 0 || totalSitaan > 0 ? 'text-rose-800 print:text-black' : 'text-emerald-800 print:text-black'}`}>
                  {totalOverKuota > 0 || totalSitaan > 0
                    ? `Perlu Penertiban (${totalOverKuota} Over Kuota, ${totalSitaan} Pcs Sitaan)`
                    : 'TERTIB (Sesuai Kuota Sandang Maksimal)'}
                </span>
              </div>
            </div>
          </div>

          {/* Table of Inmates in Selected Room / Filter */}
          {displayInmates.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-300 text-center rounded-lg">
              <p className="text-sm font-semibold text-slate-600">
                Tidak ada data penghuni yang ditemukan pada kamar atau filter yang dipilih.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-400 print:border-black">
                <thead className="bg-slate-100 font-bold text-slate-900 uppercase text-[10px] text-center border-b border-slate-400 print:bg-slate-100 print:border-black">
                  <tr>
                    <th className="border border-slate-400 print:border-black py-2 px-1.5 w-7">No</th>
                    <th className="border border-slate-400 print:border-black py-2 px-2 text-left">Nama Lengkap & Alias</th>
                    <th className="border border-slate-400 print:border-black py-2 px-2 text-left w-24">No. Register</th>
                    <th className="border border-slate-400 print:border-black py-2 px-1.5 w-16">Status</th>
                    {selectedKamar === 'Semua Kamar' ? (
                      <th className="border border-slate-400 print:border-black py-2 px-2 text-left">Kamar & Sel</th>
                    ) : (
                      <th className="border border-slate-400 print:border-black py-2 px-2 text-left w-20">Lokasi Sel</th>
                    )}
                    <th className="border border-slate-400 print:border-black py-2 px-2 text-left">Tindak Pidana</th>
                    <th className="border border-slate-400 print:border-black py-2 px-1.5 text-center w-10">Size</th>
                    <th className="border border-slate-400 print:border-black py-2 px-1.5 text-center w-14">Baju</th>
                    <th className="border border-slate-400 print:border-black py-2 px-1.5 text-center w-14">Celana</th>
                    <th className="border border-slate-400 print:border-black py-2 px-2 text-center w-16">Kondisi</th>
                    <th className="border border-slate-400 print:border-black py-2 px-1.5 text-center w-14">Sitaan</th>
                    <th className="border border-slate-400 print:border-black py-2 px-2 text-center w-20">Status Kuota</th>
                    {includeSignatureCol && (
                      <th className="border border-slate-400 print:border-black py-2 px-2 text-center w-20">Paraf WBP</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {displayInmates.map((inmate, idx) => {
                    const isOver = (inmate.pakaianList || []).some((p) => p.jumlah > p.maxJumlah);
                    const hasSitaan = (inmate.bajuTerlarangDisita || 0) > 0;
                    const bajuCount = inmate.jumlahBaju ?? inmate.jumlahBajuMilik ?? 2;
                    const celanaCount = inmate.jumlahCelana ?? 2;

                    return (
                      <tr 
                        key={inmate.id} 
                        className={`border-b border-slate-300 print:border-black ${
                          idx % 2 === 1 ? 'bg-slate-50/60 print:bg-transparent' : ''
                        }`}
                      >
                        <td className="border border-slate-300 print:border-black py-1.5 px-1.5 text-center font-mono">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-300 print:border-black py-1.5 px-2 font-bold text-slate-950 print:text-black">
                          {inmate.nama}
                          {inmate.alias && (
                            <span className="text-[10px] text-slate-600 print:text-black font-normal ml-1 italic">
                              ({inmate.alias})
                            </span>
                          )}
                        </td>
                        <td className="border border-slate-300 print:border-black py-1.5 px-2 font-mono text-[11px] font-semibold text-slate-800 print:text-black">
                          {inmate.noRegister}
                        </td>
                        <td className="border border-slate-300 print:border-black py-1.5 px-1.5 text-center font-semibold">
                          {inmate.status === 'Tahanan' ? 'Tahanan' : 'WBP'}
                        </td>
                        {selectedKamar === 'Semua Kamar' ? (
                          <td className="border border-slate-300 print:border-black py-1.5 px-2 text-slate-800 print:text-black text-[11px]">
                            {inmate.kamarHunian}
                            {inmate.lokasiSel && (
                              <span className="block text-[10px] text-slate-500 print:text-black">
                                Sel: {inmate.lokasiSel}
                              </span>
                            )}
                          </td>
                        ) : (
                          <td className="border border-slate-300 print:border-black py-1.5 px-2 text-slate-800 print:text-black font-mono text-[10px]">
                            {inmate.lokasiSel || '-'}
                          </td>
                        )}
                        <td className="border border-slate-300 print:border-black py-1.5 px-2 text-slate-800 print:text-black text-[11px]">
                          {inmate.jenisKejahatan}
                        </td>
                        <td className="border border-slate-300 print:border-black py-1.5 px-1.5 text-center font-bold text-slate-900 print:text-black">
                          {inmate.ukuranBaju}
                        </td>
                        <td className="border border-slate-300 print:border-black py-1.5 px-1.5 text-center font-mono font-bold">
                          <span className={bajuCount > 2 ? 'text-rose-700 print:text-black font-black' : ''}>
                            {bajuCount}/2
                          </span>
                        </td>
                        <td className="border border-slate-300 print:border-black py-1.5 px-1.5 text-center font-mono font-bold">
                          <span className={celanaCount > 2 ? 'text-rose-700 print:text-black font-black' : ''}>
                            {celanaCount}/2
                          </span>
                        </td>
                        <td className="border border-slate-300 print:border-black py-1.5 px-1.5 text-center text-[10px]">
                          {inmate.kondisiBaju}
                        </td>
                        <td className="border border-slate-300 print:border-black py-1.5 px-1.5 text-center font-bold">
                          {hasSitaan ? (
                            <span className="text-rose-700 print:text-black">{inmate.bajuTerlarangDisita} pcs</span>
                          ) : (
                            <span className="text-slate-400 print:text-black">-</span>
                          )}
                        </td>
                        <td className="border border-slate-300 print:border-black py-1.5 px-1.5 text-center text-[10px] font-bold">
                          {isOver ? (
                            <span className="text-rose-700 print:text-black uppercase">OVER</span>
                          ) : (
                            <span className="text-emerald-700 print:text-black uppercase">SESUAI</span>
                          )}
                        </td>
                        {includeSignatureCol && (
                          <td className="border border-slate-300 print:border-black py-1.5 px-1.5 text-center h-8 text-slate-400 print:text-black">
                            <span className="text-[10px] text-slate-400 print:text-slate-500">
                              {idx + 1}. .........
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-500 print:border-black text-[11px]">
                  <tr>
                    <td colSpan={selectedKamar === 'Semua Kamar' ? 7 : 6} className="border border-slate-400 print:border-black py-2 px-3 text-right">
                      TOTAL REKAPITULASI:
                    </td>
                    <td className="border border-slate-400 print:border-black py-2 px-1.5 text-center font-mono font-bold">
                      {totalBaju} Stel
                    </td>
                    <td className="border border-slate-400 print:border-black py-2 px-1.5 text-center font-mono font-bold">
                      {totalCelana} Stel
                    </td>
                    <td className="border border-slate-400 print:border-black py-2 px-1.5 text-center">-</td>
                    <td className="border border-slate-400 print:border-black py-2 px-1.5 text-center text-rose-700 print:text-black font-bold">
                      {totalSitaan > 0 ? `${totalSitaan} pcs` : '-'}
                    </td>
                    <td className="border border-slate-400 print:border-black py-2 px-1.5 text-center text-[10px]">
                      {totalOverKuota > 0 ? `${totalOverKuota} Over` : 'Nihil Over'}
                    </td>
                    {includeSignatureCol && (
                      <td className="border border-slate-400 print:border-black py-2 px-1.5 text-center text-slate-500">
                        {displayInmates.length} WBP
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Catatan & Rekomendasi Hasil Pemeriksaan */}
          {includeInspectionNotes && (
            <div className="text-xs border border-slate-300 print:border-black p-3 rounded-lg bg-slate-50/50 print:bg-transparent">
              <div className="font-bold uppercase tracking-wider text-slate-800 print:text-black mb-1">
                Catatan & Rekomendasi Petugas Pemeriksa:
              </div>
              <p className="text-slate-700 print:text-black leading-relaxed">
                {selectedKamar !== 'Semua Kamar' ? (
                  <>
                    Berdasarkan hasil pemeriksaan fisik dan inventarisasi sandang pada <strong>{selectedKamar}</strong>, 
                    dinyatakan bahwa dari <strong>{displayInmates.length} orang</strong> penghuni, 
                    {totalOverKuota === 0 && totalSitaan === 0 ? (
                      <span> seluruh penghuni kamar telah mematuhi kuota maksimal (2 stel pakaian seragam) dan tidak ditemukan pakaian berlebih maupun baju bebas terlarang.</span>
                    ) : (
                      <span> ditemukan <strong>{totalOverKuota} orang</strong> dengan pakaian berlebih dan <strong>{totalSitaan} pcs</strong> pakaian tidak standar yang telah diamankan/disita demi menjaga ketertiban serta mencegah potensi gangguan kamtib.</span>
                    )}
                  </>
                ) : (
                  <>
                    Rekapitulasi inventarisasi sandang ini mencakup data resmi warga binaan. Seluruh narapidana dan tahanan wajib menjaga seragam dinas dalam kondisi bersih dan layak pakai. Penambahan pakaian hanya diperkenankan melalui mekanisme tukar pakaian resmi (1-in 1-out).
                  </>
                )}
              </p>
            </div>
          )}

          {/* Official Signatures */}
          <div className="pt-6 grid grid-cols-2 text-center text-xs print:pt-4">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Kesatuan Pengamanan Lapas (Ka. KPR)</p>
              <div className="h-16 print:h-14"></div>
              <p className="font-bold underline">H. SUHARTONO, S.Sos., M.Si.</p>
              <p className="text-[11px] text-slate-600 print:text-black">NIP. 19780412 200212 1 002</p>
            </div>

            <div>
              <p>Brebes, {currentDate}</p>
              <p className="font-bold">Kepala Subseksi Registrasi & Bimpas</p>
              <div className="h-16 print:h-14"></div>
              <p className="font-bold underline">SURYANTO, A.Md.P., S.H.</p>
              <p className="text-[11px] text-slate-600 print:text-black">NIP. 19850615 200801 1 001</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
