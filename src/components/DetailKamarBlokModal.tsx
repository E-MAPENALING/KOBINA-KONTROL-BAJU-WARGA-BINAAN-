import React, { useState, useMemo } from 'react';
import { BlokHunian, Inmate, KamarDetail } from '../types';
import {
  X,
  Building2,
  DoorOpen,
  Users,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Info,
  Save,
  Shirt,
  Sparkles,
} from 'lucide-react';

interface DetailKamarBlokModalProps {
  isOpen: boolean;
  onClose: () => void;
  daftarBlok: BlokHunian[];
  initialBlok?: string;
  inmates: Inmate[];
  kamarDetails: KamarDetail[];
  onUpdateKamarDetails: (updated: KamarDetail[]) => void;
  onUpdateInmates: (updated: Inmate[]) => void;
  onOpenSidakKamar?: (kamarNama: string) => void;
}

export const DetailKamarBlokModal: React.FC<DetailKamarBlokModalProps> = ({
  isOpen,
  onClose,
  daftarBlok,
  initialBlok = 'BLOK B',
  inmates,
  kamarDetails,
  onUpdateKamarDetails,
  onUpdateInmates,
  onOpenSidakKamar,
}) => {
  // Selected Block Tab
  const [activeBlok, setActiveBlok] = useState<string>(() => {
    if (initialBlok && initialBlok !== 'Semua Blok') {
      return initialBlok;
    }
    return daftarBlok[0]?.nama || 'BLOK B';
  });

  // Keep synced if initialBlok changes when opened
  React.useEffect(() => {
    if (initialBlok && initialBlok !== 'Semua Blok') {
      setActiveBlok(initialBlok);
    }
  }, [initialBlok, isOpen]);

  // State to track which rooms have expanded inmate list
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

  // State for Add / Edit Room Modal
  const [editingRoom, setEditingRoom] = useState<KamarDetail | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [formNomorKamar, setFormNomorKamar] = useState<string>('');
  const [formKapasitas, setFormKapasitas] = useState<number>(15);
  const [formKategori, setFormKategori] = useState<string>('Hunian Umum');
  const [formKeterangan, setFormKeterangan] = useState<string>('');
  const [formPjKamar, setFormPjKamar] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // State for Delete Room Confirmation Dialog
  const [roomToDelete, setRoomToDelete] = useState<KamarDetail | null>(null);
  const [transferTargetRoom, setTransferTargetRoom] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');

  // State for Single Inmate Relocation
  const [inmateToMove, setInmateToMove] = useState<Inmate | null>(null);
  const [moveTargetRoom, setMoveTargetRoom] = useState<string>('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to match inmates to room
  const getOccupantsForRoom = (roomFull: string, roomNomor: string, blokNama: string) => {
    const rf = (roomFull || '').toLowerCase().trim();
    const rn = (roomNomor || '').toLowerCase().trim();
    const bn = (blokNama || '').toLowerCase().trim();

    return inmates.filter((i) => {
      const ik = (i.kamarHunian || '').toLowerCase().trim();
      if (ik === rf) return true;
      const ib = (i.blok || '').toLowerCase().trim();
      const inr = (i.kamarNomor || '').toLowerCase().trim();
      if (ib === bn && inr === rn) return true;
      return false;
    });
  };

  // Filter kamarDetails for the active block
  const currentBlockRooms = useMemo(() => {
    const ab = activeBlok.toLowerCase().trim();
    return kamarDetails
      .filter((k) => {
        if (!k.blokNama) return false;
        const kb = k.blokNama.toLowerCase().trim();
        return kb === ab || k.namaLengkap.toLowerCase().startsWith(ab);
      })
      .sort((a, b) => a.nomorKamar.localeCompare(b.nomorKamar, undefined, { numeric: true, sensitivity: 'base' }));
  }, [kamarDetails, activeBlok]);

  // Inmates belonging to active block
  const currentBlockInmates = useMemo(() => {
    const ab = activeBlok.toLowerCase().trim();
    return inmates.filter((i) => (i.blok || '').toLowerCase().trim() === ab);
  }, [inmates, activeBlok]);

  // Total capacity of active block
  const totalCapacity = currentBlockRooms.reduce((acc, r) => acc + (r.kapasitas || 15), 0);
  const totalOccupants = currentBlockInmates.length;
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupants / totalCapacity) * 100) : 0;

  // Problematic clothing count in active block
  const problematicInmatesCount = currentBlockInmates.filter(
    (i) => i.kondisiBaju !== 'Layak Pakai' || i.statusDistribusi !== 'Lengkap' || i.bajuTerlarangDisita > 0
  ).length;

  const toggleExpandRoom = (roomId: string) => {
    setExpandedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  // Open Form to Add New Room
  const handleOpenAddRoom = () => {
    setIsAddingNew(true);
    setEditingRoom(null);
    setFormNomorKamar(`Kamar ${String(currentBlockRooms.length + 1).padStart(2, '0')}`);
    setFormKapasitas(activeBlok.includes('A') ? 10 : 15);
    setFormKategori(activeBlok.includes('A') ? 'Hunian Wanita & Tahanan' : 'Hunian Umum');
    setFormKeterangan(`Kamar hunian warga binaan ${activeBlok}`);
    setFormPjKamar('');
    setFormError('');
  };

  // Open Form to Edit Existing Room
  const handleOpenEditRoom = (room: KamarDetail) => {
    setEditingRoom(room);
    setIsAddingNew(false);
    setFormNomorKamar(room.nomorKamar);
    setFormKapasitas(room.kapasitas || 15);
    setFormKategori(room.kategori || 'Hunian Umum');
    setFormKeterangan(room.keterangan || '');
    setFormPjKamar(room.pjKamar || '');
    setFormError('');
  };

  // Open Delete Room Dialog
  const handleOpenDeleteRoom = (room: KamarDetail) => {
    setRoomToDelete(room);
    setDeleteError('');

    const occupants = getOccupantsForRoom(room.namaLengkap, room.nomorKamar, room.blokNama);

    // Pick first available target room
    const otherInSameBlock = currentBlockRooms.filter(
      (r) => r.id !== room.id && r.namaLengkap.toLowerCase().trim() !== room.namaLengkap.toLowerCase().trim()
    );
    if (otherInSameBlock.length > 0) {
      setTransferTargetRoom(otherInSameBlock[0].namaLengkap);
    } else {
      const otherInAnyBlock = kamarDetails.filter(
        (r) => r.id !== room.id && r.namaLengkap.toLowerCase().trim() !== room.namaLengkap.toLowerCase().trim()
      );
      if (otherInAnyBlock.length > 0) {
        setTransferTargetRoom(otherInAnyBlock[0].namaLengkap);
      } else {
        setTransferTargetRoom('');
      }
    }
  };

  // Populate standard rooms if block has no rooms
  const handlePopulateStandardRooms = () => {
    const standardNumbers = [
      'Kamar 01',
      'Kamar 02',
      'Kamar 03',
      'Kamar 04',
      'Kamar 05',
      'Kamar 06',
      'Kamar 07',
      'Kamar 08',
      'Kamar 09',
      'Kamar 10',
    ];
    const newRooms: KamarDetail[] = standardNumbers.map((num) => ({
      id: `kamar-${activeBlok.toLowerCase().replace(/\s+/g, '-')}-${num.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      blokNama: activeBlok,
      nomorKamar: num,
      namaLengkap: `${activeBlok} - ${num}`,
      kapasitas: activeBlok.includes('A') ? 10 : 15,
      kategori: activeBlok.includes('A') ? 'Hunian Wanita & Tahanan' : 'Hunian Umum',
      keterangan: `Kamar hunian standar ${activeBlok}`,
      pjKamar: '',
    }));
    onUpdateKamarDetails([...kamarDetails, ...newRooms]);
    showToast(`10 kamar standar untuk ${activeBlok} berhasil dibuat.`);
  };

  // Save Add or Edit Room
  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNomor = formNomorKamar.trim();
    if (!cleanNomor) {
      setFormError('Nomor/Nama kamar tidak boleh kosong.');
      return;
    }

    let cleanFullKamar = cleanNomor;
    if (!cleanNomor.toLowerCase().startsWith(activeBlok.toLowerCase())) {
      cleanFullKamar = `${activeBlok} - ${cleanNomor}`;
    }

    if (isAddingNew) {
      // Check duplicate
      const duplicate = currentBlockRooms.some(
        (r) =>
          r.nomorKamar.toLowerCase().trim() === cleanNomor.toLowerCase().trim() ||
          r.namaLengkap.toLowerCase().trim() === cleanFullKamar.toLowerCase().trim()
      );
      if (duplicate) {
        setFormError(`Kamar "${cleanNomor}" sudah terdaftar di ${activeBlok}. Silakan gunakan nomor lain.`);
        return;
      }

      const newRoom: KamarDetail = {
        id: `kamar-${activeBlok.toLowerCase().replace(/\s+/g, '-')}-${cleanNomor.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
        blokNama: activeBlok,
        nomorKamar: cleanNomor,
        namaLengkap: cleanFullKamar,
        kapasitas: Number(formKapasitas) || 15,
        kategori: formKategori,
        keterangan: formKeterangan.trim() || undefined,
        pjKamar: formPjKamar.trim() || undefined,
      };

      onUpdateKamarDetails([...kamarDetails, newRoom]);
      setIsAddingNew(false);
      setFormError('');
      showToast(`Kamar "${cleanFullKamar}" berhasil ditambahkan.`);
    } else if (editingRoom) {
      const oldFullKamar = editingRoom.namaLengkap;
      const isRenamed = oldFullKamar.toLowerCase().trim() !== cleanFullKamar.toLowerCase().trim();

      if (isRenamed) {
        const duplicate = currentBlockRooms.some(
          (r) =>
            r.id !== editingRoom.id &&
            (r.nomorKamar.toLowerCase().trim() === cleanNomor.toLowerCase().trim() ||
              r.namaLengkap.toLowerCase().trim() === cleanFullKamar.toLowerCase().trim())
        );
        if (duplicate) {
          setFormError(`Nama kamar "${cleanNomor}" sudah dipakai oleh kamar lain di ${activeBlok}.`);
          return;
        }
      }

      // Update room in kamarDetails
      const updatedRooms = kamarDetails.map((r) => {
        if (r.id === editingRoom.id || r.namaLengkap.toLowerCase().trim() === oldFullKamar.toLowerCase().trim()) {
          return {
            ...r,
            nomorKamar: cleanNomor,
            namaLengkap: cleanFullKamar,
            kapasitas: Number(formKapasitas) || 15,
            kategori: formKategori,
            keterangan: formKeterangan.trim() || undefined,
            pjKamar: formPjKamar.trim() || undefined,
          };
        }
        return r;
      });
      onUpdateKamarDetails(updatedRooms);

      // If room was renamed, migrate all occupants to the new room name!
      if (isRenamed) {
        const updatedInmates = inmates.map((inmate) => {
          const isOcc =
            (inmate.kamarHunian && inmate.kamarHunian.toLowerCase().trim() === oldFullKamar.toLowerCase().trim()) ||
            ((inmate.blok || '').toLowerCase().trim() === activeBlok.toLowerCase().trim() &&
              (inmate.kamarNomor || '').toLowerCase().trim() === editingRoom.nomorKamar.toLowerCase().trim());

          if (isOcc) {
            return {
              ...inmate,
              kamarNomor: cleanNomor,
              kamarHunian: cleanFullKamar,
            };
          }
          return inmate;
        });
        onUpdateInmates(updatedInmates);
      }

      setEditingRoom(null);
      setFormError('');
      showToast(`Detail kamar "${cleanFullKamar}" berhasil diperbarui.`);
    }
  };

  // Confirm and Execute Delete Room
  const handleExecuteDeleteRoom = () => {
    if (!roomToDelete) return;

    const occupants = getOccupantsForRoom(
      roomToDelete.namaLengkap,
      roomToDelete.nomorKamar,
      roomToDelete.blokNama
    );

    if (occupants.length > 0) {
      if (!transferTargetRoom) {
        setDeleteError(`Kamar ini berisi ${occupants.length} penghuni. Silakan pilih kamar tujuan pemindahan.`);
        return;
      }

      // Relocate inmates to transferTargetRoom
      const lastDash = transferTargetRoom.lastIndexOf('-');
      const targetBlok = lastDash !== -1 ? transferTargetRoom.slice(0, lastDash).trim() : activeBlok;
      const targetNomor = lastDash !== -1 ? transferTargetRoom.slice(lastDash + 1).trim() : transferTargetRoom.trim();

      const updatedInmates = inmates.map((inmate) => {
        const isOcc =
          (inmate.kamarHunian &&
            inmate.kamarHunian.toLowerCase().trim() === roomToDelete.namaLengkap.toLowerCase().trim()) ||
          ((inmate.blok || '').toLowerCase().trim() === (roomToDelete.blokNama || '').toLowerCase().trim() &&
            (inmate.kamarNomor || '').toLowerCase().trim() === (roomToDelete.nomorKamar || '').toLowerCase().trim());

        if (isOcc) {
          return {
            ...inmate,
            blok: targetBlok,
            kamarNomor: targetNomor,
            kamarHunian: transferTargetRoom,
          };
        }
        return inmate;
      });
      onUpdateInmates(updatedInmates);
    }

    // Remove room from kamarDetails
    const updatedRooms = kamarDetails.filter(
      (r) =>
        r.id !== roomToDelete.id &&
        r.namaLengkap.toLowerCase().trim() !== roomToDelete.namaLengkap.toLowerCase().trim()
    );
    onUpdateKamarDetails(updatedRooms);

    const deletedName = roomToDelete.namaLengkap;
    setRoomToDelete(null);
    setTransferTargetRoom('');
    setDeleteError('');
    showToast(`Kamar "${deletedName}" berhasil dihapus.`);
  };

  // Execute Single Inmate Relocation
  const handleExecuteMoveInmate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inmateToMove || !moveTargetRoom) return;

    const lastDash = moveTargetRoom.lastIndexOf('-');
    const targetBlok = lastDash !== -1 ? moveTargetRoom.slice(0, lastDash).trim() : activeBlok;
    const targetNomor = lastDash !== -1 ? moveTargetRoom.slice(lastDash + 1).trim() : moveTargetRoom.trim();

    const updatedInmates = inmates.map((i) => {
      if (i.id === inmateToMove.id) {
        return {
          ...i,
          blok: targetBlok,
          kamarNomor: targetNomor,
          kamarHunian: moveTargetRoom,
        };
      }
      return i;
    });

    onUpdateInmates(updatedInmates);
    showToast(`${inmateToMove.nama} berhasil dipindahkan ke ${moveTargetRoom}.`);
    setInmateToMove(null);
    setMoveTargetRoom('');
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
      <div className="bg-[#081b33] rounded-2xl shadow-2xl w-full max-w-5xl border border-blue-900/80 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#06182c] via-[#092242] to-[#06182c] px-5 py-4 border-b border-blue-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-sm">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white font-condensed tracking-wider uppercase">
                  DETAIL & KELOLA KAMAR PER BLOK
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
                  {activeBlok}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Tambah, ubah kapasitas, nama/nomor kamar, penanggung jawab, serta hapus kamar hunian
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

        {/* Block Switcher Tabs */}
        <div className="bg-[#051324] px-5 py-2.5 border-b border-blue-900/60 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            Pilih Blok:
          </span>
          {daftarBlok.map((blok) => {
            const isActive = blok.nama.toLowerCase().trim() === activeBlok.toLowerCase().trim();
            const countInmatesInBlok = inmates.filter(
              (i) => (i.blok || '').toLowerCase().trim() === blok.nama.toLowerCase().trim()
            ).length;
            const countRoomsInBlok = kamarDetails.filter(
              (k) => (k.blokNama || '').toLowerCase().trim() === blok.nama.toLowerCase().trim()
            ).length;

            return (
              <button
                key={blok.id}
                type="button"
                onClick={() => setActiveBlok(blok.nama)}
                className={`px-3.5 py-1.5 rounded-xl font-condensed tracking-wider text-xs font-bold transition shrink-0 flex items-center gap-2 border ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white border-amber-400 shadow-md shadow-blue-950/60 ring-1 ring-amber-400/40'
                    : 'bg-[#0a2342]/60 text-slate-300 hover:text-white hover:bg-blue-900/40 border-blue-900/80'
                }`}
              >
                <span>{blok.nama}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-blue-950 text-amber-300'
                }`}>
                  {countRoomsInBlok} Kamar • {countInmatesInBlok} WBP
                </span>
              </button>
            );
          })}
        </div>

        {/* Block Overview Stats Bar */}
        <div className="bg-[#071d36] px-5 py-3 border-b border-blue-900/60">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#061527] border border-blue-900/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <DoorOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-300 font-medium">Total Kamar di {activeBlok}</p>
                <p className="text-base font-bold text-white font-mono">{currentBlockRooms.length} Kamar</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#061527] border border-blue-900/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-300 font-medium">Kapasitas Blok / Terisi</p>
                <p className="text-base font-bold text-white font-mono">
                  {totalOccupants} <span className="text-xs text-slate-400 font-normal">/ {totalCapacity} WBP</span>
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#061527] border border-blue-900/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium mb-1">
                  <span>Tingkat Hunian</span>
                  <span className={`font-bold font-mono ${
                    occupancyRate > 100 ? 'text-rose-400' : occupancyRate > 80 ? 'text-amber-300' : 'text-emerald-400'
                  }`}>
                    {occupancyRate}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      occupancyRate > 100
                        ? 'bg-rose-500'
                        : occupancyRate > 80
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#061527] border border-blue-900/60 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] text-slate-300 font-medium">Atensi Pakaian</p>
                <p className="text-base font-bold text-rose-300">{problematicInmatesCount} WBP</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddRoom}
                className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/40 transition hover:scale-[1.02]"
                title={`Tambah kamar hunian baru di ${activeBlok}`}
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Kamar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Room List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {currentBlockRooms.length === 0 ? (
            <div className="p-10 text-center text-slate-400 bg-[#061527] rounded-2xl border border-blue-900/60 space-y-3">
              <DoorOpen className="w-12 h-12 text-slate-500 mx-auto" />
              <div>
                <p className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                  Belum ada kamar terdaftar untuk {activeBlok}
                </p>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                  Anda dapat membuat kamar satu per satu secara manual atau memuat 10 kamar standar secara otomatis untuk blok ini.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePopulateStandardRooms}
                  className="px-4 py-2 bg-[#092242] hover:bg-blue-900/60 text-amber-300 border border-amber-400/50 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Muat Standar (Kamar 01 - Kamar 10)</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddRoom}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kamar Manual</span>
                </button>
              </div>
            </div>
          ) : (
            currentBlockRooms.map((room) => {
              const occupants = getOccupantsForRoom(room.namaLengkap, room.nomorKamar, room.blokNama);
              const roomCap = room.kapasitas || 15;
              const isOver = occupants.length > roomCap;
              const isFull = occupants.length === roomCap;
              const isExpanded = expandedRooms[room.id] ?? false;

              const roomProblems = occupants.filter(
                (i) => i.kondisiBaju !== 'Layak Pakai' || i.statusDistribusi !== 'Lengkap' || i.bajuTerlarangDisita > 0
              ).length;

              return (
                <div
                  key={room.id}
                  className="rounded-2xl bg-[#061527] border border-blue-900/70 overflow-hidden transition shadow-sm hover:border-amber-400/60"
                >
                  {/* Room Card Header */}
                  <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#09203d] border border-blue-800 flex items-center justify-center text-amber-400 font-bold font-mono text-sm shrink-0 shadow-inner">
                        {room.nomorKamar.replace(/[^0-9]/g, '') || 'K'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-white font-condensed tracking-wider uppercase">
                            {room.namaLengkap}
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-blue-900/40 text-cyan-300 border border-cyan-500/40 font-semibold">
                            {room.kategori || 'Hunian Umum'}
                          </span>
                          {room.pjKamar && (
                            <span className="text-[11px] text-slate-300 bg-[#09203d] px-2 py-0.5 rounded-lg border border-blue-800/60">
                              PJ: <strong className="text-amber-300">{room.pjKamar}</strong>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {room.keterangan || `Kamar hunian WBP ${activeBlok}`}
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Occupancy Badges & Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Occupancy Badge */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#09203d] border border-blue-800/80">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-bold text-white font-mono">
                          {occupants.length} / {roomCap}
                        </span>
                        {isOver ? (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-500/50">
                            Over
                          </span>
                        ) : isFull ? (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/50">
                            Penuh
                          </span>
                        ) : null}
                      </div>

                      {/* Alert badge if any */}
                      {roomProblems > 0 && (
                        <span
                          title={`${roomProblems} penghuni ada atensi sandang`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1.5 rounded-xl border border-amber-500/40"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>{roomProblems} Atensi</span>
                        </span>
                      )}

                      {/* Expand / Collapse Inmates */}
                      <button
                        type="button"
                        onClick={() => toggleExpandRoom(room.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-[#09203d] hover:bg-blue-900/50 border border-blue-800 transition flex items-center gap-1.5"
                        title="Tampilkan daftar WBP di kamar ini"
                      >
                        <span>Penghuni ({occupants.length})</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {/* Edit Button with explicit label */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditRoom(room)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/50 transition flex items-center gap-1.5 shadow-sm"
                        title="Edit detail kamar (Nama, nomor, kapasitas, kategori)"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button with explicit label */}
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteRoom(room)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 transition flex items-center gap-1.5 shadow-sm"
                        title="Hapus kamar ini dari sistem"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Inmates Table */}
                  {isExpanded && (
                    <div className="border-t border-blue-900/60 bg-[#040f1d] p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-300 pb-1">
                        <span className="font-bold text-amber-300 font-condensed tracking-wider uppercase">
                          DAFTAR PENGHUNI ({occupants.length} ORANG):
                        </span>
                        {onOpenSidakKamar && occupants.length > 0 && (
                          <button
                            type="button"
                            onClick={() => onOpenSidakKamar(room.namaLengkap)}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                          >
                            <Shirt className="w-3.5 h-3.5" />
                            Sidak Pakaian Kamar Ini Serentak
                          </button>
                        )}
                      </div>

                      {occupants.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">
                          Kamar ini sedang kosong (belum ada WBP yang ditempatkan).
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {occupants.map((occ) => {
                            const hasProblem =
                              occ.kondisiBaju !== 'Layak Pakai' ||
                              occ.statusDistribusi !== 'Lengkap' ||
                              occ.bajuTerlarangDisita > 0;

                            return (
                              <div
                                key={occ.id}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                                  hasProblem
                                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                                    : 'bg-[#081e38] border-blue-900/60 text-slate-200'
                                }`}
                              >
                                <div className="min-w-0">
                                  <p className="font-bold text-white truncate">{occ.nama}</p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                                    <span className="font-mono text-amber-300">{occ.noRegister}</span>
                                    <span>•</span>
                                    <span>{occ.status === 'Tahanan' ? 'Tahanan' : 'WBP'}</span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setInmateToMove(occ);
                                    setMoveTargetRoom('');
                                  }}
                                  className="p-1.5 rounded-lg text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 shrink-0 transition"
                                  title="Pindahkan / Mutasi WBP ini ke kamar lain"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#06182c] px-5 py-3 border-t border-blue-900/80 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-400" />
            <span>
              Perubahan kamar tersinkronisasi otomatis dengan filter, kartu WBP, dan sidak kamar.
            </span>
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

      {/* Submodal 1: Form Tambah / Edit Kamar */}
      {(isAddingNew || editingRoom) && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-[#0b2444] rounded-2xl shadow-2xl w-full max-w-md border border-amber-400/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#06182c] px-5 py-3.5 border-b border-blue-900/80 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-condensed tracking-wide uppercase flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-amber-400" />
                {isAddingNew ? `TAMBAH KAMAR BARU (${activeBlok})` : `EDIT DETAIL KAMAR: ${editingRoom?.namaLengkap}`}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingRoom(null);
                  setFormError('');
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-5 space-y-3.5 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Nomor / Nama Kamar <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formNomorKamar}
                  onChange={(e) => setFormNomorKamar(e.target.value)}
                  placeholder="Misal: Kamar 11, Kamar Mapenaling, Kamar Isolasi"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#061527] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
                <p className="text-[10px] text-slate-300 mt-1">
                  Format di sistem: <strong>{activeBlok} - {formNomorKamar || '...'}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">
                    Kapasitas Maksimal (WBP)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formKapasitas}
                    onChange={(e) => setFormKapasitas(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#061527] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-200 mb-1">
                    Kategori Kamar
                  </label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#061527] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  >
                    <option value="Hunian Umum">Hunian Umum</option>
                    <option value="Hunian Wanita & Tahanan">Hunian Wanita & Tahanan</option>
                    <option value="Mapenaling">Mapenaling</option>
                    <option value="Isolasi / Disiplin">Isolasi / Disiplin</option>
                    <option value="Hunian Khusus">Hunian Khusus</option>
                    <option value="Kamar Lansia / Medis">Kamar Lansia / Medis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Kepala / Penanggung Jawab Kamar (Tamping Kamar)
                </label>
                <input
                  type="text"
                  value={formPjKamar}
                  onChange={(e) => setFormPjKamar(e.target.value)}
                  placeholder="Nama WBP / Petugas Penanggung Jawab"
                  className="w-full px-3.5 py-2.5 bg-[#061527] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Keterangan Tambahan
                </label>
                <input
                  type="text"
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="Catatan kondisi fasilitas kamar atau peruntukan khusus"
                  className="w-full px-3.5 py-2.5 bg-[#061527] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-blue-900/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingRoom(null);
                    setFormError('');
                  }}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-950/40"
                >
                  <Save className="w-4 h-4" />
                  <span>{isAddingNew ? 'Simpan Kamar Baru' : 'Perbarui Kamar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submodal 2: Dialog Hapus Kamar */}
      {roomToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-[#0b2444] rounded-2xl shadow-2xl w-full max-w-md border border-rose-500/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#1c080d] px-5 py-3.5 border-b border-rose-900/80 flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-white font-condensed tracking-wide uppercase">
                KONFIRMASI HAPUS KAMAR: {roomToDelete.namaLengkap}
              </h4>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{deleteError}</span>
                </div>
              )}

              {(() => {
                const occupants = getOccupantsForRoom(
                  roomToDelete.namaLengkap,
                  roomToDelete.nomorKamar,
                  roomToDelete.blokNama
                );
                
                // Other rooms in this block or any block
                const otherInSameBlock = currentBlockRooms.filter((r) => r.id !== roomToDelete.id);
                const otherRooms = otherInSameBlock.length > 0
                  ? otherInSameBlock
                  : kamarDetails.filter((r) => r.id !== roomToDelete.id);

                if (occupants.length > 0) {
                  return (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200">
                        <p className="font-bold flex items-center gap-1.5 text-amber-300">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          Terdapat {occupants.length} orang WBP di kamar ini!
                        </p>
                        <p className="text-[11px] mt-1 text-amber-200/90 leading-relaxed">
                          Sebelum menghapus kamar ini, seluruh penghuni akan dipindahkan secara otomatis ke kamar tujuan yang Anda pilih di bawah ini:
                        </p>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-200 mb-1">
                          Pindahkan Seluruh Penghuni ke Kamar: <span className="text-rose-400">*</span>
                        </label>
                        <select
                          value={transferTargetRoom}
                          onChange={(e) => setTransferTargetRoom(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 bg-[#061527] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-400"
                        >
                          {otherRooms.map((r) => {
                            const occCount = getOccupantsForRoom(r.namaLengkap, r.nomorKamar, r.blokNama).length;
                            return (
                              <option key={r.id} value={r.namaLengkap}>
                                {r.namaLengkap} ({occCount}/{r.kapasitas} WBP) - {r.kategori || 'Umum'}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  );
                }

                return (
                  <p className="text-slate-300 leading-relaxed">
                    Kamar ini sedang kosong (tidak memiliki penghuni). Apakah Anda yakin ingin menghapus <strong>{roomToDelete.namaLengkap}</strong> dari sistem?
                  </p>
                );
              })()}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-blue-900/60">
                <button
                  type="button"
                  onClick={() => {
                    setRoomToDelete(null);
                    setTransferTargetRoom('');
                    setDeleteError('');
                  }}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDeleteRoom}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold flex items-center gap-1.5 shadow-lg shadow-rose-950/60 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Kamar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submodal 3: Dialog Pindah / Mutasi Satu WBP */}
      {inmateToMove && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-[#0b2444] rounded-2xl shadow-2xl w-full max-w-md border border-cyan-400/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#06182c] px-5 py-3.5 border-b border-blue-900/80 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-condensed tracking-wide uppercase flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                MUTASI / PINDAH KAMAR PENGHUNI
              </h4>
              <button
                type="button"
                onClick={() => {
                  setInmateToMove(null);
                  setMoveTargetRoom('');
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteMoveInmate} className="p-5 space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#061527] border border-blue-900/60 space-y-1">
                <p className="text-[11px] text-slate-400">Warga Binaan yang Dimutasi:</p>
                <p className="text-sm font-bold text-white">
                  {inmateToMove.nama}
                  {inmateToMove.alias && <span className="text-slate-400 text-xs font-normal"> (als: {inmateToMove.alias})</span>}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-300 pt-0.5">
                  <span className="font-mono font-bold text-amber-300">{inmateToMove.noRegister}</span>
                  <span>•</span>
                  <span>Kamar Asal: <strong className="text-white">{inmateToMove.kamarHunian}</strong></span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Pilih Kamar Tujuan Pemindahan: <span className="text-rose-400">*</span>
                </label>
                <select
                  value={moveTargetRoom}
                  onChange={(e) => setMoveTargetRoom(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#061527] border border-blue-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                >
                  <option value="">-- Pilih Kamar Tujuan --</option>
                  {kamarDetails
                    .slice()
                    .sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap, undefined, { numeric: true, sensitivity: 'base' }))
                    .map((r) => {
                      const occCount = getOccupantsForRoom(r.namaLengkap, r.nomorKamar, r.blokNama).length;
                      return (
                        <option key={r.id} value={r.namaLengkap}>
                          {r.namaLengkap} ({occCount}/{r.kapasitas} WBP) - {r.kategori || 'Umum'}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-blue-900/60">
                <button
                  type="button"
                  onClick={() => {
                    setInmateToMove(null);
                    setMoveTargetRoom('');
                  }}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!moveTargetRoom || moveTargetRoom === inmateToMove.kamarHunian}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-md"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Proses Pemindahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
