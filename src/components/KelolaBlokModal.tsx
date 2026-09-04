import React, { useState } from 'react';
import { BlokHunian, Inmate } from '../types';
import { X, Building2, Plus, Edit3, Trash2, Check, AlertTriangle, Users } from 'lucide-react';

interface KelolaBlokModalProps {
  isOpen: boolean;
  onClose: () => void;
  blokList?: BlokHunian[];
  daftarBlok?: BlokHunian[];
  inmates?: Inmate[];
  onAddBlok?: (nama: string, deskripsi?: string) => void;
  onTambahBlok?: (nama: string, deskripsi?: string) => void;
  onEditBlok?: (id: string, namaBaru: string, deskripsiBaru?: string) => void;
  onDeleteBlok?: (id: string, namaBlok: string) => void;
  onHapusBlok?: (id: string, namaBlok: string) => void;
}

export const KelolaBlokModal: React.FC<KelolaBlokModalProps> = ({
  isOpen,
  onClose,
  blokList,
  daftarBlok,
  inmates = [],
  onAddBlok,
  onTambahBlok,
  onEditBlok,
  onDeleteBlok,
  onHapusBlok,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editDeskripsi, setEditDeskripsi] = useState('');

  const [tambahNama, setTambahNama] = useState('');
  const [tambahDeskripsi, setTambahDeskripsi] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const effectiveBlokList = blokList || daftarBlok || [];
  const handleAdd = onAddBlok || onTambahBlok;
  const handleDelete = onDeleteBlok || onHapusBlok;

  if (!isOpen) return null;

  const startEdit = (blok: BlokHunian) => {
    setEditingId(blok.id);
    setEditNama(blok.nama);
    setEditDeskripsi(blok.deskripsi || '');
    setErrorMessage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNama('');
    setEditDeskripsi('');
    setErrorMessage('');
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editNama.trim();
    if (!trimmed) {
      setErrorMessage('Nama blok tidak boleh kosong');
      return;
    }
    if (onEditBlok) {
      onEditBlok(id, trimmed, editDeskripsi.trim() || undefined);
    }
    cancelEdit();
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tambahNama.trim();
    if (!trimmed) {
      setErrorMessage('Nama blok tidak boleh kosong');
      return;
    }
    if (effectiveBlokList.some((b) => b.nama.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage('Nama blok sudah ada dalam daftar');
      return;
    }
    if (handleAdd) {
      handleAdd(trimmed, tambahDeskripsi.trim() || undefined);
    }
    setTambahNama('');
    setTambahDeskripsi('');
    setIsAdding(false);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#082231] rounded-2xl shadow-2xl w-full max-w-xl border border-[#144963] overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#061824] text-white p-5 flex items-center justify-between border-b border-[#144963]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-condensed tracking-wider text-white">KELOLA BLOK HUNIAN</h3>
              <p className="text-xs text-slate-400">
                Tambah, ubah nama, atau hapus daftar blok hunian tahanan & narapidana
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

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action to toggle Add Form */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-condensed">
              Daftar Blok Hunian ({effectiveBlokList.length})
            </span>
            {!isAdding && (
              <button
                type="button"
                onClick={() => {
                  setIsAdding(true);
                  setErrorMessage('');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Blok Baru
              </button>
            )}
          </div>

          {/* Form Tambah Blok */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="bg-[#061824] border border-[#144963] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1 uppercase tracking-wider font-condensed">
                  <Plus className="w-3.5 h-3.5 text-cyan-400" /> Form Tambah Blok Hunian
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Tutup
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Blok <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={tambahNama}
                  onChange={(e) => setTambahNama(e.target.value)}
                  placeholder="Contoh: BLOK G atau BLOK KHUSUS"
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Keterangan / Fungsi Blok (Opsional)
                </label>
                <input
                  type="text"
                  value={tambahDeskripsi}
                  onChange={(e) => setTambahDeskripsi(e.target.value)}
                  placeholder="Contoh: Hunian rehabilitasi / lansia"
                  className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs"
                >
                  Simpan Blok
                </button>
              </div>
            </form>
          )}

          {/* List of Blocks */}
          <div className="divide-y divide-[#103b52]/60 border border-[#144963] rounded-xl overflow-hidden bg-[#061824]/60">
            {effectiveBlokList.map((blok) => {
              const countInmates = inmates.filter((i) => i.blok?.toLowerCase() === blok.nama.toLowerCase()).length;
              const isEditing = editingId === blok.id;

              return (
                <div key={blok.id} className="p-3 hover:bg-[#0c3147]/40 transition">
                  {isEditing ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                            Nama Blok:
                          </label>
                          <input
                            type="text"
                            value={editNama}
                            onChange={(e) => setEditNama(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#082231] border border-cyan-400 rounded-lg text-sm text-white font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                            Keterangan:
                          </label>
                          <input
                            type="text"
                            value={editDeskripsi}
                            onChange={(e) => setEditDeskripsi(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#082231] border border-[#174e6b] rounded-lg text-sm text-white focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(blok.id)}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold font-condensed tracking-wide text-white break-words uppercase">
                            {blok.nama}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#082231] text-amber-300 border border-blue-900 font-bold">
                            <Users className="w-3 h-3 text-amber-400" />
                            {countInmates} WBP/Tahanan
                          </span>
                        </div>
                        {blok.deskripsi && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {blok.deskripsi}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(blok)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-cyan-300 bg-[#082231] hover:bg-[#0c354e] rounded-lg border border-cyan-500/40 transition shadow-xs"
                          title="Edit Nama & Info Blok"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (countInmates > 0) {
                              const confirmDel = window.confirm(
                                `Perhatian: Blok "${blok.nama}" memiliki ${countInmates} tahanan/WBP terdaftar. Yakin ingin menghapus blok ini?`
                              );
                              if (confirmDel && handleDelete) {
                                handleDelete(blok.id, blok.nama);
                              }
                            } else {
                              const confirmDel = window.confirm(
                                `Hapus blok "${blok.nama}" dari daftar?`
                              );
                              if (confirmDel && handleDelete) {
                                handleDelete(blok.id, blok.nama);
                              }
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 rounded-lg border border-rose-500/40 transition shadow-xs"
                          title="Hapus Blok dari Sistem"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#061824] p-4 border-t border-[#144963] flex items-center justify-between text-xs text-slate-400">
          <span>* Pengubahan nama blok otomatis menyinkronkan data hunian WBP.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
