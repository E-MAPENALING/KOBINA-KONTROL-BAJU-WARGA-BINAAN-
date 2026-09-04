import React, { useState, useEffect, useMemo } from 'react';
import { BlokHunian, Inmate, KamarDetail, MutasiKamarRecord } from '../types';
import {
  X,
  ArrowRightLeft,
  Users,
  Building2,
  DoorOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  History,
  FileText,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface MutasiKamarModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmates: Inmate[];
  daftarBlok: BlokHunian[];
  kamarDetails?: KamarDetail[];
  initialInmate?: Inmate | null;
  onExecuteMutasi: (
    inmateIds: string[],
    targetBlok: string,
    targetKamarNomor: string,
    targetKamarFull: string,
    alasan: string,
    petugas: string,
    catatan?: string
  ) => void;
}

type MutasiTab = 'single' | 'batch' | 'history';

const ALASAN_MUTASI_OPTIONS = [
  'Selesai Masa Pengenalan Lingkungan (Mapenaling)',
  'Pemerataan Kapasitas Kamar Hunian',
  'Pertimbangan Keamanan & Ketertiban (Kamtib)',
  'Kebutuhan Medis & Kesehatan',
  'Penempatan Kamar Isolasi / Disiplin',
  'Pembinaan & Penempatan Tamping Kerja',
  'Pencegahan Konflik Antar Penghuni',
  'Lainnya (Tuliskan pada Catatan)',
];

