import React from 'react';
import { FilterOptions } from '../types';
import { Search, Home, ShieldAlert, X, Filter, AlertCircle, RotateCcw, Printer } from 'lucide-react';
import { RoomGroup } from '../utils/kamarHelper';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  daftarKamar: string[];
  daftarKejahatan: string[];
  totalResults: number;
  totalData: number;
  selectedBlok?: string;
  roomGroups?: RoomGroup[];
  onOpenPrintModal?: (kamar?: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  daftarKamar,
  daftarKejahatan,
  totalResults,
  totalData,
  selectedBlok = 'Semua Blok',
  roomGroups = [],
  onOpenPrintModal,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.kamarHunian !== 'Semua Kamar' ||
    filters.jenisKejahatan !== 'Semua Kejahatan' ||
    filters.statusTahanan !== 'All' ||
    filters.kondisiBaju !== 'All' ||
    filters.statusDistribusi !== 'All' ||
    filters.hanyaBajuBermasalah;

  return (
    <div className="bg-[#09203d]/95 backdrop-blur-md rounded-2xl border border-blue-900/70 p-4 shadow-xl space-y-3.5">
      {/* Search and Primary Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        
        {/* 1. Pencarian Berdasarkan Nama / No Register */}
        <div className="md:col-span-4 relative">
          <label htmlFor="search-nama" className="block text-xs font-bold text-slate-200 mb-1">
            Pencarian Nama / No. Register / Alias
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-nama"
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Ketik nama, no register (mis: BI.142)..."
              className="w-full pl-9 pr-8 py-2 bg-[#061527] border border-blue-800/60 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                title="Hapus pencarian nama"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Pencarian Berdasarkan Kamar Hunian Spesifik yang Disesuaikan dengan Daftar Blok */}
        <div className="md:col-span-4">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="filter-kamar" className="block text-xs font-bold text-slate-200 flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-amber-400" />
              Kamar Hunian Spesifik
            </label>
            <div className="flex items-center gap-1.5">
              {filters.kamarHunian !== 'Semua Kamar' && onOpenPrintModal && (
                <button
                  type="button"
                  onClick={() => onOpenPrintModal(filters.kamarHunian)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-white bg-[#07182e] hover:bg-amber-600/30 px-2 py-0.5 rounded border border-amber-400/50 transition shadow-2xs"
                  title="Cetak Berita Acara & Daftar Sandang Kamar Ini"
                >
                  <Printer className="w-3 h-3 text-amber-400" />
                  <span>Cetak Kamar</span>
                </button>
              )}
              {selectedBlok !== 'Semua Blok' ? (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/50 uppercase font-condensed">
                  {selectedBlok}
                </span>
              ) : (
                <span className="text-[10px] text-slate-300 font-medium">
                  Semua Blok
                </span>
              )}
            </div>
          </div>
          <select
            id="filter-kamar"
            value={filters.kamarHunian}
            onChange={(e) => onFilterChange({ ...filters, kamarHunian: e.target.value })}
            className="w-full px-3 py-2 bg-[#061527] border border-blue-800/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition cursor-pointer font-sans"
          >
            {/* If a specific block is selected, show filtered rooms only */}
            {selectedBlok !== 'Semua Blok' ? (
              <>
                <option value="Semua Kamar" className="bg-[#09203d] text-amber-300 font-bold">
                  Semua Kamar di {selectedBlok}
                </option>
                {daftarKamar
                  .filter((k) => k !== 'Semua Kamar' && k.toLowerCase().includes(selectedBlok.toLowerCase()))
                  .map((kamar) => (
                    <option key={kamar} value={kamar} className="bg-[#09203d] text-white">
                      {kamar}
                    </option>
                  ))}
              </>
            ) : roomGroups.length > 0 ? (
              <>
                <option value="Semua Kamar" className="bg-[#09203d] text-amber-300 font-bold">
                  Semua Kamar Hunian (Seluruh Blok)
                </option>
                {roomGroups.map((group) => (
                  <optgroup
                    key={group.blok}
                    label={`── ${group.blok} ──`}
                    className="bg-[#061527] text-amber-400 font-bold"
                  >
                    {group.kamarList.map((kamar) => (
                      <option key={kamar} value={kamar} className="bg-[#09203d] text-white font-normal pl-3">
                        {kamar}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </>
            ) : (
              daftarKamar.map((kamar) => (
                <option key={kamar} value={kamar} className="bg-[#09203d] text-white">
                  {kamar}
                </option>
              ))
            )}
          </select>
        </div>

        {/* 3. Pencarian Berdasarkan Jenis Kejahatan */}
        <div className="md:col-span-4">
          <label htmlFor="filter-kejahatan" className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Klasifikasi Tindak Pidana
          </label>
          <select
            id="filter-kejahatan"
            value={filters.jenisKejahatan}
            onChange={(e) => onFilterChange({ ...filters, jenisKejahatan: e.target.value })}
            className="w-full px-3 py-2 bg-[#061527] border border-blue-800/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition cursor-pointer"
          >
            {daftarKejahatan.map((crime) => (
              <option key={crime} value={crime} className="bg-[#09203d] text-white">
                {crime}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Secondary Fast Filters & Status Badges */}
      <div className="pt-2.5 border-t border-blue-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-300 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Status:
          </span>

          {/* Filter Status Tahanan vs WBP */}
          <div className="inline-flex rounded-xl p-0.5 bg-[#061527] border border-blue-800/60">
            <button
              onClick={() => onFilterChange({ ...filters, statusTahanan: 'All' })}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filters.statusTahanan === 'All'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, statusTahanan: 'Warga Binaan' })}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filters.statusTahanan === 'Warga Binaan'
                  ? 'bg-white text-blue-950 shadow-xs border border-amber-300'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              WBP
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, statusTahanan: 'Tahanan' })}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filters.statusTahanan === 'Tahanan'
                  ? 'bg-amber-400 text-slate-950 shadow-xs border border-amber-300'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Tahanan
            </button>
          </div>

          {/* Quick Filter: Butuh Atensi / Bermasalah */}
          <button
            onClick={() => onFilterChange({ ...filters, hanyaBajuBermasalah: !filters.hanyaBajuBermasalah })}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold border transition ${
              filters.hanyaBajuBermasalah
                ? 'bg-amber-400/25 text-amber-300 border-amber-400 shadow-xs ring-1 ring-amber-400/50'
                : 'bg-[#061527] text-slate-200 border-blue-800/60 hover:border-amber-400/50 hover:text-amber-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Pakaian Butuh Atensi (Maks/Rusak/Kurang)</span>
          </button>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center gap-2">
          <span className="text-slate-200 font-medium">
            Menampilkan <strong className="text-amber-300 font-bold">{totalResults}</strong> dari {totalData} data
          </span>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 transition font-medium"
              title="Reset semua filter pencarian"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
