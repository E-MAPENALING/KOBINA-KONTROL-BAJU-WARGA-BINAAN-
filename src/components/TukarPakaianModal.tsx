import React, { useState } from 'react';
import { Inmate, PenukaranRecord } from '../types';
import { X, RefreshCw, AlertTriangle, CheckCircle2, History, Shirt, Calendar, User, FileText } from 'lucide-react';

interface TukarPakaianModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmate: Inmate | null;
  onSaveTukar?: (inmateId: string, record: PenukaranRecord) => void;
  onExecuteExchange?: (inmateId: string, record: Omit<PenukaranRecord, 'id'>) => void;
}

export const TukarPakaianModal: React.FC<TukarPakaianModalProps> = ({
  isOpen,
  onClose,
  inmate,
  onSaveTukar,
  onExecuteExchange,
}) => {
  const pakaianList = inmate?.pakaianList || [];

  // Default selected item: choose the first item that is at or exceeding max quota, or first item
  const itemAtMax = pakaianList.find((p) => p.jumlah >= p.maxJumlah);
  const defaultItemName = itemAtMax ? itemAtMax.namaItem : pakaianList[0]?.namaItem || 'Baju Seragam';

  const [selectedItemName, setSelectedItemName] = useState<string>(defaultItemName);
  const [jumlahTukar, setJumlahTukar] = useState<number>(1);
  const [kondisiLama, setKondisiLama] = useState<string>('Rusak / Sobek');
  const [alasan, setAlasan] = useState<string>('Seragam sobek dan usang karena pemakaian kerja bakti');
  const [itemPengganti, setItemPengganti] = useState<string>('Baju Seragam Baru (Size L)');
  const [petugas, setPetugas] = useState<string>('Petugas Regbimpas / Kamtib');
  const [catatan, setCatatan] = useState<string>('Pakaian lama ditarik ke gudang limbah/laundry. Diberikan seragam pengganti baru 1:1');

  React.useEffect(() => {
    if (inmate) {
      const pList = inmate.pakaianList || [];
      const itemMax = pList.find((p) => p.jumlah >= p.maxJumlah);
      setSelectedItemName(itemMax ? itemMax.namaItem : pList[0]?.namaItem || 'Baju Seragam');
      setJumlahTukar(1);
      setKondisiLama('Rusak / Sobek');
      setAlasan('Seragam sobek dan usang karena pemakaian kerja bakti');
      setItemPengganti('Baju Seragam Baru (Size L)');
      setCatatan('Pakaian lama ditarik ke gudang limbah/laundry. Diberikan seragam pengganti baru 1:1');
    }
  }, [inmate]);

  if (!isOpen || !inmate) return null;

  // Find details of current selected item
  const currentItem = pakaianList.find((p) => p.namaItem === selectedItemName);
  const isAtOrOverMax = currentItem ? currentItem.jumlah >= currentItem.maxJumlah : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const newRecord: PenukaranRecord = {
      id: `swap-${Date.now()}`,
      tanggal: dateStr,
      jam: timeStr,
      itemDitukar: `${selectedItemName}${currentItem?.ukuran ? ` (${currentItem.ukuran})` : ''}`,
      jumlah: jumlahTukar,
      alasan,
      kondisiLama,
      itemPengganti,
      petugas,
      catatan: catatan.trim() || undefined,
    };

    if (onSaveTukar) {
      onSaveTukar(inmate.id, newRecord);
    } else if (onExecuteExchange) {
      onExecuteExchange(inmate.id, newRecord);
    }

    onClose();
  };

  const riwayat = inmate.riwayatPenukaran || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#082231] rounded-2xl shadow-2xl w-full max-w-2xl border border-[#144963] overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#061824] text-white p-5 flex items-center justify-between border-b border-[#144963]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-condensed tracking-wider text-white">MENU TUKAR BAJU / PAKAIAN</h3>
                <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-condensed">
                  1-IN 1-OUT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {inmate.nama} ({inmate.noRegister}) - {inmate.kamarHunian}
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

        {/* SOP Notice */}
        <div className="bg-[#0b2838] border-b border-[#144963] p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-amber-300">Ketentuan SOP Penukaran Pakaian Tahanan/Narapidana:</p>
            <p className="text-slate-300">
              Ketika pakaian WBP telah mencapai <strong>batas maksimal</strong>, penambahan baju dilarang. Penggantian wajib melalui mekanisme <strong>Tukar Pakaian (1 Masuk = 1 Keluar)</strong>. Pakaian lama yang rusak/kotor ditarik oleh petugas dan diganti dengan pakaian layak pakai tanpa menambah kuota.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Current Clothing Quota Status */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-condensed">
              Status Kepemilikan & Kuota Pakaian Saat Ini
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {pakaianList.map((p) => {
                const isMax = p.jumlah >= p.maxJumlah;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedItemName(p.namaItem);
                      setItemPengganti(`${p.namaItem} Baru ${p.ukuran ? `(${p.ukuran})` : ''}`);
                    }}
                    className={`p-2.5 rounded-xl border transition cursor-pointer ${
                      selectedItemName === p.namaItem
                        ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/30'
                        : isMax
                        ? 'bg-[#0b2b3d] border-amber-500/40 hover:border-amber-400'
                        : 'bg-[#061824] border-[#144963] hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white truncate">{p.namaItem}</span>
                      {isMax ? (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1 rounded border border-amber-500/30">
                          Maksimal
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Normal</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-base font-black text-white font-mono">
                        {p.jumlah} <span className="text-xs font-normal text-slate-400 font-sans">/ max {p.maxJumlah}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Pertukaran */}
          <form onSubmit={handleSubmit} className="bg-[#061824] border border-[#144963] rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-[#144963] pb-2 font-condensed">
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              Formulir Penukaran Pakaian (Tukar Baju / Celana)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pakaian yang Ditarik / Ditukar <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedItemName}
                  onChange={(e) => {
                    setSelectedItemName(e.target.value);
                    const itm = pakaianList.find((p) => p.namaItem === e.target.value);
                    setItemPengganti(`${e.target.value} Baru ${itm?.ukuran ? `(${itm.ukuran})` : ''}`);
                  }}
                  className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  {pakaianList.map((p) => (
                    <option key={p.id} value={p.namaItem}>
                      {p.namaItem} (Dimiliki: {p.jumlah} / Max: {p.maxJumlah}) {p.ukuran ? `- Size ${p.ukuran}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jumlah Ditukar
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={currentItem?.jumlah || 1}
                    value={jumlahTukar}
                    onChange={(e) => setJumlahTukar(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white font-bold focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono"
                  />
                  <span className="text-xs text-slate-400 font-medium shrink-0">Pcs</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kondisi Pakaian Lama (Ditarik)
                </label>
                <select
                  value={kondisiLama}
                  onChange={(e) => setKondisiLama(e.target.value)}
                  className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="Rusak / Sobek">Rusak / Sobek Parah</option>
                  <option value="Usang / Tipis">Usang / Tipis / Pudar</option>
                  <option value="Kekecilan / Tidak Muat">Kekecilan / Tidak Muat (Perubahan Fisik)</option>
                  <option value="Kotor Membandel">Kotor Membandel / Noda Cat / Oli</option>
                  <option value="Jadwal Rotasi Berkala">Jadwal Rotasi Pencucian / Penggantian Berkala</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pakaian Pengganti yang Diberikan <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={itemPengganti}
                  onChange={(e) => setItemPengganti(e.target.value)}
                  placeholder="Contoh: Baju Seragam Baru (Size XL)"
                  required
                  className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alasan Penukaran
                </label>
                <input
                  type="text"
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  placeholder="Contoh: Robek saat kerja bakti kebersihan"
                  className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Petugas yang Melakukan Pertukaran
                </label>
                <input
                  type="text"
                  value={petugas}
                  onChange={(e) => setPetugas(e.target.value)}
                  className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catatan Berita Acara Pertukaran (Opsional)
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan tindak lanjut seragam lama (dimusnahkan / dicuci / diserahkan ke gudang)..."
                className="w-full px-3 py-2 bg-[#082231] border border-[#174e6b] rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#144963]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-950/50 ring-1 ring-amber-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simpan Penukaran (1-in 1-out)</span>
              </button>
            </div>
          </form>

          {/* Riwayat Penukaran */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-condensed">
              <History className="w-4 h-4 text-cyan-400" />
              Riwayat Pertukaran Baju Penghuni Ini ({riwayat.length})
            </h4>

            {riwayat.length === 0 ? (
              <div className="bg-[#061824] rounded-xl p-4 text-center text-xs text-slate-400 border border-[#144963]">
                Belum ada riwayat pergantian/penukaran pakaian tercatat untuk WBP ini.
              </div>
            ) : (
              <div className="space-y-2">
                {riwayat.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-[#061824] border border-[#144963] rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        {rec.itemDitukar} <span className="text-cyan-400">➔</span> {rec.itemPengganti}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {rec.tanggal} • {rec.jam}
                      </span>
                    </div>
                    <div className="text-slate-300 flex items-center gap-3">
                      <span>Alasan: <strong>{rec.alasan}</strong></span>
                      <span>Petugas: <strong>{rec.petugas}</strong></span>
                    </div>
                    {rec.catatan && (
                      <p className="text-[11px] text-slate-400 italic pt-0.5 border-t border-[#12415c]">
                        "{rec.catatan}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
