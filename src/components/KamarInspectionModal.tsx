import React, { useState } from 'react';
import { Inmate } from '../types';
import { X, ClipboardCheck, ShieldAlert, CheckCircle2, User, AlertTriangle, Printer } from 'lucide-react';
import { RoomGroup } from '../utils/kamarHelper';

interface KamarInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmates: Inmate[];
  daftarKamar: string[];
  roomGroups?: RoomGroup[];
  onBatchInspect: (
    kamarName: string,
    petugas: string,
    catatan: string,
    updatedOccupants: Inmate[]
  ) => void;
  onPrintKamar?: (kamarName: string) => void;
}

export const KamarInspectionModal: React.FC<KamarInspectionModalProps> = ({
  isOpen,
  onClose,
  inmates,
  daftarKamar,
  roomGroups = [],
  onBatchInspect,
  onPrintKamar,
}) => {
  const validRooms = daftarKamar.filter((k) => k !== 'Semua Kamar');
  const [selectedKamar, setSelectedKamar] = useState<string>(validRooms[0] || '');
  const [petugas, setPetugas] = useState<string>('Tim Sidak Kamtib / KPR');
  const [catatan, setCatatan] = useState<string>('Penggeledahan dan kontrol ketertiban sandang kamar hunian');

  const occupants = inmates.filter((i) => i.kamarHunian === selectedKamar);
  const [localOccupants, setLocalOccupants] = useState<Inmate[]>(occupants);

  React.useEffect(() => {
    setLocalOccupants(inmates.filter((i) => i.kamarHunian === selectedKamar));
  }, [selectedKamar, inmates]);

  if (!isOpen) return null;

  const handleUpdateOccupant = (id: string, updates: Partial<Inmate>) => {
    setLocalOccupants((prev) =>
      prev.map((occ) => (occ.id === id ? { ...occ, ...updates } : occ))
    );
  };

  const handleMarkAllValid = () => {
    setLocalOccupants((prev) =>
      prev.map((occ) => ({
        ...occ,
        kondisiBaju: 'Layak Pakai',
        statusDistribusi: 'Lengkap',
        bajuTerlarangDisita: 0,
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBatchInspect(selectedKamar, petugas, catatan, localOccupants);
    onClose();
  };

  const totalBajuInRoom = localOccupants.reduce((acc, curr) => acc + (curr.jumlahBaju ?? curr.jumlahBajuMilik ?? 2), 0);
  const totalSitaanInRoom = localOccupants.reduce((acc, curr) => acc + curr.bajuTerlarangDisita, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#082231] rounded-2xl shadow-2xl w-full max-w-3xl border border-[#144963] overflow-hidden my-8 text-white">
        
        {/* Modal Header */}
        <div className="bg-[#061824] text-white p-5 flex items-center justify-between border-b border-[#144963]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-condensed tracking-wider text-white uppercase">INSPEKSI / SIDAK SANDANG KAMAR HUNIAN</h3>
              <p className="text-xs text-slate-400">Pemeriksaan ketertiban pakaian tahanan/WBP per sel kamar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Controls: Room Selection & Inspector Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#061824] p-4 rounded-xl border border-[#144963]">
            <div>
              <label htmlFor="select-kamar-sidak" className="block text-xs font-semibold text-slate-300 mb-1">
                Pilih Kamar Hunian yang Diperiksa:
              </label>
              <select
                id="select-kamar-sidak"
                value={selectedKamar}
                onChange={(e) => setSelectedKamar(e.target.value)}
                className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {roomGroups.length > 0 ? (
                  roomGroups.map((group) => (
                    <optgroup
                      key={group.blok}
                      label={`── ${group.blok} ──`}
                      className="bg-[#061824] text-cyan-400 font-bold"
                    >
                      {group.kamarList.map((room) => (
                        <option key={room} value={room} className="bg-[#082231] text-white pl-3 font-normal">
                          {room}
                        </option>
                      ))}
                    </optgroup>
                  ))
                ) : (
                  validRooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="input-petugas-sidak" className="block text-xs font-semibold text-slate-300 mb-1">
                Petugas Pemeriksa / Tim Sidak:
              </label>
              <input
                id="input-petugas-sidak"
                type="text"
                value={petugas}
                onChange={(e) => setPetugas(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="Nama petugas pemeriksa..."
              />
            </div>
          </div>

          {/* Room Summary Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2 font-condensed tracking-wide uppercase">
                Penghuni di {selectedKamar} ({localOccupants.length} Orang)
              </h4>
              <p className="text-xs text-slate-400">
                Total pakaian baju di kamar: <strong className="text-cyan-300">{totalBajuInRoom} pcs</strong> | Sitaan non-standar: <strong className="text-rose-400">{totalSitaanInRoom} pcs</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={handleMarkAllValid}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Tandai Semua Sesuai SOP
            </button>
          </div>

          {/* Occupants List */}
          {localOccupants.length === 0 ? (
            <div className="text-center py-8 bg-[#061824] rounded-xl border border-dashed border-[#144963] text-slate-400 text-sm">
              Tidak ada tahanan atau WBP yang terdata di kamar ini.
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {localOccupants.map((occ) => {
                const bajuVal = occ.jumlahBaju ?? occ.jumlahBajuMilik ?? 2;
                const maxBajuVal = occ.maxBaju || occ.jatahStandar || 2;
                const celanaVal = occ.jumlahCelana ?? 2;
                const maxCelanaVal = occ.maxCelana || 2;

                return (
                  <div
                    key={occ.id}
                    className="p-3.5 bg-[#061824] border border-[#144963] rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0b334a] border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">
                          {occ.nama}
                          {occ.alias && <span className="text-slate-400 text-xs ml-1 italic">({occ.alias})</span>}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="text-cyan-400">{occ.status}</span>
                          <span>•</span>
                          <span>{occ.jenisKejahatan}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-300">Size {occ.ukuranBaju}</span>
                        </div>
                      </div>
                    </div>

                    {/* Individual Inmate Controls */}
                    <div className="flex flex-wrap items-center gap-2 sm:self-center">
                      {/* Baju */}
                      <div className="flex items-center gap-1 bg-[#082231] px-2 py-1 rounded-lg border border-[#174e6b] text-xs">
                        <span className="text-cyan-400 font-bold">Baju:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={bajuVal}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            handleUpdateOccupant(occ.id, {
                              jumlahBaju: val,
                              jumlahBajuMilik: val,
                            });
                          }}
                          className="w-9 text-center font-bold text-white bg-transparent border-b border-cyan-500/40 focus:outline-none font-mono"
                        />
                        <span className="text-slate-400 text-[11px]">/ {maxBajuVal}</span>
                        {bajuVal > maxBajuVal && (
                          <span className="text-rose-400 font-bold text-[11px]" title="Melebihi kuota">⚠️</span>
                        )}
                      </div>

                      {/* Celana */}
                      <div className="flex items-center gap-1 bg-[#082231] px-2 py-1 rounded-lg border border-[#174e6b] text-xs">
                        <span className="text-purple-400 font-bold">Celana:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={celanaVal}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            handleUpdateOccupant(occ.id, {
                              jumlahCelana: val,
                            });
                          }}
                          className="w-9 text-center font-bold text-white bg-transparent border-b border-purple-500/40 focus:outline-none font-mono"
                        />
                        <span className="text-slate-400 text-[11px]">/ {maxCelanaVal}</span>
                        {celanaVal > maxCelanaVal && (
                          <span className="text-rose-400 font-bold text-[11px]" title="Melebihi kuota">⚠️</span>
                        )}
                      </div>

                      {/* Kondisi */}
                      <select
                        value={occ.kondisiBaju}
                        onChange={(e) =>
                          handleUpdateOccupant(occ.id, {
                            kondisiBaju: e.target.value as any,
                          })
                        }
                        className="px-2 py-1 text-xs bg-[#082231] border border-[#174e6b] rounded-lg text-slate-200 font-medium"
                      >
                        <option value="Layak Pakai">Layak Pakai</option>
                        <option value="Perlu Ganti">Perlu Ganti</option>
                        <option value="Rusak/Sobek">Rusak / Sobek</option>
                        <option value="Dalam Pencucian">Dicuci</option>
                      </select>

                      {/* Baju Sitaan */}
                      <div className="flex items-center gap-1 bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-500/30 text-xs text-rose-300">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sita:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={occ.bajuTerlarangDisita}
                          onChange={(e) =>
                            handleUpdateOccupant(occ.id, {
                              bajuTerlarangDisita: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-8 text-center font-bold text-rose-300 bg-transparent border-b border-rose-400/50 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="catatan-sidak" className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Hasil Sidak / Pemeriksaan Kamar:
            </label>
            <textarea
              id="catatan-sidak"
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2 bg-[#061824] border border-[#174e6b] rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              placeholder="Misal: Ditemukan 1 potong kaos non-standar di bawah kasur, kondisi jemuran bersih..."
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#144963]">
            {onPrintKamar ? (
              <button
                type="button"
                onClick={() => onPrintKamar(selectedKamar)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-[#09203d] hover:bg-[#0f2e54] text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 transition shadow-sm"
                title="Cetak Berita Acara & Rekap Sandang Kamar Ini"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Cetak Lap. Kamar</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={localOccupants.length === 0}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition disabled:opacity-50 shadow-lg shadow-cyan-950/50"
              >
                Simpan Hasil Sidak Kamar
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