export const MutasiKamarModal: React.FC<MutasiKamarModalProps> = ({
  isOpen,
  onClose,
  inmates = [],
  daftarBlok = [],
  kamarDetails = [],
  initialInmate = null,
  onExecuteMutasi,
}) => {
  // Navigation Tab
  const [activeTab, setActiveTab] = useState<MutasiTab>('single');

  // Single WBP Selection State
  const [selectedInmateId, setSelectedInmateId] = useState<string>('');
  const [searchSingleQuery, setSearchSingleQuery] = useState<string>('');
  const [filterSourceBlok, setFilterSourceBlok] = useState<string>('All');

  // Batch WBP Selection State
  const [batchSourceBlok, setBatchSourceBlok] = useState<string>(daftarBlok[0]?.nama || 'BLOK B');
  const [batchSourceKamar, setBatchSourceKamar] = useState<string>('');
  const [selectedBatchInmateIds, setSelectedBatchInmateIds] = useState<string[]>([]);

  // Destination (Target) Selection State
  const [targetBlok, setTargetBlok] = useState<string>(daftarBlok[0]?.nama || 'BLOK B');
  const [targetKamarFull, setTargetKamarFull] = useState<string>('');

  // Form Administration State
  const [tanggalMutasi, setTanggalMutasi] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [alasanMutasi, setAlasanMutasi] = useState<string>(ALASAN_MUTASI_OPTIONS[0]);
  const [alasanKustom, setAlasanKustom] = useState<string>('');
  const [petugasMutasi, setPetugasMutasi] = useState<string>('Kasi Binadik / Ka.KPR');
  const [catatanMutasi, setCatatanMutasi] = useState<string>('');

  // UI Feedback & Search in History
  const [formError, setFormError] = useState<string>('');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync initialInmate when opened
  useEffect(() => {
    if (initialInmate) {
      setSelectedInmateId(initialInmate.id);
      setActiveTab('single');
      // Set default target to a different room in same block or next block
      const diffBlok = daftarBlok.find((b) => b.nama !== initialInmate.blok)?.nama || initialInmate.blok;
      setTargetBlok(diffBlok);
    } else if (inmates.length > 0 && !selectedInmateId) {
      setSelectedInmateId(inmates[0].id);
    }
  }, [initialInmate, isOpen]);

  // Rooms available for current target block
  const targetBlockRooms = useMemo(() => {
    const tb = targetBlok.toLowerCase().trim();
    return (kamarDetails || [])
      .filter((k) => {
        if (!k.blokNama) return false;
        return k.blokNama.toLowerCase().trim() === tb || k.namaLengkap.toLowerCase().startsWith(tb);
      })
      .sort((a, b) => a.nomorKamar.localeCompare(b.nomorKamar, undefined, { numeric: true, sensitivity: 'base' }));
  }, [kamarDetails, targetBlok]);

  // Set default target kamar when targetBlockRooms change
  useEffect(() => {
    if (targetBlockRooms.length > 0) {
      // Find a room that isn't the source room if possible
      const currentSelected = inmates.find((i) => i.id === selectedInmateId);
      const differentRoom = targetBlockRooms.find(
        (r) => !currentSelected || r.namaLengkap.toLowerCase().trim() !== (currentSelected.kamarHunian || '').toLowerCase().trim()
      );
      setTargetKamarFull(differentRoom ? differentRoom.namaLengkap : targetBlockRooms[0].namaLengkap);
    } else {
      setTargetKamarFull('');
    }
  }, [targetBlok, targetBlockRooms, selectedInmateId]);

  // Rooms available for batch source block
  const batchSourceRooms = useMemo(() => {
    const sb = batchSourceBlok.toLowerCase().trim();
    return (kamarDetails || [])
      .filter((k) => {
        if (!k.blokNama) return false;
        return k.blokNama.toLowerCase().trim() === sb || k.namaLengkap.toLowerCase().startsWith(sb);
      })
      .sort((a, b) => a.nomorKamar.localeCompare(b.nomorKamar, undefined, { numeric: true, sensitivity: 'base' }));
  }, [kamarDetails, batchSourceBlok]);

  // Set default batch source kamar
  useEffect(() => {
    if (batchSourceRooms.length > 0 && (!batchSourceKamar || !batchSourceRooms.some((r) => r.namaLengkap === batchSourceKamar))) {
      setBatchSourceKamar(batchSourceRooms[0].namaLengkap);
    }
  }, [batchSourceBlok, batchSourceRooms]);

  // Inmates in the selected batch source room
  const batchSourceOccupants = useMemo(() => {
    if (!batchSourceKamar) return [];
    const bsk = batchSourceKamar.toLowerCase().trim();
    return inmates.filter((i) => (i.kamarHunian || '').toLowerCase().trim() === bsk);
  }, [inmates, batchSourceKamar]);

  // Filtered inmates for single search dropdown
  const filteredSingleInmates = useMemo(() => {
    const q = searchSingleQuery.toLowerCase().trim();
    return inmates.filter((i) => {
      if (filterSourceBlok !== 'All' && (i.blok || '').toLowerCase().trim() !== filterSourceBlok.toLowerCase().trim()) {
        return false;
      }
      if (!q) return true;
      const matchName = (i.nama || '').toLowerCase().includes(q);
      const matchAlias = (i.alias || '').toLowerCase().includes(q);
      const matchReg = (i.noRegister || '').toLowerCase().includes(q);
      const matchRoom = (i.kamarHunian || '').toLowerCase().includes(q);
      return matchName || matchAlias || matchReg || matchRoom;
    });
  }, [inmates, searchSingleQuery, filterSourceBlok]);

  // Currently selected single inmate object
  const currentSingleInmate = useMemo(() => {
    return inmates.find((i) => i.id === selectedInmateId) || null;
  }, [inmates, selectedInmateId]);

  // Target Room details & occupancy projection
  const targetRoomDetail = useMemo(() => {
    return (kamarDetails || []).find((k) => k.namaLengkap.toLowerCase().trim() === targetKamarFull.toLowerCase().trim()) || null;
  }, [kamarDetails, targetKamarFull]);

  const targetRoomCurrentOccupants = useMemo(() => {
    if (!targetKamarFull) return [];
    const tkf = targetKamarFull.toLowerCase().trim();
    return inmates.filter((i) => (i.kamarHunian || '').toLowerCase().trim() === tkf);
  }, [inmates, targetKamarFull]);

  // Inmates being moved count
  const movingCount = activeTab === 'single' ? (currentSingleInmate ? 1 : 0) : selectedBatchInmateIds.length;
  const targetCapacity = targetRoomDetail?.kapasitas || 15;
  const targetProjectedOccupancy = targetRoomCurrentOccupants.length + movingCount;
  const isTargetOverCapacity = targetProjectedOccupancy > targetCapacity;

  // Aggregate all mutation records across all inmates for History tab
  const allMutationLogs = useMemo(() => {
    const logs: Array<{ inmate: Inmate; record: MutasiKamarRecord }> = [];
    inmates.forEach((inmate) => {
      if (inmate.riwayatMutasi && Array.isArray(inmate.riwayatMutasi)) {
        inmate.riwayatMutasi.forEach((rec) => {
          logs.push({ inmate, record: rec });
        });
      }
      // Also look for KontrolRecord with category 'Mutasi Kamar / Blok'
      if (inmate.riwayatKontrol && Array.isArray(inmate.riwayatKontrol)) {
        inmate.riwayatKontrol.forEach((kRec) => {
          if (kRec.kategoriAksi === 'Mutasi Kamar / Blok') {
            // Check if not already in logs
            const exists = logs.some((l) => l.record.id === `mutasi-${kRec.id}` || l.record.tanggal === kRec.tanggal);
            if (!exists) {
              logs.push({
                inmate,
                record: {
                  id: kRec.id,
                  tanggal: kRec.tanggal,
                  jam: '10:00',
                  blokAsal: inmate.blok,
                  kamarAsal: inmate.kamarNomor,
                  blokTujuan: inmate.blok,
                  kamarTujuan: inmate.kamarNomor,
                  alasan: kRec.catatan || 'Mutasi kamar',
                  petugas: kRec.petugas,
                  catatan: kRec.catatan,
                },
              });
            }
          }
        });
      }
    });

    return logs.sort((a, b) => b.record.tanggal.localeCompare(a.record.tanggal));
  }, [inmates]);

  const filteredHistoryLogs = useMemo(() => {
    const q = historySearch.toLowerCase().trim();
    if (!q) return allMutationLogs;
    return allMutationLogs.filter(({ inmate, record }) => {
      const matchName = (inmate.nama || '').toLowerCase().includes(q);
      const matchReg = (inmate.noRegister || '').toLowerCase().includes(q);
      const matchAsal = `${record.blokAsal} ${record.kamarAsal}`.toLowerCase().includes(q);
      const matchTujuan = `${record.blokTujuan} ${record.kamarTujuan}`.toLowerCase().includes(q);
      const matchAlasan = (record.alasan || '').toLowerCase().includes(q);
      const matchPetugas = (record.petugas || '').toLowerCase().includes(q);
      return matchName || matchReg || matchAsal || matchTujuan || matchAlasan || matchPetugas;
    });
  }, [allMutationLogs, historySearch]);

  // Batch toggle all
  const handleToggleSelectAllBatch = () => {
    if (selectedBatchInmateIds.length === batchSourceOccupants.length) {
      setSelectedBatchInmateIds([]);
    } else {
      setSelectedBatchInmateIds(batchSourceOccupants.map((i) => i.id));
    }
  };

  const handleToggleBatchInmate = (id: string) => {
    setSelectedBatchInmateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit Handler
  const handleSubmitMutasi = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Determine inmates to move
    let inmateIdsToMove: string[] = [];
    if (activeTab === 'single') {
      if (!selectedInmateId) {
        setFormError('Silakan pilih warga binaan yang akan dimutasi.');
        return;
      }
      inmateIdsToMove = [selectedInmateId];
    } else if (activeTab === 'batch') {
      if (selectedBatchInmateIds.length === 0) {
        setFormError('Silakan pilih setidaknya satu warga binaan pada daftar penghuni untuk dimutasi.');
        return;
      }
      inmateIdsToMove = selectedBatchInmateIds;
    }

    if (!targetKamarFull) {
      setFormError('Silakan tentukan kamar hunian tujuan pemindahan.');
      return;
    }

    // Verify that target is not identical to current room
    if (activeTab === 'single' && currentSingleInmate) {
      if ((currentSingleInmate.kamarHunian || '').toLowerCase().trim() === targetKamarFull.toLowerCase().trim()) {
        setFormError(`Kamar tujuan (${targetKamarFull}) sama dengan kamar hunian saat ini. Pilih kamar lain.`);
        return;
      }
    } else if (activeTab === 'batch') {
      if (batchSourceKamar.toLowerCase().trim() === targetKamarFull.toLowerCase().trim()) {
        setFormError(`Kamar tujuan (${targetKamarFull}) sama dengan kamar asal (${batchSourceKamar}). Pilih kamar lain.`);
        return;
      }
    }

    // Derive target room number
    const lastDash = targetKamarFull.lastIndexOf('-');
    const targetNomor = lastDash !== -1 ? targetKamarFull.slice(lastDash + 1).trim() : targetKamarFull.trim();
    const effectiveAlasan = alasanMutasi === 'Lainnya (Tuliskan pada Catatan)' && alasanKustom.trim()
      ? alasanKustom.trim()
      : alasanMutasi;

    onExecuteMutasi(
      inmateIdsToMove,
      targetBlok,
      targetNomor,
      targetKamarFull,
      effectiveAlasan,
      petugasMutasi.trim() || 'Petugas Regbimpas / Kamtib',
      catatanMutasi.trim() || undefined
    );

    showToast(`Mutasi berhasil: ${inmateIdsToMove.length} WBP telah dipindahkan ke ${targetKamarFull}.`);

    // Reset selection
    if (activeTab === 'batch') {
      setSelectedBatchInmateIds([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl font-medium text-xs border border-emerald-400 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Modal Card */}
      <div className="bg-[#081b33] rounded-2xl shadow-2xl w-full max-w-4xl border border-blue-900/80 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#06182c] via-[#092548] to-[#06182c] px-5 py-4 border-b border-blue-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-sm">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white font-condensed tracking-wider uppercase">
                  MUTASI KAMAR & BLOK WARGA BINAAN
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  Lapas Kelas IIB Batang
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pengelolaan mutasi/pemindahan kamar hunian individu maupun rombongan dengan pencatatan berita acara otomatis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-blue-900/50 transition"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#051324] px-5 py-2.5 border-b border-blue-900/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`px-3.5 py-1.5 rounded-xl font-condensed tracking-wider text-xs font-bold transition flex items-center gap-2 border ${
                activeTab === 'single'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                  : 'bg-[#0a2342]/60 text-slate-300 hover:text-white hover:bg-blue-900/40 border-blue-900/80'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mutasi Perorangan (1 WBP)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('batch')}
              className={`px-3.5 py-1.5 rounded-xl font-condensed tracking-wider text-xs font-bold transition flex items-center gap-2 border ${
                activeTab === 'batch'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                  : 'bg-[#0a2342]/60 text-slate-300 hover:text-white hover:bg-blue-900/40 border-blue-900/80'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Mutasi Massal / Rombongan</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl font-condensed tracking-wider text-xs font-semibold transition flex items-center gap-1.5 border ${
              activeTab === 'history'
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md'
                : 'bg-[#09203d] text-amber-300 hover:text-white hover:bg-blue-900/40 border-blue-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Log Riwayat Mutasi ({allMutationLogs.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* Error Banner */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* TAB 1 & 2: Form Mutasi (Single / Batch) */}
          {activeTab !== 'history' && (
            <form onSubmit={handleSubmitMutasi} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* LEFT COLUMN: Source Selection (Asal WBP) */}
                <div className="p-4 rounded-2xl bg-[#061527] border border-blue-900/70 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-900/60 pb-2.5">
                    <span className="font-bold text-white uppercase tracking-wider font-condensed flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      1. Pilih WBP & Kamar Asal
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-950 text-slate-300 border border-blue-800">
                      {activeTab === 'single' ? 'Individu' : 'Multi-Penghuni'}
                    </span>
                  </div>

                  {/* Mode: Single Selection */}
                  {activeTab === 'single' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={searchSingleQuery}
                            onChange={(e) => setSearchSingleQuery(e.target.value)}
                            placeholder="Cari Nama, Alias, No. Register..."
                            className="w-full pl-8 pr-3 py-2 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                          />
                        </div>
                        <select
                          value={filterSourceBlok}
                          onChange={(e) => setFilterSourceBlok(e.target.value)}
                          className="px-2.5 py-2 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-400"
                        >
                          <option value="All">Semua Blok</option>
                          {daftarBlok.map((b) => (
                            <option key={b.id} value={b.nama}>
                              {b.nama}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">
                          Pilih Warga Binaan: <span className="text-rose-400">*</span>
                        </label>
                        <select
                          value={selectedInmateId}
                          onChange={(e) => setSelectedInmateId(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-400"
                        >
                          <option value="">-- Pilih Warga Binaan ({filteredSingleInmates.length} WBP) --</option>
                          {filteredSingleInmates.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.nama} {i.alias ? `(als: ${i.alias})` : ''} - {i.noRegister} [{i.kamarHunian}]
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Selected Inmate Card */}
                      {currentSingleInmate && (
                        <div className="p-3.5 rounded-xl bg-[#092242] border border-cyan-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">
                              {currentSingleInmate.nama}
                              {currentSingleInmate.alias && (
                                <span className="text-xs text-slate-400 font-normal"> (als: {currentSingleInmate.alias})</span>
                              )}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              currentSingleInmate.status === 'Tahanan'
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                                : 'bg-blue-950/70 text-cyan-300 border border-blue-500/40'
                            }`}>
                              {currentSingleInmate.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t border-blue-900/60">
                            <div>
                              <span className="text-slate-400 block text-[10px]">No. Register:</span>
                              <strong className="text-amber-300 font-mono">{currentSingleInmate.noRegister}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Tindak Pidana:</span>
                              <span className="truncate block">{currentSingleInmate.jenisKejahatan}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Kamar Asal Saat Ini:</span>
                              <strong className="text-white">{currentSingleInmate.kamarHunian}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Kondisi Sandang:</span>
                              <span className="text-emerald-400 font-semibold">{currentSingleInmate.kondisiBaju || 'Layak Pakai'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode: Batch Multi Selection */}
                  {activeTab === 'batch' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">Blok Asal:</label>
                          <select
                            value={batchSourceBlok}
                            onChange={(e) => setBatchSourceBlok(e.target.value)}
                            className="w-full px-2.5 py-2 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs"
                          >
                            {daftarBlok.map((b) => (
                              <option key={b.id} value={b.nama}>
                                {b.nama}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">Kamar Asal:</label>
                          <select
                            value={batchSourceKamar}
                            onChange={(e) => setBatchSourceKamar(e.target.value)}
                            className="w-full px-2.5 py-2 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs"
                          >
                            {batchSourceRooms.map((r) => {
                              const occ = inmates.filter((i) => (i.kamarHunian || '').toLowerCase().trim() === r.namaLengkap.toLowerCase().trim()).length;
                              return (
                                <option key={r.id} value={r.namaLengkap}>
                                  {r.namaLengkap} ({occ} WBP)
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      {/* Inmates List with Checkboxes */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-300">
                          <span>
                            Daftar Penghuni ({batchSourceOccupants.length} orang di {batchSourceKamar}):
                          </span>
                          {batchSourceOccupants.length > 0 && (
                            <button
                              type="button"
                              onClick={handleToggleSelectAllBatch}
                              className="text-cyan-400 hover:text-cyan-300 font-semibold underline"
                            >
                              {selectedBatchInmateIds.length === batchSourceOccupants.length
                                ? 'Batalkan Semua'
                                : 'Pilih Semua'}
                            </button>
                          )}
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-[#040f1d] rounded-xl border border-blue-900/80">
                          {batchSourceOccupants.length === 0 ? (
                            <p className="text-center text-slate-500 italic py-4">
                              Tidak ada penghuni di kamar ini.
                            </p>
                          ) : (
                            batchSourceOccupants.map((occ) => {
                              const isChecked = selectedBatchInmateIds.includes(occ.id);
                              return (
                                <label
                                  key={occ.id}
                                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                                    isChecked
                                      ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                                      : 'bg-[#061527] border-blue-900/50 text-slate-300 hover:bg-[#081e36]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleBatchInmate(occ.id)}
                                      className="rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-blue-800"
                                    />
                                    <div className="truncate">
                                      <span className="font-bold text-xs truncate block">{occ.nama}</span>
                                      <span className="text-[10px] text-slate-400 font-mono">{occ.noRegister} • {occ.status}</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-amber-300/90 font-medium shrink-0 ml-2">
                                    {occ.jenisKejahatan}
                                  </span>
                                </label>
                              );
                            })
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Terpilih untuk dipindahkan:</span>
                          <strong className="text-cyan-300">{selectedBatchInmateIds.length} dari {batchSourceOccupants.length} WBP</strong>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* RIGHT COLUMN: Target Destination Selection (Tujuan Mutasi) */}
                <div className="p-4 rounded-2xl bg-[#061527] border border-blue-900/70 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-900/60 pb-2.5">
                    <span className="font-bold text-white uppercase tracking-wider font-condensed flex items-center gap-1.5">
                      <DoorOpen className="w-4 h-4 text-amber-400" />
                      2. Tentukan Kamar Tujuan
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                      Penempatan Baru
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Blok Tujuan: <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={targetBlok}
                        onChange={(e) => setTargetBlok(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-400"
                      >
                        {daftarBlok.map((b) => (
                          <option key={b.id} value={b.nama}>
                            {b.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Kamar Tujuan: <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={targetKamarFull}
                        onChange={(e) => setTargetKamarFull(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="">-- Pilih Kamar Tujuan --</option>
                        {targetBlockRooms.map((r) => {
                          const occCount = inmates.filter((i) => (i.kamarHunian || '').toLowerCase().trim() === r.namaLengkap.toLowerCase().trim()).length;
                          const sisa = r.kapasitas - occCount;
                          return (
                            <option key={r.id} value={r.namaLengkap}>
                              {r.namaLengkap} ({occCount}/{r.kapasitas} WBP - Sisa {sisa >= 0 ? sisa : 0})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Target Room Capacity & Projected Occupancy Card */}
                  {targetRoomDetail && (
                    <div className="p-3.5 rounded-xl bg-[#09203d] border border-blue-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs font-condensed tracking-wide uppercase">
                          {targetRoomDetail.namaLengkap}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800">
                          {targetRoomDetail.kategori || 'Hunian Umum'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">Penghuni Saat Ini:</span>
                          <span className="font-bold text-white font-mono">
                            {targetRoomCurrentOccupants.length} WBP (Kapasitas: {targetCapacity})
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">Setelah Mutasi ({movingCount} WBP masuk):</span>
                          <span className={`font-bold font-mono ${
                            isTargetOverCapacity ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {targetProjectedOccupancy} / {targetCapacity} WBP
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isTargetOverCapacity ? 'bg-rose-500' : 'bg-emerald-400'
                            }`}
                            style={{
                              width: `${Math.min(
                                Math.round((targetProjectedOccupancy / (targetCapacity || 1)) * 100),
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        {isTargetOverCapacity && (
                          <div className="p-2 rounded-lg bg-rose-950/70 border border-rose-500/50 text-rose-300 text-[11px] flex items-center gap-1.5 mt-2">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Perhatian: Mutasi ini akan menyebabkan kamar melebihi kapasitas standar ({targetProjectedOccupancy}/{targetCapacity} WBP).
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Flow Arrow Visual */}
                  <div className="p-2.5 rounded-xl bg-[#040f1d] border border-blue-900/60 flex items-center justify-between text-xs text-slate-300">
                    <div className="text-center flex-1">
                      <span className="text-[10px] text-slate-400 block uppercase">Asal</span>
                      <strong className="text-white truncate block">
                        {activeTab === 'single'
                          ? currentSingleInmate?.kamarHunian || '-'
                          : batchSourceKamar || '-'}
                      </strong>
                    </div>

                    <ArrowRightLeft className="w-4 h-4 text-cyan-400 mx-2 shrink-0" />

                    <div className="text-center flex-1">
                      <span className="text-[10px] text-slate-400 block uppercase">Tujuan</span>
                      <strong className="text-amber-300 truncate block">
                        {targetKamarFull || '-'}
                      </strong>
                    </div>
                  </div>

                </div>

              </div>

              {/* BOTTOM SECTION: Mutation Administration & Disposisi */}
              <div className="p-4 rounded-2xl bg-[#061527] border border-blue-900/70 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
                  <span className="font-bold text-white uppercase tracking-wider font-condensed flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    3. Berita Acara & Administrasi Mutasi
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Tercatat otomatis di kartu kendali WBP
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Tanggal Mutasi: <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={tanggalMutasi}
                      onChange={(e) => setTanggalMutasi(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Alasan Pemindahan: <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={alasanMutasi}
                      onChange={(e) => setAlasanMutasi(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-400"
                    >
                      {ALASAN_MUTASI_OPTIONS.map((alasan) => (
                        <option key={alasan} value={alasan}>
                          {alasan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Petugas / Pejabat Disposisi: <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={petugasMutasi}
                      onChange={(e) => setPetugasMutasi(e.target.value)}
                      placeholder="Misal: Kasi Binadik / Ka.KPR"
                      required
                      className="w-full px-3 py-2 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                {alasanMutasi === 'Lainnya (Tuliskan pada Catatan)' && (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Keterangan Alasan Kustom: <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={alasanKustom}
                      onChange={(e) => setAlasanKustom(e.target.value)}
                      placeholder="Jelaskan alasan spesifik pemindahan kamar hunian..."
                      required
                      className="w-full px-3 py-2 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Catatan Tambahan / Nomor Disposisi (Opsional):
                  </label>
                  <input
                    type="text"
                    value={catatanMutasi}
                    onChange={(e) => setCatatanMutasi(e.target.value)}
                    placeholder="Contoh: Disposisi Ka.Lapas No. W13.PAS-01/2026 tanggal 04/09/2026"
                    className="w-full px-3 py-2 bg-[#081f3b] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-blue-900/60">
                <div className="text-slate-400 text-xs flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    Total: <strong className="text-white">{movingCount} WBP</strong> akan dipindahkan ke{' '}
                    <strong className="text-amber-300">{targetKamarFull || 'kamar tujuan'}</strong>.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-300 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={movingCount === 0 || !targetKamarFull}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-extrabold flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Eksekusi Mutasi Kamar</span>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* TAB 3: History of Mutations Across All Inmates */}
          {activeTab === 'history' && (
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Cari WBP, kamar asal/tujuan, alasan, petugas..."
                    className="w-full pl-8 pr-3 py-2 bg-[#061527] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <span className="text-slate-400 font-semibold shrink-0">
                  Total: {filteredHistoryLogs.length} Catatan
                </span>
              </div>

              <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                {filteredHistoryLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-[#061527] rounded-xl border border-blue-900/60 space-y-2">
                    <History className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-sm font-semibold text-slate-200">
                      Belum ada riwayat mutasi kamar yang tercatat.
                    </p>
                    <p className="text-xs text-slate-400">
                      Setiap mutasi kamar yang Anda lakukan akan tersimpan permanen di sini dan pada kartu kendali masing-masing WBP.
                    </p>
                  </div>
                ) : (
                  filteredHistoryLogs.map(({ inmate, record }, idx) => (
                    <div
                      key={record.id || idx}
                      className="p-3.5 rounded-xl bg-[#061527] border border-blue-900/70 space-y-2 hover:border-cyan-500/50 transition"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{inmate.nama}</span>
                          <span className="text-xs font-mono text-amber-300">({inmate.noRegister})</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800">
                            {inmate.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>{record.tanggal}</span>
                          {record.jam && <span>• {record.jam} WIB</span>}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#040f1d] border border-blue-900/60 flex items-center justify-between gap-3 text-xs">
                        <div className="text-left flex-1 min-w-0">
                          <span className="text-[10px] text-slate-400 block">Kamar Asal:</span>
                          <span className="font-bold text-slate-200 truncate block">
                            {record.blokAsal} - {record.kamarAsal}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-cyan-400 shrink-0 font-bold text-xs">
                          <span>DIPINDAHKAN</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>

                        <div className="text-right flex-1 min-w-0">
                          <span className="text-[10px] text-slate-400 block">Kamar Tujuan:</span>
                          <span className="font-bold text-amber-300 truncate block">
                            {record.blokTujuan} - {record.kamarTujuan}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 flex items-center justify-between flex-wrap gap-2 pt-1">
                        <div>
                          <span className="text-slate-400">Alasan: </span>
                          <strong className="text-white">{record.alasan}</strong>
                          {record.catatan && (
                            <span className="text-slate-400 italic block mt-0.5">Catatan: {record.catatan}</span>
                          )}
                        </div>
                        <div className="text-slate-400">
                          Petugas: <strong className="text-slate-200">{record.petugas}</strong>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#06182c] px-5 py-3 border-t border-blue-900/80 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            Sistem Mutasi Kamar Terintegrasi • Sinkron dengan kartu kendali & laporan sidak
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold transition shadow-md"
          >
            Tutup
          </button>
        </div>

      </div>

    </div>
  );
};
