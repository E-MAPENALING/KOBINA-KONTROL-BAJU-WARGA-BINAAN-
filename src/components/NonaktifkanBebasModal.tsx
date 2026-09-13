import React, { useState, useEffect, useMemo } from 'react';
import { Inmate, JenisPembebasan, StatusPengembalianSeragam, DataBebas } from '../types';
import { 
  UserX, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  RotateCcw, 
  Calendar, 
  FileText, 
  Shirt, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  Building2,
  Info
} from 'lucide-react';
import { getSavedPejabatConfig } from '../utils/pejabatHelper';

interface NonaktifkanBebasModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmates: Inmate[];
  initialInmate?: Inmate | null;
  onNonaktifkanInmate: (inmateId: string, dataBebas: DataBebas, nolkanPakaian: boolean) => void;
  onAktifkanKembaliInmate: (inmateId: string) => void;
  onOpenDetail?: (inmate: Inmate) => void;
}

export const NonaktifkanBebasModal: React.FC<NonaktifkanBebasModalProps> = ({
  isOpen,
  onClose,
  inmates,
  initialInmate,
  onNonaktifkanInmate,
  onAktifkanKembaliInmate,
  onOpenDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'arsip'>('form');
  const [selectedInmateId, setSelectedInmateId] = useState<string>('');
  const [searchInmateQuery, setSearchInmateQuery] = useState<string>('');
  const [arsipSearchQuery, setArsipSearchQuery] = useState<string>('');
  
  // Form fields
  const [tanggalBebas, setTanggalBebas] = useState<string>('');
  const [jamBebas, setJamBebas] = useState<string>('');
  const [jenisPembebasan, setJenisPembebasan] = useState<JenisPembebasan>('Bebas Murni');
  const [nomorSuratBebas, setNomorSuratBebas] = useState<string>('');
  const [statusPengembalianSeragam, setStatusPengembalianSeragam] = useState<StatusPengembalianSeragam>('Seragam Dikembalikan Lengkap');
  const [nolkanPakaian, setNolkanPakaian] = useState<boolean>(true);
  const [petugasPembebas, setPetugasPembebas] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  
  // Reactivation confirmation modal state
  const [inmateToReactivate, setInmateToReactivate] = useState<Inmate | null>(null);

  // Active vs Released lists
  const activeInmates = useMemo(() => {
    return inmates.filter((i) => i.statusKeaktifan !== 'Bebas');
  }, [inmates]);

  const releasedInmates = useMemo(() => {
    return inmates.filter((i) => i.statusKeaktifan === 'Bebas');
  }, [inmates]);

  // Selected inmate object for the form
  const currentInmate = useMemo(() => {
    return inmates.find((i) => i.id === selectedInmateId) || null;
  }, [inmates, selectedInmateId]);

  // Initialize form when modal opens or initialInmate changes
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      const defaultPetugas = getSavedPejabatConfig().namaPetugas || 'PETUGAS PENGAWAS SANDANG';

      setTanggalBebas(today);
      setJamBebas(nowTime);
      setPetugasPembebas(defaultPetugas);
      setJenisPembebasan('Bebas Murni');
      setNomorSuratBebas(`W13.PAS.PAS.10-PK.01.05.06-${new Date().getFullYear()}/` + Math.floor(100 + Math.random() * 900));
      setStatusPengembalianSeragam('Seragam Dikembalikan Lengkap');
      setNolkanPakaian(true);
      setKeterangan('Telah memenuhi syarat administratif dan substantif pembebasan.');

      if (initialInmate) {
        setSelectedInmateId(initialInmate.id);
        if (initialInmate.statusKeaktifan === 'Bebas') {
          setActiveTab('arsip');
        } else {
          setActiveTab('form');
        }
      } else {
        if (activeInmates.length > 0) {
          setSelectedInmateId(activeInmates[0].id);
        }
        setActiveTab('form');
      }
    }
  }, [isOpen, initialInmate, inmates]);

  if (!isOpen) return null;

  // Filtered active inmates for search picker
  const filteredActiveInmates = activeInmates.filter((i) => {
    if (!searchInmateQuery.trim()) return true;
    const q = searchInmateQuery.toLowerCase();
    return (
      i.nama.toLowerCase().includes(q) ||
      i.noRegister.toLowerCase().includes(q) ||
      i.kamarHunian.toLowerCase().includes(q) ||
      i.blok.toLowerCase().includes(q)
    );
  });

  // Filtered released inmates for archive list
  const filteredReleasedInmates = releasedInmates.filter((i) => {
    if (!arsipSearchQuery.trim()) return true;
    const q = arsipSearchQuery.toLowerCase();
    return (
      i.nama.toLowerCase().includes(q) ||
      i.noRegister.toLowerCase().includes(q) ||
      (i.dataBebas?.nomorSuratBebas && i.dataBebas.nomorSuratBebas.toLowerCase().includes(q)) ||
      (i.dataBebas?.jenisPembebasan && i.dataBebas.jenisPembebasan.toLowerCase().includes(q))
    );
  });

  const handleSubmitDeactivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInmate) return;

    const dataBebas: DataBebas = {
      tanggalBebas: tanggalBebas || new Date().toISOString().split('T')[0],
      jamBebas: jamBebas || (new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'),
      jenisPembebasan,
      nomorSuratBebas: nomorSuratBebas || '-',
      statusPengembalianSeragam,
      petugasPembebas: petugasPembebas.trim() || 'PETUGAS',
      keterangan: keterangan.trim(),
      tanggalInput: new Date().toISOString(),
    };

    onNonaktifkanInmate(currentInmate.id, dataBebas, nolkanPakaian);
    setActiveTab('arsip');
  };

  const handleConfirmReactivation = () => {
    if (inmateToReactivate) {
      onAktifkanKembaliInmate(inmateToReactivate.id);
      setInmateToReactivate(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#09203d] rounded-2xl shadow-2xl w-full max-w-4xl border border-blue-900/80 overflow-hidden my-6 text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-[#07182e] p-4 sm:p-5 border-b border-blue-900/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold">
              <UserX className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-condensed tracking-wider text-white uppercase flex items-center gap-2">
                <span>PENONAKTIFAN WARGA BINAAN BEBAS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-sans font-bold">
                  KOBINA
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Pencatatan administrasi pengeluaran WBP, status ekspirasi/bebas, dan pengembalian jatah pakaian ke gudang.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-[#061527] hover:bg-[#0c274e] border border-blue-800/60 transition"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#081b33] border-b border-blue-900/60 px-4 sm:px-6 pt-3 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`pb-2.5 px-4 text-xs font-bold font-condensed tracking-wider uppercase border-b-2 transition flex items-center gap-2 ${
              activeTab === 'form'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>Formulir Nonaktifkan WBP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('arsip')}
            className={`pb-2.5 px-4 text-xs font-bold font-condensed tracking-wider uppercase border-b-2 transition flex items-center gap-2 ${
              activeTab === 'arsip'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Daftar WBP Bebas (Nonaktif)</span>
            <span className="px-2 py-0.2 rounded-full bg-blue-900/80 text-amber-300 text-[10px] font-mono border border-blue-700">
              {releasedInmates.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmitDeactivation} className="space-y-5">
              
              {/* 1. Pemilihan Warga Binaan yang akan dinonaktifkan */}
              <div className="bg-[#061527] p-4 rounded-2xl border border-blue-900/60 space-y-3">
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider font-condensed flex items-center justify-between">
                  <span>Pilih Warga Binaan yang Sudah Bebas (Aktif: {activeInmates.length})</span>
                  {currentInmate && (
                    <span className="text-[11px] font-mono text-cyan-300">
                      No. Reg: {currentInmate.noRegister}
                    </span>
                  )}
                </label>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchInmateQuery}
                      onChange={(e) => setSearchInmateQuery(e.target.value)}
                      placeholder="Cari nama atau no. reg..."
                      className="w-full pl-9 pr-3 py-2 bg-[#09203d] border border-blue-800/60 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  
                  <div className="md:col-span-7">
                    <select
                      value={selectedInmateId}
                      onChange={(e) => setSelectedInmateId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#09203d] border border-blue-800/60 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      {filteredActiveInmates.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nama} ({i.noRegister}) • {i.kamarHunian} • {i.status}
                        </option>
                      ))}
                      {filteredActiveInmates.length === 0 && (
                        <option value="" disabled>
                          Tidak ada warga binaan yang cocok dengan pencarian
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Profil WBP Terpilih */}
                {currentInmate && (
                  <div className="mt-3 p-3 rounded-xl bg-[#081e36] border border-blue-800/40 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Nama Lengkap:</span>
                      <strong className="text-white font-semibold">{currentInmate.nama}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Kamar / Blok:</span>
                      <strong className="text-amber-300 font-semibold">{currentInmate.kamarHunian}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Klasifikasi:</span>
                      <span className="inline-block font-semibold text-cyan-300">{currentInmate.status}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Tindak Pidana:</span>
                      <span className="text-slate-200 truncate block">{currentInmate.jenisKejahatan}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Informasi Inventaris Pakaian Saat Ini */}
              {currentInmate && (
                <div className="bg-[#061527] p-4 rounded-2xl border border-blue-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-condensed flex items-center gap-1.5">
                      <Shirt className="w-4 h-4 text-cyan-400" />
                      Inventaris Pakaian yang Dipegang WBP
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Total {(currentInmate.pakaianList || []).reduce((acc, p) => acc + p.jumlah, 0)} potong pakaian
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(currentInmate.pakaianList || []).map((p) => (
                      <div key={p.id} className="p-2.5 rounded-xl bg-[#09203d] border border-blue-800/40 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">{p.namaItem}</p>
                          <p className="text-[10px] text-slate-400">Ukuran: {p.ukuran || 'Standar'}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black font-condensed text-amber-300">{p.jumlah}</span>
                          <span className="text-[10px] text-slate-400 block">/ {p.maxJumlah}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Opsi Pengembalian Pakaian Fisik */}
                  <div className="pt-2 border-t border-blue-900/50 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-amber-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={nolkanPakaian}
                        onChange={(e) => setNolkanPakaian(e.target.checked)}
                        className="w-4 h-4 rounded border-blue-800 text-amber-400 focus:ring-amber-400 bg-[#09203d]"
                      />
                      <span className="font-semibold">
                        Nolkan kepemilikan pakaian dan catat pengembalian ke gudang sandang Lapas
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* 3. Detail Data Pembebasan */}
              <div className="bg-[#061527] p-4 rounded-2xl border border-blue-900/60 space-y-4">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-condensed flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Rincian Surat & Berita Acara Pembebasan
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tanggal Bebas */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tanggal Pembebasan / Ekspirasi <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={tanggalBebas}
                        onChange={(e) => setTanggalBebas(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-[#09203d] border border-blue-800/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* Jam Bebas */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Waktu / Jam Bebas
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={jamBebas}
                        onChange={(e) => setJamBebas(e.target.value)}
                        placeholder="Mis: 09:30 WIB"
                        className="w-full pl-9 pr-3 py-2 bg-[#09203d] border border-blue-800/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* Jenis Pembebasan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Jenis Pembebasan <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={jenisPembebasan}
                      onChange={(e) => setJenisPembebasan(e.target.value as JenisPembebasan)}
                      className="w-full px-3 py-2 bg-[#09203d] border border-blue-800/60 rounded-xl text-xs text-white font-semibold focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      <option value="Bebas Murni">Bebas Murni</option>
                      <option value="Pembebasan Bersyarat (PB)">Pembebasan Bersyarat (PB)</option>
                      <option value="Cuti Bersyarat (CB)">Cuti Bersyarat (CB)</option>
                      <option value="Cuti Menjelang Bebas (CMB)">Cuti Menjelang Bebas (CMB)</option>
                      <option value="Asimilasi di Rumah">Asimilasi di Rumah</option>
                      <option value="Mutasi Keluar / Pindah Lapas">Mutasi Keluar / Pindah Lapas</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Status Pengembalian Seragam */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Status Pengembalian Sandang Seragam <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={statusPengembalianSeragam}
                      onChange={(e) => setStatusPengembalianSeragam(e.target.value as StatusPengembalianSeragam)}
                      className="w-full px-3 py-2 bg-[#09203d] border border-blue-800/60 rounded-xl text-xs text-white font-semibold focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      <option value="Seragam Dikembalikan Lengkap">Seragam Dikembalikan Lengkap</option>
                      <option value="Sebagian Dikembalikan">Sebagian Dikembalikan</option>
                      <option value="Tidak Dikembalikan / Dihibahkan">Tidak Dikembalikan / Dihibahkan</option>
                      <option value="Disimpan di Gudang Sandang">Disimpan di Gudang Sandang</option>
                    </select>
                  </div>

                  {/* Nomor Surat Bebas */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nomor Surat Keputusan / Surat Bebas (SK)
                    </label>
                    <input
                      type="text"
                      value={nomorSuratBebas}
                      onChange={(e) => setNomorSuratBebas(e.target.value)}
                      placeholder="Contoh: W13.PAS.PAS.10-PK.01.05.06-2026/891"
                      className="w-full px-3 py-2 bg-[#09203d] border border-blue-800/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-400 font-mono"
                    />
                  </div>

                  {/* Petugas Pembebas */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Petugas Pemeriksa & Penanggung Jawab Sandang
                    </label>
                    <input
                      type="text"
                      value={petugasPembebas}
                      onChange={(e) => setPetugasPembebas(e.target.value)}
                      placeholder="Nama Lengkap Petugas"
                      className="w-full px-3 py-2 bg-[#09203d] border border-blue-800/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* Keterangan Tambahan */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Keterangan / Catatan Pembebasan
                    </label>
                    <textarea
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      rows={2}
                      placeholder="Catatan kepatuhan pakaian, pengembalian seragam, dsb..."
                      className="w-full px-3 py-2 bg-[#09203d] border border-blue-800/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

              </div>

              {/* Warning notice */}
              <div className="bg-amber-950/40 border border-amber-500/50 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 font-bold mb-0.5">Konsekuensi Penonaktifan:</strong>
                  Warga Binaan ini akan dipindahkan ke daftar arsip nonaktif (Sudah Bebas) dan tidak akan dihitung dalam kuota hunian aktif kamar. Data riwayat sandang tetap tersimpan utuh dan dapat diaktifkan kembali sewaktu-waktu bila diperlukan.
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-blue-900/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#07182e] hover:bg-[#0c274e] text-slate-300 hover:text-white border border-blue-800/60 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!currentInmate}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 shadow-lg shadow-rose-900/30 font-sans tracking-wide transition disabled:opacity-50"
                >
                  <UserX className="w-4 h-4 stroke-[2.5]" />
                  <span>Konfirmasi Nonaktifkan WBP</span>
                </button>
              </div>

            </form>
          ) : (
            /* Tab 2: Arsip Warga Binaan yang Sudah Bebas */
            <div className="space-y-4">
              
              {/* Search in released archive */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#061527] p-3 rounded-2xl border border-blue-900/60">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={arsipSearchQuery}
                    onChange={(e) => setArsipSearchQuery(e.target.value)}
                    placeholder="Cari WBP bebas, no register, SK..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#09203d] border border-blue-800/60 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="text-xs text-slate-300">
                  Total Terdaftar Bebas: <strong className="text-amber-300 font-bold">{releasedInmates.length}</strong> WBP
                </div>
              </div>

              {filteredReleasedInmates.length === 0 ? (
                <div className="bg-[#061527] p-10 rounded-2xl border border-blue-900/60 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#09203d] border border-blue-800/60 flex items-center justify-center mx-auto text-slate-400">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-condensed">
                    BELUM ADA WARGA BINAAN YANG DINONAKTIFKAN
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Gunakan tab "Formulir Nonaktifkan WBP" untuk mencatat warga binaan yang telah bebas murni atau bersyarat.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-blue-900/60">
                  <table className="w-full text-left text-xs text-slate-200 border-collapse bg-[#061527]">
                    <thead className="bg-[#07182e] border-b border-blue-900/80 uppercase font-bold text-slate-300 tracking-wider font-condensed">
                      <tr>
                        <th className="py-3 px-3.5">Nama & No. Reg</th>
                        <th className="py-3 px-3.5">Kamar Terakhir</th>
                        <th className="py-3 px-3.5">Tgl Bebas & Jenis</th>
                        <th className="py-3 px-3.5">No. SK / Keterangan</th>
                        <th className="py-3 px-3.5">Status Sandang</th>
                        <th className="py-3 px-3.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/40">
                      {filteredReleasedInmates.map((inmate) => {
                        const bebas = inmate.dataBebas;
                        return (
                          <tr key={inmate.id} className="hover:bg-blue-900/20 transition">
                            <td className="py-3 px-3.5">
                              <p className="font-bold text-white">{inmate.nama}</p>
                              <p className="font-mono text-[11px] text-cyan-300">{inmate.noRegister}</p>
                            </td>
                            <td className="py-3 px-3.5">
                              <span className="font-semibold text-amber-300">{inmate.kamarHunian}</span>
                              <span className="text-[10px] text-slate-400 block">{inmate.blok}</span>
                            </td>
                            <td className="py-3 px-3.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                                {bebas?.jenisPembebasan || 'Bebas'}
                              </span>
                              <p className="text-[11px] text-slate-300 mt-1">
                                {bebas?.tanggalBebas || '-'}
                              </p>
                            </td>
                            <td className="py-3 px-3.5 max-w-xs">
                              <p className="font-mono text-[11px] text-slate-300 truncate">
                                {bebas?.nomorSuratBebas || '-'}
                              </p>
                              {bebas?.keterangan && (
                                <p className="text-[10px] text-slate-400 truncate">{bebas.keterangan}</p>
                              )}
                            </td>
                            <td className="py-3 px-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                bebas?.statusPengembalianSeragam === 'Seragam Dikembalikan Lengkap'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {bebas?.statusPengembalianSeragam || 'Dikembalikan'}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {onOpenDetail && (
                                  <button
                                    onClick={() => {
                                      onClose();
                                      onOpenDetail(inmate);
                                    }}
                                    className="p-1.5 rounded-lg bg-[#09203d] hover:bg-[#0f3460] text-cyan-300 border border-blue-800/60 transition"
                                    title="Lihat Kartu Kendali"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setInmateToReactivate(inmate)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition shadow-xs"
                                  title="Aktifkan Kembali WBP ke Hunian"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Aktifkan</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Confirmation Dialog for Reactivating Inmate */}
      {inmateToReactivate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#071a30] border-2 border-emerald-500/60 rounded-2xl p-5 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Aktifkan Kembali WBP?</h4>
                <p className="text-xs text-slate-300">Warga Binaan akan kembali berstatus aktif di kamar hunian.</p>
              </div>
            </div>

            <div className="p-3 bg-[#051324] rounded-xl border border-blue-900/60 text-xs space-y-1">
              <p><span className="text-slate-400">Nama:</span> <strong className="text-white">{inmateToReactivate.nama}</strong></p>
              <p><span className="text-slate-400">No. Reg:</span> <span className="font-mono text-cyan-300">{inmateToReactivate.noRegister}</span></p>
              <p><span className="text-slate-400">Kamar:</span> <span className="text-amber-300">{inmateToReactivate.kamarHunian}</span></p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setInmateToReactivate(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0a203c] text-slate-300 hover:text-white border border-blue-800/60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReactivation}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40"
              >
                Ya, Aktifkan Kembali
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
