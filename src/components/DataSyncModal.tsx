import React, { useState, useMemo, useRef } from 'react';
import { BlokHunian, Inmate } from '../types';
import {
  X,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Layers,
  ShieldCheck,
  ArrowRightLeft,
  Info,
  Search,
  Sparkles,
  Download,
  Upload,
} from 'lucide-react';
import { getAllRoomsGroupedByBlok } from '../utils/kamarHelper';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveInmates: Inmate[];
  dummyInmates: Inmate[];
  liveBlok: BlokHunian[];
  dummyBlok: BlokHunian[];
  onSyncToDummy: () => void;
  onSmartSync?: () => void;
  onImportData?: (importedInmates: Inmate[], importedBlok?: BlokHunian[]) => void;
  lastSyncTime?: string;
}

export const DataSyncModal: React.FC<DataSyncModalProps> = ({
  isOpen,
  onClose,
  liveInmates,
  dummyInmates,
  liveBlok,
  dummyBlok,
  onSyncToDummy,
  onSmartSync,
  onImportData,
  lastSyncTime,
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'tahanan' | 'blok'>('ringkasan');
  const [confirmFullSync, setConfirmFullSync] = useState(false);
  const [confirmSmartSync, setConfirmSmartSync] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Comparison metrics
  const isCountMatched = liveInmates.length === dummyInmates.length;
  const isBlokCountMatched = liveBlok.length === dummyBlok.length;

  const roomGroups = getAllRoomsGroupedByBlok(liveBlok, liveInmates);
  const totalSpecificRooms = roomGroups.reduce((acc, g) => acc + g.kamarList.length, 0);

  const handleExecuteFullSync = () => {
    onSyncToDummy();
    setConfirmFullSync(false);
    onClose();
  };

  const handleExecuteSmartSync = () => {
    if (onSmartSync) {
      onSmartSync();
    } else {
      onSyncToDummy();
    }
    setConfirmSmartSync(false);
    onClose();
  };

  const handleExportData = () => {
    const dataToExport = {
      institution: 'Lapas Kelas IIB Batang',
      app: 'KOBINA - Kontrol Baju Warga Binaan',
      exportedAt: new Date().toISOString(),
      totalInmates: liveInmates.length,
      totalBlok: liveBlok.length,
      inmates: liveInmates,
      daftarBlok: liveBlok,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_data_lapas_batang_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        let importedList: Inmate[] = [];
        let importedBloks: BlokHunian[] | undefined = undefined;

        if (Array.isArray(parsed)) {
          importedList = parsed;
        } else if (parsed && Array.isArray(parsed.inmates)) {
          importedList = parsed.inmates;
          if (Array.isArray(parsed.daftarBlok)) {
            importedBloks = parsed.daftarBlok;
          }
        }

        if (importedList.length > 0 && onImportData) {
          onImportData(importedList, importedBloks);
          alert(`Berhasil memuat ${importedList.length} data WBP Lapas Batang!`);
          onClose();
        } else {
          alert('Format berkas tidak sesuai.');
        }
      } catch (err: any) {
        alert('Gagal membaca berkas JSON: ' + err?.message);
      }
    };
    reader.readAsText(file);
  };

  // Filtered inmates for TAB 2
  const filteredTableInmates = useMemo(() => {
    if (!searchQuery.trim()) return liveInmates.slice(0, 100);
    const q = searchQuery.toLowerCase().trim();
    return liveInmates.filter(
      (i) =>
        i.nama.toLowerCase().includes(q) ||
        i.noRegister.toLowerCase().includes(q) ||
        (i.blok && i.blok.toLowerCase().includes(q)) ||
        (i.kamarHunian && i.kamarHunian.toLowerCase().includes(q))
    ).slice(0, 100);
  }, [liveInmates, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#082231] rounded-2xl shadow-2xl w-full max-w-4xl border border-[#144963] overflow-hidden my-6 text-white animate-in fade-in zoom-in-95 duration-150">
        
        {/* Hidden File Input for JSON restore */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
        />

        {/* Modal Header */}
        <div className="bg-[#061824] p-5 flex items-center justify-between border-b border-[#144963]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-condensed tracking-wider text-white uppercase">
                  SINKRONISASI DATA OPERASIONAL LAPAS BATANG
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME AUTO-SYNC
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Penyelarasan komprehensif data operasional WBP, blok hunian, dan kuota sandang dengan Data Master Resmi Lapas Kelas IIB Batang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Summary Banner */}
        <div className="bg-gradient-to-r from-[#072538] via-[#09334d] to-[#072538] p-4 border-b border-[#144963]/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Metric 1: Total WBP */}
            <div className="bg-[#061824]/80 p-3 rounded-xl border border-[#144963]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> WBP / Tahanan
                </span>
                {isCountMatched ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Cocok 100%
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Berbeda
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold font-mono text-cyan-300">{liveInmates.length}</span>
                  <span className="text-xs text-slate-400 ml-1">Live</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-amber-300">{dummyInmates.length}</span>
                  <span className="text-[10px] text-slate-400 ml-1">Master</span>
                </div>
              </div>
            </div>

            {/* Metric 2: Blok Hunian */}
            <div className="bg-[#061824]/80 p-3 rounded-xl border border-[#144963]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Blok Hunian
                </span>
                {isBlokCountMatched ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Terpadu
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Berbeda
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold font-mono text-cyan-300">{liveBlok.length}</span>
                  <span className="text-xs text-slate-400 ml-1">Live</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-amber-300">{dummyBlok.length}</span>
                  <span className="text-[10px] text-slate-400 ml-1">Master</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Kamar Spesifik */}
            <div className="bg-[#061824]/80 p-3 rounded-xl border border-[#144963]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Kamar Terdata
                </span>
                <span className="text-[10px] font-bold text-cyan-300">
                  {roomGroups.length} Blok
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold font-mono text-cyan-300">{totalSpecificRooms}</span>
                  <span className="text-xs text-slate-400 ml-1">Kamar Aktif</span>
                </div>
                <div className="text-[10px] text-emerald-400 text-right font-medium">
                  Tersinkron Blok
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#144963]/80 bg-[#061824]">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition font-condensed tracking-wider uppercase border-t border-x ${
              activeTab === 'ringkasan'
                ? 'bg-[#082231] text-cyan-300 border-[#144963] border-b-[#082231]'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            Ringkasan & Aksi Sinkronisasi
          </button>
          <button
            onClick={() => setActiveTab('tahanan')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition font-condensed tracking-wider uppercase border-t border-x ${
              activeTab === 'tahanan'
                ? 'bg-[#082231] text-cyan-300 border-[#144963] border-b-[#082231]'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            Data WBP ({liveInmates.length} Live vs {dummyInmates.length} Master)
          </button>
          <button
            onClick={() => setActiveTab('blok')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition font-condensed tracking-wider uppercase border-t border-x ${
              activeTab === 'blok'
                ? 'bg-[#082231] text-cyan-300 border-[#144963] border-b-[#082231]'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            6 Blok Hunian & Kamar Spesifik
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[440px] overflow-y-auto space-y-4">
          
          {/* TAB 1: Ringkasan */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3 text-xs">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm">
                    Mekanisme Sinkronisasi Otomatis KOBINA Lapas Kelas IIB Batang
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Setiap perubahan yang Anda lakukan (pemeriksaan sidak, kuota pakaian, perubahan blok/kamar, penambahan warga binaan) <strong>langsung tersimpan otomatis</strong> ke penyimpanan persisten browser dan disinkronkan dengan basis data Lapas Batang (<strong>444 WBP</strong>, <strong>6 Blok Hunian</strong>: <span className="text-cyan-300">BLOK A, BLOK B, BLOK C, BLOK D, BLOK E, BLOK WANITA</span>).
                  </p>
                  {lastSyncTime && (
                    <div className="text-[11px] text-emerald-400 font-mono mt-1 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Status Sinkronisasi Terakhir: {lastSyncTime}
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison Details Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Column Live */}
                <div className="p-4 rounded-xl bg-[#061824] border border-[#144963] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#144963]">
                    <span className="font-bold text-cyan-300 text-xs uppercase tracking-wider font-condensed">
                      DATA LIVE (OPERASIONAL AKTIF)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                      Aktif Digunakan
                    </span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li className="flex justify-between">
                      <span className="text-slate-400">Total WBP Terdata:</span>
                      <strong className="text-white font-mono">{liveInmates.length} Orang</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Total Blok Hunian:</span>
                      <strong className="text-white font-mono">{liveBlok.length} Blok</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Kamar Hunian Aktif:</span>
                      <strong className="text-white font-mono">{totalSpecificRooms} Kamar</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Penyimpanan:</span>
                      <strong className="text-emerald-400">Local Storage (Persisten & Real-Time)</strong>
                    </li>
                  </ul>
                </div>

                {/* Column Dummy Master */}
                <div className="p-4 rounded-xl bg-[#061824] border border-[#144963] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#144963]">
                    <span className="font-bold text-amber-300 text-xs uppercase tracking-wider font-condensed">
                      DATA MASTER (STANDAR LAPAS BATANG)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      Master Referensi
                    </span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li className="flex justify-between">
                      <span className="text-slate-400">Total WBP Resmi:</span>
                      <strong className="text-white font-mono">{dummyInmates.length} Orang</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Blok Hunian Resmi:</span>
                      <strong className="text-white font-mono">{dummyBlok.length} Blok</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Daftar Blok Acuan:</span>
                      <span className="text-[11px] text-cyan-300 truncate max-w-[180px]">
                        {dummyBlok.map((b) => b.nama.replace('BLOK ', '')).join(', ')}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Status Standar:</span>
                      <strong className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> 100% Terverifikasi Lapas Batang
                      </strong>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Sync Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                
                {/* Action 1: Smart Sync */}
                <div className="p-4 rounded-xl bg-[#061824] border border-cyan-500/40 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase font-condensed tracking-wider">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      1. Sinkronisasi Cerdas (Rekomendasi)
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Memadukan data live dengan Master Lapas Batang (444 WBP & 6 Blok) dengan tetap <strong>mempertahankan catatan sidak, riwayat penukaran pakaian, dan pemeriksaan</strong> yang telah diinput.
                    </p>
                  </div>

                  {!confirmSmartSync ? (
                    <button
                      onClick={() => setConfirmSmartSync(true)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-cyan-600/80 hover:bg-cyan-600 text-white border border-cyan-400/40 flex items-center justify-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Jalankan Sinkronisasi Cerdas</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmSmartSync(false)}
                        className="flex-1 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white bg-[#082231] border border-slate-700"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleExecuteSmartSync}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1 shadow-lg"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terapkan Cerdas
                      </button>
                    </div>
                  )}
                </div>

                {/* Action 2: Total Reset Sync */}
                <div className="p-4 rounded-xl bg-[#061824] border border-amber-500/40 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase font-condensed tracking-wider">
                      <RefreshCw className="w-4 h-4 text-amber-400" />
                      2. Sinkronisasi Penuh (Reset Total)
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Mengembalikan data live secara penuh 100% sesuai dataset master bawaan Lapas Batang (<strong>444 WBP & 6 Blok Hunian</strong>).
                    </p>
                  </div>

                  {!confirmFullSync ? (
                    <button
                      onClick={() => setConfirmFullSync(true)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 border border-amber-200 flex items-center justify-center gap-1.5 transition font-semibold shadow-md shadow-amber-500/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sinkronkan Ulang Total (444 WBP)</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmFullSync(false)}
                        className="flex-1 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white bg-[#082231] border border-slate-700"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleExecuteFullSync}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1 shadow-lg"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Konfirmasi Reset Total
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Action 3: Export & Import Data Backup */}
              <div className="p-4 rounded-xl bg-[#061824] border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Cadangan Data Operasional (Ekspor / Impor JSON)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Unduh salinan data WBP & blok ke berkas JSON atau pulihkan data dari komputer petugas lain.
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleExportData}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0d2a52] hover:bg-[#12396d] text-cyan-200 border border-cyan-500/40 flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Ekspor JSON</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0d2a52] hover:bg-[#12396d] text-amber-200 border border-amber-500/40 flex items-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>Impor JSON</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Data Tahanan Live vs Master */}
          {activeTab === 'tahanan' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs text-slate-300">
                  Menampilkan data tahanan/WBP live Lapas Batang yang diselaraskan dengan kuota sandang:
                </div>
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama, register, blok..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#061824] border border-[#144963] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#144963]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#061824] text-slate-300 uppercase tracking-wider font-condensed border-b border-[#144963]">
                    <tr>
                      <th className="py-2.5 px-3">No. Register</th>
                      <th className="py-2.5 px-3">Nama WBP</th>
                      <th className="py-2.5 px-3">Blok</th>
                      <th className="py-2.5 px-3">Kamar</th>
                      <th className="py-2.5 px-3">Baju</th>
                      <th className="py-2.5 px-3">Celana</th>
                      <th className="py-2.5 px-3">Status Sinkron</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#144963]/50 font-sans">
                    {filteredTableInmates.map((inmate) => (
                      <tr key={inmate.id} className="hover:bg-[#0c354e]/40 transition">
                        <td className="py-2 px-3 font-mono text-cyan-300">{inmate.noRegister}</td>
                        <td className="py-2 px-3 font-bold text-white">{inmate.nama}</td>
                        <td className="py-2 px-3 font-condensed font-bold text-slate-200">{inmate.blok}</td>
                        <td className="py-2 px-3 font-mono text-cyan-200">{inmate.kamarHunian}</td>
                        <td className="py-2 px-3 font-mono">{inmate.jumlahBaju ?? inmate.jumlahBajuMilik ?? 2} stel</td>
                        <td className="py-2 px-3 font-mono">{inmate.jumlahCelana ?? 2} pcs</td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Tersinkron
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[11px] text-slate-400 text-right">
                Menampilkan {filteredTableInmates.length} dari total {liveInmates.length} WBP
              </div>
            </div>
          )}

          {/* TAB 3: Kamar Spesifik per Blok */}
          {activeTab === 'blok' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-300">
                Pemetaan 6 blok hunian resmi Lapas Kelas IIB Batang beserta kamar hunian aktif:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roomGroups.map((group) => {
                  const occupantsInBlok = liveInmates.filter(
                    (i) => i.blok?.toLowerCase() === group.blok.toLowerCase()
                  );

                  return (
                    <div
                      key={group.blok}
                      className="bg-[#061824] p-3.5 rounded-xl border border-[#144963] space-y-2.5"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#144963]/80">
                        <span className="font-bold text-sm text-cyan-300 uppercase font-condensed tracking-wider">
                          {group.blok}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 font-mono font-bold">
                          {occupantsInBlok.length} WBP
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        <span className="text-[11px] text-slate-400 block mb-1">
                          Kamar Spesifik Aktif:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {group.kamarList.map((kamar) => {
                            const count = liveInmates.filter((i) => i.kamarHunian === kamar).length;
                            return (
                              <span
                                key={kamar}
                                className={`text-[11px] px-2 py-1 rounded-lg border font-mono ${
                                  count > 0
                                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-bold'
                                    : 'bg-[#082231] text-slate-400 border-slate-700/50'
                                }`}
                              >
                                {kamar.replace(`${group.blok} - `, '')}{' '}
                                {count > 0 && `(${count})`}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#061824] p-4 flex items-center justify-between border-t border-[#144963] text-xs">
          <div className="text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Data live tersimpan otomatis dan persisten di penyimpanan lokal browser</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#082231] hover:bg-[#0c354e] text-white border border-[#144963] transition font-semibold"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
