import React, { useState } from 'react';
import { Inmate, ActionCategory, ClothingCondition } from '../types';
import { X, Shirt, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface QuickControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmate: Inmate | null;
  onSave: (
    inmateId: string,
    data: {
      kategoriAksi: ActionCategory;
      jumlahSesudahnya: number;
      jumlahCelanaSesudahnya?: number;
      kondisi: ClothingCondition;
      bajuTerlarangDisita: number;
      petugas: string;
      catatan: string;
    }
  ) => void;
}

export const QuickControlModal: React.FC<QuickControlModalProps> = ({
  isOpen,
  onClose,
  inmate,
  onSave,
}) => {
  if (!isOpen || !inmate) return null;

  const currentBaju = inmate.jumlahBaju ?? inmate.jumlahBajuMilik ?? 2;
  const maxBaju = inmate.maxBaju ?? inmate.jatahStandar ?? 2;
  const currentCelana = inmate.jumlahCelana ?? 2;
  const maxCelana = inmate.maxCelana ?? 2;

  const [kategoriAksi, setKategoriAksi] = useState<ActionCategory>('Pemeriksaan Rutin');
  const [jumlahSesudahnya, setJumlahSesudahnya] = useState<number>(currentBaju);
  const [jumlahCelanaSesudahnya, setJumlahCelanaSesudahnya] = useState<number>(currentCelana);
  const [kondisi, setKondisi] = useState<ClothingCondition>(inmate.kondisiBaju);
  const [bajuTerlarangDisita, setBajuTerlarangDisita] = useState<number>(inmate.bajuTerlarangDisita);
  const [petugas, setPetugas] = useState<string>('Petugas Regbimpas / Kamtib');
  const [catatan, setCatatan] = useState<string>('');

  const isBajuOver = jumlahSesudahnya > maxBaju;
  const isCelanaOver = jumlahCelanaSesudahnya > maxCelana;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(inmate.id, {
      kategoriAksi,
      jumlahSesudahnya,
      jumlahCelanaSesudahnya,
      kondisi,
      bajuTerlarangDisita,
      petugas,
      catatan: catatan || `Kontrol fisik pakaian: Baju ${jumlahSesudahnya}/${maxBaju}, Celana ${jumlahCelanaSesudahnya}/${maxCelana}, kondisi ${kondisi}.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-[#082231] rounded-2xl shadow-2xl w-full max-w-lg border border-[#144963] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#061824] text-white p-5 flex items-center justify-between border-b border-[#144963]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-condensed tracking-wider text-white">CATAT KONTROL BAJU & CELANA</h3>
              <p className="text-xs text-slate-400">{inmate.nama} ({inmate.noRegister})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Inmate info badge */}
          <div className="bg-[#061824] p-3 rounded-xl border border-[#144963] text-xs flex flex-wrap justify-between gap-2">
            <div>
              <span className="text-slate-400">Kamar: </span>
              <span className="font-bold text-white">{inmate.kamarHunian}</span>
            </div>
            <div>
              <span className="text-slate-400">Ukuran: </span>
              <span className="font-semibold text-cyan-300">Baju {inmate.ukuranBaju} / Celana {inmate.ukuranCelana || inmate.ukuranBaju}</span>
            </div>
            <div>
              <span className="text-slate-400">Batas Kuota: </span>
              <span className="font-bold text-amber-300">Max {maxBaju} Baju, {maxCelana} Celana</span>
            </div>
          </div>

          {/* Action category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Jenis Pemeriksaan / Aksi:
            </label>
            <select
              value={kategoriAksi}
              onChange={(e) => setKategoriAksi(e.target.value as ActionCategory)}
              className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="Pemeriksaan Rutin">Pemeriksaan Rutin Pakaian Kamar</option>
              <option value="Distribusi Jatah">Distribusi / Penyerahan Jatah Baju Baru</option>
              <option value="Sidak Kamar">Sidak / Razia Penggeledahan Kamar</option>
              <option value="Penggantian Seragam Rusak">Tukar / Penggantian Seragam Rusak/Sobek</option>
              <option value="Penyitaan Baju Berlebih">Penyitaan Pakaian Berlebih / Non-Standar</option>
            </select>
          </div>

          {/* Jumlah Baju & Jumlah Celana */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Jumlah Baju (Atasan):</span>
                <span className="text-[10px] text-cyan-400">Max: {maxBaju}</span>
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={jumlahSesudahnya}
                onChange={(e) => setJumlahSesudahnya(parseInt(e.target.value) || 0)}
                required
                className={`w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono ${
                  isBajuOver ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' : 'bg-[#082231] border-[#174e6b] text-white'
                }`}
              />
              {isBajuOver && (
                <span className="text-[10px] text-rose-400 font-bold mt-0.5 block">
                  ⚠️ Melebihi batas max ({jumlahSesudahnya}/{maxBaju})
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Jumlah Celana (Bawahan):</span>
                <span className="text-[10px] text-cyan-400">Max: {maxCelana}</span>
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={jumlahCelanaSesudahnya}
                onChange={(e) => setJumlahCelanaSesudahnya(parseInt(e.target.value) || 0)}
                required
                className={`w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono ${
                  isCelanaOver ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' : 'bg-[#082231] border-[#174e6b] text-white'
                }`}
              />
              {isCelanaOver && (
                <span className="text-[10px] text-rose-400 font-bold mt-0.5 block">
                  ⚠️ Melebihi batas max ({jumlahCelanaSesudahnya}/{maxCelana})
                </span>
              )}
            </div>
          </div>

          {/* Kondisi Pakaian */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kondisi Pakaian:
            </label>
            <select
              value={kondisi}
              onChange={(e) => setKondisi(e.target.value as ClothingCondition)}
              className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="Layak Pakai">Layak Pakai</option>
              <option value="Perlu Ganti">Perlu Ganti / Usang</option>
              <option value="Rusak/Sobek">Rusak / Sobek Parah</option>
              <option value="Dalam Pencucian">Dalam Pencucian</option>
            </select>
          </div>

          {/* Penyitaan Baju Berlebih / Non-Standar */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Pakaian Berlebih / Non-Standar Disita Petugas:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="20"
                value={bajuTerlarangDisita}
                onChange={(e) => setBajuTerlarangDisita(parseInt(e.target.value) || 0)}
                className="w-24 px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm font-bold text-rose-400 focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
              />
              <span className="text-xs text-slate-400">
                potong (diamankan ke gudang Kamtib)
              </span>
            </div>
          </div>

          {/* Petugas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Petugas Pemeriksa:
            </label>
            <input
              type="text"
              value={petugas}
              onChange={(e) => setPetugas(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Khusus Pemeriksaan:
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Misal: Ditemukan kaos bebas tanpa izin saat sidak..."
              className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#144963]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/50 transition"
            >
              Simpan Hasil Kontrol
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
