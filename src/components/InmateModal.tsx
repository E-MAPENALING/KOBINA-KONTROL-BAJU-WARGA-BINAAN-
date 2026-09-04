import React, { useState, useEffect } from 'react';
import { Inmate, InmateCategory, ClothingItem } from '../types';
import { X, Shirt, Save, AlertTriangle, CheckCircle2, Plus, Trash2, Building2 } from 'lucide-react';

interface InmateModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmateToEdit: Inmate | null;
  onSave: (inmateData: Omit<Inmate, 'id' | 'riwayatKontrol'>, idToEdit?: string) => void;
  daftarBlok: string[];
  onOpenKelolaBlok?: () => void;
}

const DEFAULT_PRESET_ITEMS: Omit<ClothingItem, 'id'>[] = [
  { namaItem: 'Baju Seragam', ukuran: 'L', jumlah: 2, maxJumlah: 2, keterangan: 'Atasan seragam resmi' },
  { namaItem: 'Celana Seragam', ukuran: 'L', jumlah: 2, maxJumlah: 2, keterangan: 'Bawahan seragam resmi' },
  { namaItem: 'Sarung', ukuran: 'Standar', jumlah: 1, maxJumlah: 1, keterangan: 'Perlengkapan ibadah' },
  { namaItem: 'Handuk Mandi', ukuran: 'Standar', jumlah: 1, maxJumlah: 1, keterangan: 'Perlengkapan mandi' },
];

