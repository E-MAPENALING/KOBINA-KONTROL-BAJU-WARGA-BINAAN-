import React from 'react';
import { Inmate } from '../types';
import { AlertTriangle, Trash2, X, ShieldAlert, User } from 'lucide-react';

interface DeleteInmateModalProps {
  inmate: Inmate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteInmateModal: React.FC<DeleteInmateModalProps> = ({
  inmate,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !inmate) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0b1f36] rounded-2xl shadow-2xl w-full max-w-md border border-rose-500/50 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1f090e] px-5 py-4 border-b border-rose-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-condensed tracking-wider uppercase">
                KONFIRMASI HAPUS DATA WBP
              </h3>
              <p className="text-[11px] text-rose-300/80">Penghapusan dari sistem kontrol baju</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-rose-950/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-[#061527] border border-blue-900/60 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Nama Warga Binaan:</p>
                <p className="text-base font-bold text-white leading-tight">
                  {inmate.nama}
                  {inmate.alias && (
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      (als: {inmate.alias})
                    </span>
                  )}
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {inmate.noRegister}
              </span>
            </div>

            <div className="pt-2 border-t border-blue-900/40 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Lokasi Hunian:</span>
                <span className="font-bold text-slate-200">{inmate.kamarHunian}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Perkara / Pasal:</span>
                <span className="font-semibold text-cyan-300 line-clamp-1">{inmate.jenisKejahatan}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Tindakan ini akan <strong>menghapus permanen</strong> data warga binaan ini beserta inventaris seragam dan riwayat pemeriksaannya dari sistem.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#061527] hover:bg-blue-900/40 rounded-xl border border-blue-800 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-950/60 flex items-center gap-1.5 transition active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ya, Hapus Data</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
