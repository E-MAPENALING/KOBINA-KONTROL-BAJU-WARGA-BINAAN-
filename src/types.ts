export type InmateCategory = 'Tahanan' | 'Warga Binaan';

export type ClothingSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | string;

export type ClothingCondition = 'Layak Pakai' | 'Perlu Ganti' | 'Rusak/Sobek' | 'Dalam Pencucian';

export type DistributionStatus = 'Lengkap' | 'Kurang' | 'Belum Diberikan' | 'Perlu Tambahan';

export type ActionCategory = 
  | 'Pemeriksaan Rutin' 
  | 'Distribusi Jatah' 
  | 'Sidak Kamar' 
  | 'Penggantian Seragam Rusak' 
  | 'Penukaran Pakaian'
  | 'Penyitaan Baju Berlebih';

export interface ClothingItem {
  id: string;
  namaItem: string; // Baju, Celana, Sarung, Handuk, Kaos Dalam, Peci, dll.
  ukuran?: string; // S, M, L, XL, Standar, dsb.
  jumlah: number; // Jumlah yang dimiliki saat ini
  maxJumlah: number; // Batas maksimal yang diperbolehkan
  keterangan?: string; // Catatan tambahan
}

export interface PenukaranRecord {
  id: string;
  tanggal: string;
  jam: string;
  itemDitukar: string; // e.g. "Baju Seragam (Size L)"
  jumlah: number; // e.g. 1
  alasan: string; // e.g. "Sobek di lengan", "Usang/Kotor", "Salah Ukuran"
  kondisiLama: string; // "Rusak/Sobek" | "Usang" | "Kotor" | "Tidak Pas"
  itemPengganti: string; // e.g. "Baju Seragam Baru (Size L)"
  petugas: string;
  catatan?: string;
}

export interface KontrolRecord {
  id: string;
  tanggal: string;
  petugas: string;
  kategoriAksi: ActionCategory;
  jumlahSebelumnya: number;
  jumlahSesudahnya: number;
  jumlahCelanaSebelumnya?: number;
  jumlahCelanaSesudahnya?: number;
  kondisi: ClothingCondition;
  catatan: string;
}

export interface BlokHunian {
  id: string;
  nama: string;
  namaBlok?: string;
  deskripsi?: string;
}

export interface Inmate {
  id: string;
  noRegister: string;
  nama: string;
  alias?: string;
  status: InmateCategory; // 'Tahanan' atau 'Warga Binaan'
  blok: string;
  kamarNomor: string;
  kamarHunian: string;
  lokasiSel?: string; // Lokasi Sel Fisik (mis: "TP Umum LT 1/6", "TP Isolasi LT 1/3")
  jenisKejahatan: string; // Input manual oleh petugas
  
  // Data Pakaian (Input Manual: Baju, Celana, Sarung, Handuk, dll)
  pakaianList: ClothingItem[];
  
  // Riwayat Penukaran / Pergantian Pakaian (One-in One-out saat kuota maksimal)
  riwayatPenukaran: PenukaranRecord[];

  // Field pelengkap untuk kompatibilitas & agregasi
  ukuranBaju?: ClothingSize;
  ukuranCelana?: string;
  jumlahBaju?: number;
  maxBaju?: number;
  jumlahCelana?: number;
  maxCelana?: number;
  jumlahBajuMilik?: number;
  jatahStandar?: number;
  kondisiBaju?: ClothingCondition;
  statusDistribusi: DistributionStatus;
  
  // Kontrol Ketertiban Sandang
  bajuTerlarangDisita: number; // Pakaian terlarang/tidak sah disita
  statusKelayakan: 'Memenuhi Syarat' | 'Baju Rusak / Usang' | 'Baju Berlebih (Rentan Gangguan Kamtib)' | 'Kurang Jatah' | 'Melebihi Batas Maksimal';
  
  tanggalDistribusiTerakhir: string;
  tanggalKontrolTerakhir: string;
  petugasPemeriksa: string;
  catatanKhusus?: string;
  
  // Riwayat Pemeriksaan Pakaian
  riwayatKontrol: KontrolRecord[];
}

export interface FilterOptions {
  searchQuery: string; // Nama, Alias, No. Register
  kamarHunian: string; // Filter Kamar Hunian / Blok
  jenisKejahatan: string; // Filter Jenis Kejahatan
  statusTahanan: string; // 'All' | 'Tahanan' | 'Warga Binaan'
  kondisiBaju: string; // 'All' | 'Layak Pakai' | 'Perlu Ganti' | 'Rusak/Sobek' | 'Dalam Pencucian'
  statusDistribusi: string; // 'All' | 'Lengkap' | 'Kurang' | 'Belum Diberikan'
  hanyaBajuBermasalah: boolean; // Menampilkan yang kurang / rusak / berlebih
}
