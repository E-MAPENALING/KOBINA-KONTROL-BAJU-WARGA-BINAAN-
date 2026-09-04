import React, { useState, useEffect, useRef } from 'react';
import { BlokHunian, Inmate } from '../types';
import {
  Building2,
  Plus,
  Settings2,
  AlertCircle,
  MoreVertical,
  Edit3,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Users,
  DoorOpen,
} from 'lucide-react';

interface BlokSidebarProps {
  daftarBlok: BlokHunian[];
  selectedBlok: string;
  onSelectBlok: (blokName: string) => void;
  inmates: Inmate[];
  onOpenKelolaBlok: () => void;
  onOpenDetailKamar?: (blokNama: string) => void;
  onEditBlok?: (id: string, namaBaru: string, deskripsiBaru?: string) => void;
  onHapusBlok?: (id: string, namaBlok: string) => void;
}

export const BlokSidebar: React.FC<BlokSidebarProps> = ({
  daftarBlok,
  selectedBlok,
  onSelectBlok,
  inmates,
  onOpenKelolaBlok,
  onOpenDetailKamar,
  onEditBlok,
  onHapusBlok,
}) => {
  // Dropdown menu state per block
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modal states for Edit and Delete
  const [editingBlok, setEditingBlok] = useState<BlokHunian | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [editError, setEditError] = useState('');

  const [deletingBlok, setDeletingBlok] = useState<BlokHunian | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to match block name flexibly with inmate block / kamar
  const isMatchBlok = (inmateBlok: string | undefined, inmateKamar: string | undefined, targetBlok: string) => {
    const target = targetBlok.toLowerCase().trim();
    if (!target) return false;

    const b = (inmateBlok || '').toLowerCase().trim();
    const k = (inmateKamar || '').toLowerCase().trim();

    if (b === target || k.includes(target)) return true;

    // Mapping for standard block abbreviations to full names
    if (b === 'blok a' || b === 'blok angrek' || b === 'blok anggrek') {
      if (target.includes('anggrek') || target.includes('angrek') || target === 'blok a') return true;
    }
    if (b === 'blok b') {
      if (target.includes('bougenville') || target === 'blok b') return true;
    }
    if (b === 'blok c') {
      if (target.includes('classic') || target === 'blok c') return true;
    }
    if (b === 'blok d') {
      if (target.includes('dahlia') || target === 'blok d') return true;
    }
    if (b === 'blok e') {
      if (target.includes('edelweis') || target === 'blok e') return true;
    }
    if (b === 'blok f') {
      if (target.includes('flamboyan') || target === 'blok f') return true;
    }

    return false;
  };

  // Compute counts per block
  const getOccupantCount = (namaBlok: string) => {
    return inmates.filter((i) => isMatchBlok(i.blok, i.kamarHunian, namaBlok)).length;
  };

  const getProblematicCount = (namaBlok: string) => {
    return inmates.filter((i) => {
      if (!isMatchBlok(i.blok, i.kamarHunian, namaBlok)) return false;
      const isOver = i.pakaianList?.some((p) => p.jumlah > p.maxJumlah);
      const isKurang = i.pakaianList?.some((p) => p.jumlah < p.maxJumlah);
      const isRusak = i.kondisiBaju === 'Perlu Ganti' || i.kondisiBaju === 'Rusak/Sobek';
      const hasSitaan = i.bajuTerlarangDisita > 0;
      return isOver || isKurang || isRusak || hasSitaan;
    }).length;
  };

  // Open Edit Modal
  const handleStartEdit = (blok: BlokHunian, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenMenuId(null);
    setEditingBlok(blok);
    setEditNama(blok.nama);
    setEditDeskripsi(blok.deskripsi || '');
    setEditError('');
  };

  // Save Edit Blok
  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlok) return;

    const trimmed = editNama.trim();
    if (!trimmed) {
      setEditError('Nama blok tidak boleh kosong');
      return;
    }

    // Check duplicate
    const isDuplicate = daftarBlok.some(
      (b) => b.id !== editingBlok.id && b.nama.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setEditError(`Nama blok "${trimmed}" sudah ada dalam daftar`);
      return;
    }

    if (onEditBlok) {
      onEditBlok(editingBlok.id, trimmed, editDeskripsi.trim() || undefined);
    }
    setEditingBlok(null);
  };

  // Open Delete Modal
  const handleStartDelete = (blok: BlokHunian, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenMenuId(null);
    setDeletingBlok(blok);
  };

  // Confirm Delete Blok
  const handleConfirmDelete = () => {
    if (!deletingBlok) return;
    if (onHapusBlok) {
      onHapusBlok(deletingBlok.id, deletingBlok.nama);
    }
    setDeletingBlok(null);
  };

  return (
    <aside className="relative flex flex-col w-full lg:w-80 xl:w-[22rem] shrink-0 bg-[#09203d]/95 backdrop-blur-md rounded-2xl border border-blue-900/70 p-5 shadow-2xl overflow-visible">
      
      {/* Decorative Top-Left Gold Framing Accent */}
      <div className="absolute top-0 left-0 w-24 h-24 border-t-3 border-l-3 border-amber-400 pointer-events-none rounded-tl-2xl shadow-xs" />

      {/* Sidebar Header */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-blue-900/60 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-white font-condensed">
              DAFTAR BLOK HUNIAN
            </h2>
            <p className="text-[11px] text-amber-200/80 font-medium">Pilih blok untuk kontrol</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenDetailKamar && (
            <button
              type="button"
              onClick={() => onOpenDetailKamar(selectedBlok !== 'Semua Blok' ? selectedBlok : 'BLOK B')}
              className="px-2 py-1.5 rounded-lg bg-[#0d2a52] hover:bg-[#12396d] text-amber-300 hover:text-white border border-amber-400/40 hover:border-amber-400 transition text-xs flex items-center gap-1 shadow-xs font-semibold"
              title="Detail & Kelola Kamar Hunian per Blok"
            >
              <DoorOpen className="w-3.5 h-3.5" />
              <span className="text-[11px]">Kamar</span>
            </button>
          )}
          <button
            onClick={onOpenKelolaBlok}
            className="p-1.5 rounded-lg bg-[#0d2a52] hover:bg-[#12396d] text-amber-300 hover:text-white border border-blue-400/40 hover:border-amber-400 transition text-xs flex items-center gap-1 shadow-xs"
            title="Kelola, Tambah, Edit, dan Hapus Blok"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* All Blocks Item */}
      <div className="relative z-10 mb-2">
        <button
          onClick={() => onSelectBlok('Semua Blok')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition font-condensed text-base tracking-wider ${
            selectedBlok === 'Semua Blok'
              ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white font-bold shadow-lg shadow-blue-950/60 border border-amber-400 ring-1 ring-amber-400/40'
              : 'text-slate-200 hover:text-white hover:bg-blue-900/30 border border-transparent'
          }`}
        >
          <span className="uppercase">SEMUA BLOK</span>
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-white border border-amber-300 font-sans font-black text-blue-950 shadow-xs">
            {inmates.length} WBP
          </span>
        </button>
      </div>

      {/* Blocks List: Displaying complete full block names without truncation */}
      <div ref={menuRef} className="relative z-10 space-y-1.5 my-1 flex-1 overflow-visible max-h-[500px] pr-1">
        {daftarBlok.map((blok) => {
          const isSelected = selectedBlok.toLowerCase() === blok.nama.toLowerCase();
          const count = getOccupantCount(blok.nama);
          const alerts = getProblematicCount(blok.nama);
          const isMenuOpen = openMenuId === blok.id;

          return (
            <div
              key={blok.id}
              className={`relative group rounded-xl transition border ${
                isSelected
                  ? 'bg-blue-600/30 text-white font-bold border-amber-400 shadow-md shadow-blue-950/50 ring-1 ring-amber-400/50'
                  : 'text-slate-200 hover:text-white hover:bg-blue-900/25 border-transparent'
              }`}
            >
              <div className="w-full flex items-center justify-between px-3.5 py-2.5 gap-2">
                
                {/* Clickable Area for Block Selection - FULL NAME DISPLAY */}
                <button
                  type="button"
                  onClick={() => onSelectBlok(blok.nama)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left font-condensed tracking-wider focus:outline-none py-0.5"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 transition ${
                      isSelected ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-400 group-hover:bg-amber-400'
                    }`}
                  />
                  <span className="text-sm md:text-base font-bold uppercase tracking-wide break-words whitespace-normal leading-snug">
                    {blok.nama}
                  </span>
                </button>

                {/* Badges & Actions Menu */}
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  {alerts > 0 && (
                    <span
                      title={`${alerts} penghuni perlu atensi sandang/tukar pakaian`}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/50"
                    >
                      <AlertCircle className="w-2.5 h-2.5 mr-0.5 text-amber-400" />
                      {alerts}
                    </span>
                  )}
                  
                  <span className="text-xs px-2.5 py-0.5 rounded bg-white font-sans font-bold text-blue-950 border border-amber-300/60 shadow-2xs">
                    {count}
                  </span>

                  {/* Actions (Quick actions on hover + 3 dots menu) */}
                  <div className="flex items-center gap-0.5">
                    
                    {/* Quick Detail Kamar Icon (visible on hover) */}
                    {onOpenDetailKamar && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetailKamar(blok.nama);
                        }}
                        className="hidden sm:group-hover:inline-flex p-1 rounded-md text-amber-300/80 hover:text-amber-200 hover:bg-amber-400/20 transition"
                        title={`Detail & Kelola Kamar ${blok.nama}`}
                      >
                        <DoorOpen className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Quick Edit Icon (visible on hover) */}
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(blok, e)}
                      className="hidden sm:group-hover:inline-flex p-1 rounded-md text-amber-300/80 hover:text-amber-200 hover:bg-amber-400/20 transition"
                      title={`Edit nama blok ${blok.nama}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Delete Icon (visible on hover) */}
                    <button
                      type="button"
                      onClick={(e) => handleStartDelete(blok, e)}
                      className="hidden sm:group-hover:inline-flex p-1 rounded-md text-rose-300/80 hover:text-rose-200 hover:bg-rose-500/20 transition"
                      title={`Hapus blok ${blok.nama}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu Toggle (Titik Tiga) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : blok.id);
                        }}
                        className={`p-1 rounded-md transition ${
                          isMenuOpen
                            ? 'bg-amber-400/30 text-white'
                            : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
                        }`}
                        title="Menu Opsi Blok"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu Popover */}
                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#09203d] border border-amber-500/40 rounded-xl shadow-2xl py-1.5 z-50 text-xs backdrop-blur-lg animate-in fade-in zoom-in-95 duration-100">
                          <div className="px-3 py-1.5 border-b border-blue-900/80 font-semibold text-amber-300 text-[10px] uppercase tracking-wider font-condensed break-words">
                            Menu {blok.nama}
                          </div>

                          {onOpenDetailKamar && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                onOpenDetailKamar(blok.nama);
                              }}
                              className="w-full text-left px-3 py-2 flex items-center gap-2 text-amber-300 hover:text-white hover:bg-blue-900/40 transition font-medium"
                            >
                              <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
                              <span>Detail Kamar</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleStartEdit(blok, e)}
                            className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-200 hover:text-amber-300 hover:bg-blue-900/40 transition font-medium"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Edit Blok</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleStartDelete(blok, e)}
                            className="w-full text-left px-3 py-2 flex items-center gap-2 text-rose-300 hover:text-rose-200 hover:bg-rose-950/50 transition font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Hapus Blok</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action to Manage / Add Block */}
      <div className="relative z-10 pt-3 mt-3 border-t border-blue-900/60 flex items-center gap-2">
        <button
          onClick={onOpenKelolaBlok}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-700 hover:to-blue-900 text-white text-xs font-bold border border-amber-400/60 hover:border-amber-300 transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-amber-300" />
          <span>Tambah / Kelola Blok</span>
        </button>
      </div>

      {/* Decorative Bottom-Left Wireframe Topographic Curves in Gold and Royal Blue */}
      <div className="absolute -bottom-8 -left-8 w-44 h-44 pointer-events-none opacity-30">
        <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <ellipse cx="40" cy="120" rx="30" ry="18" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" />
          <ellipse cx="40" cy="120" rx="45" ry="28" stroke="#f59e0b" strokeWidth="1.2" />
          <ellipse cx="40" cy="120" rx="60" ry="38" stroke="#3b82f6" strokeWidth="1.2" />
          <ellipse cx="40" cy="120" rx="75" ry="48" stroke="#2563eb" strokeWidth="1.2" />
          <ellipse cx="40" cy="120" rx="90" ry="58" stroke="#1d4ed8" strokeWidth="1.2" />
          <ellipse cx="40" cy="120" rx="105" ry="68" stroke="#1e40af" strokeWidth="1.2" />
        </svg>
      </div>

      {/* ================= MODAL EDIT BLOK ================= */}
      {editingBlok && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#082231] rounded-2xl shadow-2xl w-full max-w-md border border-[#144963] overflow-hidden text-white">
            
            {/* Modal Header */}
            <div className="bg-[#061824] p-4 flex items-center justify-between border-b border-[#144963]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-condensed tracking-wider uppercase text-white">
                    EDIT BLOK HUNIAN
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ubah nama atau keterangan blok hunian
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingBlok(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditSubmit} className="p-5 space-y-4">
              {editError && (
                <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Inmate Occupants Info Box */}
              <div className="p-3 rounded-xl bg-[#061824] border border-[#144963] flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Jumlah Penghuni Saat Ini:
                </span>
                <span className="font-bold text-cyan-300 font-mono">
                  {getOccupantCount(editingBlok.nama)} Orang WBP
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Blok Hunian <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  required
                  autoFocus
                  placeholder="Misal: BLOK B, BLOK MAWAR"
                  className="w-full px-3 py-2 bg-[#061824] border border-[#174e6b] rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none uppercase font-condensed tracking-wide"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Keterangan / Fungsi Blok (Opsional)
                </label>
                <input
                  type="text"
                  value={editDeskripsi}
                  onChange={(e) => setEditDeskripsi(e.target.value)}
                  placeholder="Misal: Blok hunian umum, khusus lansia, isolasi"
                  className="w-full px-3 py-2 bg-[#061824] border border-[#174e6b] rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200/80">
                💡 <em>Catatan:</em> Mengubah nama blok otomatis menyinkronkan nama kamar pada seluruh narapidana / tahanan yang menghuni blok ini.
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#144963]">
                <button
                  type="button"
                  onClick={() => setEditingBlok(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan Perubahan
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL HAPUS BLOK ================= */}
      {deletingBlok && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#082231] rounded-2xl shadow-2xl w-full max-w-md border border-rose-500/40 overflow-hidden text-white">
            
            {/* Modal Header */}
            <div className="bg-rose-950/40 p-4 flex items-center justify-between border-b border-rose-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-condensed tracking-wider uppercase text-rose-200">
                    HAPUS BLOK HUNIAN
                  </h3>
                  <p className="text-[11px] text-rose-300/70">
                    Konfirmasi penghapusan blok dari sistem
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeletingBlok(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-200">
                Apakah Anda yakin ingin menghapus{' '}
                <strong className="text-white font-condensed tracking-wide uppercase font-bold text-base">
                  &ldquo;{deletingBlok.nama}&rdquo;
                </strong>{' '}
                dari daftar blok hunian?
              </p>

              {getOccupantCount(deletingBlok.nama) > 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Perhatian: Masih ada penghuni terdaftar!
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Terdapat <strong>{getOccupantCount(deletingBlok.nama)} orang WBP/Tahanan</strong> yang saat ini tercatat di blok ini. Jika dihapus, blok ini akan hilang dari navigasi, namun data penghuni tidak dihapus.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#061824] border border-[#144963] text-xs text-slate-400">
                  Blok ini tidak memiliki penghuni aktif saat ini dan aman untuk dihapus.
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#144963]">
                <button
                  type="button"
                  onClick={() => setDeletingBlok(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Ya, Hapus Blok
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </aside>
  );
};
