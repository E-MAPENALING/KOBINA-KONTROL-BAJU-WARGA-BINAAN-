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
  Square,
  FileText,
  Shirt,
  User,
  RefreshCw,
  ArrowRightLeft,
  History,
  ExternalLink,
  Download,
  Info,
  UserCheck,
  Check
} from 'lucide-react';
import { RoomGroup, getAllSpecificRoomsFlat, getSpecificRoomsForBlok } from '../utils/kamarHelper';
import { executePrint, openInNewPrintTab, downloadPrintableDocument } from '../utils/printHelper';
import { getSavedPejabatConfig, savePejabatConfig, DEFAULT_PEJABAT_CONFIG, PejabatConfig } from '../utils/pejabatHelper';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmates: Inmate[];
  daftarBlok?: BlokHunian[];
  roomGroups?: RoomGroup[];
  initialKamar?: string;
  initialBlok?: string;
  initialDocumentType?: 'rekapitulasi' | 'kartu_kendali';
  initialInmateId?: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  inmates,
  daftarBlok = [],
  roomGroups = [],
  initialKamar,
  initialBlok,
  initialDocumentType = 'rekapitulasi',
  initialInmateId,
}) => {
  // Document Type: Berita Acara Rekapitulasi vs Kartu Kendali Pakaian
  const [documentType, setDocumentType] = useState<'rekapitulasi' | 'kartu_kendali'>(initialDocumentType);
  const [selectedInmateId, setSelectedInmateId] = useState<string>(initialInmateId || (inmates[0]?.id || ''));
  const [kartuScope, setKartuScope] = useState<'single' | 'room'>('single');
  const [printStatusNotice, setPrintStatusNotice] = useState<string | null>(null);

  // Filters inside modal
  const [selectedBlok, setSelectedBlok] = useState<string>('Semua Blok');
  const [selectedKamar, setSelectedKamar] = useState<string>('Semua Kamar');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Tahanan' | 'Warga Binaan'>('All');
  const [kondisiFilter, setKondisiFilter] = useState<'All' | 'Bermasalah' | 'Sesuai'>('All');
  const [includeSignatureCol, setIncludeSignatureCol] = useState<boolean>(true);
  const [includeInspectionNotes, setIncludeInspectionNotes] = useState<boolean>(true);

  // Pejabat & Penandatangan Configuration (Persisted in localStorage)
  const [pejabatConfig, setPejabatConfig] = useState<PejabatConfig>(getSavedPejabatConfig);
  const [showEditPejabat, setShowEditPejabat] = useState<boolean>(false);
  const [pejabatNotice, setPejabatNotice] = useState<string | null>(null);

  const handleUpdatePejabat = (field: keyof PejabatConfig, value: string) => {
    setPejabatConfig((prev) => {
      const next = { ...prev, [field]: value };
      savePejabatConfig(next);
      return next;
    });
  };

  const handleResetPejabat = () => {
    setPejabatConfig(DEFAULT_PEJABAT_CONFIG);
    savePejabatConfig(DEFAULT_PEJABAT_CONFIG);
    setPejabatNotice('Data pejabat berhasil dikembalikan ke pengaturan default!');
    setTimeout(() => setPejabatNotice(null), 3500);
  };

  // Sync initial selections when modal opens or initial props change
  useEffect(() => {
    if (isOpen) {
      if (initialDocumentType) {
        setDocumentType(initialDocumentType);
      }
      if (initialInmateId) {
        setSelectedInmateId(initialInmateId);
        const target = inmates.find((i) => i.id === initialInmateId);
        if (target) {
          if (target.kamarHunian) setSelectedKamar(target.kamarHunian);
          if (target.blok) setSelectedBlok(target.blok);
        }
      } else if (inmates.length > 0 && !selectedInmateId) {
        setSelectedInmateId(inmates[0].id);
      }

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
      }
      setStatusFilter('All');
      setKondisiFilter('All');
    }
  }, [isOpen, initialKamar, initialBlok, initialDocumentType, initialInmateId]);

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
        const hasSitaan = (inmate.bajuTerlarangDisita || 0) > 0;
        const isDamaged = inmate.kondisiBaju === 'Rusak' || inmate.kondisiBaju === 'Perlu Ganti';
        if (!isOver && !hasSitaan && !isDamaged) return false;
      } else if (kondisiFilter === 'Sesuai') {
        const isOver = inmate.pakaianList?.some((p) => p.jumlah > p.maxJumlah);
        const hasSitaan = (inmate.bajuTerlarangDisita || 0) > 0;
        if (isOver || hasSitaan) return false;
      }

      return true;
    });
  }, [inmates, selectedBlok, selectedKamar, statusFilter, kondisiFilter]);

  // Selected inmate for Kartu Kendali
  const selectedInmate = useMemo(() => {
    const found = inmates.find((i) => i.id === selectedInmateId);
    if (found) return found;
    return displayInmates[0] || inmates[0];
  }, [inmates, selectedInmateId, displayInmates]);

  // Statistics
  const totalBaju = displayInmates.reduce((acc, curr) => acc + (curr.jumlahBaju ?? curr.jumlahBajuMilik ?? 2), 0);
  const totalCelana = displayInmates.reduce((acc, curr) => acc + (curr.jumlahCelana ?? 2), 0);
  const totalSitaan = displayInmates.reduce((acc, curr) => acc + (curr.bajuTerlarangDisita || 0), 0);
  const totalTahanan = displayInmates.filter((i) => i.status === 'Tahanan').length;
  const totalWBP = displayInmates.filter((i) => i.status === 'Warga Binaan').length;
  const totalOverKuota = displayInmates.filter((i) =>
    (i.pakaianList || []).some((p) => p.jumlah > p.maxJumlah)
  ).length;

  // Synchronize printable content to #print-portal for immediate Ctrl + P printing
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const el = document.getElementById('printable-report-content');
      const portal = document.getElementById('print-portal');
      if (el && portal) {
        portal.innerHTML = el.innerHTML;
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isOpen, documentType, kartuScope, selectedInmateId, selectedKamar, selectedBlok, pejabatConfig]);

  if (!isOpen) return null;

  const getDocumentTitle = () => {
    if (documentType === 'kartu_kendali') {
      return kartuScope === 'single' && selectedInmate
        ? `Kartu_Kendali_Pakaian_${selectedInmate.nama.replace(/\s+/g, '_')}_${selectedInmate.noRegister}`
        : `Kartu_Kendali_Pakaian_Kamar_${selectedKamar.replace(/\s+/g, '_')}`;
    }
    return `Berita_Acara_Rekapitulasi_Kamar_${selectedKamar.replace(/\s+/g, '_')}_Lapas_Batang`;
  };

  const handlePrint = () => {
    const title = getDocumentTitle();
    const result = executePrint('printable-report-content', title);
    if (result.fallbackUsed === 'new-tab') {
      setPrintStatusNotice('Dokumen telah dibuka di Tab Baru untuk mencetak langsung tanpa batasan frame peramban.');
    } else if (result.fallbackUsed === 'download') {
      setPrintStatusNotice('Dialog cetak dicegah oleh peramban. Dokumen telah diunduh sebagai file HTML siap cetak ke perangkat Anda.');
    } else {
      setPrintStatusNotice('Dialog cetak dibuka. Jika tertahan oleh peramban, gunakan tombol "Buka Tab Cetak" untuk mencetak langsung.');
    }
  };

  const handleOpenNewTabPrint = () => {
    const el = document.getElementById('printable-report-content');
    const content = el ? el.innerHTML : '';
    const title = getDocumentTitle();
    const opened = openInNewPrintTab(title, content);
    if (!opened) {
      downloadPrintableDocument(title, content, title);
      setPrintStatusNotice('Jendela pop-up dicegah oleh browser. Berkas cetak A4 telah diunduh secara otomatis.');
    }
  };

  const handleDownloadHtml = () => {
    const el = document.getElementById('printable-report-content');
    const content = el ? el.innerHTML : '';
    const title = getDocumentTitle();
    downloadPrintableDocument(title, content, title);
    setPrintStatusNotice('File dokumen cetak resmi A4 berhasil diunduh.');
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const currentYear = new Date().getFullYear();

  // Render a single Kartu Kendali Pakaian A4 card
  const renderSingleKartuKendali = (inmateTarget: Inmate, isLast: boolean, index = 1) => {
    const pakaianList = inmateTarget.pakaianList || [];
    const riwayatPenukaran = inmateTarget.riwayatPenukaran || [];
    const riwayatKontrol = inmateTarget.riwayatKontrol || [];
    const riwayatMutasi = inmateTarget.riwayatMutasi || [];

    return (
      <div 
        key={inmateTarget.id} 
        className={`p-6 sm:p-8 space-y-4 text-slate-950 bg-white printable-card ${
          !isLast ? 'page-break-after border-b-4 border-slate-300 print:border-none' : ''
        }`}
      >
        {/* Institutional Kop Surat Resmi Lembaga */}
        <div className="border-b-2 border-slate-900 pb-2.5 text-center print:border-black">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-700 print:text-black">
            KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800 print:text-black">
            DIREKTORAT JENDERAL PEMASYARAKATAN
          </div>
          <div className="text-base sm:text-lg font-black uppercase text-slate-950 mt-0.5 print:text-black tracking-wide">
            LEMBAGA PEMASYARAKATAN KELAS IIB BATANG
          </div>
          <div className="text-[10px] text-slate-600 print:text-black">
            Jalan R.A. Kartini No. 49 • Telp: (0285) 391036 • Batang, Jawa Tengah 51215
          </div>
        </div>

        {/* Document Title & Subtitle */}
        <div className="text-center pt-0.5">
          <h2 className="text-base font-black uppercase underline tracking-wide print:text-black">
            KARTU KENDALI PAKAIAN
          </h2>
          <div className="text-[11px] font-bold text-slate-800 print:text-black mt-0.5 tracking-wide">
            KOBINA- KONTROL BAJU WARGA BINAAN
          </div>
          <div className="text-[10px] text-slate-600 print:text-black font-mono mt-0.5">
            NO. REGISTER: {inmateTarget.noRegister} • TANGGAL CETAK: {currentDate}
          </div>
        </div>

        {/* Profile & Room Placement Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border border-slate-400 p-2.5 rounded-lg bg-slate-50 print:bg-white print:border-black">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-32 text-slate-600 print:text-black font-semibold">Nama Lengkap:</span>
              <span className="font-bold text-slate-950 print:text-black">{inmateTarget.nama}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-600 print:text-black font-semibold">Nama Alias:</span>
              <span className="font-medium text-slate-800 print:text-black">{inmateTarget.alias || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-600 print:text-black font-semibold">No. Register:</span>
              <span className="font-mono font-bold text-slate-950 print:text-black">{inmateTarget.noRegister}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-600 print:text-black font-semibold">Status:</span>
              <span className="font-bold text-slate-900 print:text-black">{inmateTarget.status}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex">
              <span className="w-32 text-slate-600 print:text-black font-semibold">Kamar Hunian:</span>
              <span className="font-bold text-slate-950 print:text-black">
                {inmateTarget.kamarHunian} ({inmateTarget.blok})
              </span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-600 print:text-black font-semibold">Lokasi Sel (Roster):</span>
              <span className="font-mono font-bold text-slate-900 print:text-black">{inmateTarget.lokasiSel || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-600 print:text-black font-semibold">Tindak Pidana:</span>
              <span className="font-medium text-slate-900 print:text-black">{inmateTarget.jenisKejahatan}</span>
            </div>
          </div>
        </div>

        {/* Tabel 1: Data Inventarisasi Pakaian */}
        <div>
          <div className="text-[11px] font-bold text-slate-900 print:text-black uppercase mb-1">
            I. DATA INVENTARISASI PAKAIAN & SANDANG (BATAS MAKSIMAL KUOTA):
          </div>
          <table className="w-full text-xs text-left border-collapse border border-slate-400 print:border-black">
            <thead className="bg-slate-100 font-bold text-slate-900 uppercase text-[10px] text-center border-b border-slate-400 print:bg-slate-100 print:border-black">
              <tr>
                <th className="border border-slate-400 print:border-black py-1.5 px-2 text-left">Nama Pakaian</th>
                <th className="border border-slate-400 print:border-black py-1.5 px-2 text-center w-28">Jumlah Dimiliki</th>
                <th className="border border-slate-400 print:border-black py-1.5 px-2 text-center w-28">Batas Maksimal</th>
                <th className="border border-slate-400 print:border-black py-1.5 px-2 text-center w-32">Status Kuota</th>
                <th className="border border-slate-400 print:border-black py-1.5 px-2 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {pakaianList.map((p) => {
                const isOver = p.jumlah > p.maxJumlah;
                const isMax = p.jumlah === p.maxJumlah;
                return (
                  <tr key={p.id} className="border-b border-slate-300 print:border-black">
                    <td className="border border-slate-300 print:border-black py-1.5 px-2 font-bold text-slate-950 print:text-black">{p.namaItem}</td>
                    <td className="border border-slate-300 print:border-black py-1.5 px-2 text-center font-mono font-bold text-slate-900 print:text-black">{p.jumlah} pcs</td>
                    <td className="border border-slate-300 print:border-black py-1.5 px-2 text-center font-mono text-slate-600 print:text-black">{p.maxJumlah} pcs</td>
                    <td className="border border-slate-300 print:border-black py-1.5 px-2 text-center font-bold text-[10px]">
                      {isOver ? (
                        <span className="text-rose-700 print:text-black font-black">OVER KUOTA</span>
                      ) : isMax ? (
                        <span className="text-amber-700 print:text-black">MAKSIMAL (TUKAR)</span>
                      ) : (
                        <span className="text-emerald-700 print:text-black">SESUAI KUOTA</span>
                      )}
                    </td>
                    <td className="border border-slate-300 print:border-black py-1.5 px-2 text-[10px] text-slate-600 print:text-black">{p.keterangan || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tabel 2: Riwayat Pertukaran / Tukar Baju */}
        <div>
          <div className="text-[11px] font-bold text-slate-900 print:text-black uppercase mb-1">
            II. RIWAYAT PERGANTIAN & PENUKARAN PAKAIAN (TUKAR BAJU 1:1):
          </div>
          {riwayatPenukaran.length === 0 ? (
            <div className="text-[10px] text-slate-500 italic border border-slate-300 print:border-black p-2 rounded text-center">
              Belum ada riwayat pertukaran pakaian tercatat untuk Warga Binaan ini.
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse border border-slate-400 print:border-black">
              <thead className="bg-slate-100 font-bold text-slate-900 uppercase text-[10px] text-center border-b border-slate-400 print:bg-slate-100 print:border-black">
                <tr>
                  <th className="border border-slate-400 print:border-black py-1 px-1.5 w-7">No</th>
                  <th className="border border-slate-400 print:border-black py-1 px-2 text-center w-24">Tanggal</th>
                  <th className="border border-slate-400 print:border-black py-1 px-2 text-left">Pakaian Ditukar ➔ Pengganti</th>
                  <th className="border border-slate-400 print:border-black py-1 px-2 text-center w-16">Jumlah</th>
                  <th className="border border-slate-400 print:border-black py-1 px-2 text-left">Alasan / Kondisi</th>
                  <th className="border border-slate-400 print:border-black py-1 px-2 text-left w-28">Petugas</th>
                </tr>
              </thead>
              <tbody>
                {riwayatPenukaran.map((swap, sIdx) => (
                  <tr key={swap.id} className="border-b border-slate-300 print:border-black text-[11px]">
                    <td className="border border-slate-300 print:border-black py-1 px-1.5 text-center font-mono">{sIdx + 1}</td>
                    <td className="border border-slate-300 print:border-black py-1 px-2 text-center font-mono">{swap.tanggal}</td>
                    <td className="border border-slate-300 print:border-black py-1 px-2 font-bold text-slate-950 print:text-black">
                      {swap.itemDitukar} ➔ {swap.itemPengganti}
                    </td>
                    <td className="border border-slate-300 print:border-black py-1 px-2 text-center font-mono">{swap.jumlah} pcs</td>
                    <td className="border border-slate-300 print:border-black py-1 px-2">{swap.kondisiLama} - {swap.alasan}</td>
                    <td className="border border-slate-300 print:border-black py-1 px-2 text-slate-800 print:text-black">{swap.petugas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Tabel 3: Log Riwayat Pemeriksaan / Kontrol Fisik */}
        <div>
          <div className="text-[11px] font-bold text-slate-900 print:text-black uppercase mb-1">
            III. LOG RIWAYAT PEMERIKSAAN & KONTROL FISIK SANDANG:
          </div>
          {riwayatKontrol.length === 0 ? (
            <div className="text-[10px] text-slate-500 italic border border-slate-300 print:border-black p-2 rounded text-center">
              Pemeriksaan fisik berkala telah disinkronkan dengan rekapitulasi kamar hunian.
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse border border-slate-400 print:border-black">
              <thead className="bg-slate-100 font-bold text-slate-900 uppercase text-[10px] text-center border-b border-slate-400 print:bg-slate-100 print:border-black">
                <tr>
                  <th className="border border-slate-400 print:border-black py-1 px-1.5 w-7">No</th>
                  <th className="border border-slate-400 print:border-black py-1 px-2 text-center w-24">Tanggal</th>
                  <th className="border border-slate-400 print:border-black py-1 px-2 text-left w-32">Kategori Kontrol</th>
                  <th className="border border-slate-400 print:border-black py-1 px-2 text-left">Hasil / Catatan</th>
                  <th className="border border-slate-400 print:border-black py-1 px-2 text-center w-24">Kondisi</th>
                  <th className="border border-slate-400 print:border-black py-1 px-2 text-left w-28">Petugas</th>
                </tr>
              </thead>
              <tbody>
                {riwayatKontrol.slice(0, 5).map((rec, rIdx) => (
                  <tr key={rec.id} className="border-b border-slate-300 print:border-black text-[11px]">
                    <td className="border border-slate-300 print:border-black py-1 px-1.5 text-center font-mono">{rIdx + 1}</td>
                    <td className="border border-slate-300 print:border-black py-1 px-2 text-center font-mono">{rec.tanggal}</td>
                    <td className="border border-slate-300 print:border-black py-1 px-2 font-bold text-slate-950 print:text-black">{rec.kategoriAksi}</td>
                    <td className="border border-slate-300 print:border-black py-1 px-2">{rec.catatan || '-'}</td>
                    <td className="border border-slate-300 print:border-black py-1 px-2 text-center font-semibold">{rec.kondisi}</td>
                    <td className="border border-slate-300 print:border-black py-1 px-2 text-slate-800 print:text-black">{rec.petugas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Official Signatures Section */}
        <div className="pt-4 flex justify-end text-center text-xs print:pt-3">
          <div className="w-64">
            <p>{pejabatConfig.kota || 'Batang'}, {currentDate}</p>
            <p className="font-bold">PETUGAS</p>
            <div className="h-14 print:h-12"></div>
            <p className="font-bold underline">{pejabatConfig.namaPetugas || 'SURYANTO, A.Md.P., S.H.'}</p>
            <p className="text-[11px] text-slate-600 print:text-black">
              {pejabatConfig.nipPetugas ? `NIP. ${pejabatConfig.nipPetugas}` : ''}
            </p>
          </div>
        </div>
      </div>
    );
  };

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
                  KONTROL BAJU WARGA BINAAN
                </h3>
                <p className="text-xs text-amber-300/90 font-medium">
                  Cetak Berita Acara Rekapitulasi Kamar atau Kartu Kendali Pakaian resmi Lapas Kelas IIB Batang
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              <button
                id="btn-trigger-print"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-200 transition active:scale-95"
                title="Cetak Sekarang (A4) - Menjalankan Dialog Cetak Browser"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>Cetak Dokumen (A4)</span>
              </button>

              <button
                id="btn-open-new-tab-print"
                onClick={handleOpenNewTabPrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm border border-cyan-400/40 transition active:scale-95"
                title="Buka Pratinjau di Tab Baru Browser (Bypass Batasan Frame)"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Tab Cetak</span>
              </button>

              <button
                id="btn-download-print-file"
                onClick={handleDownloadHtml}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#0b2b4f] hover:bg-[#123e6f] text-slate-200 hover:text-white border border-blue-500/40 transition active:scale-95"
                title="Unduh File HTML Siap Cetak (Dapat dibuka & dicetak kapan saja)"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Unduh File</span>
              </button>

              <button
                id="btn-toggle-edit-pejabat"
                onClick={() => setShowEditPejabat(!showEditPejabat)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition active:scale-95 ${
                  showEditPejabat
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                    : 'bg-[#0f3156] hover:bg-[#154476] text-amber-300 hover:text-amber-200 border-amber-400/50'
                }`}
                title="Menu Edit Nama Pejabat / Petugas Penandatangan Dokumen"
              >
                <UserCheck className="w-4 h-4" />
                <span>{showEditPejabat ? 'Tutup Edit Pejabat' : 'Edit Nama Pejabat'}</span>
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

          {/* Menu Edit Nama Pejabat Penandatangan */}
          {showEditPejabat && (
            <div className="mx-4 sm:mx-6 my-3 p-4 rounded-2xl bg-[#081e35] border-2 border-amber-400 shadow-2xl animate-fadeIn space-y-3.5">
              <div className="flex items-center justify-between border-b border-blue-800/80 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-condensed">
                    Menu Edit Nama Pejabat & Penandatangan Dokumen
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-medium">
                    Tersimpan Otomatis (Real-Time)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetPejabat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-[#06172a] hover:bg-rose-900/40 border border-slate-700 hover:border-rose-500/50 rounded-lg transition"
                    title="Kembalikan nama pejabat ke setelan default"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditPejabat(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-blue-900/50 transition"
                    title="Tutup Panel Edit Pejabat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {pejabatNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">{pejabatNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Petugas Penandatangan (Kartu Kendali & Rekapitulasi) */}
                <div className="p-3.5 bg-[#051526] rounded-xl border border-blue-900/80 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-blue-900/60 pb-1.5">
                    <span className="font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span>1. Petugas Penandatangan</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Kartu Kendali & Rekap</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Nama Lengkap Petugas & Gelar:
                    </label>
                    <input
                      type="text"
                      value={pejabatConfig.namaPetugas}
                      onChange={(e) => handleUpdatePejabat('namaPetugas', e.target.value)}
                      placeholder="Contoh: SURYANTO, A.Md.P., S.H."
                      className="w-full px-3 py-2 bg-[#0b2440] border border-blue-700/80 rounded-xl text-white font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        NIP Petugas:
                      </label>
                      <input
                        type="text"
                        value={pejabatConfig.nipPetugas}
                        onChange={(e) => handleUpdatePejabat('nipPetugas', e.target.value)}
                        placeholder="19850615 200801 1 001"
                        className="w-full px-2.5 py-2 bg-[#0b2440] border border-blue-700/80 rounded-xl text-slate-100 font-mono focus:ring-2 focus:ring-amber-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Judul Jabatan / Label:
                      </label>
                      <input
                        type="text"
                        value={pejabatConfig.judulPetugas}
                        onChange={(e) => handleUpdatePejabat('judulPetugas', e.target.value)}
                        placeholder="PETUGAS"
                        className="w-full px-2.5 py-2 bg-[#0b2440] border border-blue-700/80 rounded-xl text-slate-100 font-semibold focus:ring-2 focus:ring-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Kota Penerbitan Dokumen:
                    </label>
                    <input
                      type="text"
                      value={pejabatConfig.kota}
                      onChange={(e) => handleUpdatePejabat('kota', e.target.value)}
                      placeholder="Batang"
                      className="w-full px-3 py-1.5 bg-[#0b2440] border border-blue-700/80 rounded-xl text-slate-100 focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>
                </div>

                {/* 2. Pejabat Atasan / Mengetahui */}
                <div className="p-3.5 bg-[#051526] rounded-xl border border-blue-900/80 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-blue-900/60 pb-1.5">
                    <span className="font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span>2. Pejabat Mengetahui / Atasan</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Berita Acara Rekap</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Nama Pejabat Atasan & Gelar:
                    </label>
                    <input
                      type="text"
                      value={pejabatConfig.namaAtasan}
                      onChange={(e) => handleUpdatePejabat('namaAtasan', e.target.value)}
                      placeholder="Contoh: H. SUHARTONO, S.Sos., M.Si."
                      className="w-full px-3 py-2 bg-[#0b2440] border border-blue-700/80 rounded-xl text-white font-bold focus:ring-2 focus:ring-cyan-400 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        NIP Pejabat Atasan:
                      </label>
                      <input
                        type="text"
                        value={pejabatConfig.nipAtasan}
                        onChange={(e) => handleUpdatePejabat('nipAtasan', e.target.value)}
                        placeholder="19780412 200212 1 002"
                        className="w-full px-2.5 py-2 bg-[#0b2440] border border-blue-700/80 rounded-xl text-slate-100 font-mono focus:ring-2 focus:ring-cyan-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Jabatan Atasan:
                      </label>
                      <input
                        type="text"
                        value={pejabatConfig.judulAtasan}
                        onChange={(e) => handleUpdatePejabat('judulAtasan', e.target.value)}
                        placeholder="Kepala Kesatuan Pengamanan Lapas (Ka. KPR)"
                        className="w-full px-2.5 py-2 bg-[#0b2440] border border-blue-700/80 rounded-xl text-slate-100 focus:ring-2 focus:ring-cyan-400 outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic pt-1">
                    * Perubahan nama pejabat langsung diterapkan secara real-time ke pratinjau dokumen cetak di bawah dan tersimpan otomatis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status / Fallback Notice Banner */}
          {printStatusNotice && (
            <div className="mx-4 sm:mx-6 mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-between text-xs text-amber-200 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{printStatusNotice}</span>
              </div>
              <button 
                onClick={() => setPrintStatusNotice(null)} 
                className="text-slate-400 hover:text-white ml-2 p-1"
                title="Tutup Pemberitahuan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Help Tip */}
          <div className="px-4 sm:px-6 py-2 bg-blue-950/70 border-t border-b border-blue-900/40 flex items-center justify-between text-[11px] text-blue-200/90">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Petunjuk:</strong> Klik <strong>Cetak Dokumen (A4)</strong> untuk mencetak langsung. Jika dialog cetak browser terhalang oleh pembatasan iframe preview, klik tombol <strong>Buka Tab Cetak</strong> untuk mencetak di tab terpisah tanpa batasan.
              </span>
            </div>
          </div>

          {/* Document Type Selector (Tabs) */}
          <div className="px-4 sm:px-6 pt-3 pb-2 bg-[#071d34] border-b border-blue-900/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Pilih Jenis Dokumen:</span>
              <div className="flex items-center gap-1.5 p-1 bg-[#051424] rounded-xl border border-blue-900/80">
                <button
                  id="btn-tab-rekapitulasi"
                  onClick={() => setDocumentType('rekapitulasi')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    documentType === 'rekapitulasi'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>1. Berita Acara Rekapitulasi Kamar</span>
                </button>
                <button
                  id="btn-tab-kartu-kendali"
                  onClick={() => setDocumentType('kartu_kendali')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    documentType === 'kartu_kendali'
                      ? 'bg-cyan-400 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
                  }`}
                >
                  <Shirt className="w-3.5 h-3.5" />
                  <span>2. Kartu Kendali Pakaian Warga Binaan</span>
                </button>
              </div>
            </div>

            {documentType === 'kartu_kendali' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Cakupan Cetak:</span>
                <div className="flex items-center gap-1 p-0.5 bg-[#051424] rounded-lg border border-blue-900/80 text-xs">
                  <button
                    onClick={() => setKartuScope('single')}
                    className={`px-2.5 py-1 rounded-md font-bold transition ${
                      kartuScope === 'single'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1 WBP Terpilih
                  </button>
                  <button
                    onClick={() => setKartuScope('room')}
                    className={`px-2.5 py-1 rounded-md font-bold transition ${
                      kartuScope === 'room'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua di Kamar ({displayInmates.length} WBP)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Selection Controls */}
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

              {/* 2. Pilih Kamar Hunian */}
              <div>
                <label htmlFor="select-print-kamar" className="block font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2. Pilih Kamar Hunian:</span>
                </label>
                <select
                  id="select-print-kamar"
                  value={selectedKamar}
                  onChange={(e) => setSelectedKamar(e.target.value)}
                  className="w-full px-3 py-2 bg-[#061527] border border-blue-800/80 rounded-xl text-slate-100 font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                >
                  <option value="Semua Kamar">
                    {selectedBlok !== 'Semua Blok' ? `Semua Kamar di ${selectedBlok}` : 'Semua Kamar (Lapas)'}
                  </option>
                  {availableRooms.map((room) => {
                    const count = roomOccupancyMap.get(room) || 0;
                    return (
                      <option key={room} value={room}>
                        {room} ({count} WBP)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 3. Conditional: Filter Status OR Inmate Picker */}
              {documentType === 'kartu_kendali' ? (
                <div>
                  <label htmlFor="select-print-wbp" className="block font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>3. Pilih Warga Binaan:</span>
                  </label>
                  <select
                    id="select-print-wbp"
                    value={selectedInmateId}
                    onChange={(e) => setSelectedInmateId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#061527] border border-cyan-600/80 rounded-xl text-amber-300 font-bold focus:ring-2 focus:ring-cyan-400 outline-none"
                  >
                    {displayInmates.length > 0 ? (
                      displayInmates.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nama} ({i.kamarHunian} • {i.noRegister})
                        </option>
                      ))
                    ) : (
                      inmates.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nama} ({i.kamarHunian} • {i.noRegister})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              ) : (
                <div>
                  <label htmlFor="select-print-status" className="block font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>3. Status Tahanan / WBP:</span>
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
              )}

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
                  <span>Sertakan Kolom Tanda Tangan Resmi</span>
                </label>

                {documentType === 'rekapitulasi' && (
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={includeInspectionNotes}
                      onChange={(e) => setIncludeInspectionNotes(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-[#061527] border-blue-800"
                    />
                    <span>Sertakan Catatan & Rekomendasi Hasil Sidak</span>
                  </label>
                )}
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
                <span className="font-bold text-slate-400 uppercase font-condensed tracking-wider">Dokumen Aktif:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold border ${
                  documentType === 'kartu_kendali'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                }`}>
                  {documentType === 'kartu_kendali' ? 'KARTU KENDALI PAKAIAN' : 'BERITA ACARA REKAPITULASI'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-semibold">
                  {documentType === 'kartu_kendali' && kartuScope === 'single'
                    ? `WBP: ${selectedInmate?.nama || '-'} (${selectedInmate?.kamarHunian || '-'})`
                    : selectedKamar !== 'Semua Kamar' ? `Kamar: ${selectedKamar}` : `Blok: ${selectedBlok}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Total Penghuni: <strong className="text-white">{displayInmates.length}</strong> Orang</span>
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
        <div id="printable-report-content" className="printable-area bg-white printable-document">
          
          {documentType === 'kartu_kendali' ? (
            /* ========================================================= */
            /* DOCUMENT 2: KARTU KENDALI PAKAIAN WARGA BINAAN            */
            /* ========================================================= */
            kartuScope === 'single' ? (
              selectedInmate ? (
                renderSingleKartuKendali(selectedInmate, true)
              ) : (
                <div className="p-8 text-center text-slate-500">Pilih Warga Binaan untuk mencetak kartu kendali.</div>
              )
            ) : (
              displayInmates.length > 0 ? (
                displayInmates.map((inmateItem, idx) =>
                  renderSingleKartuKendali(inmateItem, idx === displayInmates.length - 1, idx + 1)
                )
              ) : (
                <div className="p-8 text-center text-slate-500">Tidak ada Warga Binaan pada kamar hunian yang dipilih.</div>
              )
            )
          ) : (
            /* ========================================================= */
            /* DOCUMENT 1: BERITA ACARA REKAPITULASI SANDANG KAMAR       */
            /* ========================================================= */
            <div className="p-6 sm:p-8 space-y-5 text-slate-950">
              {/* Institutional Kop Surat Resmi Lembaga */}
              <div className="border-b-2 border-slate-900 pb-3 text-center print:border-black">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700 print:text-black">
                  KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800 print:text-black">
                  DIREKTORAT JENDERAL PEMASYARAKATAN
                </div>
                <div className="text-lg font-black uppercase text-slate-950 mt-0.5 print:text-black tracking-wide">
                  LEMBAGA PEMASYARAKATAN KELAS IIB BATANG
                </div>
                <div className="text-[11px] text-slate-600 print:text-black">
                  Jalan R.A. Kartini No. 49 • Telp: (0285) 391036 • Batang, Jawa Tengah 51215
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
                    <span className="font-semibold text-slate-800 print:text-black">{pejabatConfig.namaPetugas || 'PETUGAS'}</span>
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
                  <p className="font-bold">{pejabatConfig.judulAtasan || 'Kepala Kesatuan Pengamanan Lapas (Ka. KPR)'}</p>
                  <div className="h-16 print:h-14"></div>
                  <p className="font-bold underline">{pejabatConfig.namaAtasan || 'H. SUHARTONO, S.Sos., M.Si.'}</p>
                  <p className="text-[11px] text-slate-600 print:text-black">
                    {pejabatConfig.nipAtasan ? `NIP. ${pejabatConfig.nipAtasan}` : ''}
                  </p>
                </div>

                <div>
                  <p>{pejabatConfig.kota || 'Batang'}, {currentDate}</p>
                  <p className="font-bold">{pejabatConfig.judulPetugas || 'PETUGAS'}</p>
                  <div className="h-16 print:h-14"></div>
                  <p className="font-bold underline">{pejabatConfig.namaPetugas || 'SURYANTO, A.Md.P., S.H.'}</p>
                  <p className="text-[11px] text-slate-600 print:text-black">
                    {pejabatConfig.nipPetugas ? `NIP. ${pejabatConfig.nipPetugas}` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