export const InmateModal: React.FC<InmateModalProps> = ({
  isOpen,
  onClose,
  inmateToEdit,
  onSave,
  daftarBlok,
  onOpenKelolaBlok,
}) => {
  const [nama, setNama] = useState('');
  const [alias, setAlias] = useState('');
  const [noRegister, setNoRegister] = useState('');
  const [status, setStatus] = useState<InmateCategory>('Warga Binaan');
  const [blok, setBlok] = useState(daftarBlok[0] || 'BLOK ANGREK');
  const [kamarNomor, setKamarNomor] = useState('Kamar 01');
  
  // Jenis Kejahatan: input manual oleh petugas
  const [jenisKejahatan, setJenisKejahatan] = useState('Pencurian');
  
  // Data Pakaian (Input Manual: Baju, Celana, Sarung, Handuk, dll)
  const [pakaianList, setPakaianList] = useState<ClothingItem[]>([]);
  
  const [catatanKhusus, setCatatanKhusus] = useState('');
  const [petugasPemeriksa, setPetugasPemeriksa] = useState('Petugas Registrasi & Bimpas');

  useEffect(() => {
    if (inmateToEdit) {
      setNama(inmateToEdit.nama);
      setAlias(inmateToEdit.alias || '');
      setNoRegister(inmateToEdit.noRegister);
      setStatus(inmateToEdit.status);
      setBlok(inmateToEdit.blok);
      setKamarNomor(inmateToEdit.kamarNomor);
      setJenisKejahatan(inmateToEdit.jenisKejahatan);
      
      // Load pakaianList if available, or populate from previous fields
      if (inmateToEdit.pakaianList && inmateToEdit.pakaianList.length > 0) {
        setPakaianList(inmateToEdit.pakaianList);
      } else {
        const bajuCount = inmateToEdit.jumlahBaju ?? inmateToEdit.jumlahBajuMilik ?? 2;
        const maxBajuCount = inmateToEdit.maxBaju ?? inmateToEdit.jatahStandar ?? 2;
        const celanaCount = inmateToEdit.jumlahCelana ?? 2;
        const maxCelanaCount = inmateToEdit.maxCelana ?? 2;
        setPakaianList([
          {
            id: `p-${Date.now()}-1`,
            namaItem: 'Baju Seragam',
            ukuran: inmateToEdit.ukuranBaju || 'L',
            jumlah: bajuCount,
            maxJumlah: maxBajuCount,
            keterangan: 'Atasan seragam wajib',
          },
          {
            id: `p-${Date.now()}-2`,
            namaItem: 'Celana Seragam',
            ukuran: inmateToEdit.ukuranCelana || inmateToEdit.ukuranBaju || 'L',
            jumlah: celanaCount,
            maxJumlah: maxCelanaCount,
            keterangan: 'Bawahan seragam resmi',
          },
          {
            id: `p-${Date.now()}-3`,
            namaItem: 'Sarung',
            ukuran: 'Standar',
            jumlah: 1,
            maxJumlah: 1,
            keterangan: 'Perlengkapan ibadah',
          },
          {
            id: `p-${Date.now()}-4`,
            namaItem: 'Handuk Mandi',
            ukuran: 'Standar',
            jumlah: 1,
            maxJumlah: 1,
            keterangan: 'Peralatan sanitasi diri',
          },
        ]);
      }

      setCatatanKhusus(inmateToEdit.catatanKhusus || '');
      setPetugasPemeriksa(inmateToEdit.petugasPemeriksa || 'Petugas Registrasi & Bimpas');
    } else {
      // Form default
      setNama('');
      setAlias('');
      setNoRegister(`BI.${Math.floor(100 + Math.random() * 900)}/2026`);
      setStatus('Warga Binaan');
      setBlok(daftarBlok[0] || 'BLOK ANGREK');
      setKamarNomor('Kamar 01');
      setJenisKejahatan('');
      
      // Default initial clothing items
      setPakaianList(
        DEFAULT_PRESET_ITEMS.map((item, idx) => ({
          ...item,
          id: `p-${Date.now()}-${idx}`,
        }))
      );
      
      setCatatanKhusus('');
      setPetugasPemeriksa('Petugas Registrasi & Bimpas');
    }
  }, [inmateToEdit, isOpen, daftarBlok]);

  if (!isOpen) return null;

  // Handler to add clothing item manually
  const handleAddItem = (presetName = '', defaultUkuran = 'Standar') => {
    setPakaianList((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        namaItem: presetName || 'Item Pakaian Baru',
        ukuran: defaultUkuran,
        jumlah: 1,
        maxJumlah: 1,
        keterangan: '',
      },
    ]);
  };

  const handleUpdateItem = (id: string, field: keyof ClothingItem, val: any) => {
    setPakaianList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setPakaianList((prev) => prev.filter((item) => item.id !== id));
  };

  // Check which items exceed max quota
  const itemsExceeding = pakaianList.filter((item) => item.jumlah > item.maxJumlah);
  const hasExceeded = itemsExceeding.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanBlok = blok.trim();
    let cleanKamar = kamarNomor.trim();
    if (cleanKamar.includes('-')) {
      const parts = cleanKamar.split('-');
      cleanKamar = parts[parts.length - 1].trim();
    }
    const compositeKamar = `${cleanBlok} - ${cleanKamar}`;

    // Extract Baju & Celana for backward compatibility with existing stats/filters
    const bajuItem = pakaianList.find((p) => p.namaItem.toLowerCase().includes('baju')) || pakaianList[0];
    const celanaItem = pakaianList.find((p) => p.namaItem.toLowerCase().includes('celana')) || pakaianList[1];

    const currentBaju = bajuItem ? bajuItem.jumlah : 2;
    const maxBaju = bajuItem ? bajuItem.maxJumlah : 2;
    const currentCelana = celanaItem ? celanaItem.jumlah : 2;
    const maxCelana = celanaItem ? celanaItem.maxJumlah : 2;

    const isKurang = pakaianList.some((p) => p.jumlah < p.maxJumlah);

    const statusDistribusi =
      !isKurang && !hasExceeded
        ? 'Lengkap'
        : pakaianList.every((p) => p.jumlah === 0)
        ? 'Belum Diberikan'
        : 'Kurang';

    const statusKelayakan =
      hasExceeded
        ? 'Melebihi Batas Maksimal'
        : isKurang
        ? 'Kurang Jatah'
        : 'Memenuhi Syarat';

    const todayStr = new Date().toISOString().split('T')[0];

    onSave(
      {
        nama,
        alias: alias.trim() || undefined,
        noRegister,
        status,
        blok,
        kamarNomor,
        kamarHunian: compositeKamar,
        jenisKejahatan: jenisKejahatan.trim() || 'Lainnya',
        pakaianList,
        riwayatPenukaran: inmateToEdit?.riwayatPenukaran || [],
        ukuranBaju: bajuItem?.ukuran || 'L',
        ukuranCelana: celanaItem?.ukuran || 'L',
        jumlahBaju: currentBaju,
        maxBaju: maxBaju,
        jumlahCelana: currentCelana,
        maxCelana: maxCelana,
        jumlahBajuMilik: currentBaju,
        jatahStandar: maxBaju,
        statusDistribusi,
        bajuTerlarangDisita: inmateToEdit ? inmateToEdit.bajuTerlarangDisita : 0,
        statusKelayakan,
        tanggalDistribusiTerakhir: inmateToEdit ? inmateToEdit.tanggalDistribusiTerakhir : todayStr,
        tanggalKontrolTerakhir: todayStr,
        petugasPemeriksa,
        catatanKhusus: catatanKhusus.trim() || undefined,
      },
      inmateToEdit ? inmateToEdit.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {inmateToEdit ? 'Edit Data Pakaian Tahanan/Narapidana' : 'Registrasi Pakaian Tahanan/Narapidana'}
              </h3>
              <p className="text-xs text-slate-400">
                Pencatatan data pakaian (baju, celana, sarung, handuk, dll) secara manual serta penentuan kuota maksimal
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Identitas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Contoh: Bambang Sudiro"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Panggilan / Alias
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Contoh: Kancil"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Register <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={noRegister}
                onChange={(e) => setNoRegister(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Contoh: BI.142/2024 atau AIII.044/2026"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Pemasyarakatan <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('Warga Binaan')}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    status === 'Warga Binaan'
                      ? 'bg-blue-50 text-blue-700 border-blue-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Warga Binaan (WBP)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Tahanan')}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    status === 'Tahanan'
                      ? 'bg-amber-50 text-amber-800 border-amber-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Tahanan Titipan
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Kamar Hunian & Jenis Kejahatan (INPUT MANUAL) */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Blok Hunian <span className="text-rose-500">*</span>
                </label>
                {onOpenKelolaBlok && (
                  <button
                    type="button"
                    onClick={onOpenKelolaBlok}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
                  >
                    <Building2 className="w-3 h-3" /> Kelola Blok
                  </button>
                )}
              </div>
              <select
                value={blok}
                onChange={(e) => setBlok(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {daftarBlok.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Kamar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="kamar-suggestions"
                value={kamarNomor}
                onChange={(e) => setKamarNomor(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Misal: Kamar 01"
              />
              <datalist id="kamar-suggestions">
                <option value="Kamar 01" />
                <option value="Kamar 02" />
                <option value="Kamar 03" />
                <option value="Kamar 04" />
                <option value="Kamar 05" />
                <option value="Kamar 06" />
                <option value="Kamar 07" />
                <option value="Kamar 08" />
                <option value="Kamar 09" />
                <option value="Kamar 10" />
                <option value="Kamar Khusus 01" />
                <option value="Kamar Isolasi 01" />
              </datalist>
            </div>

            {/* Kamar Hunian Spesifik Preview */}
            <div className="sm:col-span-12 -mt-1 mb-1">
              <div className="p-2 rounded-lg bg-cyan-50 border border-cyan-200 text-xs flex items-center justify-between">
                <span className="text-slate-600 font-medium">
                  Kamar Hunian Spesifik Terbentuk:
                </span>
                <span className="font-mono font-bold text-cyan-900 bg-white px-2 py-0.5 rounded border border-cyan-300">
                  {blok} - {kamarNomor || '...'}
                </span>
              </div>
            </div>

            {/* JENIS KEJAHATAN DI INPUT MANUAL */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Kejahatan / Tindak Pidana <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={jenisKejahatan}
                onChange={(e) => setJenisKejahatan(e.target.value)}
                list="kejahatan-saran"
                required
                placeholder="Ketik manual: Pencurian, Narkotika, dll"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="kejahatan-saran">
                <option value="Narkotika" />
                <option value="Pencurian" />
                <option value="Penipuan & Penggelapan" />
                <option value="Perlindungan Anak" />
                <option value="Penganiayaan" />
                <option value="Korupsi / Tipikor" />
                <option value="Pembunuhan" />
                <option value="Perjudian" />
                <option value="Lainnya" />
              </datalist>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Diinput manual sesuai berkas putusan</span>
            </div>
          </div>

          {/* Section 3: DATA PAKAIAN (INPUT MANUAL: Baju, Celana, Sarung, Handuk, dll) */}
          <div className="pt-2 border-t border-slate-100 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Shirt className="w-4 h-4 text-blue-600" />
                  Data Pakaian (Input Manual)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Input jenis pakaian tahanan/narapidana (Baju, Celana, Sarung, Handuk, dll) beserta batas maksimal kepemilikan.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Tambah Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleAddItem('Baju Seragam', 'L')}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                >
                  + Baju
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('Celana Seragam', 'L')}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                >
                  + Celana
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('Sarung', 'Standar')}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                >
                  + Sarung
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('Handuk Mandi', 'Standar')}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition"
                >
                  + Handuk
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('Kaos Dalam', 'L')}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                >
                  + Kaos Dalam
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('Peci / Kopiah', 'Standar')}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                >
                  + Peci
                </button>
              </div>
            </div>

            {/* List of Dynamic Clothing Items */}
            <div className="space-y-2.5">
              {pakaianList.map((item, index) => {
                const isItemOver = item.jumlah > item.maxJumlah;

                return (
                  <div
                    key={item.id}
                    className={`bg-white p-3 rounded-lg border transition ${
                      isItemOver ? 'border-rose-300 bg-rose-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                      {/* Nama Pakaian */}
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Nama Pakaian #{index + 1}
                        </label>
                        <input
                          type="text"
                          value={item.namaItem}
                          onChange={(e) => handleUpdateItem(item.id, 'namaItem', e.target.value)}
                          placeholder="Misal: Baju Seragam / Sarung / Handuk"
                          required
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Ukuran */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Ukuran
                        </label>
                        <input
                          type="text"
                          value={item.ukuran || ''}
                          onChange={(e) => handleUpdateItem(item.id, 'ukuran', e.target.value)}
                          placeholder="S/M/L/XL/-"
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-center text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Jumlah Saat Ini */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5 flex items-center justify-between">
                          <span>Dimiliki</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={item.jumlah}
                          onChange={(e) => handleUpdateItem(item.id, 'jumlah', parseInt(e.target.value) || 0)}
                          required
                          className={`w-full px-2 py-1.5 border rounded text-xs font-black text-center focus:outline-none ${
                            isItemOver ? 'bg-rose-50 border-rose-400 text-rose-700' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      {/* Batas Maksimal */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Batas Maksimal
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={item.maxJumlah}
                          onChange={(e) => handleUpdateItem(item.id, 'maxJumlah', parseInt(e.target.value) || 1)}
                          required
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-black text-center text-slate-900 focus:outline-none"
                        />
                      </div>

                      {/* Status / Aksi Hapus */}
                      <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-4 sm:pt-0">
                        {isItemOver ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                            ⚠️ Over ({item.jumlah}/{item.maxJumlah})
                          </span>
                        ) : item.jumlah === item.maxJumlah ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            ✓ Maksimal
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            {item.jumlah}/{item.maxJumlah}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Hapus baris pakaian"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Button Tambah Item Baru */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleAddItem('Item Pakaian Baru', 'Standar')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Baris Pakaian Manual
              </button>

              <span className="text-[11px] text-slate-500 font-medium">
                Total {pakaianList.length} jenis pakaian terdata
              </span>
            </div>

            {/* Warning Alert if Exceeded */}
            {hasExceeded && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Peringatan Kuota Maksimal Sandang: </span>
                  Terdapat {itemsExceeding.length} jenis pakaian yang melebihi batas maksimal ({itemsExceeding.map(i => `${i.namaItem}: ${i.jumlah}/${i.maxJumlah}`).join(', ')}). Mohon verifikasi apakah ada pakaian berlebih yang perlu disita atau ditertibkan.
                </div>
              </div>
            )}

            {/* Petugas Pemeriksa & Catatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Petugas Pemeriksa / Pendaftar Pakaian
                </label>
                <input
                  type="text"
                  value={petugasPemeriksa}
                  onChange={(e) => setPetugasPemeriksa(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Khusus Pakaian:
                </label>
                <input
                  type="text"
                  value={catatanKhusus}
                  onChange={(e) => setCatatanKhusus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Keterangan alokasi sandang, titipan, atau tamping..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              {inmateToEdit ? 'Simpan Data Pakaian' : 'Simpan Registrasi Pakaian'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
